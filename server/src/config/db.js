// server/src/config/db.js
import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { dbName: "fitjourney" });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Mongo error:", err.message);
    process.exit(1);
  }
}
