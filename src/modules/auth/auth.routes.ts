import { Router } from "express";
import { validateRequest } from "../../utils/middleware-utils/validate";
import { signupSchema } from "./auth.validators";
import { signup } from "./auth.controller";

const router = Router();

router.post(
  "/signup",
  validateRequest({
    body: signupSchema,
  }),
  signup
);

export default router;
