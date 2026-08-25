import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connect to MongoDB. Server keeps running if the DB is temporarily down;
 * /api/health reports the connection state.
 */
export async function connectDB() {
  mongoose.connection.on("error", (err) => {
    console.error(`[db] connection error: ${err.message}`);
  });

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 8000,
  });

  console.log(`[db] connected to ${mongoose.connection.name}`);
  return mongoose.connection;
}

export function dbState() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] ?? "unknown";
}
