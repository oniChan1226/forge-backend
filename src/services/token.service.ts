import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/errors/api-error";

// token.service.ts
export interface ITokenService {
  generateAccessToken(userId: string): string;
  generateRefreshToken(userId: string): string;
  verifyAccessToken(token: string): { sub: string };
}

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>;

const accessExpiresIn = env.ACCESS_TOKEN_EXPIRATION as JwtExpiresIn;
const refreshExpiresIn = env.REFRESH_TOKEN_EXPIRATION as JwtExpiresIn;

export class JwtService implements ITokenService {
  generateAccessToken(userId: string) {
    return jwt.sign({ sub: userId }, env.ACCESS_TOKEN_SECRET, {
      expiresIn: accessExpiresIn,
    });
  }

  generateRefreshToken(userId: string) {
    return jwt.sign({ sub: userId }, env.REFRESH_TOKEN_SECRET, {
      expiresIn: refreshExpiresIn,
    });
  }

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as { sub: string };
    } catch {
      throw new ApiError(400, "Invalid or expired token");
    }
  }
}
