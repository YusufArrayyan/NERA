/**
 * NeuroSky MindWave EEG Headband Driver
 * Supports MindWave Mobile/Mobile 2 via Bluetooth
 * 
 * MindWave Specs:
 * - 1 EEG channel (Fp1)
 * - 512 Hz raw sample rate
 * - Bluetooth connection
 * - 8+ hour battery life
 * - Extended signal processing (attention, meditation, etc)
 */

import { EEGDeviceDriver, EEGDeviceConfig, RawEEGSample, DeviceStatus } from './eeg-device.interface';

export class NeuroSkyMindWaveDriver implements EEGDeviceDriver {
  private config: EEGDeviceConfig;
  private isConnected: boolean = false;
  private isStreaming: boolean = false;
  private dataCallback?: (sample: RawEEGSample) => void;
  private statusCallback?: (connected: boolean) => void;
  private errorCallback?: (error: Error) => void;
  private sampleCounter: number = 0;
  private lastDataTimestamp: number = 0;

  // MindWave specific properties
  private deviceInfo: Record<string, string> = {};
  private signalQuality: number = 0;
  private batteryLevel: number = 100;
  private poorSignalLevel: number = 0; // 0-200 (0=good, 200=poor)
  private meditations: number[] = []; // Meditation values over time

  constructor() {
    this.config = {
      deviceType: 'NEURSKY_MINDWAVE',
      samplingRate: 512,
      channelCount: 1,
      baudRate: 57600,
    };
  }

  async initialize(config: EEGDeviceConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    console.log('[MindWaveDriver] Initialized with config:', this.config);

    // In production: Initialize serial port or Bluetooth connection
    this.setupSimulation();
  }

  async connect(): Promise<void> {
    console.log('[MindWaveDriver] Connecting...');

    // In production: Connect via serial port (COM port or Bluetooth serial)
    // const serial = await navigator.serial.requestPort({ filters: [{ usbVendorId: 0x0d28 }] });
    // await serial.open({ baudRate: 57600 });

    // Simulate connection
    await this.simulateConnection();

    this.isConnected = true;
    this.statusCallback?.(true);
    console.log('[MindWaveDriver] Connected successfully');
  }

  async disconnect(): Promise<void> {
    console.log('[MindWaveDriver] Disconnecting...');
    this.isConnected = false;
    this.isStreaming = false;
    this.statusCallback?.(false);
    console.log('[MindWaveDriver] Disconnected');
  }

  isConnected(): boolean {
    return this.isConnected;
  }

  async getStatus(): Promise<DeviceStatus> {
    // Calculate effective signal quality from poor signal level
    const effectiveQuality = Math.max(0, 100 - (this.poorSignalLevel / 200) * 100);

    return {
      connected: this.isConnected,
      deviceType: 'NeuroSky MindWave',
      signalQuality: effectiveQuality,
      batteryLevel: this.batteryLevel,
      lastDataPoint: this.lastDataTimestamp,
      activeChannels: 1,
      samplingRate: 512,
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

    console.log('[MindWaveDriver] Starting data stream...');
    this.isStreaming = true;

    // Start simulation or real data streaming
    this.startDataStream();
  }

  async stopStreaming(): Promise<void> {
    console.log('[MindWaveDriver] Stopping data stream...');
    this.isStreaming = false;
  }

  async getDeviceInfo(): Promise<Record<string, string>> {
    return {
      deviceType: 'NeuroSky MindWave Mobile 2',
      firmwareVersion: '2.0.0',
      serialNumber: 'NWM-' + Math.random().toString(36).substring(7).toUpperCase(),
      hardwareRevision: '1',
      channels: '1 (Fp1)',
      samplingRate: '512 Hz (raw), 1 Hz (processed)',
      signalProcessing: 'eSense (attention, meditation)',
    };
  }

  async calibrate(duration: number): Promise<void> {
    console.log(`[MindWaveDriver] Calibrating for ${duration}ms...`);
    this.poorSignalLevel = 0;
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[MindWaveDriver] Calibration complete');
        resolve();
      }, duration);
    });
  }

  // ============ PRIVATE HELPER METHODS ============

  private setupSimulation(): void {
    this.deviceInfo = {
      deviceType: 'NeuroSky MindWave Mobile 2',
      firmwareVersion: '2.0.0',
      serialNumber: 'NWM-' + Math.random().toString(36).substring(7).toUpperCase(),
    };
  }

  private async simulateConnection(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.poorSignalLevel = Math.random() * 50; // Good connection (0-50)
        this.batteryLevel = 80 + Math.random() * 20;
        resolve();
      }, 800);
    });
  }

  private startDataStream(): void {
    const interval = setInterval(() => {
      if (!this.isStreaming) {
        clearInterval(interval);
        return;
      }

      // MindWave typically streams raw data at higher rate and processed data at 1 Hz
      // For our purposes, we'll stream raw samples at 512 Hz
      const sample: RawEEGSample = {
        timestamp: Date.now(),
        channels: [this.generateMindWaveChannelData()],
        sampleId: this.sampleCounter++,
        quality: Math.max(0, 100 - (this.poorSignalLevel / 200) * 100),
      };

      this.lastDataTimestamp = sample.timestamp;

      // Periodically update meditation value (eSense metric)
      if (this.sampleCounter % 512 === 0) {
        this.updateMeditationValue();
      }

      this.dataCallback?.(sample);
    }, 1000 / 512); // 512 Hz sampling rate = ~1.95ms between samples
  }

  /**
   * Generate simulated MindWave channel data (Fp1)
   * MindWave provides raw EEG at 512 Hz
   */
  private generateMindWaveChannelData(): number {
    const baselineSignal = 150; // Typical baseline around 150 µV
    const noiseLevel = 15;

    // Alpha wave simulation (8-12 Hz = related to relaxation)
    const alphaFrequency = 10; // Hz
    const alphaAmplitude = 30;
    const alphaWave = alphaAmplitude * Math.sin((this.sampleCounter * 2 * Math.PI * alphaFrequency) / 512);

    // Add noise
    const noise = (Math.random() - 0.5) * noiseLevel * 2;

    return baselineSignal + alphaWave + noise;
  }

  /**
   * Update meditation value (eSense metric)
   * Meditation ranges from 0-100
   */
  private updateMeditationValue(): void {
    const newMeditation = 40 + Math.random() * 40; // 40-80 range
    this.meditations.push(newMeditation);

    // Keep last 60 values (60 seconds of meditation at 1 Hz)
    if (this.meditations.length > 60) {
      this.meditations.shift();
    }

    // Update signal quality based on stability
    const avgMeditation = this.meditations.reduce((a, b) => a + b, 0) / this.meditations.length;
    const variance =
      this.meditations.reduce((sum, val) => sum + Math.pow(val - avgMeditation, 2), 0) /
      this.meditations.length;

    // Better consistency = better signal quality
    this.signalQuality = Math.max(40, 100 - Math.sqrt(variance) / 2);
    this.poorSignalLevel = Math.max(0, 100 - this.signalQuality);
  }
}
