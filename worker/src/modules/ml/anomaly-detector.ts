/**
 * Anomaly Detection & Signal Quality Module
 * Detects artifacts, signal degradation, and data quality issues
 */

import { EEGFeatures } from './feature-extractor';

export type ArtifactType =
  | 'eye_blink'
  | 'muscle_movement'
  | 'head_movement'
  | 'emg_noise'
  | 'device_disconnect'
  | 'saturation'
  | 'none';

export interface AnomalyDetection {
  hasArtifact: boolean;
  artifactType: ArtifactType;
  artifactConfidence: number; // 0-1
  artifactSeverity: 'none' | 'mild' | 'moderate' | 'severe'; // Impact on data quality
  signalQualityScore: number; // 0-100
  signalQualityLevel: 'excellent' | 'good' | 'fair' | 'poor' | 'unusable';
  detailedAnalysis: {
    eyeBlinkScore: number;
    muscleActivityScore: number;
    headMovementScore: number;
    emgNoiseScore: number;
    disconnectionScore: number;
    saturationScore: number;
  };
  recommendations: string[];
  timestamp: number;
}

export interface SignalQualityMetrics {
  overallScore: number; // 0-100
  artifactPercentage: number; // % of signal contaminated
  usablePercentage: number; // % of clean signal
  consecutiveCleanSamples: number;
  consecutiveArtifactSamples: number;
  trend: 'improving' | 'degrading' | 'stable';
  confidence: number; // 0-1
}

/**
 * Anomaly Detector for EEG Signal Quality
 */
export class AnomalyDetector {
  private artifactHistory: ArtifactType[] = [];
  private qualityHistory: number[] = [];
  private lastConsecutiveClean = 0;
  private lastConsecutiveArtifact = 0;

  private artifactThresholds = {
    eyeBlink: {
      alphaSpike: 2.0, // 2x normal alpha
      frontalGamma: 1.5, // 1.5x normal gamma
      rapidChange: 200, // samples/sec
    },
    muscleMovement: {
      emgThreshold: 100, // uV threshold
      gammaPercentage: 40, // High gamma indicates muscle
      betaPercentage: 35,
    },
    headMovement: {
      lowFrequencyAmplitude: 150, // uV in delta/theta
      broadbandIncrease: 1.8, // Overall signal increase
      frequencySpread: 40, // Hz spread
    },
    emgNoise: {
      emgBand: 60, // Hz band (50-60 Hz)
      emgAmplitude: 80, // uV
      consistency: 0.95, // 95% consistent frequency
    },
    deviceDisconnect: {
      zeroAmplitude: 0.1, // All zeros
      dcOffset: 500, // Large constant offset
      noVariance: 0.001, // No signal variation
    },
    saturation: {
      peakAmplitude: 1000, // uV (device max)
      clippingPercentage: 10, // % of samples at peak
      flatLinePercentage: 5, // % of duplicate values
    },
  };

  /**
   * Detect anomalies in EEG signal
   */
  detectAnomalies(features: EEGFeatures, signal: number[]): AnomalyDetection {
    // Calculate individual artifact scores
    const eyeBlinkScore = this.detectEyeBlink(features, signal);
    const muscleActivityScore = this.detectMuscleMovement(features, signal);
    const headMovementScore = this.detectHeadMovement(features, signal);
    const emgNoiseScore = this.detectEMGNoise(features, signal);
    const disconnectionScore = this.detectDeviceDisconnect(signal);
    const saturationScore = this.detectSaturation(signal);

    // Determine primary artifact type
    const scores: Record<ArtifactType, number> = {
      eye_blink: eyeBlinkScore,
      muscle_movement: muscleActivityScore,
      head_movement: headMovementScore,
      emg_noise: emgNoiseScore,
      device_disconnect: disconnectionScore,
      saturation: saturationScore,
      none: 0,
    };

    const artifactType = this.determinePrimaryArtifact(scores);
    const artifactConfidence = Math.max(...Object.values(scores)) / 100;
    const hasArtifact = artifactType !== 'none' && artifactConfidence > 0.5;

    // Calculate signal quality score
    const signalQualityScore = this.calculateSignalQuality(scores);
    const signalQualityLevel = this.getQualityLevel(signalQualityScore);
    const artifactSeverity = this.getArtifactSeverity(artifactConfidence, signalQualityScore);

    // Track history
    this.artifactHistory.push(artifactType);
    this.qualityHistory.push(signalQualityScore);
    if (this.artifactHistory.length > 3600) {
      this.artifactHistory.shift();
      this.qualityHistory.shift();
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      artifactType,
      signalQualityScore,
      features
    );

    return {
      hasArtifact,
      artifactType,
      artifactConfidence,
      artifactSeverity,
      signalQualityScore,
      signalQualityLevel,
      detailedAnalysis: {
        eyeBlinkScore,
        muscleActivityScore,
        headMovementScore,
        emgNoiseScore,
        disconnectionScore,
        saturationScore,
      },
      recommendations,
      timestamp: Date.now(),
    };
  }

  /**
   * Detect eye blinks
   * Characteristics: Frontal alpha/gamma spike, rapid change
   */
  private detectEyeBlink(features: EEGFeatures, signal: number[]): number {
    let score = 0;

    // Check for rapid change (blinks are fast)
    if (features.temporal.rateOfChange > this.artifactThresholds.eyeBlink.rapidChange) {
      score += 30;
    }

    // Check for frontal-specific patterns (alpha/gamma activity)
    const alphaPercent = features.frequencyDomain.alphaPercent;
    if (alphaPercent > 50) {
      score += 20; // Abnormally high alpha
    }

    // Check for gamma spike
    if (features.frequencyDomain.gammaPercent > this.artifactThresholds.eyeBlink.frontalGamma * 10) {
      score += 20;
    }

    // Check for characteristic blink pattern in raw signal
    const peaks = this.detectPeaks(signal, 30);
    if (peaks.length > 3) {
      score += 15; // Multiple peaks suggest blink
    }

    return Math.min(100, score);
  }

  /**
   * Detect muscle movement/EMG artifact
   * Characteristics: High gamma, high beta, broadband increase
   */
  private detectMuscleMovement(features: EEGFeatures, signal: number[]): number {
    let score = 0;

    // Check for excessive gamma (high-frequency muscle noise)
    if (features.frequencyDomain.gammaPercent > this.artifactThresholds.muscleMovement.gammaPercentage) {
      score += 35;
    }

    // Check for high beta
    if (features.frequencyDomain.betaPercent > this.artifactThresholds.muscleMovement.betaPercentage) {
      score += 20;
    }

    // Check for broadband increase (artifact signature)
    const totalPower = Object.values(features.frequencyDomain).reduce((a, b) => a + (b as number), 0);
    if (totalPower > 1000) {
      score += 25;
    }

    // Check for amplitude increase
    const maxAmplitude = Math.max(...signal);
    const minAmplitude = Math.min(...signal);
    const peakToPeak = maxAmplitude - minAmplitude;
    if (peakToPeak > this.artifactThresholds.muscleMovement.emgThreshold) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Detect head movement
   * Characteristics: Low-frequency amplitude increase, broad spectrum
   */
  private detectHeadMovement(features: EEGFeatures, signal: number[]): number {
    let score = 0;

    // Check for delta/theta increase (low-frequency movement)
    const lowFreqPercent =
      (features.frequencyDomain.deltaPercent || 0) + (features.frequencyDomain.thetaPercent || 0);
    if (lowFreqPercent > this.artifactThresholds.headMovement.lowFrequencyAmplitude / 10) {
      score += 30;
    }

    // Check for broadband increase
    const spectralSpread = features.spectral.spectralSpread;
    if (spectralSpread > this.artifactThresholds.headMovement.frequencySpread) {
      score += 25;
    }

    // Check for overall signal increase
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    const stdDev = Math.sqrt(signal.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / signal.length);
    if (stdDev > this.artifactThresholds.headMovement.broadbandIncrease * 50) {
      score += 25;
    }

    // Check for entropy increase (disorganization)
    if (features.entropy.shannonEntropy > 2.5) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Detect 50/60 Hz EMG noise
   * Characteristics: Very consistent frequency, persistent
   */
  private detectEMGNoise(features: EEGFeatures, signal: number[]): number {
    let score = 0;

    // Check for high gamma frequency band
    if (features.frequencyDomain.gammaPercent > 25) {
      score += 30;
    }

    // Check for frequency consistency (spectral peak)
    const peakFrequency = features.spectral.dominantFrequency;
    if ((peakFrequency > 50 && peakFrequency < 60) || (peakFrequency > 48 && peakFrequency < 62)) {
      score += 40; // 50/60 Hz line noise
    }

    // Check for spectral concentration (narrow frequency band)
    if (features.spectral.spectralSpread < 5) {
      score += 20; // Very concentrated energy
    }

    return Math.min(100, score);
  }

  /**
   * Detect device disconnect/signal loss
   * Characteristics: Zero amplitude, DC offset, no variance
   */
  private detectDeviceDisconnect(signal: number[]): number {
    let score = 0;

    // Check for zero signal
    const nonZeroCount = signal.filter(s => Math.abs(s) > 0.1).length;
    if (nonZeroCount < signal.length * this.artifactThresholds.deviceDisconnect.zeroAmplitude) {
      return 100; // Complete disconnect
    }

    // Check for very low variance (flat line)
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    const variance = signal.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / signal.length;
    if (variance < this.artifactThresholds.deviceDisconnect.noVariance) {
      score += 80;
    }

    // Check for large DC offset
    if (Math.abs(mean) > this.artifactThresholds.deviceDisconnect.dcOffset) {
      score += 40;
    }

    return Math.min(100, score);
  }

  /**
   * Detect signal saturation/clipping
   * Characteristics: Peak values, flat lines at maximum
   */
  private detectSaturation(signal: number[]): number {
    let score = 0;

    // Count peaks near maximum amplitude
    const maxAmplitude = Math.max(...signal);
    const peakCount = signal.filter(s => s > maxAmplitude * 0.95).length;
    const peakPercentage = (peakCount / signal.length) * 100;

    if (peakPercentage > this.artifactThresholds.saturation.clippingPercentage) {
      score += 50;
    }

    // Check for flat lines (duplicate values)
    const duplicateCount = signal.filter((s, i) => i > 0 && s === signal[i - 1]).length;
    const duplicatePercentage = (duplicateCount / signal.length) * 100;

    if (duplicatePercentage > this.artifactThresholds.saturation.flatLinePercentage) {
      score += 40;
    }

    // Check if any samples are at absolute max
    if (maxAmplitude > this.artifactThresholds.saturation.peakAmplitude * 0.9) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Determine primary artifact type
   */
  private determinePrimaryArtifact(scores: Record<ArtifactType, number>): ArtifactType {
    let maxScore = 0;
    let maxType: ArtifactType = 'none';

    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxType = type as ArtifactType;
      }
    }

    return maxScore > 50 ? maxType : 'none';
  }

  /**
   * Calculate overall signal quality score
   */
  private calculateSignalQuality(scores: Record<string, number>): number {
    // Average all artifact scores, lower is better for quality
    const avgArtifact = (Object.values(scores).reduce((a, b) => a + (b as number), 0) / Object.keys(scores).length) as number;
    const quality = 100 - avgArtifact;

    return Math.max(0, quality);
  }

  /**
   * Get quality level from score
   */
  private getQualityLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'unusable' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 25) return 'poor';
    return 'unusable';
  }

  /**
   * Get artifact severity
   */
  private getArtifactSeverity(
    confidence: number,
    quality: number
  ): 'none' | 'mild' | 'moderate' | 'severe' {
    if (quality >= 90) return 'none';
    if (quality >= 75 || confidence < 0.6) return 'mild';
    if (quality >= 50 || confidence < 0.8) return 'moderate';
    return 'severe';
  }

  /**
   * Generate recommendations based on signal quality
   */
  private generateRecommendations(artifactType: ArtifactType, quality: number, features: EEGFeatures): string[] {
    const recommendations: string[] = [];

    if (quality < 50) {
      recommendations.push('⚠️ Signal quality is poor. Consider checking device connection.');
    }

    switch (artifactType) {
      case 'eye_blink':
        recommendations.push('👁️ Eye blink detected. Try to minimize eye movement.');
        recommendations.push('💡 Keep eyes steady or closed for better signal.');
        break;
      case 'muscle_movement':
        recommendations.push('💪 Muscle tension detected. Relax your facial muscles.');
        recommendations.push('😐 Keep face neutral to reduce EMG interference.');
        break;
      case 'head_movement':
        recommendations.push('🤕 Head movement detected. Keep your head still.');
        recommendations.push('📍 Ensure headband is secure and properly positioned.');
        break;
      case 'emg_noise':
        recommendations.push('⚡ 50/60 Hz line noise detected. Check for electrical interference.');
        recommendations.push('🔌 Move away from electrical devices or power cables.');
        break;
      case 'device_disconnect':
        recommendations.push('🔌 Device may be disconnecting. Check bluetooth connection.');
        recommendations.push('✔️ Ensure headband is properly seated on your head.');
        break;
      case 'saturation':
        recommendations.push('📊 Signal is saturating/clipping. Volume level too high.');
        recommendations.push('🔊 Check device settings and reduce gain if possible.');
        break;
      default:
        if (quality >= 90) {
          recommendations.push('✅ Signal quality is excellent. Continue as is.');
        } else if (quality >= 75) {
          recommendations.push('✔️ Signal quality is good. Minor interference present.');
        }
    }

    return recommendations;
  }

  /**
   * Get signal quality metrics over time
   */
  getQualityMetrics(): SignalQualityMetrics {
    if (this.qualityHistory.length === 0) {
      return {
        overallScore: 0,
        artifactPercentage: 0,
        usablePercentage: 0,
        consecutiveCleanSamples: 0,
        consecutiveArtifactSamples: 0,
        trend: 'stable',
        confidence: 0,
      };
    }

    // Calculate metrics
    const avgQuality = this.qualityHistory.reduce((a, b) => a + b, 0) / this.qualityHistory.length;
    const artifactPercentage = 100 - avgQuality;
    const usablePercentage = avgQuality;

    // Trend analysis
    const recentQuality = this.qualityHistory.slice(-30);
    const recentAvg = recentQuality.reduce((a, b) => a + b, 0) / recentQuality.length;
    const olderAvg = this.qualityHistory.slice(0, Math.min(30, this.qualityHistory.length)).reduce((a, b) => a + b, 0) / Math.min(30, this.qualityHistory.length);
    const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'degrading' : 'stable';

    return {
      overallScore: Math.round(avgQuality),
      artifactPercentage: Math.round(artifactPercentage),
      usablePercentage: Math.round(usablePercentage),
      consecutiveCleanSamples: this.lastConsecutiveClean,
      consecutiveArtifactSamples: this.lastConsecutiveArtifact,
      trend,
      confidence: Math.min(1, this.qualityHistory.length / 100), // More data = higher confidence
    };
  }

  /**
   * Detect peaks in signal
   */
  private detectPeaks(signal: number[], threshold: number): number[] {
    const peaks: number[] = [];
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    const stdDev = Math.sqrt(signal.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / signal.length);

    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1] && Math.abs(signal[i] - mean) > stdDev * (threshold / 10)) {
        peaks.push(i);
      }
    }

    return peaks;
  }
}

/**
 * Create anomaly detector instance
 */
export function createAnomalyDetector(): AnomalyDetector {
  return new AnomalyDetector();
}
