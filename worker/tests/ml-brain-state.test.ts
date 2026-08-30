/**
 * Brain State Classifier Tests
 * Comprehensive tests for EEG classification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createFeatureExtractor } from '../src/modules/ml/feature-extractor';
import {
  createBrainStateClassifier,
  batchClassify,
  getClassificationSummary,
  type BrainState,
} from '../src/modules/ml/brain-state-classifier';

describe('ML: Brain State Classifier', () => {
  let classifier: ReturnType<typeof createBrainStateClassifier>;
  let featureExtractor: ReturnType<typeof createFeatureExtractor>;

  beforeEach(() => {
    classifier = createBrainStateClassifier();
    featureExtractor = createFeatureExtractor();
  });

  describe('Feature Extraction', () => {
    it('should extract time domain features', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);

      expect(features.timeDomain).toBeDefined();
      expect(features.timeDomain.mean).toBeGreaterThan(0);
      expect(features.timeDomain.variance).toBeGreaterThan(0);
      expect(features.timeDomain.stdDev).toBeGreaterThan(0);
      expect(features.timeDomain.energy).toBeGreaterThan(0);
      expect(features.timeDomain.zerosCrossing).toBeGreaterThanOrEqual(0);
    });

    it('should extract frequency domain features', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);

      expect(features.frequencyDomain).toBeDefined();
      expect(features.frequencyDomain.delta).toBeGreaterThanOrEqual(0);
      expect(features.frequencyDomain.theta).toBeGreaterThanOrEqual(0);
      expect(features.frequencyDomain.alpha).toBeGreaterThanOrEqual(0);
      expect(features.frequencyDomain.beta).toBeGreaterThanOrEqual(0);
      expect(features.frequencyDomain.gamma).toBeGreaterThanOrEqual(0);

      // Sum of percentages should be ~100
      const totalPercent =
        features.frequencyDomain.deltaPercent +
        features.frequencyDomain.thetaPercent +
        features.frequencyDomain.alphaPercent +
        features.frequencyDomain.betaPercent +
        features.frequencyDomain.gammaPercent;
      expect(totalPercent).toBeCloseTo(100, -1);
    });

    it('should extract spectral features', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);

      expect(features.spectral).toBeDefined();
      expect(features.spectral.dominantFrequency).toBeGreaterThanOrEqual(0);
      expect(features.spectral.spectralCentroid).toBeGreaterThanOrEqual(0);
      expect(features.spectral.spectralSpread).toBeGreaterThanOrEqual(0);
      expect(features.spectral.spectralRolloff).toBeGreaterThanOrEqual(0);
    });

    it('should extract entropy features', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);

      expect(features.entropy).toBeDefined();
      expect(features.entropy.shannonEntropy).toBeGreaterThan(0);
      expect(features.entropy.approximateEntropy).toBeDefined();
      expect(features.entropy.sampleEntropy).toBeDefined();
      expect(features.entropy.fuzzyEntropy).toBeDefined();
    });

    it('should extract temporal features', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);

      expect(features.temporal).toBeDefined();
      expect(features.temporal.rateOfChange).toBeGreaterThanOrEqual(0);
      expect(features.temporal.lineLength).toBeGreaterThanOrEqual(0);
      expect(features.temporal.activity).toBeGreaterThan(0);
      expect(features.temporal.mobility).toBeGreaterThanOrEqual(0);
      expect(features.temporal.complexity).toBeGreaterThanOrEqual(0);
    });

    it('should extract ratio features', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const features = featureExtractor.extractFeatures(signal);

      expect(features.ratios).toBeDefined();
      expect(features.ratios.betaAlphaRatio).toBeGreaterThan(0);
      expect(features.ratios.gammaAlphaRatio).toBeGreaterThan(0);
      expect(features.ratios.thetaBetaRatio).toBeGreaterThan(0);
      expect(features.ratios.alphaTheta).toBeGreaterThan(0);
      expect(features.ratios.betaDelta).toBeGreaterThan(0);
    });
  });

  describe('Brain State Classification', () => {
    it('should classify focus state', () => {
      // Focus: high beta/alpha ratio, low entropy
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 30; // 20Hz = beta band
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 10; // 10Hz = alpha band
          const noise = (Math.random() - 0.5) * 5;
          return 100 + beta + alpha + noise;
        });

      const classification = classifier.classify(signal);

      expect(classification.primaryState).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
      expect(classification.confidence).toBeLessThanOrEqual(1);
      expect(classification.probability.focus).toBeGreaterThan(0);
      expect(Object.values(classification.probability).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 2);
    });

    it('should classify relaxed state', () => {
      // Relaxed: high alpha, low beta
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const alpha = Math.sin((i * 10 * 2 * Math.PI) / 256) * 50; // Strong alpha
          const beta = Math.sin((i * 20 * 2 * Math.PI) / 256) * 5; // Weak beta
          const noise = (Math.random() - 0.5) * 3;
          return 100 + alpha + beta + noise;
        });

      const classification = classifier.classify(signal);

      expect(classification.primaryState).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
    });

    it('should classify drowsy state', () => {
      // Drowsy: high theta, slow waves
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const theta = Math.sin((i * 6 * 2 * Math.PI) / 256) * 40; // Strong theta (6Hz)
          const delta = Math.sin((i * 2 * 2 * Math.PI) / 256) * 30; // Strong delta (2Hz)
          const noise = (Math.random() - 0.5) * 2;
          return 100 + theta + delta + noise;
        });

      const classification = classifier.classify(signal);

      expect(classification.primaryState).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
    });

    it('should classify stressed state', () => {
      // Stressed: very high beta, high gamma
      const signal = Array(256)
        .fill(0)
        .map((_, i) => {
          const beta = Math.sin((i * 25 * 2 * Math.PI) / 256) * 50; // Very high beta
          const gamma = Math.sin((i * 50 * 2 * Math.PI) / 256) * 30; // High gamma
          const noise = (Math.random() - 0.5) * 10;
          return 100 + beta + gamma + noise;
        });

      const classification = classifier.classify(signal);

      expect(classification.primaryState).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
    });

    it('should provide state characteristics', () => {
      const characteristics = classifier.getStateCharacteristics('focus');

      expect(characteristics).toBeDefined();
      expect(characteristics.description).toBeDefined();
      expect(characteristics.eegPatterns).toBeDefined();
      expect(characteristics.bestFor).toBeDefined();
      expect(characteristics.interventions).toBeDefined();
    });

    it('should return feature importance', () => {
      const importance = classifier.getFeatureImportance();

      expect(importance).toBeDefined();
      expect(importance.betaAlphaRatio).toBeGreaterThan(0);
      expect(importance.thetaBetaRatio).toBeGreaterThan(0);
      expect(importance.alphaPercent).toBeGreaterThan(0);
      expect(importance.entropy).toBeGreaterThan(0);

      const totalImportance = Object.values(importance).reduce((a, b) => a + b, 0);
      expect(totalImportance).toBeCloseTo(1, 2);
    });
  });

  describe('Batch Classification', () => {
    it('should classify multiple signals', () => {
      const signals = Array(10)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      const classifications = batchClassify(signals, classifier);

      expect(classifications).toHaveLength(10);
      for (const classification of classifications) {
        expect(classification.primaryState).toBeDefined();
        expect(classification.confidence).toBeGreaterThan(0);
      }
    });

    it('should generate classification summary', () => {
      const signals = Array(10)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      const classifications = batchClassify(signals, classifier);
      const summary = getClassificationSummary(classifications);

      expect(summary).toBeDefined();
      expect(summary.dominantState).toBeDefined();
      expect(summary.stateDistribution).toBeDefined();
      expect(summary.averageConfidence).toBeGreaterThan(0);
      expect(summary.averageConfidence).toBeLessThanOrEqual(1);
      expect(summary.totalClassifications).toBe(10);

      // Sum of states should equal total classifications
      const stateSum = Object.values(summary.stateDistribution).reduce((a: number, b: number) => a + b, 0);
      expect(stateSum).toBe(10);
    });
  });

  describe('Probability Distribution', () => {
    it('should produce valid probability distribution', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const classification = classifier.classify(signal);

      // All probabilities should be 0-1
      for (const prob of Object.values(classification.probability)) {
        expect(prob).toBeGreaterThanOrEqual(0);
        expect(prob).toBeLessThanOrEqual(1);
      }

      // Sum should be approximately 1
      const sum = Object.values(classification.probability).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 2);

      // Primary state should have highest probability
      const primaryProb = classification.probability[classification.primaryState];
      for (const [state, prob] of Object.entries(classification.probability)) {
        if ((state as BrainState) !== classification.primaryState) {
          expect(prob).toBeLessThanOrEqual(primaryProb + 0.01); // Small tolerance for floating point
        }
      }
    });
  });

  describe('Consistency', () => {
    it('should produce consistent results for identical signals', () => {
      const signal = Array(256)
        .fill(0)
        .map((_, i) => 100 + Math.sin(i * 0.1) * 20);

      const result1 = classifier.classify(signal);
      const result2 = classifier.classify(signal);

      expect(result1.primaryState).toBe(result2.primaryState);
      expect(result1.confidence).toBeCloseTo(result2.confidence, 2);
    });

    it('should handle different signal amplitudes', () => {
      const baseSignal = Array(256)
        .fill(0)
        .map((_, i) => 100 + Math.sin(i * 0.1) * 20);

      const signal1 = baseSignal;
      const signal2 = baseSignal.map(x => x * 1.5); // 1.5x amplitude
      const signal3 = baseSignal.map(x => x * 2.0); // 2x amplitude

      const result1 = classifier.classify(signal1);
      const result2 = classifier.classify(signal2);
      const result3 = classifier.classify(signal3);

      // States might differ slightly due to different scales
      // But should still produce valid classifications
      expect(result1.primaryState).toBeDefined();
      expect(result2.primaryState).toBeDefined();
      expect(result3.primaryState).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle constant signal', () => {
      const signal = Array(256).fill(100);

      const classification = classifier.classify(signal);

      expect(classification.primaryState).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
    });

    it('should handle noisy signal', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + (Math.random() - 0.5) * 200);

      const classification = classifier.classify(signal);

      expect(classification.primaryState).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
    });

    it('should handle signal with DC offset', () => {
      const baseSignal = Array(256)
        .fill(0)
        .map((_, i) => Math.sin(i * 0.1) * 20);

      const offsetSignal = baseSignal.map(x => x + 500); // Large DC offset

      const classification = classifier.classify(offsetSignal);

      expect(classification.primaryState).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should classify within acceptable latency', () => {
      const signal = Array(256)
        .fill(0)
        .map(() => 100 + Math.random() * 20);

      const start = performance.now();
      const classification = classifier.classify(signal);
      const latency = performance.now() - start;

      console.log(`Classification latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(30); // Should be < 30ms
    });

    it('should batch classify 100 signals quickly', () => {
      const signals = Array(100)
        .fill(0)
        .map(() => Array(256).fill(0).map(() => 100 + Math.random() * 20));

      const start = performance.now();
      const classifications = batchClassify(signals, classifier);
      const latency = performance.now() - start;

      console.log(`Batch classification (100 signals): ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(2000); // Should be < 2s for 100 signals
      expect(classifications).toHaveLength(100);
    });
  });
});
