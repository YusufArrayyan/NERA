/**
 * Traffic Manager
 * Orchestrates rate limiting, circuit breakers, and load balancing
 */

import { RateLimiter, RateLimitStatus } from './rate-limiter';
import { CircuitBreakerManager, CircuitBreakerConfig } from './circuit-breaker';
import { LoadBalancerPool, LoadBalancerConfig, ServerInstance } from './load-balancer';

export interface TrafficManagerConfig {
  rateLimitConfig?: {
    algorithm: 'token_bucket' | 'sliding_window' | 'fixed_window' | 'leaky_bucket';
    defaultMaxRequests: number;
    defaultWindowMs: number;
  };
  circuitBreakerConfig?: Partial<CircuitBreakerConfig>;
  loadBalancerConfig?: LoadBalancerConfig;
  enableMetrics?: boolean;
}

export interface RequestContext {
  clientId: string;
  endpoint: string;
  method: string;
  sessionId?: string;
  ip?: string;
}

export interface TrafficControlResult {
  allowed: boolean;
  reason?: string;
  rateLimitStatus?: RateLimitStatus;
  circuitOpen?: boolean;
  retryAfter?: number;
}

export interface TrafficMetrics {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  rateLimitedRequests: number;
  circuitBreakerTrips: number;
  avgResponseTime: number;
  peakRPS: number;
  failureRate: number;
  uptime: number;
}

/**
 * Traffic Manager
 */
export class TrafficManager {
  private rateLimiter: RateLimiter;
  private circuitBreakerManager: CircuitBreakerManager;
  private loadBalancerPool: LoadBalancerPool;
  private config: TrafficManagerConfig;
  private metrics: {
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
    rateLimitedRequests: number;
    circuitBreakerTrips: number;
    avgResponseTime: number;
    totalErrors: number;
    startTime: number;
  };

  constructor(config: TrafficManagerConfig = {}) {
    this.config = config;
    this.rateLimiter = new RateLimiter();
    this.circuitBreakerManager = new CircuitBreakerManager();
    this.loadBalancerPool = new LoadBalancerPool();

    // Setup default rate limiting rules
    this.setupDefaultRateLimits();

    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      rateLimitedRequests: 0,
      circuitBreakerTrips: 0,
      avgResponseTime: 0,
      totalErrors: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Setup default rate limiting rules
   */
  private setupDefaultRateLimits(): void {
    const rateLimitConfig = this.config.rateLimitConfig || {
      algorithm: 'token_bucket',
      defaultMaxRequests: 1000,
      defaultWindowMs: 60000,
    };

    // Global rate limit
    this.rateLimiter.addRule(
      '.*', // all endpoints
      {
        algorithm: rateLimitConfig.algorithm as any,
        maxRequests: rateLimitConfig.defaultMaxRequests,
        windowMs: rateLimitConfig.defaultWindowMs,
        keyPrefix: 'global',
      },
      undefined,
      1000 // lowest priority (applies last)
    );

    // API endpoint rate limits (higher priority)
    this.rateLimiter.addRule(
      '/api/.*',
      {
        algorithm: rateLimitConfig.algorithm as any,
        maxRequests: 500,
        windowMs: 60000,
        keyPrefix: 'api',
      },
      undefined,
      100
    );

    // ML inference rate limit (stricter)
    this.rateLimiter.addRule(
      '/api/ml/.*',
      {
        algorithm: rateLimitConfig.algorithm as any,
        maxRequests: 100,
        windowMs: 60000,
        keyPrefix: 'ml',
      },
      undefined,
      50
    );

    // EEG data endpoints (very strict)
    this.rateLimiter.addRule(
      '/api/eeg/.*',
      {
        algorithm: rateLimitConfig.algorithm as any,
        maxRequests: 50,
        windowMs: 60000,
        keyPrefix: 'eeg',
      },
      undefined,
      10 // highest priority
    );
  }

  /**
   * Check if request is allowed
   */
  checkTraffic(context: RequestContext): TrafficControlResult {
    this.metrics.totalRequests++;

    // Check circuit breaker first
    const breaker = this.circuitBreakerManager.get(context.endpoint);
    if (breaker && breaker.getState() === 'open') {
      this.metrics.blockedRequests++;
      this.metrics.circuitBreakerTrips++;

      return {
        allowed: false,
        reason: 'Circuit breaker is open',
        circuitOpen: true,
        retryAfter: 60, // 60 seconds
      };
    }

    // Check rate limit
    const rateLimitStatus = this.rateLimiter.checkLimit(
      context.clientId,
      context.endpoint,
      context.method
    );

    if (rateLimitStatus.isLimited) {
      this.metrics.blockedRequests++;
      this.metrics.rateLimitedRequests++;

      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        rateLimitStatus,
        retryAfter: rateLimitStatus.retryAfter,
      };
    }

    this.metrics.allowedRequests++;

    return {
      allowed: true,
      rateLimitStatus,
    };
  }

  /**
   * Get next server for load balancing
   */
  getNextServer(balancerId: string, context: RequestContext): ServerInstance | null {
    const balancer = this.loadBalancerPool.get(balancerId);
    if (!balancer) {
      return null;
    }

    return balancer.getNextServer(context.sessionId);
  }

  /**
   * Mark request completion
   */
  recordRequest(
    balancerId: string,
    serverId: string,
    responseTime: number,
    error: boolean = false
  ): void {
    const balancer = this.loadBalancerPool.get(balancerId);
    if (!balancer) return;

    balancer.markRequestEnd(serverId, responseTime, error);

    // Update metrics
    if (error) {
      this.metrics.totalErrors++;
    }

    // Update rolling average response time
    this.metrics.avgResponseTime = this.metrics.avgResponseTime * 0.95 + responseTime * 0.05;
  }

  /**
   * Register circuit breaker for endpoint
   */
  registerCircuitBreaker(
    endpointId: string,
    config?: Partial<CircuitBreakerConfig>
  ): void {
    const circuitConfig = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      ...this.config.circuitBreakerConfig,
      ...config,
    };

    this.circuitBreakerManager.getOrCreate(endpointId, circuitConfig as CircuitBreakerConfig);
  }

  /**
   * Record circuit breaker event
   */
  recordCircuitBreakerEvent(endpointId: string, success: boolean): void {
    const breaker = this.circuitBreakerManager.get(endpointId);
    if (!breaker) return;

    // This is handled internally by circuit breaker via execute/executeSync
  }

  /**
   * Add server to load balancer
   */
  addServer(
    balancerId: string,
    serverId: string,
    host: string,
    port: number,
    weight?: number
  ): ServerInstance | null {
    let balancer = this.loadBalancerPool.get(balancerId);

    if (!balancer) {
      balancer = this.loadBalancerPool.getOrCreate(
        balancerId,
        this.config.loadBalancerConfig || {
          strategy: 'round-robin',
          healthCheck: { enabled: true, intervalMs: 30000, timeoutMs: 5000 },
        }
      );
    }

    return balancer.addServer(serverId, host, port, weight);
  }

  /**
   * Remove server from load balancer
   */
  removeServer(balancerId: string, serverId: string): boolean {
    const balancer = this.loadBalancerPool.get(balancerId);
    if (!balancer) return false;

    return balancer.removeServer(serverId);
  }

  /**
   * Get load balancer metrics
   */
  getLoadBalancerMetrics(balancerId: string) {
    const balancer = this.loadBalancerPool.get(balancerId);
    if (!balancer) return null;

    return balancer.getMetrics();
  }

  /**
   * Get rate limiter metrics
   */
  getRateLimiterMetrics() {
    return this.rateLimiter.getAllMetrics();
  }

  /**
   * Get circuit breaker metrics
   */
  getCircuitBreakerMetrics() {
    return this.circuitBreakerManager.getMetrics();
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics(): TrafficMetrics {
    const failureRate = this.metrics.totalRequests > 0
      ? (this.metrics.totalErrors / this.metrics.totalRequests) * 100
      : 0;

    return {
      totalRequests: this.metrics.totalRequests,
      allowedRequests: this.metrics.allowedRequests,
      blockedRequests: this.metrics.blockedRequests,
      rateLimitedRequests: this.metrics.rateLimitedRequests,
      circuitBreakerTrips: this.metrics.circuitBreakerTrips,
      avgResponseTime: this.metrics.avgResponseTime,
      peakRPS: this.rateLimiter.getPeakRPS(),
      failureRate,
      uptime: Date.now() - this.metrics.startTime,
    };
  }

  /**
   * Get system health
   */
  getHealth(): {
    healthy: boolean;
    totalRequests: number;
    blockedRequests: number;
    failureRate: number;
    circuitBreakersOpen: number;
  } {
    const failureRate = this.metrics.totalRequests > 0
      ? (this.metrics.totalErrors / this.metrics.totalRequests) * 100
      : 0;

    const circuitHealth = this.circuitBreakerManager.getSystemHealth();

    return {
      healthy: circuitHealth.openBreakers === 0 && failureRate < 5,
      totalRequests: this.metrics.totalRequests,
      blockedRequests: this.metrics.blockedRequests,
      failureRate,
      circuitBreakersOpen: circuitHealth.openBreakers,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      rateLimitedRequests: 0,
      circuitBreakerTrips: 0,
      avgResponseTime: 0,
      totalErrors: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Shutdown
   */
  shutdown(): void {
    this.loadBalancerPool.destroyAll();
    this.circuitBreakerManager.resetAll();
  }
}

/**
 * Create traffic manager
 */
export function createTrafficManager(config?: TrafficManagerConfig): TrafficManager {
  return new TrafficManager(config);
}
