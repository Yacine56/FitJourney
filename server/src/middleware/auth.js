import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies[process.env.COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
