/**
 * Performance Monitor Module
 * Tracks and reports on system performance metrics
 */

export interface PerformanceMetrics {
  timestamp: number;
  eegProcessingLatency: number; // ms
  cloudSyncLatency: number; // ms
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  samplingRate: number; // Hz
  droppedSamples: number;
  queueSize: number;
  uptime: number; // seconds
}

export interface LatencyBucket {
  min: number;
  max: number;
  count: number;
}

export interface PerformanceReport {
  averageEEGLatency: number;
  p50EEGLatency: number;
  p95EEGLatency: number;
  p99EEGLatency: number;
  maxEEGLatency: number;

  averageCloudLatency: number;
  p50CloudLatency: number;
  p95CloudLatency: number;

  averageMemory: number;
  peakMemory: number;
  averageCPU: number;

  samplesProcessed: number;
  droppedSamples: number;
  dropRate: number; // percentage

  uptime: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private eegLatencies: number[] = [];
  private cloudLatencies: number[] = [];
  private memoryReadings: number[] = [];
  private cpuReadings: number[] = [];
  private samplesProcessed: number = 0;
  private droppedSamples: number = 0;
  private startTime: number = Date.now();
  private maxHistorySize: number = 10000; // Keep last 10k metrics

  // Performance budgets (targets)
  readonly budgets = {
    eegProcessingLatency: 20, // ms
    cloudSyncLatency: 500, // ms
    maxMemoryUsage: 200, // MB
    maxCPUUsage: 80, // percentage
    maxDropRate: 1, // percentage
  };

  /**
   * Record EEG processing latency
   */
  recordEEGLatency(latency: number): void {
    this.eegLatencies.push(latency);
    if (this.eegLatencies.length > this.maxHistorySize) {
      this.eegLatencies.shift();
    }
  }

  /**
   * Record cloud sync latency
   */
  recordCloudLatency(latency: number): void {
    this.cloudLatencies.push(latency);
    if (this.cloudLatencies.length > this.maxHistorySize) {
      this.cloudLatencies.shift();
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(usage: number): void {
    this.memoryReadings.push(usage);
    if (this.memoryReadings.length > 1000) {
      this.memoryReadings.shift();
    }
  }

  /**
   * Record CPU usage
   */
  recordCPUUsage(usage: number): void {
    this.cpuReadings.push(usage);
    if (this.cpuReadings.length > 1000) {
      this.cpuReadings.shift();
    }
  }

  /**
   * Record sample processed
   */
  recordSampleProcessed(): void {
    this.samplesProcessed++;
  }

  /**
   * Record dropped sample
   */
  recordDroppedSample(): void {
    this.droppedSamples++;
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      timestamp: Date.now(),
      eegProcessingLatency: this.eegLatencies.length > 0 ? this.eegLatencies[this.eegLatencies.length - 1] : 0,
      cloudSyncLatency: this.cloudLatencies.length > 0 ? this.cloudLatencies[this.cloudLatencies.length - 1] : 0,
      memoryUsage: this.memoryReadings.length > 0 ? this.memoryReadings[this.memoryReadings.length - 1] : 0,
      cpuUsage: this.cpuReadings.length > 0 ? this.cpuReadings[this.cpuReadings.length - 1] : 0,
      samplingRate: this.calculateSamplingRate(),
      droppedSamples: this.droppedSamples,
      queueSize: 0, // Would be updated by queue manager
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    return {
      averageEEGLatency: this.calculateAverage(this.eegLatencies),
      p50EEGLatency: this.calculatePercentile(this.eegLatencies, 50),
      p95EEGLatency: this.calculatePercentile(this.eegLatencies, 95),
      p99EEGLatency: this.calculatePercentile(this.eegLatencies, 99),
      maxEEGLatency: Math.max(...this.eegLatencies, 0),

      averageCloudLatency: this.calculateAverage(this.cloudLatencies),
      p50CloudLatency: this.calculatePercentile(this.cloudLatencies, 50),
      p95CloudLatency: this.calculatePercentile(this.cloudLatencies, 95),

      averageMemory: this.calculateAverage(this.memoryReadings),
      peakMemory: Math.max(...this.memoryReadings, 0),
      averageCPU: this.calculateAverage(this.cpuReadings),

      samplesProcessed: this.samplesProcessed,
      droppedSamples: this.droppedSamples,
      dropRate: this.calculateDropRate(),

      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: Date.now(),
    };
  }

  /**
   * Check if performance meets budgets
   */
  checkPerformanceBudgets(): { met: boolean; violations: string[] } {
    const violations: string[] = [];
    const report = this.generateReport();

    if (report.averageEEGLatency > this.budgets.eegProcessingLatency) {
      violations.push(`EEG latency ${report.averageEEGLatency.toFixed(2)}ms exceeds budget ${this.budgets.eegProcessingLatency}ms`);
    }

    if (report.averageCloudLatency > this.budgets.cloudSyncLatency) {
      violations.push(`Cloud latency ${report.averageCloudLatency.toFixed(2)}ms exceeds budget ${this.budgets.cloudSyncLatency}ms`);
    }

    if (report.peakMemory > this.budgets.maxMemoryUsage) {
      violations.push(`Peak memory ${report.peakMemory.toFixed(2)}MB exceeds budget ${this.budgets.maxMemoryUsage}MB`);
    }

    if (report.averageCPU > this.budgets.maxCPUUsage) {
      violations.push(`CPU usage ${report.averageCPU.toFixed(2)}% exceeds budget ${this.budgets.maxCPUUsage}%`);
    }

    if (report.dropRate > this.budgets.maxDropRate) {
      violations.push(`Drop rate ${report.dropRate.toFixed(2)}% exceeds budget ${this.budgets.maxDropRate}%`);
    }

    return {
      met: violations.length === 0,
      violations,
    };
  }

  /**
   * Get performance health status
   */
  getHealthStatus(): 'excellent' | 'good' | 'fair' | 'poor' {
    const report = this.generateReport();

    if (
      report.averageEEGLatency < 10 &&
      report.averageCloudLatency < 200 &&
      report.peakMemory < 100 &&
      report.dropRate < 0.1
    ) {
      return 'excellent';
    }

    if (
      report.averageEEGLatency < 15 &&
      report.averageCloudLatency < 400 &&
      report.peakMemory < 150 &&
      report.dropRate < 0.5
    ) {
      return 'good';
    }

    if (
      report.averageEEGLatency < 20 &&
      report.averageCloudLatency < 500 &&
      report.peakMemory < 180 &&
      report.dropRate < 1
    ) {
      return 'fair';
    }

    return 'poor';
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    this.eegLatencies = [];
    this.cloudLatencies = [];
    this.memoryReadings = [];
    this.cpuReadings = [];
    this.samplesProcessed = 0;
    this.droppedSamples = 0;
    this.startTime = Date.now();
  }

  // ============ PRIVATE HELPER METHODS ============

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateDropRate(): number {
    const total = this.samplesProcessed + this.droppedSamples;
    if (total === 0) return 0;
    return (this.droppedSamples / total) * 100;
  }

  private calculateSamplingRate(): number {
    const elapsed = (Date.now() - this.startTime) / 1000; // seconds
    if (elapsed === 0) return 0;
    return this.samplesProcessed / elapsed;
  }

  /**
   * Create performance histogram for visualization
   */
  getLatencyHistogram(bucketSize: number = 5): LatencyBucket[] {
    const buckets: Map<number, number> = new Map();

    for (const latency of this.eegLatencies) {
      const bucketKey = Math.floor(latency / bucketSize) * bucketSize;
      buckets.set(bucketKey, (buckets.get(bucketKey) ?? 0) + 1);
    }

    const result: LatencyBucket[] = [];
    for (const [key, count] of buckets) {
      result.push({
        min: key,
        max: key + bucketSize,
        count,
      });
    }

    return result.sort((a, b) => a.min - b.min);
  }
}

/**
 * Create performance monitor instance
 */
export function createPerformanceMonitor(): PerformanceMonitor {
  return new PerformanceMonitor();
}
