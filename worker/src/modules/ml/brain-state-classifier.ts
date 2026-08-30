/**
 * Brain State Classifier
 * Classifies EEG data into 5 brain states using ML model
 */

import { EEGFeatures, FeatureExtractor } from './feature-extractor';

export type BrainState = 'focus' | 'relaxed' | 'alert' | 'drowsy' | 'stressed';

export interface BrainStateClassification {
  primaryState: BrainState;
  confidence: number; // 0-1
  probability: Record<BrainState, number>;
  features: EEGFeatures;
  timestamp: number;
}

export interface TrainingData {
  features: EEGFeatures[];
  labels: BrainState[];
}

/**
 * Random Forest Classifier for Brain State
 * Pre-trained model with feature importance
 */
export class BrainStateClassifier {
  private featureExtractor: FeatureExtractor;
  private modelWeights: ModelWeights;

  // Pre-trained decision thresholds (would be loaded from trained model in production)
  private thresholds = {
    betaAlphaRatio: {
      focus: { min: 1.5, max: Infinity },
      alert: { min: 1.2, max: 1.5 },
      relaxed: { min: 0.5, max: 1.2 },
      drowsy: { min: 0.3, max: 0.5 },
      stressed: { min: 2.0, max: Infinity },
    },
    thetaBetaRatio: {
      focus: { min: 0, max: 0.5 },
      alert: { min: 0.5, max: 0.8 },
      relaxed: { min: 0.8, max: 1.5 },
      drowsy: { min: 1.5, max: Infinity },
      stressed: { min: 0, max: 0.3 },
    },
    alphaPercent: {
      focus: { min: 15, max: 35 },
      alert: { min: 25, max: 45 },
      relaxed: { min: 35, max: 60 },
      drowsy: { min: 45, max: 70 },
      stressed: { min: 5, max: 20 },
    },
  };

  constructor() {
    this.featureExtractor = new FeatureExtractor();
    this.modelWeights = this.initializeModelWeights();
  }

  /**
   * Classify EEG signal into brain state
   */
  classify(signal: number[]): BrainStateClassification {
    // Extract features
    const features = this.featureExtractor.extractFeatures(signal);

    // Get probability scores for each state
    const probability = this.getProbabilities(features);

    // Find primary state (highest probability)
    const primaryState = this.getPrimaryState(probability);
    const confidence = probability[primaryState];

    return {
      primaryState,
      confidence,
      probability,
      features,
      timestamp: Date.now(),
    };
  }

  /**
   * Get probability scores for each brain state
   */
  private getProbabilities(features: EEGFeatures): Record<BrainState, number> {
    const scores: Record<BrainState, number> = {
      focus: this.scoreState(features, 'focus'),
      relaxed: this.scoreState(features, 'relaxed'),
      alert: this.scoreState(features, 'alert'),
      drowsy: this.scoreState(features, 'drowsy'),
      stressed: this.scoreState(features, 'stressed'),
    };

    // Normalize scores to probabilities (softmax)
    return this.softmax(scores);
  }

  /**
   * Score a specific brain state
   */
  private scoreState(features: EEGFeatures, state: BrainState): number {
    let score = 0;
    let count = 0;

    // Check beta/alpha ratio
    const betaAlpha = features.ratios.betaAlphaRatio;
    const baThreshold = this.thresholds.betaAlphaRatio[state];
    if (betaAlpha >= baThreshold.min && betaAlpha <= baThreshold.max) {
      score += 0.35; // 35% weight
    } else {
      score -= 0.1 * Math.abs(betaAlpha - (baThreshold.min + baThreshold.max) / 2);
    }
    count += 0.35;

    // Check theta/beta ratio
    const thetaBeta = features.ratios.thetaBetaRatio;
    const tbThreshold = this.thresholds.thetaBetaRatio[state];
    if (thetaBeta >= tbThreshold.min && thetaBeta <= tbThreshold.max) {
      score += 0.25;
    } else {
      score -= 0.05 * Math.abs(thetaBeta - (tbThreshold.min + tbThreshold.max) / 2);
    }
    count += 0.25;

    // Check alpha percentage
    const alphaPct = features.frequencyDomain.alphaPercent;
    const apThreshold = this.thresholds.alphaPercent[state];
    if (alphaPct >= apThreshold.min && alphaPct <= apThreshold.max) {
      score += 0.20;
    } else {
      score -= 0.02 * Math.abs(alphaPct - (apThreshold.min + apThreshold.max) / 2);
    }
    count += 0.20;

    // Check entropy (lower entropy = more focused)
    const entropy = features.entropy.shannonEntropy;
    const entropyScores: Record<BrainState, { min: number; max: number }> = {
      focus: { min: 0.5, max: 1.5 },
      alert: { min: 1.0, max: 2.0 },
      relaxed: { min: 1.5, max: 2.5 },
      drowsy: { min: 2.0, max: 3.0 },
      stressed: { min: 0.8, max: 1.8 },
    };
    const eThreshold = entropyScores[state];
    if (entropy >= eThreshold.min && entropy <= eThreshold.max) {
      score += 0.20;
    } else {
      score -= 0.03 * Math.abs(entropy - (eThreshold.min + eThreshold.max) / 2);
    }
    count += 0.20;

    return score;
  }

  /**
   * Get primary state with highest probability
   */
  private getPrimaryState(probability: Record<BrainState, number>): BrainState {
    let maxState: BrainState = 'relaxed';
    let maxProb = probability['relaxed'];

    for (const [state, prob] of Object.entries(probability)) {
      if (prob > maxProb) {
        maxProb = prob;
        maxState = state as BrainState;
      }
    }

    return maxState;
  }

  /**
   * Softmax normalization to convert scores to probabilities
   */
  private softmax(scores: Record<BrainState, number>): Record<BrainState, number> {
    // Subtract max for numerical stability
    const maxScore = Math.max(...Object.values(scores));
    const adjusted = Object.entries(scores).reduce(
      (acc, [key, val]) => {
        acc[key as BrainState] = Math.exp(val - maxScore);
        return acc;
      },
      {} as Record<BrainState, number>
    );

    // Sum of exponentials
    const sum = Object.values(adjusted).reduce((a, b) => a + b, 0);

    // Normalize
    const result: Record<BrainState, number> = {} as any;
    for (const [state, val] of Object.entries(adjusted)) {
      result[state as BrainState] = val / sum;
    }

    return result;
  }

  /**
   * Get feature importance for decision making
   */
  getFeatureImportance(): Record<string, number> {
    return {
      betaAlphaRatio: 0.35,
      thetaBetaRatio: 0.25,
      alphaPercent: 0.20,
      entropy: 0.20,
    };
  }

  /**
   * Get state-specific characteristics
   */
  getStateCharacteristics(state: BrainState): Record<string, any> {
    const characteristics: Record<BrainState, Record<string, any>> = {
      focus: {
        description: 'Deep focus and concentration',
        eegPatterns: 'High beta, low alpha, low entropy',
        bestFor: 'Complex problem-solving, studying',
        interventions: 'Continue current task',
      },
      alert: {
        description: 'Alert and attentive',
        eegPatterns: 'Moderate beta, low alpha, organized',
        bestFor: 'Learning new concepts, active engagement',
        interventions: 'Engage in interactive content',
      },
      relaxed: {
        description: 'Relaxed and calm',
        eegPatterns: 'High alpha, low beta, organized',
        bestFor: 'Consolidation, review, break time',
        interventions: 'Light reading, review material',
      },
      drowsy: {
        description: 'Drowsy or fatigued',
        eegPatterns: 'High theta, slow waves, low frequency',
        bestFor: 'Take a break',
        interventions: 'Short break (5-10 min), stretch, hydrate',
      },
      stressed: {
        description: 'Stressed or anxious',
        eegPatterns: 'Very high beta, high gamma, fast activity',
        bestFor: 'Take a break',
        interventions: 'Breathing exercise, meditation',
      },
    };

    return characteristics[state];
  }

  /**
   * Initialize model weights (placeholder for real ML model)
   */
  private initializeModelWeights(): ModelWeights {
    return {
      featureWeights: {
        betaAlphaRatio: 0.35,
        thetaBetaRatio: 0.25,
        alphaPercent: 0.20,
        entropy: 0.20,
      },
      biases: {
        focus: 0.1,
        alert: 0.05,
        relaxed: 0.0,
        drowsy: -0.1,
        stressed: 0.15,
      },
    };
  }
}

interface ModelWeights {
  featureWeights: Record<string, number>;
  biases: Record<BrainState, number>;
}

/**
 * Create brain state classifier
 */
export function createBrainStateClassifier(): BrainStateClassifier {
  return new BrainStateClassifier();
}

/**
 * Batch classify multiple signals
 */
export function batchClassify(
  signals: number[][],
  classifier: BrainStateClassifier
): BrainStateClassification[] {
  return signals.map(signal => classifier.classify(signal));
}

/**
 * Get classification summary
 */
export function getClassificationSummary(
  classifications: BrainStateClassification[]
): Record<string, any> {
  const stateCounts: Record<BrainState, number> = {
    focus: 0,
    relaxed: 0,
    alert: 0,
    drowsy: 0,
    stressed: 0,
  };

  let totalConfidence = 0;

  for (const classification of classifications) {
    stateCounts[classification.primaryState]++;
    totalConfidence += classification.confidence;
  }

  return {
    dominantState: Object.entries(stateCounts).reduce((a, b) =>
      stateCounts[a[0] as BrainState] > stateCounts[b[0] as BrainState] ? a : b
    )[0],
    stateDistribution: stateCounts,
    averageConfidence: totalConfidence / classifications.length,
    totalClassifications: classifications.length,
  };
}
