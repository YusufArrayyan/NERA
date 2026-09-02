/**
 * Monitoring & Observability Module Tests
 * Metrics, logging, alerting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MetricsCollector,
  Logger,
  MemorySink,
  AlertManager,
  createMetricsCollector,
  createLogger,
  createAlertManager,
} from '../src/modules/monitoring';

describe('Metrics Collector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = createMetricsCollector();
  });

  it('should create counter metric', () => {
    collector.createCounter('requests_total', 'Total requests');

    const metric = collector.getMetric('requests_total');

    expect(metric).toBeDefined();
    expect(metric?.type).toBe('counter');
  });

  it('should increment counter', () => {
    collector.createCounter('requests_total', 'Total requests');
    collector.incrementCounter('requests_total', 1);
    collector.incrementCounter('requests_total', 2);

    const metric = collector.getMetric('requests_total') as any;

    expect(metric.value).toBe(3);
  });

  it('should create gauge metric', () => {
    collector.createGauge('temperature', 'Temperature in celsius');

    const metric = collector.getMetric('temperature');

    expect(metric).toBeDefined();
    expect(metric?.type).toBe('gauge');
  });

  it('should set gauge value', () => {
    collector.createGauge('memory_usage', 'Memory usage in MB');
    collector.setGauge('memory_usage', 256);

    const metric = collector.getMetric('memory_usage') as any;

    expect(metric.value).toBe(256);
  });

  it('should create histogram metric', () => {
    collector.createHistogram('request_duration', 'Request duration in ms', [10, 100, 1000]);

    const metric = collector.getMetric('request_duration');

    expect(metric).toBeDefined();
    expect(metric?.type).toBe('histogram');
  });

  it('should record histogram values', () => {
    collector.createHistogram('latency', 'Latency in ms', [10, 100, 1000]);
    collector.recordHistogram('latency', 50);
    collector.recordHistogram('latency', 150);
    collector.recordHistogram('latency', 2000);

    const metric = collector.getMetric('latency') as any;

    expect(metric.count).toBe(3);
    expect(metric.sum).toBe(2200);
  });

  it('should support labeled metrics', () => {
    collector.createCounter('requests_total', 'Total requests', { method: 'GET' });
    collector.createCounter('requests_total', 'Total requests', { method: 'POST' });

    collector.incrementCounter('requests_total', 5, { method: 'GET' });
    collector.incrementCounter('requests_total', 3, { method: 'POST' });

    const getMetric = collector.getMetric('requests_total', { method: 'GET' }) as any;
    const postMetric = collector.getMetric('requests_total', { method: 'POST' }) as any;

    expect(getMetric.value).toBe(5);
    expect(postMetric.value).toBe(3);
  });

  it('should export metrics in Prometheus format', () => {
    collector.createCounter('test_counter', 'Test counter');
    collector.incrementCounter('test_counter', 42);

    const prometheus = collector.exportPrometheus();

    expect(prometheus).toContain('# HELP test_counter Test counter');
    expect(prometheus).toContain('# TYPE test_counter counter');
    expect(prometheus).toContain('test_counter 42');
  });

  it('should export metrics as JSON', () => {
    collector.createCounter('test_counter', 'Test counter');
    collector.incrementCounter('test_counter', 42);

    const json = collector.exportJSON();

    expect(json.test_counter).toBeDefined();
    expect(json.test_counter.type).toBe('counter');
  });

  it('should delete metric', () => {
    collector.createCounter('temp_counter', 'Temporary counter');
    expect(collector.getMetric('temp_counter')).toBeDefined();

    collector.deleteMetric('temp_counter');
    expect(collector.getMetric('temp_counter')).toBeNull();
  });

  it('should reset metric', () => {
    collector.createCounter('counter', 'Counter');
    collector.incrementCounter('counter', 100);

    collector.resetMetric('counter');

    const metric = collector.getMetric('counter') as any;
    expect(metric.value).toBe(0);
  });
});

describe('Logger', () => {
  it('should create memory sink', () => {
    const sink = new MemorySink(100);
    expect(sink).toBeDefined();
  });

  it('should write to memory sink', () => {
    const sink = new MemorySink();

    sink.write({
      timestamp: Date.now(),
      level: 'info',
      message: 'Test message',
      context: { key: 'value' },
    });

    const entries = (sink as any).getEntries();
    expect(entries.length).toBe(1);
  });

  it('should create logger', () => {
    const logger = createLogger({
      level: 'info',
      format: 'json',
      sinks: [new MemorySink()],
    });

    expect(logger).toBeDefined();
  });

  it('should create child logger', () => {
    const logger = createLogger({
      level: 'info',
      format: 'json',
      sinks: [],
    });

    const child = logger.createChild({ userId: 'user123' });
    expect(child).toBeDefined();
  });

  it('should handle log levels', () => {
    const sink = new MemorySink();

    sink.write({
      timestamp: Date.now(),
      level: 'debug',
      message: 'Debug',
      context: {},
    });

    sink.write({
      timestamp: Date.now(),
      level: 'error',
      message: 'Error',
      context: {},
    });

    const entries = (sink as any).getEntries();
    expect(entries.length).toBe(2);
  });

  it('should include context in entries', () => {
    const sink = new MemorySink();

    sink.write({
      timestamp: Date.now(),
      level: 'info',
      message: 'Test',
      context: { userId: 'u123', action: 'login' },
    });

    const entries = (sink as any).getEntries();
    expect(entries[0].context.userId).toBe('u123');
  });

  it('should maintain max size', () => {
    const sink = new MemorySink(3);

    for (let i = 0; i < 5; i++) {
      sink.write({
        timestamp: Date.now(),
        level: 'info',
        message: `Message ${i}`,
        context: {},
      });
    }

    const entries = (sink as any).getEntries();
    expect(entries.length).toBeLessThanOrEqual(3);
  });
});

describe('Alert Manager', () => {
  let manager: AlertManager;

  beforeEach(() => {
    manager = createAlertManager();
  });

  it('should register alert rule', () => {
    const rule = {
      id: 'rule1',
      name: 'High CPU',
      description: 'CPU usage is high',
      condition: (context: Record<string, any>) => context.cpu > 80,
      severity: 'critical' as const,
      threshold: 3,
      duration: 60000,
      enabled: true,
      tags: ['cpu', 'performance'],
      notificationChannels: [],
    };

    manager.registerRule(rule);

    expect(manager.getAlertStats().totalAlerts).toBe(0);
  });

  it('should check alert condition', async () => {
    const rule = {
      id: 'rule1',
      name: 'High Memory',
      description: 'Memory usage is high',
      condition: (context: Record<string, any>) => context.memory > 90,
      severity: 'warning' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: ['memory'],
      notificationChannels: [],
    };

    manager.registerRule(rule);

    const conditionMet = await manager.checkCondition('rule1', { memory: 95 });

    expect(conditionMet).toBe(true);
  });

  it('should fire alert', async () => {
    const rule = {
      id: 'rule1',
      name: 'Test Alert',
      description: 'Test alert rule',
      condition: () => true,
      severity: 'warning' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: ['test'],
      notificationChannels: [],
    };

    manager.registerRule(rule);

    const alert = await manager.fireAlert('rule1', 'Test alert fired');

    expect(alert).toBeDefined();
    expect(alert.status).toBe('firing');
    expect(alert.message).toBe('Test alert fired');
  });

  it('should resolve alert', async () => {
    const rule = {
      id: 'rule1',
      name: 'Test',
      description: 'Test',
      condition: () => true,
      severity: 'info' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: [],
      notificationChannels: [],
    };

    manager.registerRule(rule);

    const alert = await manager.fireAlert('rule1', 'Test');
    manager.resolveAlert(alert.id);

    const stats = manager.getAlertStats();
    expect(stats.activeAlerts).toBe(0);
  });

  it('should acknowledge alert', async () => {
    const rule = {
      id: 'rule1',
      name: 'Test',
      description: 'Test',
      condition: () => true,
      severity: 'critical' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: [],
      notificationChannels: [],
    };

    manager.registerRule(rule);

    const alert = await manager.fireAlert('rule1', 'Test');
    manager.acknowledgeAlert(alert.id, 'user123');

    const stats = manager.getAlertStats();
    expect(stats.acknowledgedAlerts).toBe(1);
  });

  it('should get active alerts', async () => {
    const rule = {
      id: 'rule1',
      name: 'Test',
      description: 'Test',
      condition: () => true,
      severity: 'warning' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: [],
      notificationChannels: [],
    };

    manager.registerRule(rule);

    await manager.fireAlert('rule1', 'Alert 1');
    await manager.fireAlert('rule1', 'Alert 2');

    const activeAlerts = manager.getActiveAlerts();

    expect(activeAlerts.length).toBe(2);
  });

  it('should get alerts by severity', async () => {
    const criticalRule = {
      id: 'critical',
      name: 'Critical',
      description: 'Critical alert',
      condition: () => true,
      severity: 'critical' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: [],
      notificationChannels: [],
    };

    const warningRule = {
      id: 'warning',
      name: 'Warning',
      description: 'Warning alert',
      condition: () => true,
      severity: 'warning' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: [],
      notificationChannels: [],
    };

    manager.registerRule(criticalRule);
    manager.registerRule(warningRule);

    await manager.fireAlert('critical', 'Critical');
    await manager.fireAlert('warning', 'Warning');

    const criticalAlerts = manager.getAlertsBySeverity('critical');
    const warningAlerts = manager.getAlertsBySeverity('warning');

    expect(criticalAlerts.length).toBe(1);
    expect(warningAlerts.length).toBe(1);
  });

  it('should get alert statistics', async () => {
    const rule = {
      id: 'rule1',
      name: 'Test',
      description: 'Test',
      condition: () => true,
      severity: 'critical' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: [],
      notificationChannels: [],
    };

    manager.registerRule(rule);
    await manager.fireAlert('rule1', 'Alert');

    const stats = manager.getAlertStats();

    expect(stats.totalAlerts).toBe(1);
    expect(stats.activeAlerts).toBe(1);
    expect(stats.criticalAlerts).toBe(1);
  });

  it('should disable and enable rules', async () => {
    const rule = {
      id: 'rule1',
      name: 'Test',
      description: 'Test',
      condition: () => true,
      severity: 'warning' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: [],
      notificationChannels: [],
    };

    manager.registerRule(rule);

    manager.disableRule('rule1');

    const conditionNotMet = await manager.checkCondition('rule1', {});

    expect(conditionNotMet).toBe(false);
  });

  it('should get dashboard data', async () => {
    const rule = {
      id: 'rule1',
      name: 'Test',
      description: 'Test',
      condition: () => true,
      severity: 'critical' as const,
      threshold: 1,
      duration: 0,
      enabled: true,
      tags: [],
      notificationChannels: [],
    };

    manager.registerRule(rule);
    await manager.fireAlert('rule1', 'Test');

    const dashboard = manager.getDashboard();

    expect(dashboard.stats).toBeDefined();
    expect(dashboard.activeAlerts).toBeDefined();
    expect(dashboard.recentAlerts).toBeDefined();
    expect(dashboard.ruleStatuses).toBeDefined();
  });
});
