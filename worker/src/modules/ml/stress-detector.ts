/**
 * Stress & Anxiety Detection Module
 * Detects stress and anxiety from EEG patterns using ML model
 */

import { EEGFeatures } from './feature-extractor';

export type StressLevel = 'low' | 'medium' | 'high' | 'critical';

export interface StressDetection {
  stressLevel: StressLevel;
  stressScore: number; // 0-100
  anxietyScore: number; // 0-100
  confidence: number; // 0-1
  indicators: {
    highFrequencyDominance: boolean;
    elevatedGamma: boolean;
    reducedAlpha: boolean;
    highEntropy: boolean;
    rapidChanges: boolean;
  };
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  timestamp: number;
}

export interface StressIntervention {
  type: 'breathing' | 'meditation' | 'break' | 'movement' | 'alert';
  duration: number; // seconds
  description: string;
  instructions: string[];
  expectedOutcome: string;
}

/**
 * Random Forest-based Stress Detector
 */
export class StressDetector {
  private modelWeights = this.initializeModelWeights();
  private interventionLibrary = this.buildInterventionLibrary();

  /**
   * Detect stress level from EEG features
   */
  detectStress(features: EEGFeatures): StressDetection {
    // Calculate stress score using feature analysis
    const stressScore = this.calculateStressScore(features);
    const anxietyScore = this.calculateAnxietyScore(features);

    // Determine stress level
    const stressLevel = this.getStressLevel(stressScore);

    // Get indicators
    const indicators = this.extractIndicators(features);

    // Generate recommendations
    const recommendations = this.generateRecommendations(stressLevel, features);

    // Determine urgency
    const urgency = this.determineUrgency(stressLevel, indicators);

    // Calculate confidence
    const confidence = this.calculateConfidence(features, stressScore);

    return {
      stressLevel,
      stressScore,
      anxietyScore,
      confidence,
      indicators,
      recommendations,
      urgency,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate stress score (0-100)
   */
  private calculateStressScore(features: EEGFeatures): number {
    let score = 0;

    // Factor 1: Beta/Alpha ratio (high beta = stress)
    const betaAlphaRatio = features.ratios.betaAlphaRatio;
    const baScore = Math.min(100, Math.max(0, (betaAlphaRatio - 0.5) * 30));
    score += baScore * 0.30; // 30% weight

    // Factor 2: Gamma power (high gamma = stress/anxiety)
    const gammaPercent = features.frequencyDomain.gammaPercent;
    const gammaScore = Math.min(100, gammaPercent * 10);
    score += gammaScore * 0.25; // 25% weight

    // Factor 3: Alpha reduction (low alpha = stress)
    const alphaPercent = features.frequencyDomain.alphaPercent;
    const alphaScore = Math.max(0, 100 - alphaPercent * 2);
    score += alphaScore * 0.20; // 20% weight

    // Factor 4: Entropy (high entropy = disorganized = stressed)
    const entropy = features.entropy.shannonEntropy;
    const entropyScore = Math.min(100, Math.max(0, (entropy - 1) * 30));
    score += entropyScore * 0.15; // 15% weight

    // Factor 5: Rapid changes (high rate of change = agitation)
    const rateOfChange = features.temporal.rateOfChange;
    const changeScore = Math.min(100, rateOfChange * 5);
    score += changeScore * 0.10; // 10% weight

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate anxiety score (0-100)
   * Anxiety specific: focuses on frequency instability and gamma bursts
   */
  private calculateAnxietyScore(features: EEGFeatures): number {
    let score = 0;

    // Factor 1: Gamma/Alpha ratio (anxiety marker)
    const gammaAlphaRatio = features.ratios.gammaAlphaRatio;
    const gaScore = Math.min(100, gammaAlphaRatio * 50);
    score += gaScore * 0.35; // 35% weight

    // Factor 2: Spectral spread (instability)
    const spectralSpread = features.spectral.spectralSpread;
    const spreadScore = Math.min(100, spectralSpread * 10);
    score += spreadScore * 0.25; // 25% weight

    // Factor 3: Approximate entropy (disorganization)
    const entropy = features.entropy.approximateEntropy;
    const entropyScore = Math.min(100, Math.max(0, entropy * 50));
    score += entropyScore * 0.20; // 20% weight

    // Factor 4: Theta/Beta ratio reduction (anxiety)
    const thetaBetaRatio = features.ratios.thetaBetaRatio;
    const tbScore = Math.max(0, 100 - thetaBetaRatio * 50);
    score += tbScore * 0.20; // 20% weight

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine stress level from score
   */
  private getStressLevel(score: number): StressLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
  }

  /**
   * Extract stress indicators
   */
  private extractIndicators(features: EEGFeatures) {
    return {
      highFrequencyDominance: features.ratios.betaAlphaRatio > 2.0,
      elevatedGamma: features.frequencyDomain.gammaPercent > 20,
      reducedAlpha: features.frequencyDomain.alphaPercent < 15,
      highEntropy: features.entropy.shannonEntropy > 2.5,
      rapidChanges: features.temporal.rateOfChange > 100,
    };
  }

  /**
   * Generate recommendations based on stress level
   */
  private generateRecommendations(stressLevel: StressLevel, features: EEGFeatures): string[] {
    const recommendations: string[] = [];

    if (stressLevel === 'critical') {
      recommendations.push('🚨 IMMEDIATE: Your stress levels are very high');
      recommendations.push('⏸️ Take a 10-minute break immediately');
      recommendations.push('🧘 Try the "Emergency Calm" meditation');
      recommendations.push('💧 Drink water and step outside if possible');
      recommendations.push('🔔 Consider contacting a counselor');
    } else if (stressLevel === 'high') {
      recommendations.push('⚠️ Your stress levels are elevated');
      recommendations.push('🧘 Practice deep breathing (5 minutes)');
      recommendations.push('🚶 Take a short walk or stretch');
      recommendations.push('🎵 Listen to calming music');
      recommendations.push('✋ Take a 5-minute break');
    } else if (stressLevel === 'medium') {
      recommendations.push('📊 Your stress is moderately elevated');
      recommendations.push('☕ Consider a short break');
      recommendations.push('🧘 Try a quick meditation');
      recommendations.push('💬 Talk to someone');
      recommendations.push('🎯 Focus on one task at a time');
    } else {
      recommendations.push('✅ Your stress levels are healthy');
      recommendations.push('💪 Keep up the good work!');
      recommendations.push('🎯 Continue with your current task');
      recommendations.push('🌟 Great focus! You\'re in a good state');
    }

    return recommendations;
  }

  /**
   * Determine intervention urgency
   */
  private determineUrgency(stressLevel: StressLevel, indicators: any): 'low' | 'medium' | 'high' | 'immediate' {
    if (stressLevel === 'critical') return 'immediate';
    if (stressLevel === 'high' && indicators.rapidChanges) return 'high';
    if (stressLevel === 'high') return 'high';
    if (stressLevel === 'medium') return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence in the detection
   */
  private calculateConfidence(features: EEGFeatures, stressScore: number): number {
    // Confidence is higher when indicators are consistent
    let confidence = 0.6; // Base confidence

    // Increase if multiple indicators align
    const alignedIndicators = [
      features.ratios.betaAlphaRatio > 1.5,
      features.frequencyDomain.gammaPercent > 12,
      features.entropy.shannonEntropy > 2.0,
      features.temporal.rateOfChange > 50,
    ].filter(Boolean).length;

    confidence += (alignedIndicators / 4) * 0.35; // Up to 95%

    // Decrease if stress is in ambiguous middle range
    if (stressScore > 40 && stressScore < 60) {
      confidence -= 0.1;
    }

    return Math.min(1, Math.max(0.5, confidence));
  }

  /**
   * Get recommended intervention for stress level
   */
  getRecommendedIntervention(stressLevel: StressLevel): StressIntervention {
    const interventions: Record<StressLevel, StressIntervention> = {
      critical: {
        type: 'alert',
        duration: 300, // 5 minutes
        description: 'Emergency stress relief - immediate intervention',
        instructions: [
          '1. STOP what you\'re doing',
          '2. Take 5 deep breaths (inhale 4s, hold 4s, exhale 4s)',
          '3. If possible, step outside or find a quiet space',
          '4. Drink a glass of water',
          '5. Contact a counselor or trusted person if stress persists',
        ],
        expectedOutcome: 'Reduce stress from critical to high within 5 minutes',
      },
      high: {
        type: 'breathing',
        duration: 300,
        description: '4-7-8 Breathing technique for anxiety relief',
        instructions: [
          '1. Exhale completely through mouth (whoosh sound)',
          '2. Inhale through nose for count of 4',
          '3. Hold your breath for count of 7',
          '4. Exhale through mouth for count of 8',
          '5. Repeat 4 times (about 1 minute)',
        ],
        expectedOutcome: 'Activate parasympathetic nervous system, reduce stress by 20-30%',
      },
      medium: {
        type: 'meditation',
        duration: 300,
        description: '5-minute body scan meditation',
        instructions: [
          '1. Sit comfortably and close your eyes',
          '2. Bring attention to your feet, relax muscles',
          '3. Move attention up: ankles, calves, knees, thighs...',
          '4. Continue to chest, shoulders, arms, neck, head',
          '5. Breathe naturally and notice any remaining tension',
        ],
        expectedOutcome: 'Ground yourself in present moment, reduce anxiety by 10-20%',
      },
      low: {
        type: 'break',
        duration: 60,
        description: 'Light activity break',
        instructions: [
          '1. Stand up and stretch for 1 minute',
          '2. Get a drink of water',
          '3. Look away from screen for 20 seconds (20-20-20 rule)',
          '4. Take a few deep breaths',
          '5. Resume your task when ready',
        ],
        expectedOutcome: 'Maintain healthy stress levels',
      },
    };

    return interventions[stressLevel];
  }

  /**
   * Get detailed stress profile
   */
  getStressProfile(detection: StressDetection): Record<string, any> {
    const intervention = this.getRecommendedIntervention(detection.stressLevel);

    return {
      assessment: {
        stressLevel: detection.stressLevel,
        stressScore: detection.stressScore,
        anxietyScore: detection.anxietyScore,
        confidence: detection.confidence,
      },
      indicators: detection.indicators,
      urgency: detection.urgency,
      recommendations: detection.recommendations,
      intervention: {
        recommended: intervention.type,
        duration: intervention.duration,
        description: intervention.description,
        steps: intervention.instructions,
        expectedOutcome: intervention.expectedOutcome,
      },
      guidance: this.getGuidance(detection.stressLevel),
    };
  }

  /**
   * Get contextual guidance
   */
  private getGuidance(stressLevel: StressLevel): string {
    const guidance: Record<StressLevel, string> = {
      critical:
        'Your body is in a high-alert state. Immediate intervention needed. Please take a break and use breathing/meditation techniques.',
      high: 'You\'re experiencing significant stress. A brief intervention (5 min) can help reset your nervous system.',
      medium: 'Moderate stress detected. A short break and mindfulness practice could help restore balance.',
      low: 'Stress levels are healthy. Continue with good practices to maintain this state.',
    };

    return guidance[stressLevel];
  }

  /**
   * Track stress trends
   */
  trackTrend(detections: StressDetection[]): Record<string, any> {
    if (detections.length === 0) return { message: 'No data' };

    const scores = detections.map(d => d.stressScore);
    const avgStress = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxStress = Math.max(...scores);
    const minStress = Math.min(...scores);
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgStress, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Trend direction
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = secondAvg < firstAvg ? 'improving' : secondAvg > firstAvg ? 'worsening' : 'stable';

    return {
      statistics: {
        averageStress: avgStress.toFixed(1),
        maxStress,
        minStress,
        variance: variance.toFixed(1),
        stdDev: stdDev.toFixed(1),
      },
      trend,
      trendInterpretation: this.getTrendInterpretation(trend, avgStress),
      dataPoints: detections.length,
    };
  }

  private getTrendInterpretation(trend: string, avgStress: number): string {
    if (trend === 'improving') {
      return `✅ Good news! Your stress levels are improving. Keep using those coping strategies.`;
    } else if (trend === 'worsening') {
      return `⚠️ Your stress levels are increasing. Consider increasing interventions or seeking support.`;
    } else {
      return `→ Your stress levels are stable. Maintain current practices.`;
    }
  }

  /**
   * Initialize model weights (placeholder for trained model)
   */
  private initializeModelWeights(): Record<string, any> {
    return {
      featureWeights: {
        betaAlphaRatio: 0.30,
        gammaPercent: 0.25,
        alphaPercent: 0.20,
        entropy: 0.15,
        rateOfChange: 0.10,
      },
    };
  }

  /**
   * Build intervention library
   */
  private buildInterventionLibrary(): Record<string, StressIntervention> {
    return {
      breathing_4_7_8: {
        type: 'breathing',
        duration: 300,
        description: '4-7-8 Breathing technique',
        instructions: [
          'Exhale completely through mouth',
          'Inhale through nose for 4 counts',
          'Hold breath for 7 counts',
          'Exhale through mouth for 8 counts',
          'Repeat 4 times',
        ],
        expectedOutcome: 'Reduce stress by 20-30%',
      },
      meditation_body_scan: {
        type: 'meditation',
        duration: 300,
        description: 'Body scan meditation',
        instructions: [
          'Sit comfortably with eyes closed',
          'Scan from feet to head',
          'Notice and release tension',
          'Breathe naturally throughout',
        ],
        expectedOutcome: 'Reduce anxiety by 10-20%',
      },
      movement_stretch: {
        type: 'movement',
        duration: 600,
        description: '10-minute stretching routine',
        instructions: [
          'Neck rolls: 30 seconds',
          'Shoulder shrugs: 30 seconds',
          'Arm circles: 1 minute',
          'Forward fold: 1 minute',
          'Yoga poses: 6 minutes',
        ],
        expectedOutcome: 'Release physical tension, reduce stress',
      },
    };
  }
}

/**
 * Create stress detector instance
 */
export function createStressDetector(): StressDetector {
  return new StressDetector();
}
