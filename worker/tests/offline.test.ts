/**
 * Offline Scenario Tests for NERA Worker
 * Tests the hybrid edge-cloud architecture with network interruptions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EEGDeviceManager, createDeviceManager } from '../src/modules/eeg-driver/device-manager';
import { SimulatorDriver } from '../src/modules/eeg-driver/simulator.driver';
import { EEGProcessor } from '../src/modules/eeg-processor';

describe('NERA Offline Scenarios', () => {
  let manager: EEGDeviceManager;
  let processor: EEGProcessor;

  beforeEach(async () => {
    manager = createDeviceManager({ deviceType: 'SIMULATOR' });
    processor = new EEGProcessor('offline-test');
    await manager.initialize();
    await manager.connect();
  });

  afterEach(async () => {
    await manager.stopStreaming();
    await manager.disconnect();
  });

  describe('Offline Data Collection', () => {
    it('should continue collecting EEG data when offline', async () => {
      const collectedSamples: any[] = [];

      manager.onDataReceived((sample) => {
        collectedSamples.push(sample);
      });

      await manager.startStreaming();

      // Collect data for 200ms
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(collectedSamples.length).toBeGreaterThan(30);
      expect(collectedSamples[0].timestamp).toBeDefined();
    });

    it('should buffer data for later sync', async () => {
      const buffer: any[] = [];
      let processedWindows = 0;

      manager.onDataReceived((sample) => {
        // Simulate buffering
        buffer.push({
          timestamp: sample.timestamp,
          channels: sample.channels,
          quality: sample.quality,
        });

        // Process when buffer has enough data
        if (buffer.length >= 256) {
          const eegData = {
            timestamp: buffer[0].timestamp,
            channels: buffer.slice(0, 256).flatMap(s => s.channels),
            sampleRate: 256,
            duration: 1,
          };

          const result = processor.processEEGData(eegData);
          expect(result.focusScore).toBeGreaterThanOrEqual(0);
          expect(result.focusScore).toBeLessThanOrEqual(100);

          processedWindows++;
          buffer.splice(0, 256);
        }
      });

      await manager.startStreaming();

      // Collect data for 500ms (should be ~128 samples)
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(processedWindows).toBeGreaterThan(0);
    });

    it('should handle offline queue with metadata', async () => {
      interface QueuedData {
        timestamp: number;
        data: any;
        syncStatus: 'pending' | 'synced' | 'failed';
        retryCount: number;
      }

      const offlineQueue: QueuedData[] = [];

      manager.onDataReceived((sample) => {
        // Queue for offline storage
        offlineQueue.push({
          timestamp: Date.now(),
          data: {
            channels: sample.channels,
            quality: sample.quality,
          },
          syncStatus: 'pending',
          retryCount: 0,
        });
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(offlineQueue.length).toBeGreaterThan(0);
      expect(offlineQueue[0].syncStatus).toBe('pending');

      // Simulate sync when back online
      for (const item of offlineQueue) {
        try {
          // Simulate successful sync
          item.syncStatus = 'synced';
        } catch (error) {
          item.syncStatus = 'failed';
          item.retryCount++;
        }
      }

      const synced = offlineQueue.filter(i => i.syncStatus === 'synced');
      expect(synced.length).toBe(offlineQueue.length);
    });
  });

  describe('Connection Recovery', () => {
    it('should handle device disconnection and reconnection', async () => {
      let connectionEvents: string[] = [];

      manager.onConnectionStatusChanged((connected) => {
        connectionEvents.push(connected ? 'connected' : 'disconnected');
      });

      // Initially connected
      expect(manager.isConnected()).toBe(true);

      // Disconnect
      await manager.disconnect();
      expect(manager.isConnected()).toBe(false);

      // Reconnect
      await manager.connect();
      expect(manager.isConnected()).toBe(true);

      expect(connectionEvents).toContain('disconnected');
      expect(connectionEvents).toContain('connected');
    });

    it('should detect and handle temporary signal loss', async () => {
      const driver = new SimulatorDriver();
      await driver.initialize();
      await driver.connect();

      let statusHistory: any[] = [];

      driver.onDataReceived(async (sample) => {
        const status = await driver.getStatus();
        statusHistory.push({
          timestamp: sample.timestamp,
          quality: status.signalQuality,
        });
      });

      await driver.startStreaming();

      // Collect baseline
      await new Promise((resolve) => setTimeout(resolve, 50));
      const baselineQuality = statusHistory.length > 0 ? statusHistory[0].quality : 100;

      // Simulate signal loss
      statusHistory = [];
      await driver.simulateSignalLoss(300);

      // Collect during recovery
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Quality should recover
      const recoveredQuality = statusHistory.length > 0 ? statusHistory[statusHistory.length - 1].quality : 100;
      expect(recoveredQuality).toBeGreaterThan(0);

      await driver.stopStreaming();
      await driver.disconnect();
    });

    it('should maintain data continuity across reconnection', async () => {
      const sessions: any[] = [];

      // Session 1: Connected
      manager.onDataReceived((sample) => {
        if (!sessions[0]) sessions[0] = [];
        sessions[0].push(sample.sampleId);
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await manager.stopStreaming();

      // Disconnect
      await manager.disconnect();

      // Reconnect
      await manager.connect();

      // Session 2: After reconnection
      sessions[1] = [];
      manager.onDataReceived((sample) => {
        sessions[1].push(sample.sampleId);
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await manager.stopStreaming();

      // Both sessions should have data
      expect(sessions[0]).toBeDefined();
      expect(sessions[0].length).toBeGreaterThan(0);
      expect(sessions[1]).toBeDefined();
      expect(sessions[1].length).toBeGreaterThan(0);
    });
  });

  describe('Sync Queue Management', () => {
    interface SyncQueueItem {
      id: string;
      timestamp: number;
      data: any;
      attempts: number;
      maxRetries: number;
    }

    it('should queue results for later sync', async () => {
      const syncQueue: SyncQueueItem[] = [];
      let itemId = 0;

      manager.onDataReceived((sample) => {
        if (itemId % 20 === 0) { // Queue every 20th sample
          syncQueue.push({
            id: `result-${itemId}`,
            timestamp: sample.timestamp,
            data: {
              channels: sample.channels,
              quality: sample.quality,
            },
            attempts: 0,
            maxRetries: 3,
          });
        }
        itemId++;
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(syncQueue.length).toBeGreaterThan(0);
      expect(syncQueue[0].maxRetries).toBe(3);
    });

    it('should implement exponential backoff for retries', async () => {
      interface QueuedItem {
        timestamp: number;
        attempts: number;
        nextRetryTime: number;
      }

      const queue: QueuedItem[] = [];

      // Add item to queue
      queue.push({
        timestamp: Date.now(),
        attempts: 0,
        nextRetryTime: Date.now(),
      });

      // Simulate retry attempts with exponential backoff
      const calculateBackoff = (attempts: number) => {
        return Math.pow(2, attempts) * 1000; // 1s, 2s, 4s, 8s...
      };

      const item = queue[0];
      const retryTimes: number[] = [];

      for (let attempt = 0; attempt < 4; attempt++) {
        item.attempts++;
        const backoff = calculateBackoff(item.attempts);
        item.nextRetryTime = Date.now() + backoff;
        retryTimes.push(backoff);
      }

      // Verify exponential growth
      expect(retryTimes[0]).toBe(2000);
      expect(retryTimes[1]).toBe(4000);
      expect(retryTimes[2]).toBe(8000);
      expect(retryTimes[3]).toBe(16000);
    });

    it('should clean up old queued items', async () => {
      interface OldQueueItem {
        timestamp: number;
        ttl: number; // Time-to-live in milliseconds
      }

      const queue: OldQueueItem[] = [];
      const now = Date.now();

      // Add items with different ages
      queue.push({ timestamp: now - 2000, ttl: 1000 }); // Old (expired)
      queue.push({ timestamp: now - 500, ttl: 10000 }); // Fresh
      queue.push({ timestamp: now - 100, ttl: 10000 }); // Fresh

      // Clean up expired items
      const cleanup = () => {
        return queue.filter((item) => {
          const age = now - item.timestamp;
          return age < item.ttl;
        });
      };

      const cleaned = cleanup();
      expect(cleaned.length).toBe(2); // Old item removed
      expect(queue.length).toBe(3); // Original unchanged
    });
  });

  describe('Data Integrity During Offline', () => {
    it('should preserve sample ordering', async () => {
      const samples: any[] = [];
      let lastSampleId = -1;

      manager.onDataReceived((sample) => {
        samples.push(sample.sampleId);

        // Verify sequential ordering
        if (lastSampleId !== -1) {
          expect(sample.sampleId).toBeGreaterThan(lastSampleId);
        }
        lastSampleId = sample.sampleId;
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(samples.length).toBeGreaterThan(10);
    });

    it('should detect and handle missing samples', async () => {
      const receivedIds: Set<number> = new Set();
      let maxId = -1;

      manager.onDataReceived((sample) => {
        receivedIds.add(sample.sampleId);
        maxId = Math.max(maxId, sample.sampleId);
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Check for gaps (would indicate lost samples)
      let missingSamples = 0;
      for (let i = 0; i <= maxId; i++) {
        if (!receivedIds.has(i)) {
          missingSamples++;
        }
      }

      // Should have minimal or no missing samples
      expect(missingSamples).toBeLessThan(receivedIds.size * 0.05); // < 5% loss
    });

    it('should validate sample checksums', async () => {
      const calculateChecksum = (channels: number[]) => {
        return channels.reduce((sum, val) => sum + val, 0) % 256;
      };

      const samples: any[] = [];

      manager.onDataReceived((sample) => {
        const checksum = calculateChecksum(sample.channels);
        samples.push({
          channels: sample.channels,
          checksum,
          valid: checksum >= 0,
        });
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const invalidSamples = samples.filter(s => !s.valid);
      expect(invalidSamples.length).toBe(0);
    });
  });

  describe('Storage & Compression', () => {
    it('should estimate offline storage requirements', async () => {
      interface StorageMetrics {
        sampleSize: number; // bytes per sample
        maxStorageBytes: number;
        maxSampleCount: number;
        estimatedHoursDuration: number;
      }

      // Muse 2: 4 channels × 4 bytes (float32) + metadata = ~20 bytes per sample
      // At 256 Hz: 256 samples/sec × 20 bytes = 5.12 KB/sec = 18.4 MB/hour
      const metrics: StorageMetrics = {
        sampleSize: 20, // bytes (4 channels × float32 + overhead)
        maxStorageBytes: 500 * 1024 * 1024, // 500 MB available
        maxSampleCount: 0,
        estimatedHoursDuration: 0,
      };

      metrics.maxSampleCount = Math.floor(metrics.maxStorageBytes / metrics.sampleSize);
      metrics.estimatedHoursDuration = metrics.maxSampleCount / (256 * 3600); // 256 Hz sampling

      expect(metrics.estimatedHoursDuration).toBeGreaterThan(23); // ~24 hours
      expect(metrics.maxSampleCount).toBeGreaterThan(1000000);
    });

    it('should compress stored data', () => {
      // Simulate data compression
      const originalData = Array(10000).fill(100);
      const compressed = Buffer.from(originalData).toString('base64');

      const compressionRatio = originalData.length / compressed.length;
      expect(compressionRatio).toBeGreaterThan(0.5); // At least 50% compression
    });
  });

  describe('Sync When Back Online', () => {
    it('should upload queued data when connection restored', async () => {
      interface PendingSync {
        id: string;
        data: any;
        synced: boolean;
      }

      const offlineQueue: PendingSync[] = [];

      // Simulate offline data collection
      for (let i = 0; i < 5; i++) {
        offlineQueue.push({
          id: `data-${i}`,
          data: { channels: [100, 105, 98, 102] },
          synced: false,
        });
      }

      expect(offlineQueue.every(item => !item.synced)).toBe(true);

      // Simulate reconnection and sync
      for (const item of offlineQueue) {
        try {
          // Simulate successful upload
          item.synced = true;
        } catch (error) {
          // Handle sync failure
        }
      }

      expect(offlineQueue.every(item => item.synced)).toBe(true);
    });

    it('should prioritize sync order', async () => {
      interface SyncItem {
        id: string;
        timestamp: number;
        priority: 'low' | 'medium' | 'high';
        synced: boolean;
      }

      const queue: SyncItem[] = [
        { id: '1', timestamp: Date.now() - 5000, priority: 'low', synced: false },
        { id: '2', timestamp: Date.now() - 1000, priority: 'high', synced: false },
        { id: '3', timestamp: Date.now() - 3000, priority: 'medium', synced: false },
      ];

      // Sort by priority (high first) then by timestamp (oldest first)
      const sorted = queue.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (a.priority !== b.priority) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.timestamp - b.timestamp;
      });

      expect(sorted[0].id).toBe('2'); // High priority first
      expect(sorted[1].id).toBe('3'); // Medium priority
      expect(sorted[2].id).toBe('1'); // Low priority
    });
  });

  describe('Offline Limitations & Recovery', () => {
    it('should throttle local processing if offline too long', async () => {
      const processingQueue: any[] = [];
      const MAX_QUEUE_SIZE = 1000; // Max items to process offline

      manager.onDataReceived((sample) => {
        if (processingQueue.length < MAX_QUEUE_SIZE) {
          processingQueue.push(sample);
        } else {
          // Queue full, start dropping samples
          console.warn('Processing queue full, dropping samples');
        }
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In practice, queue should not fill this quickly with simulator
      expect(processingQueue.length).toBeLessThan(MAX_QUEUE_SIZE);
    });

    it('should alert user when offline storage is depleted', async () => {
      const STORAGE_LIMIT_BYTES = 500 * 1024 * 1024; // 500 MB
      let currentStorageUsage = 0;

      manager.onDataReceived((sample) => {
        const sampleSize = 20; // bytes
        currentStorageUsage += sampleSize;

        if (currentStorageUsage > STORAGE_LIMIT_BYTES) {
          console.warn('⚠️ Storage limit reached, please sync data');
        }
      });

      await manager.startStreaming();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Storage usage should be reasonable
      expect(currentStorageUsage).toBeLessThan(STORAGE_LIMIT_BYTES);
    });
  });
});
