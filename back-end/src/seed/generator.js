/**
 * Deterministic dataset generator — a richer version of the frontend mocks.
 * Produces ~120 days of flights so BI aggregations (monthly volume, peak
 * hours, airline scoring) have real spread, with a seasonal summer peak.
 */

export const AIRLINES = [
  { code: "TU", iata: "TU", name: "Tunisair", country: "Tunisie", base: "TUN" },
  { code: "BJ", iata: "BJ", name: "Nouvelair", country: "Tunisie", base: "MIR" },
  { code: "TO", iata: "TO", name: "Transavia", country: "France", base: "ORY" },
  { code: "AF", iata: "AF", name: "Air France", country: "France", base: "CDG" },
  { code: "LH", iata: "LH", name: "Lufthansa", country: "Allemagne", base: "FRA" },
  { code: "EZY", iata: "U2", name: "EasyJet", country: "Royaume-Uni", base: "LTN" },
  { code: "RYR", iata: "FR", name: "Ryanair", country: "Irlande", base: "DUB" },
];

export const DESTINATIONS = [
  { code: "CDG", city: "Paris", country: "France", region: "Europe Ouest" },
  { code: "LYS", city: "Lyon", country: "France", region: "Europe Ouest" },
  { code: "MRS", city: "Marseille", country: "France", region: "Europe Ouest" },
  { code: "NCE", city: "Nice", country: "France", region: "Europe Ouest" },
  { code: "NTE", city: "Nantes", country: "France", region: "Europe Ouest" },
  { code: "TLS", city: "Toulouse", country: "France", region: "Europe Ouest" },
  { code: "BOD", city: "Bordeaux", country: "France", region: "Europe Ouest" },
  { code: "BRU", city: "Brussels", country: "Belgique", region: "Europe Ouest" },
  { code: "FRA", city: "Frankfurt", country: "Allemagne", region: "Europe Ouest" },
  { code: "DUS", city: "Düsseldorf", country: "Allemagne", region: "Europe Ouest" },
  { code: "MXP", city: "Milan", country: "Italie", region: "Europe Ouest" },
  { code: "GVA", city: "Genève", country: "Suisse", region: "Europe Ouest" },
  { code: "IST", city: "Istanbul", country: "Turquie", region: "Europe Est" },
  { code: "CAI", city: "Le Caire", country: "Égypte", region: "Afrique Nord" },
  { code: "DXB", city: "Dubaï", country: "Émirats", region: "Moyen-Orient" },
  { code: "DOH", city: "Doha", country: "Qatar", region: "Moyen-Orient" },
];

const AIRCRAFT = [
  { model: "A320", capacity: 180 },
  { model: "A321", capacity: 220 },
  { model: "B737-800", capacity: 189 },
  { model: "ATR72", capacity: 72 },
  { model: "CRJ900", capacity: 90 },
];

// Weighted status pool for generated history (today included).
const STATUS_POOL = [
  "ON_TIME", "ON_TIME", "ON_TIME", "ON_TIME", "ON_TIME",
  "DELAYED", "DELAYED", "DELAYED",
  "BOARDING",
  "CANCELLED",
];

export function makeRng(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Seasonal multiplier: summer peak, winter trough. */
export function seasonalFactor(month) {
  if ([6, 7, 8].includes(month)) return 1.0;
  if ([4, 5, 9, 10].includes(month)) return 0.8;
  return 0.58;
}

/** Approximate base daily flight count with seasonal + weekend uplift. */
export function flightsPerDay(month, dow) {
  const weekend = dow === 0 || dow === 6 ? 1.15 : 1;
  return Math.round(96 * seasonalFactor(month) * weekend);
}

export function buildFlights(days = 120) {
  const rnd = makeRng(20231007);
  const flights = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const month = day.getMonth() + 1;
    const dow = day.getDay(); // 0 Sun .. 6 Sat
    const dateStr = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()))
      .toISOString()
      .slice(0, 10);
    const count = flightsPerDay(month, dow);

    for (let i = 0; i < count; i++) {
      const airline = AIRLINES[Math.floor(rnd() * AIRLINES.length)];
      const dest = DESTINATIONS[Math.floor(rnd() * DESTINATIONS.length)];
      const isDeparture = rnd() > 0.48;
      const status = STATUS_POOL[Math.floor(rnd() * STATUS_POOL.length)];

      const hour = 6 + Math.floor(rnd() * 16);
      const minute = Math.floor(rnd() * 6) * 10;
      const scheduledTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      let actualTime = scheduledTime;
      let delayMinutes = null;
      if (status === "DELAYED") {
        delayMinutes = (Math.floor(rnd() * 8) + 1) * 15;
        const [h, m] = scheduledTime.split(":").map(Number);
        const total = h * 60 + m + delayMinutes;
        actualTime = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      } else if (status === "CANCELLED") {
        actualTime = null;
      }

      const aircraft = AIRCRAFT[Math.floor(rnd() * AIRCRAFT.length)];
      const loadFactor = Math.round((0.55 + rnd() * 0.4) * 100);
      const capacity = aircraft.capacity;
      const passengers = Math.round(capacity * (loadFactor / 100));
      const terminal = rnd() > 0.5 ? "T1" : "T2";
      const gate = `${terminal === "T1" ? "A" : "B"}${String(Math.floor(rnd() * 12) + 1).padStart(2, "0")}`;

      const scheduledDateTime = new Date(day);
      scheduledDateTime.setHours(hour, minute, 0, 0);
      const actualDateTime = actualTime
        ? new Date(day.setHours(...actualTime.split(":").map(Number), 0, 0))
        : null;

      const isDep = isDeparture;
      flights.push({
        flightId: `fl-${offset}-${i}`,
        flightNumber: `${airline.code}${100 + Math.floor(rnd() * 900)}`,
        airlineCode: airline.code,
        airlineName: airline.name,
        type: isDep ? "DEPARTURE" : "ARRIVAL",
        status,
        origin: isDep ? "Monastir (MIR)" : `${dest.city} (${dest.code})`,
        originCode: isDep ? "MIR" : dest.code,
        destination: isDep ? `${dest.city} (${dest.code})` : "Monastir (MIR)",
        destinationCode: isDep ? dest.code : "MIR",
        date: dateStr,
        scheduledTime,
        actualTime,
        scheduledDateTime,
        actualDateTime,
        delayMinutes,
        gate,
        terminal,
        aircraft: aircraft.model,
        passengers,
        capacity,
        loadFactor,
      });
    }
  }

  return flights;
}
