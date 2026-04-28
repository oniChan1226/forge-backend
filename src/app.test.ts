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
});
