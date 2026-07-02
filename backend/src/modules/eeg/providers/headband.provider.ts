import { Injectable, Logger } from '@nestjs/common';
import {
  IEEGProvider,
  EEGDataPoint,
  StreamConfig,
  DeviceStatus,
} from '../interfaces/eeg-provider.interface';

/**
 * Future Headband Provider (Placeholder)
 * This class will be implemented when a real EEG headband device is available.
 * It implements the same IEEGProvider interface, allowing seamless replacement.
 */
@Injectable()
export class HeadbandProvider implements IEEGProvider {
  private readonly logger = new Logger(HeadbandProvider.name);

  async connect(): Promise<void> {
    // TODO: Implement BLE/WiFi connection to real headband
    this.logger.warn('HeadbandProvider.connect() - Not yet implemented');
    throw new Error('Real headband device not yet integrated. Use simulator.');
  }

  async disconnect(): Promise<void> {
    // TODO: Implement disconnection
    this.logger.warn('HeadbandProvider.disconnect() - Not yet implemented');
  }

  startStream(_config: StreamConfig): void {
    // TODO: Implement real device streaming
    throw new Error('Real headband streaming not yet implemented.');
  }

  stopStream(): void {
    // TODO: Implement stream stop
  }

  getDataPoint(_pattern?: string): EEGDataPoint {
    // TODO: Get real data from device
    throw new Error('Real headband data not yet available.');
  }

  getStatus(): DeviceStatus {
    return {
      connected: false,
      provider: 'headband',
    };
  }

  onData(_callback: (data: EEGDataPoint) => void): void {
    // TODO: Set up real device data callback
  }
}
