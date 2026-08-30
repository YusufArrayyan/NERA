/**
 * Multiplayer Engine Tests
 * Tests for social features, challenges, and collaboration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMultiplayerEngine } from '../src/modules/social/multiplayer-engine';

describe('Multiplayer Engine', () => {
  let engine: ReturnType<typeof createMultiplayerEngine>;
  const userId1 = 'user-1';
  const userId2 = 'user-2';
  const userId3 = 'user-3';

  beforeEach(() => {
    engine = createMultiplayerEngine();
  });

  describe('User Profiles', () => {
    it('should initialize user profile', () => {
      const profile = engine.initializeUserProfile(userId1, 'Alice', '👩');

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(userId1);
      expect(profile.username).toBe('Alice');
      expect(profile.avatar).toBe('👩');
      expect(profile.level).toBe(1);
      expect(profile.totalPoints).toBe(0);
      expect(profile.friendCount).toBe(0);
    });

    it('should get user profile', () => {
      engine.initializeUserProfile(userId1, 'Bob');

      const profile = engine.getUserProfile(userId1);
      expect(profile).toBeDefined();
      expect(profile?.username).toBe('Bob');
    });

    it('should update user profile', () => {
      engine.initializeUserProfile(userId1, 'Charlie');

      engine.updateUserProfile(userId1, { bio: 'A focused learner', level: 5 });

      const profile = engine.getUserProfile(userId1);
      expect(profile?.bio).toBe('A focused learner');
      expect(profile?.level).toBe(5);
    });

    it('should return null for non-existent user', () => {
      const profile = engine.getUserProfile('non-existent');

      expect(profile).toBeUndefined();
    });
  });

  describe('Friend System', () => {
    beforeEach(() => {
      engine.initializeUserProfile(userId1, 'Alice');
      engine.initializeUserProfile(userId2, 'Bob');
      engine.initializeUserProfile(userId3, 'Charlie');
    });

    it('should send friend request', () => {
      const request = engine.sendFriendRequest(userId1, userId2, 'Hi Bob!');

      expect(request).toBeDefined();
      expect(request.senderId).toBe(userId1);
      expect(request.recipientId).toBe(userId2);
      expect(request.status).toBe('pending');
      expect(request.message).toBe('Hi Bob!');
    });

    it('should accept friend request', () => {
      const request = engine.sendFriendRequest(userId1, userId2);
      engine.acceptFriendRequest(request.requestId);

      const profile1 = engine.getUserProfile(userId1);
      const profile2 = engine.getUserProfile(userId2);

      expect(profile1!.friendCount).toBe(1);
      expect(profile2!.friendCount).toBe(1);
    });

    it('should get friend list', () => {
      const request1 = engine.sendFriendRequest(userId1, userId2);
      engine.acceptFriendRequest(request1.requestId);

      const request2 = engine.sendFriendRequest(userId1, userId3);
      engine.acceptFriendRequest(request2.requestId);

      const friends = engine.getFriends(userId1);

      expect(friends.length).toBe(2);
      expect(friends.map(f => f.userId)).toContain(userId2);
      expect(friends.map(f => f.userId)).toContain(userId3);
    });

    it('should remove friend', () => {
      const request = engine.sendFriendRequest(userId1, userId2);
      engine.acceptFriendRequest(request.requestId);

      engine.removeFriend(userId1, userId2);

      const friends = engine.getFriends(userId1);
      expect(friends.length).toBe(0);
    });

    it('should block user', () => {
      engine.blockUser(userId1, userId2);

      expect(() => engine.sendFriendRequest(userId1, userId2)).toThrow();
    });

    it('should prevent friend request to already-friends', () => {
      const request = engine.sendFriendRequest(userId1, userId2);
      engine.acceptFriendRequest(request.requestId);

      expect(() => engine.sendFriendRequest(userId1, userId2)).toThrow();
    });
  });

  describe('Challenges', () => {
    beforeEach(() => {
      engine.initializeUserProfile(userId1, 'Alice');
      engine.initializeUserProfile(userId2, 'Bob');
      engine.initializeUserProfile(userId3, 'Charlie');
    });

    it('should create challenge', () => {
      const challenge = engine.createChallenge(userId1, 'Focus Master', 'focus_battle', 'focus_score', 80, 7);

      expect(challenge).toBeDefined();
      expect(challenge.title).toBe('Focus Master');
      expect(challenge.type).toBe('focus_battle');
      expect(challenge.duration).toBe(7);
      expect(challenge.status).toBe('active');
      expect(challenge.participants.length).toBe(1);
    });

    it('should join challenge', () => {
      const challenge = engine.createChallenge(userId1, 'Focus Master', 'focus_battle', 'focus_score', 80, 7);

      engine.joinChallenge(userId2, challenge.challengeId);

      const updated = engine.getChallenge(challenge.challengeId);
      expect(updated!.participants.length).toBe(2);
    });

    it('should update challenge progress', () => {
      const challenge = engine.createChallenge(userId1, 'Focus Master', 'focus_battle', 'focus_score', 100, 7);
      engine.joinChallenge(userId2, challenge.challengeId);

      engine.updateChallengeProgress(userId2, challenge.challengeId, 50);

      const participant = engine.getChallenge(challenge.challengeId)!.participants.find(p => p.userId === userId2);
      expect(participant!.currentValue).toBe(50);
    });

    it('should calculate rankings', () => {
      const challenge = engine.createChallenge(userId1, 'Focus Master', 'focus_battle', 'focus_score', 100, 7);
      engine.joinChallenge(userId2, challenge.challengeId);
      engine.joinChallenge(userId3, challenge.challengeId);

      engine.updateChallengeProgress(userId1, challenge.challengeId, 80);
      engine.updateChallengeProgress(userId2, challenge.challengeId, 90);
      engine.updateChallengeProgress(userId3, challenge.challengeId, 70);

      const updated = engine.getChallenge(challenge.challengeId)!;
      const rankings = updated.participants.map(p => p.userId);

      expect(rankings[0]).toBe(userId2); // 90
      expect(rankings[1]).toBe(userId1); // 80
      expect(rankings[2]).toBe(userId3); // 70
    });

    it('should award points by rank', () => {
      const challenge = engine.createChallenge(userId1, 'Focus Master', 'focus_battle', 'focus_score', 100, 7);
      engine.joinChallenge(userId2, challenge.challengeId);

      engine.updateChallengeProgress(userId2, challenge.challengeId, 100);

      const profile = engine.getUserProfile(userId2);
      expect(profile!.challengesWon).toBe(1);
    });

    it('should respect max participants', () => {
      const challenge = engine.createChallenge(userId1, 'Small Race', 'consistency_race', 'sessions', 50, 7, 2);

      engine.joinChallenge(userId2, challenge.challengeId);
      engine.joinChallenge(userId3, challenge.challengeId); // Should be rejected

      const updated = engine.getChallenge(challenge.challengeId);
      expect(updated!.participants.length).toBeLessThanOrEqual(2);
    });

    it('should prevent duplicate joins', () => {
      const challenge = engine.createChallenge(userId1, 'Focus Master', 'focus_battle', 'focus_score', 80, 7);

      engine.joinChallenge(userId2, challenge.challengeId);
      engine.joinChallenge(userId2, challenge.challengeId); // Duplicate

      const updated = engine.getChallenge(challenge.challengeId);
      const user2Count = updated!.participants.filter(p => p.userId === userId2).length;

      expect(user2Count).toBe(1);
    });

    it('should get active challenges', () => {
      engine.createChallenge(userId1, 'Challenge 1', 'focus_battle', 'focus_score', 80, 7);
      engine.createChallenge(userId2, 'Challenge 2', 'consistency_race', 'sessions', 50, 7);

      const active = engine.getActiveChallenges();

      expect(active.length).toBeGreaterThanOrEqual(2);
      expect(active.every(c => c.status === 'active')).toBe(true);
    });
  });

  describe('Teams', () => {
    beforeEach(() => {
      engine.initializeUserProfile(userId1, 'Alice');
      engine.initializeUserProfile(userId2, 'Bob');
      engine.initializeUserProfile(userId3, 'Charlie');
    });

    it('should create team', () => {
      const challenge = engine.createChallenge(userId1, 'Team Race', 'team_goal', 'focus_score', 200, 7, 100, true);
      const team = engine.createTeam(userId1, 'Team Alpha', challenge.challengeId);

      expect(team).toBeDefined();
      expect(team.name).toBe('Team Alpha');
      expect(team.leaderId).toBe(userId1);
      expect(team.members.length).toBe(1);
    });

    it('should add team member', () => {
      const challenge = engine.createChallenge(userId1, 'Team Race', 'team_goal', 'focus_score', 200, 7, 100, true);
      const team = engine.createTeam(userId1, 'Team Alpha', challenge.challengeId);

      engine.addTeamMember(team.teamId, userId2);

      expect(team.members.length).toBe(2);
      expect(team.members).toContain(userId2);
    });

    it('should prevent duplicate team members', () => {
      const challenge = engine.createChallenge(userId1, 'Team Race', 'team_goal', 'focus_score', 200, 7, 100, true);
      const team = engine.createTeam(userId1, 'Team Alpha', challenge.challengeId);

      engine.addTeamMember(team.teamId, userId2);
      engine.addTeamMember(team.teamId, userId2); // Duplicate

      expect(team.members.filter(m => m === userId2).length).toBe(1);
    });

    it('should respect max team size', () => {
      const challenge = engine.createChallenge(userId1, 'Team Race', 'team_goal', 'focus_score', 200, 7, 100, true);
      const team = engine.createTeam(userId1, 'Small Team', challenge.challengeId);

      // Attempt to exceed max size of 10
      for (let i = 0; i < 15; i++) {
        engine.initializeUserProfile(`user-${i}`, `User${i}`);
        engine.addTeamMember(team.teamId, `user-${i}`);
      }

      expect(team.members.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Notifications', () => {
    beforeEach(() => {
      engine.initializeUserProfile(userId1, 'Alice');
      engine.initializeUserProfile(userId2, 'Bob');
    });

    it('should create notification on friend request', () => {
      engine.sendFriendRequest(userId1, userId2);

      const notifs = engine.getNotifications(userId2);
      expect(notifs.length).toBeGreaterThan(0);
      expect(notifs[0].type).toBe('friend_request');
    });

    it('should get user notifications', () => {
      engine.sendFriendRequest(userId1, userId2);
      engine.sendFriendRequest(userId1, userId2);

      const notifs = engine.getNotifications(userId2);
      expect(notifs.length).toBeGreaterThan(0);
    });

    it('should mark notification as read', () => {
      engine.sendFriendRequest(userId1, userId2);

      const notifs = engine.getNotifications(userId2);
      engine.markNotificationAsRead(notifs[0].notificationId);

      const updated = engine.getNotifications(userId2);
      expect(updated[0].read).toBe(true);
    });

    it('should respect notification limit', () => {
      for (let i = 0; i < 150; i++) {
        engine.initializeUserProfile(`user-${i}`, `User${i}`);
        engine.sendFriendRequest(`user-${i}`, userId2);
      }

      const notifs = engine.getNotifications(userId2);
      expect(notifs.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Leaderboards', () => {
    beforeEach(() => {
      engine.initializeUserProfile(userId1, 'Alice');
      engine.initializeUserProfile(userId2, 'Bob');
      engine.initializeUserProfile(userId3, 'Charlie');
    });

    it('should get friend leaderboard', () => {
      const req1 = engine.sendFriendRequest(userId1, userId2);
      engine.acceptFriendRequest(req1.requestId);
      const req2 = engine.sendFriendRequest(userId1, userId3);
      engine.acceptFriendRequest(req2.requestId);

      engine.updateUserProfile(userId2, { totalPoints: 100 });
      engine.updateUserProfile(userId3, { totalPoints: 50 });

      const leaderboard = engine.getFriendLeaderboard(userId1);

      expect(leaderboard.length).toBeGreaterThan(0);
      expect(leaderboard[0].userId).toBe(userId2);
    });

    it('should get global leaderboard', () => {
      engine.updateUserProfile(userId1, { totalPoints: 300 });
      engine.updateUserProfile(userId2, { totalPoints: 200 });
      engine.updateUserProfile(userId3, { totalPoints: 100 });

      const leaderboard = engine.getGlobalLeaderboard();

      expect(leaderboard.length).toBeGreaterThan(0);
      expect(leaderboard[0].userId).toBe(userId1);
      expect(leaderboard[1].userId).toBe(userId2);
      expect(leaderboard[2].userId).toBe(userId3);
    });

    it('should rank leaderboard correctly', () => {
      engine.updateUserProfile(userId1, { totalPoints: 500 });
      engine.updateUserProfile(userId2, { totalPoints: 300 });
      engine.updateUserProfile(userId3, { totalPoints: 100 });

      const leaderboard = engine.getGlobalLeaderboard();

      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[1].rank).toBe(2);
      expect(leaderboard[2].rank).toBe(3);
    });

    it('should respect leaderboard limit', () => {
      for (let i = 0; i < 200; i++) {
        engine.initializeUserProfile(`user-${i}`, `User${i}`);
        engine.updateUserProfile(`user-${i}`, { totalPoints: i * 10 });
      }

      const leaderboard = engine.getGlobalLeaderboard(50);

      expect(leaderboard.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Social Activities', () => {
    beforeEach(() => {
      engine.initializeUserProfile(userId1, 'Alice');
      engine.initializeUserProfile(userId2, 'Bob');
    });

    it('should record activity', () => {
      const req = engine.sendFriendRequest(userId1, userId2);
      engine.acceptFriendRequest(req.requestId);

      engine.recordActivity(userId1, 'goal_achieved', { goalTitle: 'Focus Goal' });

      const notifs = engine.getNotifications(userId2);
      expect(notifs.some(n => n.type === 'friend_achievement')).toBe(true);
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      engine.initializeUserProfile(userId1, 'Alice');
      engine.initializeUserProfile(userId2, 'Bob');
      engine.initializeUserProfile(userId3, 'Charlie');
    });

    it('should create challenge quickly', () => {
      const start = performance.now();
      engine.createChallenge(userId1, 'Fast Challenge', 'focus_battle', 'focus_score', 80, 7);
      const latency = performance.now() - start;

      console.log(`Challenge creation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(10);
    });

    it('should generate leaderboard quickly', () => {
      for (let i = 0; i < 100; i++) {
        engine.initializeUserProfile(`user-${i}`, `User${i}`);
        engine.updateUserProfile(`user-${i}`, { totalPoints: Math.random() * 1000 });
      }

      const start = performance.now();
      engine.getGlobalLeaderboard(100);
      const latency = performance.now() - start;

      console.log(`Leaderboard generation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(50);
    });

    it('should join challenge quickly', () => {
      const challenge = engine.createChallenge(userId1, 'Test', 'focus_battle', 'focus_score', 80, 7);

      const start = performance.now();
      engine.joinChallenge(userId2, challenge.challengeId);
      const latency = performance.now() - start;

      console.log(`Challenge join latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(10);
    });
  });
});
