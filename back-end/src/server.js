import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  const app = createApp();

  try {
    await connectDB();
  } catch (err) {
    console.error(`[db] impossible de se connecter à MongoDB: ${err.message}`);
    console.error("Vérifiez la variable MONGO_URI dans back-end/.env puis relancez le serveur.");
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`[api] Monastir Airport backend démarré sur http://localhost:${env.port}`);
    console.log(`[api] Routes: /api/auth, /api/dashboard, /api/flights, /api/airlines, /api/destinations, /api/analytics, /api/reports, /api/users, /api/bi`);
  });
}

bootstrap();
