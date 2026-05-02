import { Router } from "express";

import { validateRequest } from "../../utils/middleware-utils/validate";

import { login, refreshToken, signup } from "./auth.controller";
import { loginSchema, signupSchema } from "./auth.validators";

const router = Router();

router.post(
  "/signup",
  validateRequest({
    body: signupSchema,
  }),
  signup
);

router.post(
  "/login",
  validateRequest({
    body: loginSchema,
  }),
  login
);

router.post(
  "/refresh-token",
  refreshToken
);

export { router as authRouter};
