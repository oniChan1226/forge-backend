import { Router } from "express";

import { validateRequest } from "../../utils/middleware-utils/validate";

import { login, signup } from "./auth.controller";
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

export { router as authRouter};
