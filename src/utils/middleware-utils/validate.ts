import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import { ApiError } from "../errors/api-error";

type RequestParts = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export const validateRequest =
  (schemas: RequestParts) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as Request["query"];
      }

      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as Request["params"];
      }

      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return next(
          new ApiError(
            400,
            "Validation error",
            true,
            err.issues.map((e) => ({
              path: e.path,
              message: e.message,
            })),
          ),
        );
      }

      next(err);
    }
  };
