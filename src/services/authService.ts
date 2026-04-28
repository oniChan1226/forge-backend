import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { RegisterBody, LoginBody } from '../types/index.js';

const SALT_ROUNDS = 10;

export const registerUser = async (body: RegisterBody) => {
  const { email, username, password } = body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    if (existing.email === email) {
      throw new Error('Email already in use');
    }
    throw new Error('Username already taken');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true, createdAt: true },
  });

  return user;
};

export const loginUser = async (body: LoginBody) => {
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('Server configuration error');
  }

  const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d';
  const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
    expiresIn,
  } as jwt.SignOptions);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  };
};
