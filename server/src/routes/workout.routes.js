import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
} from "../controllers/workout.controller.js";
import { fetchExercisesByMuscle } from "../services/exercises.api.js";

const r = Router();

// GET /api/workouts/search?muscle=biceps
r.get("/search", requireAuth, async (req, res) => {
  try {
    const muscle = (req.query.muscle || "").toLowerCase().trim();
    if (!muscle) {
      return res.status(400).json({ error: "Query param 'muscle' is required" });
    }

    const list = await fetchExercisesByMuscle(muscle);
    const simplified = list.map((x) => ({
      name: x.name,
      type: x.type,
      muscle: x.muscle,
      equipment: x.equipment,
    }));

    res.json({ results: simplified });
  } catch (e) {
    res.status(502).json({ error: e.message || "Failed to fetch exercises" });
  }
});

// Workouts CRUD
r.get("/", requireAuth, getWorkouts);      // includes optional date filtering
r.post("/", requireAuth, createWorkout);
r.patch("/:id", requireAuth, updateWorkout);
r.delete("/:id", requireAuth, deleteWorkout);

export default r;