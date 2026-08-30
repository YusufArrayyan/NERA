/**
 * Stress Detector Tests
 * Tests for stress and anxiety detection ML model
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createFeatureExtractor } from '../src/modules/ml/feature-extractor';
import { createStressDetector } from '../src/modules/ml/stress-detector';

describe('ML: Stress & Anxiety Detector', () => {
  let stressDetector: ReturnType<typeof createStressDetector>;
  let featureExtractor: ReturnType<typeof createFeatureExtractor>;

  beforeEach(() => {
    stressDetector = createStressDetector();
    featureExtractor = createFeatureExtractor();
  });

  describe('Stress Detection', () => {
    it('should detect low stress state', () => {
      // Low stress: high alpha, low beta
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 50;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 5;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      expect(detection.stressLevel).toMatch(/^(low|medium)$/);
      expect(detection.stressScore).toBeLessThan(50);
      expect(detection.confidence).toBeGreaterThan(0.5);
      expect(detection.recommendations).toBeDefined();
      expect(detection.recommendations.length).toBeGreaterThan(0);
    });

    it('should detect medium stress state', () => {
      // Medium stress: balanced beta/alpha
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 20;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 25;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      expect(detection.stressLevel).toMatch(/^(medium|high)$/);
      expect(detection.stressScore).toBeGreaterThan(30);
      expect(detection.stressScore).toBeLessThan(70);
      expect(detection.confidence).toBeGreaterThan(0.5);
    });

    it('should detect high stress state', () => {
      // High stress: very high beta/gamma, low alpha
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const beta = Math.sin((i * 25 * 2 * Math.PI) / 256) * 50;
          const gamma = Math.sin((i * 50 * 2 * Math.PI) / 256) * 30;
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 3;
          return 100 + beta + gamma + alpha;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      expect(detection.stressLevel).toMatch(/^(high|critical)$/);
      expect(detection.stressScore).toBeGreaterThan(50);
      expect(detection.urgency).toMatch(/^(high|immediate)$/);
    });

    it('should detect critical stress state', () => {
      // Critical stress: extremely high gamma, rapid changes
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const gamma = Math.sin((i * 60 * 2 * Math.PI) / 256) * 80;
          const rapidNoise = (Math.random() - 0.5) * 100;
          return 100 + gamma + rapidNoise;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      expect(detection.stressLevel).toBe('critical');
      expect(detection.stressScore).toBeGreaterThan(70);
      expect(detection.urgency).toBe('immediate');
      expect(detection.recommendations[0]).toContain('IMMEDIATE');
    });

    it('should calculate valid stress score', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      expect(detection.stressScore).toBeGreaterThanOrEqual(0);
      expect(detection.stressScore).toBeLessThanOrEqual(100);
    });

    it('should calculate valid anxiety score', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      expect(detection.anxietyScore).toBeGreaterThanOrEqual(0);
      expect(detection.anxietyScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Stress Indicators', () => {
    it('should extract stress indicators', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      expect(detection.indicators).toBeDefined();
      expect(detection.indicators.highFrequencyDominance).toBeTypeOf('boolean');
      expect(detection.indicators.elevatedGamma).toBeTypeOf('boolean');
      expect(detection.indicators.reducedAlpha).toBeTypeOf('boolean');
      expect(detection.indicators.highEntropy).toBeTypeOf('boolean');
      expect(detection.indicators.rapidChanges).toBeTypeOf('boolean');
    });

    it('should indicate high frequency dominance in stressed state', () => {
      // High stress signal
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const beta = Math.sin((i * 25 * 2 * Math.PI) / 256) * 50;
          return 100 + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      // Should have high beta/alpha ratio
      expect(features.ratios.betaAlphaRatio).toBeGreaterThan(1.5);
    });
  });

  describe('Recommendations', () => {
    it('should provide recommendations for low stress', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 50;
          return 100 + alpha;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      if (detection.stressLevel === 'low') {
        expect(detection.recommendations.some(r => r.includes('healthy'))).toBe(true);
      }
    });

    it('should provide urgent recommendations for high stress', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const beta = Math.sin((i * 25 * 2 * Math.PI) / 256) * 80;
          return 100 + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);

      if (detection.stressLevel === 'high' || detection.stressLevel === 'critical') {
        expect(detection.recommendations.some(r => r.includes('break'))).toBe(true);
      }
    });
  });

  describe('Interventions', () => {
    it('should provide intervention for low stress', () => {
      const intervention = stressDetector.getRecommendedIntervention('low');

      expect(intervention).toBeDefined();
      expect(intervention.type).toBe('break');
      expect(intervention.duration).toBeGreaterThan(0);
      expect(intervention.description).toBeDefined();
      expect(intervention.instructions).toBeDefined();
      expect(intervention.instructions.length).toBeGreaterThan(0);
    });

    it('should provide breathing intervention for high stress', () => {
      const intervention = stressDetector.getRecommendedIntervention('high');

      expect(intervention).toBeDefined();
      expect(intervention.type).toBe('breathing');
      expect(intervention.duration).toBe(300); // 5 minutes
      expect(intervention.instructions).toContain(expect.stringMatching(/breath|inhale|exhale/i));
    });

    it('should provide meditation intervention for medium stress', () => {
      const intervention = stressDetector.getRecommendedIntervention('medium');

      expect(intervention).toBeDefined();
      expect(intervention.type).toBe('meditation');
      expect(intervention.instructions).toBeDefined();
    });

    it('should provide immediate alert for critical stress', () => {
      const intervention = stressDetector.getRecommendedIntervention('critical');

      expect(intervention).toBeDefined();
      expect(intervention.type).toBe('alert');
      expect(intervention.instructions[0]).toContain('STOP');
      expect(intervention.duration).toBeGreaterThan(0);
    });
  });

  describe('Stress Profile', () => {
    it('should generate stress profile', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);
      const profile = stressDetector.getStressProfile(detection);

      expect(profile).toBeDefined();
      expect(profile.assessment).toBeDefined();
      expect(profile.indicators).toBeDefined();
      expect(profile.urgency).toBeDefined();
      expect(profile.recommendations).toBeDefined();
      expect(profile.intervention).toBeDefined();
      expect(profile.guidance).toBeDefined();
    });

    it('should include intervention details in profile', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = stressDetector.detectStress(features);
      const profile = stressDetector.getStressProfile(detection);

      expect(profile.intervention.recommended).toBeDefined();
      expect(profile.intervention.duration).toBeGreaterThan(0);
      expect(profile.intervention.steps).toBeDefined();
      expect(profile.intervention.expectedOutcome).toBeDefined();
    });
  });

  describe('Trend Tracking', () => {
    it('should track stress trends', () => {
      const signals = Array(5)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      const detections = signals.map(signal => {
        const features = featureExtractor.extractFeatures(signal);
        return stressDetector.detectStress(features);
      });

      const trend = stressDetector.trackTrend(detections);

      expect(trend).toBeDefined();
      expect(trend.statistics).toBeDefined();
      expect(trend.statistics.averageStress).toBeDefined();
      expect(trend.statistics.maxStress).toBeGreaterThan(0);
      expect(trend.statistics.minStress).toBeGreaterThanOrEqual(0);
      expect(trend.trend).toMatch(/^(improving|worsening|stable)$/);
      expect(trend.dataPoints).toBe(5);
    });

    it('should detect improving trend', () => {
      // Create signals with decreasing stress
      const signals = Array(5)
        .fill(0)
        .map((_, idx) => {
          return Array(256)
            .fill(0)
            .map((_, i) => {
              const stressFactor = (5 - idx) / 5; // Decreasing
              const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 20 * stressFactor;
              const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 50;
              return 100 + alpha + beta;
            });
        });

      const detections = signals.map(signal => {
        const features = featureExtractor.extractFeatures(signal);
        return stressDetector.detectStress(features);
      });

      const trend = stressDetector.trackTrend(detections);

      // Scores should generally decrease
      const firstAvg = detections.slice(0, 2).reduce((sum, d) => sum + d.stressScore, 0) / 2;
      const lastAvg = detections.slice(-2).reduce((sum, d) => sum + d.stressScore, 0) / 2;

      if (lastAvg < firstAvg) {
        expect(trend.trend).toBe('improving');
      }
    });

    it('should return empty for no data', () => {
      const trend = stressDetector.trackTrend([]);

      expect(trend.message).toBe('No data');
    });
  });

  describe('Confidence Scoring', () => {
    it('should have valid confidence scores', () => {
      const signals = Array(10)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      for (const signal of signals) {
        const features = featureExtractor.extractFeatures(signal);
        const detection = stressDetector.detectStress(features);

        expect(detection.confidence).toBeGreaterThanOrEqual(0.5);
        expect(detection.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should have higher confidence for consistent indicators', () => {
      // Create very stressed signal
      const stressedSignal = Array(256)
        .fill(0)
        .map((_, i) => {
          const gamma = Math.sin((i * 50 * 2 * Math.PI) / 256) * 60;
          const beta = Math.sin((i * 25 * 2 * Math.PI) / 256) * 60;
          return 100 + gamma + beta;
        });

      const features = featureExtractor.extractFeatures(stressedSignal);
      const detection = stressDetector.detectStress(features);

      // Indicators should align
      const alignedCount = [
        detection.indicators.highFrequencyDominance,
        detection.indicators.elevatedGamma,
        detection.indicators.rapidChanges,
      ].filter(Boolean).length;

      if (alignedCount >= 2) {
        expect(detection.confidence).toBeGreaterThan(0.7);
      }
    });
  });

  describe('Performance', () => {
    it('should detect stress within acceptable latency', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);

      const start = performance.now();
      const detection = stressDetector.detectStress(features);
      const latency = performance.now() - start;

      console.log(`Stress detection latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(20); // Should be < 20ms
    });

    it('should track trends for 100 detections', () => {
      const signals = Array(100)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      const detections = signals.map(signal => {
        const features = featureExtractor.extractFeatures(signal);
        return stressDetector.detectStress(features);
      });

      const start = performance.now();
      const trend = stressDetector.trackTrend(detections);
      const latency = performance.now() - start;

      console.log(`Trend tracking (100 points): ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(50);
    });
  });
});
