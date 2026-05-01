import { UserModel } from "../../models/user.model";
import { BcryptService } from "../../services/hash.service";
import { JwtService } from "../../services/token.service";
import { ApiError } from "../../utils/api-error";
import { SignupDTO } from "./auth.validators";

const HashService = new BcryptService();
const TokenService = new JwtService();

export class AuthService {
  public async signup(data: SignupDTO) {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    // Create new user
    const user = new UserModel({
      email: data.email,
      password: data.password,
    });

    await user.save();
    return user;
  }
}
