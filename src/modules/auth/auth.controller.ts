import type { CookieOptions } from "express";

import { env } from "../../config/env";
import { BcryptService } from "../../services/hash.service";
import { JwtService } from "../../services/token.service";
import { ApiError } from "../../utils/errors/api-error";
import { ApiResponse } from "../../utils/http/api-response";
import { asyncHandler } from "../../utils/middleware-utils/async-handler";
import { UserTokenService } from "../user-token/user-token.service";

import { AuthService } from "./auth.service";
import { LoginDTO, SignupDTO } from "./auth.validators";

const authService = new AuthService(new BcryptService(), new JwtService(), new UserTokenService());

const toMilliseconds = (expiresIn: string | number): number | undefined => {
  if (typeof expiresIn === "number") {
    return expiresIn * 1000;
  }

  const match = expiresIn.trim().match(/^(\d+)(ms|s|m|h|d)$/i);
  if (!match || !match[1] || !match[2]) {
    return undefined;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return undefined;
  }
};

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: toMilliseconds(env.ACCESS_TOKEN_EXPIRATION),
};

const refreshTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: toMilliseconds(env.REFRESH_TOKEN_EXPIRATION),
};

export const signup = asyncHandler(async (req, res) => {
  const body = req.body as SignupDTO;

  const user = await authService.signup(body);

  res.status(201).json(new ApiResponse(201, "Signup successful", user, true));
});

export const login = asyncHandler(async (req, res) => {
  const body = req.body as LoginDTO;

  const { user, token } = await authService.login(body);

  res
    .status(200)
    .cookie("accessToken", token.accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", token.refreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(200, "Login successful", { user, token }, true));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.headers.authorization?.split(" ")[1];
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  const token = await authService.refreshToken(refreshToken);

  res
    .status(200)
    .cookie("accessToken", token.accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", token.refreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(200, "Token refreshed successfully", { token }, true));
});
