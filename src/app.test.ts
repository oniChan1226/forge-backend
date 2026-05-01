import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./app";

describe("Health and root routes", () => {
  it("returns root status", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Backend service is running");
  });

  it("returns liveness status", async () => {
    const response = await request(app).get("/api/v1/health/live");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns simulated ApiError payloads", async () => {
    const response = await request(app).get("/api/v1/dev/errors/conflict");

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Simulated conflict");
    expect(response.body.errors).toEqual({
      field: "email",
      reason: "Duplicate resource",
    });
  });

  it("returns validation errors from Zod middleware", async () => {
    const response = await request(app)
      .post("/api/v1/dev/errors/validation/body")
      .send({ scenario: "bad-request" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation error");
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it("returns simulated generic server errors", async () => {
    const response = await request(app).get("/api/v1/dev/errors/runtime");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Simulated unexpected server failure");
  });
});
