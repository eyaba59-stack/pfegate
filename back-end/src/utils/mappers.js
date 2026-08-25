/**
 * Mappers: MongoDB documents -> the exact shapes the frontend domain expects.
 * Keeping this contract in one place lets the API and the Next.js app evolve
 * without drift.
 */

export function mapFlight(row) {
  return {
    id: row.flightId,
    flightNumber: row.flightNumber,
    airline: { code: row.airlineCode, name: row.airlineName },
    type: row.type,
    origin: row.origin,
    destination: row.destination,
    scheduledTime: row.scheduledTime,
    actualTime: row.actualTime,
    status: row.status,
    delayMinutes: row.delayMinutes,
  };
}

export function mapFlightFacts(rows) {
  return rows.map((r) => ({
    flightId: r.flightId,
    flightNumber: r.flightNumber,
    airlineCode: r.airlineCode,
    airlineName: r.airlineName,
    type: r.type,
    status: r.status,
    date: r.date,
    scheduledTime: r.scheduledTime,
    actualTime: r.actualTime,
    delayMinutes: r.delayMinutes ?? 0,
    origin: r.origin,
    originCode: r.originCode,
    destination: r.destination,
    destinationCode: r.destinationCode,
    gate: r.gate,
    terminal: r.terminal,
    aircraft: r.aircraft,
    passengers: r.passengers,
    capacity: r.capacity,
    loadFactor: r.loadFactor,
  }));
}

export function mapAirline(a) {
  return {
    code: a.code,
    name: a.name,
    totalFlights: a.totalFlights,
    punctuality: a.punctuality,
    cancellations: a.cancellations,
    score: a.score,
    scoreBarWidth: a.scoreBarWidth,
    scoreBarColor: a.scoreBarColor,
  };
}

export function mapDestination(d) {
  return {
    rank: d.rank,
    city: d.city,
    code: d.code,
    country: d.country,
    passengers: d.passengers,
    sharePercent: d.sharePercent,
    barColor: d.barColor,
    lat: d.lat,
    lng: d.lng,
  };
}

export function mapReport(r) {
  return {
    id: r.reportId,
    name: r.name,
    createdAt: formatDateTime(r.generatedAt),
    author: r.author,
    format: r.format,
  };
}

export function mapStandardReport(r) {
  return {
    title: r.name,
    description: r.description,
    size: r.size,
    badge: r.badge,
    icon: r.icon,
    iconTone: r.iconTone,
  };
}

export function formatDateTime(date) {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
