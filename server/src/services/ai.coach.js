// services/ai.coach.js
import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Generate short coaching tips based on daily macros vs targets.
 *
 * @param {Object} params
 * @param {Object} params.user          - { weight, targetWeight }
 * @param {Object} params.totals        - { calories, protein, carbs, fats } eaten today
 * @param {Object} params.targets       - macro targets for the day
 * @param {Object} params.remaining     - macros remaining to reach targets
 * @returns {Promise<string[]>}         - array of tips (3–5 short strings)
 */
export async function coachSuggest({ user, totals, targets, remaining }) {
  if (!client) {
    console.warn("⚠️ No OPENAI_API_KEY set, returning empty tips");
    return [];
  }

  const system = `
You are a short, friendly fitness coach for a macro-based tracking app.
User data includes:
- current weight and target weight (lbs)
- today's total calories, protein, carbs, fats
- today's macro targets
- remaining macros for the day

REQUIREMENTS:
- Give 3–5 concise, practical tips (under ~15 words each).
- Base your advice on the numbers: totals vs targets vs remaining.
- If protein is low relative to target, suggest specific high-protein foods or meal ideas.
- If calories are already near/over the target, suggest lighter options and portion control.
- Never shame the user. Keep tone positive and encouraging.
- Use common foods available in US grocery stores.
- Do NOT mention that you are an AI or talk about JSON.
- IMPORTANT: Output ONLY valid JSON.

OUTPUT FORMAT:
Return a JSON object with a single key "tips" whose value is an array of strings.

Example:
{
  "tips": [
    "Add Greek yogurt or cottage cheese to boost protein.",
    "Choose grilled chicken instead of fried for dinner."
  ]
}
`;

  const inputData = {
    profile: {
      weight: user.weight,
      targetWeight: user.targetWeight,
    },
    todayTotals: totals,
    targets,
    remaining,
  };

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content:
            "Here is the user's macro data for today:\n" +
            JSON.stringify(inputData, null, 2) +
            "\n\nReturn ONLY the JSON object described above.",
        },
      ],
      // Ask the model to produce strict JSON
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 300,
    });

    let raw = completion.choices?.[0]?.message?.content ?? "";
    raw = raw.trim();

    // Debug once if you need it:
    // console.log("AI coach raw:", raw);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ AI coach JSON parse fail:", err.message, raw);
      return [];
    }

    if (Array.isArray(parsed)) {
      // In case the model returns a bare array
      return parsed.map(String).filter(Boolean);
    }

    if (parsed && Array.isArray(parsed.tips)) {
      return parsed.tips.map(String).filter(Boolean);
    }

    return [];
  } catch (err) {
    console.error("❌ AI coach OpenAI error:", err.message);
    return [];
  }
}
