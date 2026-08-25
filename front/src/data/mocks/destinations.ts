import type { Destination, RegionTraffic } from "@/core/domain/entities/Destination";

export const TOP_DESTINATIONS: Destination[] = [
  { rank: 1, city: "Paris", code: "CDG", country: "France", passengers: 14250, sharePercent: 22, barColor: "bg-secondary" },
  { rank: 2, city: "Lyon", code: "LYS", country: "France", passengers: 9840, sharePercent: 15, barColor: "bg-secondary-container" },
  { rank: 3, city: "Marseille", code: "MRS", country: "France", passengers: 8100, sharePercent: 12, barColor: "bg-tertiary-fixed-dim" },
  { rank: 4, city: "Nice", code: "NCE", country: "France", passengers: 6450, sharePercent: 10, barColor: "bg-primary-fixed-dim" },
  { rank: 5, city: "Brussels", code: "BRU", country: "Belgique", passengers: 5200, sharePercent: 8, barColor: "bg-surface-variant" },
  { rank: 6, city: "Nantes", code: "NTE", country: "France", passengers: 4300, sharePercent: 7, barColor: "bg-secondary" },
  { rank: 7, city: "Toulouse", code: "TLS", country: "France", passengers: 3800, sharePercent: 6, barColor: "bg-secondary-container" },
  { rank: 8, city: "Frankfurt", code: "FRA", country: "Allemagne", passengers: 3200, sharePercent: 5, barColor: "bg-tertiary-fixed-dim" },
  { rank: 9, city: "Istanbul", code: "IST", country: "Turquie", passengers: 2800, sharePercent: 4, barColor: "bg-primary-fixed-dim" },
  { rank: 10, city: "Dubaï", code: "DXB", country: "Émirats", passengers: 2400, sharePercent: 4, barColor: "bg-surface-variant" },
];

export const REGION_TRAFFIC: RegionTraffic[] = [
  { region: "Europe Ouest", q1: 1400, q2: 1700 },
  { region: "Europe Est", q1: 800, q2: 900 },
  { region: "Moyen-Orient", q1: 400, q2: 500 },
  { region: "Afrique Nord", q1: 600, q2: 560 },
];
