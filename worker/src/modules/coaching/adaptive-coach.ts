/**
 * Adaptive Learning Coach
 * Session planning, personalized recommendations, and progress coaching
 */

import { PersonalizationProfile } from '../ml/personalization-engine';

export type SessionDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type CoachingPhase = 'warmup' | 'focus_building' | 'peak_performance' | 'cooldown' | 'recovery';
export type CoachingStyle = 'motivational' | 'analytical' | 'supportive' | 'challenging';

export interface SessionPlan {
  sessionId: string;
  userId: string;
  scheduledTime: number; // timestamp
  estimatedDuration: number; // minutes
  difficulty: SessionDifficulty;
  focusTarget: number; // target focus score 0-100
  stressTarget: number; // target stress level
  phases: SessionPhase[];
  coachingMessages: CoachingMessage[];
  expectedOutcome: string;
  rationale: string;
}

export interface SessionPhase {
  phase: CoachingPhase;
  duration: number; // seconds
  targetFocus: number; // 0-100
  targetStress: number; // 0-100
  instructions: string;
  activities: string[];
  checkIn: {
    at: number; // seconds into phase
    question: string;
  };
}

export interface CoachingMessage {
  type: 'motivational' | 'instructional' | 'checkpoint' | 'adjustment' | 'celebration';
  timing: 'before_session' | 'during_session' | 'after_session' | 'daily_tip';
  message: string;
  emoji: string;
  actionable: boolean;
}

export interface ProgressReport {
  period: 'daily' | 'weekly' | 'monthly';
  userId: string;
  generatedAt: number;
  sections: {
    summary: string;
    highlights: string[];
    challenges: string[];
    recommendations: string[];
    nextWeekPlan: string;
  };
  metrics: {
    focusImprovement: number; // % vs previous period
    consistencyScore: number; // 0-100
    sessionQuality: number; // avg quality
    engagementLevel: number; // 0-100
  };
  actionItems: string[];
}

export interface CoachingGoal {
  goalId: string;
  userId: string;
  title: string;
  description: string;
  category: 'focus' | 'stress' | 'consistency' | 'skill' | 'wellness';
  difficulty: SessionDifficulty;
  targetValue: number;
  currentValue: number;
  deadline: number; // timestamp
  milestones: Milestone[];
  progress: number; // 0-100
  status: 'active' | 'paused' | 'completed' | 'failed';
  coachingNotes: string[];
  createdAt: number;
  lastUpdated: number;
}

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  completedAt?: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface DailyTip {
  tipId: string;
  topic: string;
  title: string;
  content: string;
  difficulty: SessionDifficulty;
  category: 'focus' | 'stress' | 'health' | 'productivity';
  actionable: boolean;
  estimatedTime: number; // minutes to implement
  evidence: string; // scientific basis
}

export interface CoachingInsight {
  type: 'pattern' | 'opportunity' | 'warning' | 'celebration';
  title: string;
  description: string;
  data: Record<string, any>;
  recommendation?: string;
  urgency: 'low' | 'medium' | 'high';
  generatedAt: number;
}

/**
 * Adaptive Coach Engine
 */
export class AdaptiveCoach {
  private sessionPlans: Map<string, SessionPlan[]> = new Map();
  private goals: Map<string, CoachingGoal[]> = new Map();
  private insights: Map<string, CoachingInsight[]> = new Map();
  private coachingStyles: Map<string, CoachingStyle> = new Map();

  private sessionDifficultyMap: Record<SessionDifficulty, { minFocus: number; minDuration: number; riskLevel: number }> = {
    beginner: { minFocus: 40, minDuration: 15, riskLevel: 0.2 },
    intermediate: { minFocus: 60, minDuration: 30, riskLevel: 0.4 },
    advanced: { minFocus: 75, minDuration: 45, riskLevel: 0.6 },
    expert: { minFocus: 85, minDuration: 60, riskLevel: 0.8 },
  };

  private phaseTemplates: Record<CoachingPhase, { duration: number; targetFocus: number; description: string }> = {
    warmup: { duration: 300, targetFocus: 40, description: 'Ease into focus' },
    focus_building: { duration: 900, targetFocus: 70, description: 'Build momentum' },
    peak_performance: { duration: 1200, targetFocus: 85, description: 'Maximum focus' },
    cooldown: { duration: 600, targetFocus: 60, description: 'Transition down' },
    recovery: { duration: 300, targetFocus: 30, description: 'Rest and recover' },
  };

  /**
   * Create personalized session plan
   */
  createSessionPlan(
    userId: string,
    currentFocusScore: number,
    recentStreaks: number,
    userLevel: number,
    preferredDifficulty?: SessionDifficulty
  ): SessionPlan {
    // Determine difficulty
    let difficulty = this.determineDifficulty(currentFocusScore, recentStreaks, userLevel, preferredDifficulty);

    // Build session phases
    const phases = this.buildSessionPhases(difficulty, currentFocusScore);

    // Estimate duration
    const estimatedDuration = phases.reduce((sum, p) => sum + p.duration, 0) / 60; // Convert to minutes

    // Set targets
    const focusTarget = this.sessionDifficultyMap[difficulty].minFocus;
    const stressTarget = 30; // Low stress target

    // Generate coaching messages
    const coachingMessages = this.generateCoachingMessages(userId, difficulty, currentFocusScore);

    // Generate expected outcome
    const expectedOutcome = this.generateExpectedOutcome(difficulty, focusTarget, estimatedDuration);

    const sessionPlan: SessionPlan = {
      sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId,
      scheduledTime: Date.now(),
      estimatedDuration,
      difficulty,
      focusTarget,
      stressTarget,
      phases,
      coachingMessages,
      expectedOutcome,
      rationale: `Based on your current focus (${currentFocusScore}/100) and level ${userLevel}. This ${difficulty} session is designed to challenge you appropriately.`,
    };

    // Store plan
    if (!this.sessionPlans.has(userId)) {
      this.sessionPlans.set(userId, []);
    }
    this.sessionPlans.get(userId)!.push(sessionPlan);

    return sessionPlan;
  }

  /**
   * Determine appropriate difficulty
   */
  private determineDifficulty(
    focusScore: number,
    streaks: number,
    userLevel: number,
    preferredDifficulty?: SessionDifficulty
  ): SessionDifficulty {
    if (preferredDifficulty) {
      return preferredDifficulty;
    }

    // Adaptive difficulty based on performance
    if (focusScore < 40 || userLevel < 3) {
      return 'beginner';
    } else if (focusScore < 60 || userLevel < 10) {
      return 'intermediate';
    } else if (focusScore < 80 || userLevel < 30) {
      return 'advanced';
    } else {
      return 'expert';
    }
  }

  /**
   * Build session phases
   */
  private buildSessionPhases(difficulty: SessionDifficulty, currentFocus: number): SessionPhase[] {
    const phases: SessionPhase[] = [];

    // Warmup phase
    phases.push({
      phase: 'warmup',
      duration: this.phaseTemplates.warmup.duration,
      targetFocus: 40,
      targetStress: 50,
      instructions: 'Start with a breathing exercise. Gradually settle into your task.',
      activities: ['Deep breathing (2 min)', 'Review session goals (1 min)', 'Begin task setup (2 min)'],
      checkIn: {
        at: 180,
        question: 'How are you feeling? Ready to begin?',
      },
    });

    // Focus building phase
    phases.push({
      phase: 'focus_building',
      duration: this.phaseTemplates.focus_building.duration,
      targetFocus: 65,
      targetStress: 40,
      instructions: 'Dive into your main task. Aim for steady progress.',
      activities: ['Main task (12 min)', 'Quick check-in', 'Continue focused work'],
      checkIn: {
        at: 600,
        question: 'Maintaining focus? Any adjustments needed?',
      },
    });

    // Peak performance phase (extended for advanced users)
    if (difficulty === 'advanced' || difficulty === 'expert') {
      phases.push({
        phase: 'peak_performance',
        duration: this.phaseTemplates.peak_performance.duration,
        targetFocus: 85,
        targetStress: 30,
        instructions: 'Push for maximum focus and quality output.',
        activities: ['Deep work (18 min)', 'Checkpoint', 'Continue optimization'],
        checkIn: {
          at: 900,
          question: 'Peak performance zone reached. Maintaining well?',
        },
      });
    }

    // Cooldown phase
    phases.push({
      phase: 'cooldown',
      duration: this.phaseTemplates.cooldown.duration,
      targetFocus: 60,
      targetStress: 45,
      instructions: 'Gradually wind down your focus. Prepare to transition.',
      activities: ['Wrap up current task (3 min)', 'Review progress', 'Plan next session'],
      checkIn: {
        at: 300,
        question: 'Ready to cool down? How do you feel?',
      },
    });

    // Recovery phase
    phases.push({
      phase: 'recovery',
      duration: this.phaseTemplates.recovery.duration,
      targetFocus: 30,
      targetStress: 20,
      instructions: 'Complete session with relaxation and reflection.',
      activities: ['Gratitude reflection', 'Light stretching', 'Hydrate and rest'],
      checkIn: {
        at: 120,
        question: 'Great session! How are you feeling?',
      },
    });

    return phases;
  }

  /**
   * Generate coaching messages
   */
  private generateCoachingMessages(userId: string, difficulty: SessionDifficulty, focusScore: number): CoachingMessage[] {
    const style = this.coachingStyles.get(userId) || 'supportive';
    const messages: CoachingMessage[] = [];

    // Pre-session motivation
    const motivationalMessages = [
      {
        motivational: "You've got this! Let's build on your progress.",
        analytical: 'Your focus trend is positive. Let\'s aim for consistency.',
        supportive: "You're doing great. Take it one step at a time.",
        challenging: 'Ready to push your limits today?',
      },
    ];

    const preMessage = motivationalMessages[0][style as keyof typeof motivationalMessages[0]];
    messages.push({
      type: 'motivational',
      timing: 'before_session',
      message: preMessage,
      emoji: '💪',
      actionable: false,
    });

    // Difficulty-specific instruction
    const difficultyInstructions: Record<SessionDifficulty, string> = {
      beginner: 'Focus on building a foundation. Quality over quantity.',
      intermediate: 'Push yourself gently. You can do better each time.',
      advanced: 'Challenge yourself. This is where growth happens.',
      expert: 'Master your craft. Show us what you\'re capable of.',
    };

    messages.push({
      type: 'instructional',
      timing: 'before_session',
      message: difficultyInstructions[difficulty],
      emoji: '📚',
      actionable: true,
    });

    // Low focus warning
    if (focusScore < 50) {
      messages.push({
        type: 'adjustment',
        timing: 'during_session',
        message: 'Your focus seems low. Try a 2-minute break to reset.',
        emoji: '⏸️',
        actionable: true,
      });
    }

    return messages;
  }

  /**
   * Generate expected outcome
   */
  private generateExpectedOutcome(difficulty: SessionDifficulty, focusTarget: number, duration: number): string {
    const outcomes: Record<SessionDifficulty, string> = {
      beginner: `Complete a ${duration}-minute session, reaching ${focusTarget}+ focus. Build consistency.`,
      intermediate: `Maintain ${focusTarget}+ focus for ${duration} minutes. Make steady progress.`,
      advanced: `Sustain ${focusTarget}+ focus with high-quality output. Optimize performance.`,
      expert: `Execute flawlessly for ${duration} minutes at ${focusTarget}+ focus. Master your craft.`,
    };

    return outcomes[difficulty];
  }

  /**
   * Set user coaching style preference
   */
  setCoachingStyle(userId: string, style: CoachingStyle): void {
    this.coachingStyles.set(userId, style);
  }

  /**
   * Create coaching goal
   */
  createCoachingGoal(
    userId: string,
    title: string,
    category: 'focus' | 'stress' | 'consistency' | 'skill' | 'wellness',
    targetValue: number,
    deadlineDays: number
  ): CoachingGoal {
    const goal: CoachingGoal = {
      goalId: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId,
      title,
      description: `Achieve ${targetValue} in ${category}`,
      category,
      difficulty: 'intermediate',
      targetValue,
      currentValue: 0,
      deadline: Date.now() + deadlineDays * 24 * 60 * 60 * 1000,
      milestones: this.generateMilestones(targetValue, deadlineDays),
      progress: 0,
      status: 'active',
      coachingNotes: [],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    if (!this.goals.has(userId)) {
      this.goals.set(userId, []);
    }
    this.goals.get(userId)!.push(goal);

    return goal;
  }

  /**
   * Generate milestones for goal
   */
  private generateMilestones(targetValue: number, deadlineDays: number): Milestone[] {
    const milestones: Milestone[] = [];
    const stepSize = targetValue / 4; // 4 milestones

    for (let i = 1; i <= 4; i++) {
      milestones.push({
        id: `milestone-${i}`,
        title: `Milestone ${i}`,
        targetValue: Math.round(stepSize * i),
        currentValue: 0,
        status: 'pending',
      });
    }

    return milestones;
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(userId: string, goalId: string, newValue: number): CoachingGoal | null {
    const userGoals = this.goals.get(userId);
    if (!userGoals) return null;

    const goal = userGoals.find(g => g.goalId === goalId);
    if (!goal) return null;

    goal.currentValue = newValue;
    goal.progress = Math.min(100, (newValue / goal.targetValue) * 100);
    goal.lastUpdated = Date.now();

    // Update milestones
    for (const milestone of goal.milestones) {
      if (newValue >= milestone.targetValue && milestone.status !== 'completed') {
        milestone.status = 'completed';
        milestone.completedAt = Date.now();

        // Add coaching note
        goal.coachingNotes.push(`🎉 Milestone "${milestone.title}" completed!`);
      }
    }

    // Check goal completion
    if (goal.progress >= 100) {
      goal.status = 'completed';
      goal.coachingNotes.push('✨ Goal completed! Great achievement!');
    }

    return goal;
  }

  /**
   * Generate progress report
   */
  generateProgressReport(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly',
    metrics: {
      focusImprovement: number;
      consistencyScore: number;
      sessionQuality: number;
      engagementLevel: number;
    }
  ): ProgressReport {
    const report: ProgressReport = {
      period,
      userId,
      generatedAt: Date.now(),
      sections: {
        summary: this.generateSummary(period, metrics),
        highlights: this.generateHighlights(metrics),
        challenges: this.generateChallenges(metrics),
        recommendations: this.generateRecommendations(metrics),
        nextWeekPlan: this.generateNextWeekPlan(metrics),
      },
      metrics,
      actionItems: this.generateActionItems(metrics),
    };

    // Store insights
    if (!this.insights.has(userId)) {
      this.insights.set(userId, []);
    }

    if (metrics.focusImprovement > 10) {
      this.insights.get(userId)!.push({
        type: 'celebration',
        title: 'Focus Improvement 🎉',
        description: `Great progress! Your focus improved by ${metrics.focusImprovement}%.`,
        data: metrics,
        urgency: 'low',
        generatedAt: Date.now(),
      });
    }

    if (metrics.consistencyScore > 80) {
      this.insights.get(userId)!.push({
        type: 'pattern',
        title: 'Strong Consistency',
        description: 'You\'re building excellent habits with high consistency.',
        data: metrics,
        urgency: 'low',
        generatedAt: Date.now(),
      });
    }

    if (metrics.focusImprovement < -10) {
      this.insights.get(userId)!.push({
        type: 'warning',
        title: 'Focus Declining',
        description: 'Your focus has dropped. Consider reviewing your routine.',
        data: metrics,
        recommendation: 'Try shorter, more frequent sessions with more breaks.',
        urgency: 'high',
        generatedAt: Date.now(),
      });
    }

    return report;
  }

  /**
   * Generate progress summary
   */
  private generateSummary(period: string, metrics: any): string {
    const summaries: Record<string, string> = {
      daily: `Today's session was ${metrics.sessionQuality > 75 ? 'excellent' : metrics.sessionQuality > 50 ? 'good' : 'okay'}. Keep up the momentum!`,
      weekly: `This week, you maintained ${metrics.consistencyScore}% consistency. ${metrics.focusImprovement > 0 ? 'Your focus improved!' : 'Room to grow.'}`,
      monthly: `This month shows significant progress with ${metrics.engagementLevel}% engagement. You're on the right track!`,
    };

    return summaries[period] || 'Great work this period!';
  }

  /**
   * Generate highlights
   */
  private generateHighlights(metrics: any): string[] {
    const highlights: string[] = [];

    if (metrics.focusImprovement > 20) {
      highlights.push('📈 Significant focus improvement');
    }
    if (metrics.consistencyScore > 85) {
      highlights.push('✨ Excellent consistency');
    }
    if (metrics.sessionQuality > 85) {
      highlights.push('🎯 High session quality');
    }
    if (metrics.engagementLevel > 90) {
      highlights.push('🔥 Exceptional engagement');
    }

    return highlights.length > 0 ? highlights : ['🌟 Solid overall performance'];
  }

  /**
   * Generate challenges
   */
  private generateChallenges(metrics: any): string[] {
    const challenges: string[] = [];

    if (metrics.focusImprovement < 0) {
      challenges.push('Focus declining - increase break frequency');
    }
    if (metrics.consistencyScore < 60) {
      challenges.push('Consistency below target - build daily habits');
    }
    if (metrics.sessionQuality < 60) {
      challenges.push('Session quality needs improvement - optimize environment');
    }

    return challenges;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.focusImprovement < 10) {
      recommendations.push('Try the Pomodoro technique for better focus management');
    }
    if (metrics.consistencyScore < 80) {
      recommendations.push('Set a consistent daily time for sessions');
    }
    if (metrics.engagementLevel < 70) {
      recommendations.push('Consider gamification rewards to boost motivation');
    }

    return recommendations;
  }

  /**
   * Generate next week plan
   */
  private generateNextWeekPlan(metrics: any): string {
    if (metrics.focusImprovement > 15) {
      return 'Maintain momentum! Try increasing session difficulty or duration.';
    } else if (metrics.focusImprovement > 0) {
      return 'Continue current pace. Consistency is key!';
    } else {
      return 'Focus on building back momentum. Short, manageable sessions.';
    }
  }

  /**
   * Generate action items
   */
  private generateActionItems(metrics: any): string[] {
    const items: string[] = [];

    items.push('✅ Review and adjust daily schedule');
    if (metrics.focusImprovement < 0) {
      items.push('✅ Identify and remove distractions');
    }
    if (metrics.sessionQuality < 70) {
      items.push('✅ Optimize your work environment');
    }
    items.push('✅ Plan next week\'s focus goals');

    return items;
  }

  /**
   * Get daily tip
   */
  getDailyTip(difficulty: SessionDifficulty): DailyTip {
    const tips: DailyTip[] = [
      {
        tipId: 'tip-1',
        topic: 'Focus',
        title: '🎯 The Pomodoro Technique',
        content: 'Work in 25-minute focused intervals with 5-minute breaks. This proven method enhances concentration and prevents burnout.',
        difficulty,
        category: 'focus',
        actionable: true,
        estimatedTime: 25,
        evidence: 'Research shows that structured intervals improve focus and retention by 25-30%.',
      },
      {
        tipId: 'tip-2',
        topic: 'Stress',
        title: '🧘 Box Breathing for Calm',
        content: 'Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 5 times to reduce stress.',
        difficulty,
        category: 'stress',
        actionable: true,
        estimatedTime: 2,
        evidence: 'Box breathing activates the parasympathetic nervous system, reducing cortisol levels.',
      },
      {
        tipId: 'tip-3',
        topic: 'Productivity',
        title: '📝 Brain Dump Technique',
        content: 'Spend 5 minutes writing down all thoughts before a session. This clears mental clutter and improves focus.',
        difficulty,
        category: 'productivity',
        actionable: true,
        estimatedTime: 5,
        evidence: 'Externalizing thoughts reduces cognitive load by up to 40%.',
      },
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }

  /**
   * Get session plan
   */
  getSessionPlan(userId: string, sessionId: string): SessionPlan | null {
    const plans = this.sessionPlans.get(userId);
    return plans?.find(p => p.sessionId === sessionId) || null;
  }

  /**
   * Get user goals
   */
  getUserGoals(userId: string): CoachingGoal[] {
    return this.goals.get(userId) || [];
  }

  /**
   * Get user insights
   */
  getUserInsights(userId: string): CoachingInsight[] {
    return (this.insights.get(userId) || []).slice(-20); // Last 20 insights
  }
}

/**
 * Create adaptive coach instance
 */
export function createAdaptiveCoach(): AdaptiveCoach {
  return new AdaptiveCoach();
}
