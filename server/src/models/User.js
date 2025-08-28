import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
       type: String, 
      required: true 
    },

    fullName: { 
      type: String, 
      required: true 
    },
    age: {
      type: Number,
      required: true,
      min: 0
    },
    height: {
      type: Number,
      required: true
    }, // cm
    weight: {
      type: Number,
      required: true
    }, // kg
    dailyCalorieGoal: {
      type: Number,
      required: true
    },
    targetWeight: {
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model("User", UserSchema);
