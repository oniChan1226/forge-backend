import { Router } from "express";
// Import controller methods
import { AuthController } from "./auth.controller";
import { asyncHandler } from "../../utils/async-handler";
import { AuthService } from "./auth.service";

const router = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

router.post("/signup", asyncHandler(authController.signup));

export default router;