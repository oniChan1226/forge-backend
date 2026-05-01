import { Router } from "express";
import { getMe } from "./user.controller";
import { authenticate } from "../../middlewares/authenticate";

export const router = Router();

router.get("/me", authenticate, getMe);

export { router as userRouter };
