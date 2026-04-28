import { Router } from "express";

import { livenessCheck, readinessCheck } from "../modules/health/health.controller";

const healthRouter = Router();

healthRouter.get("/live", livenessCheck);
healthRouter.get("/ready", readinessCheck);

export { healthRouter };
