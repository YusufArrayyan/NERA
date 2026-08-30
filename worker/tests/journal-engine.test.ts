/**
 * Journal Engine Tests
 * Tests for session journaling, mood tracking, and pattern analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createJournalEngine } from '../src/modules/journal/journal-engine';

describe('Journal Engine', () => {
  let journal: ReturnType<typeof createJournalEngine>;
  const userId = 'test-user-123';

  beforeEach(() => {
    journal = createJournalEngine();
  });

  describe('Journal Entry Creation', () => {
    it('should create journal entry', () => {
      const entry = journal.createJournalEntry(
        userId,
        'session-1',
        'Great session with good progress',
        'neutral',
        'good',
        'normal',
        'high',
        'focused',
        { focusScore: 80, stressLevel: 30, duration: 45, sessionType: 'work' }
      );

      expect(entry).toBeDefined();
      expect(entry.userId).toBe(userId);
      expect(entry.sessionId).toBe('session-1');
      expect(entry.content).toBe('Great session with good progress');
      expect(entry.moodAfter).toBe('good');
      expect(entry.focusQuality).toBe('focused');
    });

    it('should have valid entry structure', () => {
      const entry = journal.createJournalEntry(
        userId,
        'session-1',
        'Test',
        'neutral',
        'good',
        'normal',
        'high',
        'moderate',
        { focusScore: 50, stressLevel: 50, duration: 30, sessionType: 'study' }
      );

      expect(entry.entryId).toBeDefined();
      expect(entry.createdAt).toBeGreaterThan(0);
      expect(entry.tags).toEqual([]);
      expect(entry.distractions).toEqual([]);
      expect(entry.accomplishments).toEqual([]);
    });

    it('should store entry in user collection', () => {
      journal.createJournalEntry(
        userId,
        'session-1',
        'Test',
        'neutral',
        'good',
        'normal',
        'high',
        'focused',
        { focusScore: 80, stressLevel: 30, duration: 45, sessionType: 'work' }
      );

      const entries = journal.getUserEntries(userId);
      expect(entries.length).toBe(1);
    });
  });

  describe('Entry Updates', () => {
    it('should update journal entry', () => {
      const entry = journal.createJournalEntry(
        userId,
        'session-1',
        'Original content',
        'neutral',
        'good',
        'normal',
        'high',
        'focused',
        { focusScore: 80, stressLevel: 30, duration: 45, sessionType: 'work' }
      );

      journal.updateJournalEntry(userId, entry.entryId, { content: 'Updated content' });

      const updated = journal.getUserEntries(userId)[0];
      expect(updated.content).toBe('Updated content');
    });

    it('should add distractions to entry', () => {
      const entry = journal.createJournalEntry(
        userId,
        'session-1',
        'Test',
        'neutral',
        'poor',
        'normal',
        'low',
        'scattered',
        { focusScore: 30, stressLevel: 70, duration: 30, sessionType: 'study' }
      );

      journal.addEntryContent(userId, entry.entryId, 'distractions', ['Phone notifications', 'Noise']);

      const updated = journal.getUserEntries(userId)[0];
      expect(updated.distractions).toContain('Phone notifications');
      expect(updated.distractions.length).toBe(2);
    });

    it('should add accomplishments', () => {
      const entry = journal.createJournalEntry(
        userId,
        'session-1',
        'Test',
        'neutral',
        'good',
        'normal',
        'high',
        'focused',
        { focusScore: 80, stressLevel: 30, duration: 45, sessionType: 'work' }
      );

      journal.addEntryContent(userId, entry.entryId, 'accomplishments', ['Completed task A', 'Started task B']);

      const updated = journal.getUserEntries(userId)[0];
      expect(updated.accomplishments.length).toBe(2);
    });

    it('should add tags', () => {
      const entry = journal.createJournalEntry(
        userId,
        'session-1',
        'Test',
        'neutral',
        'good',
        'normal',
        'high',
        'focused',
        { focusScore: 80, stressLevel: 30, duration: 45, sessionType: 'work' }
      );

      journal.addTags(userId, entry.entryId, ['productive', 'morning', 'focused']);

      const updated = journal.getUserEntries(userId)[0];
      expect(updated.tags).toContain('productive');
      expect(updated.tags.length).toBe(3);
    });

    it('should return null for non-existent entry', () => {
      const result = journal.updateJournalEntry(userId, 'non-existent', { content: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('Gratitude Records', () => {
    it('should add gratitude record', () => {
      const record = journal.addGratitudeRecord(userId, 'Grateful for my health', 'health', 5);

      expect(record).toBeDefined();
      expect(record.userId).toBe(userId);
      expect(record.content).toBe('Grateful for my health');
      expect(record.category).toBe('health');
      expect(record.intensity).toBe(5);
    });

    it('should retrieve gratitude records', () => {
      journal.addGratitudeRecord(userId, 'Record 1', 'personal', 4);
      journal.addGratitudeRecord(userId, 'Record 2', 'work', 3);

      const records = journal.getGratitudeRecords(userId);

      expect(records.length).toBe(2);
    });

    it('should track gratitude intensity', () => {
      const high = journal.addGratitudeRecord(userId, 'Very grateful', 'personal', 5);
      const low = journal.addGratitudeRecord(userId, 'Slightly grateful', 'personal', 1);

      expect(high.intensity).toBe(5);
      expect(low.intensity).toBe(1);
    });
  });

  describe('Mood Trends', () => {
    it('should calculate daily mood trend', () => {
      for (let i = 0; i < 5; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'neutral',
          'good',
          'normal',
          'high',
          'focused',
          { focusScore: 75 + i * 5, stressLevel: 30, duration: 45, sessionType: 'work' }
        );
      }

      const trend = journal.calculateMoodTrend(userId, 'daily');

      expect(trend).toBeDefined();
      expect(trend.period).toBe('daily');
      expect(trend.moodData.average).toBeGreaterThan(0);
      expect(trend.moodData.trend).toMatch(/^(improving|declining|stable)$/);
    });

    it('should calculate weekly mood trend', () => {
      for (let i = 0; i < 7; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'poor',
          'good',
          'low',
          'high',
          'focused',
          { focusScore: 70, stressLevel: 40, duration: 40, sessionType: 'study' }
        );
      }

      const trend = journal.calculateMoodTrend(userId, 'weekly');

      expect(trend.period).toBe('weekly');
      expect(trend.moodData.average).toBeGreaterThan(0);
    });

    it('should calculate monthly mood trend', () => {
      for (let i = 0; i < 10; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'neutral',
          'excellent',
          'normal',
          'peak',
          'deep',
          { focusScore: 90, stressLevel: 20, duration: 60, sessionType: 'flow' }
        );
      }

      const trend = journal.calculateMoodTrend(userId, 'monthly');

      expect(trend.period).toBe('monthly');
      expect(trend.moodData.trend).toMatch(/^(improving|declining|stable)$/);
    });

    it('should track energy trend', () => {
      for (let i = 0; i < 5; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'neutral',
          'good',
          'exhausted',
          'peak',
          'focused',
          { focusScore: 75, stressLevel: 35, duration: 45, sessionType: 'work' }
        );
      }

      const trend = journal.calculateMoodTrend(userId, 'daily');

      expect(trend.energyData.average).toBeGreaterThan(0);
    });

    it('should track focus trend', () => {
      for (let i = 0; i < 5; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'neutral',
          'good',
          'normal',
          'high',
          i % 2 === 0 ? 'deep' : 'scattered',
          { focusScore: 60 + i * 10, stressLevel: 40, duration: 40, sessionType: 'study' }
        );
      }

      const trend = journal.calculateMoodTrend(userId, 'daily');

      expect(trend.focusData.average).toBeGreaterThan(0);
      expect(trend.focusData.trend).toMatch(/^(improving|declining|stable)$/);
    });

    it('should calculate consistency score', () => {
      for (let i = 0; i < 10; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'neutral',
          'good',
          'normal',
          'high',
          'focused',
          { focusScore: 75, stressLevel: 30, duration: 45, sessionType: 'work' }
        );
      }

      const trend = journal.calculateMoodTrend(userId, 'weekly');

      expect(trend.moodData.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(trend.moodData.consistencyScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Patterns', () => {
    it('should detect mood trigger pattern', () => {
      for (let i = 0; i < 3; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'poor',
          'excellent',
          'low',
          'peak',
          'focused',
          { focusScore: 85, stressLevel: 20, duration: 50, sessionType: 'work' }
        );
      }

      const patterns = journal.getUserPatterns(userId);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].type).toMatch(/^(mood_trigger|energy_drain|focus_blocker|stress_source|productivity_booster|distraction_pattern)$/);
    });

    it('should detect focus blocker pattern', () => {
      journal.createJournalEntry(
        userId,
        'session-1',
        'Very distracted',
        'neutral',
        'poor',
        'normal',
        'low',
        'unfocused',
        { focusScore: 20, stressLevel: 80, duration: 30, sessionType: 'study' }
      );

      journal.createJournalEntry(
        userId,
        'session-2',
        'Still distracted',
        'neutral',
        'poor',
        'normal',
        'low',
        'scattered',
        { focusScore: 25, stressLevel: 75, duration: 30, sessionType: 'study' }
      );

      const patterns = journal.getUserPatterns(userId);

      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should track pattern frequency', () => {
      for (let i = 0; i < 5; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'neutral',
          'good',
          'normal',
          'high',
          'focused',
          { focusScore: 80, stressLevel: 30, duration: 45, sessionType: 'work' }
        );
      }

      const patterns = journal.getUserPatterns(userId);

      if (patterns.length > 0) {
        expect(patterns[0].frequency).toBeGreaterThan(0);
        expect(patterns[0].frequency).toBeLessThanOrEqual(100);
      }
    });

    it('should provide pattern recommendations', () => {
      journal.createJournalEntry(
        userId,
        'session-1',
        'Distracted session',
        'neutral',
        'poor',
        'normal',
        'low',
        'scattered',
        { focusScore: 30, stressLevel: 70, duration: 30, sessionType: 'study' }
      );

      const patterns = journal.getUserPatterns(userId);

      if (patterns.length > 0) {
        expect(patterns[0].recommendations).toBeDefined();
        expect(patterns[0].recommendations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Insights', () => {
    it('should generate mood improvement insight', () => {
      journal.createJournalEntry(
        userId,
        'session-1',
        'Feeling better',
        'poor',
        'excellent',
        'low',
        'peak',
        'deep',
        { focusScore: 90, stressLevel: 20, duration: 60, sessionType: 'meditation' }
      );

      const insights = journal.getUserInsights(userId);

      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some(i => i.type === 'celebration')).toBe(true);
    });

    it('should generate focus quality insight', () => {
      journal.createJournalEntry(
        userId,
        'session-1',
        'Deep focus',
        'neutral',
        'good',
        'normal',
        'high',
        'deep',
        { focusScore: 95, stressLevel: 25, duration: 60, sessionType: 'work' }
      );

      const insights = journal.getUserInsights(userId);

      expect(insights.some(i => i.type === 'focus_pattern')).toBe(true);
    });

    it('should generate stress warning', () => {
      journal.createJournalEntry(
        userId,
        'session-1',
        'Stressed',
        'neutral',
        'poor',
        'normal',
        'low',
        'scattered',
        { focusScore: 30, stressLevel: 85, duration: 30, sessionType: 'study' }
      );

      const insights = journal.getUserInsights(userId);

      expect(insights.some(i => i.type === 'warning')).toBe(true);
    });

    it('should track insight confidence', () => {
      journal.createJournalEntry(
        userId,
        'session-1',
        'Test',
        'neutral',
        'good',
        'normal',
        'high',
        'focused',
        { focusScore: 80, stressLevel: 30, duration: 45, sessionType: 'work' }
      );

      const insights = journal.getUserInsights(userId);

      if (insights.length > 0) {
        expect(insights[0].confidence).toBeGreaterThanOrEqual(0);
        expect(insights[0].confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Reflection Prompts', () => {
    it('should provide reflection prompt', () => {
      const prompt = journal.getReflectionPrompt();

      expect(prompt).toBeDefined();
      expect(prompt.question).toBeDefined();
      expect(prompt.category).toMatch(/^(mood|focus|stress|growth|gratitude)$/);
    });

    it('should provide category-specific prompt', () => {
      const prompt = journal.getReflectionPrompt('gratitude');

      expect(prompt.category).toBe('gratitude');
      expect(prompt.question).toBeDefined();
    });

    it('should include difficulty level', () => {
      const prompt = journal.getReflectionPrompt();

      expect(['easy', 'medium', 'challenging']).toContain(prompt.difficulty);
    });

    it('should have prompt variety', () => {
      const prompts = new Set();

      for (let i = 0; i < 20; i++) {
        const prompt = journal.getReflectionPrompt();
        prompts.add(prompt.promptId);
      }

      expect(prompts.size).toBeGreaterThan(1);
    });
  });

  describe('Entry Retrieval', () => {
    it('should retrieve user entries', () => {
      for (let i = 0; i < 5; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'neutral',
          'good',
          'normal',
          'high',
          'focused',
          { focusScore: 75, stressLevel: 30, duration: 45, sessionType: 'work' }
        );
      }

      const entries = journal.getUserEntries(userId);

      expect(entries.length).toBe(5);
    });

    it('should respect entry limit', () => {
      for (let i = 0; i < 100; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'neutral',
          'good',
          'normal',
          'high',
          'focused',
          { focusScore: 75, stressLevel: 30, duration: 45, sessionType: 'work' }
        );
      }

      const entries = journal.getUserEntries(userId, 30);

      expect(entries.length).toBeLessThanOrEqual(30);
    });
  });

  describe('Performance', () => {
    it('should create entry quickly', () => {
      const start = performance.now();
      journal.createJournalEntry(
        userId,
        'session-1',
        'Test',
        'neutral',
        'good',
        'normal',
        'high',
        'focused',
        { focusScore: 80, stressLevel: 30, duration: 45, sessionType: 'work' }
      );
      const latency = performance.now() - start;

      console.log(`Entry creation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(20);
    });

    it('should calculate trend quickly', () => {
      for (let i = 0; i < 30; i++) {
        journal.createJournalEntry(
          userId,
          `session-${i}`,
          `Entry ${i}`,
          'neutral',
          'good',
          'normal',
          'high',
          'focused',
          { focusScore: 75 + Math.random() * 20, stressLevel: 30, duration: 45, sessionType: 'work' }
        );
      }

      const start = performance.now();
      journal.calculateMoodTrend(userId, 'weekly');
      const latency = performance.now() - start;

      console.log(`Trend calculation latency: ${latency.toFixed(2)}ms`);
      expect(latency).toBeLessThan(50);
    });
  });
});
