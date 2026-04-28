import { DailyProgress } from '@prisma/client';
import { StreakInfo } from '../types/index.js';

/**
 * Normalizes a date to midnight UTC for consistent comparison.
 */
export const normalizeDate = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Calculates streak and stats from a list of daily progress records
 * over the range [startDate, endDate].
 */
export const calculateStreakInfo = (
  progressRecords: DailyProgress[],
  startDate: Date,
  endDate: Date
): StreakInfo => {
  const today = normalizeDate(new Date());
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  // Build a map from date string to completed status
  const completedMap = new Map<string, boolean>();
  for (const record of progressRecords) {
    const key = normalizeDate(record.date).toISOString();
    completedMap.set(key, record.completed);
  }

  // Enumerate all days from start to min(today, end)
  const lastDay = today < end ? today : end;

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  let totalCompleted = 0;
  let missedDays = 0;
  let totalDays = 0;

  const current = new Date(start);
  while (current <= lastDay) {
    totalDays++;
    const key = current.toISOString();
    const completed = completedMap.get(key) ?? false;

    if (completed) {
      totalCompleted++;
      streak++;
      if (streak > longestStreak) {
        longestStreak = streak;
      }
    } else {
      missedDays++;
      streak = 0;
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Current streak is the streak up to today (working backwards from lastDay)
  // Calculate by checking from lastDay backwards
  currentStreak = 0;
  const check = new Date(lastDay);
  while (check >= start) {
    const key = check.toISOString();
    const completed = completedMap.get(key) ?? false;
    if (completed) {
      currentStreak++;
      check.setUTCDate(check.getUTCDate() - 1);
    } else {
      break;
    }
  }

  const completionRate =
    totalDays > 0 ? Math.round((totalCompleted / totalDays) * 100) : 0;

  return {
    currentStreak,
    longestStreak,
    totalCompleted,
    totalDays,
    completionRate,
    missedDays,
  };
};

/**
 * Determines if a challenge should be marked as failed in STRICT mode.
 * In STRICT mode, any missed day fails the challenge.
 * In FLEXIBLE mode, exceeding allowedMisses fails the challenge.
 */
export const isChallengeFailedByMisses = (
  missedDays: number,
  completionMode: string,
  allowedMisses: number
): boolean => {
  if (completionMode === 'STRICT') {
    return missedDays > 0;
  }
  return missedDays > allowedMisses;
};
