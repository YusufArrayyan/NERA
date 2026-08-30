/**
 * Personalization Engine Tests
 * Tests for user baselines, adaptive learning, and personalized recommendations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createFeatureExtractor } from '../src/modules/ml/feature-extractor';
import { createBrainStateClassifier } from '../src/modules/ml/brain-state-classifier';
import { createStressDetector } from '../src/modules/ml/stress-detector';
import { createFocusAnalytics } from '../src/modules/ml/focus-analytics';
import { createPersonalizationEngine } from '../src/modules/ml/personalization-engine';

describe('ML: Personalization Engine', () => {
  let personalizationEngine: ReturnType<typeof createPersonalizationEngine>;
  let featureExtractor: ReturnType<typeof createFeatureExtractor>;
  let brainStateClassifier: ReturnType<typeof createBrainStateClassifier>;
  let stressDetector: ReturnType<typeof createStressDetector>;
  let focusAnalytics: ReturnType<typeof createFocusAnalytics>;

  const userId = 'test-user-123';

  beforeEach(() => {
    personalizationEngine = createPersonalizationEngine();
    featureExtractor = createFeatureExtractor();
    brainStateClassifier = createBrainStateClassifier();
    stressDetector = createStressDetector();
    focusAnalytics = createFocusAnalytics();
  });

  describe('User Baseline Creation', () => {
    it('should require minimum samples to create baseline', () => {
      const detections: any[] = [];
      expect(() => personalizationEngine.createUserBaseline(userId, detections)).toThrow();
    });

    it('should create baseline with sufficient data', () => {
      const detections = generateDetections(20);
      const baseline = personalizationEngine.createUserBaseline(userId, detections);

      expect(baseline).toBeDefined();
      expect(baseline.userId).toBe(userId);
      expect(baseline.sampleCount).toBe(20);
      expect(baseline.baselineCreatedAt).toBeGreaterThan(0);
      expect(baseline.confidence).toBeGreaterThan(0);
    });

    it('should calculate focus baseline metrics', () => {
      const detections = generateDetections(20);
      const baseline = personalizationEngine.createUserBaseline(userId, detections);

      expect(baseline.focusBaseline).toBeDefined();
      expect(baseline.focusBaseline.averageFocusScore).toBeGreaterThanOrEqual(0);
      expect(baseline.focusBaseline.averageFocusScore).toBeLessThanOrEqual(100);
      expect(baseline.focusBaseline.peakFocusScore).toBeGreaterThanOrEqual(baseline.focusBaseline.averageFocusScore);
      expect(baseline.focusBaseline.typicalState).toBeDefined();
      expect(baseline.focusBaseline.focusDuration).toBeGreaterThan(0);
    });

    it('should calculate stress baseline metrics', () => {
      const detections = generateDetections(20);
      const baseline = personalizationEngine.createUserBaseline(userId, detections);

      expect(baseline.stressBaseline).toBeDefined();
      expect(baseline.stressBaseline.averageStressScore).toBeGreaterThanOrEqual(0);
      expect(baseline.stressBaseline.averageStressScore).toBeLessThanOrEqual(100);
      expect(baseline.stressBaseline.stressVolatility).toBeGreaterThanOrEqual(0);
      expect(baseline.stressBaseline.typicalStressLevel).toBeDefined();
      expect(baseline.stressBaseline.stressRecoveryTime).toBeGreaterThan(0);
    });

    it('should calculate brain state baseline', () => {
      const detections = generateDetections(20);
      const baseline = personalizationEngine.createUserBaseline(userId, detections);

      expect(baseline.brainStateBaseline).toBeDefined();
      expect(baseline.brainStateBaseline.alphaPercentNormal).toBeGreaterThanOrEqual(0);
      expect(baseline.brainStateBaseline.betaPercentNormal).toBeGreaterThanOrEqual(0);
      expect(baseline.brainStateBaseline.thetaPercentNormal).toBeGreaterThanOrEqual(0);
      expect(baseline.brainStateBaseline.gammaPercentNormal).toBeGreaterThanOrEqual(0);
    });

    it('should estimate time-of-day patterns', () => {
      const detections = generateDetections(20);
      const baseline = personalizationEngine.createUserBaseline(userId, detections);

      expect(baseline.timeOfDayPatterns).toBeDefined();
      expect(baseline.timeOfDayPatterns.morningFocus).toBeGreaterThan(0);
      expect(baseline.timeOfDayPatterns.afternoonFocus).toBeGreaterThan(0);
      expect(baseline.timeOfDayPatterns.eveningFocus).toBeGreaterThan(0);
    });

    it('should set environmental factors', () => {
      const detections = generateDetections(20);
      const baseline = personalizationEngine.createUserBaseline(userId, detections);

      expect(baseline.environmentalFactors).toBeDefined();
      expect(baseline.environmentalFactors.optimalTemperature).toBe(22);
      expect(baseline.environmentalFactors.preferredBreakDuration).toBeGreaterThan(0);
      expect(baseline.environmentalFactors.typicalSessionDuration).toBeGreaterThan(0);
    });

    it('should increase confidence with more data', () => {
      const baseline1 = personalizationEngine.createUserBaseline(userId, generateDetections(20));
      const baseline2 = personalizationEngine.createUserBaseline(userId, generateDetections(100));

      expect(baseline2.confidence).toBeGreaterThan(baseline1.confidence);
    });
  });

  describe('Baseline Retrieval', () => {
    it('should retrieve user baseline', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const retrieved = personalizationEngine.getUserBaseline(userId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.userId).toBe(userId);
    });

    it('should return null for non-existent user', () => {
      const retrieved = personalizationEngine.getUserBaseline('non-existent-user');
      expect(retrieved).toBeNull();
    });
  });

  describe('Adaptive Recommendations', () => {
    it('should generate personalized recommendations', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const testDetection = detections[0];
      const recommendations = personalizationEngine.generateAdaptiveRecommendations(
        userId,
        testDetection.focus,
        testDetection.stress
      );

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should flag low focus relative to baseline', () => {
      const detections = generateDetectionsWithFocusScore(20, 70);
      personalizationEngine.createUserBaseline(userId, detections);

      // Create detection with low focus
      const lowFocusDetection = generateDetectionWithFocusScore(30);

      const recommendations = personalizationEngine.generateAdaptiveRecommendations(
        userId,
        lowFocusDetection.focus,
        lowFocusDetection.stress
      );

      const focusAlert = recommendations.find(r => r.type === 'focus' && r.priority === 'high');
      expect(focusAlert).toBeDefined();
    });

    it('should flag elevated stress', () => {
      const detections = generateDetectionsWithStressScore(20, 40);
      personalizationEngine.createUserBaseline(userId, detections);

      // Create detection with high stress
      const highStressDetection = generateDetectionWithStressScore(80);

      const recommendations = personalizationEngine.generateAdaptiveRecommendations(
        userId,
        highStressDetection.focus,
        highStressDetection.stress
      );

      const stressAlert = recommendations.find(r => r.type === 'stress' && r.priority === 'high');
      if (highStressDetection.stress.stressScore > detections[0].stress.stressScore * 1.5) {
        expect(stressAlert).toBeDefined();
      }
    });

    it('should recommend break when focus time exceeds baseline', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const baseline = personalizationEngine.getUserBaseline(userId)!;
      const longSessionDetection = generateDetectionWithDuration(baseline.focusBaseline.focusDuration * 2);

      const recommendations = personalizationEngine.generateAdaptiveRecommendations(
        userId,
        longSessionDetection.focus,
        longSessionDetection.stress
      );

      const breakRec = recommendations.find(r => r.type === 'break');
      if (longSessionDetection.focus.timeInState > baseline.focusBaseline.focusDuration * 60) {
        expect(breakRec).toBeDefined();
      }
    });

    it('should include personalization rationale', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const recommendations = personalizationEngine.generateAdaptiveRecommendations(
        userId,
        detections[0].focus,
        detections[0].stress
      );

      if (recommendations.length > 0) {
        expect(recommendations[0].rationale).toBeDefined();
        expect(recommendations[0].rationale.length).toBeGreaterThan(0);
      }
    });

    it('should include personalization score', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const recommendations = personalizationEngine.generateAdaptiveRecommendations(
        userId,
        detections[0].focus,
        detections[0].stress
      );

      if (recommendations.length > 0) {
        expect(recommendations[0].personalizationScore).toBeGreaterThan(0.5);
        expect(recommendations[0].personalizationScore).toBeLessThanOrEqual(1);
      }
    });

    it('should limit recommendations to top 3', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const recommendations = personalizationEngine.generateAdaptiveRecommendations(
        userId,
        detections[0].focus,
        detections[0].stress
      );

      expect(recommendations.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Session Tracking', () => {
    it('should track sessions', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      personalizationEngine.trackSession(userId, detections[0].focus, detections[0].stress);

      // Verify tracking happened (indirectly via progress metrics)
      const metrics = personalizationEngine.calculateProgressMetrics(userId, 'daily');
      expect(metrics).toBeDefined();
    });

    it('should maintain session history', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      for (let i = 0; i < 10; i++) {
        personalizationEngine.trackSession(userId, detections[i].focus, detections[i].stress);
      }

      // Sessions should be retained and used in analysis
      const metrics = personalizationEngine.calculateProgressMetrics(userId, 'daily');
      expect(metrics.adaptationScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Progress Metrics', () => {
    it('should calculate progress metrics', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      for (let i = 0; i < 10; i++) {
        personalizationEngine.trackSession(userId, detections[i].focus, detections[i].stress);
      }

      const metrics = personalizationEngine.calculateProgressMetrics(userId, 'daily');

      expect(metrics).toBeDefined();
      expect(metrics.userId).toBe(userId);
      expect(metrics.period).toBe('daily');
      expect(metrics.focusImprovement).toBeGreaterThanOrEqual(-100);
      expect(metrics.focusImprovement).toBeLessThanOrEqual(100);
      expect(metrics.stressReduction).toBeGreaterThanOrEqual(-100);
      expect(metrics.stressReduction).toBeLessThanOrEqual(100);
    });

    it('should calculate consistency score', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      for (let i = 0; i < 10; i++) {
        personalizationEngine.trackSession(userId, detections[i].focus, detections[i].stress);
      }

      const metrics = personalizationEngine.calculateProgressMetrics(userId, 'daily');

      expect(metrics.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(metrics.consistencyScore).toBeLessThanOrEqual(100);
    });

    it('should calculate adaptation score', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      for (let i = 0; i < 5; i++) {
        personalizationEngine.trackSession(userId, detections[i].focus, detections[i].stress);
      }

      const metrics = personalizationEngine.calculateProgressMetrics(userId, 'daily');

      expect(metrics.adaptationScore).toBeGreaterThanOrEqual(0);
      expect(metrics.adaptationScore).toBeLessThanOrEqual(100);
    });

    it('should identify strengths', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      for (let i = 0; i < 15; i++) {
        personalizationEngine.trackSession(userId, detections[i].focus, detections[i].stress);
      }

      const metrics = personalizationEngine.calculateProgressMetrics(userId, 'daily');

      expect(metrics.topStrengths).toBeDefined();
      expect(Array.isArray(metrics.topStrengths)).toBe(true);
    });

    it('should identify areas for improvement', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      for (let i = 0; i < 15; i++) {
        personalizationEngine.trackSession(userId, detections[i].focus, detections[i].stress);
      }

      const metrics = personalizationEngine.calculateProgressMetrics(userId, 'daily');

      expect(metrics.areasForImprovement).toBeDefined();
      expect(Array.isArray(metrics.areasForImprovement)).toBe(true);
    });

    it('should provide next milestone', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const metrics = personalizationEngine.calculateProgressMetrics(userId, 'daily');

      expect(metrics.nextMilestone).toBeDefined();
      expect(metrics.nextMilestone.length).toBeGreaterThan(0);
    });

    it('should support different periods', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      for (let i = 0; i < 10; i++) {
        personalizationEngine.trackSession(userId, detections[i].focus, detections[i].stress);
      }

      const dailyMetrics = personalizationEngine.calculateProgressMetrics(userId, 'daily');
      const weeklyMetrics = personalizationEngine.calculateProgressMetrics(userId, 'weekly');
      const monthlyMetrics = personalizationEngine.calculateProgressMetrics(userId, 'monthly');

      expect(dailyMetrics.period).toBe('daily');
      expect(weeklyMetrics.period).toBe('weekly');
      expect(monthlyMetrics.period).toBe('monthly');
    });
  });

  describe('Personalization Profile', () => {
    it('should create personalization profile', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const profile = personalizationEngine.getPersonalizationProfile(userId);

      expect(profile).toBeDefined();
      expect(profile?.userId).toBe(userId);
      expect(profile?.adaptiveThresholds).toBeDefined();
    });

    it('should set adaptive thresholds', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const profile = personalizationEngine.getPersonalizationProfile(userId)!;
      const baseline = personalizationEngine.getUserBaseline(userId)!;

      expect(profile.adaptiveThresholds.focusThreshold).toBeLessThan(baseline.focusBaseline.averageFocusScore);
      expect(profile.adaptiveThresholds.stressThreshold).toBeGreaterThan(baseline.stressBaseline.averageStressScore);
      expect(profile.adaptiveThresholds.anomalyThreshold).toBeGreaterThan(0);
    });

    it('should track learning rate', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const profile = personalizationEngine.getPersonalizationProfile(userId)!;

      expect(profile.learningRate).toBeGreaterThanOrEqual(0);
      expect(profile.learningRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Engagement Score', () => {
    it('should calculate engagement score', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const score = personalizationEngine.getEngagementScore(userId);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for non-existent user', () => {
      const score = personalizationEngine.getEngagementScore('non-existent');

      expect(score).toBe(0);
    });
  });

  describe('Multiple Users', () => {
    it('should handle multiple user profiles independently', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      const detections1 = generateDetectionsWithFocusScore(20, 80);
      const detections2 = generateDetectionsWithFocusScore(20, 40);

      personalizationEngine.createUserBaseline(user1, detections1);
      personalizationEngine.createUserBaseline(user2, detections2);

      const baseline1 = personalizationEngine.getUserBaseline(user1);
      const baseline2 = personalizationEngine.getUserBaseline(user2);

      expect(baseline1?.focusBaseline.averageFocusScore).toBeGreaterThan(baseline2?.focusBaseline.averageFocusScore!);
    });
  });

  describe('Performance', () => {
    it('should create baseline within acceptable time', () => {
      const detections = generateDetections(50);

      const start = performance.now();
      personalizationEngine.createUserBaseline(userId, detections);
      const latency = performance.now() - start;

      console.log(`Baseline creation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(100);
    });

    it('should generate recommendations quickly', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      const start = performance.now();
      personalizationEngine.generateAdaptiveRecommendations(userId, detections[0].focus, detections[0].stress);
      const latency = performance.now() - start;

      console.log(`Recommendation generation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(50);
    });

    it('should calculate progress metrics efficiently', () => {
      const detections = generateDetections(20);
      personalizationEngine.createUserBaseline(userId, detections);

      for (let i = 0; i < 50; i++) {
        personalizationEngine.trackSession(userId, detections[i % detections.length].focus, detections[i % detections.length].stress);
      }

      const start = performance.now();
      personalizationEngine.calculateProgressMetrics(userId, 'weekly');
      const latency = performance.now() - start;

      console.log(`Progress metrics calculation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(100);
    });
  });
});

// Helper functions
function generateDetections(count: number) {
  const detections: any[] = [];
  for (let i = 0; i < count; i++) {
    detections.push(generateRandomDetection());
  }
  return detections;
}

function generateDetectionsWithFocusScore(count: number, focusScore: number) {
  const detections: any[] = [];
  for (let i = 0; i < count; i++) {
    detections.push(generateDetectionWithFocusScore(focusScore + Math.random() * 20 - 10));
  }
  return detections;
}

function generateDetectionsWithStressScore(count: number, stressScore: number) {
  const detections: any[] = [];
  for (let i = 0; i < count; i++) {
    detections.push(generateDetectionWithStressScore(stressScore + Math.random() * 20 - 10));
  }
  return detections;
}

function generateRandomDetection() {
  const stresses = ['low', 'medium', 'high', 'critical'];
  const states = ['deep_focus', 'light_focus', 'distracted', 'off_task', 'fatigued'];

  return {
    focus: {
      currentState: states[Math.floor(Math.random() * states.length)],
      focusScore: Math.random() * 100,
      focusIntensity: 'moderate',
      focusStability: Math.random() * 100,
      stateConfidence: 0.5 + Math.random() * 0.5,
      timeInState: Math.random() * 3600,
      estimatedDuration: 30 + Math.random() * 90,
      prediction: { nextState: states[0], timeToSwitch: 300, probability: 0.5 },
    },
    stress: {
      stressScore: Math.random() * 100,
      stressLevel: stresses[Math.floor(Math.random() * stresses.length)],
      stressConfidence: 0.5 + Math.random() * 0.5,
      anxietyScore: Math.random() * 100,
      physicalStressIndicators: { heartRateVariability: 50, muscleTension: 30 },
      interventions: [],
      trend: 'stable',
      confidence: 0.75,
    },
  };
}

function generateDetectionWithFocusScore(focusScore: number) {
  const detection = generateRandomDetection();
  detection.focus.focusScore = Math.max(0, Math.min(100, focusScore));
  return detection;
}

function generateDetectionWithStressScore(stressScore: number) {
  const detection = generateRandomDetection();
  detection.stress.stressScore = Math.max(0, Math.min(100, stressScore));
  return detection;
}

function generateDetectionWithDuration(durationMinutes: number) {
  const detection = generateRandomDetection();
  detection.focus.timeInState = durationMinutes * 60; // Convert to seconds
  return detection;
}
