import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";

import { getMe } from "./user.controller";

export const router = Router();

router.get("/me", authenticate, getMe);

export { router as userRouter };
