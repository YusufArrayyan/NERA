/**
 * NERA Worker Main Application
 * Edge-Cloud Hybrid Architecture for EEG Processing
 * 
 * This worker runs locally on user's machine to process EEG data
 * in real-time while syncing results to the cloud
 */

import { EEGProcessor, EEGData, ProcessedResult } from './modules/eeg-processor';
import { CloudSync, SyncConfig } from './modules/cloud-sync';
import { EEGDeviceManager } from './modules/eeg-driver/device-manager';
import type { EEGDeviceConfig } from './modules/eeg-driver/eeg-device.interface';

interface WorkerConfig {
  userId: string;
  sessionId: string;
  apiUrl: string;
  wsUrl: string;
  apiKey?: string;
  deviceConfig?: EEGDeviceConfig;
}

class NERAWorker {
  private eegProcessor: EEGProcessor;
  private cloudSync: CloudSync;
  private deviceManager: EEGDeviceManager;
  private config: WorkerConfig;
  private isRunning: boolean = false;
  private sampleBuffer: number[] = [];

  constructor(config: WorkerConfig) {
    this.config = config;
    this.eegProcessor = new EEGProcessor(config.sessionId);

    const syncConfig: SyncConfig = {
      apiUrl: config.apiUrl,
      wsUrl: config.wsUrl,
      apiKey: config.apiKey,
      userId: config.userId,
      sessionId: config.sessionId,
    };

    this.cloudSync = new CloudSync(syncConfig);
    this.deviceManager = new EEGDeviceManager(config.deviceConfig);
  }

  /**
   * Initialize the worker
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing NERA Worker...');
    
    // Initialize cloud sync
    await this.cloudSync.initialize();
    
    // Initialize device manager
    await this.deviceManager.initialize(this.config.deviceConfig);
    
    // Setup device callbacks
    this.deviceManager.onDataReceived((sample) => this.onEEGDataReceived(sample));
    this.deviceManager.onConnectionStatusChanged((connected, status) => {
      console.log(`📡 Device ${connected ? 'connected' : 'disconnected'}:`, status);
    });
    this.deviceManager.onError((error) => {
      console.error('❌ Device error:', error);
    });
    
    this.isRunning = true;
    console.log(`✓ NERA Worker initialized with device: ${this.deviceManager.getCurrentDeviceType()}`);
  }

  /**
   * Start a learning session
   */
  async startSession(): Promise<void> {
    console.log('▶️ Starting EEG session...');
    await this.deviceManager.connect();
    await this.deviceManager.startStreaming();
    console.log('✓ EEG streaming started');
  }

  /**
   * Stop the current session
   */
  async stopSession(): Promise<void> {
    console.log('⏹️ Stopping EEG session...');
    await this.deviceManager.stopStreaming();
    await this.deviceManager.disconnect();
    console.log('✓ EEG streaming stopped');
  }

  /**
   * Get device status
   */
  async getDeviceStatus() {
    return this.deviceManager.getStatus();
  }

  /**
   * Get device information
   */
  async getDeviceInfo() {
    return this.deviceManager.getDeviceInfo();
  }

  /**
   * Switch to a different device
   */
  async switchDevice(deviceType: string, config?: EEGDeviceConfig): Promise<void> {
    console.log(`🔄 Switching device to ${deviceType}...`);
    const wasStreaming = this.isRunning;
    
    if (wasStreaming) {
      await this.stopSession();
    }
    
    await this.deviceManager.switchDevice(deviceType, config);
    
    if (wasStreaming) {
      await this.startSession();
    }
    
    console.log(`✓ Switched to ${deviceType}`);
  }

  /**
   * Calibrate the current device
   */
  async calibrateDevice(duration?: number): Promise<void> {
    console.log('🎯 Calibrating device...');
    await this.deviceManager.calibrate(duration);
    console.log('✓ Calibration complete');
  }

  /**
   * Handle incoming EEG data
   */
  private onEEGDataReceived(sample: any): void {
    if (!this.isRunning) return;

    // Buffer samples for processing window
    this.sampleBuffer.push(...sample.channels);

    // Process when we have a full window (256 samples = 1 second @ 256Hz)
    if (this.sampleBuffer.length >= 256) {
      this.processEEGWindow();
      this.sampleBuffer = this.sampleBuffer.slice(256);
    }
  }

  /**
   * Process a full window of EEG data
   */
  private async processEEGWindow(): Promise<void> {
    const eegData: EEGData = {
      timestamp: Date.now(),
      channels: this.sampleBuffer.slice(0, 256),
      sampleRate: 256,
      duration: 1,
    };

    try {
      // Process locally
      const result = this.eegProcessor.processEEGData(eegData);

      // Send to cloud
      await this.cloudSync.sendEEGResult(result);

      // Generate recommendations
      const recommendations = this.eegProcessor.generateRecommendations(result);

      // Log results
      console.log('📊 EEG Analysis:', {
        focus: `${result.focusScore.toFixed(1)}%`,
        relaxation: `${result.relaxationScore.toFixed(1)}%`,
        stress: result.stressLevel,
        recommendations: recommendations.slice(0, 2),
      });
    } catch (error) {
      console.error('Failed to process EEG window:', error);
    }
  }

  /**
   * Get cloud sync status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      cloudSync: this.cloudSync.getStatus(),
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down NERA Worker...');
    this.isRunning = false;
    await this.cloudSync.cleanup();
    console.log('✓ NERA Worker shut down successfully');
  }
}

// Export for use in Tauri or standalone
export { NERAWorker, WorkerConfig };

// CLI usage example
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new NERAWorker({
    userId: process.env.USER_ID || 'demo-user',
    sessionId: process.env.SESSION_ID || 'demo-session',
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    wsUrl: process.env.WS_URL || 'ws://localhost:3001',
    apiKey: process.env.API_KEY,
  });

  worker.initialize().catch((err) => {
    console.error('Failed to initialize worker:', err);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await worker.shutdown();
    process.exit(0);
  });
}
