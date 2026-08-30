/**
 * EEG Simulator Driver
 * Simulates realistic EEG data for development and testing
 * Supports multiple channel configurations
 */

import { EEGDeviceDriver, EEGDeviceConfig, RawEEGSample, DeviceStatus } from './eeg-device.interface';

export class SimulatorDriver implements EEGDeviceDriver {
  private config: EEGDeviceConfig;
  private isConnected: boolean = false;
  private isStreaming: boolean = false;
  private dataCallback?: (sample: RawEEGSample) => void;
  private statusCallback?: (connected: boolean) => void;
  private errorCallback?: (error: Error) => void;
  private sampleCounter: number = 0;
  private lastDataTimestamp: number = 0;

  // Simulation state
  private signalQuality: number = 95;
  private batteryLevel: number = 100;
  private focusModulation: number = 0; // -1 to 1
  private stressModulation: number = 0; // -1 to 1

  constructor() {
    this.config = {
      deviceType: 'SIMULATOR',
      samplingRate: 256,
      channelCount: 4,
    };
  }

  async initialize(config: EEGDeviceConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    console.log('[SimulatorDriver] Initialized with config:', this.config);
  }

  async connect(): Promise<void> {
    console.log('[SimulatorDriver] Connecting...');
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.isConnected = true;
    this.statusCallback?.(true);
    console.log('[SimulatorDriver] Connected successfully');
  }

  async disconnect(): Promise<void> {
    console.log('[SimulatorDriver] Disconnecting...');
    this.isConnected = false;
    this.isStreaming = false;
    this.statusCallback?.(false);
    console.log('[SimulatorDriver] Disconnected');
  }

  isConnected(): boolean {
    return this.isConnected;
  }

  async getStatus(): Promise<DeviceStatus> {
    return {
      connected: this.isConnected,
      deviceType: 'EEG Simulator',
      signalQuality: this.signalQuality,
      batteryLevel: this.batteryLevel,
      lastDataPoint: this.lastDataTimestamp,
      activeChannels: this.config.channelCount || 4,
      samplingRate: this.config.samplingRate || 256,
    };
  }

  onDataReceived(callback: (sample: RawEEGSample) => void): void {
    this.dataCallback = callback;
  }

  onConnectionStatusChanged(callback: (connected: boolean) => void): void {
    this.statusCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  async startStreaming(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Device not connected. Call connect() first.');
    }

    console.log('[SimulatorDriver] Starting data stream...');
    this.isStreaming = true;
    this.startDataStream();
  }

  async stopStreaming(): Promise<void> {
    console.log('[SimulatorDriver] Stopping data stream...');
    this.isStreaming = false;
  }

  async getDeviceInfo(): Promise<Record<string, string>> {
    return {
      deviceType: 'EEG Simulator',
      version: '1.0.0',
      mode: 'simulation',
      channels: (this.config.channelCount || 4).toString(),
      samplingRate: (this.config.samplingRate || 256).toString() + ' Hz',
    };
  }

  /**
   * Set focus level for simulation (0-100)
   * Used to simulate different mental states
   */
  setFocusLevel(level: number): void {
    this.focusModulation = (level - 50) / 50; // -1 to 1
  }

  /**
   * Set stress level for simulation (0-100)
   * Used to simulate different stress states
   */
  setStressLevel(level: number): void {
    this.stressModulation = (level - 50) / 50; // -1 to 1
  }

  /**
   * Simulate loss of signal
   */
  async simulateSignalLoss(duration: number): Promise<void> {
    console.log(`[SimulatorDriver] Simulating signal loss for ${duration}ms...`);
    const originalQuality = this.signalQuality;
    this.signalQuality = 0;

    return new Promise((resolve) => {
      setTimeout(() => {
        this.signalQuality = originalQuality;
        console.log('[SimulatorDriver] Signal restored');
        resolve();
      }, duration);
    });
  }

  /**
   * Simulate battery drain
   */
  async simulateBatteryDrain(drain: number): Promise<void> {
    this.batteryLevel = Math.max(0, this.batteryLevel - drain);
    if (this.batteryLevel < 10) {
      console.warn('[SimulatorDriver] Low battery warning!');
    }
  }

  // ============ PRIVATE HELPER METHODS ============

  private startDataStream(): void {
    const samplingInterval = 1000 / (this.config.samplingRate || 256);

    const interval = setInterval(() => {
      if (!this.isStreaming) {
        clearInterval(interval);
        return;
      }

      const channels = this.generateSimulatedChannels();

      const sample: RawEEGSample = {
        timestamp: Date.now(),
        channels,
        sampleId: this.sampleCounter++,
        quality: Math.max(0, this.signalQuality + (Math.random() - 0.5) * 5),
      };

      this.lastDataTimestamp = sample.timestamp;

      // Slowly drain battery
      if (this.sampleCounter % 2560 === 0) {
        this.batteryLevel = Math.max(0, this.batteryLevel - 0.1);
      }

      this.dataCallback?.(sample);
    }, samplingInterval);
  }

  /**
   * Generate realistic simulated EEG channels
   * Simulates multiple channels with different frequency components
   */
  private generateSimulatedChannels(): number[] {
    const channelCount = this.config.channelCount || 4;
    const channels: number[] = [];
    const time = this.sampleCounter / (this.config.samplingRate || 256);

    for (let ch = 0; ch < channelCount; ch++) {
      // Base signal (similar across channels)
      const baselineSignal = 100 + ch * 10;

      // Delta waves (0.5-4 Hz): Sleep, deep relaxation
      const deltaFreq = 2;
      const delta =
        20 * Math.sin(2 * Math.PI * deltaFreq * time) *
        (0.5 + this.stressModulation * 0.3 - this.focusModulation * 0.2);

      // Theta waves (4-8 Hz): Drowsiness, meditation
      const thetaFreq = 6;
      const theta =
        15 * Math.sin(2 * Math.PI * thetaFreq * time) *
        (0.4 + this.stressModulation * 0.2);

      // Alpha waves (8-12 Hz): Relaxation, closed eyes
      const alphaFreq = 10;
      const alpha =
        25 * Math.sin(2 * Math.PI * alphaFreq * time) *
        (0.6 + this.focusModulation * 0.2);

      // Beta waves (12-30 Hz): Active thinking, focus
      const betaFreq = 20;
      const beta =
        12 * Math.sin(2 * Math.PI * betaFreq * time) *
        (0.3 + this.focusModulation * 0.5);

      // Gamma waves (30-100 Hz): Complex processing
      const gammaFreq = 50;
      const gamma =
        8 * Math.sin(2 * Math.PI * gammaFreq * time) *
        (0.2 + this.focusModulation * 0.3);

      // Add noise
      const noise = (Math.random() - 0.5) * 10 * (1 - this.signalQuality / 100);

      // Combine all components
      const signal = baselineSignal + delta + theta + alpha + beta + gamma + noise;

      // Add small channel-specific variations
      const channelVariation = (ch % 2 === 0 ? 1 : -1) * Math.sin(time * 0.5) * 5;

      channels.push(signal + channelVariation);
    }

    return channels;
  }
}
