import { env } from "../config/env.js";

/**
 * Optional key protection for the public BI endpoints (Power BI cannot easily
 * send JWT headers). When BI_API_KEY is set, clients must send "x-api-key".
 */
export function apiKeyGuard(req, res, next) {
  if (!env.biApiKey) return next();
  const key = req.headers["x-api-key"];
  if (!key || key !== env.biApiKey) {
    return res.status(401).json({ error: "Clé API BI manquante ou invalide (x-api-key)." });
  }
  return next();
}
