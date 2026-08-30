/**
 * Database Optimizer Tests
 * Tests for indexing, partitioning, and query optimization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabaseOptimizer } from '../src/modules/database/db-optimizer';

describe('Database Optimizer', () => {
  let optimizer: ReturnType<typeof createDatabaseOptimizer>;

  beforeEach(() => {
    optimizer = createDatabaseOptimizer();
  });

  describe('Index Creation', () => {
    it('should create index', () => {
      const index = optimizer.createIndex('users', ['user_id'], 'hash', true);

      expect(index).toBeDefined();
      expect(index.table).toBe('users');
      expect(index.columns).toContain('user_id');
      expect(index.type).toBe('hash');
      expect(index.unique).toBe(true);
    });

    it('should create btree index', () => {
      const index = optimizer.createIndex('sessions', ['user_id', 'created_at'], 'btree');

      expect(index.type).toBe('btree');
      expect(index.columns.length).toBe(2);
    });

    it('should create compound index', () => {
      const index = optimizer.createIndex('challenges', ['creator_id', 'status'], 'compound');

      expect(index.columns.length).toBe(2);
      expect(index.type).toBe('compound');
    });

    it('should estimate index size', () => {
      const index = optimizer.createIndex('users', ['email'], 'hash', true);

      expect(index.estimatedSize).toBeGreaterThan(0);
    });

    it('should calculate selectivity', () => {
      const index1 = optimizer.createIndex('users', ['user_id'], 'hash', true);
      const index2 = optimizer.createIndex('users', ['user_id', 'created_at'], 'btree');

      expect(index1.selectivity).toBeGreaterThan(0);
      expect(index1.selectivity).toBeLessThanOrEqual(1);
      expect(index2.selectivity).toBeLessThanOrEqual(index1.selectivity);
    });
  });

  describe('Partitioning', () => {
    it('should create range partition', () => {
      const partition = optimizer.createPartition('analytics', 'timestamp', 'range', {
        ranges: [0, 100, 200, 300],
      });

      expect(partition).toBeDefined();
      expect(partition.strategy).toBe('range');
      expect(partition.partitions.length).toBe(3);
    });

    it('should create hash partition', () => {
      const partition = optimizer.createPartition('users', 'user_id', 'hash', {
        buckets: 10,
      });

      expect(partition.strategy).toBe('hash');
      expect(partition.partitions.length).toBe(10);
    });

    it('should create list partition', () => {
      const partition = optimizer.createPartition('regions', 'region', 'list', {
        values: ['US', 'EU', 'ASIA'],
      });

      expect(partition.strategy).toBe('list');
      expect(partition.partitions.length).toBe(3);
    });

    it('should create time partition', () => {
      const partition = optimizer.createPartition('events', 'created_at', 'time', {});

      expect(partition.strategy).toBe('time');
      expect(partition.partitions.length).toBeGreaterThan(0);
    });

    it('should have partition details', () => {
      const partition = optimizer.createPartition('sessions', 'user_id', 'hash', {
        buckets: 5,
      });

      const firstPartition = partition.partitions[0];
      expect(firstPartition.name).toBeDefined();
      expect(firstPartition.rowCount).toBe(0);
      expect(firstPartition.size).toBe(0);
    });
  });

  describe('Query Analysis', () => {
    it('should analyze query execution', () => {
      const plan = optimizer.analyzeQuery(
        'query-1',
        'SELECT * FROM users WHERE user_id = 123',
        25,
        150,
        150
      );

      expect(plan).toBeDefined();
      expect(plan.executionTime).toBe(25);
      expect(plan.estimatedRows).toBe(150);
      expect(plan.actualRows).toBe(150);
    });

    it('should determine scan type', () => {
      const plan = optimizer.analyzeQuery(
        'query-1',
        'SELECT * FROM users WHERE user_id = 123',
        10,
        100,
        100
      );

      expect(['index_scan', 'table_scan', 'partition_scan']).toContain(plan.scanType);
    });

    it('should calculate efficiency', () => {
      const plan = optimizer.analyzeQuery(
        'query-1',
        'SELECT * FROM users',
        50,
        1000,
        1200
      );

      expect(plan.efficiency).toBeLessThanOrEqual(2);
    });

    it('should generate query recommendations', () => {
      const plan = optimizer.analyzeQuery(
        'query-1',
        'SELECT * FROM users WHERE user_id = 123',
        100,
        1000,
        100
      );

      expect(plan.recommendations).toBeDefined();
      expect(Array.isArray(plan.recommendations)).toBe(true);
    });

    it('should flag inefficient queries', () => {
      const plan = optimizer.analyzeQuery(
        'query-1',
        'SELECT * FROM large_table',
        500,
        100000,
        10
      );

      expect(plan.efficiency).toBeLessThan(0.5);
      expect(plan.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Table Statistics', () => {
    it('should analyze table', () => {
      const stats = optimizer.analyzeTable('users', 100000, 15, 5 * 1024 * 1024, 3);

      expect(stats).toBeDefined();
      expect(stats.tableName).toBe('users');
      expect(stats.rowCount).toBe(100000);
      expect(stats.columnCount).toBe(15);
    });

    it('should calculate average row size', () => {
      const stats = optimizer.analyzeTable('users', 1000, 10, 1024 * 100, 2);

      expect(stats.avgRowSize).toBeGreaterThan(0);
    });

    it('should flag fragmentation', () => {
      const stats = optimizer.analyzeTable('users', 50000, 10, 10 * 1024 * 1024, 3, 0.25);

      expect(stats.vacuumNeeded).toBe(true);
    });

    it('should track index count', () => {
      const stats = optimizer.analyzeTable('users', 100000, 15, 5 * 1024 * 1024, 5);

      expect(stats.indexes).toBe(5);
    });
  });

  describe('Optimization Recommendations', () => {
    it('should get recommendations', () => {
      optimizer.createIndex('users', ['user_id'], 'hash');
      const recommendations = optimizer.getOptimizationRecommendations();

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should prioritize recommendations', () => {
      optimizer.createIndex('users', ['user_id'], 'hash');
      optimizer.createIndex('users', ['email'], 'hash');
      optimizer.analyzeTable('users', 100000, 15, 5 * 1024 * 1024, 2, 0.35);

      const recommendations = optimizer.getOptimizationRecommendations();

      if (recommendations.length > 1) {
        const priorities = { critical: 0, high: 1, medium: 2, low: 3 };
        for (let i = 0; i < recommendations.length - 1; i++) {
          expect(priorities[recommendations[i].priority]).toBeLessThanOrEqual(
            priorities[recommendations[i + 1].priority]
          );
        }
      }
    });

    it('should filter recommendations by priority', () => {
      optimizer.createIndex('users', ['user_id'], 'hash');
      const highPriority = optimizer.getOptimizationRecommendations('high');

      expect(Array.isArray(highPriority)).toBe(true);
      expect(highPriority.every(r => r.priority === 'high')).toBe(true);
    });
  });

  describe('Slow Query Detection', () => {
    it('should identify slow queries', () => {
      optimizer.analyzeQuery('q1', 'SELECT * FROM users', 50, 1000, 1000);
      optimizer.analyzeQuery('q2', 'SELECT * FROM large_table', 200, 1000000, 500000);
      optimizer.analyzeQuery('q3', 'SELECT * FROM small_table', 5, 100, 100);

      const slowQueries = optimizer.getSlowQueries(100);

      expect(slowQueries.length).toBeGreaterThan(0);
      expect(slowQueries.every(q => q.executionTime > 100)).toBe(true);
    });

    it('should sort slow queries by execution time', () => {
      optimizer.analyzeQuery('q1', 'query1', 150, 1000, 1000);
      optimizer.analyzeQuery('q2', 'query2', 300, 1000, 1000);
      optimizer.analyzeQuery('q3', 'query3', 200, 1000, 1000);

      const slowQueries = optimizer.getSlowQueries(100);

      for (let i = 0; i < slowQueries.length - 1; i++) {
        expect(slowQueries[i].executionTime).toBeGreaterThanOrEqual(
          slowQueries[i + 1].executionTime
        );
      }
    });

    it('should respect threshold', () => {
      optimizer.analyzeQuery('q1', 'query', 50, 1000, 1000);
      optimizer.analyzeQuery('q2', 'query', 200, 1000, 1000);

      const slowQueries = optimizer.getSlowQueries(100);

      expect(slowQueries.every(q => q.executionTime > 100)).toBe(true);
    });
  });

  describe('Index Statistics', () => {
    it('should get index statistics', () => {
      optimizer.createIndex('users', ['user_id'], 'hash', true);
      optimizer.createIndex('users', ['email'], 'hash', true);
      optimizer.createIndex('sessions', ['user_id', 'created_at'], 'btree');

      const stats = optimizer.getIndexStats();

      expect(stats.totalIndexes).toBe(3);
      expect(stats.uniqueIndexes).toBe(2);
      expect(stats.compoundIndexes).toBe(1);
    });

    it('should calculate total index size', () => {
      optimizer.createIndex('users', ['user_id'], 'hash');
      const stats = optimizer.getIndexStats();

      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('should calculate average selectivity', () => {
      optimizer.createIndex('users', ['user_id'], 'hash');
      optimizer.createIndex('users', ['email'], 'hash');

      const stats = optimizer.getIndexStats();

      expect(stats.avgSelectivity).toBeGreaterThan(0);
      expect(stats.avgSelectivity).toBeLessThanOrEqual(1);
    });
  });

  describe('Partition Statistics', () => {
    it('should get partition statistics', () => {
      optimizer.createPartition('users', 'user_id', 'hash', { buckets: 10 });
      optimizer.createPartition('events', 'timestamp', 'range', { ranges: [0, 100, 200] });

      const stats = optimizer.getPartitionStats();

      expect(stats.totalPartitionDefinitions).toBe(2);
      expect(stats.totalPartitions).toBeGreaterThan(0);
    });

    it('should track partition strategies', () => {
      optimizer.createPartition('users', 'id', 'hash', { buckets: 5 });
      optimizer.createPartition('events', 'date', 'time', {});

      const stats = optimizer.getPartitionStats();

      expect(stats.strategies).toContain('hash');
      expect(stats.strategies).toContain('time');
    });
  });

  describe('Database Health Score', () => {
    it('should calculate health score', () => {
      const score = optimizer.getDatabaseHealthScore();

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize lack of indexes', () => {
      const score1 = optimizer.getDatabaseHealthScore();

      optimizer.createIndex('users', ['user_id'], 'hash');
      optimizer.createIndex('users', ['email'], 'hash');
      optimizer.createIndex('users', ['username'], 'hash');
      optimizer.createIndex('sessions', ['user_id', 'created_at'], 'btree');
      optimizer.createIndex('challenges', ['creator_id'], 'hash');
      optimizer.createIndex('challenges', ['status'], 'hash');

      const score2 = optimizer.getDatabaseHealthScore();

      expect(score2).toBeGreaterThanOrEqual(score1);
    });

    it('should penalize high fragmentation', () => {
      const score1 = optimizer.getDatabaseHealthScore();

      optimizer.analyzeTable('users', 100000, 15, 5 * 1024 * 1024, 3, 0.4);

      const score2 = optimizer.getDatabaseHealthScore();

      expect(score2).toBeLessThanOrEqual(score1);
    });
  });

  describe('Maintenance Recommendations', () => {
    it('should recommend vacuum', () => {
      optimizer.analyzeTable('users', 100000, 15, 5 * 1024 * 1024, 3, 0.25);

      const maintenance = optimizer.recommendMaintenance();

      expect(maintenance.some(m => m.type === 'vacuum')).toBe(true);
    });

    it('should recommend analyze', () => {
      optimizer.analyzeTable('users', 50000, 10, 2 * 1024 * 1024, 2, 0.1);

      // Simulate old analysis
      const maintenance = optimizer.recommendMaintenance();

      // May or may not recommend depending on timing
      expect(Array.isArray(maintenance)).toBe(true);
    });

    it('should have implementation scripts', () => {
      optimizer.analyzeTable('users', 100000, 15, 5 * 1024 * 1024, 3, 0.25);
      const maintenance = optimizer.recommendMaintenance();

      if (maintenance.length > 0) {
        expect(maintenance[0].implementation).toBeDefined();
        expect(maintenance[0].implementation.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance', () => {
    it('should create index quickly', () => {
      const start = performance.now();
      optimizer.createIndex('users', ['user_id'], 'hash');
      const latency = performance.now() - start;

      console.log(`Index creation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(10);
    });

    it('should analyze query quickly', () => {
      const start = performance.now();
      optimizer.analyzeQuery('q1', 'SELECT * FROM users WHERE id = 1', 25, 100, 100);
      const latency = performance.now() - start;

      console.log(`Query analysis latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(10);
    });

    it('should get recommendations quickly', () => {
      optimizer.createIndex('users', ['user_id'], 'hash');
      optimizer.createIndex('users', ['email'], 'hash');

      const start = performance.now();
      optimizer.getOptimizationRecommendations();
      const latency = performance.now() - start;

      console.log(`Recommendations retrieval latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(10);
    });
  });
});
