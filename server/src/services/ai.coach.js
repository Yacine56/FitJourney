import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function coachSuggest({ user, totals, targets, remaining }) {
  if (!client) {
    console.warn("⚠️ No OPENAI_API_KEY set, returning empty tips");
    return [];
  }

  const system = `
You are a short, friendly fitness coach.
Give concise nutrition suggestions based on the user's day.
Avoid shaming, no medical claims. Use US common foods.
Return 3–5 tips, each under ~15 words.
Format: JSON array. Example:
["Have Greek yogurt for protein", "Add a banana for carbs"]
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

  const resp = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [
      { role: "system", content: system },
      { role: "user", content: `User data:\n${JSON.stringify(inputData, null, 2)}` },
      { role: "user", content: "Return only JSON array of tips." }
    ],
    response_format: {
      type: "json"
    }
  });

  const output = resp.output[0]?.content[0]?.text || "[]";

  try {
    const arr = JSON.parse(output);
    return Array.isArray(arr) ? arr.slice(0, 5) : [];
  } catch (e) {
    console.error("❌ AI JSON parse fail:", output);
    return [];
  }
}
