import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { dbState } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
