import { AuthService } from "./auth.service";
import { Request, Response } from "express";

export class AuthController {
  // Implement controller methods here (e.g., login, register)
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public signup = async (req: Request, res: Response) => {
    const body = req.body;
  };
}
