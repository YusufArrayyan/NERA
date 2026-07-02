import { Injectable, Logger } from '@nestjs/common';
import {
  IEEGProvider,
  EEGDataPoint,
  StreamConfig,
  DeviceStatus,
} from '../interfaces/eeg-provider.interface';

/**
 * EEG Simulator Provider
 * Generates realistic EEG data patterns based on neuroscience research.
 *
 * Pattern configurations based on the research paper's findings:
 * - F_ratio = P_beta / (P_alpha + P_theta)
 * - Low Focus: F_ratio < 1.0
 * - Moderate Focus: 1.0 <= F_ratio <= 1.5
 * - High Focus: F_ratio > 1.5
 */
@Injectable()
export class SimulatorProvider implements IEEGProvider {
  private readonly logger = new Logger(SimulatorProvider.name);
  private connected = false;
  private streaming = false;
  private intervalId: NodeJS.Timeout | null = null;
  private dataCallback: ((data: EEGDataPoint) => void) | null = null;
  private currentConfig: StreamConfig | null = null;

  // Pattern definitions based on research data (µV² power ranges)
  private readonly patterns: Record<string, {
    alpha: [number, number];
    beta: [number, number];
    theta: [number, number];
    gamma: [number, number];
    attention: [number, number];
    meditation: [number, number];
  }> = {
    HIGH_FOCUS: {
      alpha: [8, 11],
      beta: [22, 30],
      theta: [4, 6],
      gamma: [30, 45],
      attention: [75, 95],
      meditation: [30, 50],
    },
    MODERATE_FOCUS: {
      alpha: [11, 15],
      beta: [14, 22],
      theta: [6, 9],
      gamma: [20, 35],
      attention: [50, 75],
      meditation: [40, 60],
    },
    LOW_FOCUS: {
      alpha: [14, 20],
      beta: [8, 14],
      theta: [9, 13],
      gamma: [10, 20],
      attention: [20, 50],
      meditation: [55, 75],
    },
    STRESS: {
      alpha: [5, 8],
      beta: [25, 38],
      theta: [3, 5],
      gamma: [35, 50],
      attention: [60, 80],
      meditation: [10, 25],
    },
    FATIGUE: {
      alpha: [15, 22],
      beta: [5, 10],
      theta: [10, 16],
      gamma: [5, 15],
      attention: [10, 35],
      meditation: [60, 80],
    },
    RELAX: {
      alpha: [18, 28],
      beta: [4, 8],
      theta: [6, 10],
      gamma: [5, 12],
      attention: [15, 30],
      meditation: [70, 95],
    },
    CUSTOM: {
      alpha: [10, 15],
      beta: [15, 25],
      theta: [6, 10],
      gamma: [15, 30],
      attention: [40, 70],
      meditation: [40, 60],
    },
  };

  async connect(): Promise<void> {
    this.connected = true;
    this.logger.log('🧠 EEG Simulator connected');
  }

  async disconnect(): Promise<void> {
    this.stopStream();
    this.connected = false;
    this.logger.log('🧠 EEG Simulator disconnected');
  }

  startStream(config: StreamConfig): void {
    if (this.streaming) {
      this.stopStream();
    }

    this.currentConfig = config;
    this.streaming = true;

    // Calculate interval from sampling rate (e.g., 256Hz = ~3.9ms, but we batch to ~100ms for efficiency)
    const intervalMs = Math.max(100, Math.floor(1000 / Math.min(config.samplingRate, 10)));

    this.intervalId = setInterval(() => {
      if (this.dataCallback) {
        const dataPoint = this.getDataPoint(config.pattern);
        dataPoint.sessionId = config.sessionId;
        this.dataCallback(dataPoint);
      }
    }, intervalMs);

    this.logger.log(`📡 Streaming started: pattern=${config.pattern}, rate=${intervalMs}ms`);
  }

  stopStream(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.streaming = false;
    this.currentConfig = null;
    this.logger.log('📡 Streaming stopped');
  }

  getDataPoint(pattern?: string): EEGDataPoint {
    const patternKey = pattern || 'MODERATE_FOCUS';
    const p = this.patterns[patternKey] || this.patterns['MODERATE_FOCUS'];
    const noise = this.currentConfig?.noiseLevel || 0.1;

    return {
      alpha: this.generateValue(p.alpha[0], p.alpha[1], noise),
      beta: this.generateValue(p.beta[0], p.beta[1], noise),
      theta: this.generateValue(p.theta[0], p.theta[1], noise),
      gamma: this.generateValue(p.gamma[0], p.gamma[1], noise),
      attention: Math.round(this.generateValue(p.attention[0], p.attention[1], noise)),
      meditation: Math.round(this.generateValue(p.meditation[0], p.meditation[1], noise)),
      signalQuality: Math.round(this.generateValue(85, 100, noise * 0.5)),
      timestamp: new Date(),
    };
  }

  getStatus(): DeviceStatus {
    return {
      connected: this.connected,
      batteryLevel: 100,
      signalStrength: 95,
      provider: 'simulator',
    };
  }

  onData(callback: (data: EEGDataPoint) => void): void {
    this.dataCallback = callback;
  }

  // ─── PRIVATE HELPERS ──────────────────

  /**
   * Generate a value within range with Gaussian noise and occasional artifacts
   */
  private generateValue(min: number, max: number, noiseLevel: number): number {
    const base = min + Math.random() * (max - min);
    const noise = this.gaussianNoise() * noiseLevel * (max - min);

    // Random artifact (1% chance) — simulates real-world EEG artifacts
    const artifact = Math.random() < 0.01 ? (Math.random() - 0.5) * 20 : 0;

    const value = base + noise + artifact;
    return Math.round(value * 100) / 100; // 2 decimal places
  }

  /**
   * Box-Muller Gaussian noise generator
   */
  private gaussianNoise(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}
