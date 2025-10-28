import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createWeight,
  getWeights,
  updateWeight,
  deleteWeight,
} from "../controllers/weight.controller.js";

const r = Router();

r.get("/", requireAuth, getWeights);
r.post("/", requireAuth, createWeight);
r.patch("/:id", requireAuth, updateWeight); 
r.delete("/:id", requireAuth, deleteWeight);

export default r;
