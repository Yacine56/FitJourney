import Meal from "../models/Meal.js";
import Workout from "../models/Workout.js";
import WeightProgress from "../models/WeightProgress.js";

export async function getDashboardData(req, res) {
  try {
    const userId = req.userId; // ✅ instead of req.user._id
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: missing user ID" });
    }

    // 🔹 1. Calories Intake (group by day)
    const meals = await Meal.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalCalories: { $sum: "$calories" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 🔹 2. Weight Progress (sorted by date)
    const weights = await WeightProgress.find({ userId })
      .sort({ createdAt: 1 })
      .select("weight createdAt -_id");

    // 🔹 3. Last Workout Session
    const lastWorkoutDate = await Workout.findOne({ userId })
      .sort({ createdAt: -1 })
      .select("createdAt");

    let lastWorkouts = [];
    if (lastWorkoutDate) {
      const formattedDate = new Date(lastWorkoutDate.createdAt)
        .toISOString()
        .split("T")[0];
      lastWorkouts = await Workout.find({
        userId,
        createdAt: {
          $gte: new Date(formattedDate),
          $lt: new Date(new Date(formattedDate).setDate(new Date(formattedDate).getDate() + 1)),
        },
      }).select("name sets reps weight notes");
    }

    res.json({
      caloriesByDay: meals,
      weightProgress: weights,
      lastWorkout: lastWorkouts,
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
}
