import type { Destination, RegionTraffic } from "@/core/domain/entities/Destination";

export interface DestinationRepository {
  getTopDestinations(date?: string): Promise<Destination[]>;
  getTrafficByRegion(date?: string): Promise<RegionTraffic[]>;
}
