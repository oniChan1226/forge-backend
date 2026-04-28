import { Router } from "express";

import { healthRouter } from "./health.route";
import authRouter from "../modules/auth/auth.routes";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);

export { apiRouter };
