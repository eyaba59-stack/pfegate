import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/auth.js";

/**
 * POST /api/auth/login  { username, password } -> { token, user }
 * Mirrors the frontend mock: admin / admin (seeded).
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis." });
  }

  const user = await User.findOne({ username: String(username).trim(), isActive: true }).select("+password");
  if (!user) {
    return res.status(401).json({ error: "Identifiants incorrects. Utilisez admin / admin." });
  }

  const ok = await bcrypt.compare(String(password), user.password);
  if (!ok) {
    return res.status(401).json({ error: "Identifiants incorrects. Utilisez admin / admin." });
  }

  const token = jwt.sign(
    { sub: user._id.toString(), username: user.username, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  res.json({
    token,
    user: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
});

/** GET /api/auth/me — profile of the current token holder. */
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub).lean();
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
  res.json({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    department: user.department,
  });
});
