/**
 * EEG Device Manager
 * Factory and manager for EEG device drivers
 * Handles device detection, initialization, and switching
 */

import { EEGDeviceDriver, EEGDeviceConfig, RawEEGSample, DeviceStatus } from './eeg-device.interface';
import { Muse2Driver } from './muse-2.driver';
import { NeuroSkyMindWaveDriver } from './neursky-mindwave.driver';
import { SimulatorDriver } from './simulator.driver';

export class EEGDeviceManager {
  private currentDriver?: EEGDeviceDriver;
  private config: EEGDeviceConfig;
  private dataCallback?: (sample: RawEEGSample) => void;
  private statusCallback?: (connected: boolean, status?: DeviceStatus) => void;
  private errorCallback?: (error: Error) => void;
  private isInitialized: boolean = false;

  /**
   * Supported device types
   */
  static readonly SUPPORTED_DEVICES = ['MUSE_2', 'NEURSKY_MINDWAVE', 'EMOTIV_INSIGHT', 'SIMULATOR'] as const;

  constructor(config?: EEGDeviceConfig) {
    this.config = config || {
      deviceType: 'SIMULATOR',
      samplingRate: 256,
      channelCount: 4,
    };
  }

  /**
   * Initialize device manager and create appropriate driver
   */
  async initialize(config?: EEGDeviceConfig): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    console.log('[DeviceManager] Initializing device:', this.config.deviceType);

    try {
      this.currentDriver = this.createDriver(this.config.deviceType);

      if (!this.currentDriver) {
        throw new Error(`Unsupported device type: ${this.config.deviceType}`);
      }

      // Setup callbacks
      this.currentDriver.onDataReceived((sample) => this.dataCallback?.(sample));
      this.currentDriver.onConnectionStatusChanged((connected) =>
        this.statusCallback?.(connected, { connected, deviceType: this.config.deviceType || 'Unknown', activeChannels: 0, samplingRate: 0, signalQuality: 0 })
      );
      this.currentDriver.onError((error) => this.errorCallback?.(error));

      // Initialize driver
      await this.currentDriver.initialize(this.config);
      this.isInitialized = true;

      console.log('[DeviceManager] Device initialized successfully');
    } catch (error) {
      this.errorCallback?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Connect to the device
   */
  async connect(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Device manager not initialized. Call initialize() first.');
    }

    if (!this.currentDriver) {
      throw new Error('No driver available');
    }

    await this.currentDriver.connect();
  }

  /**
   * Disconnect from the device
   */
  async disconnect(): Promise<void> {
    if (!this.currentDriver) return;
    await this.currentDriver.disconnect();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.currentDriver?.isConnected() ?? false;
  }

  /**
   * Start streaming EEG data
   */
  async startStreaming(): Promise<void> {
    if (!this.currentDriver) {
      throw new Error('No driver available');
    }

    await this.currentDriver.startStreaming();
  }

  /**
   * Stop streaming EEG data
   */
  async stopStreaming(): Promise<void> {
    if (!this.currentDriver) return;
    await this.currentDriver.stopStreaming();
  }

  /**
   * Get current device status
   */
  async getStatus(): Promise<DeviceStatus> {
    if (!this.currentDriver) {
      throw new Error('No driver available');
    }

    return this.currentDriver.getStatus();
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<Record<string, string>> {
    if (!this.currentDriver) {
      throw new Error('No driver available');
    }

    return this.currentDriver.getDeviceInfo();
  }

  /**
   * Calibrate device
   */
  async calibrate(duration: number = 5000): Promise<void> {
    if (!this.currentDriver?.calibrate) {
      console.warn('[DeviceManager] Device does not support calibration');
      return;
    }

    await this.currentDriver.calibrate(duration);
  }

  /**
   * Switch to a different device type
   */
  async switchDevice(deviceType: string, config?: EEGDeviceConfig): Promise<void> {
    console.log('[DeviceManager] Switching device to:', deviceType);

    // Disconnect current device
    if (this.currentDriver) {
      await this.disconnect();
    }

    // Reinitialize with new device
    await this.initialize({
      ...this.config,
      deviceType: deviceType as any,
      ...config,
    });

    // Reconnect
    await this.connect();
  }

  /**
   * Set callback for when new data arrives
   */
  onDataReceived(callback: (sample: RawEEGSample) => void): void {
    this.dataCallback = callback;
  }

  /**
   * Set callback for connection status changes
   */
  onConnectionStatusChanged(callback: (connected: boolean, status?: DeviceStatus) => void): void {
    this.statusCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  /**
   * Auto-detect available devices (future implementation)
   * This would check serial ports, Bluetooth devices, etc.
   */
  async detectAvailableDevices(): Promise<string[]> {
    // TODO: Implement device detection
    // For now, return simulator as always available
    console.log('[DeviceManager] Device detection not yet implemented');
    return ['SIMULATOR'];
  }

  /**
   * Get list of supported devices
   */
  getSupportedDevices(): typeof EEGDeviceManager.SUPPORTED_DEVICES {
    return EEGDeviceManager.SUPPORTED_DEVICES;
  }

  /**
   * Get current device type
   */
  getCurrentDeviceType(): string {
    return this.config.deviceType || 'UNKNOWN';
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Factory method to create appropriate driver
   */
  private createDriver(deviceType: string): EEGDeviceDriver | null {
    switch (deviceType.toUpperCase()) {
      case 'MUSE_2':
        return new Muse2Driver();

      case 'NEURSKY_MINDWAVE':
        return new NeuroSkyMindWaveDriver();

      case 'SIMULATOR':
        return new SimulatorDriver();

      case 'EMOTIV_INSIGHT':
        // TODO: Implement Emotiv Insight driver
        console.warn('[DeviceManager] Emotiv Insight driver not yet implemented');
        return new SimulatorDriver(); // Fallback to simulator

      default:
        return null;
    }
  }
}

/**
 * Export factory function for easy instantiation
 */
export function createDeviceManager(config?: EEGDeviceConfig): EEGDeviceManager {
  return new EEGDeviceManager(config);
}
