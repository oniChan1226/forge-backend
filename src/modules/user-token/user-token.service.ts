import { UserTokenModel } from "../../models";
import crypto from "crypto";

export interface UserTokenService {
  isValidUserToken(token: string, userId: string): Promise<boolean>;

  revokeUserToken(token: string, userId: string): Promise<boolean>;

  createUserToken(token: string, userId: string, expiresIn?: number): Promise<any>;
}

export class UserTokenService implements UserTokenService {
  constructor() {}

  private hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  public async isValidUserToken(token: string, userId: string) {
    const tokenDoc = await UserTokenModel.findOne({
      token: this.hashToken(token),
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
    return !!tokenDoc;
  }

  public async revokeUserToken(token: string, userId: string) {
    const result = await UserTokenModel.updateOne(
      { token: this.hashToken(token), userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );

    return result.modifiedCount > 0;
  }

  public async createUserToken(
    token: string,
    userId: string,
    expiresIn: number = 7 * 24 * 60 * 60,
  ) {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    const userToken = new UserTokenModel({
      userId,
      token: this.hashToken(token),
      expiresAt,
    });

    return userToken.save();
  }
}
