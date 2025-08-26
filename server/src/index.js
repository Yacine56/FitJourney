// server/src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// test route
app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 API listening on http://localhost:${PORT}`);
  await connectDB(process.env.MONGODB_URI);
});
