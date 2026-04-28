import {
  calculateStreakInfo,
  normalizeDate,
  isChallengeFailedByMisses,
} from '../src/services/streakService';
import type { DailyProgress } from '@prisma/client';

const makeProgress = (
  date: Date,
  completed: boolean
): DailyProgress => ({
  id: Math.random().toString(),
  challengeId: 'test-challenge',
  date,
  completed,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('streakService', () => {
  describe('normalizeDate', () => {
    it('normalizes a date to midnight UTC', () => {
      const d = new Date('2024-01-15T13:45:22.000Z');
      const normalized = normalizeDate(d);
      expect(normalized.getUTCHours()).toBe(0);
      expect(normalized.getUTCMinutes()).toBe(0);
      expect(normalized.getUTCSeconds()).toBe(0);
      expect(normalized.getUTCMilliseconds()).toBe(0);
    });
  });

  describe('calculateStreakInfo', () => {
    const startDate = normalizeDate(new Date('2024-01-01'));
    const endDate = normalizeDate(new Date('2024-01-30'));

    it('returns zeros when no progress recorded', () => {
      // Mock today as Jan 5 (within range)
      const info = calculateStreakInfo([], startDate, endDate);
      // Should have some totalDays since startDate is in past
      expect(info.currentStreak).toBe(0);
      expect(info.longestStreak).toBe(0);
      expect(info.totalCompleted).toBe(0);
      expect(info.completionRate).toBe(0);
    });

    it('calculates correct streak with consecutive completions', () => {
      const progress = [
        makeProgress(normalizeDate(new Date('2024-01-01')), true),
        makeProgress(normalizeDate(new Date('2024-01-02')), true),
        makeProgress(normalizeDate(new Date('2024-01-03')), true),
        makeProgress(normalizeDate(new Date('2024-01-04')), false),
        makeProgress(normalizeDate(new Date('2024-01-05')), true),
        makeProgress(normalizeDate(new Date('2024-01-06')), true),
      ];
      const end = normalizeDate(new Date('2024-01-06'));
      const info = calculateStreakInfo(progress, startDate, end);

      expect(info.totalCompleted).toBe(5);
      expect(info.missedDays).toBe(1);
      expect(info.longestStreak).toBe(3);
      expect(info.currentStreak).toBe(2);
    });

    it('calculates 100% completion rate', () => {
      const start = normalizeDate(new Date('2024-01-01'));
      const end = normalizeDate(new Date('2024-01-03'));
      const progress = [
        makeProgress(normalizeDate(new Date('2024-01-01')), true),
        makeProgress(normalizeDate(new Date('2024-01-02')), true),
        makeProgress(normalizeDate(new Date('2024-01-03')), true),
      ];
      const info = calculateStreakInfo(progress, start, end);
      expect(info.completionRate).toBe(100);
      expect(info.currentStreak).toBe(3);
      expect(info.longestStreak).toBe(3);
    });

    it('handles single completed day', () => {
      const start = normalizeDate(new Date('2024-01-01'));
      const end = normalizeDate(new Date('2024-01-01'));
      const progress = [makeProgress(start, true)];
      const info = calculateStreakInfo(progress, start, end);
      expect(info.currentStreak).toBe(1);
      expect(info.totalCompleted).toBe(1);
    });

    it('handles no completions with missed days', () => {
      const start = normalizeDate(new Date('2024-01-01'));
      const end = normalizeDate(new Date('2024-01-05'));
      const progress = [
        makeProgress(normalizeDate(new Date('2024-01-01')), false),
        makeProgress(normalizeDate(new Date('2024-01-02')), false),
      ];
      const info = calculateStreakInfo(progress, start, end);
      expect(info.currentStreak).toBe(0);
      expect(info.totalCompleted).toBe(0);
    });
  });

  describe('isChallengeFailedByMisses', () => {
    it('returns true for STRICT mode with any miss', () => {
      expect(isChallengeFailedByMisses(1, 'STRICT', 0)).toBe(true);
      expect(isChallengeFailedByMisses(0, 'STRICT', 0)).toBe(false);
    });

    it('returns true for FLEXIBLE mode when misses exceed allowedMisses', () => {
      expect(isChallengeFailedByMisses(4, 'FLEXIBLE', 3)).toBe(true);
      expect(isChallengeFailedByMisses(3, 'FLEXIBLE', 3)).toBe(false);
      expect(isChallengeFailedByMisses(2, 'FLEXIBLE', 3)).toBe(false);
    });

    it('returns false for FLEXIBLE mode when misses equal allowedMisses', () => {
      expect(isChallengeFailedByMisses(3, 'FLEXIBLE', 3)).toBe(false);
    });
  });
});
