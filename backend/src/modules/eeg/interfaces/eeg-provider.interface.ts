// ──────────────────────────────────────────────
// EEG Provider Interface
// This is the core abstraction that allows seamless
// replacement of simulator with real headband device
// ──────────────────────────────────────────────

export interface EEGDataPoint {
  alpha: number;      // µV² power
  beta: number;
  theta: number;
  gamma: number;
  attention: number;  // 0-100
  meditation: number; // 0-100
  signalQuality: number; // 0-100
  timestamp: Date;
  sessionId?: string;
}

export interface StreamConfig {
  samplingRate: number;  // Hz
  pattern: string;       // SimulatorPattern enum value
  noiseLevel: number;    // 0.0 - 1.0
  sessionId: string;
}

export interface DeviceStatus {
  connected: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  provider: string;
}

export interface IEEGProvider {
  /** Connect to the EEG device/simulator */
  connect(): Promise<void>;

  /** Disconnect from the device */
  disconnect(): Promise<void>;

  /** Start streaming EEG data */
  startStream(config: StreamConfig): void;

  /** Stop current data stream */
  stopStream(): void;

  /** Get single data point */
  getDataPoint(pattern?: string): EEGDataPoint;

  /** Get current device status */
  getStatus(): DeviceStatus;

  /** Set callback for new data */
  onData(callback: (data: EEGDataPoint) => void): void;
}

// DI token for the EEG provider
export const EEG_PROVIDER = 'EEG_PROVIDER';
