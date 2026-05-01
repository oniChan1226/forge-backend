import { UserModel } from "../../models";
import { BcryptService } from "../../services/hash.service";
import { JwtService } from "../../services/token.service";
import { ApiError } from "../../utils/errors/api-error";
import { withTransaction } from "../../utils/helpers/mongodb-transaction";
import { UserTokenService } from "../user-token/user-token.service";
import { LoginDTO, SignupDTO } from "./auth.validators";

export class AuthService {
  constructor(
    private readonly hashService: BcryptService,
    private readonly tokenService: JwtService,
    private readonly userTokenService: UserTokenService,
  ) {}
  public async signup(data: SignupDTO) {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const passwordHash = await this.hashService.hash(data.password);

    // Create new user within transaction
    // This ensures that if we later want to create related documents (e.g., tokens), we can do so atomically
    return withTransaction(async (session) => {
      const user = new UserModel({
        ...data,
        password: passwordHash,
      });

      await user.save({ session });
      const { password, ...sanitizedUser } = user.toObject();
      return sanitizedUser;
    });
  }

  public async login(data: LoginDTO) {
    const user = await UserModel.findOne({ email: data.email }).select("+password").lean();
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await this.hashService.compare(data.password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = this.tokenService.generateTokenPair(user._id.toString());
    await this.userTokenService.createUserToken(token.refreshToken, user._id.toString());

    const { password, ...sanitizedUser } = user;

    return { user: sanitizedUser, token };
  }

  public async refreshToken(refreshToken: string) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const userId = payload.sub;

    const isvalid = await this.userTokenService.isValidUserToken(refreshToken, userId);
    if (!isvalid) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const x = await this.userTokenService.revokeUserToken(refreshToken, userId);
    if (!x) {
      throw new ApiError(404, "User token not found or already revoked");
    }

    const token = this.tokenService.generateTokenPair(userId);
    await this.userTokenService.createUserToken(token.refreshToken, userId);
    return { token };
  }
}
