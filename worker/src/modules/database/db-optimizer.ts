/**
 * Database Optimizer
 * Indexing strategy, partitioning, and query optimization
 */

export type IndexType = 'btree' | 'hash' | 'compound' | 'fulltext';
export type PartitionStrategy = 'range' | 'hash' | 'list' | 'time';

export interface IndexDefinition {
  indexId: string;
  name: string;
  table: string;
  columns: string[];
  type: IndexType;
  unique: boolean;
  sparse: boolean;
  createdAt: number;
  estimatedSize: number; // bytes
  cardinality: number; // distinct values
  selectivity: number; // 0-1
}

export interface PartitionDefinition {
  partitionId: string;
  table: string;
  column: string;
  strategy: PartitionStrategy;
  partitions: Partition[];
  createdAt: number;
}

export interface Partition {
  name: string;
  range?: { min: number | string; max: number | string };
  hash?: number;
  list?: (number | string)[];
  rowCount: number;
  size: number; // bytes
}

export interface QueryPlan {
  queryId: string;
  query: string;
  executionTime: number; // ms
  estimatedRows: number;
  actualRows: number;
  indexUsed: string[];
  partitionUsed: string[];
  scanType: 'index_scan' | 'table_scan' | 'partition_scan';
  efficiency: number; // 0-1, estimated/actual ratio
  recommendations: string[];
}

export interface TableStatistics {
  tableName: string;
  rowCount: number;
  columnCount: number;
  size: number; // bytes
  indexes: number;
  partitions: number;
  lastAnalyzed: number;
  avgRowSize: number;
  vacuumNeeded: boolean;
  fragmentationRatio: number; // 0-1
}

export interface OptimizationRecommendation {
  type: 'index' | 'partition' | 'vacuum' | 'analyze' | 'denormalize';
  priority: 'critical' | 'high' | 'medium' | 'low';
  table: string;
  description: string;
  expectedImprovement: number; // % performance gain
  estimatedCost: number; // relative cost to implement
  implementation: string;
}

/**
 * Database Optimizer
 */
export class DatabaseOptimizer {
  private indexes: Map<string, IndexDefinition> = new Map();
  private partitions: Map<string, PartitionDefinition> = new Map();
  private queryPlans: QueryPlan[] = [];
  private tableStats: Map<string, TableStatistics> = new Map();
  private recommendations: OptimizationRecommendation[] = [];

  private recommendedIndexes = [
    // Users table
    {
      table: 'users',
      columns: ['user_id'],
      type: 'hash' as IndexType,
      unique: true,
      priority: 'critical',
    },
    {
      table: 'users',
      columns: ['email'],
      type: 'hash' as IndexType,
      unique: true,
      priority: 'critical',
    },
    {
      table: 'users',
      columns: ['username'],
      type: 'hash' as IndexType,
      unique: true,
      priority: 'high',
    },
    // Sessions table
    {
      table: 'sessions',
      columns: ['user_id', 'created_at'],
      type: 'btree' as IndexType,
      unique: false,
      priority: 'high',
    },
    {
      table: 'sessions',
      columns: ['session_id'],
      type: 'hash' as IndexType,
      unique: true,
      priority: 'critical',
    },
    // Focus Analytics table
    {
      table: 'focus_analytics',
      columns: ['user_id', 'timestamp'],
      type: 'btree' as IndexType,
      unique: false,
      priority: 'high',
    },
    // Challenges table
    {
      table: 'challenges',
      columns: ['challenge_id'],
      type: 'hash' as IndexType,
      unique: true,
      priority: 'critical',
    },
    {
      table: 'challenges',
      columns: ['creator_id', 'status'],
      type: 'btree' as IndexType,
      unique: false,
      priority: 'high',
    },
    // Journal Entries table
    {
      table: 'journal_entries',
      columns: ['user_id', 'created_at'],
      type: 'btree' as IndexType,
      unique: false,
      priority: 'high',
    },
    // Leaderboards (virtual/computed)
    {
      table: 'user_profiles',
      columns: ['total_points'],
      type: 'btree' as IndexType,
      unique: false,
      priority: 'high',
    },
  ];

  /**
   * Create index
   */
  createIndex(
    table: string,
    columns: string[],
    type: IndexType = 'btree',
    unique: boolean = false,
    sparse: boolean = false
  ): IndexDefinition {
    const indexId = `idx_${table}_${columns.join('_')}_${Date.now()}`;

    // Calculate selectivity (for optimization scoring)
    const selectivity = this.calculateSelectivity(table, columns);

    // Estimate index size
    const estimatedSize = this.estimateIndexSize(table, columns, type);

    const index: IndexDefinition = {
      indexId,
      name: `idx_${table}_${columns.join('_')}`,
      table,
      columns,
      type,
      unique,
      sparse,
      createdAt: Date.now(),
      estimatedSize,
      cardinality: Math.floor(100 * selectivity), // Rough estimate
      selectivity,
    };

    this.indexes.set(indexId, index);

    // Generate recommendation for index
    this.generateIndexRecommendation(index);

    return index;
  }

  /**
   * Create partition
   */
  createPartition(
    table: string,
    column: string,
    strategy: PartitionStrategy,
    config: any
  ): PartitionDefinition {
    const partitionId = `part_${table}_${column}_${Date.now()}`;

    const partitions: Partition[] = [];

    if (strategy === 'range') {
      // Create range partitions
      for (let i = 0; i < config.ranges.length - 1; i++) {
        partitions.push({
          name: `${table}_${config.ranges[i]}_${config.ranges[i + 1]}`,
          range: { min: config.ranges[i], max: config.ranges[i + 1] },
          rowCount: 0,
          size: 0,
        });
      }
    } else if (strategy === 'hash') {
      // Create hash partitions
      for (let i = 0; i < config.buckets; i++) {
        partitions.push({
          name: `${table}_hash_${i}`,
          hash: i,
          rowCount: 0,
          size: 0,
        });
      }
    } else if (strategy === 'list') {
      // Create list partitions
      for (const value of config.values) {
        partitions.push({
          name: `${table}_${value}`,
          list: [value],
          rowCount: 0,
          size: 0,
        });
      }
    } else if (strategy === 'time') {
      // Create time-based partitions
      const now = Date.now();
      const periods = ['current_month', 'last_3_months', 'last_year', 'archive'];

      for (const period of periods) {
        partitions.push({
          name: `${table}_${period}`,
          rowCount: 0,
          size: 0,
        });
      }
    }

    const partition: PartitionDefinition = {
      partitionId,
      table,
      column,
      strategy,
      partitions,
      createdAt: Date.now(),
    };

    this.partitions.set(partitionId, partition);

    return partition;
  }

  /**
   * Analyze query execution
   */
  analyzeQuery(
    queryId: string,
    query: string,
    executionTime: number,
    estimatedRows: number,
    actualRows: number
  ): QueryPlan {
    // Determine which indexes could be used
    const indexUsed = this.determineIndexesUsed(query);

    // Determine scan type
    let scanType: QueryPlan['scanType'] = 'table_scan';
    if (indexUsed.length > 0) {
      scanType = 'index_scan';
    }

    // Check partition usage
    const partitionUsed = this.determinePartitionsUsed(query);

    // Calculate efficiency
    const efficiency = estimatedRows > 0 ? actualRows / estimatedRows : 0;

    // Generate recommendations
    const recommendations = this.generateQueryRecommendations(query, efficiency, scanType, indexUsed);

    const queryPlan: QueryPlan = {
      queryId,
      query,
      executionTime,
      estimatedRows,
      actualRows,
      indexUsed,
      partitionUsed,
      scanType,
      efficiency,
      recommendations,
    };

    this.queryPlans.push(queryPlan);

    // Keep last 1000 query plans
    if (this.queryPlans.length > 1000) {
      this.queryPlans.shift();
    }

    return queryPlan;
  }

  /**
   * Analyze table statistics
   */
  analyzeTable(
    tableName: string,
    rowCount: number,
    columnCount: number,
    size: number,
    indexCount: number,
    fragmentationRatio: number = 0
  ): TableStatistics {
    const stats: TableStatistics = {
      tableName,
      rowCount,
      columnCount,
      size,
      indexes: indexCount,
      partitions: this.getPartitionsForTable(tableName).length,
      lastAnalyzed: Date.now(),
      avgRowSize: rowCount > 0 ? Math.round(size / rowCount) : 0,
      vacuumNeeded: fragmentationRatio > 0.2,
      fragmentationRatio,
    };

    this.tableStats.set(tableName, stats);

    // Generate recommendations
    this.generateTableRecommendations(tableName, stats);

    return stats;
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(priority?: OptimizationRecommendation['priority']): OptimizationRecommendation[] {
    let recs = this.recommendations;

    if (priority) {
      recs = recs.filter(r => r.priority === priority);
    }

    return recs.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get slow queries
   */
  getSlowQueries(threshold: number = 100): QueryPlan[] {
    return this.queryPlans
      .filter(q => q.executionTime > threshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 20);
  }

  /**
   * Get index statistics
   */
  getIndexStats(): Record<string, any> {
    const totalSize = Array.from(this.indexes.values()).reduce((sum, idx) => sum + idx.estimatedSize, 0);
    const uniqueIndexes = Array.from(this.indexes.values()).filter(idx => idx.unique).length;
    const compoundIndexes = Array.from(this.indexes.values()).filter(idx => idx.columns.length > 1).length;

    return {
      totalIndexes: this.indexes.size,
      totalSize,
      uniqueIndexes,
      compoundIndexes,
      avgSelectivity: Array.from(this.indexes.values()).reduce((sum, idx) => sum + idx.selectivity, 0) / this.indexes.size,
    };
  }

  /**
   * Get partition statistics
   */
  getPartitionStats(): Record<string, any> {
    const totalPartitions = Array.from(this.partitions.values()).reduce((sum, p) => sum + p.partitions.length, 0);
    const strategies = new Set(Array.from(this.partitions.values()).map(p => p.strategy));

    return {
      totalPartitionDefinitions: this.partitions.size,
      totalPartitions,
      strategies: Array.from(strategies),
      partitionsByStrategy: this.getPartitionsByStrategy(),
    };
  }

  /**
   * Get database health score
   */
  getDatabaseHealthScore(): number {
    let score = 100;

    // Check for adequate indexes
    if (this.indexes.size < 5) {
      score -= 20;
    }

    // Check query efficiency
    const slowerQueries = this.queryPlans.filter(q => q.efficiency < 0.7).length;
    const slowQueryPenalty = Math.min(20, (slowerQueries / Math.max(1, this.queryPlans.length)) * 20);
    score -= slowQueryPenalty;

    // Check fragmentation
    for (const stats of this.tableStats.values()) {
      if (stats.fragmentationRatio > 0.3) {
        score -= 5;
      }
    }

    // Check table analysis freshness
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    for (const stats of this.tableStats.values()) {
      if (now - stats.lastAnalyzed > 7 * dayMs) {
        score -= 5;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Vacuum and analyze recommendation
   */
  recommendMaintenance(): OptimizationRecommendation[] {
    const maintenance: OptimizationRecommendation[] = [];

    // Vacuum recommendations
    for (const [tableName, stats] of this.tableStats.entries()) {
      if (stats.vacuumNeeded) {
        maintenance.push({
          type: 'vacuum',
          priority: 'high',
          table: tableName,
          description: `Vacuum ${tableName} to recover ${Math.round(stats.size * stats.fragmentationRatio / 1024)}KB`,
          expectedImprovement: stats.fragmentationRatio * 100,
          estimatedCost: 2,
          implementation: `VACUUM ANALYZE ${tableName}`,
        });
      }

      // Analyze recommendations
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      if (now - stats.lastAnalyzed > 7 * dayMs) {
        maintenance.push({
          type: 'analyze',
          priority: 'medium',
          table: tableName,
          description: `Analyze ${tableName} to update statistics`,
          expectedImprovement: 10,
          estimatedCost: 1,
          implementation: `ANALYZE ${tableName}`,
        });
      }
    }

    return maintenance;
  }

  // Private helper methods

  private calculateSelectivity(table: string, columns: string[]): number {
    // In real implementation, would query actual data
    // For now, return estimate based on column type
    if (columns.length === 1) {
      return 0.8; // Most columns have good selectivity
    }
    return Math.max(0.1, 1 - columns.length * 0.1); // Compound indexes less selective
  }

  private estimateIndexSize(table: string, columns: string[], type: IndexType): number {
    // Rough estimation: 100 bytes per index entry + structure
    const baseSize = 100 + columns.length * 50;
    const typeMultiplier: Record<IndexType, number> = {
      btree: 1.2,
      hash: 1.0,
      compound: 1.5,
      fulltext: 2.0,
    };

    return Math.round(baseSize * typeMultiplier[type] * 1000); // Estimated for typical table
  }

  private determineIndexesUsed(query: string): string[] {
    const usedIndexes: string[] = [];

    // Analyze query to find which indexes could be used
    for (const [, index] of this.indexes) {
      // Check if any index column is mentioned in WHERE clause
      for (const col of index.columns) {
        if (query.toLowerCase().includes(`where ${col}`) || query.toLowerCase().includes(`${col} =`)) {
          usedIndexes.push(index.indexId);
          break;
        }
      }
    }

    return usedIndexes;
  }

  private determinePartitionsUsed(query: string): string[] {
    const usedPartitions: string[] = [];

    // Analyze query to find partition usage
    for (const [, partition] of this.partitions) {
      if (query.toLowerCase().includes(partition.column)) {
        usedPartitions.push(partition.partitionId);
      }
    }

    return usedPartitions;
  }

  private generateQueryRecommendations(
    query: string,
    efficiency: number,
    scanType: string,
    indexUsed: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (efficiency < 0.5) {
      recommendations.push('Consider creating an index for frequently filtered columns');
    }

    if (scanType === 'table_scan') {
      recommendations.push('Full table scan detected - add index on WHERE clause columns');
    }

    if (indexUsed.length === 0 && query.toLowerCase().includes('where')) {
      recommendations.push('No indexes used - create index on query columns');
    }

    if (query.toLowerCase().includes('order by') && indexUsed.length === 0) {
      recommendations.push('Add index on ORDER BY columns for faster sorting');
    }

    return recommendations;
  }

  private generateIndexRecommendation(index: IndexDefinition): void {
    this.recommendations.push({
      type: 'index',
      priority: 'high',
      table: index.table,
      description: `Create ${index.type} index on ${index.table}(${index.columns.join(',')})`,
      expectedImprovement: (index.selectivity * 100) / 2,
      estimatedCost: 1 + index.columns.length * 0.5,
      implementation: `CREATE ${index.unique ? 'UNIQUE' : ''} INDEX ${index.name} ON ${index.table}(${index.columns.join(',')})`,
    });
  }

  private generateTableRecommendations(tableName: string, stats: TableStatistics): void {
    // Vacuum recommendation
    if (stats.vacuumNeeded) {
      this.recommendations.push({
        type: 'vacuum',
        priority: 'high',
        table: tableName,
        description: `Table fragmentation at ${(stats.fragmentationRatio * 100).toFixed(1)}%`,
        expectedImprovement: stats.fragmentationRatio * 100,
        estimatedCost: 2,
        implementation: `VACUUM ANALYZE ${tableName}`,
      });
    }

    // Partitioning recommendation
    if (stats.rowCount > 1000000) {
      this.recommendations.push({
        type: 'partition',
        priority: 'medium',
        table: tableName,
        description: `Consider partitioning ${tableName} (${stats.rowCount} rows)`,
        expectedImprovement: 25,
        estimatedCost: 3,
        implementation: `Partition by range or time on high-cardinality column`,
      });
    }
  }

  private getPartitionsForTable(tableName: string): PartitionDefinition[] {
    return Array.from(this.partitions.values()).filter(p => p.table === tableName);
  }

  private getPartitionsByStrategy(): Record<string, number> {
    const result: Record<string, number> = {};

    for (const partition of this.partitions.values()) {
      result[partition.strategy] = (result[partition.strategy] || 0) + partition.partitions.length;
    }

    return result;
  }
}

/**
 * Create database optimizer instance
 */
export function createDatabaseOptimizer(): DatabaseOptimizer {
  return new DatabaseOptimizer();
}
