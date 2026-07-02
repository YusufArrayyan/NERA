import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IAIProvider, AI_PROVIDER } from './interfaces/ai-provider.interface';

@Injectable()
export class AIService {
  constructor(
    @Inject(AI_PROVIDER) private readonly aiProvider: any,
    private readonly prisma: PrismaService,
  ) {}

  async getRecommendations(userId: string) {
    // Get user's latest session data
    const latestSession = await this.prisma.session.findFirst({
      where: { userId },
      orderBy: { startTime: 'desc' },
      include: { eegProcessed: { orderBy: { timestamp: 'desc' }, take: 1 } },
    });

    const gamification = await this.prisma.gamification.findUnique({
      where: { userId },
    });

    const latestProcessed = latestSession?.eegProcessed?.[0];

    const recommendations = await this.aiProvider.generateRecommendations({
      focusCategory: latestProcessed?.focusCategory || 'MODERATE',
      stressIndex: latestProcessed?.stressIndex || 30,
      sessionCount: await this.prisma.session.count({ where: { userId } }),
      streak: gamification?.streak || 0,
    });

    // Save recommendations to DB
    for (const rec of recommendations) {
      await this.prisma.recommendation.create({
        data: {
          userId,
          sessionId: latestSession?.id,
          type: rec.type,
          title: rec.title,
          content: rec.content,
          priority: rec.priority,
        },
      });
    }

    return recommendations;
  }

  async analyzeSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { eegProcessed: true },
    });

    if (!session) throw new Error('Session not found');

    const processed = session.eegProcessed;
    const avgFocus = processed.reduce((s, d) => s + d.focusIndex, 0) / (processed.length || 1);
    const avgStress = processed.reduce((s, d) => s + d.stressIndex, 0) / (processed.length || 1);
    const avgAttention = processed.reduce((s, d) => s + d.attentionScore, 0) / (processed.length || 1);

    const focusDistribution: Record<string, number> = { LOW: 0, MODERATE: 0, HIGH: 0 };
    processed.forEach((d) => { focusDistribution[d.focusCategory]++; });
    const total = processed.length || 1;
    Object.keys(focusDistribution).forEach((k) => {
      focusDistribution[k] = Math.round((focusDistribution[k] / total) * 100);
    });

    return this.aiProvider.analyzeSession({
      avgFocus, avgStress, avgAttention,
      duration: session.duration || processed.length,
      focusDistribution,
    });
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
      ? todaySessions.reduce((s, sess) => s + (sess.avgFocus || 0), 0) / todaySessions.length
      : 50;
    const avgStress = todaySessions.length > 0
      ? todaySessions.reduce((s, sess) => s + (sess.avgStress || 0), 0) / todaySessions.length
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
