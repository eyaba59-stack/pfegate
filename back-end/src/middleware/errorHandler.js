import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ error: `Route non trouvée: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(`[api] ${err.message}\n${err.stack ?? ""}`);
  res.status(status).json({
    error: err.message || "Erreur interne du serveur.",
    ...(env?.nodeEnv === "production" ? {} : { stack: err.stack }),
  });
}
