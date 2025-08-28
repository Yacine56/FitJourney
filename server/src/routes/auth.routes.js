import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  register, login, logout, me, updateProfile, changePassword
} from "../controllers/auth.controller.js";

const r = Router();

// public
r.post("/register", register);
r.post("/login", login);
r.post("/logout", logout);

// private (needs cookie)
r.get("/me", requireAuth, me);
r.patch("/me", requireAuth, updateProfile);
r.post("/change-password", requireAuth, changePassword);

export default r;
