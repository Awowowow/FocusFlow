import { describe, expect, it } from "vitest";
import { env } from "../config/env.js";
import { suggestTask } from "./ai.service.js";

describe("task suggestion service", () => {
  it("provides a usable local suggestion when Gemini is not configured", async () => {
    const apiKey = env.GEMINI_API_KEY;
    let suggestion;
    try {
      env.GEMINI_API_KEY = "";
      suggestion = await suggestTask("  follow up with designer ");
    } finally {
      env.GEMINI_API_KEY = apiKey;
    }

    expect(suggestion).toEqual({
      title: "Follow up with designer",
      description: "Complete this task: follow up with designer. Add any key details or follow-up steps before starting.",
      source: "fallback",
    });
  });
});
