/**
 * Metrics Collector
 * Prometheus-compatible metrics collection and export
 */

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricLabel {
  name: string;
  value: string;
}

export interface CounterMetric {
  type: 'counter';
  name: string;
  help: string;
  value: number;
  labels: Record<string, string>;
  lastUpdated: number;
}

export interface GaugeMetric {
  type: 'gauge';
  name: string;
  help: string;
  value: number;
  labels: Record<string, string>;
  lastUpdated: number;
}

export interface HistogramMetric {
  type: 'histogram';
  name: string;
  help: string;
  buckets: Record<number, number>; // bucket size -> count
  sum: number;
  count: number;
  labels: Record<string, string>;
  lastUpdated: number;
}

export interface SummaryMetric {
  type: 'summary';
  name: string;
  help: string;
  quantiles: Record<number, number>; // 0.5, 0.95, 0.99 -> value
  sum: number;
  count: number;
  labels: Record<string, string>;
  lastUpdated: number;
}

export type Metric = CounterMetric | GaugeMetric | HistogramMetric | SummaryMetric;

/**
 * Metrics Collector
 */
export class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  private histogramValues: Map<string, number[]> = new Map();

  /**
   * Create counter metric
   */
  createCounter(name: string, help: string, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);

    this.metrics.set(key, {
      type: 'counter',
      name,
      help,
      value: 0,
      labels,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Increment counter
   */
  incrementCounter(name: string, value: number = 1, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    const metric = this.metrics.get(key);

    if (!metric || metric.type !== 'counter') {
      this.createCounter(name, '', labels);
      return this.incrementCounter(name, value, labels);
    }

    (metric as CounterMetric).value += value;
    metric.lastUpdated = Date.now();
  }

  /**
   * Create gauge metric
   */
  createGauge(name: string, help: string, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);

    this.metrics.set(key, {
      type: 'gauge',
      name,
      help,
      value: 0,
      labels,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Set gauge value
   */
  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    const metric = this.metrics.get(key);

    if (!metric || metric.type !== 'gauge') {
      this.createGauge(name, '', labels);
      return this.setGauge(name, value, labels);
    }

    (metric as GaugeMetric).value = value;
    metric.lastUpdated = Date.now();
  }

  /**
   * Create histogram metric
   */
  createHistogram(
    name: string,
    help: string,
    buckets: number[] = [0.1, 1, 10, 100],
    labels: Record<string, string> = {}
  ): void {
    const key = this.getMetricKey(name, labels);
    const bucketsMap: Record<number, number> = {};

    for (const bucket of buckets) {
      bucketsMap[bucket] = 0;
    }

    this.metrics.set(key, {
      type: 'histogram',
      name,
      help,
      buckets: bucketsMap,
      sum: 0,
      count: 0,
      labels,
      lastUpdated: Date.now(),
    });

    this.histogramValues.set(key, []);
  }

  /**
   * Record histogram value
   */
  recordHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    const metric = this.metrics.get(key);

    if (!metric || metric.type !== 'histogram') {
      this.createHistogram(name, '', [], labels);
      return this.recordHistogram(name, value, labels);
    }

    const histogram = metric as HistogramMetric;
    histogram.sum += value;
    histogram.count++;

    // Update buckets
    for (const bucket of Object.keys(histogram.buckets)) {
      if (value <= parseFloat(bucket)) {
        histogram.buckets[parseFloat(bucket)]++;
      }
    }

    // Store raw value
    if (!this.histogramValues.has(key)) {
      this.histogramValues.set(key, []);
    }

    this.histogramValues.get(key)!.push(value);

    metric.lastUpdated = Date.now();
  }

  /**
   * Create summary metric
   */
  createSummary(
    name: string,
    help: string,
    quantiles: number[] = [0.5, 0.95, 0.99],
    labels: Record<string, string> = {}
  ): void {
    const key = this.getMetricKey(name, labels);
    const quantilesMap: Record<number, number> = {};

    for (const quantile of quantiles) {
      quantilesMap[quantile] = 0;
    }

    this.metrics.set(key, {
      type: 'summary',
      name,
      help,
      quantiles: quantilesMap,
      sum: 0,
      count: 0,
      labels,
      lastUpdated: Date.now(),
    });

    this.histogramValues.set(key, []);
  }

  /**
   * Record summary value
   */
  recordSummary(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    const metric = this.metrics.get(key);

    if (!metric || metric.type !== 'summary') {
      this.createSummary(name, '', [], labels);
      return this.recordSummary(name, value, labels);
    }

    const summary = metric as SummaryMetric;
    summary.sum += value;
    summary.count++;

    // Store raw value for quantile calculation
    if (!this.histogramValues.has(key)) {
      this.histogramValues.set(key, []);
    }

    const values = this.histogramValues.get(key)!;
    values.push(value);

    // Calculate quantiles
    values.sort((a, b) => a - b);
    for (const quantile of Object.keys(summary.quantiles)) {
      const q = parseFloat(quantile);
      const index = Math.ceil((q * values.length) - 1);
      summary.quantiles[q] = values[Math.max(0, index)];
    }

    metric.lastUpdated = Date.now();
  }

  /**
   * Get metric
   */
  getMetric(name: string, labels: Record<string, string> = {}): Metric | null {
    const key = this.getMetricKey(name, labels);
    return this.metrics.get(key) || null;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: MetricType): Metric[] {
    return Array.from(this.metrics.values()).filter(m => m.type === type);
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): Metric[] {
    return Array.from(this.metrics.values()).filter(m => m.name === name);
  }

  /**
   * Delete metric
   */
  deleteMetric(name: string, labels: Record<string, string> = {}): boolean {
    const key = this.getMetricKey(name, labels);
    this.histogramValues.delete(key);
    return this.metrics.delete(key);
  }

  /**
   * Reset metric
   */
  resetMetric(name: string, labels: Record<string, string> = {}): boolean {
    const key = this.getMetricKey(name, labels);
    const metric = this.metrics.get(key);

    if (!metric) return false;

    switch (metric.type) {
      case 'counter':
        (metric as CounterMetric).value = 0;
        break;
      case 'gauge':
        (metric as GaugeMetric).value = 0;
        break;
      case 'histogram':
        (metric as HistogramMetric).sum = 0;
        (metric as HistogramMetric).count = 0;
        for (const bucket of Object.keys((metric as HistogramMetric).buckets)) {
          ((metric as HistogramMetric).buckets as Record<string, number>)[bucket] = 0;
        }
        break;
      case 'summary':
        (metric as SummaryMetric).sum = 0;
        (metric as SummaryMetric).count = 0;
        for (const quantile of Object.keys((metric as SummaryMetric).quantiles)) {
          ((metric as SummaryMetric).quantiles as Record<string, number>)[quantile] = 0;
        }
        break;
    }

    metric.lastUpdated = Date.now();
    this.histogramValues.delete(key);

    return true;
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = [];

    for (const metric of this.metrics.values()) {
      // Add HELP line
      lines.push(`# HELP ${metric.name} ${metric.help}`);

      // Add TYPE line
      lines.push(`# TYPE ${metric.name} ${metric.type}`);

      // Format labels
      const labelStr = this.formatLabels(metric.labels);

      switch (metric.type) {
        case 'counter':
        case 'gauge': {
          const m = metric as CounterMetric | GaugeMetric;
          lines.push(`${metric.name}${labelStr} ${m.value}`);
          break;
        }

        case 'histogram': {
          const m = metric as HistogramMetric;
          for (const [bucket, count] of Object.entries(m.buckets)) {
            lines.push(`${metric.name}_bucket{le="${bucket}"${labelStr ? ',' + labelStr.slice(1, -1) : ''}} ${count}`);
          }
          lines.push(`${metric.name}_bucket{le="+Inf"${labelStr ? ',' + labelStr.slice(1, -1) : ''}} ${m.count}`);
          lines.push(`${metric.name}_sum${labelStr} ${m.sum}`);
          lines.push(`${metric.name}_count${labelStr} ${m.count}`);
          break;
        }

        case 'summary': {
          const m = metric as SummaryMetric;
          for (const [quantile, value] of Object.entries(m.quantiles)) {
            lines.push(`${metric.name}{quantile="${quantile}"${labelStr ? ',' + labelStr.slice(1, -1) : ''}} ${value}`);
          }
          lines.push(`${metric.name}_sum${labelStr} ${m.sum}`);
          lines.push(`${metric.name}_count${labelStr} ${m.count}`);
          break;
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Export metrics as JSON
   */
  exportJSON(): Record<string, any> {
    const result: Record<string, any> = {};

    for (const metric of this.metrics.values()) {
      const key = metric.name;

      if (!result[key]) {
        result[key] = {
          help: metric.help,
          type: metric.type,
          values: [],
        };
      }

      result[key].values.push({
        labels: metric.labels,
        ...(() => {
          switch (metric.type) {
            case 'counter':
            case 'gauge':
              return { value: (metric as CounterMetric).value };
            case 'histogram':
              return {
                buckets: (metric as HistogramMetric).buckets,
                sum: (metric as HistogramMetric).sum,
                count: (metric as HistogramMetric).count,
              };
            case 'summary':
              return {
                quantiles: (metric as SummaryMetric).quantiles,
                sum: (metric as SummaryMetric).sum,
                count: (metric as SummaryMetric).count,
              };
          }
        })(),
      });
    }

    return result;
  }

  /**
   * Get metric key
   */
  private getMetricKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');

    return labelStr ? `${name}{${labelStr}}` : name;
  }

  /**
   * Format labels for Prometheus output
   */
  private formatLabels(labels: Record<string, string>): string {
    if (Object.keys(labels).length === 0) return '';

    const parts = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `{${parts}}`;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.histogramValues.clear();
  }

  /**
   * Get metrics count
   */
  getMetricsCount(): number {
    return this.metrics.size;
  }
}

/**
 * Create metrics collector
 */
export function createMetricsCollector(): MetricsCollector {
  return new MetricsCollector();
}
