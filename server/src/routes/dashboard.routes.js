import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDashboardData,getAISuggestions } from "../controllers/dashboard.controller.js";

const r = Router();

r.get("/", requireAuth, getDashboardData);
r.get("/ai-suggestion", requireAuth, getAISuggestions);


export default r;
