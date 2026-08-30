/**
 * Focus & Attention Analytics Module
 * Real-time attention state machine and focus metrics
 */

import { EEGFeatures } from './feature-extractor';

export type AttentionState = 'deep_focus' | 'light_focus' | 'distracted' | 'off_task' | 'fatigued';

export interface FocusDetection {
  currentState: AttentionState;
  stateConfidence: number; // 0-1
  focusScore: number; // 0-100, raw focus calculation
  focusIntensity: 'none' | 'light' | 'moderate' | 'strong' | 'deep';
  focusStability: number; // 0-100, consistency of focus
  estimatedDuration: number; // seconds user can maintain focus
  timeInState: number; // seconds
  prediction: {
    nextState: AttentionState;
    timeToSwitch: number; // seconds
    probability: number; // 0-1
  };
  timestamp: number;
}

export interface FocusSession {
  sessionId: string;
  startTime: number;
  states: FocusDetection[];
  totalDuration: number;
  averageFocus: number;
  peakFocus: number;
  focusBreakdown: Record<AttentionState, number>; // % time in each state
  transitions: Array<{ from: AttentionState; to: AttentionState; time: number }>;
  insights: string[];
}

/**
 * State Machine for Attention Analysis
 */
export class FocusAnalytics {
  private currentState: AttentionState = 'light_focus';
  private stateHistory: Array<{ state: AttentionState; time: number }> = [];
  private focusHistory: number[] = [];
  private lastStateChangeTime: number = Date.now();
  private sessionStart: number = Date.now();

  private stateThresholds = {
    deep_focus: {
      betaAlphaMin: 1.8,
      entropyMax: 1.2,
      alphaPercentMin: 20,
      gammaPercentMax: 10,
    },
    light_focus: {
      betaAlphaMin: 1.2,
      entropyMax: 1.8,
      alphaPercentMin: 15,
      gammaPercentMax: 15,
    },
    distracted: {
      betaAlphaMin: 0.8,
      entropyMin: 1.5,
      alphaPercentMin: 20,
      gammaPercentMax: 20,
    },
    off_task: {
      betaAlphaMax: 0.8,
      entropyMin: 2.0,
      alphaPercentMax: 50,
      deltaPercentMin: 10,
    },
    fatigued: {
      thetaPercentMin: 30,
      deltaPercentMin: 15,
      entropyMin: 2.2,
      alphaPercentMin: 25,
    },
  };

  /**
   * Detect current attention state from EEG features
   */
  detectFocus(features: EEGFeatures): FocusDetection {
    // Calculate focus score (0-100)
    const focusScore = this.calculateFocusScore(features);

    // Determine attention state using state machine
    const currentState = this.determineState(features, focusScore);

    // Update state history if changed
    if (currentState !== this.currentState) {
      this.stateHistory.push({
        state: this.currentState,
        time: Date.now() - this.lastStateChangeTime,
      });
      this.currentState = currentState;
      this.lastStateChangeTime = Date.now();
    }

    // Track focus score history
    this.focusHistory.push(focusScore);
    if (this.focusHistory.length > 3600) {
      // Keep last hour
      this.focusHistory.shift();
    }

    // Calculate metrics
    const stateConfidence = this.calculateStateConfidence(features, currentState);
    const focusIntensity = this.getFocusIntensity(focusScore);
    const focusStability = this.calculateFocusStability();
    const estimatedDuration = this.estimateFocusDuration(focusScore);
    const timeInState = Math.round((Date.now() - this.lastStateChangeTime) / 1000);

    // Predict next state
    const prediction = this.predictNextState(features, currentState);

    return {
      currentState,
      stateConfidence,
      focusScore,
      focusIntensity,
      focusStability,
      estimatedDuration,
      timeInState,
      prediction,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate focus score (0-100)
   */
  private calculateFocusScore(features: EEGFeatures): number {
    let score = 0;

    // Factor 1: Beta/Alpha ratio (high beta = focus)
    const betaAlpha = features.ratios.betaAlphaRatio;
    const baScore = Math.min(100, Math.max(0, (betaAlpha - 0.5) * 40));
    score += baScore * 0.30;

    // Factor 2: Alpha stability (organized alpha = focus)
    const alphaPercent = features.frequencyDomain.alphaPercent;
    const alphaScore = Math.min(100, Math.max(0, alphaPercent - 10) * 2);
    score += alphaScore * 0.20;

    // Factor 3: Low entropy (organized = focused)
    const entropy = features.entropy.shannonEntropy;
    const entropyScore = Math.max(0, 100 - Math.max(0, entropy - 1) * 30);
    score += entropyScore * 0.25;

    // Factor 4: Low gamma (no excessive neural noise)
    const gammaPercent = features.frequencyDomain.gammaPercent;
    const gammaScore = Math.max(0, 100 - gammaPercent * 5);
    score += gammaScore * 0.15;

    // Factor 5: Temporal consistency (stable activity)
    const complexity = features.temporal.complexity;
    const complexityScore = Math.max(0, 100 - complexity * 3);
    score += complexityScore * 0.10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine attention state using state machine
   */
  private determineState(features: EEGFeatures, focusScore: number): AttentionState {
    const thresholds = this.stateThresholds;
    const scores: Record<AttentionState, number> = {
      deep_focus: this.getStateScore(features, 'deep_focus'),
      light_focus: this.getStateScore(features, 'light_focus'),
      distracted: this.getStateScore(features, 'distracted'),
      off_task: this.getStateScore(features, 'off_task'),
      fatigued: this.getStateScore(features, 'fatigued'),
    };

    // Find highest scoring state
    let bestState: AttentionState = 'light_focus';
    let bestScore = scores['light_focus'];

    for (const [state, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestState = state as AttentionState;
      }
    }

    return bestState;
  }

  /**
   * Calculate score for a specific state
   */
  private getStateScore(features: EEGFeatures, state: AttentionState): number {
    let score = 0;

    if (state === 'deep_focus') {
      if (features.ratios.betaAlphaRatio > this.stateThresholds.deep_focus.betaAlphaMin) score += 40;
      if (features.entropy.shannonEntropy < this.stateThresholds.deep_focus.entropyMax) score += 30;
      if (features.frequencyDomain.alphaPercent > this.stateThresholds.deep_focus.alphaPercentMin)
        score += 20;
      if (features.frequencyDomain.gammaPercent < this.stateThresholds.deep_focus.gammaPercentMax)
        score += 10;
    } else if (state === 'light_focus') {
      if (features.ratios.betaAlphaRatio > this.stateThresholds.light_focus.betaAlphaMin) score += 30;
      if (features.entropy.shannonEntropy < this.stateThresholds.light_focus.entropyMax) score += 25;
      if (features.frequencyDomain.alphaPercent > this.stateThresholds.light_focus.alphaPercentMin)
        score += 25;
      if (features.frequencyDomain.gammaPercent < this.stateThresholds.light_focus.gammaPercentMax)
        score += 20;
    } else if (state === 'distracted') {
      if (features.entropy.shannonEntropy > 1.5) score += 30;
      if (features.frequencyDomain.alphaPercent > 20) score += 25;
      if (features.temporal.rateOfChange > 50) score += 25;
      if (features.frequencyDomain.gammaPercent > 12) score += 20;
    } else if (state === 'off_task') {
      if (features.ratios.betaAlphaRatio < 0.8) score += 35;
      if (features.entropy.shannonEntropy > 2.0) score += 35;
      if (features.frequencyDomain.alphaPercent > 40) score += 20;
      if (features.frequencyDomain.deltaPercent > 10) score += 10;
    } else if (state === 'fatigued') {
      if (features.frequencyDomain.thetaPercent > 30) score += 35;
      if (features.frequencyDomain.deltaPercent > 15) score += 30;
      if (features.entropy.shannonEntropy > 2.2) score += 20;
      if (features.frequencyDomain.alphaPercent > 25) score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate confidence in state detection
   */
  private calculateStateConfidence(features: EEGFeatures, state: AttentionState): number {
    let confidence = 0.6;

    // Check how well features match state thresholds
    const thresholds = this.stateThresholds[state];
    let matches = 0;
    let totalChecks = 0;

    // This is simplified - in production would check all relevant thresholds
    if ('betaAlphaMin' in thresholds) {
      if (features.ratios.betaAlphaRatio >= (thresholds as any).betaAlphaMin) matches++;
      totalChecks++;
    }

    if (totalChecks > 0) {
      confidence = 0.6 + (matches / totalChecks) * 0.35;
    }

    return Math.min(1, Math.max(0.5, confidence));
  }

  /**
   * Get focus intensity level
   */
  private getFocusIntensity(focusScore: number): 'none' | 'light' | 'moderate' | 'strong' | 'deep' {
    if (focusScore >= 85) return 'deep';
    if (focusScore >= 70) return 'strong';
    if (focusScore >= 50) return 'moderate';
    if (focusScore >= 25) return 'light';
    return 'none';
  }

  /**
   * Calculate focus stability (consistency)
   */
  private calculateFocusStability(): number {
    if (this.focusHistory.length < 10) return 50;

    // Calculate variance in recent focus scores
    const recentScores = this.focusHistory.slice(-60); // Last minute
    const mean = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const variance = recentScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / recentScores.length;
    const stdDev = Math.sqrt(variance);

    // Lower std dev = more stable
    const stability = Math.max(0, 100 - stdDev * 3);
    return Math.min(100, stability);
  }

  /**
   * Estimate how long user can maintain current focus
   */
  private estimateFocusDuration(focusScore: number): number {
    // Based on focus score, estimate sustainable duration
    if (focusScore >= 80) return 90; // 90 minutes of deep focus
    if (focusScore >= 60) return 45; // 45 minutes of moderate focus
    if (focusScore >= 40) return 25; // 25 minutes before needing break
    if (focusScore >= 20) return 10; // 10 minutes
    return 0; // Can't sustain focus
  }

  /**
   * Predict next state
   */
  private predictNextState(
    features: EEGFeatures,
    currentState: AttentionState
  ): {
    nextState: AttentionState;
    timeToSwitch: number;
    probability: number;
  } {
    // State transitions based on current features
    const transitions: Record<AttentionState, Array<[AttentionState, number]>> = {
      deep_focus: [
        ['light_focus', 0.4],
        ['distracted', 0.3],
        ['off_task', 0.2],
        ['fatigued', 0.1],
      ],
      light_focus: [
        ['deep_focus', 0.3],
        ['distracted', 0.4],
        ['off_task', 0.2],
        ['fatigued', 0.1],
      ],
      distracted: [
        ['off_task', 0.5],
        ['light_focus', 0.3],
        ['fatigued', 0.15],
        ['deep_focus', 0.05],
      ],
      off_task: [
        ['fatigued', 0.5],
        ['distracted', 0.3],
        ['light_focus', 0.15],
        ['deep_focus', 0.05],
      ],
      fatigued: [
        ['off_task', 0.4],
        ['distracted', 0.3],
        ['light_focus', 0.2],
        ['deep_focus', 0.1],
      ],
    };

    const possibleTransitions = transitions[currentState] || transitions['light_focus'];
    const [nextState, probability] = possibleTransitions[0]; // Highest probability

    // Estimate time based on focus intensity
    const timeToSwitch = Math.round(this.estimateFocusDuration(features.ratios.betaAlphaRatio * 20));

    return {
      nextState,
      timeToSwitch,
      probability,
    };
  }

  /**
   * Get session summary
   */
  getSessionSummary(): FocusSession {
    const now = Date.now();
    const totalDuration = Math.round((now - this.sessionStart) / 1000);

    // Calculate metrics
    const averageFocus =
      this.focusHistory.length > 0
        ? this.focusHistory.reduce((a, b) => a + b, 0) / this.focusHistory.length
        : 0;

    const peakFocus = this.focusHistory.length > 0 ? Math.max(...this.focusHistory) : 0;

    // Focus breakdown by state
    const focusBreakdown: Record<AttentionState, number> = {
      deep_focus: 0,
      light_focus: 0,
      distracted: 0,
      off_task: 0,
      fatigued: 0,
    };

    for (const entry of this.stateHistory) {
      focusBreakdown[entry.state] += entry.time;
    }

    for (const state of Object.keys(focusBreakdown)) {
      focusBreakdown[state as AttentionState] = (focusBreakdown[state as AttentionState] / totalDuration) * 100;
    }

    // Collect transitions
    const transitions: Array<{ from: AttentionState; to: AttentionState; time: number }> = [];
    for (let i = 0; i < this.stateHistory.length - 1; i++) {
      transitions.push({
        from: this.stateHistory[i].state,
        to: this.stateHistory[i + 1].state,
        time: this.stateHistory[i].time,
      });
    }

    // Generate insights
    const insights = this.generateSessionInsights(focusBreakdown, averageFocus, transitions);

    return {
      sessionId: `session-${this.sessionStart}`,
      startTime: this.sessionStart,
      states: [], // Would be populated with full history
      totalDuration,
      averageFocus: Math.round(averageFocus),
      peakFocus: Math.round(peakFocus),
      focusBreakdown,
      transitions,
      insights,
    };
  }

  /**
   * Generate insights from session
   */
  private generateSessionInsights(
    breakdown: Record<AttentionState, number>,
    avgFocus: number,
    transitions: any[]
  ): string[] {
    const insights: string[] = [];

    if (breakdown['deep_focus'] > 50) {
      insights.push('🎯 Excellent focus! You spent most of the session in deep focus.');
    } else if (breakdown['deep_focus'] > 25) {
      insights.push('✅ Good focus management. Consider reducing distractions for even better results.');
    } else if (breakdown['off_task'] > 50) {
      insights.push('⚠️ You spent a lot of time off-task. Try breaking work into smaller chunks.');
    }

    if (avgFocus > 70) {
      insights.push('💪 Your focus was very consistent throughout the session.');
    } else if (avgFocus > 50) {
      insights.push('→ Your focus was moderate. Try longer breaks between sessions.');
    } else {
      insights.push('💤 Consider optimizing your environment for better focus.');
    }

    if (transitions.length > 10) {
      insights.push('🔄 You switched focus states frequently. Try to minimize context switching.');
    } else if (transitions.length < 3) {
      insights.push('🎯 Great stability! Consistent state throughout the session.');
    }

    return insights;
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.currentState = 'light_focus';
    this.stateHistory = [];
    this.focusHistory = [];
    this.lastStateChangeTime = Date.now();
    this.sessionStart = Date.now();
  }
}

/**
 * Create focus analytics instance
 */
export function createFocusAnalytics(): FocusAnalytics {
  return new FocusAnalytics();
}

/**
 * Analyze focus trends over time
 */
export function analyzeFocusTrends(detections: FocusDetection[]): Record<string, any> {
  if (detections.length === 0) return { message: 'No data' };

  const focusScores = detections.map(d => d.focusScore);
  const states = detections.map(d => d.currentState);

  // Calculate statistics
  const avgFocus = focusScores.reduce((a, b) => a + b, 0) / focusScores.length;
  const maxFocus = Math.max(...focusScores);
  const minFocus = Math.min(...focusScores);

  // State distribution
  const stateCount: Record<AttentionState, number> = {
    deep_focus: 0,
    light_focus: 0,
    distracted: 0,
    off_task: 0,
    fatigued: 0,
  };

  for (const state of states) {
    stateCount[state]++;
  }

  // Trend direction
  const firstHalf = focusScores.slice(0, Math.floor(focusScores.length / 2));
  const secondHalf = focusScores.slice(Math.floor(focusScores.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trend = secondAvg > firstAvg ? 'improving' : secondAvg < firstAvg ? 'declining' : 'stable';

  return {
    statistics: {
      averageFocus: avgFocus.toFixed(1),
      maxFocus,
      minFocus,
      dataPoints: detections.length,
    },
    stateDistribution: stateCount,
    trend,
    recommendation: getTrendRecommendation(trend, avgFocus),
  };
}

function getTrendRecommendation(trend: string, avgFocus: number): string {
  if (trend === 'improving') {
    return '✅ Great! Your focus is improving. Keep up the good work!';
  } else if (trend === 'declining') {
    return '⚠️ Your focus is declining. Consider taking a break or optimizing your environment.';
  } else {
    return '→ Your focus is stable. Maintain your current routine.';
  }
}
