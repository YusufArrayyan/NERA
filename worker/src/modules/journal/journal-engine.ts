/**
 * Journal Engine
 * Session reflection, mood tracking, and pattern analysis
 */

export type MoodLevel = 'very_poor' | 'poor' | 'neutral' | 'good' | 'excellent';
export type EnergyLevel = 'exhausted' | 'low' | 'normal' | 'high' | 'peak';
export type FocusQuality = 'unfocused' | 'scattered' | 'moderate' | 'focused' | 'deep';

export interface JournalEntry {
  entryId: string;
  userId: string;
  sessionId: string;
  createdAt: number;
  sessionDate: number;
  content: string;
  moodBefore: MoodLevel;
  moodAfter: MoodLevel;
  energyBefore: EnergyLevel;
  energyAfter: EnergyLevel;
  focusQuality: FocusQuality;
  distractions: string[];
  accomplishments: string[];
  challenges: string[];
  improvements: string[];
  tags: string[];
  sessionMetrics: {
    focusScore: number;
    stressLevel: number;
    duration: number; // minutes
    sessionType: string;
  };
}

export interface MoodTrend {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: number;
  endDate: number;
  moodData: {
    moodLevel: MoodLevel;
    average: number; // 1-5 scale
    trend: 'improving' | 'declining' | 'stable';
    consistencyScore: number; // 0-100
  };
  energyData: {
    energyLevel: EnergyLevel;
    average: number; // 1-5 scale
    trend: 'improving' | 'declining' | 'stable';
  };
  focusData: {
    focusQuality: FocusQuality;
    average: number; // 1-5 scale
    trend: 'improving' | 'declining' | 'stable';
  };
}

export interface Pattern {
  patternId: string;
  type:
    | 'mood_trigger'
    | 'energy_drain'
    | 'focus_blocker'
    | 'stress_source'
    | 'productivity_booster'
    | 'distraction_pattern';
  title: string;
  description: string;
  frequency: number; // How often detected (0-100%)
  impact: number; // Impact on mood/focus (-100 to +100)
  examples: string[];
  recommendations: string[];
  detectedAt: number;
}

export interface JournalInsight {
  insightId: string;
  type:
    | 'mood_pattern'
    | 'energy_pattern'
    | 'focus_pattern'
    | 'correlation'
    | 'suggestion'
    | 'celebration'
    | 'warning';
  title: string;
  description: string;
  confidence: number; // 0-1
  data: Record<string, any>;
  actionable: boolean;
  relatedPatterns: string[];
  generatedAt: number;
}

export interface GratitudeRecord {
  recordId: string;
  userId: string;
  content: string;
  category: 'personal' | 'work' | 'health' | 'relationship' | 'other';
  intensity: 1 | 2 | 3 | 4 | 5; // How grateful
  createdAt: number;
}

export interface ReflectionPrompt {
  promptId: string;
  category: 'mood' | 'focus' | 'stress' | 'growth' | 'gratitude';
  question: string;
  followUp?: string;
  difficulty: 'easy' | 'medium' | 'challenging';
}

export interface SessionReview {
  reviewId: string;
  entryId: string;
  rating: 1 | 2 | 3 | 4 | 5; // Session quality
  wouldRepeat: boolean;
  keyTakeaway: string;
  nextSteps: string[];
  createdAt: number;
}

/**
 * Journal Engine
 */
export class JournalEngine {
  private entries: Map<string, JournalEntry[]> = new Map();
  private patterns: Map<string, Pattern[]> = new Map();
  private insights: Map<string, JournalInsight[]> = new Map();
  private gratitude: Map<string, GratitudeRecord[]> = new Map();
  private reflectionPrompts: ReflectionPrompt[] = this.initializePrompts();

  /**
   * Create journal entry
   */
  createJournalEntry(
    userId: string,
    sessionId: string,
    content: string,
    moodBefore: MoodLevel,
    moodAfter: MoodLevel,
    energyBefore: EnergyLevel,
    energyAfter: EnergyLevel,
    focusQuality: FocusQuality,
    sessionMetrics: JournalEntry['sessionMetrics']
  ): JournalEntry {
    const entry: JournalEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId,
      sessionId,
      createdAt: Date.now(),
      sessionDate: Date.now(),
      content,
      moodBefore,
      moodAfter,
      energyBefore,
      energyAfter,
      focusQuality,
      distractions: [],
      accomplishments: [],
      challenges: [],
      improvements: [],
      tags: [],
      sessionMetrics,
    };

    if (!this.entries.has(userId)) {
      this.entries.set(userId, []);
    }
    this.entries.get(userId)!.push(entry);

    // Analyze for patterns and insights
    this.analyzeEntry(userId, entry);

    return entry;
  }

  /**
   * Update journal entry
   */
  updateJournalEntry(userId: string, entryId: string, updates: Partial<JournalEntry>): JournalEntry | null {
    const userEntries = this.entries.get(userId);
    if (!userEntries) return null;

    const entry = userEntries.find(e => e.entryId === entryId);
    if (!entry) return null;

    Object.assign(entry, updates);
    return entry;
  }

  /**
   * Add content to entry
   */
  addEntryContent(
    userId: string,
    entryId: string,
    contentType: 'distractions' | 'accomplishments' | 'challenges' | 'improvements',
    items: string[]
  ): JournalEntry | null {
    const entry = this.entries.get(userId)?.find(e => e.entryId === entryId);
    if (!entry) return null;

    entry[contentType].push(...items);
    return entry;
  }

  /**
   * Add tags to entry
   */
  addTags(userId: string, entryId: string, tags: string[]): JournalEntry | null {
    const entry = this.entries.get(userId)?.find(e => e.entryId === entryId);
    if (!entry) return null;

    entry.tags.push(...tags);
    return entry;
  }

  /**
   * Add gratitude record
   */
  addGratitudeRecord(userId: string, content: string, category: GratitudeRecord['category'], intensity: 1 | 2 | 3 | 4 | 5): GratitudeRecord {
    const record: GratitudeRecord = {
      recordId: `gratitude-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId,
      content,
      category,
      intensity,
      createdAt: Date.now(),
    };

    if (!this.gratitude.has(userId)) {
      this.gratitude.set(userId, []);
    }
    this.gratitude.get(userId)!.push(record);

    return record;
  }

  /**
   * Analyze entry for patterns and insights
   */
  private analyzeEntry(userId: string, entry: JournalEntry): void {
    // Detect mood changes
    const moodChange = this.calculateMoodChange(entry.moodBefore, entry.moodAfter);
    if (Math.abs(moodChange) > 1) {
      this.detectPattern(userId, 'mood_trigger', entry);
    }

    // Detect energy patterns
    const energyChange = this.calculateEnergyChange(entry.energyBefore, entry.energyAfter);
    if (Math.abs(energyChange) > 1) {
      this.detectPattern(userId, 'energy_drain', entry);
    }

    // Detect focus blockers
    if (entry.focusQuality === 'unfocused' || entry.focusQuality === 'scattered') {
      this.detectPattern(userId, 'focus_blocker', entry);
    }

    // Generate insights
    this.generateEntryInsights(userId, entry);
  }

  /**
   * Detect patterns
   */
  private detectPattern(userId: string, type: Pattern['type'], entry: JournalEntry): void {
    if (!this.patterns.has(userId)) {
      this.patterns.set(userId, []);
    }

    const userPatterns = this.patterns.get(userId)!;

    // Check if pattern already exists
    const existing = userPatterns.find(p => p.type === type);
    if (existing) {
      existing.frequency = Math.min(100, existing.frequency + 10);
      existing.examples.push(...entry.distractions.slice(0, 2));
    } else {
      const pattern: Pattern = {
        patternId: `pattern-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type,
        title: this.getPatternTitle(type),
        description: this.getPatternDescription(type, entry),
        frequency: 20,
        impact: this.calculatePatternImpact(type, entry),
        examples: entry.distractions.slice(0, 3),
        recommendations: this.getPatternRecommendations(type),
        detectedAt: Date.now(),
      };

      userPatterns.push(pattern);
    }
  }

  /**
   * Generate insights from entry
   */
  private generateEntryInsights(userId: string, entry: JournalEntry): void {
    if (!this.insights.has(userId)) {
      this.insights.set(userId, []);
    }

    const userInsights = this.insights.get(userId)!;

    // Mood improvement
    if (entry.moodAfter > entry.moodBefore) {
      userInsights.push({
        insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: 'celebration',
        title: '🎉 Mood Boost',
        description: `Great! Your mood improved during this session.`,
        confidence: 0.9,
        data: { before: entry.moodBefore, after: entry.moodAfter },
        actionable: false,
        relatedPatterns: [],
        generatedAt: Date.now(),
      });
    }

    // High focus quality
    if (entry.focusQuality === 'deep' || entry.focusQuality === 'focused') {
      userInsights.push({
        insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: 'focus_pattern',
        title: '🎯 Strong Focus',
        description: `Excellent focus quality detected. What helped today?`,
        confidence: 0.95,
        data: { focusQuality: entry.focusQuality },
        actionable: true,
        relatedPatterns: [],
        generatedAt: Date.now(),
      });
    }

    // Stress detection
    if (entry.sessionMetrics.stressLevel > 70) {
      userInsights.push({
        insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type: 'warning',
        title: '⚠️ High Stress',
        description: `Elevated stress detected. Consider relaxation techniques.`,
        confidence: 0.85,
        data: { stressLevel: entry.sessionMetrics.stressLevel },
        actionable: true,
        relatedPatterns: [],
        generatedAt: Date.now(),
      });
    }

    // Keep last 100 insights
    if (userInsights.length > 100) {
      userInsights.shift();
    }
  }

  /**
   * Calculate mood trend
   */
  calculateMoodTrend(userId: string, period: 'daily' | 'weekly' | 'monthly'): MoodTrend {
    const userEntries = this.entries.get(userId) || [];
    const now = Date.now();
    const periodMs = this.getPeriodMs(period);

    const relevantEntries = userEntries.filter(e => now - e.createdAt < periodMs);

    if (relevantEntries.length === 0) {
      return {
        period,
        startDate: now - periodMs,
        endDate: now,
        moodData: {
          moodLevel: 'neutral',
          average: 3,
          trend: 'stable',
          consistencyScore: 0,
        },
        energyData: {
          energyLevel: 'normal',
          average: 3,
          trend: 'stable',
        },
        focusData: {
          focusQuality: 'moderate',
          average: 3,
          trend: 'stable',
        },
      };
    }

    const moodValues = relevantEntries.map(e => this.moodToNumber(e.moodAfter));
    const energyValues = relevantEntries.map(e => this.energyToNumber(e.energyAfter));
    const focusValues = relevantEntries.map(e => this.focusToNumber(e.focusQuality));

    const moodAvg = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
    const energyAvg = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
    const focusAvg = focusValues.reduce((a, b) => a + b, 0) / focusValues.length;

    return {
      period,
      startDate: now - periodMs,
      endDate: now,
      moodData: {
        moodLevel: this.numberToMood(moodAvg),
        average: moodAvg,
        trend: this.calculateTrend(moodValues),
        consistencyScore: this.calculateConsistency(moodValues),
      },
      energyData: {
        energyLevel: this.numberToEnergy(energyAvg),
        average: energyAvg,
        trend: this.calculateTrend(energyValues),
      },
      focusData: {
        focusQuality: this.numberToFocus(focusAvg),
        average: focusAvg,
        trend: this.calculateTrend(focusValues),
      },
    };
  }

  /**
   * Get reflection prompt
   */
  getReflectionPrompt(category?: ReflectionPrompt['category']): ReflectionPrompt {
    let prompts = this.reflectionPrompts;

    if (category) {
      prompts = prompts.filter(p => p.category === category);
    }

    if (prompts.length === 0) {
      prompts = this.reflectionPrompts;
    }

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Initialize reflection prompts
   */
  private initializePrompts(): ReflectionPrompt[] {
    return [
      {
        promptId: 'p1',
        category: 'mood',
        question: 'What activities brought you the most joy today?',
        difficulty: 'easy',
      },
      {
        promptId: 'p2',
        category: 'focus',
        question: 'What environmental factors helped your focus most?',
        difficulty: 'medium',
      },
      {
        promptId: 'p3',
        category: 'stress',
        question: 'What was the main source of stress, and how did you handle it?',
        difficulty: 'challenging',
      },
      {
        promptId: 'p4',
        category: 'growth',
        question: 'What did you learn about yourself today?',
        difficulty: 'challenging',
      },
      {
        promptId: 'p5',
        category: 'gratitude',
        question: 'What are three things you\'re grateful for today?',
        difficulty: 'easy',
      },
      {
        promptId: 'p6',
        category: 'focus',
        question: 'When did your focus peak, and what were you doing?',
        difficulty: 'medium',
      },
      {
        promptId: 'p7',
        category: 'mood',
        question: 'How did your mood change throughout the day?',
        difficulty: 'medium',
      },
      {
        promptId: 'p8',
        category: 'stress',
        question: 'What relaxation techniques worked best for you?',
        difficulty: 'easy',
      },
    ];
  }

  /**
   * Get user entries
   */
  getUserEntries(userId: string, limit: number = 50): JournalEntry[] {
    const entries = this.entries.get(userId) || [];
    return entries.slice(-limit);
  }

  /**
   * Get user patterns
   */
  getUserPatterns(userId: string): Pattern[] {
    return (this.patterns.get(userId) || []).sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get user insights
   */
  getUserInsights(userId: string, limit: number = 20): JournalInsight[] {
    const insights = this.insights.get(userId) || [];
    return insights.slice(-limit);
  }

  /**
   * Get gratitude records
   */
  getGratitudeRecords(userId: string, limit: number = 30): GratitudeRecord[] {
    const records = this.gratitude.get(userId) || [];
    return records.slice(-limit);
  }

  // Helper methods
  private moodToNumber(mood: MoodLevel): number {
    const map: Record<MoodLevel, number> = {
      very_poor: 1,
      poor: 2,
      neutral: 3,
      good: 4,
      excellent: 5,
    };
    return map[mood];
  }

  private numberToMood(num: number): MoodLevel {
    if (num < 1.5) return 'very_poor';
    if (num < 2.5) return 'poor';
    if (num < 3.5) return 'neutral';
    if (num < 4.5) return 'good';
    return 'excellent';
  }

  private energyToNumber(energy: EnergyLevel): number {
    const map: Record<EnergyLevel, number> = {
      exhausted: 1,
      low: 2,
      normal: 3,
      high: 4,
      peak: 5,
    };
    return map[energy];
  }

  private numberToEnergy(num: number): EnergyLevel {
    if (num < 1.5) return 'exhausted';
    if (num < 2.5) return 'low';
    if (num < 3.5) return 'normal';
    if (num < 4.5) return 'high';
    return 'peak';
  }

  private focusToNumber(focus: FocusQuality): number {
    const map: Record<FocusQuality, number> = {
      unfocused: 1,
      scattered: 2,
      moderate: 3,
      focused: 4,
      deep: 5,
    };
    return map[focus];
  }

  private numberToFocus(num: number): FocusQuality {
    if (num < 1.5) return 'unfocused';
    if (num < 2.5) return 'scattered';
    if (num < 3.5) return 'moderate';
    if (num < 4.5) return 'focused';
    return 'deep';
  }

  private calculateMoodChange(before: MoodLevel, after: MoodLevel): number {
    return this.moodToNumber(after) - this.moodToNumber(before);
  }

  private calculateEnergyChange(before: EnergyLevel, after: EnergyLevel): number {
    return this.energyToNumber(after) - this.energyToNumber(before);
  }

  private calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 2) return 'stable';

    const first = values.slice(0, Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(values.length / 2);
    const second = values.slice(Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(values.length / 2);

    if (second > first + 0.5) return 'improving';
    if (second < first - 0.5) return 'declining';
    return 'stable';
  }

  private calculateConsistency(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, 100 - stdDev * 20); // Higher std dev = lower consistency
  }

  private calculatePatternImpact(type: Pattern['type'], entry: JournalEntry): number {
    const moodChange = this.calculateMoodChange(entry.moodBefore, entry.moodAfter);
    const energyChange = this.calculateEnergyChange(entry.energyBefore, entry.energyAfter);

    return (moodChange + energyChange) * 20; // Scale to -100 to +100
  }

  private getPatternTitle(type: Pattern['type']): string {
    const titles: Record<Pattern['type'], string> = {
      mood_trigger: 'Mood Trigger Pattern',
      energy_drain: 'Energy Drain Pattern',
      focus_blocker: 'Focus Blocker Pattern',
      stress_source: 'Stress Source Pattern',
      productivity_booster: 'Productivity Booster',
      distraction_pattern: 'Distraction Pattern',
    };
    return titles[type];
  }

  private getPatternDescription(type: Pattern['type'], entry: JournalEntry): string {
    return `Pattern detected based on your journal entry. Focus: ${entry.focusQuality}, Mood change: ${this.calculateMoodChange(entry.moodBefore, entry.moodAfter)}`;
  }

  private getPatternRecommendations(type: Pattern['type']): string[] {
    const recommendations: Record<Pattern['type'], string[]> = {
      mood_trigger: [
        'Identify what triggers mood changes',
        'Plan to replicate positive triggers',
        'Avoid or mitigate negative triggers',
      ],
      energy_drain: [
        'Schedule energy drains for off-peak times',
        'Take breaks before energy-draining activities',
        'Combine with energizing activities',
      ],
      focus_blocker: [
        'Identify specific blockers from your notes',
        'Create a distraction-free environment',
        'Use time-blocking techniques',
      ],
      stress_source: [
        'Address root causes of stress',
        'Practice stress management techniques',
        'Seek support if needed',
      ],
      productivity_booster: [
        'Replicate conditions of productive sessions',
        'Make productive practices habitual',
        'Share techniques with others',
      ],
      distraction_pattern: [
        'Use focused work techniques',
        'Minimize notifications',
        'Practice mindfulness',
      ],
    };
    return recommendations[type];
  }

  private getPeriodMs(period: 'daily' | 'weekly' | 'monthly'): number {
    switch (period) {
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
    }
  }
}

/**
 * Create journal engine instance
 */
export function createJournalEngine(): JournalEngine {
  return new JournalEngine();
}
