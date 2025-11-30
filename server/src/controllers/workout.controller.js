import Workout from "../models/Workout.js";
import { categoryFromType } from "../utils/workouts.js";

/** POST /api/workouts
 * Body: { name, type, muscle, equipment, sets, reps, weight?, notes? }
 */
export async function createWorkout(req, res) {
  try {
    const { name, type, muscle, equipment, sets, reps, weight, notes } = req.body;

    if (!name || !type || !muscle || !equipment) {
      return res.status(400).json({ error: "Workout must include name/type/muscle/equipment." });
    }

    const setsNum = Number(sets);
    const repsNum = Number(reps);
    if (!Number.isInteger(setsNum) || setsNum < 1) {
      return res.status(400).json({ error: "Sets must be an integer ≥ 1." });
    }
    if (!Number.isInteger(repsNum) || repsNum < 1) {
      return res.status(400).json({ error: "Reps must be an integer ≥ 1." });
    }

    let weightNum;
    if (weight !== undefined && weight !== null && `${weight}`.trim() !== "") {
      const asNum = Number(weight);
      if (Number.isNaN(asNum)) {
        return res.status(400).json({ error: "Weight must be numeric if provided." });
      }
      weightNum = asNum;
    }

    const category = categoryFromType(type);

    const workout = await Workout.create({
      user: req.userId,
      name,
      type,
      muscle,
      equipment,
      sets: setsNum,
      reps: repsNum,
      weight: weightNum,
      notes: notes?.trim() || "",
      category,
    });

    res.status(201).json({ workout });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save workout." });
  }
}

/** GET /api/workouts?date=YYYY-MM-DD
 * Returns workouts for the current user, filtered by date if provided
 */
/** GET /api/workouts?date=YYYY-MM-DD */
export async function getWorkouts(req, res) {
  try {
    const filter = { user: req.userId };
    const { date, tzOffset } = req.query;

    if (date) {
      const [year, month, day] = date.split("-").map(Number);

      const offsetMin = Number(tzOffset ?? 0); // e.g. 360 for UTC-6

      // Local midnight in UTC ms
      const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);

      // Convert local [00:00, next-day 00:00) to UTC range
      const startMs = utcMidnight - offsetMin * 60 * 1000;
      const endMs   = startMs + 24 * 60 * 60 * 1000;

      filter.createdAt = {
        $gte: new Date(startMs),
        $lt:  new Date(endMs),
      };
    }

    const workouts = await Workout.find(filter).sort({ createdAt: 1 });
    res.json({ items: workouts });
  } catch (e) {
    console.error("Failed to fetch workouts:", e);
    res.status(500).json({ error: "Failed to fetch workouts." });
  }
}



/** PATCH /api/workouts/:id
 * Body: { sets?, reps?, weight?, notes? }
 */
export async function updateWorkout(req, res) {
  try {
    const { id } = req.params;
    const { sets, reps, weight, notes } = req.body;

    const workout = await Workout.findOne({ _id: id, user: req.userId });
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    if (sets !== undefined) workout.sets = Number(sets);
    if (reps !== undefined) workout.reps = Number(reps);
    if (weight !== undefined) workout.weight = Number(weight);
    if (notes !== undefined) workout.notes = notes.trim();

    await workout.save();
    res.json({ workout });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update workout." });
  }
}

/** DELETE /api/workouts/:id */
export async function deleteWorkout(req, res) {
  try {
    const { id } = req.params;

    const workout = await Workout.findOneAndDelete({ _id: id, user: req.userId });
    if (!workout) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete workout." });
  }
}
