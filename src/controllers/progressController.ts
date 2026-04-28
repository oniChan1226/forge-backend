import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { LogProgressBody } from '../types/index.js';
import { getChallengeById } from '../services/challengeService.js';
import {
  normalizeDate,
  calculateStreakInfo,
  isChallengeFailedByMisses,
} from '../services/streakService.js';
import prisma from '../config/database.js';

export const logProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params as { id: string };
  const { date, completed, notes } = req.body as LogProgressBody;

  if (date === undefined || completed === undefined) {
    res.status(400).json({ error: 'date and completed are required' });
    return;
  }

  if (isNaN(Date.parse(date))) {
    res.status(400).json({ error: 'Invalid date format' });
    return;
  }

  try {
    const challenge = await getChallengeById(id, userId);
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }

    if (challenge.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Cannot log progress for a non-active challenge' });
      return;
    }

    const progressDate = normalizeDate(new Date(date));
    const startDate = normalizeDate(challenge.startDate);
    const endDate = normalizeDate(challenge.endDate);

    if (progressDate < startDate || progressDate > endDate) {
      res.status(400).json({
        error: 'Date is outside the challenge period',
      });
      return;
    }

    const progress = await prisma.dailyProgress.upsert({
      where: {
        challengeId_date: {
          challengeId: id,
          date: progressDate,
        },
      },
      create: {
        challengeId: id,
        date: progressDate,
        completed,
        notes,
      },
      update: {
        completed,
        notes,
      },
    });

    // Recalculate stats and update challenge status if needed
    const updatedChallenge = await getChallengeById(id, userId);
    if (updatedChallenge) {
      const streakInfo = calculateStreakInfo(
        updatedChallenge.dailyProgress,
        updatedChallenge.startDate,
        updatedChallenge.endDate
      );

      const today = normalizeDate(new Date());
      const isFinished = today >= endDate;

      if (isFinished) {
        const failed = isChallengeFailedByMisses(
          streakInfo.missedDays,
          updatedChallenge.completionMode,
          updatedChallenge.allowedMisses
        );
        await prisma.challenge.update({
          where: { id },
          data: { status: failed ? 'FAILED' : 'COMPLETED' },
        });
      } else if (
        isChallengeFailedByMisses(
          streakInfo.missedDays,
          updatedChallenge.completionMode,
          updatedChallenge.allowedMisses
        )
      ) {
        // Mark as failed mid-challenge if misses exceed threshold
        await prisma.challenge.update({
          where: { id },
          data: { status: 'FAILED' },
        });
      }
    }

    res.status(200).json(progress);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to log progress';
    res.status(500).json({ error: message });
  }
};

export const getProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params as { id: string };

  try {
    const challenge = await getChallengeById(id, userId);
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }

    const streakInfo = calculateStreakInfo(
      challenge.dailyProgress,
      challenge.startDate,
      challenge.endDate
    );

    res.status(200).json({
      progress: challenge.dailyProgress,
      streak: streakInfo,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};
