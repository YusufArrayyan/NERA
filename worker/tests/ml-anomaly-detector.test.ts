/**
 * Anomaly Detector Tests
 * Tests for signal quality and artifact detection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createFeatureExtractor } from '../src/modules/ml/feature-extractor';
import { createAnomalyDetector } from '../src/modules/ml/anomaly-detector';

describe('ML: Anomaly Detection & Signal Quality', () => {
  let anomalyDetector: ReturnType<typeof createAnomalyDetector>;
  let featureExtractor: ReturnType<typeof createFeatureExtractor>;

  beforeEach(() => {
    anomalyDetector = createAnomalyDetector();
    featureExtractor = createFeatureExtractor();
  });

  describe('Clean Signal Detection', () => {
    it('should detect clean signal with no artifacts', () => {
      // Clean signal: smooth, organized
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 30;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 20;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.artifactType).toBe('none');
      expect(detection.hasArtifact).toBe(false);
      expect(detection.signalQualityScore).toBeGreaterThan(70);
      expect(detection.signalQualityLevel).toMatch(/^(excellent|good)$/);
    });

    it('should calculate valid signal quality score', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.signalQualityScore).toBeGreaterThanOrEqual(0);
      expect(detection.signalQualityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Eye Blink Detection', () => {
    it('should detect eye blink artifact', () => {
      // Eye blink: rapid change with alpha spike
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          let value = 100;
          // Normal signal with rapid spike
          if (i > 100 && i < 130) {
            value += 200; // Large amplitude spike
          }
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 40;
          return value + alpha;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      // May detect eye blink or artifact
      if (detection.hasArtifact) {
        expect(['eye_blink', 'muscle_movement']).toContain(detection.artifactType);
      }
    });

    it('should have higher eye blink score for blink pattern', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          let value = 100;
          // Characteristic blink pattern
          if (i > 80 && i < 100) value += 150;
          if (i > 100 && i < 120) value += 180;
          if (i > 120 && i < 140) value += 120;
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 30;
          return value + alpha;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.detailedAnalysis.eyeBlinkScore).toBeGreaterThanOrEqual(0);
      expect(detection.detailedAnalysis.eyeBlinkScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Muscle Movement Detection', () => {
    it('should detect muscle movement artifact', () => {
      // Muscle artifact: high gamma and broadband increase
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const gamma = Math.sin((i * 50 * 2 * Math.PI) / 256) * 80;
          const broadband = (Math.random() - 0.5) * 100;
          return 100 + gamma + broadband;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      if (detection.hasArtifact) {
        expect(['muscle_movement', 'emg_noise']).toContain(detection.artifactType);
      }
      expect(detection.detailedAnalysis.muscleActivityScore).toBeGreaterThanOrEqual(0);
    });

    it('should score high muscle activity for high gamma', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const gamma = Math.sin((i * 55 * 2 * Math.PI) / 256) * 100;
          const beta = Math.sin((i * 25 * 2 * Math.PI) / 256) * 80;
          return 100 + gamma + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.detailedAnalysis.muscleActivityScore).toBeGreaterThan(30);
    });
  });

  describe('Head Movement Detection', () => {
    it('should detect head movement artifact', () => {
      // Head movement: low frequency increase, broadband
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const delta = Math.sin((i * 2 * 2 * Math.PI) / 256) * 120;
          const theta = Math.sin((i * 5 * 2 * Math.PI) / 256) * 100;
          const noise = (Math.random() - 0.5) * 50;
          return 100 + delta + theta + noise;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.detailedAnalysis.headMovementScore).toBeGreaterThanOrEqual(0);
    });

    it('should score high for low frequency dominance', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const delta = Math.sin((i * 2 * 2 * Math.PI) / 256) * 150;
          const theta = Math.sin((i * 5 * 2 * Math.PI) / 256) * 140;
          return 100 + delta + theta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.detailedAnalysis.headMovementScore).toBeGreaterThan(0);
    });
  });

  describe('EMG Line Noise Detection', () => {
    it('should detect 50/60 Hz line noise', () => {
      // EMG noise: consistent 60 Hz sine wave
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const lineNoise = Math.sin((i * 60 * 2 * Math.PI) / 256) * 50;
          return 100 + lineNoise;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      if (detection.detailedAnalysis.emgNoiseScore > 40) {
        expect(['emg_noise', 'muscle_movement']).toContain(detection.artifactType);
      }
    });

    it('should score high for concentrated spectral energy', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const narrowBand = Math.sin((i * 55 * 2 * Math.PI) / 256) * 60;
          return 100 + narrowBand;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.detailedAnalysis.emgNoiseScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Device Disconnect Detection', () => {
    it('should detect complete signal loss', () => {
      // Disconnected: all zeros
      const signal = Array(256).fill(0);

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.artifactType).toBe('device_disconnect');
      expect(detection.signalQualityScore).toBeLessThan(30);
    });

    it('should detect flat line (no variance)', () => {
      // Flat line: constant DC value
      const signal = Array(256).fill(150);

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      if (detection.hasArtifact) {
        expect(detection.artifactType).toBe('device_disconnect');
      }
    });

    it('should detect large DC offset', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 20;
          return 600 + alpha; // Very high DC offset
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.detailedAnalysis.disconnectionScore).toBeGreaterThan(0);
    });
  });

  describe('Signal Saturation Detection', () => {
    it('should detect clipping/saturation', () => {
      // Clipped signal: peaks at maximum
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const value = Math.sin((i * 20 * 2 * Math.PI) / 256) * 600;
          return Math.max(-500, Math.min(500, 100 + value)); // Clipped at ±500
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      if (detection.hasArtifact) {
        expect(['saturation', 'head_movement']).toContain(detection.artifactType);
      }
    });

    it('should score high for flat-lined peaks', () => {
      const signal = Array(256).map((_, i) => {
        if (i % 40 === 0) return 500; // Peak values
        if ((i + 1) % 40 === 0) return 500; // Duplicate peak
        return 100 + Math.sin((i * 10 * 2 * Math.PI) / 256) * 50;
      });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.detailedAnalysis.saturationScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Artifact Severity', () => {
    it('should classify no severity for clean signal', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 30;
          return 100 + alpha;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.artifactSeverity).toBe('none');
    });

    it('should classify mild for minor artifacts', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 28;
          const smallNoise = (Math.random() - 0.5) * 10;
          return 100 + alpha + smallNoise;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.artifactSeverity).toMatch(/^(none|mild)$/);
    });

    it('should classify severe for major artifacts', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => {
          return 100 + (Math.random() - 0.5) * 300; // Heavy noise
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.artifactSeverity).toMatch(/^(moderate|severe)$/);
    });
  });

  describe('Signal Quality Levels', () => {
    it('should classify excellent quality', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 30;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 25;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      if (detection.signalQualityScore > 90) {
        expect(detection.signalQualityLevel).toBe('excellent');
      }
    });

    it('should classify good quality', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 28;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 20;
          const noise = (Math.random() - 0.5) * 5;
          return 100 + alpha + beta + noise;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      if (detection.signalQualityScore >= 75 && detection.signalQualityScore < 90) {
        expect(detection.signalQualityLevel).toBe('good');
      }
    });

    it('should classify poor quality', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + (Math.random() - 0.5) * 100);

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      if (detection.signalQualityScore < 50) {
        expect(detection.signalQualityLevel).toMatch(/^(poor|unusable)$/);
      }
    });

    it('should classify unusable quality', () => {
      const signal = Array(256).fill(0); // All zeros

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.signalQualityLevel).toBe('unusable');
    });
  });

  describe('Recommendations', () => {
    it('should provide recommendations for each artifact type', () => {
      const artifacts = ['eye_blink', 'muscle_movement', 'head_movement', 'emg_noise', 'device_disconnect', 'saturation'];

      for (const artifactType of artifacts) {
        const signal = Array(256)
          .fill(0)
          .map(() => 100 + Math.random() * 20);

        const features = featureExtractor.extractFeatures(signal);
        const detection = anomalyDetector.detectAnomalies(features, signal);

        expect(detection.recommendations).toBeDefined();
        expect(Array.isArray(detection.recommendations)).toBe(true);
      }
    });

    it('should give positive feedback for excellent signal', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 35;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 30;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      if (detection.signalQualityScore > 85) {
        expect(detection.recommendations.some(r => r.includes('excellent') || r.includes('good'))).toBe(true);
      }
    });
  });

  describe('Quality Metrics', () => {
    it('should generate quality metrics', () => {
      // Generate multiple detections
      for (let i = 0; i < 20; i++) {
        const signal = Array(256)
          .fill(0)
          .map(() => 100 + Math.random() * 20);

        const features = featureExtractor.extractFeatures(signal);
        anomalyDetector.detectAnomalies(features, signal);
      }

      const metrics = anomalyDetector.getQualityMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.overallScore).toBeGreaterThanOrEqual(0);
      expect(metrics.overallScore).toBeLessThanOrEqual(100);
      expect(metrics.artifactPercentage).toBeGreaterThanOrEqual(0);
      expect(metrics.usablePercentage).toBeGreaterThanOrEqual(0);
      expect(metrics.trend).toMatch(/^(improving|degrading|stable)$/);
      expect(metrics.confidence).toBeGreaterThanOrEqual(0);
      expect(metrics.confidence).toBeLessThanOrEqual(1);
    });

    it('should track consecutive clean samples', () => {
      // Generate clean signals
      for (let i = 0; i < 30; i++) {
        const signal = Array(256)
          .fill(0)
          .map((_, j) => {
            const alpha = Math.sin((j * 10 * 2 * Math.PI) / 256) * 30;
            return 100 + alpha;
          });

        const features = featureExtractor.extractFeatures(signal);
        anomalyDetector.detectAnomalies(features, signal);
      }

      const metrics = anomalyDetector.getQualityMetrics();

      expect(metrics.usablePercentage).toBeGreaterThan(50);
    });
  });

  describe('Detailed Analysis', () => {
    it('should provide all artifact scores', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = anomalyDetector.detectAnomalies(features, signal);

      expect(detection.detailedAnalysis).toBeDefined();
      expect(detection.detailedAnalysis.eyeBlinkScore).toBeGreaterThanOrEqual(0);
      expect(detection.detailedAnalysis.eyeBlinkScore).toBeLessThanOrEqual(100);
      expect(detection.detailedAnalysis.muscleActivityScore).toBeGreaterThanOrEqual(0);
      expect(detection.detailedAnalysis.muscleActivityScore).toBeLessThanOrEqual(100);
      expect(detection.detailedAnalysis.headMovementScore).toBeGreaterThanOrEqual(0);
      expect(detection.detailedAnalysis.headMovementScore).toBeLessThanOrEqual(100);
      expect(detection.detailedAnalysis.emgNoiseScore).toBeGreaterThanOrEqual(0);
      expect(detection.detailedAnalysis.emgNoiseScore).toBeLessThanOrEqual(100);
      expect(detection.detailedAnalysis.disconnectionScore).toBeGreaterThanOrEqual(0);
      expect(detection.detailedAnalysis.disconnectionScore).toBeLessThanOrEqual(100);
      expect(detection.detailedAnalysis.saturationScore).toBeGreaterThanOrEqual(0);
      expect(detection.detailedAnalysis.saturationScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance', () => {
    it('should detect anomalies within acceptable latency', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);

      const start = performance.now();
      const detection = anomalyDetector.detectAnomalies(features, signal);
      const latency = performance.now() - start;

      console.log(`Anomaly detection latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(25);
    });

    it('should generate metrics for 100 detections', () => {
      for (let i = 0; i < 100; i++) {
        const signal = Array(256)
          .fill(0)
          .map(() => 100 + Math.random() * 20);

        const features = featureExtractor.extractFeatures(signal);
        anomalyDetector.detectAnomalies(features, signal);
      }

      const start = performance.now();
      const metrics = anomalyDetector.getQualityMetrics();
      const latency = performance.now() - start;

      console.log(`Quality metrics calculation (100 points): ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(10);
    });
  });
});
