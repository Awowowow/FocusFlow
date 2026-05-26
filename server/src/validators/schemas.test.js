import { describe, expect, it } from "vitest";
import { createLogSchema, createTaskSchema, registerSchema } from "./schemas.js";

describe("input validation", () => {
  it("rejects a weak password during registration", () => {
    const result = registerSchema.safeParse({ name: "Aarav", email: "aarav@example.com", password: "password", timezone: "Asia/Kolkata" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid user timezones", () => {
    const result = registerSchema.safeParse({ name: "Aarav", email: "aarav@example.com", password: "pass12345", timezone: "Mars/Office" });
    expect(result.success).toBe(false);
  });

  it("normalizes whitespace in new task titles", () => {
    const result = createTaskSchema.parse({ title: "  Prepare backend demo  " });
    expect(result.title).toBe("Prepare backend demo");
  });

  it("does not accept backwards time log intervals", () => {
    const result = createLogSchema.safeParse({
      taskId: "task-id",
      startedAt: "2026-05-26T10:00:00.000Z",
      endedAt: "2026-05-26T09:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});
