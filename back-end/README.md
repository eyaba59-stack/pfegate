# Monastir Airport — Backend API & Power BI Data Service

Express + MongoDB (Mongoose) backend for the **Monastir Airport Operations Intelligence** dashboard. It serves the Next.js frontend (`../front`) with REST endpoints shaped to match the frontend domain, and exposes a read-only BI API + CSV exports for Power BI Desktop.

## Stack

- Node.js ≥ 20, Express 4, Mongoose 8 (ESM, `"type": "module"`)
- bcryptjs (password hashing), jsonwebtoken (JWT auth), cors, dotenv, nodemon (dev)
- MongoDB Atlas (a direct `mongodb://` URI is used — see `.env` notes)

## Quick start

```bash
cd back-end
npm install
npm run seed      # generates 120 days of flight facts (~11k rows) + admin/admin user + cubes
npm run dev       # nodemon, port 5000
```

Environment: copy `.env.example` to `.env` and adjust.

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret for auth tokens |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` | Bootstrap admin (defaults `admin` / `admin`) |
| `BI_API_KEY` | Optional `x-api-key` guard for `/api/bi/*` (leave empty to disable) |
| `CORS_ORIGIN` | Comma-separated allowed origins (default `http://localhost:3000`) |

> Note: `mongodb+srv://` (SRV DNS lookup) may be blocked on some networks. The
> current `.env` uses the direct shard hosts + `replicaSet` resolved from DNS,
> which avoids the SRV query.

## Auth

- `POST /api/auth/login` `{ username, password }` → `{ token, user }` (JWT, 7 days)
- `GET /api/auth/me` — validate token and return the profile
- Seeded account: **`admin` / `admin`**
- Protected routes require `Authorization: Bearer <token>` (except `/api/auth/*` and `/api/bi/*`, which use the optional `x-api-key`).

### How the frontend authenticates

1. Login page calls `POST /api/auth/login` (client-side, `src/config/api.ts`).
2. The JWT is stored in the `mir.token` cookie + `mir.auth` in localStorage.
3. Server Components read the cookie (`src/config/serverApi.ts` → `next/headers` `cookies()`) and call the protected endpoints with a Bearer header during RSC rendering.
4. API repositories (`front/src/data/repositories/api/`) fall back to the mock datasets if the backend is unreachable / the session is invalid, so pages render gracefully and the `AuthGuard` redirects to `/login`.

## API reference

### Application endpoints (JWT required)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Login → token + user |
| GET | `/api/auth/me` | Current profile |
| GET | `/api/dashboard/overview?date=` | KPI cards + live flight feed |
| GET | `/api/flights?flightNumber=&airlineCode=&status=&type=&date=&page=&limit=` | Paginated operational feed |
| GET | `/api/flights/today` | Today's schedule |
| GET | `/api/flights/:id` | Flight by `flightId` |
| GET | `/api/airlines/leaderboard` | Airline ranking (BI scoring) |
| GET | `/api/airlines/highlights` | Best / worst / most reliable |
| GET | `/api/destinations/top` | Top 5 destinations by passengers |
| GET | `/api/destinations/regions` | Quarterly traffic per region |
| GET | `/api/analytics/monthly-volume` | Last 12 months |
| GET | `/api/analytics/arrivals-vs-departures` | Last 7 days |
| GET | `/api/analytics/delays-by-airline` | Average delay per airline |
| GET | `/api/analytics/peak-hours` | Hourly density |
| GET | `/api/reports`, `/api/reports/history`, `/api/reports/standards` | Reports |
| POST | `/api/reports/generate` | Create a report record |
| GET/PUT | `/api/users/profile` | Read / update profile |
| GET | `/api/health` | Status + DB connection state |

### Power BI endpoints (`/api/bi/*`, optional `x-api-key`)

Tabular JSON suitable for Power BI Desktop → *Get Data → Web → JSON URL*:

| Path | Content |
| --- | --- |
| `/api/bi/kpis` | Today's KPI cards |
| `/api/bi/facts/flights?from=&to=` | Flight fact table |
| `/api/bi/dimensions/airlines` | Airline dimension |
| `/api/bi/dimensions/destinations` | Destination dimension |
| `/api/bi/cube/daily` | Pre-aggregated daily cube |
| `/api/bi/cube/monthly` | 12-month volume |
| `/api/bi/cube/weekly` | Arrivals vs departures per weekday |
| `/api/bi/cube/delays` | Average delay per airline |
| `/api/bi/cube/peak-hours` | Hourly density |
| `/api/bi/leaderboard` | Airline scoring |
| `/api/bi/destinations` | Top destinations + region traffic |
| `/api/bi/dataset?from=&to=` | One-shot star schema (facts + dimensions + cubes) |
| `/api/bi/export/:kind` | CSV download (`flights`, `daily`, `monthly`, `weekly`, `delays`, `peak-hours`, `airlines`, `destinations`) — UTF-8 BOM, `;` separator |

### BI scoring formula

```
punctualityRate  = onTime / total * 100
cancellationRate = cancelled / total * 100
loadFactor       = passengers / capacity * 100 (avg)
airlineScore     = round(0.6 * punctuality + 0.2 * (100 - min(cancellationRate * 4, 25)) + 0.2 * loadFactor)
```

Implemented in `src/services/biService.js` and reproducible in Power BI (also exported as `pfe.pbix` at the repo root).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | nodemon on `src/server.js` |
| `npm start` | Production start |
| `npm run seed` | Rebuild seed data (120 days) + dimensions + daily cubes + admin + reports |

## Project layout

```
src/
  app.js                 # Express app (cors, json, health, routes, error handling)
  server.js              # bootstrap: connectDB + listen
  config/                # env.js (dotenv), db.js (mongoose)
  models/                # User, Airline, Destination, RegionTraffic, Flight, Report, DailyStat
  middleware/            # auth (JWT), apiKey, errorHandler
  controllers/           # one per resource + biController
  services/biService.js  # all aggregations + BI scoring
  utils/mappers.js       # Mongo docs -> frontend domain shapes
  seed/                  # deterministic 120-day generator + seed script
```
