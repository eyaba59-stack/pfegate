import type { Destination, RegionTraffic } from "@/core/domain/entities/Destination";
import type { DestinationRepository } from "@/core/domain/repositories/DestinationRepository";
import { REGION_TRAFFIC, TOP_DESTINATIONS } from "@/data/mocks/destinations";

export class MockDestinationRepository implements DestinationRepository {
  async getTopDestinations(_date?: string): Promise<Destination[]> {
    return TOP_DESTINATIONS;
  }

  async getTrafficByRegion(_date?: string): Promise<RegionTraffic[]> {
    return REGION_TRAFFIC;
  }
}
