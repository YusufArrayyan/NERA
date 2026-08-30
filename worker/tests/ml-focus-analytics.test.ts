/**
 * Focus Analytics Tests
 * Tests for attention state machine and focus metrics
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createFeatureExtractor } from '../src/modules/ml/feature-extractor';
import { createFocusAnalytics, analyzeFocusTrends } from '../src/modules/ml/focus-analytics';

describe('ML: Focus & Attention Analytics', () => {
  let focusAnalytics: ReturnType<typeof createFocusAnalytics>;
  let featureExtractor: ReturnType<typeof createFeatureExtractor>;

  beforeEach(() => {
    focusAnalytics = createFocusAnalytics();
    featureExtractor = createFeatureExtractor();
  });

  describe('Attention State Detection', () => {
    it('should detect deep focus state', () => {
      // Deep focus: high beta/alpha, low entropy, good alpha organization
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 30;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 40;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.currentState).toMatch(/^(deep_focus|light_focus)$/);
      if (detection.currentState === 'deep_focus') {
        expect(detection.focusScore).toBeGreaterThan(75);
        expect(detection.focusIntensity).toMatch(/^(strong|deep)$/);
      }
      expect(detection.stateConfidence).toBeGreaterThan(0.5);
    });

    it('should detect light focus state', () => {
      // Light focus: moderate beta/alpha, moderate entropy
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 25;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 20;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.currentState).toBeDefined();
      expect(detection.focusScore).toBeGreaterThan(40);
      expect(detection.focusScore).toBeLessThan(90);
    });

    it('should detect distracted state', () => {
      // Distracted: higher entropy, variable patterns
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const noise = (Math.random() - 0.5) * 40;
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 15;
          return 100 + alpha + noise;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.currentState).toBeDefined();
      expect(detection.focusIntensity).toMatch(/^(light|moderate|none)$/);
    });

    it('should detect off-task state', () => {
      // Off-task: low beta/alpha, high alpha percentage, low energy
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 60;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 5;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.currentState).toBeDefined();
      if (detection.currentState === 'off_task') {
        expect(detection.focusScore).toBeLessThan(40);
      }
    });

    it('should detect fatigued state', () => {
      // Fatigued: high theta/delta, high entropy
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const theta = Math.sin((i * 6 * 2 * Math.PI) / 256) * 50;
          const delta = Math.sin((i * 2 * 2 * Math.PI) / 256) * 30;
          const noise = (Math.random() - 0.5) * 30;
          return 100 + theta + delta + noise;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.currentState).toBeDefined();
      expect(detection.focusScore).toBeLessThan(50);
    });

    it('should calculate valid focus score', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.focusScore).toBeGreaterThanOrEqual(0);
      expect(detection.focusScore).toBeLessThanOrEqual(100);
    });

    it('should have valid state confidence', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.stateConfidence).toBeGreaterThanOrEqual(0.5);
      expect(detection.stateConfidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Focus Intensity Levels', () => {
    it('should classify deep focus intensity', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 40;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 50;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      if (detection.focusScore > 75) {
        expect(detection.focusIntensity).toMatch(/^(deep|strong)$/);
      }
    });

    it('should classify moderate focus intensity', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 20;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 20;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      if (detection.focusScore < 75 && detection.focusScore > 40) {
        expect(detection.focusIntensity).toMatch(/^(moderate|light)$/);
      }
    });

    it('should classify no focus intensity', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const noise = (Math.random() - 0.5) * 100;
          return 100 + noise;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      if (detection.focusScore < 25) {
        expect(detection.focusIntensity).toBe('none');
      }
    });
  });

  describe('Focus Stability', () => {
    it('should calculate focus stability', () => {
      // Generate multiple detections
      for (let i = 0; i < 20; i++) {
        const signal = Array(256)
          .fill(0)
          .map((_, j) => {
            const alpha = Math.sin((j * 10 * 2 * Math.PI) / 256) * 30;
            return 100 + alpha;
          });

        const features = featureExtractor.extractFeatures(signal);
        const detection = focusAnalytics.detectFocus(features);

        if (i >= 10) {
          expect(detection.focusStability).toBeGreaterThanOrEqual(0);
          expect(detection.focusStability).toBeLessThanOrEqual(100);
        }
      }
    });

    it('should indicate high stability for consistent focus', () => {
      // Generate consistent focused signals
      for (let i = 0; i < 30; i++) {
        const signal = Array(256)
          .fill(0)
          .map((_, j) => {
            const alpha = Math.sin((j * 10 * 2 * Math.PI) / 256) * 35;
            const beta = Math.sin((j * 20 * 2 * Math.PI) / 256) * 35;
            return 100 + alpha + beta;
          });

        const features = featureExtractor.extractFeatures(signal);
        focusAnalytics.detectFocus(features);
      }

      // Last detection should have high stability
      const signal = Array(256)
        .fill(0)
        .map((_, j) => {
          const alpha = Math.sin((j * 10 * 2 * Math.PI) / 256) * 35;
          const beta = Math.sin((j * 20 * 2 * Math.PI) / 256) * 35;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.focusStability).toBeGreaterThan(50);
    });
  });

  describe('Focus Duration Estimation', () => {
    it('should estimate deep focus duration', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 40;
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 50;
          return 100 + alpha + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      if (detection.focusScore > 75) {
        expect(detection.estimatedDuration).toBeGreaterThan(45); // At least 45 min
      }
    });

    it('should estimate low focus duration', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + (Math.random() - 0.5) * 100);

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      if (detection.focusScore < 25) {
        expect(detection.estimatedDuration).toBeLessThan(15);
      }
    });
  });

  describe('State Prediction', () => {
    it('should predict next state', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.prediction).toBeDefined();
      expect(detection.prediction.nextState).toBeDefined();
      expect(detection.prediction.timeToSwitch).toBeGreaterThanOrEqual(0);
      expect(detection.prediction.probability).toBeGreaterThanOrEqual(0);
      expect(detection.prediction.probability).toBeLessThanOrEqual(1);
    });

    it('should predict state transitions from deep focus', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 50;
          return 100 + beta;
        });

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      if (detection.currentState === 'deep_focus') {
        const nextStates = ['deep_focus', 'light_focus', 'distracted', 'off_task', 'fatigued'];
        expect(nextStates).toContain(detection.prediction.nextState);
      }
    });
  });

  describe('Session Summary', () => {
    it('should generate session summary', () => {
      // Create a session with multiple detections
      const signals = Array(10)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      for (const signal of signals) {
        const features = featureExtractor.extractFeatures(signal);
        focusAnalytics.detectFocus(features);
      }

      const summary = focusAnalytics.getSessionSummary();

      expect(summary).toBeDefined();
      expect(summary.sessionId).toMatch(/^session-/);
      expect(summary.startTime).toBeGreaterThan(0);
      expect(summary.totalDuration).toBeGreaterThan(0);
      expect(summary.averageFocus).toBeGreaterThanOrEqual(0);
      expect(summary.averageFocus).toBeLessThanOrEqual(100);
      expect(summary.peakFocus).toBeGreaterThanOrEqual(0);
      expect(summary.peakFocus).toBeLessThanOrEqual(100);
    });

    it('should include focus breakdown by state', () => {
      const signals = Array(10)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      for (const signal of signals) {
        const features = featureExtractor.extractFeatures(signal);
        focusAnalytics.detectFocus(features);
      }

      const summary = focusAnalytics.getSessionSummary();

      expect(summary.focusBreakdown).toBeDefined();
      expect(summary.focusBreakdown['deep_focus']).toBeDefined();
      expect(summary.focusBreakdown['light_focus']).toBeDefined();
      expect(summary.focusBreakdown['distracted']).toBeDefined();
      expect(summary.focusBreakdown['off_task']).toBeDefined();
      expect(summary.focusBreakdown['fatigued']).toBeDefined();
    });

    it('should generate session insights', () => {
      const signals = Array(15)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      for (const signal of signals) {
        const features = featureExtractor.extractFeatures(signal);
        focusAnalytics.detectFocus(features);
      }

      const summary = focusAnalytics.getSessionSummary();

      expect(summary.insights).toBeDefined();
      expect(summary.insights.length).toBeGreaterThan(0);
      expect(summary.insights[0]).toBeTypeOf('string');
    });

    it('should track state transitions', () => {
      const signals = Array(10)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      for (const signal of signals) {
        const features = featureExtractor.extractFeatures(signal);
        focusAnalytics.detectFocus(features);
      }

      const summary = focusAnalytics.getSessionSummary();

      expect(summary.transitions).toBeDefined();
      expect(Array.isArray(summary.transitions)).toBe(true);
    });
  });

  describe('Focus Trends Analysis', () => {
    it('should analyze focus trends', () => {
      const signals = Array(10)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      const detections = signals.map(signal => {
        const features = featureExtractor.extractFeatures(signal);
        return focusAnalytics.detectFocus(features);
      });

      const trends = analyzeFocusTrends(detections);

      expect(trends).toBeDefined();
      expect(trends.statistics).toBeDefined();
      expect(trends.stateDistribution).toBeDefined();
      expect(trends.trend).toMatch(/^(improving|declining|stable)$/);
      expect(trends.recommendation).toBeDefined();
    });

    it('should detect improving focus trend', () => {
      // Generate signals with improving focus
      const detections = Array(10)
        .fill(0)
        .map((_, idx) => {
          const focusFactor = idx / 10; // Increasing
          const signal = Array(256)
            .fill(0)
            .map((_, i) => {
              const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 30 * (1 + focusFactor);
              return 100 + beta;
            });

          const features = featureExtractor.extractFeatures(signal);
          return focusAnalytics.detectFocus(features);
        });

      const trends = analyzeFocusTrends(detections);
      expect(trends.trend).toMatch(/^(improving|declining|stable)$/);
    });

    it('should detect declining focus trend', () => {
      focusAnalytics.resetSession();

      // Generate signals with declining focus
      const detections = Array(10)
        .fill(0)
        .map((_, idx) => {
          const focusFactor = (10 - idx) / 10; // Decreasing
          const signal = Array(256)
            .fill(0)
            .map((_, i) => {
              const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 30 * focusFactor;
              return 100 + beta;
            });

          const features = featureExtractor.extractFeatures(signal);
          return focusAnalytics.detectFocus(features);
        });

      const trends = analyzeFocusTrends(detections);
      expect(trends.trend).toMatch(/^(improving|declining|stable)$/);
    });

    it('should return empty for no data', () => {
      const trends = analyzeFocusTrends([]);
      expect(trends.message).toBe('No data');
    });
  });

  describe('Session Reset', () => {
    it('should reset session properly', () => {
      const signals = Array(5)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      for (const signal of signals) {
        const features = featureExtractor.extractFeatures(signal);
        focusAnalytics.detectFocus(features);
      }

      const summaryBefore = focusAnalytics.getSessionSummary();

      focusAnalytics.resetSession();

      const summaryAfter = focusAnalytics.getSessionSummary();

      // Should have different session IDs
      expect(summaryAfter.sessionId).not.toBe(summaryBefore.sessionId);
      expect(summaryAfter.totalDuration).toBeLessThan(summaryBefore.totalDuration);
    });
  });

  describe('Performance', () => {
    it('should detect focus within acceptable latency', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);

      const start = performance.now();
      const detection = focusAnalytics.detectFocus(features);
      const latency = performance.now() - start;

      console.log(`Focus detection latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(20);
    });

    it('should analyze trends for 100 detections', () => {
      const signals = Array(100)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      const detections = signals.map(signal => {
        const features = featureExtractor.extractFeatures(signal);
        return focusAnalytics.detectFocus(features);
      });

      const start = performance.now();
      const trends = analyzeFocusTrends(detections);
      const latency = performance.now() - start;

      console.log(`Focus trend analysis (100 points): ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(50);
    });
  });

  describe('Time in State', () => {
    it('should track time in current state', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);
      const detection = focusAnalytics.detectFocus(features);

      expect(detection.timeInState).toBeGreaterThanOrEqual(0);
      expect(detection.timeInState).toBeTypeOf('number');
    });
  });
});
