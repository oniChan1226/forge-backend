import { AuthService } from "./auth.service";

export class AuthController {
    // Implement controller methods here (e.g., login, register)
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }
    
}