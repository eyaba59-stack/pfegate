import type { Flight } from "@/core/domain/entities/Flight";
import { FlightStatus, FlightType } from "@/core/domain/entities/Flight";

export const AIRLINES: Array<{ code: string; name: string }> = [
  { code: "TU", name: "Tunisair" },
  { code: "BJ", name: "Nouvelair" },
  { code: "TO", name: "Transavia" },
  { code: "AF", name: "Air France" },
  { code: "LH", name: "Lufthansa" },
  { code: "EZY", name: "EasyJet" },
  { code: "RYR", name: "Ryanair" },
];

export const CITIES: Array<{ city: string; code: string }> = [
  { city: "Paris", code: "ORY" },
  { city: "Lyon", code: "LYS" },
  { city: "Marseille", code: "MRS" },
  { city: "Nice", code: "NCE" },
  { city: "Nantes", code: "NTE" },
  { city: "Brussels", code: "BRU" },
  { city: "Frankfurt", code: "FRA" },
  { city: "Toulouse", code: "TLS" },
  { city: "Düsseldorf", code: "DUS" },
  { city: "Bordeaux", code: "BOD" },
  { city: "Milan", code: "MXP" },
  { city: "Geneva", code: "GVA" },
];

const STATUS_POOL: FlightStatus[] = [
  FlightStatus.ON_TIME,
  FlightStatus.ON_TIME,
  FlightStatus.ON_TIME,
  FlightStatus.ON_TIME,
  FlightStatus.DELAYED,
  FlightStatus.DELAYED,
  FlightStatus.CANCELLED,
  FlightStatus.BOARDING,
];

/**
 * Deterministically generates a plausible daily schedule for MIR so that
 * pagination and filtering behave like a real operational feed.
 */
export function generateFlights(count = 124): Flight[] {
  const flights: Flight[] = [];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < count; i++) {
    const airline = AIRLINES[i % AIRLINES.length];
    const isDeparture = i % 2 === 0;
    const cityA = CITIES[i % CITIES.length];
    const cityB = CITIES[(i * 7 + 3) % CITIES.length];
    const status = STATUS_POOL[Math.floor(rnd() * STATUS_POOL.length)];
    const hour = 6 + Math.floor(rnd() * 16);
    const minute = Math.floor(rnd() * 6) * 10;
    const scheduled = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    let actualTime: string | null = scheduled;
    let delayMinutes: number | null = null;

    if (status === "DELAYED") {
      const delay = (Math.floor(rnd() * 8) + 1) * 15;
      delayMinutes = delay;
      const [h, m] = scheduled.split(":").map(Number);
      const total = h * 60 + m + delay;
      actualTime = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    } else if (status === "CANCELLED") {
      actualTime = null;
    }

    flights.push({
      id: `fl-${i + 1}`,
      flightNumber: `${airline.code}${700 + ((i * 13) % 900)}`,
      airline,
      type: isDeparture ? FlightType.DEPARTURE : FlightType.ARRIVAL,
      origin: isDeparture ? "Monastir (MIR)" : `${cityA.city} (${cityA.code})`,
      destination: isDeparture ? `${cityB.city} (${cityB.code})` : "Monastir (MIR)",
      scheduledTime: scheduled,
      actualTime,
      status,
      delayMinutes,
    });
  }

  return flights;
}
