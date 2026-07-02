import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUserAnalytics(userId: string, period: string = 'WEEKLY') {
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

    // Band power averages
    const allProcessed = sessions.flatMap((s) => s.eegProcessed);
    const avgBandPowers = {
      delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0,
    };
    if (allProcessed.length > 0) {
      allProcessed.forEach((p) => {
        const bp = p.bandPowers as any;
        avgBandPowers.delta += bp?.delta || 0;
        avgBandPowers.theta += bp?.theta || 0;
        avgBandPowers.alpha += bp?.alpha || 0;
        avgBandPowers.beta += bp?.beta || 0;
        avgBandPowers.gamma += bp?.gamma || 0;
      });
      Object.keys(avgBandPowers).forEach((key) => {
        const k = key as keyof typeof avgBandPowers;
        avgBandPowers[k] = Math.round(avgBandPowers[k] / allProcessed.length * 100) / 100;
      });
    }

    return {
      period, totalSessions, totalMinutes: Math.round(totalMinutes),
      avgFocus: Math.round(avgFocus), avgStress: Math.round(avgStress),
      focusDistribution, dailyData, avgBandPowers,
    };
  }

  async getStudentAnalyticsForTeacher(studentId: string) {
    return this.getUserAnalytics(studentId, 'WEEKLY');
  }

  async getClassAnalytics(teacherId: string) {
    const students = await this.prisma.teacherStudent.findMany({
      where: { teacherId },
      include: { student: { include: { sessions: { where: { status: 'COMPLETED' }, orderBy: { startTime: 'desc' }, take: 7 } } } },
    });

    return students.map((rel) => {
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
  }
}
