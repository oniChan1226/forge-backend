import { NextFunction, Request, Response } from "express";

import { env } from "../config/env";
import { logger } from "../config/logger";
import { AppError } from "../utils/app-error";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;

  if (!isAppError || statusCode >= 500) {
    logger.error({ err: error }, "Unhandled application error");
  }

  res.status(statusCode).json({
    success: false,
    message: error.message,
    ...(env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};
