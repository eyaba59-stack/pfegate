import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/auth.js";

/** GET /api/users/profile — current user's public profile. */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub).lean();
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
  res.json({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    department: user.department,
  });
});

/** PUT /api/users/profile — update name / email (BI user master data). */
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body || {};
  const patch = {};
  if (fullName) patch.fullName = String(fullName).trim();
  if (email) patch.email = String(email).trim();

  const user = await User.findByIdAndUpdate(req.user.sub, { $set: patch }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

  res.json({
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    department: user.department,
  });
});
