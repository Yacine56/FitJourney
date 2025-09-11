import mongoose from "mongoose";

const WorkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    muscle: { type: String, required: true, trim: true },
    equipment: { type: String, required: true, trim: true }, // <- from API Ninjas
    sets: { type: Number, required: true, min: 1 },          // must be ≥ 1
    reps: { type: Number, required: true, min: 1 },          // must be ≥ 1
    weight: { type: Number },                                // optional
    notes: { type: String, trim: true },                     // optional
  },
  { timestamps: true }
);


export default mongoose.model("Workout", WorkoutSchema);
