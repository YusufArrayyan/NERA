/**
 * EEG Processor Module
 * Handles real-time EEG data processing and analysis
 * This runs locally on the user's machine for minimal latency
 */

export interface EEGData {
  timestamp: number;
  channels: number[];
  sampleRate: number;
  duration: number;
}

export interface ProcessedResult {
  focusScore: number; // 0-100
  relaxationScore: number; // 0-100
  stressLevel: 'low' | 'medium' | 'high';
  brainWaveFrequencies: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
  timestamp: number;
  sessionId: string;
}

export class EEGProcessor {
  private sessionId: string;
  private bufferSize: number = 256;
  private sampleRate: number = 256; // Hz

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Process raw EEG data and extract features
   */
  processEEGData(eegData: EEGData): ProcessedResult {
    const brainWaves = this.extractBrainWaves(eegData.channels);
    const focusScore = this.calculateFocusScore(brainWaves);
    const relaxationScore = this.calculateRelaxationScore(brainWaves);
    const stressLevel = this.determineStressLevel(brainWaves);

    return {
      focusScore,
      relaxationScore,
      stressLevel,
      brainWaveFrequencies: brainWaves,
      timestamp: eegData.timestamp,
      sessionId: this.sessionId,
    };
  }

  /**
   * Extract brain wave frequencies from EEG channels using FFT-like analysis
   */
  private extractBrainWaves(channels: number[]): {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  } {
    // Simplified brain wave extraction (in production, use proper FFT library)
    // This is a placeholder for demonstration
    const mean = channels.reduce((a, b) => a + b, 0) / channels.length;
    const variance =
      channels.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      channels.length;

    // Estimate band powers (simplified)
    return {
      delta: variance * 0.15, // 0-4 Hz
      theta: variance * 0.15, // 4-8 Hz
      alpha: variance * 0.3, // 8-12 Hz (associated with relaxation)
      beta: variance * 0.25, // 12-30 Hz (associated with focus)
      gamma: variance * 0.15, // 30-100 Hz
    };
  }

  /**
   * Calculate focus score based on brain wave patterns
   * High beta + low theta = good focus
   */
  private calculateFocusScore(brainWaves: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  }): number {
    const betaRatio = brainWaves.beta / (brainWaves.beta + brainWaves.theta);
    const gammaRatio = brainWaves.gamma / (brainWaves.gamma + brainWaves.delta);

    // Combine ratios to get focus score (0-100)
    const score = (betaRatio * 0.7 + gammaRatio * 0.3) * 100;
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate relaxation score based on alpha waves
   * High alpha = relaxed state
   */
  private calculateRelaxationScore(brainWaves: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  }): number {
    const alphaRatio = brainWaves.alpha / (brainWaves.beta + brainWaves.alpha);
    return Math.min(100, Math.max(0, alphaRatio * 100));
  }

  /**
   * Determine stress level from brain wave patterns
   */
  private determineStressLevel(brainWaves: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  }): 'low' | 'medium' | 'high' {
    const stressIndicator =
      (brainWaves.gamma + brainWaves.beta) /
      (brainWaves.alpha + brainWaves.theta);

    if (stressIndicator < 0.5) return 'low';
    if (stressIndicator < 1.5) return 'medium';
    return 'high';
  }

  /**
   * Generate AI-based recommendations based on current state
   */
  generateRecommendations(result: ProcessedResult): string[] {
    const recommendations: string[] = [];

    if (result.focusScore < 40) {
      recommendations.push('Take a short break - your focus is declining');
      recommendations.push('Try a 5-minute meditation exercise');
    }

    if (result.stressLevel === 'high') {
      recommendations.push('Your stress levels are high - practice deep breathing');
      recommendations.push('Consider a relaxation exercise');
    }

    if (result.relaxationScore > 70) {
      recommendations.push('Great! You are in a relaxed state');
      recommendations.push('Perfect time for creative work');
    }

    return recommendations;
  }
}
