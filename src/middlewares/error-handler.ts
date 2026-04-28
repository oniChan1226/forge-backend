import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/api-error";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isApiError = error instanceof ApiError;
  const statusCode = isApiError ? error.statusCode : 500;

  if (!isApiError || statusCode >= 500) {
    logger.error({ err: error }, "Unhandled application error");
  }

  res.status(statusCode).json({
    success: false,
    message: error.message,
    ...(env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};