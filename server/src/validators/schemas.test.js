import { describe, expect, it } from "vitest";
import { createTaskSchema, registerSchema } from "./schemas.js";

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
});

