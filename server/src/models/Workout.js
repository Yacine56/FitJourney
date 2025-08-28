import mongoose from "mongoose";

const WorkoutSchema = new mongoose.Schema(
  {
    user:
     { type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    muscle: { type: String, required: true, trim: true },

    duration: { type: Number, required: true, min: 0 }, 
    sets: { type: Number, required: true, min: 0 },
    reps: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    notes: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Workout", WorkoutSchema);
