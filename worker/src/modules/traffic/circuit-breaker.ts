/**
 * Circuit Breaker
 * Prevents cascading failures in distributed systems
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number; // consecutive failures to open
  successThreshold: number; // consecutive successes to close (from half-open)
  timeout: number; // ms before transitioning from open to half-open
  onStateChange?: (state: CircuitState, prevState: CircuitState) => void;
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  totalRequests: number;
  totalFailures: number;
  failureRate: number; // %
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  stateChangedAt: number;
}

export interface CircuitBreakerHealth {
  healthy: boolean;
  state: CircuitState;
  failureRate: number;
  uptime: number; // ms since last state change
}

/**
 * Circuit Breaker for service resilience
 */
export class CircuitBreaker<T> {
  private state: CircuitState = 'closed';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private lastStateChangeTime: number = Date.now();
  private openedAt: number | null = null;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private readonly config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 2,
      timeout: config.timeout || 60000,
      onStateChange: config.onStateChange,
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<R>(fn: () => Promise<R>): Promise<R> {
    // Check if circuit should transition from open to half-open
    if (this.state === 'open') {
      if (Date.now() - (this.openedAt || Date.now()) >= this.config.timeout) {
        this.transitionTo('half-open');
      } else {
        throw new Error(`Circuit breaker is open. Retry after ${this.config.timeout}ms`);
      }
    }

    this.totalRequests++;

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Execute synchronously
   */
  executeSync<R>(fn: () => R): R {
    // Check if circuit should transition from open to half-open
    if (this.state === 'open') {
      if (Date.now() - (this.openedAt || Date.now()) >= this.config.timeout) {
        this.transitionTo('half-open');
      } else {
        throw new Error(`Circuit breaker is open. Retry after ${this.config.timeout}ms`);
      }
    }

    this.totalRequests++;

    try {
      const result = fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.failureCount = 0;
    this.successCount++;

    if (this.state === 'half-open' && this.successCount >= this.config.successThreshold) {
      this.transitionTo('closed');
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.totalFailures++;
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.config.failureThreshold && this.state === 'closed') {
      this.transitionTo('open');
    }
  }

  /**
   * Transition to new state
   */
  private transitionTo(newState: CircuitState): void {
    const prevState = this.state;

    if (newState === 'open') {
      this.openedAt = Date.now();
    } else if (newState === 'closed') {
      this.failureCount = 0;
      this.successCount = 0;
      this.openedAt = null;
    } else if (newState === 'half-open') {
      this.successCount = 0;
      this.failureCount = 0;
    }

    this.state = newState;
    this.lastStateChangeTime = Date.now();

    if (this.config.onStateChange) {
      this.config.onStateChange(newState, prevState);
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    const failureRate = this.totalRequests > 0 ? (this.totalFailures / this.totalRequests) * 100 : 0;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      failureRate,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.lastStateChangeTime,
    };
  }

  /**
   * Get health status
   */
  getHealth(): CircuitBreakerHealth {
    const failureRate = this.totalRequests > 0 ? (this.totalFailures / this.totalRequests) * 100 : 0;
    const uptime = Date.now() - this.lastStateChangeTime;

    return {
      healthy: this.state === 'closed',
      state: this.state,
      failureRate,
      uptime,
    };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    const prevState = this.state;
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.openedAt = null;
    this.lastStateChangeTime = Date.now();
    this.lastFailureTime = null;
    this.lastSuccessTime = null;

    if (this.config.onStateChange) {
      this.config.onStateChange('closed', prevState);
    }
  }

  /**
   * Manually open circuit
   */
  open(): void {
    this.transitionTo('open');
  }

  /**
   * Manually close circuit
   */
  close(): void {
    this.transitionTo('closed');
  }

  /**
   * Force half-open state for testing
   */
  forceHalfOpen(): void {
    this.transitionTo('half-open');
  }
}

/**
 * Circuit Breaker Manager
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker<any>> = new Map();
  private globalMetrics: Map<string, CircuitBreakerMetrics> = new Map();

  /**
   * Create or get circuit breaker
   */
  getOrCreate(id: string, config: CircuitBreakerConfig): CircuitBreaker<any> {
    if (this.breakers.has(id)) {
      return this.breakers.get(id)!;
    }

    const breaker = new CircuitBreaker(config);
    this.breakers.set(id, breaker);

    return breaker;
  }

  /**
   * Get circuit breaker
   */
  get(id: string): CircuitBreaker<any> | null {
    return this.breakers.get(id) || null;
  }

  /**
   * Remove circuit breaker
   */
  remove(id: string): boolean {
    return this.breakers.delete(id);
  }

  /**
   * Get all circuit breakers
   */
  getAll(): Record<string, CircuitBreaker<any>> {
    const result: Record<string, CircuitBreaker<any>> = {};

    for (const [id, breaker] of this.breakers) {
      result[id] = breaker;
    }

    return result;
  }

  /**
   * Get metrics for all breakers
   */
  getMetrics(): Record<string, CircuitBreakerMetrics> {
    const result: Record<string, CircuitBreakerMetrics> = {};

    for (const [id, breaker] of this.breakers) {
      result[id] = breaker.getMetrics();
    }

    return result;
  }

  /**
   * Get health for all breakers
   */
  getHealth(): Record<string, CircuitBreakerHealth> {
    const result: Record<string, CircuitBreakerHealth> = {};

    for (const [id, breaker] of this.breakers) {
      result[id] = breaker.getHealth();
    }

    return result;
  }

  /**
   * Get overall system health
   */
  getSystemHealth(): {
    healthy: boolean;
    openBreakers: number;
    halfOpenBreakers: number;
    closedBreakers: number;
    avgFailureRate: number;
  } {
    let openCount = 0;
    let halfOpenCount = 0;
    let closedCount = 0;
    let totalFailureRate = 0;

    for (const breaker of this.breakers.values()) {
      const metrics = breaker.getMetrics();

      switch (metrics.state) {
        case 'open':
          openCount++;
          break;
        case 'half-open':
          halfOpenCount++;
          break;
        case 'closed':
          closedCount++;
          break;
      }

      totalFailureRate += metrics.failureRate;
    }

    const breackerCount = this.breakers.size;
    const avgFailureRate = breackerCount > 0 ? totalFailureRate / breackerCount : 0;

    return {
      healthy: openCount === 0,
      openBreakers: openCount,
      halfOpenBreakers: halfOpenCount,
      closedBreakers: closedCount,
      avgFailureRate,
    };
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Reset specific circuit breaker
   */
  reset(id: string): boolean {
    const breaker = this.breakers.get(id);
    if (!breaker) return false;

    breaker.reset();
    return true;
  }

  /**
   * Get count of open breakers
   */
  getOpenBreakerCount(): number {
    let count = 0;

    for (const breaker of this.breakers.values()) {
      if (breaker.getState() === 'open') {
        count++;
      }
    }

    return count;
  }

  /**
   * Check if any breaker is open
   */
  hasOpenBreakers(): boolean {
    return this.getOpenBreakerCount() > 0;
  }

  /**
   * Get breakers in specific state
   */
  getBreakersInState(state: CircuitState): Record<string, CircuitBreaker<any>> {
    const result: Record<string, CircuitBreaker<any>> = {};

    for (const [id, breaker] of this.breakers) {
      if (breaker.getState() === state) {
        result[id] = breaker;
      }
    }

    return result;
  }
}

/**
 * Create circuit breaker manager
 */
export function createCircuitBreakerManager(): CircuitBreakerManager {
  return new CircuitBreakerManager();
}
