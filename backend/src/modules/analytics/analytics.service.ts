import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 1 minute cache TTL

  constructor(private prisma: PrismaService) {}

  private getCacheKey(userId: string, period: string): string {
    return `analytics:${userId}:${period}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    this.logger.debug(`Cache hit for ${key}`);
    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Clean up old cache entries (simple LRU)
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  async getUserAnalytics(userId: string, period: string = 'WEEKLY') {
    const cacheKey = this.getCacheKey(userId, period);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const startTime = Date.now();
    
    const sessions = await this.prisma.session.findMany({
      where: { userId, status: 'COMPLETED', deletedAt: null },
      orderBy: { startTime: 'desc' },
      take: period === 'DAILY' ? 1 : period === 'WEEKLY' ? 7 : 30,
      include: { eegProcessed: true },
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((s, sess) => s + (sess.duration || 0), 0) / 60;
    const avgFocus = totalSessions > 0 ? sessions.reduce((s, sess) => s + (sess.avgFocus || 0), 0) / totalSessions : 0;
    const avgStress = totalSessions > 0 ? sessions.reduce((s, sess) => s + (sess.avgStress || 0), 0) / totalSessions : 0;

    // Focus distribution
    const focusDistribution = { LOW: 0, MODERATE: 0, HIGH: 0 };
    sessions.forEach((s) => { if (s.focusCategory) focusDistribution[s.focusCategory]++; });

    // Daily focus timeline
    const dailyData = sessions.map((s) => ({
      date: s.startTime.toISOString().split('T')[0],
      focus: s.avgFocus || 0,
      stress: s.avgStress || 0,
      duration: Math.round((s.duration || 0) / 60),
    }));

    // Band power averages (optimized - single pass)
    const avgBandPowers = {
      delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0,
    };
    
    let processedCount = 0;
    sessions.forEach((s) => {
      s.eegProcessed.forEach((p) => {
        const bp = p.bandPowers as any;
        if (bp) {
          avgBandPowers.delta += bp.delta || 0;
          avgBandPowers.theta += bp.theta || 0;
          avgBandPowers.alpha += bp.alpha || 0;
          avgBandPowers.beta += bp.beta || 0;
          avgBandPowers.gamma += bp.gamma || 0;
          processedCount++;
        }
      });
    });
    
    if (processedCount > 0) {
      Object.keys(avgBandPowers).forEach((key) => {
        const k = key as keyof typeof avgBandPowers;
        avgBandPowers[k] = Math.round(avgBandPowers[k] / processedCount * 100) / 100;
      });
    }

    const result = {
      period, totalSessions, totalMinutes: Math.round(totalMinutes),
      avgFocus: Math.round(avgFocus), avgStress: Math.round(avgStress),
      focusDistribution, dailyData, avgBandPowers,
    };

    // Cache the result
    this.setCache(cacheKey, result);
    
    const duration = Date.now() - startTime;
    this.logger.debug(`getUserAnalytics took ${duration}ms`);

    return result;
  }

  async getStudentAnalyticsForTeacher(studentId: string) {
    return this.getUserAnalytics(studentId, 'WEEKLY');
  }

  async getClassAnalytics(teacherId: string) {
    const cacheKey = `class:${teacherId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const startTime = Date.now();

    const students = await this.prisma.teacherStudent.findMany({
      where: { teacherId },
      include: { 
        student: { 
          include: { 
            sessions: { 
              where: { status: 'COMPLETED' }, 
              orderBy: { startTime: 'desc' }, 
              take: 7,
              select: { // Select only needed fields
                avgFocus: true,
                startTime: true,
              }
            } 
          } 
        } 
      },
    });

    const result = students.map((rel) => {
      const sessions = rel.student.sessions;
      const avgFocus = sessions.length > 0 ? sessions.reduce((s, sess) => s + (sess.avgFocus || 0), 0) / sessions.length : 0;
      return {
        studentId: rel.student.id,
        name: rel.student.name,
        avgFocus: Math.round(avgFocus),
        totalSessions: sessions.length,
        lastActive: sessions[0]?.startTime || null,
      };
    });

    this.setCache(cacheKey, result);
    
    const duration = Date.now() - startTime;
    this.logger.debug(`getClassAnalytics took ${duration}ms`);

    return result;
  }

  // Clear cache for a specific user (call after session completion)
  clearUserCache(userId: string): void {
    ['DAILY', 'WEEKLY', 'MONTHLY'].forEach(period => {
      const key = this.getCacheKey(userId, period);
      this.cache.delete(key);
    });
    this.logger.debug(`Cleared cache for user ${userId}`);
  }
}
