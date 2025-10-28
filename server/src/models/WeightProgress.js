import mongoose from "mongoose";

const weightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // ✅ ensures every entry is tied to a logged user
    },
    weight: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: () => {
        const now = new Date();
        // ✅ store local midnight, not UTC (fix timezone offset)
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      },
    },
  },
  { timestamps: true }
);

// Prevent duplicate entries for the same day and user
weightSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("WeightProgress", weightSchema);
