import { Request, Response } from "express";

import { ApiError } from "../../utils/api-error";

const throwApiError =
  (statusCode: number, message: string, details?: unknown) =>
  (_req: Request, _res: Response): never => {
    throw new ApiError(statusCode, message, true, details);
  };

export const badRequestError = throwApiError(400, "Simulated bad request");

export const unauthorizedError = throwApiError(401, "Simulated unauthorized request");

export const forbiddenError = throwApiError(403, "Simulated forbidden request");

export const notFoundError = throwApiError(404, "Simulated resource not found");

export const conflictError = throwApiError(409, "Simulated conflict", {
  field: "email",
  reason: "Duplicate resource",
});

export const unprocessableError = throwApiError(422, "Simulated validation failure", {
  field: "payload",
  reason: "Business rule rejected the request",
});

export const runtimeError = (_req: Request, _res: Response): never => {
  throw new Error("Simulated unexpected server failure");
};

export const validatedBodySuccess = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "Body validation passed",
    data: req.body,
  });
};

export const validatedQuerySuccess = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "Query validation passed",
    data: req.query,
  });
};

export const validatedParamsSuccess = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "Params validation passed",
    data: req.params,
  });
};
