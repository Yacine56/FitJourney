import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createMeal,
  getMeals,
  updateMeal,
  deleteMeal,
  searchMeals,
} from "../controllers/meal.controller.js";

const r = Router();

r.get("/search", requireAuth, searchMeals);
r.get("/", requireAuth, getMeals);
r.post("/", requireAuth, createMeal);
r.patch("/:id", requireAuth, updateMeal);
r.delete("/:id", requireAuth, deleteMeal);

export default r;
