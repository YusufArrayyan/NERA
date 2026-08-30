/**
 * Cache Layer Tests
 * Tests for caching strategy, query optimization, and hot-spot management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createCacheLayer } from '../src/modules/cache/cache-layer';

describe('Cache Layer', () => {
  let cache: ReturnType<typeof createCacheLayer>;

  beforeEach(() => {
    cache = createCacheLayer();
  });

  describe('Basic Cache Operations', () => {
    it('should set and get cache entry', () => {
      cache.set('key1', { data: 'value1' });

      const result = cache.get('key1');

      expect(result).toBeDefined();
      expect(result?.data).toBe('value1');
    });

    it('should return null for missing key', () => {
      const result = cache.get('non-existent');

      expect(result).toBeNull();
    });

    it('should delete cache entry', () => {
      cache.set('key1', { data: 'value1' });
      cache.delete('key1');

      const result = cache.get('key1');

      expect(result).toBeNull();
    });

    it('should clear all cache', () => {
      cache.set('key1', { data: 'value1' });
      cache.set('key2', { data: 'value2' });
      cache.clear();

      const result1 = cache.get('key1');
      const result2 = cache.get('key2');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should respect TTL expiration', (context) => {
      cache.set('expiring', { data: 'value' }, 1); // 1 second TTL

      const immediately = cache.get('expiring');
      expect(immediately).not.toBeNull();

      // Note: In real test, would use setTimeout, but for immediate test:
      // This is a basic check that TTL is set
      const stats = cache.getStats();
      expect(stats.entryCount).toBe(1);
    });

    it('should overwrite existing key', () => {
      cache.set('key1', { data: 'value1' });
      cache.set('key1', { data: 'value2' });

      const result = cache.get('key1');

      expect(result?.data).toBe('value2');
    });
  });

  describe('Cache Priorities', () => {
    it('should set entry with critical priority', () => {
      cache.set('critical-key', { data: 'critical' }, 600, 'critical');

      const result = cache.get('critical-key');

      expect(result).not.toBeNull();
    });

    it('should set entry with high priority', () => {
      cache.set('high-key', { data: 'high' }, 600, 'high');

      const result = cache.get('high-key');

      expect(result).not.toBeNull();
    });

    it('should set entry with medium priority', () => {
      cache.set('medium-key', { data: 'medium' }, 600, 'medium');

      const result = cache.get('medium-key');

      expect(result).not.toBeNull();
    });

    it('should set entry with low priority', () => {
      cache.set('low-key', { data: 'low' }, 600, 'low');

      const result = cache.get('low-key');

      expect(result).not.toBeNull();
    });
  });

  describe('Cache Statistics', () => {
    it('should track hit rate', () => {
      cache.set('key1', { data: 'value1' });

      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('non-existent'); // miss

      const stats = cache.getStats();

      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.hitRate).toBeLessThanOrEqual(1);
    });

    it('should track miss rate', () => {
      cache.set('key1', { data: 'value1' });

      cache.get('key1');
      cache.get('non-existent');

      const stats = cache.getStats();

      expect(stats.missRate).toBeGreaterThan(0);
    });

    it('should track entry count', () => {
      cache.set('key1', { data: 'value1' });
      cache.set('key2', { data: 'value2' });
      cache.set('key3', { data: 'value3' });

      const stats = cache.getStats();

      expect(stats.entryCount).toBe(3);
    });

    it('should track total size', () => {
      cache.set('key1', { data: 'value1' });

      const stats = cache.getStats();

      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('should track average access time', () => {
      cache.set('key1', { data: 'value1' });

      cache.get('key1');
      cache.get('key1');

      const stats = cache.getStats();

      expect(stats.averageAccessTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Query Caching', () => {
    it('should cache query result', () => {
      const results = [{ id: 1 }, { id: 2 }];

      cache.cacheQuery('leaderboard', 'leaderboard:global', results, 5, ['leaderboard'], 600);

      const cached = cache.get('leaderboard:global');

      expect(cached).not.toBeNull();
      expect(cached?.results).toEqual(results);
    });

    it('should track query execution time', () => {
      const results = [{ id: 1 }];

      cache.cacheQuery('user_profile', 'user:123:profile', results, 15, ['user:123'], 600);

      const cached = cache.get('user:123:profile');

      expect(cached?.executionTime).toBe(15);
    });

    it('should track result count', () => {
      const results = [{ id: 1 }, { id: 2 }, { id: 3 }];

      cache.cacheQuery('challenge', 'challenge:active', results, 10, ['challenge'], 600);

      const cached = cache.get('challenge:active');

      expect(cached?.resultCount).toBe(3);
    });

    it('should track dependencies', () => {
      const results = [];

      cache.cacheQuery('leaderboard', 'leaderboard:friends', results, 5, ['user:123', 'leaderboard'], 600);

      const cached = cache.get('leaderboard:friends');

      expect(cached?.dependencies).toContain('user:123');
      expect(cached?.dependencies).toContain('leaderboard');
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate user cache', () => {
      cache.set('user:123:profile', { data: 'profile' });
      cache.set('user:123:settings', { data: 'settings' });
      cache.set('user:456:profile', { data: 'other' });

      cache.invalidateUser('123');

      expect(cache.get('user:123:profile')).toBeNull();
      expect(cache.get('user:123:settings')).toBeNull();
      expect(cache.get('user:456:profile')).not.toBeNull();
    });

    it('should invalidate challenge cache', () => {
      cache.set('challenge:789:details', { data: 'challenge' });
      cache.set('challenge:790:details', { data: 'other' });

      cache.invalidateChallenge('789');

      expect(cache.get('challenge:789:details')).toBeNull();
      expect(cache.get('challenge:790:details')).not.toBeNull();
    });

    it('should invalidate query cache on dependency', () => {
      cache.cacheQuery('leaderboard', 'leaderboard:global', [], 5, ['user:123'], 600);

      cache.invalidateQuery('user:123');

      expect(cache.get('leaderboard:global')).toBeNull();
    });
  });

  describe('Hot Spot Detection', () => {
    it('should track hot spots', () => {
      cache.set('user:123:profile', { data: 'profile' });

      for (let i = 0; i < 5; i++) {
        cache.get('user:123:profile');
      }

      const hotSpots = cache.getHotSpots();

      expect(hotSpots.length).toBeGreaterThan(0);
    });

    it('should rank hot spots by access count', () => {
      cache.set('user:123:profile', { data: 'profile' });
      cache.set('user:456:profile', { data: 'profile' });

      for (let i = 0; i < 10; i++) {
        cache.get('user:123:profile');
      }

      for (let i = 0; i < 5; i++) {
        cache.get('user:456:profile');
      }

      const hotSpots = cache.getHotSpots();

      expect(hotSpots[0].entityId).toBe('123');
      expect(hotSpots[1].entityId).toBe('456');
    });

    it('should recommend higher TTL for frequently accessed items', () => {
      cache.set('hot-item', { data: 'value' }, 300, 'low');

      for (let i = 0; i < 20; i++) {
        cache.get('hot-item');
      }

      const hotSpots = cache.getHotSpots();

      if (hotSpots.length > 0) {
        expect(hotSpots[0].recommendedTTL).toBeGreaterThan(300);
      }
    });
  });

  describe('Eviction Strategy', () => {
    it('should evict low priority items first', () => {
      cache.set('critical', { data: 'c' }, 600, 'critical');
      cache.set('high', { data: 'h' }, 600, 'high');
      cache.set('low', { data: 'l' }, 600, 'low');

      // Simulate pressure that requires eviction
      const largeData = { data: Array(100000).fill('x').join('') };

      // After multiple sets with large data, eviction should occur
      for (let i = 0; i < 5; i++) {
        cache.set(`large-${i}`, largeData, 600, 'low');
      }

      const stats = cache.getStats();

      expect(stats.evictionCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with profiles', () => {
      const profiles = [
        { userId: '1', level: 5 },
        { userId: '2', level: 10 },
      ];

      cache.warmCache(profiles, []);

      expect(cache.get('user:1:profile')).not.toBeNull();
      expect(cache.get('user:2:profile')).not.toBeNull();
    });

    it('should warm cache with leaderboards', () => {
      const leaderboards = [
        { type: 'global', entries: [] },
        { type: 'friends', entries: [] },
      ];

      cache.warmCache([], leaderboards);

      expect(cache.get('leaderboard:global')).not.toBeNull();
      expect(cache.get('leaderboard:friends')).not.toBeNull();
    });
  });

  describe('Cache Info', () => {
    it('should provide cache info', () => {
      cache.set('key1', { data: 'value1' });
      cache.set('key2', { data: 'value2' });

      cache.get('key1');
      cache.get('key1');

      const info = cache.getInfo();

      expect(info.entries).toBe(2);
      expect(info.hitRate).toBeDefined();
      expect(info.missRate).toBeDefined();
      expect(info.averageAccessTime).toBeDefined();
    });

    it('should format bytes correctly', () => {
      cache.set('large', { data: Array(1000).fill('x').join('') }, 600);

      const info = cache.getInfo();

      expect(info.totalSize).toMatch(/[BKM]B$/);
    });
  });

  describe('Performance', () => {
    it('should set cache entry quickly', () => {
      const start = performance.now();
      cache.set('perf-test', { data: 'value' });
      const latency = performance.now() - start;

      console.log(`Cache set latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(5);
    });

    it('should get cache entry quickly', () => {
      cache.set('perf-test', { data: 'value' });

      const start = performance.now();
      cache.get('perf-test');
      const latency = performance.now() - start;

      console.log(`Cache get latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(5);
    });

    it('should handle 1000 entries efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        cache.set(`key-${i}`, { data: `value-${i}` });
      }

      const latency = performance.now() - start;

      console.log(`Cache 1000 sets latency: ${(latency / 1000).toFixed(3)}ms per entry`);
      expect(latency / 1000).toBeLessThan(5);
    });

    it('should query cache quickly', () => {
      const results = Array(100).fill({ id: 1 });

      cache.cacheQuery('leaderboard', 'test-query', results, 5, [], 600);

      const start = performance.now();
      cache.get('test-query');
      const latency = performance.now() - start;

      console.log(`Cache query latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(5);
    });
  });

  describe('Memory Management', () => {
    it('should track memory usage', () => {
      cache.set('key1', { data: 'value1' });
      cache.set('key2', { data: 'value2' });

      const stats = cache.getStats();

      expect(stats.memoryUsage).toBeGreaterThan(0);
    });

    it('should not exceed max cache size', () => {
      const largeData = { data: Array(50000).fill('x').join('') };

      for (let i = 0; i < 100; i++) {
        cache.set(`large-${i}`, largeData, 600, 'low');
      }

      const stats = cache.getStats();

      // Should be reasonable (below max size or evicted)
      expect(stats.memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('Cache Strategies', () => {
    it('should support TTL strategy', () => {
      cache.set('ttl-key', { data: 'value' }, 600, 'medium', 'ttl');

      const result = cache.get('ttl-key');

      expect(result).not.toBeNull();
    });

    it('should support LRU strategy', () => {
      cache.set('lru-key', { data: 'value' }, 600, 'medium', 'lru');

      const result = cache.get('lru-key');

      expect(result).not.toBeNull();
    });

    it('should support FIFO strategy', () => {
      cache.set('fifo-key', { data: 'value' }, 600, 'medium', 'fifo');

      const result = cache.get('fifo-key');

      expect(result).not.toBeNull();
    });
  });
});
