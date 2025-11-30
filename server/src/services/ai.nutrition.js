import OpenAI from "openai";
import crypto from "crypto";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/* ----------- Small cache to reduce API cost ----------- */
const cache = new Map();
const keyOf = (q) => "nutri:" + crypto.createHash("sha256").update(q).digest("hex");

/* ----------- JSON schema ----------- */
const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          mealName: { type: "string" },
          quantity: { type: "number" },
          unit: { 
            type: "string",
            enum: ["g","ml","cup","tbsp","tsp","piece","slice","oz","egg","banana","apple"] 
          },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fats: { type: "number" }
        },
        required: ["mealName","calories","protein","carbs","fats"]
      }
    },
    notes: { type: "string" }
  },
  required: ["items"]
};

/* ----------- System Prompt Rules ----------- */
const system = [
  "You convert messy meal text into structured nutrition JSON.",
  "Your purpose: extract ONLY actual food items with quantities and units.",

  "HARD RULES:",
  "1) NEVER return the original sentence or any part of it.",
  "2) Remove ALL verbs and filler words: 'I', 'ate', 'had', 'drank', 'with', 'for', 'my', 'meal', 'today'.",
  "3) ALWAYS keep numbers and food units (e.g., '250g', '2', '1 cup').",
  "4) If user gives quantity, keep EXACT amount.",
  "5) If no amount given:",
  "   - Whole fruits default = 1 Whole",
  "   - Cooked foods default = 100 g or 1 cup",
  "6) If user gives fruit count (e.g., '3 bananas'):",
  "   quantity MUST equal fruit count",
  "   unit MUST be 'piece'",
  "   NEVER use fruit name as the unit.",
  "If user gives non-fruit count (e.g., '2 eggs'):quantity = 1",
  "7) Split foods by commas or 'and'.",
  "8) DO NOT split attached food descriptors (e.g., 'mashed potatoes with gravy').",
  "9) EACH food must be its own JSON object.",

  "NUMERIC RULES:",
  "• Calories → whole number",
  "• Protein/carbs/fat → 2 decimals",
  "• Use realistic nutrition values.",

  "VALID FORMAT:",
  "Each food must follow: <quantity> <unit> <food name>",

  "OUTPUT RULES:",
  "• Return ONLY JSON",
  "• No explanation text",
  "• Never repeat input",
].join(" ");


/* ----------- Few-shot Examples to enforce behavior ----------- */
const fewShot = [
  {
    role: "user",
    content: "i ate mashed potato with gravy and two boiled eggs"
  },
  {
    role: "assistant",
    content: JSON.stringify({
      items: [
        {
          mealName: "mashed potato with gravy",
          quantity: 1, unit: "cup",
          calories: 210, protein: 4, carbs: 36, fats: 7
        },
        {
          mealName: "boiled egg",
          quantity: 2, unit: "egg",
          calories: 140, protein: 12, carbs: 2, fats: 10
        }
      ],
      notes: "Default 1 cup mashed potatoes; per-egg values ×2."
    })
  },
  {
    role: "user",
    content: "250 g rice, 1 cup lentil soup and a banana"
  },
  {
    role: "assistant",
    content: JSON.stringify({
      items: [
        { mealName: "rice", quantity: 250, unit: "g", calories: 325, protein: 6, carbs: 72, fats: 1 },
        { mealName: "lentil soup", quantity: 1, unit: "cup", calories: 180, protein: 11, carbs: 32, fats: 3 },
        { mealName: "banana", quantity: 1, unit: "banana", calories: 105, protein: 1.3, carbs: 27, fats: 0.3 }
      ],
      notes: ""
    })
  }
];

/* ----------- MAIN FUNCTION ----------- */
export async function aiParseNutrition(query) {
  const clean = query.trim().toLowerCase();
  const key = keyOf(clean);
  if (cache.has(key)) return cache.get(key);

  try {
    const resp = await client.responses.create({
      model: MODEL,
      input: [
        { role: "system", content: system },
        ...fewShot,
        { role: "user", content: `Parse this into separate food items: "${query}"` }
      ],
      temperature: 0.1,
      max_output_tokens: 900
    });

    const content = resp.output_text ?? resp.output?.[0]?.content?.[0]?.text;
    let data = JSON.parse(content);

    const items = (data.items || []).map((x) => ({
      mealName: String(x.mealName || "").slice(0, 120),
      calories: Math.round(Number(x.calories) || 0),
      protein: Math.round((Number(x.protein) || 0) * 100) / 100,
      carbs: Math.round((Number(x.carbs) || 0) * 100) / 100,
      fats: Math.round((Number(x.fats) || 0) * 100) / 100,
      quantity: x.quantity == null ? 1 : Math.max(1, Math.round(Number(x.quantity))),
      unit: x.unit || undefined
    }));

    const result = { items, notes: data.notes || "" };
    cache.set(key, result);
    return result;

  } catch (err) {
    console.error("AI nutrition error:", err);
    throw new Error("Failed to get nutrition info via AI");
  }
}
