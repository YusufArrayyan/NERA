/**
 * Metrics Exporter Module
 * Exports metrics in standard formats (Prometheus, StatsD, etc)
 */

import { PerformanceMonitor, PerformanceReport } from './performance-monitor';

export interface MetricPoint {
  name: string;
  value: number;
  unit?: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PrometheusMetric {
  name: string;
  type: 'gauge' | 'counter' | 'histogram' | 'summary';
  help: string;
  metrics: Array<{
    labels: Record<string, string>;
    value: number;
  }>;
}

export class MetricsExporter {
  constructor(private monitor: PerformanceMonitor) {}

  /**
   * Export metrics in Prometheus format
   * Format: metric_name{label1="value1"} value
   */
  exportPrometheus(): string {
    const report = this.monitor.generateReport();
    let output = '';

    // Add HELP and TYPE comments
    const metrics = this.getPrometheusMetrics(report);

    for (const metric of metrics) {
      output += `# HELP ${metric.name} ${metric.help}\n`;
      output += `# TYPE ${metric.name} ${metric.type}\n`;

      for (const m of metric.metrics) {
        const labels = Object.entries(m.labels)
          .map(([key, val]) => `${key}="${val}"`)
          .join(',');

        if (labels) {
          output += `${metric.name}{${labels}} ${m.value}\n`;
        } else {
          output += `${metric.name} ${m.value}\n`;
        }
      }
    }

    return output;
  }

  /**
   * Export metrics in InfluxDB line format
   */
  exportInfluxDB(database: string = 'nera'): string {
    const report = this.monitor.generateReport();
    const timestamp = report.timestamp * 1000000; // Convert to nanoseconds

    const lines: string[] = [];

    // EEG processing metrics
    lines.push(
      `eeg_latency,db=${database},metric=average value=${report.averageEEGLatency} ${timestamp}`
    );
    lines.push(
      `eeg_latency,db=${database},metric=p95 value=${report.p95EEGLatency} ${timestamp}`
    );
    lines.push(
      `eeg_latency,db=${database},metric=p99 value=${report.p99EEGLatency} ${timestamp}`
    );

    // Cloud sync metrics
    lines.push(
      `cloud_latency,db=${database},metric=average value=${report.averageCloudLatency} ${timestamp}`
    );

    // Resource metrics
    lines.push(
      `memory_usage,db=${database},metric=average value=${report.averageMemory} ${timestamp}`
    );
    lines.push(
      `memory_usage,db=${database},metric=peak value=${report.peakMemory} ${timestamp}`
    );
    lines.push(
      `cpu_usage,db=${database} value=${report.averageCPU} ${timestamp}`
    );

    // Sample metrics
    lines.push(
      `samples,db=${database},status=processed value=${report.samplesProcessed} ${timestamp}`
    );
    lines.push(
      `samples,db=${database},status=dropped value=${report.droppedSamples} ${timestamp}`
    );

    return lines.join('\n');
  }

  /**
   * Export metrics in StatsD format
   * Format: metric_name:value|type
   */
  exportStatsD(): string[] {
    const report = this.monitor.generateReport();
    const metrics: string[] = [];

    // Gauges (instantaneous values)
    metrics.push(`nera.eeg.latency.average:${report.averageEEGLatency}|g`);
    metrics.push(`nera.eeg.latency.p95:${report.p95EEGLatency}|g`);
    metrics.push(`nera.eeg.latency.max:${report.maxEEGLatency}|g`);

    metrics.push(`nera.cloud.latency.average:${report.averageCloudLatency}|g`);

    metrics.push(`nera.memory.average:${report.averageMemory}|g`);
    metrics.push(`nera.memory.peak:${report.peakMemory}|g`);
    metrics.push(`nera.cpu.average:${report.averageCPU}|g`);

    // Counters (monotonically increasing)
    metrics.push(`nera.samples.processed:${report.samplesProcessed}|c`);
    metrics.push(`nera.samples.dropped:${report.droppedSamples}|c`);

    // Histograms (distribution)
    metrics.push(`nera.drop.rate:${report.dropRate}|h`);

    return metrics;
  }

  /**
   * Export as JSON
   */
  exportJSON(): object {
    const report = this.monitor.generateReport();
    const health = this.monitor.getHealthStatus();
    const budgets = this.monitor.checkPerformanceBudgets();

    return {
      timestamp: new Date(report.timestamp).toISOString(),
      health,
      budgets: {
        met: budgets.met,
        violations: budgets.violations,
      },
      metrics: {
        eeg: {
          latency: {
            average: parseFloat(report.averageEEGLatency.toFixed(2)),
            p50: parseFloat(report.p50EEGLatency.toFixed(2)),
            p95: parseFloat(report.p95EEGLatency.toFixed(2)),
            p99: parseFloat(report.p99EEGLatency.toFixed(2)),
            max: parseFloat(report.maxEEGLatency.toFixed(2)),
          },
        },
        cloud: {
          latency: {
            average: parseFloat(report.averageCloudLatency.toFixed(2)),
            p50: parseFloat(report.p50CloudLatency.toFixed(2)),
            p95: parseFloat(report.p95CloudLatency.toFixed(2)),
          },
        },
        resources: {
          memory: {
            average: parseFloat(report.averageMemory.toFixed(2)),
            peak: parseFloat(report.peakMemory.toFixed(2)),
          },
          cpu: {
            average: parseFloat(report.averageCPU.toFixed(2)),
          },
        },
        samples: {
          processed: report.samplesProcessed,
          dropped: report.droppedSamples,
          dropRate: parseFloat(report.dropRate.toFixed(3)),
        },
      },
      uptime: {
        seconds: report.uptime,
        formatted: this.formatUptime(report.uptime),
      },
    };
  }

  /**
   * Get data for visualization
   */
  getVisualizationData() {
    const report = this.monitor.generateReport();
    const histogram = this.monitor.getLatencyHistogram();

    return {
      histogram: {
        title: 'EEG Processing Latency Distribution',
        buckets: histogram.map(b => ({
          range: `${b.min}-${b.max}ms`,
          count: b.count,
        })),
      },
      summary: {
        title: 'Performance Summary',
        metrics: [
          { label: 'Avg EEG Latency', value: `${report.averageEEGLatency.toFixed(2)}ms` },
          { label: 'P95 EEG Latency', value: `${report.p95EEGLatency.toFixed(2)}ms` },
          { label: 'Peak Memory', value: `${report.peakMemory.toFixed(2)}MB` },
          { label: 'Drop Rate', value: `${report.dropRate.toFixed(3)}%` },
        ],
      },
    };
  }

  // ============ PRIVATE HELPER METHODS ============

  private getPrometheusMetrics(report: PerformanceReport): PrometheusMetric[] {
    return [
      {
        name: 'nera_eeg_latency_ms',
        type: 'summary',
        help: 'EEG processing latency in milliseconds',
        metrics: [
          { labels: { quantile: '0.5' }, value: report.p50EEGLatency },
          { labels: { quantile: '0.95' }, value: report.p95EEGLatency },
          { labels: { quantile: '0.99' }, value: report.p99EEGLatency },
          { labels: { quantile: 'avg' }, value: report.averageEEGLatency },
          { labels: { quantile: 'max' }, value: report.maxEEGLatency },
        ],
      },
      {
        name: 'nera_cloud_latency_ms',
        type: 'gauge',
        help: 'Cloud sync latency in milliseconds',
        metrics: [
          { labels: { type: 'average' }, value: report.averageCloudLatency },
          { labels: { type: 'p95' }, value: report.p95CloudLatency },
        ],
      },
      {
        name: 'nera_memory_mb',
        type: 'gauge',
        help: 'Memory usage in megabytes',
        metrics: [
          { labels: { type: 'average' }, value: report.averageMemory },
          { labels: { type: 'peak' }, value: report.peakMemory },
        ],
      },
      {
        name: 'nera_cpu_percent',
        type: 'gauge',
        help: 'CPU usage in percentage',
        metrics: [{ labels: {}, value: report.averageCPU }],
      },
      {
        name: 'nera_samples_total',
        type: 'counter',
        help: 'Total EEG samples processed',
        metrics: [{ labels: { status: 'processed' }, value: report.samplesProcessed }],
      },
      {
        name: 'nera_samples_dropped',
        type: 'counter',
        help: 'Total dropped samples',
        metrics: [{ labels: {}, value: report.droppedSamples }],
      },
      {
        name: 'nera_drop_rate_percent',
        type: 'gauge',
        help: 'Sample drop rate percentage',
        metrics: [{ labels: {}, value: report.dropRate }],
      },
    ];
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours}h ${minutes}m ${secs}s`;
  }
}

/**
 * Create metrics exporter
 */
export function createMetricsExporter(monitor: PerformanceMonitor): MetricsExporter {
  return new MetricsExporter(monitor);
}
