import mongoose from "mongoose";

import { Request, Response } from "express";

export const livenessCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    service: "backend",
    timestamp: new Date().toISOString(),
  });
};

export const readinessCheck = (_req: Request, res: Response): void => {
  const isReady = mongoose.connection.readyState === 1;

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    mongodb: mongoose.STATES[mongoose.connection.readyState],
    timestamp: new Date().toISOString(),
  });
};
