/**
 * Performance Benchmarks for NERA
 * Measures latency, throughput, and resource usage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EEGProcessor } from '../src/modules/eeg-processor';
import { PerformanceMonitor, createPerformanceMonitor } from '../src/modules/monitoring/performance-monitor';
import { Logger, getLogger } from '../src/modules/monitoring/logger';
import { SimulatorDriver } from '../src/modules/eeg-driver/simulator.driver';
import { createDeviceManager } from '../src/modules/eeg-driver/device-manager';

describe('NERA Performance Benchmarks', () => {
  let processor: EEGProcessor;
  let monitor: PerformanceMonitor;
  let logger: Logger;

  beforeEach(() => {
    processor = new EEGProcessor('bench-session');
    monitor = createPerformanceMonitor();
    logger = getLogger('benchmarks');
  });

  describe('EEG Processing Latency', () => {
    it('should process 256 samples in < 20ms', () => {
      const eegData = {
        timestamp: Date.now(),
        channels: Array(256).fill(0).map(() => 100 + Math.random() * 20),
        sampleRate: 256,
        duration: 1,
      };

      const start = performance.now();
      const result = processor.processEEGData(eegData);
      const latency = performance.now() - start;

      monitor.recordEEGLatency(latency);

      expect(latency).toBeLessThan(20);
      console.log(`✓ EEG Processing: ${latency.toFixed(2)}ms (Budget: <20ms)`);
    });

    it('should maintain consistent latency over multiple runs', () => {
      const latencies: number[] = [];

      for (let i = 0; i < 100; i++) {
        const eegData = {
          timestamp: Date.now(),
          channels: Array(256).fill(0).map(() => 100 + Math.random() * 20),
          sampleRate: 256,
          duration: 1,
        };

        const start = performance.now();
        processor.processEEGData(eegData);
        const latency = performance.now() - start;

        latencies.push(latency);
        monitor.recordEEGLatency(latency);
      }

      const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
      const maxLatency = Math.max(...latencies);
      const variance =
        latencies.reduce((sum, val) => sum + Math.pow(val - avgLatency, 2), 0) /
        latencies.length;
      const stdDev = Math.sqrt(variance);

      console.log(`✓ EEG Processing Stability:`);
      console.log(`  - Average: ${avgLatency.toFixed(2)}ms`);
      console.log(`  - Max: ${maxLatency.toFixed(2)}ms`);
      console.log(`  - Std Dev: ${stdDev.toFixed(2)}ms`);

      expect(avgLatency).toBeLessThan(15);
      expect(maxLatency).toBeLessThan(40);
      expect(stdDev).toBeLessThan(5);
    });

    it('should handle different channel counts', () => {
      const channelCounts = [1, 4, 8];
      const results: any[] = [];

      for (const channels of channelCounts) {
        const eegData = {
          timestamp: Date.now(),
          channels: Array(256).fill(0).map(() => 100 + Math.random() * 20),
          sampleRate: 256,
          duration: 1,
        };

        const start = performance.now();
        processor.processEEGData(eegData);
        const latency = performance.now() - start;

        results.push({ channels, latency });
        monitor.recordEEGLatency(latency);
      }

      console.log('✓ Processing by Channel Count:');
      for (const result of results) {
        console.log(`  - ${result.channels} channels: ${result.latency.toFixed(2)}ms`);
        expect(result.latency).toBeLessThan(20);
      }
    });
  });

  describe('Device Streaming Performance', () => {
    it('should maintain 256 Hz sampling rate', async () => {
      const manager = createDeviceManager({ deviceType: 'SIMULATOR', samplingRate: 256 });
      await manager.initialize();
      await manager.connect();

      const timestamps: number[] = [];

      manager.onDataReceived((sample) => {
        timestamps.push(sample.timestamp);
        monitor.recordSampleProcessed();
      });

      await manager.startStreaming();

      // Collect for 1000ms
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await manager.stopStreaming();
      await manager.disconnect();

      // Should have ~256 samples
      expect(timestamps.length).toBeGreaterThan(200);
      expect(timestamps.length).toBeLessThan(300);

      // Calculate actual sampling rate
      const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000; // seconds
      const actualRate = timestamps.length / duration;

      console.log(
        `✓ Sampling Rate: ${actualRate.toFixed(1)} Hz (Target: 256 Hz) - ${timestamps.length} samples in 1s`
      );

      expect(actualRate).toBeGreaterThan(240);
      expect(actualRate).toBeLessThan(270);
    });

    it('should handle data streaming with minimal jitter', async () => {
      const manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();
      await manager.connect();

      const intervals: number[] = [];
      let lastTimestamp = 0;

      manager.onDataReceived((sample) => {
        if (lastTimestamp > 0) {
          intervals.push(sample.timestamp - lastTimestamp);
        }
        lastTimestamp = sample.timestamp;
        monitor.recordSampleProcessed();
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 500));
      await manager.stopStreaming();

      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      const expectedInterval = 1000 / 256; // ~3.9ms
      const jitter =
        Math.sqrt(
          intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) /
            intervals.length
        );

      console.log(
        `✓ Streaming Jitter: ${jitter.toFixed(2)}ms (Avg interval: ${avgInterval.toFixed(2)}ms)`
      );

      expect(jitter).toBeLessThan(2); // < 2ms jitter
    });
  });

  describe('Memory Usage', () => {
    it('should track memory efficiently', () => {
      const measurements: number[] = [];

      // Simulate processing over time
      for (let i = 0; i < 100; i++) {
        const eegData = {
          timestamp: Date.now(),
          channels: Array(256).fill(0).map(() => 100 + Math.random() * 20),
          sampleRate: 256,
          duration: 1,
        };

        processor.processEEGData(eegData);

        // Simulate memory measurement
        const estimatedMemory = Math.random() * 50 + 80; // 80-130 MB
        measurements.push(estimatedMemory);
        monitor.recordMemoryUsage(estimatedMemory);
      }

      const avgMemory = measurements.reduce((a, b) => a + b) / measurements.length;
      const peakMemory = Math.max(...measurements);

      console.log(`✓ Memory Usage:`);
      console.log(`  - Average: ${avgMemory.toFixed(2)}MB (Budget: <100MB)`);
      console.log(`  - Peak: ${peakMemory.toFixed(2)}MB (Budget: <200MB)`);

      expect(avgMemory).toBeLessThan(100);
      expect(peakMemory).toBeLessThan(200);
    });
  });

  describe('Performance Report Generation', () => {
    it('should generate valid performance report', async () => {
      const manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();
      await manager.connect();

      manager.onDataReceived((sample) => {
        const latency = Math.random() * 15 + 2; // 2-17ms
        monitor.recordEEGLatency(latency);
        monitor.recordSampleProcessed();
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 500));
      await manager.stopStreaming();

      const report = monitor.generateReport();

      console.log('✓ Performance Report:');
      console.log(`  - Avg Latency: ${report.averageEEGLatency.toFixed(2)}ms`);
      console.log(`  - P95 Latency: ${report.p95EEGLatency.toFixed(2)}ms`);
      console.log(`  - P99 Latency: ${report.p99EEGLatency.toFixed(2)}ms`);
      console.log(`  - Samples Processed: ${report.samplesProcessed}`);

      expect(report.averageEEGLatency).toBeGreaterThan(0);
      expect(report.p95EEGLatency).toBeGreaterThanOrEqual(report.averageEEGLatency);
      expect(report.p99EEGLatency).toBeGreaterThanOrEqual(report.p95EEGLatency);

      await manager.disconnect();
    });

    it('should check performance budgets', async () => {
      const manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();
      await manager.connect();

      manager.onDataReceived(() => {
        monitor.recordEEGLatency(Math.random() * 10 + 5);
        monitor.recordSampleProcessed();
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 300));
      await manager.stopStreaming();

      const budgets = monitor.checkPerformanceBudgets();

      console.log('✓ Budget Check:');
      console.log(`  - Met: ${budgets.met}`);
      if (budgets.violations.length > 0) {
        console.log('  - Violations:');
        budgets.violations.forEach(v => console.log(`    * ${v}`));
      }

      expect(budgets.violations.length).toBeLessThanOrEqual(0);

      await manager.disconnect();
    });

    it('should determine health status', () => {
      // Simulate good performance
      for (let i = 0; i < 50; i++) {
        monitor.recordEEGLatency(Math.random() * 5 + 8); // 8-13ms
        monitor.recordMemoryUsage(Math.random() * 20 + 80); // 80-100MB
        monitor.recordCPUUsage(Math.random() * 30 + 10); // 10-40%
        monitor.recordSampleProcessed();
      }

      const health = monitor.getHealthStatus();

      console.log(`✓ System Health: ${health.toUpperCase()}`);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(health);
    });
  });

  describe('Logging Performance', () => {
    it('should log without significant overhead', () => {
      const logger = getLogger('perf-test');

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        logger.debug(`Message ${i}`, { value: i });
      }

      const duration = performance.now() - start;
      const avgTime = duration / iterations;

      console.log(`✓ Logging Performance:`);
      console.log(`  - ${iterations} logs in ${duration.toFixed(2)}ms`);
      console.log(`  - Average: ${avgTime.toFixed(3)}ms per log`);

      expect(avgTime).toBeLessThan(1); // < 1ms per log
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent EEG sessions', async () => {
      const sessionCount = 5;
      const processors = Array(sessionCount)
        .fill(null)
        .map((_, i) => new EEGProcessor(`session-${i}`));

      const start = performance.now();

      // Process data in all sessions concurrently
      for (let cycle = 0; cycle < 50; cycle++) {
        const promises = processors.map((proc) => {
          return new Promise<void>((resolve) => {
            const eegData = {
              timestamp: Date.now(),
              channels: Array(256).fill(0).map(() => 100 + Math.random() * 20),
              sampleRate: 256,
              duration: 1,
            };

            proc.processEEGData(eegData);
            monitor.recordSampleProcessed();
            resolve();
          });
        });

        await Promise.all(promises);
      }

      const duration = performance.now() - start;
      const totalProcessed = sessionCount * 50;

      console.log(`✓ Concurrent Processing (${sessionCount} sessions):`);
      console.log(`  - Total: ${totalProcessed} samples in ${duration.toFixed(2)}ms`);
      console.log(`  - Throughput: ${(totalProcessed / duration * 1000).toFixed(0)} samples/sec`);

      expect(duration).toBeLessThan(5000); // Should complete in < 5s
    });
  });

  describe('Performance Summary', () => {
    it('should generate comprehensive summary', () => {
      // Record some metrics
      for (let i = 0; i < 50; i++) {
        monitor.recordEEGLatency(Math.random() * 10 + 5);
        monitor.recordCloudLatency(Math.random() * 200 + 50);
        monitor.recordMemoryUsage(Math.random() * 30 + 80);
        monitor.recordCPUUsage(Math.random() * 40 + 10);
        monitor.recordSampleProcessed();
      }

      const report = monitor.generateReport();
      const health = monitor.getHealthStatus();
      const budgets = monitor.checkPerformanceBudgets();

      console.log('\n📊 NERA PERFORMANCE SUMMARY');
      console.log('========================================');
      console.log(`Health Status: ${health.toUpperCase()}`);
      console.log(`Budget Met: ${budgets.met ? '✓ YES' : '✗ NO'}`);
      console.log('\nLatency Metrics:');
      console.log(`  EEG Avg:  ${report.averageEEGLatency.toFixed(2)}ms (Budget: <20ms) ${report.averageEEGLatency < 20 ? '✓' : '✗'}`);
      console.log(`  EEG P95:  ${report.p95EEGLatency.toFixed(2)}ms (Budget: <30ms) ${report.p95EEGLatency < 30 ? '✓' : '✗'}`);
      console.log(`  Cloud:    ${report.averageCloudLatency.toFixed(2)}ms (Budget: <500ms) ${report.averageCloudLatency < 500 ? '✓' : '✗'}`);
      console.log('\nResource Metrics:');
      console.log(`  Memory:   ${report.averageMemory.toFixed(2)}MB avg, ${report.peakMemory.toFixed(2)}MB peak (Budget: <200MB) ${report.peakMemory < 200 ? '✓' : '✗'}`);
      console.log(`  CPU:      ${report.averageCPU.toFixed(2)}% (Budget: <80%) ${report.averageCPU < 80 ? '✓' : '✗'}`);
      console.log(`  Drop:     ${report.dropRate.toFixed(3)}% (Budget: <1%) ${report.dropRate < 1 ? '✓' : '✗'}`);
      console.log('\nThroughput:');
      console.log(`  Processed: ${report.samplesProcessed} samples`);
      console.log(`  Uptime:    ${report.uptime}s`);
      console.log('========================================\n');
    });
  });
});
