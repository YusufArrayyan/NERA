/**
 * EEG Device Interface
 * Abstraction layer for different EEG headband types
 */

export interface EEGDeviceConfig {
  deviceType: 'MUSE_2' | 'NEURSKY_MINDWAVE' | 'EMOTIV_INSIGHT' | 'SIMULATOR';
  serialPort?: string;
  baudRate?: number;
  bluetoothAddress?: string;
  channelCount?: number;
  samplingRate?: number;
}

export interface RawEEGSample {
  timestamp: number;
  channels: number[]; // Raw channel values
  sampleId: number;
  quality?: number; // 0-100, signal quality
}

export interface DeviceStatus {
  connected: boolean;
  deviceType: string;
  signalQuality: number; // 0-100
  batteryLevel?: number; // 0-100
  lastDataPoint?: number; // Unix timestamp
  activeChannels: number;
  samplingRate: number;
}

export interface EEGDeviceDriver {
  /**
   * Initialize connection to EEG device
   */
  initialize(config: EEGDeviceConfig): Promise<void>;

  /**
   * Connect to the physical device
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the device
   */
  disconnect(): Promise<void>;

  /**
   * Check if device is currently connected
   */
  isConnected(): boolean;

  /**
   * Get current device status
   */
  getStatus(): Promise<DeviceStatus>;

  /**
   * Set callback for when new EEG data arrives
   */
  onDataReceived(callback: (sample: RawEEGSample) => void): void;

  /**
   * Set callback for connection events
   */
  onConnectionStatusChanged(callback: (connected: boolean) => void): void;

  /**
   * Set callback for errors
   */
  onError(callback: (error: Error) => void): void;

  /**
   * Stream EEG data continuously
   */
  startStreaming(): Promise<void>;

  /**
   * Stop streaming EEG data
   */
  stopStreaming(): Promise<void>;

  /**
   * Get device info (name, firmware version, etc)
   */
  getDeviceInfo(): Promise<Record<string, string>>;

  /**
   * Calibrate the device (if supported)
   */
  calibrate?(duration: number): Promise<void>;
}
