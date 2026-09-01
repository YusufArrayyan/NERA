/**
 * Load Balancer
 * Distributes traffic across multiple instances/services
 */

export type LoadBalancingStrategy = 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash' | 'random';

export interface HealthCheckConfig {
  enabled: boolean;
  intervalMs: number;
  timeoutMs: number;
  healthyThreshold: number; // consecutive successes to mark healthy
  unhealthyThreshold: number; // consecutive failures to mark unhealthy
  endpoint?: string;
}

export interface ServerInstance {
  id: string;
  host: string;
  port: number;
  weight?: number;
  healthy: boolean;
  activeConnections: number;
  totalRequests: number;
  totalErrors: number;
  lastHealthCheck: number;
  responseTime: number; // average ms
}

export interface LoadBalancerConfig {
  strategy: LoadBalancingStrategy;
  healthCheck: HealthCheckConfig;
  sessionPersistence?: boolean; // sticky sessions
  sessionTimeout?: number; // ms
}

export interface LoadBalancerMetrics {
  strategy: LoadBalancingStrategy;
  totalRequests: number;
  totalErrors: number;
  avgResponseTime: number;
  activeConnections: number;
  healthyInstances: number;
  totalInstances: number;
  distribution: Record<string, number>; // requests per instance
}

/**
 * Load Balancer
 */
export class LoadBalancer {
  private servers: Map<string, ServerInstance> = new Map();
  private currentIndex: number = 0;
  private sessionMap: Map<string, string> = new Map(); // sessionId -> serverId
  private sessionTimeout: number;
  private readonly config: Required<LoadBalancerConfig>;
  private healthCheckIntervals: Map<string, NodeJS.Timer> = new Map();

  constructor(config: LoadBalancerConfig) {
    this.config = {
      strategy: config.strategy || 'round-robin',
      healthCheck: {
        enabled: config.healthCheck?.enabled ?? true,
        intervalMs: config.healthCheck?.intervalMs || 30000,
        timeoutMs: config.healthCheck?.timeoutMs || 5000,
        healthyThreshold: config.healthCheck?.healthyThreshold || 2,
        unhealthyThreshold: config.healthCheck?.unhealthyThreshold || 3,
        endpoint: config.healthCheck?.endpoint || '/health',
      },
      sessionPersistence: config.sessionPersistence ?? false,
      sessionTimeout: config.sessionTimeout || 300000,
    };

    this.sessionTimeout = this.config.sessionTimeout;
  }

  /**
   * Add server instance
   */
  addServer(id: string, host: string, port: number, weight: number = 1): ServerInstance {
    const server: ServerInstance = {
      id,
      host,
      port,
      weight,
      healthy: true,
      activeConnections: 0,
      totalRequests: 0,
      totalErrors: 0,
      lastHealthCheck: Date.now(),
      responseTime: 0,
    };

    this.servers.set(id, server);

    if (this.config.healthCheck.enabled) {
      this.startHealthCheck(id);
    }

    return server;
  }

  /**
   * Remove server instance
   */
  removeServer(id: string): boolean {
    const removed = this.servers.delete(id);

    if (removed && this.healthCheckIntervals.has(id)) {
      clearInterval(this.healthCheckIntervals.get(id)!);
      this.healthCheckIntervals.delete(id);
    }

    return removed;
  }

  /**
   * Get next server based on strategy
   */
  getNextServer(sessionId?: string): ServerInstance | null {
    const healthyServers = Array.from(this.servers.values()).filter(s => s.healthy);

    if (healthyServers.length === 0) {
      return null;
    }

    // Check session persistence
    if (this.config.sessionPersistence && sessionId) {
      const serverId = this.sessionMap.get(sessionId);
      if (serverId) {
        const server = this.servers.get(serverId);
        if (server && server.healthy) {
          return server;
        }
        this.sessionMap.delete(sessionId);
      }
    }

    let selected: ServerInstance;

    switch (this.config.strategy) {
      case 'round-robin':
        selected = this.roundRobin(healthyServers);
        break;
      case 'least-connections':
        selected = this.leastConnections(healthyServers);
        break;
      case 'weighted':
        selected = this.weighted(healthyServers);
        break;
      case 'random':
        selected = this.random(healthyServers);
        break;
      case 'ip-hash':
        // IP hash requires IP, fallback to round-robin
        selected = this.roundRobin(healthyServers);
        break;
      default:
        selected = this.roundRobin(healthyServers);
    }

    // Store session mapping
    if (this.config.sessionPersistence && sessionId) {
      this.sessionMap.set(sessionId, selected.id);
    }

    return selected;
  }

  /**
   * Round-robin strategy
   */
  private roundRobin(servers: ServerInstance[]): ServerInstance {
    const selected = servers[this.currentIndex % servers.length];
    this.currentIndex++;
    return selected;
  }

  /**
   * Least connections strategy
   */
  private leastConnections(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((prev, current) =>
      prev.activeConnections <= current.activeConnections ? prev : current
    );
  }

  /**
   * Weighted strategy
   */
  private weighted(servers: ServerInstance[]): ServerInstance {
    const totalWeight = servers.reduce((sum, s) => sum + (s.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (const server of servers) {
      random -= server.weight || 1;
      if (random <= 0) {
        return server;
      }
    }

    return servers[0];
  }

  /**
   * Random strategy
   */
  private random(servers: ServerInstance[]): ServerInstance {
    return servers[Math.floor(Math.random() * servers.length)];
  }

  /**
   * IP hash strategy
   */
  ipHash(servers: ServerInstance[], clientIp: string): ServerInstance {
    const hash = clientIp.split('.').reduce((sum, part) => sum + parseInt(part), 0);
    return servers[hash % servers.length];
  }

  /**
   * Mark request start
   */
  markRequestStart(serverId: string): void {
    const server = this.servers.get(serverId);
    if (server) {
      server.activeConnections++;
      server.totalRequests++;
    }
  }

  /**
   * Mark request end
   */
  markRequestEnd(serverId: string, responseTime: number, error: boolean = false): void {
    const server = this.servers.get(serverId);
    if (!server) return;

    server.activeConnections = Math.max(0, server.activeConnections - 1);

    if (error) {
      server.totalErrors++;
    }

    // Update rolling average response time
    server.responseTime = (server.responseTime * 0.8 + responseTime * 0.2);
  }

  /**
   * Start health check for server
   */
  private startHealthCheck(serverId: string): void {
    if (this.healthCheckIntervals.has(serverId)) {
      clearInterval(this.healthCheckIntervals.get(serverId)!);
    }

    const interval = setInterval(async () => {
      await this.performHealthCheck(serverId);
    }, this.config.healthCheck.intervalMs);

    this.healthCheckIntervals.set(serverId, interval);
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) return;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.healthCheck.timeoutMs);

      const url = `http://${server.host}:${server.port}${this.config.healthCheck.endpoint}`;

      const response = await fetch(url, {
        signal: controller.signal,
        timeout: this.config.healthCheck.timeoutMs,
      });

      clearTimeout(timeout);

      if (response.ok) {
        this.markHealthy(serverId);
      } else {
        this.markUnhealthy(serverId);
      }
    } catch (error) {
      this.markUnhealthy(serverId);
    }

    server.lastHealthCheck = Date.now();
  }

  /**
   * Mark server as healthy
   */
  private markHealthy(serverId: string): void {
    const server = this.servers.get(serverId);
    if (!server) return;

    if (!server.healthy) {
      server.healthy = true;
    }
  }

  /**
   * Mark server as unhealthy
   */
  private markUnhealthy(serverId: string): void {
    const server = this.servers.get(serverId);
    if (!server) return;

    if (server.healthy) {
      server.healthy = false;
    }
  }

  /**
   * Get server by ID
   */
  getServer(id: string): ServerInstance | null {
    return this.servers.get(id) || null;
  }

  /**
   * Get all servers
   */
  getServers(): ServerInstance[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get healthy servers
   */
  getHealthyServers(): ServerInstance[] {
    return Array.from(this.servers.values()).filter(s => s.healthy);
  }

  /**
   * Get metrics
   */
  getMetrics(): LoadBalancerMetrics {
    const servers = Array.from(this.servers.values());
    const healthyServers = servers.filter(s => s.healthy);

    const totalRequests = servers.reduce((sum, s) => sum + s.totalRequests, 0);
    const totalErrors = servers.reduce((sum, s) => sum + s.totalErrors, 0);
    const avgResponseTime = servers.length > 0
      ? servers.reduce((sum, s) => sum + s.responseTime, 0) / servers.length
      : 0;
    const activeConnections = servers.reduce((sum, s) => sum + s.activeConnections, 0);

    const distribution: Record<string, number> = {};
    for (const server of servers) {
      distribution[server.id] = server.totalRequests;
    }

    return {
      strategy: this.config.strategy,
      totalRequests,
      totalErrors,
      avgResponseTime,
      activeConnections,
      healthyInstances: healthyServers.length,
      totalInstances: servers.length,
      distribution,
    };
  }

  /**
   * Get health status
   */
  getHealth(): {
    healthy: boolean;
    healthyServers: number;
    totalServers: number;
    activeConnections: number;
  } {
    const servers = Array.from(this.servers.values());
    const healthyServers = servers.filter(s => s.healthy).length;
    const activeConnections = servers.reduce((sum, s) => sum + s.activeConnections, 0);

    return {
      healthy: healthyServers > 0,
      healthyServers,
      totalServers: servers.length,
      activeConnections,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }

    this.healthCheckIntervals.clear();
    this.servers.clear();
    this.sessionMap.clear();
  }
}

/**
 * Load Balancer Pool Manager
 */
export class LoadBalancerPool {
  private balancers: Map<string, LoadBalancer> = new Map();

  /**
   * Create or get load balancer
   */
  getOrCreate(id: string, config: LoadBalancerConfig): LoadBalancer {
    if (this.balancers.has(id)) {
      return this.balancers.get(id)!;
    }

    const balancer = new LoadBalancer(config);
    this.balancers.set(id, balancer);

    return balancer;
  }

  /**
   * Get load balancer
   */
  get(id: string): LoadBalancer | null {
    return this.balancers.get(id) || null;
  }

  /**
   * Remove load balancer
   */
  remove(id: string): boolean {
    const balancer = this.balancers.get(id);
    if (balancer) {
      balancer.destroy();
      return this.balancers.delete(id);
    }
    return false;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, LoadBalancerMetrics> {
    const result: Record<string, LoadBalancerMetrics> = {};

    for (const [id, balancer] of this.balancers) {
      result[id] = balancer.getMetrics();
    }

    return result;
  }

  /**
   * Cleanup all
   */
  destroyAll(): void {
    for (const balancer of this.balancers.values()) {
      balancer.destroy();
    }

    this.balancers.clear();
  }
}

/**
 * Create load balancer pool
 */
export function createLoadBalancerPool(): LoadBalancerPool {
  return new LoadBalancerPool();
}
