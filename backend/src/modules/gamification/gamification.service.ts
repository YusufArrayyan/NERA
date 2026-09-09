import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { RawQueryService } from '../../database/raw-query.service';

@Injectable()
export class GamificationService {
  constructor(
    private prisma: PrismaService,
    private db: RawQueryService,
  ) {}

  async getUserStats(userId: string) {
    let stats = await this.db.queryOne(
      'SELECT * FROM gamification WHERE "userId" = $1',
      [userId],
    );

    if (!stats) {
      const id = uuidv4();
      await this.db.execute(
        `INSERT INTO gamification (id, "userId", xp, coins, level, streak, "longestStreak", "lastActiveDate", "createdAt", "updatedAt")
         VALUES ($1, $2, 0, 0, 1, 0, 0, NULL, NOW(), NOW())`,
        [id, userId],
      );
      stats = await this.db.queryOne(
        'SELECT * FROM gamification WHERE "userId" = $1',
        [userId],
      );
    }

    const achievements = await this.db.query(
      `SELECT ua.*, a.name, a."xpReward", a."coinReward"
       FROM user_achievements ua
       JOIN achievements a ON ua."achievementId" = a.id
       WHERE ua."userId" = $1`,
      [userId],
    );

    const recentRewards = await this.db.query(
      `SELECT * FROM rewards WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10`,
      [userId],
    );

    return { ...stats, achievements, recentRewards };
  }

  async addXPAndCoins(userId: string, xp: number, coins: number, reason: string, sessionId?: string) {
    // Get current stats or create
    let stats = await this.db.queryOne(
      'SELECT * FROM gamification WHERE "userId" = $1',
      [userId],
    );

    if (!stats) {
      const id = uuidv4();
      await this.db.execute(
        `INSERT INTO gamification (id, "userId", xp, coins, level, streak, "longestStreak", "lastActiveDate", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 1, 0, 0, NULL, NOW(), NOW())`,
        [id, userId, xp, coins],
      );
    } else {
      await this.db.execute(
        `UPDATE gamification SET xp = xp + $1, coins = coins + $2, "updatedAt" = NOW() WHERE "userId" = $3`,
        [xp, coins, userId],
      );
    }

    // Get updated stats
    stats = await this.db.queryOne(
      'SELECT * FROM gamification WHERE "userId" = $1',
      [userId],
    );

    // Level up check (every 1000 XP = 1 level)
    const newLevel = Math.floor(stats.xp / 1000) + 1;
    if (newLevel > stats.level) {
      await this.db.execute(
        `UPDATE gamification SET level = $1, "updatedAt" = NOW() WHERE "userId" = $2`,
        [newLevel, userId],
      );
    }

    // Record reward
    const rewardId = uuidv4();
    await this.db.execute(
      `INSERT INTO rewards (id, "userId", "sessionId", type, "xpAmount", "coinAmount", reason, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [rewardId, userId, sessionId || null, 'SESSION', xp, coins, reason],
    );

    return stats;
  }

  async updateStreak(userId: string) {
    const stats = await this.db.queryOne(
      'SELECT * FROM gamification WHERE "userId" = $1',
      [userId],
    );
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

    await this.db.execute(
      `UPDATE gamification SET streak = $1, "longestStreak" = $2, "lastActiveDate" = NOW(), "updatedAt" = NOW()
       WHERE "userId" = $3`,
      [newStreak, longestStreak, userId],
    );

    // Daily reward for maintaining streak
    if (newStreak > 0) {
      const dailyXP = Math.min(50 + newStreak * 10, 200);
      const dailyCoins = Math.min(20 + newStreak * 5, 100);
      const rewardId = uuidv4();
      await this.db.execute(
        `INSERT INTO rewards (id, "userId", type, "xpAmount", "coinAmount", reason, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [rewardId, userId, 'DAILY', dailyXP, dailyCoins, `Day ${newStreak} streak bonus`],
      );
    }

    return { streak: newStreak, longestStreak };
  }

  async checkAchievements(userId: string) {
    const sessionCount = await this.db.queryOne(
      `SELECT COUNT(*) as count FROM sessions WHERE "userId" = $1 AND status = 'COMPLETED'`,
      [userId],
    );
    const stats = await this.db.queryOne(
      'SELECT * FROM gamification WHERE "userId" = $1',
      [userId],
    );
    const earned = await this.db.query(
      'SELECT "achievementId" FROM user_achievements WHERE "userId" = $1',
      [userId],
    );
    const earnedIds = earned.map((e: any) => e.achievementId);

    const allAchievements = await this.db.query(
      'SELECT * FROM achievement WHERE "isActive" = true',
      [],
    );
    const newlyEarned: any[] = [];

    for (const achievement of allAchievements) {
      if (earnedIds.includes(achievement.id)) continue;
      const criteria = typeof achievement.criteria === 'string' ? JSON.parse(achievement.criteria) : achievement.criteria;

      let earned = false;
      if (criteria.type === 'sessions_completed' && (sessionCount?.count || 0) >= criteria.threshold) earned = true;
      if (criteria.type === 'streak_days' && (stats?.streak || 0) >= criteria.threshold) earned = true;
      if (criteria.type === 'xp_total' && (stats?.xp || 0) >= criteria.threshold) earned = true;
      if (criteria.type === 'level' && (stats?.level || 1) >= criteria.threshold) earned = true;

      if (earned) {
        const uaId = uuidv4();
        await this.db.execute(
          `INSERT INTO user_achievements (id, "userId", "achievementId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [uaId, userId, achievement.id],
        );
        await this.addXPAndCoins(userId, achievement.xpReward, achievement.coinReward, `Achievement: ${achievement.name}`);
        newlyEarned.push(achievement);
      }
    }

    return newlyEarned;
  }

  async getLeaderboard(period: string = 'weekly', limit: number = 10) {
    const users = await this.db.query(
      `SELECT g.*, u.id, u.name, u.avatar FROM gamification g
       JOIN users u ON g."userId" = u.id
       ORDER BY g.xp DESC LIMIT $1`,
      [limit],
    );
    return users.map((u: any, i: number) => ({
      rank: i + 1,
      userId: u.userId,
      name: u.name,
      avatar: u.avatar,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
    }));
  }

  async getMissions() {
    return this.db.query(
      'SELECT * FROM mission WHERE "isActive" = true',
      [],
    );
  }

  async getAllAchievements() {
    return this.db.query(
      'SELECT * FROM achievement WHERE "isActive" = true',
      [],
    );
  }
}
