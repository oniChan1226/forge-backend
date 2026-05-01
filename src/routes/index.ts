import { Router } from "express";

import { env } from "../config/env";
import { healthRouter } from "./health.route";
import authRouter from "../modules/auth/auth.routes";
import devErrorsRouter from "../modules/dev-errors/dev-errors.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);

if (env.NODE_ENV !== "production") {
	apiRouter.use("/dev/errors", devErrorsRouter);
}

export { apiRouter };
