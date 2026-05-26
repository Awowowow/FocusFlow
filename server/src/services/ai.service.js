import OpenAI from "openai";
import { env } from "../config/env.js";

function fallbackSuggestion(input) {
  const cleaned = input.trim().replace(/\s+/g, " ");
  const title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return {
    title,
    description: `Complete this task: ${cleaned}. Add any key details or follow-up steps before starting.`,
    source: "fallback",
  };
}

export async function suggestTask(input) {
  if (!env.OPENAI_API_KEY) return fallbackSuggestion(input);
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  try {
    const response = await client.responses.create({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: "Turn a user's rough task into a practical title and one-sentence description. Return JSON only with title and description. Keep the title under 80 characters and do not invent specifics.",
        },
        { role: "user", content: input },
      ],
    });
    const parsed = JSON.parse(response.output_text);
    if (typeof parsed.title === "string" && typeof parsed.description === "string") {
      return { title: parsed.title.slice(0, 120), description: parsed.description.slice(0, 1000), source: "ai" };
    }
  } catch (error) {
    console.warn("AI suggestion unavailable; using fallback.", error.message);
  }
  return fallbackSuggestion(input);
}

