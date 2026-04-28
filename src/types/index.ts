export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest {
  userId: string;
  email: string;
}

export interface RegisterBody {
  email: string;
  username: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateChallengeBody {
  title: string;
  description?: string;
  durationDays: number;
  dailyTarget: string;
  startDate: string;
  completionMode?: 'STRICT' | 'FLEXIBLE';
  allowedMisses?: number;
}

export interface UpdateChallengeBody {
  title?: string;
  description?: string;
  dailyTarget?: string;
  completionMode?: 'STRICT' | 'FLEXIBLE';
  allowedMisses?: number;
  status?: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
}

export interface LogProgressBody {
  date: string;
  completed: boolean;
  notes?: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  totalDays: number;
  completionRate: number;
  missedDays: number;
}
