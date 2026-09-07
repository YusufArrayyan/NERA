import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Adaptive Learning Recommendation Engine
 * 
 * Intelligently recommends learning content based on:
 * 1. Current EEG state (focus, stress, attention)
 * 2. Learning history and performance
 * 3. Student preferences and learning style
 * 4. Difficulty progression
 * 5. Spaced repetition principles
 * 
 * Algorithm:
 * - Rank content by relevance (EEG match + history + difficulty)
 * - Filter by learning style preference
 * - Apply spaced repetition (don't repeat recent content)
 * - Suggest next difficulty level based on performance
 * - Prioritize struggled topics (remedial content)
 */

interface RecommendationContext {
  userId: string;
  focusCategory: 'LOW' | 'MODERATE' | 'HIGH';
  recommendedMode: 'VISUAL' | 'AUDITORY' | 'INTERACTIVE';
  focusIndex: number;
  stressIndex: number;
  attentionScore: number;
}

export interface ContentScore {
  contentId: string;
  title: string;
  type: string;
  difficulty: number;
  score: number;
  reason: string;
  eegMatch: number;      // 0-100: How well this matches current EEG state
  learningMatch: number; // 0-100: How well this fills learning gaps
  difficultyMatch: number; // 0-100: How appropriate is the difficulty
}

@Injectable()
export class AdaptiveRecommendationService {
  private readonly logger = new Logger(AdaptiveRecommendationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get adaptive content recommendations for a user based on current state
   */
  async getAdaptiveRecommendations(
    context: RecommendationContext,
    limit = 5,
  ): Promise<ContentScore[]> {
    try {
      // Get all available content
      const allContent = await this.prisma.learningContent.findMany({
        where: {
          deletedAt: null,
          isPublished: true,
        },
      });

      if (allContent.length === 0) {
        this.logger.warn(`No published content available for user ${context.userId}`);
        return [];
      }

      // Get user's learning history
      const learningHistory = await this.getUserLearningHistory(context.userId);

      // Get user's performance metrics
      const performanceMetrics = await this.getUserPerformanceMetrics(context.userId);

      // Score each piece of content
      const scores: ContentScore[] = allContent.map((content: any) => {
        // Calculate EEG match score (0-100)
        const eegMatch = this.calculateEEGMatch(content, context);

        // Calculate learning match score (0-100)
        const learningMatch = this.calculateLearningMatch(
          content,
          learningHistory,
          performanceMetrics,
        );

        // Calculate difficulty match score (0-100)
        const difficultyMatch = this.calculateDifficultyMatch(
          content,
          performanceMetrics,
        );

        // Combined score with weights
        const score =
          eegMatch * 0.4 + learningMatch * 0.35 + difficultyMatch * 0.25;

        const reason = this.getRecommendationReason(
          content,
          eegMatch,
          learningMatch,
          difficultyMatch,
          context,
        );

        return {
          contentId: content.id,
          title: content.title,
          type: content.type,
          difficulty: content.difficulty,
          score,
          reason,
          eegMatch,
          learningMatch,
          difficultyMatch,
        };
      });

      // Sort by score and return top N
      return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      this.logger.error('Error generating adaptive recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate how well content matches current EEG state
   * - LOW focus: recommend VISUAL mode (stimulating)
   * - MODERATE focus: recommend AUDITORY (standard)
   * - HIGH focus: recommend INTERACTIVE (challenging)
   */
  private calculateEEGMatch(
    content: any,
    context: RecommendationContext,
  ): number {
    let score = 50; // Base score

    // Mode match (40 points)
    if (content.type === context.recommendedMode) {
      score += 40;
    } else if (
      (context.focusCategory === 'LOW' && content.type === 'VISUAL') ||
      (context.focusCategory === 'MODERATE' && content.type === 'AUDITORY') ||
      (context.focusCategory === 'HIGH' && content.type === 'INTERACTIVE')
    ) {
      score += 25;
    }

    // Stress consideration (10 points)
    if (context.stressIndex > 70 && content.type === 'AUDITORY') {
      // Calming content for high stress
      score += 10;
    } else if (context.stressIndex < 30 && content.type === 'INTERACTIVE') {
      // Engaging content for low stress
      score += 10;
    }

    // Attention consideration (10 points)
    if (context.attentionScore < 30) {
      if (content.type === 'VISUAL') {
        score += 10; // Visual attracts attention
      }
    }

    return Math.min(100, score);
  }

  /**
   * Calculate how well content addresses learning gaps
   */
  private calculateLearningMatch(
    content: any,
    history: any[],
    performance: any,
  ): number {
    let score = 30; // Base score

    // Check if recently seen (penalty)
    const recentlyViewed = history.find(
      (h) => h.contentId === content.id && h.viewedAt,
    );
    if (recentlyViewed) {
      const daysSinceViewed = Math.floor(
        (Date.now() - new Date(recentlyViewed.viewedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysSinceViewed < 3) {
        score -= 20; // Don't repeat recently viewed
      } else if (daysSinceViewed < 7) {
        score -= 10; // Lower penalty for older views
      }
    }

    // Check if it's a struggled topic (bonus)
    if (performance.struggledTopics && performance.struggledTopics.includes(content.tags?.[0])) {
      score += 30; // High boost for remedial content
    }

    // Check if it fills a gap
    const tagCount = history.filter((h) => h.tag && content.tags?.includes(h.tag)).length;
    if (tagCount === 0) {
      score += 20; // New tag
    } else if (tagCount < 3) {
      score += 10; // Underdeveloped tag
    }

    // Variety bonus (different from recently done)
    const recentTags = history
      .slice(0, 5)
      .map((h) => h.tag);
    if (!recentTags.some((t) => content.tags?.includes(t))) {
      score += 10; // Variety is good
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate how appropriate the difficulty is
   * Based on student's mastery level and current performance
   */
  private calculateDifficultyMatch(
    content: any,
    performance: any,
  ): number {
    let score = 50; // Base score

    const studentLevel = performance.averageLevel || 2; // 1-5 scale
    const contentDifficulty = content.difficulty || 2;

    // Perfect difficulty is slightly above current level
    const difficultyGap = contentDifficulty - studentLevel;

    if (difficultyGap === 0) {
      score = 60; // Review/reinforcement
    } else if (difficultyGap === 1) {
      score = 85; // Optimal challenge (Goldilocks zone)
    } else if (difficultyGap === 2) {
      score = 70; // Stretch goal
    } else if (difficultyGap > 2) {
      score = 40; // Too difficult
    } else if (difficultyGap < 0) {
      score = 30; // Too easy (review only if needed)
    }

    // Adjust based on recent performance
    if (performance.recentAccuracy !== undefined) {
      if (performance.recentAccuracy > 0.8) {
        score += 10; // Doing well, can go harder
      } else if (performance.recentAccuracy < 0.6) {
        score -= 20; // Struggling, need easier content
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate human-readable reason for recommendation
   */
  private getRecommendationReason(
    content: any,
    eegMatch: number,
    learningMatch: number,
    difficultyMatch: number,
    context: RecommendationContext,
  ): string {
    const reasons: string[] = [];

    // EEG-based reason
    if (eegMatch > 80) {
      if (context.focusCategory === 'LOW') {
        reasons.push('Materi visual untuk meningkatkan fokus Anda');
      } else if (context.focusCategory === 'HIGH') {
        reasons.push('Konten interaktif cocok untuk kondisi fokus tinggi Anda');
      }
    }

    if (context.stressIndex > 70 && eegMatch > 60) {
      reasons.push('Materi menenangkan sesuai level stres Anda');
    }

    // Learning-based reason
    if (learningMatch > 70) {
      if (reasons.length < 2) {
        reasons.push('Topik penting yang belum banyak Anda pelajari');
      }
    }

    // Difficulty-based reason
    if (difficultyMatch > 75) {
      if (reasons.length < 2) {
        reasons.push('Tingkat kesulitan optimal untuk pembelajaran Anda');
      }
    } else if (difficultyMatch < 40) {
      if (reasons.length < 2) {
        reasons.push('Membantu memperkuat konsep dasar');
      }
    }

    return reasons.length > 0
      ? reasons.join('. ')
      : 'Rekomendasi personal berdasarkan profil belajar Anda';
  }

  /**
   * Get user's learning history
   */
  private async getUserLearningHistory(userId: string): Promise<any[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      select: {
        id: true,
        startTime: true,
        learningMode: true,
      },
      orderBy: { startTime: 'desc' },
      take: 20,
    });

    // TODO: Enhance with actual content viewing history from recommendations table
    // For now, return session history

    return sessions.map((s: any) => ({
      sessionId: s.id,
      viewedAt: s.startTime,
      topic: s.learningMode,
    }));
  }

  /**
   * Get user's performance metrics
   */
  private async getUserPerformanceMetrics(userId: string): Promise<any> {
    const sessions = await this.prisma.session.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { avgFocus: true, avgStress: true, avgAttention: true },
      orderBy: { startTime: 'desc' },
      take: 10,
    });

    const avgFocus =
      sessions.length > 0
        ? sessions.reduce((s: number, sess: any) => s + (sess.avgFocus || 0), 0) /
          sessions.length
        : 50;

    const avgAttention =
      sessions.length > 0
        ? sessions.reduce((s: number, sess: any) => s + (sess.avgAttention || 0), 0) /
          sessions.length
        : 50;

    const recentAccuracy = Math.min(1, Math.max(0, avgFocus / 100));

    return {
      averageLevel: Math.floor((avgFocus + avgAttention) / 100 * 5) || 2,
      recentAccuracy,
      struggledTopics: [], // TODO: Derive from low-performance sessions
    };
  }

  /**
   * Get next recommended difficulty level
   */
  async getNextDifficultyLevel(userId: string): Promise<number> {
    const performance = await this.getUserPerformanceMetrics(userId);

    const currentLevel = performance.averageLevel || 2;

    // If doing well (accuracy > 80%), suggest next level
    if (performance.recentAccuracy > 0.8) {
      return Math.min(5, currentLevel + 1);
    }

    // If struggling (accuracy < 60%), stay at current or go down
    if (performance.recentAccuracy < 0.6) {
      return Math.max(1, currentLevel - 1);
    }

    // Otherwise, stay at current level
    return currentLevel;
  }

  /**
   * Create personalized learning path for a student
   */
  async generateLearningPath(userId: string, duration = 7): Promise<any[]> {
    const recommendations: any[] = [];
    const dailyTags = ['math', 'science', 'language', 'history', 'arts'];

    for (let day = 0; day < duration; day++) {
      const tag = dailyTags[day % dailyTags.length];

      const content = await this.prisma.learningContent.findFirst({
        where: {
          tags: {
            has: tag,
          },
          isPublished: true,
          deletedAt: null,
        },
      });

      if (content) {
        recommendations.push({
          day: day + 1,
          tag,
          contentId: content.id,
          title: content.title,
          type: content.type,
          difficulty: content.difficulty,
        });
      }
    }

    return recommendations;
  }
}
