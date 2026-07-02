import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, AIAnalysis, AIRecommendation } from '../interfaces/ai-provider.interface';

/**
 * Rule-Based AI Provider
 * Current MVP implementation using deterministic rules.
 * Future: Replace with OpenAI/Claude/Gemini/TensorFlow provider.
 */
@Injectable()
export class RuleBasedAIProvider implements IAIProvider {
  private readonly logger = new Logger(RuleBasedAIProvider.name);

  async analyzeSession(data: {
    avgFocus: number;
    avgStress: number;
    avgAttention: number;
    duration: number;
    focusDistribution: Record<string, number>;
  }): Promise<AIAnalysis> {
    let focusSummary: string;
    let stressSummary: string;
    let riskLevel: AIAnalysis['riskLevel'] = 'NONE';

    // Focus analysis
    if (data.avgFocus >= 70) {
      focusSummary = 'Excellent focus maintained throughout the session. The learner demonstrated strong cognitive engagement and sustained attention.';
    } else if (data.avgFocus >= 50) {
      focusSummary = 'Moderate focus levels observed. There were periods of good engagement but also some fluctuations that suggest the need for more varied content.';
    } else {
      focusSummary = 'Focus levels were below optimal. The learner may benefit from shorter sessions, visual content, or break intervals to improve concentration.';
    }

    // Stress analysis
    if (data.avgStress >= 70) {
      stressSummary = 'High stress levels detected. Consider reducing cognitive load, taking breaks, or switching to relaxation activities.';
      riskLevel = 'HIGH';
    } else if (data.avgStress >= 50) {
      stressSummary = 'Moderate stress levels observed. Monitor for potential burnout and ensure adequate rest between sessions.';
      riskLevel = 'MEDIUM';
    } else if (data.avgStress >= 30) {
      stressSummary = 'Healthy stress levels within normal learning range. The learner appears comfortable with the current workload.';
      riskLevel = 'LOW';
    } else {
      stressSummary = 'Very low stress levels. The learner is in a relaxed state, which is conducive to creative thinking but may indicate under-stimulation.';
    }

    const overallAssessment = `Session lasted ${Math.round(data.duration / 60)} minutes with ${data.avgFocus}% average focus and ${data.avgStress}% stress index. ` +
      `Focus distribution: ${data.focusDistribution?.HIGH || 0}% high, ${data.focusDistribution?.MODERATE || 0}% moderate, ${data.focusDistribution?.LOW || 0}% low.`;

    return { focusSummary, stressSummary, overallAssessment, riskLevel };
  }

  async generateRecommendations(context: {
    focusCategory: string;
    stressIndex: number;
    sessionCount: number;
    streak: number;
  }): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];

    // Focus-based recommendations
    if (context.focusCategory === 'LOW') {
      recommendations.push({
        type: 'learning',
        title: 'Switch to Visual Learning',
        content: 'Your focus is currently low. Try visual-based content like infographics, videos, or interactive diagrams to re-engage your attention.',
        priority: 1,
      });
      recommendations.push({
        type: 'break',
        title: 'Take a Short Break',
        content: 'A 5-minute break with light stretching can help restore cognitive resources. Try the 20-20-20 rule for your eyes.',
        priority: 2,
      });
    } else if (context.focusCategory === 'MODERATE') {
      recommendations.push({
        type: 'learning',
        title: 'Optimize Your Session',
        content: 'Your focus is at a good level. Try audio-based learning or lectures to maintain this engagement while covering more material.',
        priority: 2,
      });
    } else {
      recommendations.push({
        type: 'learning',
        title: 'Challenge Yourself',
        content: 'Your focus is excellent! Try interactive exercises, quizzes, or problem-solving activities to maximize your cognitive throughput.',
        priority: 3,
      });
    }

    // Stress-based recommendations
    if (context.stressIndex > 60) {
      recommendations.push({
        type: 'stress_relief',
        title: 'Stress Management',
        content: 'Your stress levels are elevated. Try deep breathing exercises (4-7-8 technique) or listen to calming music for 3 minutes.',
        priority: 1,
      });
    }

    // Streak-based recommendations
    if (context.streak >= 7) {
      recommendations.push({
        type: 'study_tip',
        title: 'Amazing Streak! 🔥',
        content: `You're on a ${context.streak}-day streak! Consistency is the key to learning. Keep up the excellent work!`,
        priority: 3,
      });
    } else if (context.streak === 0) {
      recommendations.push({
        type: 'study_tip',
        title: 'Start Your Streak Today',
        content: 'Begin a new daily learning streak! Even 10 minutes of focused study can make a significant difference.',
        priority: 2,
      });
    }

    return recommendations;
  }

  async generateJournal(data: {
    avgFocus: number;
    avgStress: number;
    mood?: string;
    sessionsToday: number;
  }): Promise<{ title: string; content: string }> {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    let moodEmoji = '😐';
    if (data.mood === 'VERY_HAPPY') moodEmoji = '😄';
    else if (data.mood === 'HAPPY') moodEmoji = '😊';
    else if (data.mood === 'SAD') moodEmoji = '😢';
    else if (data.mood === 'STRESSED') moodEmoji = '😰';
    else if (data.mood === 'TIRED') moodEmoji = '😴';
    else if (data.mood === 'ENERGETIC') moodEmoji = '⚡';

    const title = `Cognitive Journal — ${date}`;
    let content = `${moodEmoji} Today's cognitive performance summary:\n\n`;
    content += `📊 Average Focus: ${data.avgFocus}%\n`;
    content += `💆 Stress Level: ${data.avgStress}%\n`;
    content += `📚 Sessions Completed: ${data.sessionsToday}\n\n`;

    if (data.avgFocus >= 70) {
      content += '🌟 Great job! Your brain was highly engaged today. You made the most of your study sessions.\n';
    } else if (data.avgFocus >= 50) {
      content += '👍 Decent performance today. Consider optimizing your study environment for better concentration tomorrow.\n';
    } else {
      content += '💡 Today was challenging for focus. Tomorrow, try starting with your most important tasks when your brain is freshest.\n';
    }

    return { title, content };
  }

  async generateReport(data: {
    period: string;
    sessions: number;
    avgFocus: number;
    avgStress: number;
    totalMinutes: number;
    improvement: number;
  }): Promise<{ summary: string; insights: string[]; suggestions: string[] }> {
    const summary = `${data.period} Report: Completed ${data.sessions} sessions totaling ${data.totalMinutes} minutes. Average focus: ${data.avgFocus}%, Average stress: ${data.avgStress}%. Performance change: ${data.improvement > 0 ? '+' : ''}${data.improvement}%.`;

    const insights: string[] = [];
    const suggestions: string[] = [];

    if (data.avgFocus >= 70) {
      insights.push('Focus levels are consistently high — excellent cognitive performance.');
    } else if (data.avgFocus < 40) {
      insights.push('Focus levels are below average — environmental or motivational factors may be involved.');
    }

    if (data.improvement > 10) {
      insights.push(`Significant improvement of ${data.improvement}% compared to previous period.`);
    } else if (data.improvement < -10) {
      insights.push(`Performance declined by ${Math.abs(data.improvement)}% — consider adjusting study patterns.`);
    }

    if (data.avgStress > 60) {
      suggestions.push('Reduce session length and incorporate more breaks to manage stress.');
      suggestions.push('Consider mindfulness exercises before study sessions.');
    }

    if (data.sessions < 5) {
      suggestions.push('Try to maintain at least 5 sessions per week for optimal learning continuity.');
    }

    suggestions.push('Continue with adaptive learning modes that match your cognitive state.');

    return { summary, insights, suggestions };
  }
}
