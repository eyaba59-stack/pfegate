import type { Destination, RegionTraffic } from "@/core/domain/entities/Destination";
import type { DestinationRepository } from "@/core/domain/repositories/DestinationRepository";
import { safe } from "@/config/serverApi";
import { REGION_TRAFFIC, TOP_DESTINATIONS } from "@/data/mocks/destinations";

export class ApiDestinationRepository implements DestinationRepository {
  async getTopDestinations(date?: string): Promise<Destination[]> {
    const path = date ? `/api/destinations/top?date=${encodeURIComponent(date)}` : "/api/destinations/top";
    const res = await safe<{ topDestinations: Destination[] }>(path, {
      topDestinations: TOP_DESTINATIONS,
    });
    return res.topDestinations;
  }

  async getTrafficByRegion(date?: string): Promise<RegionTraffic[]> {
    const path = date ? `/api/destinations/regions?date=${encodeURIComponent(date)}` : "/api/destinations/regions";
    const res = await safe<{ trafficByRegion: RegionTraffic[] }>(path, {
      trafficByRegion: REGION_TRAFFIC,
    });
    return res.trafficByRegion;
  }
}
