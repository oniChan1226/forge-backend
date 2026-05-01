import { ApiResponse } from "../../utils/http/api-response";
import { asyncHandler } from "../../utils/middleware-utils/async-handler";
import { UserService } from "./user.service";

const userService = new UserService();

export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user!._id;
  const user = await userService.me(userId);
  res.status(200).json(new ApiResponse(200, "User profile retrieved successfully", user));
});
