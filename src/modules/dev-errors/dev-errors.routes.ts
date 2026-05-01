import { Router } from "express";

import { asyncHandler } from "../../utils/middleware-utils/async-handler";
import { validateRequest } from "../../utils/middleware-utils/validate";
import {
  badRequestError,
  conflictError,
  forbiddenError,
  notFoundError,
  runtimeError,
  unauthorizedError,
  unprocessableError,
  validatedBodySuccess,
  validatedParamsSuccess,
  validatedQuerySuccess,
} from "./dev-errors.controller";
import {
  devErrorBodySchema,
  devErrorParamsSchema,
  devErrorQuerySchema,
} from "./dev-errors.validators";

const devErrorsRouter = Router();

devErrorsRouter.get("/bad-request", asyncHandler(badRequestError));
devErrorsRouter.get("/unauthorized", asyncHandler(unauthorizedError));
devErrorsRouter.get("/forbidden", asyncHandler(forbiddenError));
devErrorsRouter.get("/not-found", asyncHandler(notFoundError));
devErrorsRouter.get("/conflict", asyncHandler(conflictError));
devErrorsRouter.get("/unprocessable", asyncHandler(unprocessableError));
devErrorsRouter.get("/runtime", asyncHandler(runtimeError));

devErrorsRouter.post(
  "/validation/body",
  validateRequest({ body: devErrorBodySchema }),
  asyncHandler(validatedBodySuccess),
);

devErrorsRouter.get(
  "/validation/query",
  validateRequest({ query: devErrorQuerySchema }),
  asyncHandler(validatedQuerySuccess),
);

devErrorsRouter.get(
  "/validation/params/:ticketId",
  validateRequest({ params: devErrorParamsSchema }),
  asyncHandler(validatedParamsSuccess),
);

export default devErrorsRouter;
