import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { SignupDTO } from "./auth.validators";
import { TypedRequestBody } from "../../ts-helpers";
import { asyncHandler } from "../../utils/middleware-utils/async-handler";

const authService = new AuthService();

export const signup = asyncHandler(async (req, res) => {
  const body = req.body as SignupDTO;

  const user = await authService.signup(body);

  res.status(201).json({
    message: "User created successfully",
    user,
  });
});
