/**
 * Gamification Engine
 * Points, badges, streaks, leaderboards, and achievement tracking
 */

export type BadgeType =
  | 'focus_master'
  | 'stress_warrior'
  | 'consistency_hero'
  | 'speedrunner'
  | 'comeback_kid'
  | 'social_butterfly'
  | 'milestone_reached'
  | 'early_bird'
  | 'night_owl'
  | 'perfectionist';

export type AchievementLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface PointsEarned {
  sessionPoints: number; // Base points for completing session
  focusBonus: number; // Bonus for high focus
  consistencyBonus: number; // Bonus for streak
  stressManagementBonus: number; // Bonus for handling stress
  socialBonus: number; // Bonus from social activities
  total: number;
}

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  icon: string; // Emoji or icon identifier
  unlockedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number; // 0-100 if not yet unlocked
}

export interface Streak {
  type: 'daily' | 'weekly' | 'focus' | 'stress_free';
  count: number;
  startDate: number;
  lastActivity: number;
  personalBest: number;
  isActive: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  level: AchievementLevel;
  pointsReward: number;
  unlockedAt?: number;
  progress: number; // 0-100
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  rank: number;
  focusScore: number;
  streakCount: number;
  badgesUnlocked: number;
  lastActivityTime: number;
}

export interface UserGamificationProfile {
  userId: string;
  totalPoints: number;
  level: number; // 1-100
  levelProgress: number; // 0-100 to next level
  badges: Badge[];
  activeStreaks: Streak[];
  achievements: Achievement[];
  weeklyStats: {
    sessionsCompleted: number;
    totalFocusTime: number; // minutes
    averageFocusScore: number;
    stressManagementSuccesses: number;
  };
  allTimeStats: {
    totalSessions: number;
    totalFocusTime: number;
    bestStreak: number;
    challengesCompleted: number;
    friendsAdded: number;
  };
  lastClaimed: number; // Last reward claim time
}

/**
 * Gamification Engine
 */
export class GamificationEngine {
  private userProfiles: Map<string, UserGamificationProfile> = new Map();
  private leaderboard: LeaderboardEntry[] = [];
  private pointsMultiplier: Map<string, number> = new Map();

  private pointsConfig = {
    baseSessionPoints: 50,
    focusBonus: {
      high: 30, // 70+ focus score
      medium: 15, // 50-70
      low: 5, // <50
    },
    streakBonus: {
      daily: 5,
      weekly: 25,
      focus: 10,
      stressFree: 15,
    },
    stressManagementBonus: 20,
    socialBonus: {
      friendAdded: 10,
      challengeJoined: 15,
      challengeWon: 50,
    },
  };

  private badgeThresholds = {
    focus_master: { focusScore: 85, sessions: 50 }, // 85+ avg focus over 50+ sessions
    stress_warrior: { stressReductions: 30 }, // Successfully reduced stress 30 times
    consistency_hero: { dayStreak: 30 }, // 30-day streak
    speedrunner: { focusTime: 240 }, // 4 hours of deep focus
    comeback_kid: { stressRecoveries: 20 }, // Recovered from high stress 20 times
    social_butterfly: { friends: 10 }, // 10+ friends
    milestone_reached: { level: 10 }, // Reached level 10
    early_bird: { morningFocus: 100 }, // 100 minutes morning sessions
    night_owl: { eveningFocus: 100 }, // 100 minutes evening sessions
    perfectionist: { perfectSessions: 10 }, // 10 perfect 100-focus sessions
  };

  /**
   * Initialize or get user gamification profile
   */
  initializeUser(userId: string): UserGamificationProfile {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!;
    }

    const profile: UserGamificationProfile = {
      userId,
      totalPoints: 0,
      level: 1,
      levelProgress: 0,
      badges: [],
      activeStreaks: [
        { type: 'daily', count: 0, startDate: Date.now(), lastActivity: 0, personalBest: 0, isActive: false },
        { type: 'weekly', count: 0, startDate: Date.now(), lastActivity: 0, personalBest: 0, isActive: false },
        { type: 'focus', count: 0, startDate: Date.now(), lastActivity: 0, personalBest: 0, isActive: false },
        { type: 'stress_free', count: 0, startDate: Date.now(), lastActivity: 0, personalBest: 0, isActive: false },
      ],
      achievements: [],
      weeklyStats: {
        sessionsCompleted: 0,
        totalFocusTime: 0,
        averageFocusScore: 0,
        stressManagementSuccesses: 0,
      },
      allTimeStats: {
        totalSessions: 0,
        totalFocusTime: 0,
        bestStreak: 0,
        challengesCompleted: 0,
        friendsAdded: 0,
      },
      lastClaimed: 0,
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Award points for session completion
   */
  awardSessionPoints(userId: string, focusScore: number, stressLevel: string): PointsEarned {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = this.initializeUser(userId);
    }

    const pointsEarned: PointsEarned = {
      sessionPoints: this.pointsConfig.baseSessionPoints,
      focusBonus: 0,
      consistencyBonus: 0,
      stressManagementBonus: 0,
      socialBonus: 0,
      total: 0,
    };

    // Focus bonus
    if (focusScore >= 70) {
      pointsEarned.focusBonus = this.pointsConfig.focusBonus.high;
    } else if (focusScore >= 50) {
      pointsEarned.focusBonus = this.pointsConfig.focusBonus.medium;
    } else {
      pointsEarned.focusBonus = this.pointsConfig.focusBonus.low;
    }

    // Consistency bonus (active streaks)
    const activeStreaks = profile.activeStreaks.filter(s => s.isActive);
    pointsEarned.consistencyBonus = activeStreaks.length * this.pointsConfig.streakBonus.daily;

    // Stress management bonus
    if (stressLevel === 'low' || stressLevel === 'medium') {
      pointsEarned.stressManagementBonus = this.pointsConfig.stressManagementBonus;
    }

    // Apply multiplier
    const multiplier = this.pointsMultiplier.get(userId) || 1;
    pointsEarned.total = Math.round(
      (pointsEarned.sessionPoints + pointsEarned.focusBonus + pointsEarned.consistencyBonus + pointsEarned.stressManagementBonus) *
        multiplier
    );

    // Update profile
    profile.totalPoints += pointsEarned.total;
    profile.weeklyStats.sessionsCompleted++;
    profile.allTimeStats.totalSessions++;

    // Check level up
    this.updateLevel(profile);

    // Check badge unlocks
    this.checkBadgeUnlocks(userId, focusScore, stressLevel);

    return pointsEarned;
  }

  /**
   * Update level based on points
   */
  private updateLevel(profile: UserGamificationProfile): void {
    const pointsPerLevel = 500;
    const newLevel = Math.floor(profile.totalPoints / pointsPerLevel) + 1;

    if (newLevel > profile.level) {
      profile.level = newLevel;
      profile.levelProgress = 0;
    } else {
      profile.levelProgress = (profile.totalPoints % pointsPerLevel) / pointsPerLevel;
    }
  }

  /**
   * Update streak
   */
  updateStreak(userId: string, streakType: 'daily' | 'weekly' | 'focus' | 'stress_free', success: boolean): void {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = this.initializeUser(userId);
    }

    const streak = profile.activeStreaks.find(s => s.type === streakType);
    if (!streak) return;

    if (success) {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      // Check if streak should continue
      if (streak.lastActivity > 0 && now - streak.lastActivity > dayMs && streakType === 'daily') {
        // Streak broken
        streak.personalBest = Math.max(streak.personalBest, streak.count);
        streak.count = 1;
      } else if (streak.lastActivity > 0) {
        streak.count++;
      } else {
        streak.count = 1;
      }

      streak.lastActivity = now;
      streak.isActive = true;

      // Award streak bonus
      const bonusPoints = this.pointsConfig.streakBonus[streakType];
      profile.totalPoints += bonusPoints;
      this.updateLevel(profile);
    } else {
      if (streak.count > 0) {
        streak.personalBest = Math.max(streak.personalBest, streak.count);
      }
      streak.isActive = false;
    }
  }

  /**
   * Check and unlock badges
   */
  private checkBadgeUnlocks(userId: string, focusScore: number, stressLevel: string): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Focus Master: 85+ avg focus over 50+ sessions
    if (focusScore >= 85 && profile.allTimeStats.totalSessions >= 50) {
      this.unlockBadge(userId, 'focus_master');
    }

    // Perfectionist: 10 sessions with 100 focus
    if (focusScore === 100) {
      const perfectCount = this.getPerfectSessionCount(userId);
      if (perfectCount >= 10) {
        this.unlockBadge(userId, 'perfectionist');
      }
    }

    // Stress Warrior: 30 successful stress reductions
    if (stressLevel === 'low' || stressLevel === 'medium') {
      profile.weeklyStats.stressManagementSuccesses++;
      if (profile.weeklyStats.stressManagementSuccesses >= 30) {
        this.unlockBadge(userId, 'stress_warrior');
      }
    }

    // Milestone Reached: Level 10+
    if (profile.level >= 10) {
      this.unlockBadge(userId, 'milestone_reached');
    }
  }

  /**
   * Unlock badge
   */
  private unlockBadge(userId: string, badgeId: BadgeType): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Check if already unlocked
    if (profile.badges.find(b => b.id === badgeId)) return;

    const badgeConfig = this.getBadgeConfig(badgeId);
    const badge: Badge = {
      id: badgeId,
      name: badgeConfig.name,
      description: badgeConfig.description,
      icon: badgeConfig.icon,
      unlockedAt: Date.now(),
      rarity: badgeConfig.rarity,
      progress: 100,
    };

    profile.badges.push(badge);

    // Award points for badge
    const badgePoints = badgeConfig.rarity === 'legendary' ? 100 : badgeConfig.rarity === 'epic' ? 50 : 25;
    profile.totalPoints += badgePoints;
    this.updateLevel(profile);
  }

  /**
   * Get badge configuration
   */
  private getBadgeConfig(badgeId: BadgeType) {
    const configs: Record<BadgeType, any> = {
      focus_master: {
        name: '🎯 Focus Master',
        description: 'Maintained 85+ focus score over 50+ sessions',
        icon: '🎯',
        rarity: 'epic',
      },
      stress_warrior: {
        name: '⚔️ Stress Warrior',
        description: 'Successfully managed stress 30 times',
        icon: '⚔️',
        rarity: 'epic',
      },
      consistency_hero: {
        name: '🏆 Consistency Hero',
        description: 'Maintained 30-day streak',
        icon: '🏆',
        rarity: 'legendary',
      },
      speedrunner: {
        name: '⚡ Speedrunner',
        description: 'Achieved 4 hours of deep focus',
        icon: '⚡',
        rarity: 'rare',
      },
      comeback_kid: {
        name: '💪 Comeback Kid',
        description: 'Recovered from high stress 20 times',
        icon: '💪',
        rarity: 'rare',
      },
      social_butterfly: {
        name: '🦋 Social Butterfly',
        description: 'Added 10+ friends',
        icon: '🦋',
        rarity: 'common',
      },
      milestone_reached: {
        name: '🎁 Milestone Reached',
        description: 'Reached Level 10',
        icon: '🎁',
        rarity: 'rare',
      },
      early_bird: {
        name: '🌅 Early Bird',
        description: 'Completed 100 minutes of morning sessions',
        icon: '🌅',
        rarity: 'common',
      },
      night_owl: {
        name: '🌙 Night Owl',
        description: 'Completed 100 minutes of evening sessions',
        icon: '🌙',
        rarity: 'common',
      },
      perfectionist: {
        name: '✨ Perfectionist',
        description: 'Achieved 100 focus score 10 times',
        icon: '✨',
        rarity: 'legendary',
      },
    };

    return configs[badgeId];
  }

  /**
   * Get user profile
   */
  getUserProfile(userId: string): UserGamificationProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit: number = 100): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    for (const [userId, profile] of this.userProfiles) {
      entries.push({
        userId,
        username: `User${userId.slice(-4)}`, // Placeholder username
        totalPoints: profile.totalPoints,
        rank: 0,
        focusScore: profile.weeklyStats.averageFocusScore,
        streakCount: Math.max(...profile.activeStreaks.map(s => s.count)),
        badgesUnlocked: profile.badges.length,
        lastActivityTime: Math.max(...profile.activeStreaks.map(s => s.lastActivity)),
      });
    }

    // Sort by points
    entries.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries.slice(0, limit);
  }

  /**
   * Get count of perfect sessions (100 focus score)
   */
  private getPerfectSessionCount(userId: string): number {
    // This would typically query from session history
    // For now, returning 0 (would be populated from actual data)
    return 0;
  }

  /**
   * Set points multiplier (e.g., for events)
   */
  setPointsMultiplier(userId: string, multiplier: number): void {
    this.pointsMultiplier.set(userId, multiplier);
  }

  /**
   * Remove points multiplier
   */
  removePointsMultiplier(userId: string): void {
    this.pointsMultiplier.delete(userId);
  }

  /**
   * Award achievement
   */
  awardAchievement(userId: string, achievementId: string, level: AchievementLevel): void {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = this.initializeUser(userId);
    }

    // Check if already unlocked
    if (profile.achievements.find(a => a.id === achievementId)) return;

    const pointsMap: Record<AchievementLevel, number> = {
      bronze: 25,
      silver: 50,
      gold: 100,
      platinum: 200,
    };

    const achievement: Achievement = {
      id: achievementId,
      name: `Achievement: ${achievementId}`,
      description: `Unlocked ${level} achievement`,
      level,
      pointsReward: pointsMap[level],
      unlockedAt: Date.now(),
      progress: 100,
    };

    profile.achievements.push(achievement);
    profile.totalPoints += achievement.pointsReward;
    this.updateLevel(profile);
  }

  /**
   * Update weekly stats
   */
  updateWeeklyStats(userId: string, focusTime: number, focusScore: number): void {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = this.initializeUser(userId);
    }

    profile.weeklyStats.totalFocusTime += focusTime;
    profile.weeklyStats.averageFocusScore = focusScore;
    profile.allTimeStats.totalFocusTime += focusTime;
  }

  /**
   * Reset weekly stats
   */
  resetWeeklyStats(userId: string): void {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Archive to all-time
    profile.allTimeStats.totalSessions += profile.weeklyStats.sessionsCompleted;

    // Reset
    profile.weeklyStats = {
      sessionsCompleted: 0,
      totalFocusTime: 0,
      averageFocusScore: 0,
      stressManagementSuccesses: 0,
    };
  }
}

/**
 * Create gamification engine instance
 */
export function createGamificationEngine(): GamificationEngine {
  return new GamificationEngine();
}
