import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// Use the same DATABASE_URL as the app (defaults to ./dev.db at project root)
const dbUrl = process.env['DATABASE_URL'] ?? 'file:./dev.db';
const dbPath = dbUrl.replace(/^file:/, '');
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(process.cwd(), dbPath);

let _prisma: PrismaClient | null = null;

export const getTestPrisma = (): PrismaClient => {
  if (!_prisma) {
    const adapter = new PrismaBetterSqlite3({ url: resolvedPath });
    _prisma = new PrismaClient({ adapter });
  }
  return _prisma;
};

export const cleanupTestDb = async (): Promise<void> => {
  const prisma = getTestPrisma();
  await prisma.dailyProgress.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();
};

export const disconnectTestDb = async (): Promise<void> => {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = null;
  }
};
