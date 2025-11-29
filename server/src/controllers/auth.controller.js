import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

// fields we are willing to send back to the client
const PUBLIC =
  "username email fullName age height weight dailyCalorieGoal targetWeight createdAt updatedAt";

function setCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";

  // Local dev (localhost frontend)
  const isLocal =
    process.env.CLIENT_ORIGIN?.includes("localhost") ||
    !isProduction;

  res.cookie(process.env.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isLocal ? "lax" : "none", // localhost = lax / production = none
    secure: !isLocal,                   // localhost = false / production = true
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
export async function register(req, res) {
  // because everything is required, destructure all
  const {
    username,
    email,
    password,
    fullName,
    age,
    height,
    weight,
    dailyCalorieGoal,
    targetWeight
  } = req.body;

  // simple presence check (your “all-or-nothing” rule)
  if (
    !username || !email || !password ||
    !fullName || age == null || height == null || weight == null ||
    dailyCalorieGoal == null || targetWeight == null
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Unique username/email guard
  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) return res.status(409).json({ error: "Username or email already taken" });

  // Hash the password (never store plain text)
  const passwordHash = await bcrypt.hash(password, 10);

  // Create the user
  const user = await User.create({
    username,
    email,
    passwordHash,
    fullName,
    age,
    height,
    weight,
    dailyCalorieGoal,
    targetWeight
  });

  // Create a token with the user's id inside (in the "sub" claim)
  const token = signToken({ sub: user._id.toString() });
  setCookie(res, token);

  // Return safe fields only
  const safe = await User.findById(user._id).select(PUBLIC);
  res.status(201).json({ user: safe });
}

// POST /api/auth/login
export async function login(req, res) {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Find by email or username
  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
  });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  // Compare the plain password to the stored hash
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ sub: user._id.toString() });
  setCookie(res, token);

  const safe = await User.findById(user._id).select(PUBLIC);
  res.json({ user: safe });
}

// POST /api/auth/logout
export async function logout(_req, res) {
  res.clearCookie(process.env.COOKIE_NAME);
  res.json({ ok: true });
}

// GET /api/auth/me  (requires cookie)
export async function me(req, res) {
  const user = await User.findById(req.userId).select(PUBLIC);
  res.json({ user });
}

// PATCH /api/auth/me  (requires cookie)
export async function updateProfile(req, res) {
  // because you want all-or-nothing, we require all profile fields here too
  const {
    fullName,
    age,
    height,
    weight,
    dailyCalorieGoal,
    targetWeight
  } = req.body;

  if (
    !fullName || age == null || height == null || weight == null ||
    dailyCalorieGoal == null || targetWeight == null
  ) {
    return res.status(400).json({ error: "All profile fields are required." });
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { fullName, age, height, weight, dailyCalorieGoal, targetWeight },
    { new: true }
  ).select(PUBLIC);

  res.json({ user });
}

// POST /api/auth/change-password  (requires cookie)
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password required." });
  }

  const user = await User.findById(req.userId);
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Current password incorrect" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ ok: true });
}
