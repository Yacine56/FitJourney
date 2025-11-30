// controllers/dashboard.controller.js
import mongoose from "mongoose";
import Meal from "../models/Meal.js";
import Workout from "../models/Workout.js";
import WeightProgress from "../models/WeightProgress.js";
import User from "../models/User.js";
import { coachSuggest } from "../services/ai.coach.js";

export async function getDashboardData(req, res) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: missing user ID" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 🔹 1) Calories Intake by day
    const meals = await Meal.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalCalories: { $sum: "$calories" },
          protein: { $sum: "$protein" },
          carbs: { $sum: "$carbs" },
          fats: { $sum: "$fats" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 🔹 2) Weight Progress
    const weights = await WeightProgress.find({ user: userId })
      .sort({ date: 1 })
      .select("weight date -_id");

    // 🔹 3) Last workout session
    const lastWorkoutDate = await Workout.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .select("createdAt");

    let lastWorkouts = [];
    if (lastWorkoutDate) {
      const formattedDate = new Date(lastWorkoutDate.createdAt)
        .toISOString()
        .split("T")[0];

      lastWorkouts = await Workout.find({
        user: userId,
        createdAt: {
          $gte: new Date(formattedDate),
          $lt: new Date(
            new Date(formattedDate).setDate(
              new Date(formattedDate).getDate() + 1
            )
          ),
        },
      }).select("name sets reps weight notes");
    }

    // 🔹 4) Today's macros intake
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0
    );
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    const todaysMeals = await Meal.find({
      user: userId,
      createdAt: { $gte: start, $lte: end },
    }).select("calories protein carbs fats");

    const todaysMacros = todaysMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fats: acc.fats + (m.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // 🔹 5) Macro targets (lbs only — same logic you already used)
    const user = await User.findById(userId).select("weight targetWeight");

    const curLbs = user?.weight ?? 170; // stored in lbs
    const tgtLbs = user?.targetWeight ?? curLbs;

    const calPerLb = tgtLbs > curLbs ? 15 : tgtLbs < curLbs ? 12 : 14;

    const caloriesGoal = Math.round(curLbs * calPerLb);
    const proteinGoal = Math.round(curLbs);
    const fatGoal = Math.round((caloriesGoal * 0.25) / 9);
    const carbsGoal = Math.max(
      0,
      Math.round(
        (caloriesGoal - (proteinGoal * 4 + fatGoal * 9)) / 4
      )
    );

    const macroTargets = {
      calories: Math.min(Math.max(caloriesGoal, 1200), 4500),
      protein: Math.min(Math.max(proteinGoal, 80), 300),
      carbs: Math.min(Math.max(carbsGoal, 50), 600),
      fats: Math.min(Math.max(fatGoal, 30), 150),
    };

    res.json({
      caloriesByDay: meals,
      weightProgress: weights,
      lastWorkout: lastWorkouts,
      todaysMacros,
      macroTargets,
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res
      .status(500)
      .json({ error: "Failed to load dashboard data" });
  }
}

// ------------------------------------------------------------------
//                  AI COACH SUGGESTION (uses macros)
// ------------------------------------------------------------------
export async function getAISuggestions(req, res) {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("weight targetWeight");
    if (!user) {
      // no profile yet → just skip AI
      return res.json({ suggestion: null });
    }

    // Today totals (same logic as dashboard)
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    const meals = await Meal.find({
      user: userId,
      createdAt: { $gte: start, $lte: end },
    }).select("calories protein carbs fats");

    const totals = meals.reduce(
      (a, m) => ({
        calories: a.calories + (m.calories || 0),
        protein: a.protein + (m.protein || 0),
        carbs: a.carbs + (m.carbs || 0),
        fats: a.fats + (m.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // Targets = same as macroTargets logic above
    const curLbs = user.weight;
    const tgtLbs = user.targetWeight ?? curLbs;
    const calPerLb = tgtLbs > curLbs ? 15 : tgtLbs < curLbs ? 12 : 14;

    const caloriesGoal = Math.round(curLbs * calPerLb);
    const proteinGoal = Math.round(curLbs);
    const fatGoal = Math.round((caloriesGoal * 0.25) / 9);
    const carbsGoal = Math.max(
      0,
      Math.round(
        (caloriesGoal - (proteinGoal * 4 + fatGoal * 9)) / 4
      )
    );

    const targets = {
      calories: Math.min(Math.max(caloriesGoal, 1200), 4500),
      protein: Math.min(Math.max(proteinGoal, 80), 300),
      carbs: Math.min(Math.max(carbsGoal, 50), 600),
      fats: Math.min(Math.max(fatGoal, 30), 150),
    };

    const remaining = {
      calories: Math.max(0, targets.calories - totals.calories),
      protein: Math.max(0, targets.protein - totals.protein),
      carbs: Math.max(0, targets.carbs - totals.carbs),
      fats: Math.max(0, targets.fats - totals.fats),
    };

    const tips = await coachSuggest({ user, totals, targets, remaining });

    if (!tips || tips.length === 0) {
      // If AI fails, send a generic tip (frontend still shows coach)
      return res.json({
        suggestion: "Stay consistent — you’re doing great! 💪",
      });
    }

    return res.json({ suggestion: tips[0] });
  } catch (err) {
    console.error("AI suggestion error:", err.message);
    // On error, still send a safe generic tip
    return res.json({
      suggestion: "AI coach is offline, but your progress still counts 💪",
    });
  }
}
