/**
 * Rate Limiter
 * Token bucket, sliding window, and fixed window algorithms
 */

export type RateLimitAlgorithm = 'token_bucket' | 'sliding_window' | 'fixed_window' | 'leaky_bucket';

export interface RateLimitConfig {
  algorithm: RateLimitAlgorithm;
  maxRequests: number;
  windowMs: number; // milliseconds
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitRule {
  ruleId: string;
  endpoint: string; // regex pattern
  method?: string; // GET, POST, etc.
  config: RateLimitConfig;
  priority: number;
  enabled: boolean;
  createdAt: number;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number; // unix timestamp
  retryAfter?: number; // seconds
  isLimited: boolean;
}

export interface RateLimitMetrics {
  totalRequests: number;
  limitedRequests: number;
  allowedRequests: number;
  limitRate: number; // %
  avgWaitTime: number; // ms
  peakRequestsPerSec: number;
}

/**
 * Token Bucket implementation
 */
class TokenBucket {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms
  private lastRefillTime: number;

  constructor(maxTokens: number, windowMs: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = maxTokens / windowMs;
    this.lastRefillTime = Date.now();
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefillTime;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
  }

  /**
   * Consume tokens
   */
  consume(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  /**
   * Get current tokens
   */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Reset bucket
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefillTime = Date.now();
  }
}

/**
 * Sliding Window implementation
 */
class SlidingWindow {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Clean old requests outside window
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    this.requests = this.requests.filter(time => time > cutoff);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(): boolean {
    this.cleanup();

    if (this.requests.length < this.maxRequests) {
      this.requests.push(Date.now());
      return true;
    }

    return false;
  }

  /**
   * Get requests in window
   */
  getRequestCount(): number {
    this.cleanup();
    return this.requests.length;
  }

  /**
   * Get time until next request allowed
   */
  getTimeUntilReset(): number {
    this.cleanup();

    if (this.requests.length === 0) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    const resetTime = oldestRequest + this.windowMs;
    const now = Date.now();

    return Math.max(0, resetTime - now);
  }
}

/**
 * Fixed Window implementation
 */
class FixedWindow {
  private requestCount: number = 0;
  private windowStart: number;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.windowStart = Date.now();
  }

  /**
   * Check if window expired
   */
  private checkWindow(): void {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }
  }

  /**
   * Check if request is allowed
   */
  isAllowed(): boolean {
    this.checkWindow();

    if (this.requestCount < this.maxRequests) {
      this.requestCount++;
      return true;
    }

    return false;
  }

  /**
   * Get requests in window
   */
  getRequestCount(): number {
    this.checkWindow();
    return this.requestCount;
  }

  /**
   * Get time until reset
   */
  getTimeUntilReset(): number {
    this.checkWindow();
    return this.windowMs - (Date.now() - this.windowStart);
  }
}

/**
 * Leaky Bucket implementation
 */
class LeakyBucket {
  private queue: number[] = [];
  private readonly capacity: number;
  private readonly leakRate: number; // items per ms
  private lastLeakTime: number;

  constructor(capacity: number, windowMs: number) {
    this.capacity = capacity;
    this.leakRate = capacity / windowMs;
    this.lastLeakTime = Date.now();
  }

  /**
   * Leak items from bucket
   */
  private leak(): void {
    const now = Date.now();
    const timePassed = now - this.lastLeakTime;
    const itemsToLeak = Math.floor(timePassed * this.leakRate);

    for (let i = 0; i < itemsToLeak && this.queue.length > 0; i++) {
      this.queue.shift();
    }

    this.lastLeakTime = now;
  }

  /**
   * Add item to queue
   */
  add(): boolean {
    this.leak();

    if (this.queue.length < this.capacity) {
      this.queue.push(Date.now());
      return true;
    }

    return false;
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    this.leak();
    return this.queue.length;
  }

  /**
   * Reset bucket
   */
  reset(): void {
    this.queue = [];
    this.lastLeakTime = Date.now();
  }
}

/**
 * Rate Limiter
 */
export class RateLimiter {
  private buckets: Map<string, TokenBucket | SlidingWindow | FixedWindow | LeakyBucket> = new Map();
  private rules: RateLimitRule[] = [];
  private metrics: Map<string, RateLimitMetrics> = new Map();
  private requestTimes: Map<string, number[]> = new Map();

  /**
   * Create or get rate limit for key
   */
  private getOrCreateLimiter(
    key: string,
    config: RateLimitConfig
  ): TokenBucket | SlidingWindow | FixedWindow | LeakyBucket {
    if (this.buckets.has(key)) {
      return this.buckets.get(key)!;
    }

    let limiter: TokenBucket | SlidingWindow | FixedWindow | LeakyBucket;

    switch (config.algorithm) {
      case 'token_bucket':
        limiter = new TokenBucket(config.maxRequests, config.windowMs);
        break;
      case 'sliding_window':
        limiter = new SlidingWindow(config.maxRequests, config.windowMs);
        break;
      case 'fixed_window':
        limiter = new FixedWindow(config.maxRequests, config.windowMs);
        break;
      case 'leaky_bucket':
        limiter = new LeakyBucket(config.maxRequests, config.windowMs);
        break;
      default:
        limiter = new TokenBucket(config.maxRequests, config.windowMs);
    }

    this.buckets.set(key, limiter);
    return limiter;
  }

  /**
   * Add rate limit rule
   */
  addRule(
    endpoint: string,
    config: RateLimitConfig,
    method?: string,
    priority: number = 100
  ): RateLimitRule {
    const ruleId = `rule_${endpoint}_${method || 'all'}_${Date.now()}`;

    const rule: RateLimitRule = {
      ruleId,
      endpoint,
      method,
      config,
      priority,
      enabled: true,
      createdAt: Date.now(),
    };

    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);

    return rule;
  }

  /**
   * Find applicable rule for endpoint
   */
  private findRule(endpoint: string, method: string = 'GET'): RateLimitRule | null {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const endpointRegex = new RegExp(rule.endpoint);
      if (!endpointRegex.test(endpoint)) continue;

      if (rule.method && rule.method !== method) continue;

      return rule;
    }

    return null;
  }

  /**
   * Check rate limit for request
   */
  checkLimit(
    clientId: string,
    endpoint: string = 'global',
    method: string = 'GET'
  ): RateLimitStatus {
    const rule = this.findRule(endpoint, method);

    if (!rule) {
      return {
        limit: Infinity,
        remaining: Infinity,
        reset: Date.now() + 60000,
        isLimited: false,
      };
    }

    const key = `${rule.keyPrefix || 'default'}:${clientId}:${endpoint}`;
    const limiter = this.getOrCreateLimiter(key, rule.config);

    let allowed = false;
    let remaining = 0;
    let resetTime = Date.now() + rule.config.windowMs;

    if (limiter instanceof TokenBucket) {
      allowed = limiter.consume();
      remaining = Math.floor(limiter.getTokens());
    } else if (limiter instanceof SlidingWindow) {
      allowed = limiter.isAllowed();
      remaining = (limiter as any).maxRequests - limiter.getRequestCount();
      resetTime = Date.now() + limiter.getTimeUntilReset();
    } else if (limiter instanceof FixedWindow) {
      allowed = limiter.isAllowed();
      remaining = (limiter as any).maxRequests - limiter.getRequestCount();
      resetTime = Date.now() + limiter.getTimeUntilReset();
    } else if (limiter instanceof LeakyBucket) {
      allowed = limiter.add();
      remaining = (limiter as any).capacity - limiter.getQueueSize();
    }

    // Track metrics
    this.updateMetrics(endpoint, allowed);

    // Track request time for peak calculation
    this.trackRequestTime(clientId);

    return {
      limit: rule.config.maxRequests,
      remaining: Math.max(0, remaining),
      reset: resetTime,
      retryAfter: allowed ? undefined : Math.ceil((resetTime - Date.now()) / 1000),
      isLimited: !allowed,
    };
  }

  /**
   * Update metrics
   */
  private updateMetrics(endpoint: string, allowed: boolean): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, {
        totalRequests: 0,
        limitedRequests: 0,
        allowedRequests: 0,
        limitRate: 0,
        avgWaitTime: 0,
        peakRequestsPerSec: 0,
      });
    }

    const m = this.metrics.get(endpoint)!;
    m.totalRequests++;

    if (allowed) {
      m.allowedRequests++;
    } else {
      m.limitedRequests++;
    }

    m.limitRate = m.totalRequests > 0 ? (m.limitedRequests / m.totalRequests) * 100 : 0;
  }

  /**
   * Track request time for peak RPS calculation
   */
  private trackRequestTime(clientId: string): void {
    const now = Date.now();
    const key = `rps_${clientId}`;

    if (!this.requestTimes.has(key)) {
      this.requestTimes.set(key, []);
    }

    const times = this.requestTimes.get(key)!;
    times.push(now);

    // Keep only last 1 second
    const cutoff = now - 1000;
    this.requestTimes.set(key, times.filter(t => t > cutoff));
  }

  /**
   * Get metrics for endpoint
   */
  getMetrics(endpoint: string): RateLimitMetrics | null {
    return this.metrics.get(endpoint) || null;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, RateLimitMetrics> {
    const result: Record<string, RateLimitMetrics> = {};

    for (const [endpoint, metrics] of this.metrics) {
      result[endpoint] = metrics;
    }

    return result;
  }

  /**
   * Reset limiter for client
   */
  resetClient(clientId: string, endpoint?: string): void {
    if (endpoint) {
      const key = `default:${clientId}:${endpoint}`;
      const limiter = this.buckets.get(key);
      if (limiter instanceof TokenBucket) {
        limiter.reset();
      }
    } else {
      // Reset all limiters for this client
      for (const [key, limiter] of this.buckets) {
        if (key.includes(clientId)) {
          if (limiter instanceof TokenBucket) {
            limiter.reset();
          }
        }
      }
    }
  }

  /**
   * Get peak requests per second
   */
  getPeakRPS(): number {
    let maxRPS = 0;

    for (const times of this.requestTimes.values()) {
      maxRPS = Math.max(maxRPS, times.length);
    }

    return maxRPS;
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): RateLimitRule | null {
    return this.rules.find(r => r.ruleId === ruleId) || null;
  }

  /**
   * Update rule
   */
  updateRule(ruleId: string, config: Partial<RateLimitConfig>): boolean {
    const rule = this.getRule(ruleId);
    if (!rule) return false;

    rule.config = { ...rule.config, ...config };
    return true;
  }

  /**
   * Disable rule
   */
  disableRule(ruleId: string): boolean {
    const rule = this.getRule(ruleId);
    if (!rule) return false;

    rule.enabled = false;
    return true;
  }

  /**
   * Enable rule
   */
  enableRule(ruleId: string): boolean {
    const rule = this.getRule(ruleId);
    if (!rule) return false;

    rule.enabled = true;
    return true;
  }

  /**
   * Get all rules
   */
  getRules(): RateLimitRule[] {
    return [...this.rules];
  }

  /**
   * Get rate limiter health
   */
  getHealth(): { activeLimiters: number; totalRequests: number; avgLimitRate: number } {
    const totalRequests = Array.from(this.metrics.values()).reduce((sum, m) => sum + m.totalRequests, 0);
    const avgLimitRate = Array.from(this.metrics.values()).reduce((sum, m) => sum + m.limitRate, 0) / Math.max(1, this.metrics.size);

    return {
      activeLimiters: this.buckets.size,
      totalRequests,
      avgLimitRate,
    };
  }
}

/**
 * Create rate limiter instance
 */
export function createRateLimiter(): RateLimiter {
  return new RateLimiter();
}
