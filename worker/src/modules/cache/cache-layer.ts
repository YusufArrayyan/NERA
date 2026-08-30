/**
 * Cache Layer
 * Redis-based caching with query optimization and hot-spot management
 */

export type CacheStrategy = 'ttl' | 'lru' | 'lfu' | 'fifo';
export type CachePriority = 'critical' | 'high' | 'medium' | 'low';

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  hits: number;
  size: number; // bytes
  priority: CachePriority;
  strategy: CacheStrategy;
}

export interface CacheStats {
  totalSize: number; // bytes
  entryCount: number;
  hitRate: number; // 0-1
  missRate: number; // 0-1
  evictionCount: number;
  averageAccessTime: number; // ms
  memoryUsage: number; // bytes
}

export interface QueryCache {
  queryKey: string;
  queryType: 'user_profile' | 'leaderboard' | 'challenge' | 'journal' | 'analytics';
  results: any;
  resultCount: number;
  executionTime: number; // ms
  cachedAt: number;
  expiresAt: number;
  dependencies: string[]; // What invalidates this query
}

export interface HotSpot {
  entityType: string; // 'user', 'challenge', 'leaderboard', etc
  entityId: string;
  accessCount: number;
  lastAccess: number;
  priority: CachePriority;
  recommendedTTL: number; // seconds
}

/**
 * Cache Layer
 */
export class CacheLayer {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private queryCache: Map<string, QueryCache> = new Map();
  private hotSpots: Map<string, HotSpot> = new Map();
  private stats: CacheStats = {
    totalSize: 0,
    entryCount: 0,
    hitRate: 0,
    missRate: 0,
    evictionCount: 0,
    averageAccessTime: 0,
    memoryUsage: 0,
  };
  private totalHits = 0;
  private totalMisses = 0;
  private accessTimes: number[] = [];

  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private maxQueryCacheSize = 50 * 1024 * 1024; // 50MB

  private defaultTTLs: Record<CachePriority, number> = {
    critical: 3600, // 1 hour
    high: 1800, // 30 min
    medium: 600, // 10 min
    low: 300, // 5 min
  };

  /**
   * Set cache entry
   */
  set<T>(
    key: string,
    value: T,
    ttl: number = 600,
    priority: CachePriority = 'medium',
    strategy: CacheStrategy = 'ttl'
  ): void {
    // Estimate size (rough calculation)
    const size = JSON.stringify(value).length;

    // Check if we need to evict
    if (this.stats.totalSize + size > this.maxCacheSize) {
      this.evict(priority, size);
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl * 1000,
      hits: 0,
      size,
      priority,
      strategy,
    };

    // Remove old entry if exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.stats.totalSize -= oldEntry.size;
    }

    this.cache.set(key, entry);
    this.stats.totalSize += size;
    this.stats.entryCount = this.cache.size;
    this.stats.memoryUsage = this.stats.totalSize;

    // Record hot spot
    this.recordHotSpot(key, priority);
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const start = performance.now();

    const entry = this.cache.get(key);

    if (!entry) {
      this.totalMisses++;
      this.updateStats();
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.totalSize -= entry.size;
      this.stats.entryCount = this.cache.size;
      this.totalMisses++;
      this.updateStats();
      return null;
    }

    // Update entry stats
    entry.hits++;
    this.totalHits++;

    // Update hot spot
    this.recordHotSpot(key, entry.priority);

    // Track access time
    const latency = performance.now() - start;
    this.accessTimes.push(latency);
    if (this.accessTimes.length > 1000) {
      this.accessTimes.shift();
    }

    this.updateStats();
    return entry.value;
  }

  /**
   * Cache query result
   */
  cacheQuery(
    queryType: QueryCache['queryType'],
    queryKey: string,
    results: any,
    executionTime: number,
    dependencies: string[],
    ttl: number = 600
  ): QueryCache {
    const queryCache: QueryCache = {
      queryKey,
      queryType,
      results,
      resultCount: Array.isArray(results) ? results.length : 1,
      executionTime,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttl * 1000,
      dependencies,
    };

    // Use higher priority for frequently accessed queries
    const priority = this.getPriorityForQueryType(queryType);
    this.set(queryKey, queryCache, ttl, priority, 'ttl');

    this.queryCache.set(queryKey, queryCache);
    return queryCache;
  }

  /**
   * Invalidate query cache
   */
  invalidateQuery(dependency: string): void {
    // Find all queries that depend on this
    const toInvalidate: string[] = [];

    for (const [key, query] of this.queryCache.entries()) {
      if (query.dependencies.includes(dependency)) {
        toInvalidate.push(key);
      }
    }

    for (const key of toInvalidate) {
      this.delete(key);
      this.queryCache.delete(key);
    }
  }

  /**
   * Invalidate user cache
   */
  invalidateUser(userId: string): void {
    const toInvalidate: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(`user:${userId}`) || key.includes(`leaderboard`)) {
        toInvalidate.push(key);
      }
    }

    for (const key of toInvalidate) {
      this.delete(key);
    }

    // Invalidate related queries
    this.invalidateQuery(`user:${userId}`);
  }

  /**
   * Invalidate challenge cache
   */
  invalidateChallenge(challengeId: string): void {
    const toInvalidate: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(`challenge:${challengeId}`)) {
        toInvalidate.push(key);
      }
    }

    for (const key of toInvalidate) {
      this.delete(key);
    }

    this.invalidateQuery(`challenge:${challengeId}`);
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.totalSize -= entry.size;
      this.cache.delete(key);
      this.stats.entryCount = this.cache.size;
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.queryCache.clear();
    this.stats = {
      totalSize: 0,
      entryCount: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      averageAccessTime: 0,
      memoryUsage: 0,
    };
    this.totalHits = 0;
    this.totalMisses = 0;
    this.accessTimes = [];
  }

  /**
   * Evict entries based on strategy
   */
  private evict(priority: CachePriority, spaceNeeded: number): void {
    let freedSpace = 0;
    const entries = Array.from(this.cache.values());

    // Sort by strategy (LRU by default)
    entries.sort((a, b) => {
      if (a.strategy === 'lru') {
        return a.hits - b.hits; // Evict least frequently used
      } else if (a.strategy === 'lfu') {
        return a.hits - b.hits; // Evict least frequently used
      } else if (a.strategy === 'fifo') {
        return a.createdAt - b.createdAt; // Evict oldest
      }
      return a.createdAt - b.createdAt;
    });

    // Evict low priority entries first
    for (const entry of entries) {
      if (freedSpace >= spaceNeeded) break;
      if (entry.priority !== 'critical' && entry.priority !== 'high') {
        this.cache.delete(entry.key);
        freedSpace += entry.size;
        this.stats.evictionCount++;
      }
    }

    // If still need space, evict medium priority
    if (freedSpace < spaceNeeded) {
      for (const entry of entries) {
        if (freedSpace >= spaceNeeded) break;
        if (entry.priority !== 'critical') {
          this.cache.delete(entry.key);
          freedSpace += entry.size;
          this.stats.evictionCount++;
        }
      }
    }

    // Last resort: evict anything
    if (freedSpace < spaceNeeded) {
      for (const entry of entries) {
        if (freedSpace >= spaceNeeded) break;
        this.cache.delete(entry.key);
        freedSpace += entry.size;
        this.stats.evictionCount++;
      }
    }

    this.stats.totalSize = Array.from(this.cache.values()).reduce((sum, e) => sum + e.size, 0);
  }

  /**
   * Record hot spot
   */
  private recordHotSpot(key: string, priority: CachePriority): void {
    // Extract entity type and ID from key
    // Format: "type:id:field"
    const parts = key.split(':');
    if (parts.length >= 2) {
      const entityType = parts[0];
      const entityId = parts[1];
      const spotKey = `${entityType}:${entityId}`;

      let hotSpot = this.hotSpots.get(spotKey);
      if (!hotSpot) {
        hotSpot = {
          entityType,
          entityId,
          accessCount: 0,
          lastAccess: Date.now(),
          priority,
          recommendedTTL: this.defaultTTLs[priority],
        };
        this.hotSpots.set(spotKey, hotSpot);
      }

      hotSpot.accessCount++;
      hotSpot.lastAccess = Date.now();

      // Increase TTL for frequently accessed items
      if (hotSpot.accessCount > 10) {
        hotSpot.recommendedTTL = this.defaultTTLs['high'];
      }
      if (hotSpot.accessCount > 50) {
        hotSpot.recommendedTTL = this.defaultTTLs['critical'];
      }
    }
  }

  /**
   * Update stats
   */
  private updateStats(): void {
    const total = this.totalHits + this.totalMisses;
    this.stats.hitRate = total > 0 ? this.totalHits / total : 0;
    this.stats.missRate = total > 0 ? this.totalMisses / total : 0;
    this.stats.averageAccessTime = this.accessTimes.length > 0 ? this.accessTimes.reduce((a, b) => a + b, 0) / this.accessTimes.length : 0;
  }

  /**
   * Get priority for query type
   */
  private getPriorityForQueryType(queryType: QueryCache['queryType']): CachePriority {
    switch (queryType) {
      case 'user_profile':
        return 'high';
      case 'leaderboard':
        return 'high';
      case 'challenge':
        return 'medium';
      case 'journal':
        return 'medium';
      case 'analytics':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Get cache stats
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get hot spots
   */
  getHotSpots(limit: number = 20): HotSpot[] {
    return Array.from(this.hotSpots.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Warm cache with critical data
   */
  warmCache(userProfiles: any[], leaderboards: any[]): void {
    // Cache user profiles
    for (const profile of userProfiles.slice(0, 100)) {
      this.set(`user:${profile.userId}:profile`, profile, 3600, 'critical', 'ttl');
    }

    // Cache leaderboards
    for (const leaderboard of leaderboards.slice(0, 10)) {
      this.set(`leaderboard:${leaderboard.type}`, leaderboard, 1800, 'high', 'ttl');
    }
  }

  /**
   * Get cache info
   */
  getInfo(): Record<string, any> {
    return {
      entries: this.cache.size,
      totalSize: this.formatBytes(this.stats.totalSize),
      maxSize: this.formatBytes(this.maxCacheSize),
      hitRate: `${(this.stats.hitRate * 100).toFixed(2)}%`,
      missRate: `${(this.stats.missRate * 100).toFixed(2)}%`,
      evictionCount: this.stats.evictionCount,
      averageAccessTime: `${this.stats.averageAccessTime.toFixed(2)}ms`,
      hotSpots: this.getHotSpots(5),
    };
  }

  /**
   * Format bytes
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }
}

/**
 * Create cache layer instance
 */
export function createCacheLayer(): CacheLayer {
  return new CacheLayer();
}
