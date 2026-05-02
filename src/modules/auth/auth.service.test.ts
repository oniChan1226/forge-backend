import { describe, expect, it, beforeEach, vi } from "vitest";

import { ApiError } from "../../utils/errors/api-error";

const serviceMocks = vi.hoisted(() => {
  const findOneMock = vi.fn();
  const userModelConstructorMock = vi.fn();
  const withTransactionMock = vi.fn();

  const UserModelMock = vi.fn((payload: Record<string, unknown>) => {
    return userModelConstructorMock(payload);
  }) as unknown as { findOne: typeof findOneMock };

  UserModelMock.findOne = findOneMock;

  return {
    UserModelMock,
    findOneMock,
    withTransactionMock,
    userModelConstructorMock,
  };
});

vi.mock("../../models", () => ({
  UserModel: serviceMocks.UserModelMock,
}));

vi.mock("../../utils/helpers/mongodb-transaction", () => ({
  withTransaction: serviceMocks.withTransactionMock,
}));

import { AuthService } from "./auth.service";

type MockHashService = {
  hash: ReturnType<typeof vi.fn>;
  compare: ReturnType<typeof vi.fn>;
};

type MockTokenService = {
  generateTokenPair: ReturnType<typeof vi.fn>;
  verifyRefreshToken: ReturnType<typeof vi.fn>;
};

type MockUserTokenService = {
  revokeAllUserTokens: ReturnType<typeof vi.fn>;
  createUserToken: ReturnType<typeof vi.fn>;
  isValidUserToken: ReturnType<typeof vi.fn>;
  revokeUserToken: ReturnType<typeof vi.fn>;
};

const buildService = () => {
  const hashService: MockHashService = {
    hash: vi.fn(),
    compare: vi.fn(),
  };

  const tokenService: MockTokenService = {
    generateTokenPair: vi.fn(),
    verifyRefreshToken: vi.fn(),
  };

  const userTokenService: MockUserTokenService = {
    revokeAllUserTokens: vi.fn(),
    createUserToken: vi.fn(),
    isValidUserToken: vi.fn(),
    revokeUserToken: vi.fn(),
  };

  const authService = new AuthService(
    hashService as never,
    tokenService as never,
    userTokenService as never,
  );

  return {
    authService,
    hashService,
    tokenService,
    userTokenService,
  };
};

const createLeanQuery = <T>(value: T) => ({
  select: vi.fn().mockReturnValue({
    lean: vi.fn().mockResolvedValue(value),
  }),
});

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    serviceMocks.withTransactionMock.mockImplementation(async (callback) => {
      return callback({ id: "session-1" });
    });

    serviceMocks.userModelConstructorMock.mockImplementation((payload: Record<string, unknown>) => ({
      save: vi.fn().mockResolvedValue(undefined),
      toObject: vi.fn().mockReturnValue({
        _id: "user-1",
        ...payload,
      }),
    }));
  });

  describe("signup", () => {
    it("throws conflict when user already exists", async () => {
      const { authService } = buildService();

      serviceMocks.findOneMock.mockResolvedValue({ _id: "existing-user" });

      await expect(
        authService.signup({
          name: "Ali",
          email: "ali@example.com",
          password: "secret123",
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "User with this email already exists",
      });
    });

    it("hashes password, creates user in transaction, and returns sanitized payload", async () => {
      const { authService, hashService } = buildService();

      serviceMocks.findOneMock.mockResolvedValue(null);
      hashService.hash.mockResolvedValue("hashed-password");

      const result = await authService.signup({
        name: "Ali",
        email: "ali@example.com",
        password: "secret123",
      });

      expect(serviceMocks.findOneMock).toHaveBeenCalledWith({ email: "ali@example.com" });
      expect(hashService.hash).toHaveBeenCalledWith("secret123");
      expect(serviceMocks.withTransactionMock).toHaveBeenCalledTimes(1);
      expect(serviceMocks.UserModelMock).toHaveBeenCalledWith({
        name: "Ali",
        email: "ali@example.com",
        password: "hashed-password",
      });
      expect(result).toEqual({
        _id: "user-1",
        name: "Ali",
        email: "ali@example.com",
      });
      expect(result).not.toHaveProperty("password");
    });
  });

  describe("login", () => {
    it("throws unauthorized when user is not found", async () => {
      const { authService } = buildService();

      serviceMocks.findOneMock.mockReturnValue(createLeanQuery(null));

      await expect(
        authService.login({
          email: "ali@example.com",
          password: "secret123",
        }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid email or password",
      });
    });

    it("throws unauthorized when password does not match", async () => {
      const { authService, hashService } = buildService();

      serviceMocks.findOneMock.mockReturnValue(
        createLeanQuery({
          _id: "user-1",
          email: "ali@example.com",
          password: "stored-hash",
          name: "Ali",
        }),
      );
      hashService.compare.mockResolvedValue(false);

      await expect(
        authService.login({
          email: "ali@example.com",
          password: "wrong-password",
        }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid email or password",
      });
    });

    it("revokes old tokens, creates new token, and returns sanitized user", async () => {
      const { authService, hashService, tokenService, userTokenService } = buildService();

      serviceMocks.findOneMock.mockReturnValue(
        createLeanQuery({
          _id: "user-1",
          email: "ali@example.com",
          password: "stored-hash",
          name: "Ali",
        }),
      );
      hashService.compare.mockResolvedValue(true);
      tokenService.generateTokenPair.mockReturnValue({
        accessToken: "access-1",
        refreshToken: "refresh-1",
      });

      const result = await authService.login({
        email: "ali@example.com",
        password: "secret123",
      });

      expect(userTokenService.revokeAllUserTokens).toHaveBeenCalledWith("user-1");
      expect(tokenService.generateTokenPair).toHaveBeenCalledWith("user-1");
      expect(userTokenService.createUserToken).toHaveBeenCalledWith("refresh-1", "user-1");
      expect(result).toEqual({
        user: {
          _id: "user-1",
          email: "ali@example.com",
          name: "Ali",
        },
        token: {
          accessToken: "access-1",
          refreshToken: "refresh-1",
        },
      });
      expect(result.user).not.toHaveProperty("password");
    });
  });

  describe("refreshToken", () => {
    it("throws unauthorized when token is not valid in store", async () => {
      const { authService, tokenService, userTokenService } = buildService();

      tokenService.verifyRefreshToken.mockReturnValue({ sub: "user-1" });
      userTokenService.isValidUserToken.mockResolvedValue(false);

      await expect(authService.refreshToken("refresh-1")).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid refresh token",
      });
    });

    it("throws not found when revoke returns false", async () => {
      const { authService, tokenService, userTokenService } = buildService();

      tokenService.verifyRefreshToken.mockReturnValue({ sub: "user-1" });
      userTokenService.isValidUserToken.mockResolvedValue(true);
      userTokenService.revokeUserToken.mockResolvedValue(false);

      await expect(authService.refreshToken("refresh-1")).rejects.toMatchObject({
        statusCode: 404,
        message: "User token not found or already revoked",
      });
    });

    it("rotates refresh token and returns a new pair", async () => {
      const { authService, tokenService, userTokenService } = buildService();

      tokenService.verifyRefreshToken.mockReturnValue({ sub: "user-1" });
      userTokenService.isValidUserToken.mockResolvedValue(true);
      userTokenService.revokeUserToken.mockResolvedValue(true);
      tokenService.generateTokenPair.mockReturnValue({
        accessToken: "access-2",
        refreshToken: "refresh-2",
      });

      const result = await authService.refreshToken("refresh-1");

      expect(userTokenService.isValidUserToken).toHaveBeenCalledWith("refresh-1", "user-1");
      expect(userTokenService.revokeUserToken).toHaveBeenCalledWith("refresh-1", "user-1");
      expect(tokenService.generateTokenPair).toHaveBeenCalledWith("user-1");
      expect(userTokenService.createUserToken).toHaveBeenCalledWith("refresh-2", "user-1");
      expect(result).toEqual({
        accessToken: "access-2",
        refreshToken: "refresh-2",
      });
    });
  });

  it("throws ApiError instances for domain failures", async () => {
    const { authService } = buildService();

    serviceMocks.findOneMock.mockResolvedValue({ _id: "existing-user" });

    await expect(
      authService.signup({
        name: "Ali",
        email: "ali@example.com",
        password: "secret123",
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
