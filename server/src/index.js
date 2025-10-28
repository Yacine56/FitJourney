import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import workoutRoutes from "./routes/workout.routes.js";
import mealRoutes from "./routes/meal.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import weightRoutes from "./routes/weight.routes.js";


dotenv.config();

const app = express();

/**
 * Allow both local dev and the deployed frontend.
 * Express CORS accepts an array for "origin".
 */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_ORIGIN, // e.g. https://fitjourney.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/weight", weightRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
  await connectDB(process.env.MONGODB_URI);
});
