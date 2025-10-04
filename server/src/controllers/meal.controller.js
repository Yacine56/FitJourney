import Meal from "../models/Meal.js";
import { fetchNutritionix } from "../services/nutritionix.api.js";

/** POST /api/meals
 * Body: { mealName, calories, protein, carbs, fats }
 */
export async function createMeal(req, res) {
  try {
    const { mealName, calories, protein, carbs, fats } = req.body;

    if (!mealName || calories == null || protein == null || carbs == null || fats == null) {
      return res.status(400).json({ error: "Meal must include name, calories, protein, carbs, fats." });
    }

    const meal = await Meal.create({
      user: req.userId,
      mealName,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
    });

    res.status(201).json({ meal });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save meal." });
  }
}

/** GET /api/meals?date=YYYY-MM-DD */
export async function getMeals(req, res) {
  try {
    const filter = { user: req.userId };
    if (req.query.date) {
      const [y, m, d] = req.query.date.split("-").map(Number);
      const start = new Date(y, m - 1, d, 0, 0, 0);
      const end = new Date(y, m - 1, d, 23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lt: end };
    }
    const meals = await Meal.find(filter).sort({ createdAt: -1 });
    res.json({ items: meals });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch meals." });
  }
}

/** PATCH /api/meals/:id */
export async function updateMeal(req, res) {
  try {
    const { id } = req.params;
    const meal = await Meal.findOne({ _id: id, user: req.userId });
    if (!meal) return res.status(404).json({ error: "Meal not found" });

    ["mealName", "calories", "protein", "carbs", "fats"].forEach((field) => {
      if (req.body[field] !== undefined) meal[field] = req.body[field];
    });

    await meal.save();
    res.json({ meal });
  } catch (e) {
    res.status(500).json({ error: "Failed to update meal." });
  }
}

/** DELETE /api/meals/:id */
export async function deleteMeal(req, res) {
  try {
    const { id } = req.params;
    const meal = await Meal.findOneAndDelete({ _id: id, user: req.userId });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete meal." });
  }
}

/** GET /api/meals/search?query=chicken */
export async function searchMeals(req, res) {
  try {
    const query = (req.query.query || "").trim();
    if (!query) return res.status(400).json({ error: "Query is required" });

    const results = await fetchNutritionix(query);
    res.json({ results });
  } catch (e) {
    res.status(502).json({ error: e.message || "Failed to fetch from Nutritionix" });
  }
}
