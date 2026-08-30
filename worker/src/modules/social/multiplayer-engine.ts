/**
 * Multiplayer Engine
 * Social features, group challenges, and collaborative tracking
 */

export type ChallengeType = 'focus_battle' | 'consistency_race' | 'stress_master' | 'team_goal' | 'custom';
export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
export type RelationshipStatus = 'friend' | 'blocked' | 'pending' | 'none';

export interface UserProfile {
  userId: string;
  username: string;
  avatar: string;
  level: number;
  totalPoints: number;
  friendCount: number;
  challengesWon: number;
  bio: string;
  visibility: 'public' | 'private' | 'friends_only';
}

export interface FriendRequest {
  requestId: string;
  senderId: string;
  recipientId: string;
  sentAt: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
}

export interface Friendship {
  userId1: string;
  userId2: string;
  friendSince: number;
  lastInteraction: number;
  sharedChallenges: number;
  mutualFriends: number;
}

export interface Challenge {
  challengeId: string;
  title: string;
  description: string;
  type: ChallengeType;
  creatorId: string;
  participants: ChallengeParticipant[];
  isTeam: boolean;
  maxParticipants: number;
  startTime: number;
  endTime: number;
  duration: number; // days
  targetMetric: string; // 'focus_score', 'consistency', 'sessions_completed', etc
  targetValue: number;
  rules: string[];
  prizes: ChallengePrize[];
  status: ChallengeStatus;
  createdAt: number;
}

export interface ChallengeParticipant {
  userId: string;
  username: string;
  currentValue: number;
  targetValue: number;
  rank: number;
  points: number;
  joinedAt: number;
  teamId?: string;
}

export interface ChallengePrize {
  rank: number; // 1st, 2nd, 3rd, etc
  points: number;
  badgeId?: string;
  description: string;
}

export interface Team {
  teamId: string;
  name: string;
  leaderId: string;
  members: string[];
  points: number;
  rank: number;
  createdAt: number;
  challengeId: string;
}

export interface SocialActivity {
  activityId: string;
  userId: string;
  type: 'session_completed' | 'goal_achieved' | 'badge_earned' | 'friend_added' | 'challenge_won' | 'milestone_reached';
  timestamp: number;
  data: Record<string, any>;
  visibility: 'public' | 'friends_only' | 'private';
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: 'friend_request' | 'challenge_invite' | 'friend_achievement' | 'challenge_update' | 'comment' | 'milestone';
  relatedUserId?: string;
  relatedChallengeId?: string;
  message: string;
  read: boolean;
  createdAt: number;
  actionUrl?: string;
}

export interface LeaderboardStats {
  userId: string;
  username: string;
  rank: number;
  points: number;
  level: number;
  challengesWon: number;
  streak: number;
  badges: number;
}

/**
 * Multiplayer Engine
 */
export class MultiplayerEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private friendships: Map<string, Set<string>> = new Map(); // userId → friend IDs
  private friendRequests: FriendRequest[] = [];
  private challenges: Map<string, Challenge> = new Map();
  private teams: Map<string, Team> = new Map();
  private socialActivities: SocialActivity[] = [];
  private notifications: Map<string, Notification[]> = new Map();
  private blocks: Map<string, Set<string>> = new Map(); // userId → blocked user IDs

  /**
   * Initialize user profile
   */
  initializeUserProfile(userId: string, username: string, avatar: string = '👤'): UserProfile {
    const profile: UserProfile = {
      userId,
      username,
      avatar,
      level: 1,
      totalPoints: 0,
      friendCount: 0,
      challengesWon: 0,
      bio: '',
      visibility: 'public',
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Send friend request
   */
  sendFriendRequest(senderId: string, recipientId: string, message?: string): FriendRequest {
    // Check if already friends
    if (this.areFriends(senderId, recipientId)) {
      throw new Error('Already friends');
    }

    // Check if blocked
    if (this.isBlocked(senderId, recipientId) || this.isBlocked(recipientId, senderId)) {
      throw new Error('Cannot send request to blocked user');
    }

    const request: FriendRequest = {
      requestId: `friend-req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      senderId,
      recipientId,
      sentAt: Date.now(),
      status: 'pending',
      message,
    };

    this.friendRequests.push(request);

    // Create notification
    this.createNotification(recipientId, 'friend_request', senderId, `${this.getUserProfile(senderId)?.username} sent you a friend request`);

    return request;
  }

  /**
   * Accept friend request
   */
  acceptFriendRequest(requestId: string): void {
    const request = this.friendRequests.find(r => r.requestId === requestId);
    if (!request || request.status !== 'pending') return;

    request.status = 'accepted';

    // Create friendship
    if (!this.friendships.has(request.senderId)) {
      this.friendships.set(request.senderId, new Set());
    }
    if (!this.friendships.has(request.recipientId)) {
      this.friendships.set(request.recipientId, new Set());
    }

    this.friendships.get(request.senderId)!.add(request.recipientId);
    this.friendships.get(request.recipientId)!.add(request.senderId);

    // Update profiles
    const senderProfile = this.getUserProfile(request.senderId);
    const recipientProfile = this.getUserProfile(request.recipientId);
    if (senderProfile) senderProfile.friendCount++;
    if (recipientProfile) recipientProfile.friendCount++;

    // Create notification
    this.createNotification(request.senderId, 'friend_request', request.recipientId, `${recipientProfile?.username} accepted your friend request`);
  }

  /**
   * Remove friend
   */
  removeFriend(userId: string, friendId: string): void {
    this.friendships.get(userId)?.delete(friendId);
    this.friendships.get(friendId)?.delete(userId);

    const userProfile = this.getUserProfile(userId);
    const friendProfile = this.getUserProfile(friendId);
    if (userProfile) userProfile.friendCount--;
    if (friendProfile) friendProfile.friendCount--;
  }

  /**
   * Block user
   */
  blockUser(userId: string, blockedUserId: string): void {
    if (!this.blocks.has(userId)) {
      this.blocks.set(userId, new Set());
    }
    this.blocks.get(userId)!.add(blockedUserId);

    // Remove friendship if exists
    if (this.areFriends(userId, blockedUserId)) {
      this.removeFriend(userId, blockedUserId);
    }
  }

  /**
   * Check if blocked
   */
  private isBlocked(userId: string, blockedUserId: string): boolean {
    return this.blocks.get(userId)?.has(blockedUserId) || false;
  }

  /**
   * Check if friends
   */
  private areFriends(userId: string, friendId: string): boolean {
    return this.friendships.get(userId)?.has(friendId) || false;
  }

  /**
   * Create challenge
   */
  createChallenge(
    creatorId: string,
    title: string,
    type: ChallengeType,
    targetMetric: string,
    targetValue: number,
    durationDays: number,
    maxParticipants: number = 100,
    isTeam: boolean = false
  ): Challenge {
    const challenge: Challenge = {
      challengeId: `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title,
      description: `${title} - Compete with others!`,
      type,
      creatorId,
      participants: [
        {
          userId: creatorId,
          username: this.getUserProfile(creatorId)?.username || 'Unknown',
          currentValue: 0,
          targetValue,
          rank: 1,
          points: 0,
          joinedAt: Date.now(),
        },
      ],
      isTeam,
      maxParticipants,
      startTime: Date.now(),
      endTime: Date.now() + durationDays * 24 * 60 * 60 * 1000,
      duration: durationDays,
      targetMetric,
      targetValue,
      rules: [
        `Reach ${targetValue} ${targetMetric}`,
        'Daily participation encouraged',
        'Results calculated in real-time',
        'Final rankings determined at challenge end',
      ],
      prizes: this.generateDefaultPrizes(),
      status: 'active',
      createdAt: Date.now(),
    };

    this.challenges.set(challenge.challengeId, challenge);

    // Record activity
    this.recordActivity(creatorId, 'challenge_won', {
      challengeId: challenge.challengeId,
      title,
      type,
    });

    return challenge;
  }

  /**
   * Join challenge
   */
  joinChallenge(userId: string, challengeId: string, teamId?: string): void {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || challenge.status !== 'active') return;

    // Check max participants
    if (challenge.participants.length >= challenge.maxParticipants) return;

    // Check if already joined
    if (challenge.participants.find(p => p.userId === userId)) return;

    const userProfile = this.getUserProfile(userId)!;
    challenge.participants.push({
      userId,
      username: userProfile.username,
      currentValue: 0,
      targetValue: challenge.targetValue,
      rank: challenge.participants.length + 1,
      points: 0,
      joinedAt: Date.now(),
      teamId,
    });

    // Notify participants
    this.createNotification(challenge.creatorId, 'challenge_update', userId, `${userProfile.username} joined the challenge`);
  }

  /**
   * Update challenge participant progress
   */
  updateChallengeProgress(userId: string, challengeId: string, newValue: number): void {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return;

    const participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) return;

    participant.currentValue = newValue;

    // Recalculate rankings
    this.recalculateChallengeRankings(challengeId);

    // Check if completed
    if (newValue >= participant.targetValue) {
      this.completeChallenge(userId, challengeId);
    }
  }

  /**
   * Recalculate challenge rankings
   */
  private recalculateChallengeRankings(challengeId: string): void {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return;

    // Sort by current value
    challenge.participants.sort((a, b) => b.currentValue - a.currentValue);

    // Assign ranks and points
    challenge.participants.forEach((participant, index) => {
      participant.rank = index + 1;
      participant.points = Math.max(0, 100 - index * 10); // Descending points
    });
  }

  /**
   * Complete challenge for user
   */
  private completeChallenge(userId: string, challengeId: string): void {
    const userProfile = this.getUserProfile(userId);
    if (userProfile) {
      userProfile.challengesWon++;
    }

    const challenge = this.challenges.get(challengeId);
    if (challenge) {
      const participant = challenge.participants.find(p => p.userId === userId);
      if (participant) {
        const prize = challenge.prizes.find(p => p.rank === participant.rank);
        if (prize && userProfile) {
          userProfile.totalPoints += prize.points;
        }
      }
    }

    // Record activity
    this.recordActivity(userId, 'challenge_won', {
      challengeId,
      challengeTitle: challenge?.title,
    });
  }

  /**
   * Create team
   */
  createTeam(leaderId: string, name: string, challengeId: string): Team {
    const team: Team = {
      teamId: `team-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      leaderId,
      members: [leaderId],
      points: 0,
      rank: 1,
      createdAt: Date.now(),
      challengeId,
    };

    this.teams.set(team.teamId, team);

    // Add leader to challenge with team
    this.joinChallenge(leaderId, challengeId, team.teamId);

    return team;
  }

  /**
   * Add member to team
   */
  addTeamMember(teamId: string, userId: string): void {
    const team = this.teams.get(teamId);
    if (!team || team.members.length >= 10) return;

    if (!team.members.includes(userId)) {
      team.members.push(userId);

      // Add to challenge
      const challenge = this.challenges.get(team.challengeId);
      if (challenge && !challenge.participants.find(p => p.userId === userId)) {
        this.joinChallenge(userId, team.challengeId, teamId);
      }

      // Notify team leader
      this.createNotification(team.leaderId, 'challenge_update', userId, `${this.getUserProfile(userId)?.username} joined your team`);
    }
  }

  /**
   * Generate default prizes
   */
  private generateDefaultPrizes(): ChallengePrize[] {
    return [
      { rank: 1, points: 200, badgeId: 'challenge_winner_gold', description: '1st Place - 200 points' },
      { rank: 2, points: 100, badgeId: 'challenge_winner_silver', description: '2nd Place - 100 points' },
      { rank: 3, points: 50, badgeId: 'challenge_winner_bronze', description: '3rd Place - 50 points' },
    ];
  }

  /**
   * Record social activity
   */
  recordActivity(userId: string, type: SocialActivity['type'], data: Record<string, any>): void {
    const activity: SocialActivity = {
      activityId: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId,
      type,
      timestamp: Date.now(),
      data,
      visibility: 'public',
    };

    this.socialActivities.push(activity);

    // Notify friends
    const friends = this.friendships.get(userId) || new Set();
    const activityMessage = this.generateActivityMessage(type, data);

    for (const friendId of friends) {
      this.createNotification(friendId, 'friend_achievement', userId, activityMessage);
    }
  }

  /**
   * Generate activity message
   */
  private generateActivityMessage(type: SocialActivity['type'], data: Record<string, any>): string {
    const messages: Record<SocialActivity['type'], string> = {
      session_completed: `Completed a focus session (${data.focusScore || 0} score)`,
      goal_achieved: `Achieved goal: ${data.goalTitle}`,
      badge_earned: `Unlocked badge: ${data.badgeTitle}`,
      friend_added: `Made a new friend`,
      challenge_won: `Won challenge: ${data.challengeTitle}`,
      milestone_reached: `Reached milestone: ${data.milestone}`,
    };

    return messages[type] || 'Achieved something great';
  }

  /**
   * Create notification
   */
  private createNotification(
    userId: string,
    type: Notification['type'],
    relatedUserId: string,
    message: string
  ): void {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    const notification: Notification = {
      notificationId: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId,
      type,
      relatedUserId,
      message,
      read: false,
      createdAt: Date.now(),
    };

    this.notifications.get(userId)!.push(notification);

    // Keep only last 100 notifications
    const userNotifs = this.notifications.get(userId)!;
    if (userNotifs.length > 100) {
      userNotifs.shift();
    }
  }

  /**
   * Get friend list
   */
  getFriends(userId: string): UserProfile[] {
    const friendIds = this.friendships.get(userId) || new Set();
    return Array.from(friendIds)
      .map(id => this.getUserProfile(id))
      .filter((p): p is UserProfile => p !== undefined);
  }

  /**
   * Get user profile
   */
  getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  /**
   * Get challenge
   */
  getChallenge(challengeId: string): Challenge | undefined {
    return this.challenges.get(challengeId);
  }

  /**
   * Get user notifications
   */
  getNotifications(userId: string, limit: number = 20): Notification[] {
    const notifs = this.notifications.get(userId) || [];
    return notifs.slice(-limit).reverse();
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    for (const notifs of this.notifications.values()) {
      const notif = notifs.find(n => n.notificationId === notificationId);
      if (notif) {
        notif.read = true;
        break;
      }
    }
  }

  /**
   * Get friend leaderboard
   */
  getFriendLeaderboard(userId: string): LeaderboardStats[] {
    const friendIds = this.friendships.get(userId) || new Set();
    const friends = Array.from(friendIds)
      .map(id => this.getUserProfile(id))
      .filter((p): p is UserProfile => p !== undefined);

    // Sort by points
    friends.sort((a, b) => b.totalPoints - a.totalPoints);

    // Create leaderboard stats
    return friends.map((friend, index) => ({
      userId: friend.userId,
      username: friend.username,
      rank: index + 1,
      points: friend.totalPoints,
      level: friend.level,
      challengesWon: friend.challengesWon,
      streak: 0, // Would be calculated from streak data
      badges: 0, // Would be calculated from badge data
    }));
  }

  /**
   * Get active challenges
   */
  getActiveChallenges(limit: number = 20): Challenge[] {
    return Array.from(this.challenges.values())
      .filter(c => c.status === 'active')
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  /**
   * Get global leaderboard
   */
  getGlobalLeaderboard(limit: number = 100): LeaderboardStats[] {
    const profiles = Array.from(this.userProfiles.values());

    // Sort by points
    profiles.sort((a, b) => b.totalPoints - a.totalPoints);

    return profiles.slice(0, limit).map((profile, index) => ({
      userId: profile.userId,
      username: profile.username,
      rank: index + 1,
      points: profile.totalPoints,
      level: profile.level,
      challengesWon: profile.challengesWon,
      streak: 0,
      badges: 0,
    }));
  }

  /**
   * Update user profile
   */
  updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const profile = this.userProfiles.get(userId);
    if (!profile) return null;

    Object.assign(profile, updates);
    return profile;
  }
}

/**
 * Create multiplayer engine instance
 */
export function createMultiplayerEngine(): MultiplayerEngine {
  return new MultiplayerEngine();
}
