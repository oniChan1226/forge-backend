import { NextFunction, Request, Response } from "express";

import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/errors/api-error";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown = null;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;

    if (statusCode >= 500) {
      logger.error({ err: error }, "Server error (ApiError)");
    }
  } else if (error instanceof Error) {
    logger.error({ err: error }, "Unhandled application error");

    message = env.NODE_ENV === "production" ? "Internal server error" : error.message;
  } else {
    logger.error({ err: error }, "Non-Error thrown");
  }

  res.status(statusCode).json({
    success: false,
    message,

    ...(isObject(details) ? { errors: details } : {}),

    ...(env.NODE_ENV !== "production" &&
      error instanceof Error && {
        stack: error.stack,
      }),
  });
};
