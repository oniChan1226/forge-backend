import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
} from '../services/challengeService.js';
import { calculateStreakInfo } from '../services/streakService.js';
import { CreateChallengeBody, UpdateChallengeBody } from '../types/index.js';

export const create = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const body = req.body as CreateChallengeBody;
  const { title, durationDays, dailyTarget, startDate } = body;

  if (!title || !durationDays || !dailyTarget || !startDate) {
    res
      .status(400)
      .json({ error: 'title, durationDays, dailyTarget, and startDate are required' });
    return;
  }

  if (typeof durationDays !== 'number' || durationDays < 1 || durationDays > 365) {
    res.status(400).json({ error: 'durationDays must be between 1 and 365' });
    return;
  }

  if (isNaN(Date.parse(startDate))) {
    res.status(400).json({ error: 'Invalid startDate' });
    return;
  }

  try {
    const challenge = await createChallenge(userId, body);
    res.status(201).json(challenge);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create challenge';
    res.status(400).json({ error: message });
  }
};

export const list = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const challenges = await getChallenges(userId);
    res.status(200).json(challenges);
  } catch {
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
};

export const getOne = async (
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
    res.status(200).json(challenge);
  } catch {
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { id } = req.params as { id: string };
  const body = req.body as UpdateChallengeBody;

  try {
    const challenge = await updateChallenge(id, userId, body);
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }
    res.status(200).json(challenge);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update challenge';
    res.status(400).json({ error: message });
  }
};

export const remove = async (
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
    const result = await deleteChallenge(id, userId);
    if (!result) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }
    res.status(200).json({ message: 'Challenge deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
};

export const getStats = async (
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
      challenge: {
        id: challenge.id,
        title: challenge.title,
        status: challenge.status,
        completionMode: challenge.completionMode,
        allowedMisses: challenge.allowedMisses,
        durationDays: challenge.durationDays,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
      },
      stats: streakInfo,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
