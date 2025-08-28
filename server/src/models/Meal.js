import mongoose from "mongoose";

const MealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    mealName: { type: String, required: true, trim: true },
    calories: { type: Number, required: true, min: 0 },
    protein:  { type: Number, required: true, min: 0 },
    carbs:    { type: Number, required: true, min: 0 },
    fats:     { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Meal", MealSchema);
