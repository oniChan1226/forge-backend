import mongoose from "mongoose";

import { env } from "./env";
import { logger } from "./logger";

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    minPoolSize: env.MONGODB_MIN_POOL_SIZE,
    maxIdleTimeMS: env.MONGODB_MAX_IDLE_TIME_MS,
    waitQueueTimeoutMS: env.MONGODB_WAIT_QUEUE_TIMEOUT_MS,
    serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    connectTimeoutMS: env.MONGODB_CONNECT_TIMEOUT_MS,
    socketTimeoutMS: env.MONGODB_SOCKET_TIMEOUT_MS,
    autoIndex: false,
  });

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected");
  });

  mongoose.connection.on("error", (error) => {
    logger.error({ err: error }, "MongoDB connection error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  return connectionPromise;
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connectionPromise = null;
  }
};
