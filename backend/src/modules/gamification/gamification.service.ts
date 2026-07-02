import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string) {
    let stats = await this.prisma.gamification.findUnique({ where: { userId } });
    if (!stats) {
      stats = await this.prisma.gamification.create({ data: { userId } });
    }
    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
    const recentRewards = await this.prisma.reward.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return { ...stats, achievements, recentRewards };
  }

  async addXPAndCoins(userId: string, xp: number, coins: number, reason: string, sessionId?: string) {
    const stats = await this.prisma.gamification.upsert({
      where: { userId },
      create: { userId, xp, coins },
      update: { xp: { increment: xp }, coins: { increment: coins } },
    });

    // Level up check (every 1000 XP = 1 level)
    const newLevel = Math.floor(stats.xp / 1000) + 1;
    if (newLevel > stats.level) {
      await this.prisma.gamification.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    // Record reward
    await this.prisma.reward.create({
      data: { userId, sessionId, type: 'SESSION', xpAmount: xp, coinAmount: coins, reason },
    });

    return stats;
  }

  async updateStreak(userId: string) {
    const stats = await this.prisma.gamification.findUnique({ where: { userId } });
    if (!stats) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = stats.lastActiveDate ? new Date(stats.lastActiveDate) : null;
    lastActive?.setHours(0, 0, 0, 0);

    let newStreak = stats.streak;
    if (!lastActive || (today.getTime() - lastActive.getTime()) > 48 * 60 * 60 * 1000) {
      newStreak = 1; // Reset streak
    } else if (today.getTime() !== lastActive?.getTime()) {
      newStreak = stats.streak + 1;
    }

    const longestStreak = Math.max(stats.longestStreak, newStreak);

    await this.prisma.gamification.update({
      where: { userId },
      data: { streak: newStreak, longestStreak, lastActiveDate: new Date() },
    });

    // Daily reward for maintaining streak
    if (newStreak > 0) {
      const dailyXP = Math.min(50 + newStreak * 10, 200);
      const dailyCoins = Math.min(20 + newStreak * 5, 100);
      await this.prisma.reward.create({
        data: { userId, type: 'DAILY', xpAmount: dailyXP, coinAmount: dailyCoins, reason: `Day ${newStreak} streak bonus` },
      });
    }

    return { streak: newStreak, longestStreak };
  }

  async checkAchievements(userId: string) {
    const sessionCount = await this.prisma.session.count({ where: { userId, status: 'COMPLETED' } });
    const stats = await this.prisma.gamification.findUnique({ where: { userId } });
    const earned = await this.prisma.userAchievement.findMany({ where: { userId } });
    const earnedIds = earned.map((e) => e.achievementId);

    const allAchievements = await this.prisma.achievement.findMany({ where: { isActive: true } });
    const newlyEarned: any[] = [];

    for (const achievement of allAchievements) {
      if (earnedIds.includes(achievement.id)) continue;
      const criteria = achievement.criteria as any;

      let earned = false;
      if (criteria.type === 'sessions_completed' && sessionCount >= criteria.threshold) earned = true;
      if (criteria.type === 'streak_days' && (stats?.streak || 0) >= criteria.threshold) earned = true;
      if (criteria.type === 'xp_total' && (stats?.xp || 0) >= criteria.threshold) earned = true;
      if (criteria.type === 'level' && (stats?.level || 1) >= criteria.threshold) earned = true;

      if (earned) {
        await this.prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });
        await this.addXPAndCoins(userId, achievement.xpReward, achievement.coinReward, `Achievement: ${achievement.name}`);
        newlyEarned.push(achievement);
      }
    }

    return newlyEarned;
  }

  async getLeaderboard(period: string = 'weekly', limit: number = 10) {
    const users = await this.prisma.gamification.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    return users.map((u, i) => ({
      rank: i + 1,
      userId: u.userId,
      name: u.user.name,
      avatar: u.user.avatar,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
    }));
  }

  async getMissions() {
    return this.prisma.mission.findMany({ where: { isActive: true } });
  }

  async getAllAchievements() {
    return this.prisma.achievement.findMany({ where: { isActive: true } });
  }
}
