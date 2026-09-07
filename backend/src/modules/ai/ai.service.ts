import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IAIProvider, AI_PROVIDER } from './interfaces/ai-provider.interface';
import { AdaptiveRecommendationService } from '../learning/adaptive-recommendation.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    @Inject(AI_PROVIDER) private readonly aiProvider: any,
    private readonly prisma: PrismaService,
    private readonly adaptiveService: AdaptiveRecommendationService,
  ) {}

  /**
   * Get AI-powered recommendations based on current EEG state and learning history
   */
  async getRecommendations(userId: string) {
    try {
      // Get user's latest session data
      const latestSession = await this.prisma.session.findFirst({
        where: { userId },
        orderBy: { startTime: 'desc' },
        include: { eegProcessed: { orderBy: { timestamp: 'desc' }, take: 1 } },
      });

      if (!latestSession) {
        this.logger.warn(`No session found for user ${userId}`);
        return [];
      }

      const latestProcessed = latestSession.eegProcessed?.[0];

      if (!latestProcessed) {
        this.logger.warn(`No EEG data for session ${latestSession.id}`);
        return [];
      }

      // Build recommendation context
      const context = {
        userId,
        focusCategory: (latestProcessed.focusCategory || 'MODERATE') as any,
        recommendedMode: (latestSession.learningMode || 'VISUAL') as any,
        focusIndex: latestProcessed.focusIndex,
        stressIndex: latestProcessed.stressIndex,
        attentionScore: latestProcessed.attentionScore,
      };

      // Get adaptive recommendations
      const adaptiveRecommendations = await this.adaptiveService.getAdaptiveRecommendations(
        context,
        5,
      );

      // Format recommendations for return
      const recommendations = adaptiveRecommendations.map((rec) => ({
        id: rec.contentId,
        title: rec.title,
        description: rec.reason,
        reason: rec.reason,
        contentType: rec.type,
        difficulty: rec.difficulty,
        matchScore: rec.score,
        eegAlignment: rec.eegMatch,
        learningGapFill: rec.learningMatch,
        difficultyAlignment: rec.difficultyMatch,
      }));

      // Save recommendations to DB
      for (const rec of recommendations) {
        await this.prisma.recommendation.create({
          data: {
            userId,
            sessionId: latestSession?.id || undefined,
            type: rec.contentType,
            title: rec.title,
            content: rec.reason,
            priority: rec.matchScore > 80 ? 5 : rec.matchScore > 50 ? 3 : 1,
            metadata: {
              scores: {
                eeg: rec.eegAlignment,
                learning: rec.learningGapFill,
                difficulty: rec.difficultyAlignment,
              },
            },
          },
        });
      }

      this.logger.log(`Generated ${recommendations.length} recommendations for user ${userId}`);
      return recommendations;
    } catch (error) {
      this.logger.error('Error generating recommendations:', error);
      return [];
    }
  }

  async analyzeSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { eegProcessed: true },
    });

    if (!session) throw new Error('Session not found');

    const processed = session.eegProcessed;
    const avgFocus = processed.reduce((s: number, d: any) => s + d.focusIndex, 0) / (processed.length || 1);
    const avgStress = processed.reduce((s: number, d: any) => s + d.stressIndex, 0) / (processed.length || 1);
    const avgAttention = processed.reduce((s: number, d: any) => s + d.attentionScore, 0) / (processed.length || 1);

    const focusDistribution: Record<string, number> = { LOW: 0, MODERATE: 0, HIGH: 0 };
    processed.forEach((d) => { focusDistribution[d.focusCategory]++; });
    const total = processed.length || 1;
    Object.keys(focusDistribution).forEach((k) => {
      focusDistribution[k] = Math.round((focusDistribution[k] / total) * 100);
    });

    // Enhanced analysis with insights
    const analysis = {
      summary: this.aiProvider.analyzeSession({
        avgFocus: Math.round(avgFocus),
        avgStress: Math.round(avgStress),
        avgAttention: Math.round(avgAttention),
        duration: session.duration || processed.length,
        focusDistribution,
      }),
      metrics: {
        avgFocus: Math.round(avgFocus),
        avgStress: Math.round(avgStress),
        avgAttention: Math.round(avgAttention),
        duration: session.duration || processed.length,
      },
      focusDistribution,
      recommendations: this.generateSessionInsights(
        avgFocus,
        avgStress,
        avgAttention,
        focusDistribution,
      ),
    };

    return analysis;
  }

  /**
   * Generate insights and recommendations from session data
   */
  private generateSessionInsights(
    avgFocus: number,
    avgStress: number,
    avgAttention: number,
    distribution: Record<string, number>,
  ): string[] {
    const insights: string[] = [];

    // Focus insights
    if (avgFocus > 80) {
      insights.push('🎯 Excellent focus throughout the session. Consider more challenging content.');
    } else if (avgFocus > 60) {
      insights.push('✅ Good focus level. Maintain your current learning pace.');
    } else if (avgFocus > 40) {
      insights.push('⚠️ Focus was fluctuating. Try shorter sessions with breaks.');
    } else {
      insights.push('🔄 Low focus detected. Consider changing learning environment or trying visual content.');
    }

    // Stress insights
    if (avgStress > 70) {
      insights.push('😰 High stress level. Try relaxation breaks or easier content.');
    } else if (avgStress > 40) {
      insights.push('💭 Moderate stress. This is healthy - you\'re being challenged appropriately.');
    } else {
      insights.push('😌 Low stress. You\'re in a calm, focused state - good for learning!');
    }

    // Distribution insights
    if (distribution.HIGH > 50) {
      insights.push('🚀 Sustained high focus. Great session! Try progressively harder material.');
    } else if (distribution.LOW > 50) {
      insights.push('💡 Variable focus. Try breaking sessions into 25-min Pomodoro intervals.');
    }

    // Attention insights
    if (avgAttention > 80) {
      insights.push('👀 Excellent attention. Perfect for learning new complex concepts.');
    } else if (avgAttention < 40) {
      insights.push('🎨 Low attention. Visual or interactive content might help.');
    }

    return insights;
  }

  async generateJournal(userId: string, mood?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = await this.prisma.session.findMany({
      where: {
        userId,
        startTime: { gte: today },
        status: 'COMPLETED',
      },
    });

    const avgFocus = todaySessions.length > 0
      ? todaySessions.reduce((s: number, sess: any) => s + (sess.avgFocus || 0), 0) / todaySessions.length
      : 50;
    const avgStress = todaySessions.length > 0
      ? todaySessions.reduce((s: number, sess: any) => s + (sess.avgStress || 0), 0) / todaySessions.length
      : 30;

    const journalData = await this.aiProvider.generateJournal({
      avgFocus: Math.round(avgFocus),
      avgStress: Math.round(avgStress),
      mood,
      sessionsToday: todaySessions.length,
    });

    const journal = await this.prisma.journal.create({
      data: {
        userId,
        title: journalData.title,
        content: journalData.content,
        mood: mood as any,
        aiGenerated: true,
        eegSummary: { avgFocus, avgStress, sessions: todaySessions.length },
      },
    });

    return journal;
  }

  async getUserRecommendations(userId: string) {
    return this.prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}

