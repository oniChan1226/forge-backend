import { Router } from "express";


const router = Router();

// Import controller methods
import { AuthController } from "./auth.controller";
const authController = new AuthController();

// router.post("/signup", authController.signup);

export default router;