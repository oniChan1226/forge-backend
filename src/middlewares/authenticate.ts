import { env } from "../config/env";
import { JwtService } from "../services/token.service";
import { ApiError } from "../utils/errors/api-error";
import { asyncHandler } from "../utils/middleware-utils/async-handler";

const isDevelopment = env.NODE_ENV === "development";
const tokenService = new JwtService();

export const authenticate = asyncHandler(async (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken; // Expecting "Bearer <token>"

  if (!accessToken) {
    throw new ApiError(
      401,
      isDevelopment ? "Access token missing" : "Forbidden access to resource",
    );
  }

  const payload = tokenService.verifyAccessToken(accessToken);
  // Attach user info to request object for downstream handlers
  req.user = {
    _id: payload.sub,
  };

  next();
});
