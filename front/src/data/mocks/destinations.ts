import type { Destination, RegionTraffic } from "@/core/domain/entities/Destination";

export const TOP_DESTINATIONS: Destination[] = [
  { rank: 1, city: "Paris", code: "CDG", country: "France", passengers: 14250, sharePercent: 22, barColor: "bg-secondary", lat: 49.0097, lng: 2.5479 },
  { rank: 2, city: "Lyon", code: "LYS", country: "France", passengers: 9840, sharePercent: 15, barColor: "bg-secondary-container", lat: 45.7256, lng: 5.0811 },
  { rank: 3, city: "Marseille", code: "MRS", country: "France", passengers: 8100, sharePercent: 12, barColor: "bg-tertiary-fixed-dim", lat: 43.4393, lng: 5.2214 },
  { rank: 4, city: "Nice", code: "NCE", country: "France", passengers: 6450, sharePercent: 10, barColor: "bg-primary-fixed-dim", lat: 43.6584, lng: 7.2159 },
  { rank: 5, city: "Brussels", code: "BRU", country: "Belgique", passengers: 5200, sharePercent: 8, barColor: "bg-surface-variant", lat: 50.9014, lng: 4.4844 },
  { rank: 6, city: "Nantes", code: "NTE", country: "France", passengers: 4300, sharePercent: 7, barColor: "bg-secondary", lat: 47.1532, lng: -1.6108 },
  { rank: 7, city: "Toulouse", code: "TLS", country: "France", passengers: 3800, sharePercent: 6, barColor: "bg-secondary-container", lat: 43.6293, lng: 1.3678 },
  { rank: 8, city: "Frankfurt", code: "FRA", country: "Allemagne", passengers: 3200, sharePercent: 5, barColor: "bg-tertiary-fixed-dim", lat: 50.0379, lng: 8.5622 },
  { rank: 9, city: "Istanbul", code: "IST", country: "Turquie", passengers: 2800, sharePercent: 4, barColor: "bg-primary-fixed-dim", lat: 41.2753, lng: 28.7519 },
  { rank: 10, city: "Dubaï", code: "DXB", country: "Émirats", passengers: 2400, sharePercent: 4, barColor: "bg-surface-variant", lat: 25.2532, lng: 55.3657 },
];

export const REGION_TRAFFIC: RegionTraffic[] = [
  { region: "Europe Ouest", q1: 1400, q2: 1700 },
  { region: "Europe Est", q1: 800, q2: 900 },
  { region: "Moyen-Orient", q1: 400, q2: 500 },
  { region: "Afrique Nord", q1: 600, q2: 560 },
];
