import mongoose from "mongoose";

const WeightProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weight: { type: Number, required: true, min: 0 },
    recordedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("WeightProgress", WeightProgressSchema);
