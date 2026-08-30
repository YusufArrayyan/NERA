/**
 * Muse 2 EEG Headband Driver
 * Supports Muse 2 (2nd generation) via Bluetooth LE
 * 
 * Muse 2 Specs:
 * - 4 EEG channels (TP9, AF7, AF8, TP10)
 * - 256 Hz sampling rate
 * - Bluetooth LE connection
 * - 5-6 hour battery life
 */

import { EEGDeviceDriver, EEGDeviceConfig, RawEEGSample, DeviceStatus } from './eeg-device.interface';

export class Muse2Driver implements EEGDeviceDriver {
  private config: EEGDeviceConfig;
  private isConnected: boolean = false;
  private isStreaming: boolean = false;
  private dataCallback?: (sample: RawEEGSample) => void;
  private statusCallback?: (connected: boolean) => void;
  private errorCallback?: (error: Error) => void;
  private sampleCounter: number = 0;
  private lastDataTimestamp: number = 0;

  // Muse 2 specific properties
  private deviceInfo: Record<string, string> = {};
  private signalQuality: number = 0;
  private batteryLevel: number = 100;

  constructor() {
    this.config = {
      deviceType: 'MUSE_2',
      samplingRate: 256,
      channelCount: 4,
    };
  }

  async initialize(config: EEGDeviceConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    console.log('[Muse2Driver] Initialized with config:', this.config);

    // In production, this would establish Bluetooth LE connection
    // For now, we simulate the device
    this.setupSimulation();
  }

  async connect(): Promise<void> {
    console.log('[Muse2Driver] Connecting...');

    // In production: Actual Bluetooth LE connection logic
    // const device = await navigator.bluetooth.requestDevice({
    //   filters: [{ services: ['4a4e5523-1fb5-40da-8652-96ba4e125703'] }],
    // });
    // this.device = await device.gatt.connect();

    // Simulate connection
    await this.simulateConnection();

    this.isConnected = true;
    this.statusCallback?.(true);
    console.log('[Muse2Driver] Connected successfully');
  }

  async disconnect(): Promise<void> {
    console.log('[Muse2Driver] Disconnecting...');
    this.isConnected = false;
    this.isStreaming = false;
    this.statusCallback?.(false);
    console.log('[Muse2Driver] Disconnected');
  }

  isConnected(): boolean {
    return this.isConnected;
  }

  async getStatus(): Promise<DeviceStatus> {
    return {
      connected: this.isConnected,
      deviceType: 'Muse 2',
      signalQuality: this.signalQuality,
      batteryLevel: this.batteryLevel,
      lastDataPoint: this.lastDataTimestamp,
      activeChannels: 4,
      samplingRate: 256,
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

    console.log('[Muse2Driver] Starting data stream...');
    this.isStreaming = true;

    // Start simulation or real data streaming
    this.startDataStream();
  }

  async stopStreaming(): Promise<void> {
    console.log('[Muse2Driver] Stopping data stream...');
    this.isStreaming = false;
  }

  async getDeviceInfo(): Promise<Record<string, string>> {
    return {
      deviceType: 'Muse 2',
      firmwareVersion: '4.4.10',
      serialNumber: 'MUSE-' + Math.random().toString(36).substring(7).toUpperCase(),
      hardwareRevision: 'B',
      channels: '4 (TP9, AF7, AF8, TP10)',
      samplingRate: '256 Hz',
    };
  }

  async calibrate(duration: number): Promise<void> {
    console.log(`[Muse2Driver] Calibrating for ${duration}ms...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Muse2Driver] Calibration complete');
        resolve();
      }, duration);
    });
  }

  // ============ PRIVATE HELPER METHODS ============

  private setupSimulation(): void {
    this.deviceInfo = {
      deviceType: 'Muse 2',
      firmwareVersion: '4.4.10',
      serialNumber: 'MUSE-' + Math.random().toString(36).substring(7).toUpperCase(),
    };
  }

  private async simulateConnection(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.signalQuality = Math.random() * 100;
        this.batteryLevel = 75 + Math.random() * 25;
        resolve();
      }, 500);
    });
  }

  private startDataStream(): void {
    const interval = setInterval(() => {
      if (!this.isStreaming) {
        clearInterval(interval);
        return;
      }

      const sample: RawEEGSample = {
        timestamp: Date.now(),
        channels: this.generateMuseChannelData(),
        sampleId: this.sampleCounter++,
        quality: Math.max(40, Math.min(100, this.signalQuality + (Math.random() - 0.5) * 10)),
      };

      this.lastDataTimestamp = sample.timestamp;
      this.dataCallback?.(sample);
    }, 1000 / 256); // 256 Hz sampling rate = ~3.9ms between samples
  }

  /**
   * Generate simulated Muse 2 channel data
   * Muse 2 has 4 EEG channels: TP9, AF7, AF8, TP10
   */
  private generateMuseChannelData(): number[] {
    const baselineSignal = 100; // Typical baseline around 100 µV
    const noiseLevel = 10;
    const oscillation = Math.sin(Date.now() / 1000) * 20; // Slow oscillation

    return [
      baselineSignal + oscillation + (Math.random() - 0.5) * noiseLevel, // TP9
      baselineSignal + oscillation + (Math.random() - 0.5) * noiseLevel, // AF7
      baselineSignal + oscillation + (Math.random() - 0.5) * noiseLevel, // AF8
      baselineSignal + oscillation + (Math.random() - 0.5) * noiseLevel, // TP10
    ];
  }
}
