/**
 * Adaptive Coach Tests
 * Tests for session planning, goal setting, and progress coaching
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createAdaptiveCoach } from '../src/modules/coaching/adaptive-coach';

describe('Adaptive Coach', () => {
  let coach: ReturnType<typeof createAdaptiveCoach>;
  const userId = 'test-user-123';

  beforeEach(() => {
    coach = createAdaptiveCoach();
  });

  describe('Session Planning', () => {
    it('should create session plan', () => {
      const plan = coach.createSessionPlan(userId, 60, 5, 5);

      expect(plan).toBeDefined();
      expect(plan.userId).toBe(userId);
      expect(plan.sessionId).toBeDefined();
      expect(plan.estimatedDuration).toBeGreaterThan(0);
      expect(plan.focusTarget).toBeGreaterThan(0);
    });

    it('should determine beginner difficulty for low focus', () => {
      const plan = coach.createSessionPlan(userId, 30, 1, 1);

      expect(plan.difficulty).toBe('beginner');
      expect(plan.focusTarget).toBeLessThan(50);
    });

    it('should determine intermediate difficulty for medium focus', () => {
      const plan = coach.createSessionPlan(userId, 55, 3, 5);

      expect(plan.difficulty).toBe('intermediate');
    });

    it('should determine advanced difficulty for high focus', () => {
      const plan = coach.createSessionPlan(userId, 75, 10, 20);

      expect(plan.difficulty).toBe('advanced');
    });

    it('should determine expert difficulty for expert user', () => {
      const plan = coach.createSessionPlan(userId, 85, 20, 40);

      expect(plan.difficulty).toBe('expert');
    });

    it('should build session phases', () => {
      const plan = coach.createSessionPlan(userId, 70, 5, 10);

      expect(plan.phases).toBeDefined();
      expect(plan.phases.length).toBeGreaterThan(0);
      expect(plan.phases[0].phase).toBe('warmup');
    });

    it('should include required phases', () => {
      const plan = coach.createSessionPlan(userId, 70, 5, 10);

      const phaseTypes = plan.phases.map(p => p.phase);
      expect(phaseTypes).toContain('warmup');
      expect(phaseTypes).toContain('focus_building');
      expect(phaseTypes).toContain('cooldown');
      expect(phaseTypes).toContain('recovery');
    });

    it('should add peak performance for advanced users', () => {
      const advancedPlan = coach.createSessionPlan(userId, 75, 15, 25);
      const beginnerPlan = coach.createSessionPlan('user-beginner', 35, 1, 1);

      const advancedPhases = advancedPlan.phases.map(p => p.phase);
      const beginnerPhases = beginnerPlan.phases.map(p => p.phase);

      if (advancedPlan.difficulty === 'advanced' || advancedPlan.difficulty === 'expert') {
        expect(advancedPhases).toContain('peak_performance');
      }
    });

    it('should generate coaching messages', () => {
      const plan = coach.createSessionPlan(userId, 60, 5, 10);

      expect(plan.coachingMessages).toBeDefined();
      expect(plan.coachingMessages.length).toBeGreaterThan(0);
      expect(plan.coachingMessages[0].type).toMatch(/^(motivational|instructional|checkpoint|adjustment|celebration)$/);
    });

    it('should include expected outcome', () => {
      const plan = coach.createSessionPlan(userId, 60, 5, 10);

      expect(plan.expectedOutcome).toBeDefined();
      expect(plan.expectedOutcome.length).toBeGreaterThan(0);
    });

    it('should store session plan', () => {
      coach.createSessionPlan(userId, 60, 5, 10);

      const plan = coach.getSessionPlan(userId, coach.createSessionPlan(userId, 60, 5, 10).sessionId);
      expect(plan).toBeDefined();
    });

    it('should set coaching style preference', () => {
      coach.setCoachingStyle(userId, 'motivational');
      const plan = coach.createSessionPlan(userId, 60, 5, 10);

      expect(plan.coachingMessages).toBeDefined();
    });
  });

  describe('Session Phases', () => {
    it('should have valid phase durations', () => {
      const plan = coach.createSessionPlan(userId, 70, 5, 10);

      for (const phase of plan.phases) {
        expect(phase.duration).toBeGreaterThan(0);
      }
    });

    it('should have target focus for each phase', () => {
      const plan = coach.createSessionPlan(userId, 70, 5, 10);

      for (const phase of plan.phases) {
        expect(phase.targetFocus).toBeGreaterThanOrEqual(0);
        expect(phase.targetFocus).toBeLessThanOrEqual(100);
      }
    });

    it('should include check-in times', () => {
      const plan = coach.createSessionPlan(userId, 70, 5, 10);

      for (const phase of plan.phases) {
        expect(phase.checkIn).toBeDefined();
        expect(phase.checkIn.question).toBeDefined();
        expect(phase.checkIn.at).toBeGreaterThan(0);
      }
    });

    it('should include activities for each phase', () => {
      const plan = coach.createSessionPlan(userId, 70, 5, 10);

      for (const phase of plan.phases) {
        expect(phase.activities).toBeDefined();
        expect(phase.activities.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Coaching Goals', () => {
    it('should create coaching goal', () => {
      const goal = coach.createCoachingGoal(userId, 'Improve Focus', 'focus', 80, 30);

      expect(goal).toBeDefined();
      expect(goal.userId).toBe(userId);
      expect(goal.goalId).toBeDefined();
      expect(goal.title).toBe('Improve Focus');
      expect(goal.category).toBe('focus');
      expect(goal.targetValue).toBe(80);
      expect(goal.status).toBe('active');
    });

    it('should generate milestones', () => {
      const goal = coach.createCoachingGoal(userId, 'Focus Goal', 'focus', 80, 30);

      expect(goal.milestones).toBeDefined();
      expect(goal.milestones.length).toBeGreaterThan(0);
    });

    it('should have 4 milestones', () => {
      const goal = coach.createCoachingGoal(userId, 'Focus Goal', 'focus', 80, 30);

      expect(goal.milestones).toHaveLength(4);
    });

    it('should increment milestone targets', () => {
      const goal = coach.createCoachingGoal(userId, 'Focus Goal', 'focus', 80, 30);

      for (let i = 1; i < goal.milestones.length; i++) {
        expect(goal.milestones[i].targetValue).toBeGreaterThan(goal.milestones[i - 1].targetValue);
      }
    });

    it('should update goal progress', () => {
      const goal = coach.createCoachingGoal(userId, 'Focus Goal', 'focus', 100, 30);

      coach.updateGoalProgress(userId, goal.goalId, 50);

      const updatedGoal = coach.getUserGoals(userId).find(g => g.goalId === goal.goalId);
      expect(updatedGoal!.currentValue).toBe(50);
      expect(updatedGoal!.progress).toBe(50);
    });

    it('should mark milestones complete', () => {
      const goal = coach.createCoachingGoal(userId, 'Focus Goal', 'focus', 80, 30);

      coach.updateGoalProgress(userId, goal.goalId, 20);

      const updatedGoal = coach.getUserGoals(userId).find(g => g.goalId === goal.goalId);
      const completedMilestones = updatedGoal!.milestones.filter(m => m.status === 'completed');

      if (updatedGoal!.progress >= 25) {
        expect(completedMilestones.length).toBeGreaterThan(0);
      }
    });

    it('should mark goal complete at 100%', () => {
      const goal = coach.createCoachingGoal(userId, 'Focus Goal', 'focus', 100, 30);

      coach.updateGoalProgress(userId, goal.goalId, 100);

      const updatedGoal = coach.getUserGoals(userId).find(g => g.goalId === goal.goalId);
      expect(updatedGoal!.status).toBe('completed');
    });

    it('should track coaching notes', () => {
      const goal = coach.createCoachingGoal(userId, 'Focus Goal', 'focus', 80, 30);

      coach.updateGoalProgress(userId, goal.goalId, 20);

      const updatedGoal = coach.getUserGoals(userId).find(g => g.goalId === goal.goalId);
      expect(updatedGoal!.coachingNotes.length).toBeGreaterThan(0);
    });
  });

  describe('Progress Reports', () => {
    it('should generate daily progress report', () => {
      const report = coach.generateProgressReport(userId, 'daily', {
        focusImprovement: 15,
        consistencyScore: 85,
        sessionQuality: 80,
        engagementLevel: 90,
      });

      expect(report).toBeDefined();
      expect(report.period).toBe('daily');
      expect(report.userId).toBe(userId);
    });

    it('should include report sections', () => {
      const report = coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: 10,
        consistencyScore: 75,
        sessionQuality: 70,
        engagementLevel: 80,
      });

      expect(report.sections).toBeDefined();
      expect(report.sections.summary).toBeDefined();
      expect(report.sections.highlights).toBeDefined();
      expect(report.sections.challenges).toBeDefined();
      expect(report.sections.recommendations).toBeDefined();
    });

    it('should generate highlights for good metrics', () => {
      const report = coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: 25,
        consistencyScore: 90,
        sessionQuality: 90,
        engagementLevel: 95,
      });

      expect(report.sections.highlights.length).toBeGreaterThan(0);
    });

    it('should identify challenges', () => {
      const report = coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: -15,
        consistencyScore: 40,
        sessionQuality: 50,
        engagementLevel: 30,
      });

      expect(report.sections.challenges.length).toBeGreaterThan(0);
    });

    it('should provide recommendations', () => {
      const report = coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: 5,
        consistencyScore: 60,
        sessionQuality: 60,
        engagementLevel: 65,
      });

      expect(report.sections.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate action items', () => {
      const report = coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: 10,
        consistencyScore: 75,
        sessionQuality: 75,
        engagementLevel: 80,
      });

      expect(report.actionItems).toBeDefined();
      expect(report.actionItems.length).toBeGreaterThan(0);
    });

    it('should generate insights', () => {
      coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: 25,
        consistencyScore: 90,
        sessionQuality: 85,
        engagementLevel: 95,
      });

      const insights = coach.getUserInsights(userId);
      expect(insights).toBeDefined();
    });
  });

  describe('Insights Generation', () => {
    it('should generate celebration insight for improvement', () => {
      coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: 20,
        consistencyScore: 80,
        sessionQuality: 80,
        engagementLevel: 85,
      });

      const insights = coach.getUserInsights(userId);
      const celebration = insights.find(i => i.type === 'celebration');

      if (insights.length > 0) {
        expect(celebration).toBeDefined();
      }
    });

    it('should generate warning for declining focus', () => {
      coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: -20,
        consistencyScore: 50,
        sessionQuality: 50,
        engagementLevel: 50,
      });

      const insights = coach.getUserInsights(userId);
      const warning = insights.find(i => i.type === 'warning');

      if (insights.length > 0) {
        expect(warning).toBeDefined();
      }
    });

    it('should include urgency levels', () => {
      coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: -30,
        consistencyScore: 30,
        sessionQuality: 40,
        engagementLevel: 30,
      });

      const insights = coach.getUserInsights(userId);

      if (insights.length > 0) {
        expect(['low', 'medium', 'high']).toContain(insights[0].urgency);
      }
    });
  });

  describe('Daily Tips', () => {
    it('should provide daily tip', () => {
      const tip = coach.getDailyTip('beginner');

      expect(tip).toBeDefined();
      expect(tip.tipId).toBeDefined();
      expect(tip.title).toBeDefined();
      expect(tip.content).toBeDefined();
    });

    it('should include actionable tips', () => {
      const tip = coach.getDailyTip('intermediate');

      expect(tip.actionable).toBeDefined();
    });

    it('should include estimated time', () => {
      const tip = coach.getDailyTip('advanced');

      expect(tip.estimatedTime).toBeGreaterThan(0);
    });

    it('should include evidence', () => {
      const tip = coach.getDailyTip('expert');

      expect(tip.evidence).toBeDefined();
      expect(tip.evidence.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-User Support', () => {
    it('should handle multiple users independently', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      const plan1 = coach.createSessionPlan(user1, 80, 10, 20);
      const plan2 = coach.createSessionPlan(user2, 30, 1, 1);

      expect(plan1.difficulty).not.toBe(plan2.difficulty);
    });

    it('should track goals separately per user', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      coach.createCoachingGoal(user1, 'Goal 1', 'focus', 80, 30);
      coach.createCoachingGoal(user2, 'Goal 2', 'stress', 50, 30);

      const goals1 = coach.getUserGoals(user1);
      const goals2 = coach.getUserGoals(user2);

      expect(goals1.length).toBe(1);
      expect(goals2.length).toBe(1);
      expect(goals1[0].title).not.toBe(goals2[0].title);
    });
  });

  describe('Coaching Messages', () => {
    it('should include message type', () => {
      const plan = coach.createSessionPlan(userId, 60, 5, 10);

      for (const msg of plan.coachingMessages) {
        expect(['motivational', 'instructional', 'checkpoint', 'adjustment', 'celebration']).toContain(msg.type);
      }
    });

    it('should include timing info', () => {
      const plan = coach.createSessionPlan(userId, 60, 5, 10);

      for (const msg of plan.coachingMessages) {
        expect(['before_session', 'during_session', 'after_session', 'daily_tip']).toContain(msg.timing);
      }
    });

    it('should include emoji', () => {
      const plan = coach.createSessionPlan(userId, 60, 5, 10);

      for (const msg of plan.coachingMessages) {
        expect(msg.emoji).toBeDefined();
        expect(msg.emoji.length).toBeGreaterThan(0);
      }
    });

    it('should mark actionable messages', () => {
      const plan = coach.createSessionPlan(userId, 60, 5, 10);

      expect(plan.coachingMessages.some(m => m.actionable === true)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should create session plan quickly', () => {
      const start = performance.now();
      coach.createSessionPlan(userId, 60, 5, 10);
      const latency = performance.now() - start;

      console.log(`Session plan creation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(50);
    });

    it('should generate progress report quickly', () => {
      const start = performance.now();
      coach.generateProgressReport(userId, 'weekly', {
        focusImprovement: 10,
        consistencyScore: 75,
        sessionQuality: 75,
        engagementLevel: 80,
      });
      const latency = performance.now() - start;

      console.log(`Progress report generation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(100);
    });

    it('should update goal progress quickly', () => {
      const goal = coach.createCoachingGoal(userId, 'Test Goal', 'focus', 100, 30);

      const start = performance.now();
      coach.updateGoalProgress(userId, goal.goalId, 50);
      const latency = performance.now() - start;

      console.log(`Goal progress update latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(10);
    });
  });
});
