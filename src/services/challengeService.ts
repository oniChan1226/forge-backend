import prisma from '../config/database.js';
import { CreateChallengeBody, UpdateChallengeBody } from '../types/index.js';
import { normalizeDate } from './streakService.js';

export const createChallenge = async (
  userId: string,
  body: CreateChallengeBody
) => {
  const {
    title,
    description,
    durationDays,
    dailyTarget,
    startDate,
    completionMode = 'FLEXIBLE',
    allowedMisses = 3,
  } = body;

  const start = normalizeDate(new Date(startDate));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + durationDays - 1);

  return prisma.challenge.create({
    data: {
      userId,
      title,
      description,
      durationDays,
      dailyTarget,
      startDate: start,
      endDate: end,
      completionMode,
      allowedMisses,
    },
  });
};

export const getChallenges = async (userId: string) => {
  return prisma.challenge.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { dailyProgress: true },
      },
    },
  });
};

export const getChallengeById = async (id: string, userId: string) => {
  return prisma.challenge.findFirst({
    where: { id, userId },
    include: {
      dailyProgress: {
        orderBy: { date: 'asc' },
      },
    },
  });
};

export const updateChallenge = async (
  id: string,
  userId: string,
  body: UpdateChallengeBody
) => {
  const challenge = await prisma.challenge.findFirst({ where: { id, userId } });
  if (!challenge) {
    return null;
  }

  return prisma.challenge.update({
    where: { id },
    data: body,
  });
};

export const deleteChallenge = async (id: string, userId: string) => {
  const challenge = await prisma.challenge.findFirst({ where: { id, userId } });
  if (!challenge) {
    return null;
  }

  await prisma.challenge.delete({ where: { id } });
  return true;
};
