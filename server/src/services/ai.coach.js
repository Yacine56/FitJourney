// backend/services/ai.coach.js

import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function coachSuggest({ user, totals, targets, remaining }) {
  if (!client) {
    console.warn("⚠️ AI Coach disabled: No OPENAI_API_KEY");
    return null;
  }

  const system = `
You are a short, friendly fitness coach.
Give concise helpful nutrition tips (10–15 words max).
Return ONLY a JSON array of strings.
Example:
["Have Greek yogurt for protein", "Add a banana for extra carbs"]
`;

  const inputData = {
    profile: {
      weight: user.weight,
      targetWeight: user.targetWeight,
    },
    today: totals,
    targets,
    remaining,
  };

  try {
    const resp = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(inputData) },
      ],
      response_format: { type: "json" }
    });

    const raw = resp.output?.[0]?.content?.[0]?.text || "[]";

    let arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;

    return arr.slice(0, 5);

  } catch (e) {
    console.error("❌ AI Coach Error:", e);
    return null;
  }
}
