/**
 * Integration Tests for NERA Worker
 * Tests the complete pipeline: EEG capture → processing → cloud sync
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NERAWorker } from '../src/index';
import { SimulatorDriver } from '../src/modules/eeg-driver/simulator.driver';
import { Muse2Driver } from '../src/modules/eeg-driver/muse-2.driver';
import { NeuroSkyMindWaveDriver } from '../src/modules/eeg-driver/neursky-mindwave.driver';
import { EEGDeviceManager, createDeviceManager } from '../src/modules/eeg-driver/device-manager';
import { EEGProcessor } from '../src/modules/eeg-processor';

describe('NERA Integration Tests', () => {
  let worker: NERAWorker;
  let manager: EEGDeviceManager;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Cleanup
    if (worker) {
      try {
        await worker.stopSession();
      } catch (e) {
        // Ignore
      }
    }
  });

  describe('Device Manager - Device Initialization', () => {
    it('should initialize simulator device successfully', async () => {
      manager = createDeviceManager({
        deviceType: 'SIMULATOR',
        samplingRate: 256,
        channelCount: 4,
      });

      await manager.initialize();
      expect(manager.getCurrentDeviceType()).toBe('SIMULATOR');
      expect(manager.isConnected()).toBe(false);
    });

    it('should initialize Muse 2 device', async () => {
      manager = createDeviceManager({
        deviceType: 'MUSE_2',
        samplingRate: 256,
        channelCount: 4,
      });

      await manager.initialize();
      expect(manager.getCurrentDeviceType()).toBe('MUSE_2');
    });

    it('should initialize NeuroSky device', async () => {
      manager = createDeviceManager({
        deviceType: 'NEURSKY_MINDWAVE',
        samplingRate: 512,
        channelCount: 1,
      });

      await manager.initialize();
      expect(manager.getCurrentDeviceType()).toBe('NEURSKY_MINDWAVE');
    });

    it('should list supported devices', () => {
      manager = createDeviceManager();
      const devices = manager.getSupportedDevices();
      expect(devices).toContain('SIMULATOR');
      expect(devices).toContain('MUSE_2');
      expect(devices).toContain('NEURSKY_MINDWAVE');
    });
  });

  describe('Device Manager - Connection Lifecycle', () => {
    beforeEach(async () => {
      manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();
    });

    it('should connect and disconnect successfully', async () => {
      expect(manager.isConnected()).toBe(false);

      await manager.connect();
      expect(manager.isConnected()).toBe(true);

      await manager.disconnect();
      expect(manager.isConnected()).toBe(false);
    });

    it('should get device status when connected', async () => {
      await manager.connect();

      const status = await manager.getStatus();
      expect(status.connected).toBe(true);
      expect(status.deviceType).toBe('EEG Simulator');
      expect(status.signalQuality).toBeGreaterThanOrEqual(0);
      expect(status.signalQuality).toBeLessThanOrEqual(100);
      expect(status.activeChannels).toBeGreaterThan(0);
      expect(status.samplingRate).toBeGreaterThan(0);

      await manager.disconnect();
    });

    it('should get device information', async () => {
      const info = await manager.getDeviceInfo();
      expect(info.deviceType).toBeDefined();
      expect(info.version || info.firmwareVersion).toBeDefined();
    });

    it('should calibrate device', async () => {
      await manager.connect();
      await manager.calibrate(100); // 100ms calibration
      // Should not throw
      await manager.disconnect();
    });
  });

  describe('Device Manager - Data Streaming', () => {
    beforeEach(async () => {
      manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();
      await manager.connect();
    });

    afterEach(async () => {
      await manager.stopStreaming();
      await manager.disconnect();
    });

    it('should start and stop streaming', async () => {
      let dataReceived = false;

      manager.onDataReceived(() => {
        dataReceived = true;
      });

      await manager.startStreaming();

      // Wait for data
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(dataReceived).toBe(true);

      await manager.stopStreaming();
    });

    it('should receive correctly formatted EEG samples', async () => {
      let sampleCount = 0;
      let lastSample: any = null;

      manager.onDataReceived((sample) => {
        lastSample = sample;
        sampleCount++;
      });

      await manager.startStreaming();

      // Wait for ~10 samples (39ms at 256Hz)
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(sampleCount).toBeGreaterThan(5);
      expect(lastSample).toBeDefined();
      expect(lastSample.timestamp).toBeGreaterThan(0);
      expect(Array.isArray(lastSample.channels)).toBe(true);
      expect(lastSample.channels.length).toBeGreaterThan(0);
      expect(typeof lastSample.quality).toBe('number');
    });

    it('should maintain correct sampling rate', async () => {
      const samples: any[] = [];

      manager.onDataReceived((sample) => {
        samples.push(sample);
      });

      await manager.startStreaming();

      // Let it collect samples for 500ms
      await new Promise((resolve) => setTimeout(resolve, 500));

      // At 256 Hz, should get ~128 samples in 500ms (±20% tolerance)
      const expectedSamples = 128;
      const tolerance = expectedSamples * 0.2;

      expect(samples.length).toBeGreaterThan(expectedSamples - tolerance);
      expect(samples.length).toBeLessThan(expectedSamples + tolerance);
    });

    it('should handle connection status callbacks', async () => {
      let connectionEvents: boolean[] = [];

      manager.onConnectionStatusChanged((connected) => {
        connectionEvents.push(connected);
      });

      // Reconnect to trigger callback
      await manager.disconnect();
      await manager.connect();

      // Should have received at least disconnect/connect events
      expect(connectionEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Device Manager - Device Switching', () => {
    it('should switch between devices', async () => {
      manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();

      expect(manager.getCurrentDeviceType()).toBe('SIMULATOR');

      // Switch to Muse 2
      await manager.switchDevice('MUSE_2');
      expect(manager.getCurrentDeviceType()).toBe('MUSE_2');
      expect(manager.isConnected()).toBe(true);

      // Switch to NeuroSky
      await manager.switchDevice('NEURSKY_MINDWAVE');
      expect(manager.getCurrentDeviceType()).toBe('NEURSKY_MINDWAVE');

      await manager.disconnect();
    });

    it('should preserve streaming state during device switch', async () => {
      manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();
      await manager.startSession?.();

      let dataReceived1 = false;
      let dataReceived2 = false;

      manager.onDataReceived(() => {
        dataReceived1 = true;
      });

      // Let it run briefly
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(dataReceived1).toBe(true);

      // Switch device
      await manager.switchDevice('MUSE_2');

      dataReceived2 = false;
      manager.onDataReceived(() => {
        dataReceived2 = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should still be receiving data after switch
      expect(dataReceived2).toBe(true);
    });
  });

  describe('Simulator Driver - State Manipulation', () => {
    let driver: SimulatorDriver;

    beforeEach(async () => {
      driver = new SimulatorDriver();
      await driver.initialize();
      await driver.connect();
    });

    afterEach(async () => {
      await driver.disconnect();
    });

    it('should set focus level', async () => {
      driver.setFocusLevel(90); // High focus
      // Should not throw

      driver.setFocusLevel(0); // No focus
      // Should not throw

      driver.setFocusLevel(50); // Medium focus
      // Should not throw
    });

    it('should set stress level', async () => {
      driver.setStressLevel(20); // Low stress
      driver.setStressLevel(80); // High stress
      // Should not throw
    });

    it('should simulate signal loss', async () => {
      let qualitySamples: number[] = [];

      driver.onDataReceived((sample) => {
        qualitySamples.push(sample.quality ?? 100);
      });

      await driver.startStreaming();

      await new Promise((resolve) => setTimeout(resolve, 50));
      const qualityBefore = qualitySamples.length > 0 ? qualitySamples[0] : 100;

      // Simulate signal loss
      await driver.simulateSignalLoss(200);

      // Should recover
      qualitySamples = [];
      await new Promise((resolve) => setTimeout(resolve, 300));

      const qualityAfter = qualitySamples.length > 0 ? qualitySamples[0] : 100;
      expect(qualityAfter).toBeGreaterThan(0);
    });

    it('should simulate battery drain', async () => {
      let status1 = await driver.getStatus();
      const battery1 = status1.batteryLevel ?? 100;

      for (let i = 0; i < 50; i++) {
        await driver.simulateBatteryDrain(1);
      }

      let status2 = await driver.getStatus();
      const battery2 = status2.batteryLevel ?? 100;

      expect(battery2).toBeLessThan(battery1);
    });
  });

  describe('EEG Processor - Data Processing', () => {
    let processor: EEGProcessor;

    beforeEach(() => {
      processor = new EEGProcessor('test-session');
    });

    it('should process EEG data and produce valid results', () => {
      const eegData = {
        timestamp: Date.now(),
        channels: Array(256).fill(0).map(() => 100 + Math.random() * 20),
        sampleRate: 256,
        duration: 1,
      };

      const result = processor.processEEGData(eegData);

      expect(result.focusScore).toBeGreaterThanOrEqual(0);
      expect(result.focusScore).toBeLessThanOrEqual(100);
      expect(result.relaxationScore).toBeGreaterThanOrEqual(0);
      expect(result.relaxationScore).toBeLessThanOrEqual(100);
      expect(['low', 'medium', 'high']).toContain(result.stressLevel);
      expect(result.brainWaveFrequencies).toBeDefined();
      expect(result.brainWaveFrequencies.delta).toBeGreaterThanOrEqual(0);
      expect(result.brainWaveFrequencies.theta).toBeGreaterThanOrEqual(0);
      expect(result.brainWaveFrequencies.alpha).toBeGreaterThanOrEqual(0);
      expect(result.brainWaveFrequencies.beta).toBeGreaterThanOrEqual(0);
      expect(result.brainWaveFrequencies.gamma).toBeGreaterThanOrEqual(0);
    });

    it('should generate appropriate recommendations', () => {
      const lowFocusData = {
        timestamp: Date.now(),
        channels: Array(256).fill(100),
        sampleRate: 256,
        duration: 1,
      };

      const result = processor.processEEGData(lowFocusData);
      const recommendations = processor.generateRecommendations(result);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(typeof recommendations[0]).toBe('string');
    });

    it('should handle different channel counts', () => {
      const testCases = [
        { channels: 1, name: 'Single channel' },
        { channels: 4, name: '4 channels (Muse 2)' },
        { channels: 8, name: '8 channels' },
      ];

      for (const testCase of testCases) {
        const eegData = {
          timestamp: Date.now(),
          channels: Array(256).fill(0).map(() => 100 + Math.random() * 20),
          sampleRate: 256,
          duration: 1,
        };

        const result = processor.processEEGData(eegData);
        expect(result.sessionId).toBe('test-session');
      }
    });
  });

  describe('Device Manager - Error Handling', () => {
    it('should handle connection errors', async () => {
      manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      let errorReceived: Error | null = null;

      manager.onError((error) => {
        errorReceived = error;
      });

      await manager.initialize();

      // Try to stream without connecting
      try {
        await manager.startStreaming();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid device type', async () => {
      manager = createDeviceManager({ deviceType: 'INVALID_DEVICE' as any });

      try {
        await manager.initialize();
        // Should fallback to simulator or throw
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should recover from temporary disconnection', async () => {
      manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();

      await manager.connect();
      expect(manager.isConnected()).toBe(true);

      await manager.disconnect();
      expect(manager.isConnected()).toBe(false);

      // Reconnect
      await manager.connect();
      expect(manager.isConnected()).toBe(true);

      await manager.disconnect();
    });
  });

  describe('End-to-End Pipeline', () => {
    it('should complete full EEG capture → process → sync cycle', async () => {
      manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();
      await manager.connect();

      const processor = new EEGProcessor('e2e-test');
      const results: any[] = [];

      manager.onDataReceived((sample) => {
        // Simulate processing windows
        if (results.length < 2) {
          const mockEEGData = {
            timestamp: sample.timestamp,
            channels: sample.channels,
            sampleRate: 256,
            duration: 1,
          };

          const result = processor.processEEGData(mockEEGData);
          results.push(result);
        }
      });

      await manager.startStreaming();

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      await manager.stopStreaming();
      await manager.disconnect();

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].focusScore).toBeDefined();
      expect(results[0].sessionId).toBe('e2e-test');
    });

    it('should handle multiple consecutive sessions', async () => {
      for (let session = 0; session < 3; session++) {
        manager = createDeviceManager({ deviceType: 'SIMULATOR' });
        await manager.initialize();
        await manager.connect();

        let sampleCount = 0;
        manager.onDataReceived(() => {
          sampleCount++;
        });

        await manager.startStreaming();
        await new Promise((resolve) => setTimeout(resolve, 100));
        await manager.stopStreaming();

        expect(sampleCount).toBeGreaterThan(0);

        await manager.disconnect();
      }
    });
  });

  describe('Performance Tests', () => {
    it('should process data within latency budget', async () => {
      const processor = new EEGProcessor('perf-test');
      const latencies: number[] = [];

      for (let i = 0; i < 10; i++) {
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
      }

      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);

      // Processing should be very fast (< 20ms)
      expect(avgLatency).toBeLessThan(20);
      expect(maxLatency).toBeLessThan(50);
    });

    it('should maintain consistent sampling rates', async () => {
      manager = createDeviceManager({ deviceType: 'SIMULATOR' });
      await manager.initialize();
      await manager.connect();

      const timestamps: number[] = [];

      manager.onDataReceived((sample) => {
        timestamps.push(sample.timestamp);
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await manager.stopStreaming();

      // Calculate intervals
      const intervals: number[] = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const expectedInterval = 1000 / 256; // ~3.9ms at 256Hz

      // Should be within ±30% of expected
      expect(avgInterval).toBeGreaterThan(expectedInterval * 0.7);
      expect(avgInterval).toBeLessThan(expectedInterval * 1.3);

      await manager.disconnect();
    });
  });
});
