import { Router } from "express";

import { env } from "../config/env";
import { authRouter } from "../modules/auth/auth.routes";
import devErrorsRouter from "../modules/dev-errors/dev-errors.routes";
import { userRouter } from "../modules/user/user.routes";

import { healthRouter } from "./health.route";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/user", userRouter);

if (env.NODE_ENV !== "production") {
  apiRouter.use("/dev/errors", devErrorsRouter);
}

export { apiRouter };
