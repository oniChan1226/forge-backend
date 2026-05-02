import dns from "node:dns";
import { createServer } from "node:http";

// 🔥 FORCE stable DNS BEFORE anything else
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

import { app } from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";

const server = createServer(app);

const startServer = async (): Promise<void> => {
  await connectToDatabase();

  server.listen(env.PORT, env.HOST, () => {
    logger.info(
      { host: env.HOST, port: env.PORT, env: env.NODE_ENV },
      "HTTP server started",
    );
  });
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.warn({ signal }, "Shutdown signal received");

  server.close(async () => {
    try {
      await disconnectFromDatabase();
      logger.info("Shutdown complete");
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, "Error during shutdown");
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled Promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});

void startServer();
