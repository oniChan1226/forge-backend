import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1),

  MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(100),
  MONGODB_MIN_POOL_SIZE: z.coerce.number().int().nonnegative().default(10),
  MONGODB_MAX_IDLE_TIME_MS: z.coerce.number().int().nonnegative().default(300000),
  MONGODB_WAIT_QUEUE_TIMEOUT_MS: z.coerce.number().int().positive().default(3000),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  MONGODB_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  MONGODB_SOCKET_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),

  // Tokens
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  ACCESS_TOKEN_EXPIRATION: z.union([z.number(), z.string()]).default("15m"),
  REFRESH_TOKEN_EXPIRATION: z.union([z.number(), z.string()]).default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment variables: ${JSON.stringify(errors)}`);
}

export const env = parsed.data;
