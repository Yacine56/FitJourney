import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDashboardData } from "../controllers/dashboard.controller.js";

const r = Router();

r.get("/", requireAuth, getDashboardData);

export default r;
