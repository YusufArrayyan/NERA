import { Injectable, Logger } from '@nestjs/common';
import { EEGDataPoint } from '../interfaces/eeg-provider.interface';

/**
 * EEG Processing Pipeline
 * Implements the signal processing chain from the research paper:
 * Raw → Bandpass → Notch → Artifact Removal → FFT → PSD → Band Power → Feature Extraction
 *
 * Key formula: F_ratio = P_beta / (P_alpha + P_theta)
 * Classification:
 *   LOW:      F_ratio < 1.0
 *   MODERATE: 1.0 ≤ F_ratio ≤ 1.5
 *   HIGH:     F_ratio > 1.5
 */

export interface ProcessedEEG {
  focusIndex: number;       // 0-100
  stressIndex: number;      // 0-100
  fRatio: number;           // P_beta / (P_alpha + P_theta)
  focusCategory: 'LOW' | 'MODERATE' | 'HIGH';
  attentionScore: number;   // 0-100
  qualityScore: number;     // 0-100
  bandPowers: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
  recommendedMode: 'VISUAL' | 'AUDITORY' | 'INTERACTIVE';
  timestamp: Date;
}

@Injectable()
export class EEGProcessingService {
  private readonly logger = new Logger(EEGProcessingService.name);

  // Sliding window buffer for more stable processing
  private buffer: EEGDataPoint[] = [];
  private readonly BUFFER_SIZE = 10;

  /**
   * Full processing pipeline for a single EEG data point
   */
  processDataPoint(raw: EEGDataPoint): ProcessedEEG {
    // Add to buffer
    this.buffer.push(raw);
    if (this.buffer.length > this.BUFFER_SIZE) {
      this.buffer.shift();
    }

    // Stage 1: Bandpass filter (simulated - using the raw values as already filtered)
    const filtered = this.bandpassFilter(raw);

    // Stage 2: Notch filter (50/60Hz removal - simulated)
    const notched = this.notchFilter(filtered);

    // Stage 3: Artifact removal
    const cleaned = this.removeArtifacts(notched);

    // Stage 4: Compute band powers (simulated FFT → PSD)
    const bandPowers = this.computeBandPowers(cleaned);

    // Stage 5: Calculate F-ratio (from research paper)
    const fRatio = this.calculateFRatio(bandPowers);

    // Stage 6: Classify focus
    const focusCategory = this.classifyFocus(fRatio);

    // Stage 7: Compute derived metrics
    const focusIndex = this.computeFocusIndex(cleaned, fRatio);
    const stressIndex = this.computeStressIndex(cleaned, bandPowers);
    const attentionScore = this.computeAttentionScore(cleaned, fRatio);
    const qualityScore = cleaned.signalQuality;

    // Stage 8: Determine recommended learning mode
    const recommendedMode = this.getRecommendedMode(focusCategory);

    return {
      focusIndex,
      stressIndex,
      fRatio: Math.round(fRatio * 100) / 100,
      focusCategory,
      attentionScore,
      qualityScore,
      bandPowers,
      recommendedMode,
      timestamp: new Date(),
    };
  }

  /**
   * Process a batch of data points (for historical analysis)
   */
  processBatch(dataPoints: EEGDataPoint[]): ProcessedEEG[] {
    return dataPoints.map((dp) => this.processDataPoint(dp));
  }

  /**
   * Get session summary from processed data
   */
  getSessionSummary(processedData: ProcessedEEG[]): {
    avgFocus: number;
    avgStress: number;
    avgAttention: number;
    dominantMode: string;
    focusDistribution: Record<string, number>;
    avgFRatio: number;
  } {
    if (processedData.length === 0) {
      return {
        avgFocus: 0, avgStress: 0, avgAttention: 0,
        dominantMode: 'VISUAL', focusDistribution: {}, avgFRatio: 0,
      };
    }

    const avgFocus = processedData.reduce((s, d) => s + d.focusIndex, 0) / processedData.length;
    const avgStress = processedData.reduce((s, d) => s + d.stressIndex, 0) / processedData.length;
    const avgAttention = processedData.reduce((s, d) => s + d.attentionScore, 0) / processedData.length;
    const avgFRatio = processedData.reduce((s, d) => s + d.fRatio, 0) / processedData.length;

    // Focus distribution
    const focusDistribution: Record<string, number> = { LOW: 0, MODERATE: 0, HIGH: 0 };
    processedData.forEach((d) => {
      focusDistribution[d.focusCategory]++;
    });
    Object.keys(focusDistribution).forEach((k) => {
      focusDistribution[k] = Math.round((focusDistribution[k] / processedData.length) * 100);
    });

    // Dominant mode
    const modeCounts: Record<string, number> = {};
    processedData.forEach((d) => {
      modeCounts[d.recommendedMode] = (modeCounts[d.recommendedMode] || 0) + 1;
    });
    const dominantMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'VISUAL';

    return {
      avgFocus: Math.round(avgFocus),
      avgStress: Math.round(avgStress),
      avgAttention: Math.round(avgAttention),
      dominantMode,
      focusDistribution,
      avgFRatio: Math.round(avgFRatio * 100) / 100,
    };
  }

  // ─── PIPELINE STAGES ─────────────────

  private bandpassFilter(data: EEGDataPoint): EEGDataPoint {
    // Simulated bandpass filter (0.5-30Hz)
    // In a real implementation, this would use a Butterworth filter
    // For simulator data, the values are already in-band
    return { ...data };
  }

  private notchFilter(data: EEGDataPoint): EEGDataPoint {
    // Simulated 50/60Hz notch filter
    // Removes powerline interference - not applicable to simulated data
    return { ...data };
  }

  private removeArtifacts(data: EEGDataPoint): EEGDataPoint {
    // Artifact detection using z-score against buffer
    if (this.buffer.length < 3) return { ...data };

    const result = { ...data };
    const fields: (keyof Pick<EEGDataPoint, 'alpha' | 'beta' | 'theta' | 'gamma'>)[] = ['alpha', 'beta', 'theta', 'gamma'];

    for (const field of fields) {
      const values = this.buffer.map((d) => d[field]);
      const mean = values.reduce((s, v) => s + v, 0) / values.length;
      const std = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);

      // If value is more than 3 std devs from mean, replace with mean (artifact removal)
      if (std > 0 && Math.abs(data[field] - mean) > 3 * std) {
        result[field] = mean;
      }
    }

    return result;
  }

  private computeBandPowers(data: EEGDataPoint): ProcessedEEG['bandPowers'] {
    // Simulated FFT → PSD → band power extraction
    // In reality: FFT decomposition into frequency bands, then PSD via Welch's method
    return {
      delta: Math.round((data.theta * 0.3 + Math.random() * 2) * 100) / 100,
      theta: Math.round(data.theta * 100) / 100,
      alpha: Math.round(data.alpha * 100) / 100,
      beta: Math.round(data.beta * 100) / 100,
      gamma: Math.round((data.gamma || data.beta * 1.2) * 100) / 100,
    };
  }

  /**
   * F-ratio calculation from the research paper:
   * F_ratio = P_beta / (P_alpha + P_theta)
   */
  private calculateFRatio(bandPowers: ProcessedEEG['bandPowers']): number {
    const denominator = bandPowers.alpha + bandPowers.theta;
    if (denominator === 0) return 1.0;
    return bandPowers.beta / denominator;
  }

  /**
   * Focus classification based on F-ratio thresholds from the research:
   * LOW:      F_ratio < 1.0     → 20% of students
   * MODERATE: 1.0 ≤ F_ratio ≤ 1.5 → 60% of students (mean = 1.35)
   * HIGH:     F_ratio > 1.5     → 20% of students
   */
  private classifyFocus(fRatio: number): 'LOW' | 'MODERATE' | 'HIGH' {
    if (fRatio < 1.0) return 'LOW';
    if (fRatio <= 1.5) return 'MODERATE';
    return 'HIGH';
  }

  /**
   * Compute focus index (0-100) from attention and F-ratio
   */
  private computeFocusIndex(data: EEGDataPoint, fRatio: number): number {
    // Weighted combination of attention and normalized F-ratio
    const normalizedFRatio = Math.min(fRatio / 2.0, 1.0) * 100;
    const focusIndex = 0.6 * data.attention + 0.4 * normalizedFRatio;
    return Math.round(Math.max(0, Math.min(100, focusIndex)));
  }

  /**
   * Compute stress index based on beta/alpha ratio and meditation inverse
   */
  private computeStressIndex(data: EEGDataPoint, bandPowers: ProcessedEEG['bandPowers']): number {
    const betaAlphaRatio = bandPowers.alpha > 0 ? bandPowers.beta / bandPowers.alpha : 1;
    const stressFromRatio = Math.min(betaAlphaRatio / 3.0, 1.0) * 50;
    const stressFromMeditation = (100 - data.meditation) * 0.5;
    return Math.round(Math.max(0, Math.min(100, stressFromRatio + stressFromMeditation)));
  }

  /**
   * Compute attention score combining raw attention with processing results
   */
  private computeAttentionScore(data: EEGDataPoint, fRatio: number): number {
    const normalizedFRatio = Math.min(fRatio / 2.0, 1.0) * 100;
    return Math.round(0.7 * data.attention + 0.3 * normalizedFRatio);
  }

  /**
   * Adaptive learning mode recommendation based on focus category
   * From research Table 2:
   *   LOW    → Visual Mode (visually stimulating content)
   *   MODERATE → Auditory Mode (standard learning)
   *   HIGH   → Interactive Mode (problem-based, cognitively demanding)
   */
  private getRecommendedMode(category: 'LOW' | 'MODERATE' | 'HIGH'): 'VISUAL' | 'AUDITORY' | 'INTERACTIVE' {
    switch (category) {
      case 'LOW': return 'VISUAL';
      case 'MODERATE': return 'AUDITORY';
      case 'HIGH': return 'INTERACTIVE';
    }
  }
}
