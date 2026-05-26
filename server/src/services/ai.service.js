import { env } from "../config/env.js";

const systemInstruction =
  "Turn a user's rough task into a practical title and one-sentence description. Keep the title under 80 characters. Do not invent people, tools, deadlines, or facts that were not provided.";

const suggestionSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "A clear actionable task title." },
    description: { type: "string", description: "A one-sentence practical next step." },
  },
  required: ["title", "description"],
};

const fallbackSuggestion = (input) => {
  const cleaned = input.trim().replace(/\s+/g, " ");
  const title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return {
    title,
    description: `Complete this task: ${cleaned}. Add any key details or follow-up steps before starting.`,
    source: "fallback",
  };
};

export const suggestTask = async (input) => {
  if (!env.GEMINI_API_KEY) return fallbackSuggestion(input);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: input }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: suggestionSchema,
            temperature: 0.2,
            maxOutputTokens: 240,
          },
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);
    if (typeof parsed.title === "string" && typeof parsed.description === "string") {
      return {
        title: parsed.title.trim().slice(0, 120),
        description: parsed.description.trim().slice(0, 1000),
        source: "gemini",
      };
    }
  } catch (error) {
    console.warn("Gemini suggestion unavailable; using fallback.", error.message);
  }

  return fallbackSuggestion(input);
};
