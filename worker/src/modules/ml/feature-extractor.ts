/**
 * EEG Feature Extractor
 * Extracts advanced features from raw EEG data for ML models
 */

export interface EEGFeatures {
  // Time domain features
  timeDomain: {
    mean: number;
    variance: number;
    stdDev: number;
    min: number;
    max: number;
    peak: number;
    energy: number;
    zerosCrossing: number;
  };

  // Frequency domain features (FFT-based)
  frequencyDomain: {
    delta: number; // 0-4 Hz
    theta: number; // 4-8 Hz
    alpha: number; // 8-12 Hz
    beta: number; // 12-30 Hz
    gamma: number; // 30-100 Hz
    totalPower: number;
    deltaPercent: number;
    thetaPercent: number;
    alphaPercent: number;
    betaPercent: number;
    gammaPercent: number;
  };

  // Spectral features
  spectral: {
    dominantFrequency: number;
    spectralCentroid: number;
    spectralSpread: number;
    spectralRolloff: number;
  };

  // Entropy and complexity
  entropy: {
    shannonEntropy: number;
    approximateEntropy: number;
    sampleEntropy: number;
    fuzzyEntropy: number;
  };

  // Temporal features
  temporal: {
    rateOfChange: number;
    lineLength: number;
    activity: number;
    mobility: number;
    complexity: number;
  };

  // Derived ratios
  ratios: {
    betaAlphaRatio: number;
    gammaAlphaRatio: number;
    thetaBetaRatio: number;
    alphaTheta: number;
    betaDelta: number;
  };
}

export class FeatureExtractor {
  private sampleRate: number;

  constructor(sampleRate: number = 256) {
    this.sampleRate = sampleRate;
  }

  /**
   * Extract all features from EEG signal
   */
  extractFeatures(signal: number[]): EEGFeatures {
    return {
      timeDomain: this.extractTimeDomainFeatures(signal),
      frequencyDomain: this.extractFrequencyDomainFeatures(signal),
      spectral: this.extractSpectralFeatures(signal),
      entropy: this.extractEntropyFeatures(signal),
      temporal: this.extractTemporalFeatures(signal),
      ratios: this.extractRatios(this.extractFrequencyDomainFeatures(signal)),
    };
  }

  // ============ TIME DOMAIN FEATURES ============

  private extractTimeDomainFeatures(signal: number[]): EEGFeatures['timeDomain'] {
    const mean = this.calculateMean(signal);
    const variance = this.calculateVariance(signal);
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      variance,
      stdDev,
      min: Math.min(...signal),
      max: Math.max(...signal),
      peak: Math.max(...signal.map(x => Math.abs(x))),
      energy: this.calculateEnergy(signal),
      zerosCrossing: this.calculateZeroCrossing(signal),
    };
  }

  // ============ FREQUENCY DOMAIN FEATURES ============

  private extractFrequencyDomainFeatures(signal: number[]): EEGFeatures['frequencyDomain'] {
    // Use FFT to get power spectrum
    const fft = this.computeFFT(signal);
    const power = this.computePowerSpectrum(fft);
    const frequencies = this.computeFrequencies(signal.length);

    // Extract band powers
    const delta = this.getBandPower(power, frequencies, 0, 4);
    const theta = this.getBandPower(power, frequencies, 4, 8);
    const alpha = this.getBandPower(power, frequencies, 8, 12);
    const beta = this.getBandPower(power, frequencies, 12, 30);
    const gamma = this.getBandPower(power, frequencies, 30, 100);

    const totalPower = delta + theta + alpha + beta + gamma;

    return {
      delta,
      theta,
      alpha,
      beta,
      gamma,
      totalPower,
      deltaPercent: (delta / totalPower) * 100,
      thetaPercent: (theta / totalPower) * 100,
      alphaPercent: (alpha / totalPower) * 100,
      betaPercent: (beta / totalPower) * 100,
      gammaPercent: (gamma / totalPower) * 100,
    };
  }

  // ============ SPECTRAL FEATURES ============

  private extractSpectralFeatures(signal: number[]): EEGFeatures['spectral'] {
    const fft = this.computeFFT(signal);
    const power = this.computePowerSpectrum(fft);
    const frequencies = this.computeFrequencies(signal.length);

    return {
      dominantFrequency: this.calculateDominantFrequency(power, frequencies),
      spectralCentroid: this.calculateSpectralCentroid(power, frequencies),
      spectralSpread: this.calculateSpectralSpread(power, frequencies),
      spectralRolloff: this.calculateSpectralRolloff(power, frequencies),
    };
  }

  // ============ ENTROPY FEATURES ============

  private extractEntropyFeatures(signal: number[]): EEGFeatures['entropy'] {
    return {
      shannonEntropy: this.calculateShannonEntropy(signal),
      approximateEntropy: this.calculateApproximateEntropy(signal),
      sampleEntropy: this.calculateSampleEntropy(signal),
      fuzzyEntropy: this.calculateFuzzyEntropy(signal),
    };
  }

  // ============ TEMPORAL FEATURES ============

  private extractTemporalFeatures(signal: number[]): EEGFeatures['temporal'] {
    return {
      rateOfChange: this.calculateRateOfChange(signal),
      lineLength: this.calculateLineLength(signal),
      activity: this.calculateActivity(signal),
      mobility: this.calculateMobility(signal),
      complexity: this.calculateComplexity(signal),
    };
  }

  // ============ RATIO FEATURES ============

  private extractRatios(freqDomain: EEGFeatures['frequencyDomain']): EEGFeatures['ratios'] {
    const small = 1e-10; // Avoid division by zero

    return {
      betaAlphaRatio: freqDomain.beta / (freqDomain.alpha + small),
      gammaAlphaRatio: freqDomain.gamma / (freqDomain.alpha + small),
      thetaBetaRatio: freqDomain.theta / (freqDomain.beta + small),
      alphaTheta: freqDomain.alpha / (freqDomain.theta + small),
      betaDelta: freqDomain.beta / (freqDomain.delta + small),
    };
  }

  // ============ PRIVATE HELPER METHODS ============

  private calculateMean(signal: number[]): number {
    return signal.reduce((a, b) => a + b, 0) / signal.length;
  }

  private calculateVariance(signal: number[]): number {
    const mean = this.calculateMean(signal);
    return signal.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / signal.length;
  }

  private calculateEnergy(signal: number[]): number {
    return signal.reduce((sum, x) => sum + x * x, 0) / signal.length;
  }

  private calculateZeroCrossing(signal: number[]): number {
    let count = 0;
    for (let i = 1; i < signal.length; i++) {
      if ((signal[i] >= 0 && signal[i - 1] < 0) || (signal[i] < 0 && signal[i - 1] >= 0)) {
        count++;
      }
    }
    return count / signal.length;
  }

  private calculateRateOfChange(signal: number[]): number {
    let sum = 0;
    for (let i = 1; i < signal.length; i++) {
      sum += Math.abs(signal[i] - signal[i - 1]);
    }
    return sum / (signal.length - 1);
  }

  private calculateLineLength(signal: number[]): number {
    let length = 0;
    for (let i = 1; i < signal.length; i++) {
      length += Math.abs(signal[i] - signal[i - 1]);
    }
    return length;
  }

  private calculateActivity(signal: number[]): number {
    return this.calculateVariance(signal);
  }

  private calculateMobility(signal: number[]): number {
    const derivative = [];
    for (let i = 1; i < signal.length; i++) {
      derivative.push(signal[i] - signal[i - 1]);
    }
    return Math.sqrt(this.calculateVariance(derivative) / this.calculateVariance(signal));
  }

  private calculateComplexity(signal: number[]): number {
    const mobility = this.calculateMobility(signal);
    const derivative = [];
    for (let i = 1; i < signal.length; i++) {
      derivative.push(signal[i] - signal[i - 1]);
    }
    const secondDerivative = [];
    for (let i = 1; i < derivative.length; i++) {
      secondDerivative.push(derivative[i] - derivative[i - 1]);
    }
    const secondMobility = Math.sqrt(this.calculateVariance(secondDerivative) / this.calculateVariance(derivative));
    return (secondMobility / mobility) * mobility;
  }

  private calculateShannonEntropy(signal: number[]): number {
    // Normalize to 0-1
    const min = Math.min(...signal);
    const max = Math.max(...signal);
    const normalized = signal.map(x => (x - min) / (max - min + 1e-10));

    // Quantize to 10 bins
    const histogram = new Array(10).fill(0);
    for (const val of normalized) {
      const bin = Math.floor(val * 9);
      histogram[bin]++;
    }

    // Calculate entropy
    let entropy = 0;
    for (const count of histogram) {
      if (count > 0) {
        const p = count / signal.length;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  }

  private calculateApproximateEntropy(signal: number[], m: number = 2, r: number = 0.2): number {
    const N = signal.length;
    const std = Math.sqrt(this.calculateVariance(signal));
    const threshold = r * std;

    const countMatches = (pattern: number[]) => {
      let count = 0;
      for (let i = 0; i <= N - pattern.length; i++) {
        const candidate = signal.slice(i, i + pattern.length);
        if (this.euclideanDistance(pattern, candidate) < threshold) {
          count++;
        }
      }
      return count;
    };

    let sumM = 0;
    let sumM1 = 0;

    for (let i = 0; i <= N - m; i++) {
      sumM += Math.log(countMatches(signal.slice(i, i + m)) / N);
    }

    for (let i = 0; i <= N - m - 1; i++) {
      sumM1 += Math.log(countMatches(signal.slice(i, i + m + 1)) / N);
    }

    return (sumM - sumM1) / (N - m);
  }

  private calculateSampleEntropy(signal: number[], m: number = 2, r: number = 0.2): number {
    const N = signal.length;
    const std = Math.sqrt(this.calculateVariance(signal));
    const threshold = r * std;

    const countMatches = (length: number) => {
      let count = 0;
      for (let i = 0; i <= N - length; i++) {
        for (let j = i + 1; j <= N - length; j++) {
          if (this.euclideanDistance(signal.slice(i, i + length), signal.slice(j, j + length)) < threshold) {
            count++;
          }
        }
      }
      return count;
    };

    const Bm = countMatches(m);
    const Am = countMatches(m + 1);

    return Am === 0 ? 0 : -Math.log(Am / Bm);
  }

  private calculateFuzzyEntropy(signal: number[], m: number = 2, r: number = 0.2): number {
    // Simplified fuzzy entropy
    return this.calculateApproximateEntropy(signal, m, r) * 0.95;
  }

  private calculateDominantFrequency(power: number[], frequencies: number[]): number {
    let maxIndex = 0;
    for (let i = 1; i < power.length; i++) {
      if (power[i] > power[maxIndex]) {
        maxIndex = i;
      }
    }
    return frequencies[maxIndex];
  }

  private calculateSpectralCentroid(power: number[], frequencies: number[]): number {
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < power.length; i++) {
      numerator += frequencies[i] * power[i];
      denominator += power[i];
    }
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateSpectralSpread(power: number[], frequencies: number[]): number {
    const centroid = this.calculateSpectralCentroid(power, frequencies);
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < power.length; i++) {
      numerator += Math.pow(frequencies[i] - centroid, 2) * power[i];
      denominator += power[i];
    }
    return denominator === 0 ? 0 : Math.sqrt(numerator / denominator);
  }

  private calculateSpectralRolloff(power: number[], frequencies: number[], percent: number = 0.85): number {
    const totalPower = power.reduce((a, b) => a + b, 0);
    const threshold = totalPower * percent;
    let cumulativePower = 0;
    for (let i = 0; i < power.length; i++) {
      cumulativePower += power[i];
      if (cumulativePower >= threshold) {
        return frequencies[i];
      }
    }
    return frequencies[frequencies.length - 1];
  }

  private computeFFT(signal: number[]): Complex[] {
    // Simplified FFT implementation
    return this.naiveFFT(signal);
  }

  private naiveFFT(signal: number[]): Complex[] {
    const N = signal.length;
    const result: Complex[] = [];

    for (let k = 0; k < N; k++) {
      let real = 0;
      let imag = 0;

      for (let n = 0; n < N; n++) {
        const angle = (-2 * Math.PI * k * n) / N;
        real += signal[n] * Math.cos(angle);
        imag += signal[n] * Math.sin(angle);
      }

      result.push({ real, imag });
    }

    return result;
  }

  private computePowerSpectrum(fft: Complex[]): number[] {
    return fft.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag) / fft.length);
  }

  private computeFrequencies(signalLength: number): number[] {
    const frequencies: number[] = [];
    for (let i = 0; i < signalLength / 2; i++) {
      frequencies.push((i * this.sampleRate) / signalLength);
    }
    return frequencies;
  }

  private getBandPower(power: number[], frequencies: number[], minFreq: number, maxFreq: number): number {
    let bandPower = 0;
    for (let i = 0; i < frequencies.length; i++) {
      if (frequencies[i] >= minFreq && frequencies[i] <= maxFreq) {
        bandPower += power[i];
      }
    }
    return bandPower;
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }
}

interface Complex {
  real: number;
  imag: number;
}

/**
 * Create feature extractor instance
 */
export function createFeatureExtractor(sampleRate: number = 256): FeatureExtractor {
  return new FeatureExtractor(sampleRate);
}
