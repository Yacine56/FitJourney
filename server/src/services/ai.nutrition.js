import OpenAI from "openai";
import crypto from "crypto";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const cache = new Map();
const k = (q) => "nutri:" + crypto.createHash("sha256").update(q).digest("hex");

export async function aiParseNutrition(query) {
  query = query.trim().toLowerCase();
  const cacheKey = k(query);
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const functionDef = {
    name: "return_nutrition_data",
    description: "Return nutrition info for food query",
    parameters: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mealName: { type: "string" },
              calories: { type: "number" },
              protein: { type: "number" },
              carbs: { type: "number" },
              fats: { type: "number" }
            },
            required: ["mealName", "calories", "protein", "carbs", "fats"]
          }
        }
      },
      required: ["items"]
    }
  };

  const systemPrompt = `
You are a nutrition assistant. Extract calories and macros.
If serving not given, assume a realistic portion.
Round calories to integers and macros to 2 decimals.
`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      functions: [functionDef],
      function_call: { name: "return_nutrition_data" },
      temperature: 0.2
    });

    const toolData = JSON.parse(
      response.choices[0].message.function_call.arguments
    );

    // normalize
    const items = toolData.items.map(x => ({
      mealName: x.mealName,
      calories: Math.round(x.calories),
      protein: Number(x.protein.toFixed(2)),
      carbs: Number(x.carbs.toFixed(2)),
      fats: Number(x.fats.toFixed(2))
    }));

    const result = { items };
    cache.set(cacheKey, result);
    return result;

  } catch (err) {
    console.error("AI nutrition error:", err);
    throw new Error("Failed to fetch nutrition info");
  }
}
