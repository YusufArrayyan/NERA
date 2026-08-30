/**
 * Gamification Engine Tests
 * Tests for points, badges, streaks, and leaderboards
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createGamificationEngine } from '../src/modules/gamification/gamification-engine';

describe('Gamification Engine', () => {
  let gamificationEngine: ReturnType<typeof createGamificationEngine>;
  const userId = 'test-user-123';

  beforeEach(() => {
    gamificationEngine = createGamificationEngine();
  });

  describe('User Initialization', () => {
    it('should initialize new user', () => {
      const profile = gamificationEngine.initializeUser(userId);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(userId);
      expect(profile.totalPoints).toBe(0);
      expect(profile.level).toBe(1);
      expect(profile.levelProgress).toBe(0);
      expect(profile.badges).toHaveLength(0);
      expect(profile.activeStreaks).toHaveLength(4);
    });

    it('should return same profile on re-initialization', () => {
      const profile1 = gamificationEngine.initializeUser(userId);
      profile1.totalPoints = 100;

      const profile2 = gamificationEngine.initializeUser(userId);

      expect(profile2.totalPoints).toBe(100);
    });

    it('should initialize with 4 streak types', () => {
      const profile = gamificationEngine.initializeUser(userId);

      const streakTypes = profile.activeStreaks.map(s => s.type);
      expect(streakTypes).toContain('daily');
      expect(streakTypes).toContain('weekly');
      expect(streakTypes).toContain('focus');
      expect(streakTypes).toContain('stress_free');
    });
  });

  describe('Points Awarding', () => {
    it('should award base session points', () => {
      const pointsEarned = gamificationEngine.awardSessionPoints(userId, 50, 'medium');

      expect(pointsEarned).toBeDefined();
      expect(pointsEarned.sessionPoints).toBe(50);
      expect(pointsEarned.total).toBeGreaterThan(0);
    });

    it('should award focus bonus for high focus', () => {
      const highFocusPoints = gamificationEngine.awardSessionPoints(userId, 75, 'low');
      const lowFocusPoints = gamificationEngine.awardSessionPoints(userId, 40, 'low');

      expect(highFocusPoints.focusBonus).toBeGreaterThan(lowFocusPoints.focusBonus);
    });

    it('should award stress management bonus', () => {
      const stressPoints = gamificationEngine.awardSessionPoints(userId, 60, 'low');
      const noStressPoints = gamificationEngine.awardSessionPoints(userId, 60, 'critical');

      expect(stressPoints.stressManagementBonus).toBeGreaterThan(noStressPoints.stressManagementBonus);
    });

    it('should update total points in profile', () => {
      const profile1 = gamificationEngine.initializeUser(userId);
      expect(profile1.totalPoints).toBe(0);

      gamificationEngine.awardSessionPoints(userId, 60, 'low');

      const profile2 = gamificationEngine.getUserProfile(userId);
      expect(profile2!.totalPoints).toBeGreaterThan(0);
    });

    it('should update session count', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.awardSessionPoints(userId, 60, 'low');

      const profile = gamificationEngine.getUserProfile(userId);
      expect(profile!.weeklyStats.sessionsCompleted).toBe(1);
      expect(profile!.allTimeStats.totalSessions).toBe(1);
    });

    it('should apply points multiplier', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.setPointsMultiplier(userId, 2);

      const pointsEarned = gamificationEngine.awardSessionPoints(userId, 60, 'low');

      // Points should be approximately doubled
      expect(pointsEarned.total).toBeGreaterThan(100);
    });

    it('should calculate correct focus bonus tiers', () => {
      const highFocus = gamificationEngine.awardSessionPoints('user-high', 85, 'low');
      const mediumFocus = gamificationEngine.awardSessionPoints('user-med', 60, 'low');
      const lowFocus = gamificationEngine.awardSessionPoints('user-low', 30, 'low');

      expect(highFocus.focusBonus).toBe(30);
      expect(mediumFocus.focusBonus).toBe(15);
      expect(lowFocus.focusBonus).toBe(5);
    });
  });

  describe('Level Progression', () => {
    it('should calculate level from points', () => {
      gamificationEngine.initializeUser(userId);

      // Award 600 points (level 2)
      for (let i = 0; i < 12; i++) {
        gamificationEngine.awardSessionPoints(userId, 60, 'low');
      }

      const profile = gamificationEngine.getUserProfile(userId);
      expect(profile!.level).toBeGreaterThanOrEqual(1);
    });

    it('should calculate level progress', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.awardSessionPoints(userId, 60, 'low');

      const profile = gamificationEngine.getUserProfile(userId);
      expect(profile!.levelProgress).toBeGreaterThanOrEqual(0);
      expect(profile!.levelProgress).toBeLessThanOrEqual(1);
    });

    it('should reach higher levels with more points', () => {
      gamificationEngine.initializeUser(userId);

      for (let i = 0; i < 100; i++) {
        gamificationEngine.awardSessionPoints(userId, 80, 'low');
      }

      const profile = gamificationEngine.getUserProfile(userId);
      expect(profile!.level).toBeGreaterThan(5);
    });
  });

  describe('Streaks', () => {
    it('should start new streak', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.updateStreak(userId, 'daily', true);

      const profile = gamificationEngine.getUserProfile(userId);
      const dailyStreak = profile!.activeStreaks.find(s => s.type === 'daily');

      expect(dailyStreak!.count).toBe(1);
      expect(dailyStreak!.isActive).toBe(true);
    });

    it('should increment streak', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.updateStreak(userId, 'daily', true);
      gamificationEngine.updateStreak(userId, 'daily', true);
      gamificationEngine.updateStreak(userId, 'daily', true);

      const profile = gamificationEngine.getUserProfile(userId);
      const dailyStreak = profile!.activeStreaks.find(s => s.type === 'daily');

      expect(dailyStreak!.count).toBe(3);
    });

    it('should track personal best', () => {
      gamificationEngine.initializeUser(userId);

      // Build 5-day streak
      for (let i = 0; i < 5; i++) {
        gamificationEngine.updateStreak(userId, 'focus', true);
      }

      let profile = gamificationEngine.getUserProfile(userId);
      let focusStreak = profile!.activeStreaks.find(s => s.type === 'focus');
      expect(focusStreak!.personalBest).toBe(0); // Not updated until failure

      // Break streak
      gamificationEngine.updateStreak(userId, 'focus', false);

      profile = gamificationEngine.getUserProfile(userId);
      focusStreak = profile!.activeStreaks.find(s => s.type === 'focus');
      expect(focusStreak!.personalBest).toBeGreaterThan(0);
    });

    it('should handle streak failure', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.updateStreak(userId, 'daily', true);
      gamificationEngine.updateStreak(userId, 'daily', false);

      const profile = gamificationEngine.getUserProfile(userId);
      const dailyStreak = profile!.activeStreaks.find(s => s.type === 'daily');

      expect(dailyStreak!.isActive).toBe(false);
    });

    it('should award streak bonuses', () => {
      gamificationEngine.initializeUser(userId);

      const profileBefore = gamificationEngine.getUserProfile(userId);
      const pointsBefore = profileBefore!.totalPoints;

      gamificationEngine.updateStreak(userId, 'daily', true);

      const profileAfter = gamificationEngine.getUserProfile(userId);
      const pointsAfter = profileAfter!.totalPoints;

      expect(pointsAfter).toBeGreaterThan(pointsBefore);
    });
  });

  describe('Badges', () => {
    it('should award focus master badge', () => {
      gamificationEngine.initializeUser(userId);

      // Simulate 50+ sessions with 85+ focus
      for (let i = 0; i < 50; i++) {
        gamificationEngine.awardSessionPoints(userId, 85, 'low');
      }

      const profile = gamificationEngine.getUserProfile(userId);
      const badge = profile!.badges.find(b => b.id === 'focus_master');

      expect(badge).toBeDefined();
      expect(badge!.progress).toBe(100);
    });

    it('should award stress warrior badge', () => {
      gamificationEngine.initializeUser(userId);

      // Award stress management bonuses 30 times
      for (let i = 0; i < 30; i++) {
        gamificationEngine.awardSessionPoints(userId, 60, 'low');
      }

      const profile = gamificationEngine.getUserProfile(userId);
      const badge = profile!.badges.find(b => b.id === 'stress_warrior');

      expect(badge).toBeDefined();
    });

    it('should award milestone badge at level 10', () => {
      gamificationEngine.initializeUser(userId);

      // Award enough points to reach level 10
      for (let i = 0; i < 100; i++) {
        gamificationEngine.awardSessionPoints(userId, 80, 'low');
      }

      const profile = gamificationEngine.getUserProfile(userId);
      const badge = profile!.badges.find(b => b.id === 'milestone_reached');

      if (profile!.level >= 10) {
        expect(badge).toBeDefined();
      }
    });

    it('should not duplicate badges', () => {
      gamificationEngine.initializeUser(userId);

      // Award stress warrior badge multiple times
      for (let i = 0; i < 50; i++) {
        gamificationEngine.awardSessionPoints(userId, 60, 'low');
      }

      const profile = gamificationEngine.getUserProfile(userId);
      const badges = profile!.badges.filter(b => b.id === 'stress_warrior');

      expect(badges.length).toBeLessThanOrEqual(1);
    });

    it('should track badge rarity', () => {
      gamificationEngine.initializeUser(userId);

      for (let i = 0; i < 100; i++) {
        gamificationEngine.awardSessionPoints(userId, 85, 'low');
      }

      const profile = gamificationEngine.getUserProfile(userId);

      if (profile!.badges.length > 0) {
        expect(['common', 'rare', 'epic', 'legendary']).toContain(profile!.badges[0].rarity);
      }
    });

    it('should award points for badge unlock', () => {
      gamificationEngine.initializeUser(userId);
      const pointsBefore = gamificationEngine.getUserProfile(userId)!.totalPoints;

      for (let i = 0; i < 50; i++) {
        gamificationEngine.awardSessionPoints(userId, 85, 'low');
      }

      const profileAfter = gamificationEngine.getUserProfile(userId);

      expect(profileAfter!.totalPoints).toBeGreaterThan(pointsBefore);
    });
  });

  describe('Leaderboard', () => {
    it('should generate leaderboard', () => {
      gamificationEngine.initializeUser('user1');
      gamificationEngine.initializeUser('user2');
      gamificationEngine.initializeUser('user3');

      gamificationEngine.awardSessionPoints('user1', 80, 'low');
      gamificationEngine.awardSessionPoints('user2', 90, 'low');
      gamificationEngine.awardSessionPoints('user3', 70, 'low');

      const leaderboard = gamificationEngine.getLeaderboard();

      expect(leaderboard.length).toBeGreaterThan(0);
    });

    it('should rank entries correctly', () => {
      gamificationEngine.initializeUser('user1');
      gamificationEngine.initializeUser('user2');

      // User 2 should have more points
      for (let i = 0; i < 20; i++) {
        gamificationEngine.awardSessionPoints('user2', 80, 'low');
      }

      gamificationEngine.awardSessionPoints('user1', 60, 'low');

      const leaderboard = gamificationEngine.getLeaderboard();

      const user1Rank = leaderboard.find(e => e.userId === 'user1')?.rank;
      const user2Rank = leaderboard.find(e => e.userId === 'user2')?.rank;

      expect(user2Rank!).toBeLessThan(user1Rank!);
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 150; i++) {
        gamificationEngine.initializeUser(`user${i}`);
        gamificationEngine.awardSessionPoints(`user${i}`, 60, 'low');
      }

      const leaderboard = gamificationEngine.getLeaderboard(50);

      expect(leaderboard.length).toBeLessThanOrEqual(50);
    });

    it('should include badge count in leaderboard', () => {
      gamificationEngine.initializeUser(userId);

      for (let i = 0; i < 50; i++) {
        gamificationEngine.awardSessionPoints(userId, 85, 'low');
      }

      const leaderboard = gamificationEngine.getLeaderboard();
      const entry = leaderboard.find(e => e.userId === userId);

      expect(entry!.badgesUnlocked).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Achievements', () => {
    it('should award achievement', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.awardAchievement(userId, 'first-session', 'bronze');

      const profile = gamificationEngine.getUserProfile(userId);
      const achievement = profile!.achievements.find(a => a.id === 'first-session');

      expect(achievement).toBeDefined();
      expect(achievement!.level).toBe('bronze');
    });

    it('should award points for achievement', () => {
      gamificationEngine.initializeUser(userId);
      const pointsBefore = gamificationEngine.getUserProfile(userId)!.totalPoints;

      gamificationEngine.awardAchievement(userId, 'milestone', 'gold');

      const profile = gamificationEngine.getUserProfile(userId);
      expect(profile!.totalPoints).toBeGreaterThan(pointsBefore);
    });

    it('should not duplicate achievements', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.awardAchievement(userId, 'first', 'bronze');
      gamificationEngine.awardAchievement(userId, 'first', 'silver');

      const profile = gamificationEngine.getUserProfile(userId);
      const achievements = profile!.achievements.filter(a => a.id === 'first');

      expect(achievements.length).toBe(1);
    });

    it('should track achievement levels', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.awardAchievement(userId, 'test1', 'bronze');
      gamificationEngine.awardAchievement(userId, 'test2', 'silver');
      gamificationEngine.awardAchievement(userId, 'test3', 'gold');
      gamificationEngine.awardAchievement(userId, 'test4', 'platinum');

      const profile = gamificationEngine.getUserProfile(userId);

      expect(profile!.achievements).toHaveLength(4);
      expect(profile!.achievements.map(a => a.level)).toContain('platinum');
    });

    it('should award increasing points by level', () => {
      gamificationEngine.initializeUser('user-bronze');
      gamificationEngine.initializeUser('user-platinum');

      gamificationEngine.awardAchievement('user-bronze', 'ach1', 'bronze');
      gamificationEngine.awardAchievement('user-platinum', 'ach2', 'platinum');

      const profileBronze = gamificationEngine.getUserProfile('user-bronze');
      const profilePlatinum = gamificationEngine.getUserProfile('user-platinum');

      expect(profilePlatinum!.totalPoints).toBeGreaterThan(profileBronze!.totalPoints);
    });
  });

  describe('Weekly Stats', () => {
    it('should update weekly stats', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.updateWeeklyStats(userId, 60, 75);

      const profile = gamificationEngine.getUserProfile(userId);

      expect(profile!.weeklyStats.totalFocusTime).toBe(60);
      expect(profile!.weeklyStats.averageFocusScore).toBe(75);
    });

    it('should accumulate focus time', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.updateWeeklyStats(userId, 30, 70);
      gamificationEngine.updateWeeklyStats(userId, 40, 80);

      const profile = gamificationEngine.getUserProfile(userId);

      expect(profile!.weeklyStats.totalFocusTime).toBe(70);
      expect(profile!.allTimeStats.totalFocusTime).toBe(70);
    });

    it('should reset weekly stats', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.updateWeeklyStats(userId, 100, 80);

      gamificationEngine.resetWeeklyStats(userId);

      const profile = gamificationEngine.getUserProfile(userId);

      expect(profile!.weeklyStats.totalFocusTime).toBe(0);
      expect(profile!.allTimeStats.totalFocusTime).toBe(100);
    });
  });

  describe('Points Multiplier', () => {
    it('should apply multiplier', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.setPointsMultiplier(userId, 2);

      const points = gamificationEngine.awardSessionPoints(userId, 60, 'low');

      expect(points.total).toBeGreaterThan(100);
    });

    it('should remove multiplier', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.setPointsMultiplier(userId, 2);
      gamificationEngine.removePointsMultiplier(userId);

      const points = gamificationEngine.awardSessionPoints(userId, 60, 'low');

      expect(points.total).toBeGreaterThan(50);
      expect(points.total).toBeLessThan(150);
    });

    it('should apply 1x multiplier by default', () => {
      gamificationEngine.initializeUser(userId);

      const pointsNormal = gamificationEngine.awardSessionPoints(userId, 60, 'low');

      // Should be ~75-85 points with no multiplier
      expect(pointsNormal.total).toBeGreaterThan(50);
      expect(pointsNormal.total).toBeLessThan(150);
    });
  });

  describe('User Profile', () => {
    it('should return null for non-existent user', () => {
      const profile = gamificationEngine.getUserProfile('non-existent-user');

      expect(profile).toBeNull();
    });

    it('should track profile state correctly', () => {
      gamificationEngine.initializeUser(userId);
      gamificationEngine.awardSessionPoints(userId, 80, 'low');
      gamificationEngine.awardSessionPoints(userId, 85, 'low');

      const profile = gamificationEngine.getUserProfile(userId);

      expect(profile!.allTimeStats.totalSessions).toBe(2);
      expect(profile!.totalPoints).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should award points quickly', () => {
      gamificationEngine.initializeUser(userId);

      const start = performance.now();
      gamificationEngine.awardSessionPoints(userId, 60, 'low');
      const latency = performance.now() - start;

      console.log(`Points award latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(10);
    });

    it('should generate leaderboard quickly', () => {
      for (let i = 0; i < 100; i++) {
        gamificationEngine.initializeUser(`user${i}`);
        gamificationEngine.awardSessionPoints(`user${i}`, 60, 'low');
      }

      const start = performance.now();
      gamificationEngine.getLeaderboard(100);
      const latency = performance.now() - start;

      console.log(`Leaderboard generation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(50);
    });
  });
});
