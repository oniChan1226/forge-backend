import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const controllerMocks = vi.hoisted(() => ({
  signupMock: vi.fn((_req: Request, res: Response) =>
    res.status(201).json({ ok: true, route: "signup" }),
  ),
  loginMock: vi.fn((_req: Request, res: Response) =>
    res.status(200).json({ ok: true, route: "login" }),
  ),
  refreshTokenMock: vi.fn((_req: Request, res: Response) =>
    res.status(200).json({ ok: true, route: "refresh-token" }),
  ),
}));

vi.mock("./auth.controller", () => ({
  signup: controllerMocks.signupMock,
  login: controllerMocks.loginMock,
  refreshToken: controllerMocks.refreshTokenMock,
}));

import { authRouter } from "./auth.routes";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRouter);

  const getErrorRecord = (value: unknown): Record<string, unknown> | null => {
    if (typeof value === "object" && value !== null) {
      return value as Record<string, unknown>;
    }

    return null;
  };

  // Minimal error handler to capture ApiError from validation middleware.
  const testErrorHandler: ErrorRequestHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const errorRecord = getErrorRecord(err);
    const statusCode = errorRecord?.statusCode;
    const message = errorRecord?.message;
    const details = errorRecord?.details;

    const status = typeof statusCode === "number" ? statusCode : 500;

    res.status(status).json({
      message: typeof message === "string" ? message : "Unhandled error",
      errors: details,
    });
  };

  app.use(testErrorHandler);

  return app;
};

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /auth/signup calls signup controller for valid payload", async () => {
    const app = createTestApp();

    const response = await request(app).post("/auth/signup").send({
      name: "Ali",
      email: "ali@example.com",
      password: "secret123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ ok: true, route: "signup" });
    expect(controllerMocks.signupMock).toHaveBeenCalledTimes(1);
    expect(controllerMocks.loginMock).not.toHaveBeenCalled();
    expect(controllerMocks.refreshTokenMock).not.toHaveBeenCalled();
  });

  it("POST /auth/signup blocks invalid payload before controller", async () => {
    const app = createTestApp();

    const response = await request(app).post("/auth/signup").send({
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation error");
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(controllerMocks.signupMock).not.toHaveBeenCalled();
  });

  it("POST /auth/login calls login controller for valid payload", async () => {
    const app = createTestApp();

    const response = await request(app).post("/auth/login").send({
      email: "ali@example.com",
      password: "secret123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, route: "login" });
    expect(controllerMocks.loginMock).toHaveBeenCalledTimes(1);
    expect(controllerMocks.signupMock).not.toHaveBeenCalled();
    expect(controllerMocks.refreshTokenMock).not.toHaveBeenCalled();
  });

  it("POST /auth/login blocks invalid payload before controller", async () => {
    const app = createTestApp();

    const response = await request(app).post("/auth/login").send({
      email: "ali@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation error");
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(controllerMocks.loginMock).not.toHaveBeenCalled();
  });

  it("POST /auth/refresh-token always reaches refresh controller", async () => {
    const app = createTestApp();

    const response = await request(app).post("/auth/refresh-token").send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, route: "refresh-token" });
    expect(controllerMocks.refreshTokenMock).toHaveBeenCalledTimes(1);
    expect(controllerMocks.signupMock).not.toHaveBeenCalled();
    expect(controllerMocks.loginMock).not.toHaveBeenCalled();
  });
});
