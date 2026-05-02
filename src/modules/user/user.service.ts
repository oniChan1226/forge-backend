import { UserModel } from "../../models";
import { ApiError } from "../../utils/errors/api-error";

export class UserService {
  public async me(userId: string) {
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const { password: _password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
