import OpenAI from "openai";
import crypto from "crypto";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Tiny in-memory cache (optional but cost-friendly).
 */
const cache = new Map();
const keyOf = (q) => "nutri:" + crypto.createHash("sha256").update(q).digest("hex");

/**
 * Parse a free-text meal query and return structured nutrition.
 * We use OpenAI Responses API with a JSON schema for reliable fields.
 */
export async function aiParseNutrition(query) {
  const cacheKey = keyOf(query.trim().toLowerCase());
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            // Friendly display
            mealName: { type: "string" },
            // Parsed serving
            quantity: { type: "number" },
            unit: { type: "string", enum: ["g", "ml", "cup", "tbsp", "tsp", "piece", "slice", "oz"] },
            // Macros (per the parsed serving)
            calories: { type: "number" },
            protein: { type: "number" }, // grams
            carbs: { type: "number" },   // grams
            fats: { type: "number" }     // grams
          },
          required: ["mealName", "calories", "protein", "carbs", "fats"],
        }
      },
      notes: { type: "string" }
    },
    required: ["items"]
  };

  const system = [
    "You extract nutrition for everyday foods from short text.",
    "Assume common items if ambiguous. Choose realistic default sizes when none are given.",
    "Units: grams for macros; calories in kcal.",
    "Return values for the amount the user wrote (e.g., '250g rice', '2 bananas and 1 cup milk').",
    "Round calories to the nearest integer; macros to 2 decimals.",
    "Keep items separate (one entry per matched food)."
  ].join(" ");

  const user = `User query: "${query}"`;

  const resp = await client.responses.create({
    model: MODEL,
    input: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "nutrition", schema, strict: true }
    },
    temperature: 0.2
  });

  // Responses API returns content->[json]
  const content = resp.output?.[0]?.content?.[0];
  const json = content?.type === "json" ? JSON.parse(content.text) : JSON.parse(resp.output_text);

  // Normalize & safety guards
  const items = (json.items || []).map((x) => ({
    mealName: String(x.mealName || "").slice(0, 120) || "item",
    calories: Math.round(Number(x.calories) || 0),
    protein: Number(x.protein ?? 0),
    carbs: Number(x.carbs ?? 0),
    fats: Number(x.fats ?? 0),
    // optional display units (not required by your DB, but nice to keep)
    quantity: x.quantity == null ? undefined : Number(x.quantity),
    unit: x.unit || undefined,
  }));

  const result = { items, notes: json.notes || "" };

  cache.set(cacheKey, result);
  return result;
}
