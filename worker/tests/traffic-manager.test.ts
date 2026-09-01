/**
 * Traffic Manager Tests
 * Rate limiting, circuit breakers, load balancing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  RateLimiter,
  CircuitBreakerManager,
  CircuitBreaker,
  LoadBalancerPool,
  TrafficManager,
  createTrafficManager,
} from '../src/modules/traffic';

describe('Rate Limiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
  });

  it('should create token bucket rate limiter', () => {
    const rule = rateLimiter.addRule(
      '/api/.*',
      {
        algorithm: 'token_bucket',
        maxRequests: 10,
        windowMs: 1000,
      },
      'GET',
      100
    );

    expect(rule).toBeDefined();
    expect(rule.config.algorithm).toBe('token_bucket');
  });

  it('should limit requests with token bucket', () => {
    rateLimiter.addRule(
      '/api/.*',
      {
        algorithm: 'token_bucket',
        maxRequests: 5,
        windowMs: 1000,
      }
    );

    // Allow 5 requests
    for (let i = 0; i < 5; i++) {
      const status = rateLimiter.checkLimit('client1', '/api/test');
      expect(status.isLimited).toBe(false);
    }

    // Block 6th request
    const status = rateLimiter.checkLimit('client1', '/api/test');
    expect(status.isLimited).toBe(true);
  });

  it('should track rate limit metrics', () => {
    rateLimiter.addRule(
      '/api/.*',
      {
        algorithm: 'token_bucket',
        maxRequests: 3,
        windowMs: 1000,
      }
    );

    for (let i = 0; i < 5; i++) {
      rateLimiter.checkLimit('client1', '/api/test');
    }

    const metrics = rateLimiter.getMetrics('/api/test');
    expect(metrics).toBeDefined();
    expect(metrics?.totalRequests).toBe(5);
    expect(metrics?.limitedRequests).toBeGreaterThan(0);
  });

  it('should support sliding window algorithm', () => {
    rateLimiter.addRule(
      '/api/.*',
      {
        algorithm: 'sliding_window',
        maxRequests: 3,
        windowMs: 1000,
      }
    );

    for (let i = 0; i < 3; i++) {
      rateLimiter.checkLimit('client1', '/api/test');
    }

    const status = rateLimiter.checkLimit('client1', '/api/test');
    expect(status.isLimited).toBe(true);
  });

  it('should support fixed window algorithm', () => {
    rateLimiter.addRule(
      '/api/.*',
      {
        algorithm: 'fixed_window',
        maxRequests: 2,
        windowMs: 1000,
      }
    );

    for (let i = 0; i < 2; i++) {
      rateLimiter.checkLimit('client1', '/api/test');
    }

    const status = rateLimiter.checkLimit('client1', '/api/test');
    expect(status.isLimited).toBe(true);
  });

  it('should return retry-after header', () => {
    rateLimiter.addRule(
      '/api/.*',
      {
        algorithm: 'token_bucket',
        maxRequests: 1,
        windowMs: 1000,
      }
    );

    rateLimiter.checkLimit('client1', '/api/test');
    const status = rateLimiter.checkLimit('client1', '/api/test');

    expect(status.retryAfter).toBeDefined();
    expect(status.retryAfter).toBeGreaterThan(0);
  });

  it('should reset client rate limit', () => {
    rateLimiter.addRule(
      '/api/.*',
      {
        algorithm: 'token_bucket',
        maxRequests: 1,
        windowMs: 1000,
      }
    );

    rateLimiter.checkLimit('client1', '/api/test');
    rateLimiter.resetClient('client1', '/api/test');

    const status = rateLimiter.checkLimit('client1', '/api/test');
    expect(status.isLimited).toBe(false);
  });
});

describe('Circuit Breaker', () => {
  let breaker: CircuitBreaker<string>;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 100,
    });
  });

  it('should start in closed state', () => {
    expect(breaker.getState()).toBe('closed');
  });

  it('should open after threshold failures', async () => {
    let failCount = 0;

    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          failCount++;
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe('open');
    expect(failCount).toBe(3);
  });

  it('should prevent requests when open', async () => {
    // Open the breaker
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe('open');

    // Should reject requests
    await expect(
      breaker.execute(async () => 'success')
    ).rejects.toThrow('Circuit breaker is open');
  });

  it('should transition to half-open after timeout', async () => {
    // Open the breaker
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe('open');

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Try to execute - should transition to half-open
    const result = await breaker.execute(async () => 'success');
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('half-open');
  });

  it('should close after success threshold in half-open', async () => {
    // Open and transition to half-open
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
    }

    await new Promise(resolve => setTimeout(resolve, 150));

    // Successful requests
    for (let i = 0; i < 2; i++) {
      await breaker.execute(async () => 'success');
    }

    expect(breaker.getState()).toBe('closed');
  });

  it('should track metrics', async () => {
    await breaker.execute(async () => 'success');
    await breaker.execute(async () => 'success');

    try {
      await breaker.execute(async () => {
        throw new Error('Test error');
      });
    } catch (e) {
      // Expected
    }

    const metrics = breaker.getMetrics();
    expect(metrics.state).toBe('closed');
    expect(metrics.totalRequests).toBe(3);
    expect(metrics.totalFailures).toBe(1);
  });
});

describe('Circuit Breaker Manager', () => {
  let manager: CircuitBreakerManager;

  beforeEach(() => {
    manager = new CircuitBreakerManager();
  });

  it('should create and manage multiple breakers', () => {
    const breaker1 = manager.getOrCreate('service1', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });

    const breaker2 = manager.getOrCreate('service2', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });

    expect(breaker1).toBeDefined();
    expect(breaker2).toBeDefined();
    expect(breaker1).not.toBe(breaker2);
  });

  it('should return same breaker on subsequent calls', () => {
    const breaker1 = manager.getOrCreate('service1', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });

    const breaker2 = manager.getOrCreate('service1', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });

    expect(breaker1).toBe(breaker2);
  });

  it('should get system health', () => {
    manager.getOrCreate('service1', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });

    manager.getOrCreate('service2', {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    });

    const health = manager.getSystemHealth();
    expect(health.healthy).toBe(true);
    expect(health.closedBreakers).toBe(2);
  });

  it('should track open breakers', async () => {
    const breaker = manager.getOrCreate('service1', {
      failureThreshold: 2,
      successThreshold: 2,
      timeout: 60000,
    });

    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(async () => {
          throw new Error('Test');
        });
      } catch (e) {
        // Expected
      }
    }

    const health = manager.getSystemHealth();
    expect(health.openBreakers).toBe(1);
    expect(health.healthy).toBe(false);
  });
});

describe('Load Balancer', () => {
  it('should round-robin distribute requests', async () => {
    const { LoadBalancer } = await import('../src/modules/traffic/load-balancer');

    const balancer = new LoadBalancer({
      strategy: 'round-robin',
      healthCheck: { enabled: false },
    });

    balancer.addServer('s1', 'localhost', 3001);
    balancer.addServer('s2', 'localhost', 3002);
    balancer.addServer('s3', 'localhost', 3003);

    const results = [];
    for (let i = 0; i < 6; i++) {
      const server = balancer.getNextServer();
      results.push(server?.id);
    }

    expect(results).toEqual(['s1', 's2', 's3', 's1', 's2', 's3']);
  });

  it('should use least connections strategy', async () => {
    const { LoadBalancer } = await import('../src/modules/traffic/load-balancer');

    const balancer = new LoadBalancer({
      strategy: 'least-connections',
      healthCheck: { enabled: false },
    });

    balancer.addServer('s1', 'localhost', 3001);
    balancer.addServer('s2', 'localhost', 3002);

    // Add connections to s1
    balancer.markRequestStart('s1');
    balancer.markRequestStart('s1');

    // s2 has no connections, should be selected
    const server = balancer.getNextServer();
    expect(server?.id).toBe('s2');
  });

  it('should support session persistence', async () => {
    const { LoadBalancer } = await import('../src/modules/traffic/load-balancer');

    const balancer = new LoadBalancer({
      strategy: 'round-robin',
      sessionPersistence: true,
      healthCheck: { enabled: false },
    });

    balancer.addServer('s1', 'localhost', 3001);
    balancer.addServer('s2', 'localhost', 3002);

    // First request
    const server1 = balancer.getNextServer('session123');
    const server2 = balancer.getNextServer('session123');

    expect(server1?.id).toBe(server2?.id);
  });

  it('should mark servers unhealthy', async () => {
    const { LoadBalancer } = await import('../src/modules/traffic/load-balancer');

    const balancer = new LoadBalancer({
      strategy: 'round-robin',
      healthCheck: { enabled: false },
    });

    const s1 = balancer.addServer('s1', 'localhost', 3001);
    const s2 = balancer.addServer('s2', 'localhost', 3002);

    expect(s1.healthy).toBe(true);

    // In real scenario, health check would mark it unhealthy
    // For testing, we simulate it
    s1.healthy = false;

    const server = balancer.getNextServer();
    expect(server?.id).toBe('s2');
  });

  it('should track metrics', async () => {
    const { LoadBalancer } = await import('../src/modules/traffic/load-balancer');

    const balancer = new LoadBalancer({
      strategy: 'round-robin',
      healthCheck: { enabled: false },
    });

    balancer.addServer('s1', 'localhost', 3001);
    balancer.addServer('s2', 'localhost', 3002);

    balancer.markRequestStart('s1');
    balancer.markRequestEnd('s1', 50, false);
    balancer.markRequestStart('s2');
    balancer.markRequestEnd('s2', 100, false);

    const metrics = balancer.getMetrics();
    expect(metrics.totalRequests).toBe(2);
    expect(metrics.activeConnections).toBe(0);
    expect(metrics.healthyInstances).toBe(2);
  });
});

describe('Traffic Manager', () => {
  let trafficManager: TrafficManager;

  beforeEach(() => {
    trafficManager = createTrafficManager({
      rateLimitConfig: {
        algorithm: 'token_bucket',
        defaultMaxRequests: 100,
        defaultWindowMs: 60000,
      },
      circuitBreakerConfig: {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000,
      },
    });
  });

  afterEach(() => {
    trafficManager.shutdown();
  });

  it('should check traffic and allow requests', () => {
    const result = trafficManager.checkTraffic({
      clientId: 'client1',
      endpoint: '/api/test',
      method: 'GET',
    });

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should rate limit requests', () => {
    trafficManager.rateLimiter.addRule(
      '^/api/limit-test$',
      {
        algorithm: 'token_bucket',
        maxRequests: 2,
        windowMs: 1000,
      },
      'GET',
      10 // higher priority
    );

    // Allow 2 requests
    for (let i = 0; i < 2; i++) {
      const result = trafficManager.checkTraffic({
        clientId: 'client1',
        endpoint: '/api/limit-test',
        method: 'GET',
      });
      expect(result.allowed).toBe(true);
    }

    // Block 3rd request
    const result = trafficManager.checkTraffic({
      clientId: 'client1',
      endpoint: '/api/limit-test',
      method: 'GET',
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Rate limit exceeded');
  });

  it('should handle circuit breaker integration', () => {
    trafficManager.registerCircuitBreaker('service1', {
      failureThreshold: 2,
      successThreshold: 2,
      timeout: 60000,
    });

    const result1 = trafficManager.checkTraffic({
      clientId: 'client1',
      endpoint: 'service1',
      method: 'GET',
    });

    expect(result1.allowed).toBe(true);
  });

  it('should manage load balancers', () => {
    trafficManager.addServer('lb1', 's1', 'localhost', 3001, 1);
    trafficManager.addServer('lb1', 's2', 'localhost', 3002, 1);

    const metrics = trafficManager.getLoadBalancerMetrics('lb1');
    expect(metrics?.totalInstances).toBe(2);
    expect(metrics?.healthyInstances).toBe(2);
  });

  it('should provide comprehensive metrics', () => {
    for (let i = 0; i < 10; i++) {
      trafficManager.checkTraffic({
        clientId: `client${i}`,
        endpoint: '/api/test',
        method: 'GET',
      });
    }

    const metrics = trafficManager.getMetrics();
    expect(metrics.totalRequests).toBe(10);
    expect(metrics.allowedRequests).toBe(10);
    expect(metrics.blockedRequests).toBe(0);
  });

  it('should get system health', () => {
    const health = trafficManager.getHealth();
    expect(health.healthy).toBe(true);
    expect(health.failureRate).toBeGreaterThanOrEqual(0);
  });

  it('should reset metrics', () => {
    trafficManager.checkTraffic({
      clientId: 'client1',
      endpoint: '/api/test',
      method: 'GET',
    });

    let metrics = trafficManager.getMetrics();
    expect(metrics.totalRequests).toBe(1);

    trafficManager.resetMetrics();

    metrics = trafficManager.getMetrics();
    expect(metrics.totalRequests).toBe(0);
  });

  it('should track requests across all modules', () => {
    // Generate traffic
    for (let i = 0; i < 50; i++) {
      trafficManager.checkTraffic({
        clientId: 'client1',
        endpoint: '/api/test',
        method: 'GET',
      });
    }

    // Record request
    trafficManager.addServer('lb1', 's1', 'localhost', 3001);
    const server = trafficManager.getNextServer('lb1', {
      clientId: 'client1',
      endpoint: '/api/test',
      method: 'GET',
      sessionId: 'session1',
    });

    if (server) {
      trafficManager.recordRequest('lb1', server.id, 25, false);
    }

    const metrics = trafficManager.getMetrics();
    expect(metrics.totalRequests).toBe(50);
    expect(metrics.avgResponseTime).toBeGreaterThan(0);
  });
});
