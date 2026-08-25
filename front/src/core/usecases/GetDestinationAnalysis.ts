import type { Destination, RegionTraffic } from "@/core/domain/entities/Destination";
import type { DestinationRepository } from "@/core/domain/repositories/DestinationRepository";

export interface DestinationAnalysis {
  topDestinations: Destination[];
  trafficByRegion: RegionTraffic[];
}

/**
 * Use case: gather destination-level traffic analysis.
 */
export class GetDestinationAnalysis {
  constructor(private readonly destinationRepository: DestinationRepository) {}

  async execute(date?: string): Promise<DestinationAnalysis> {
    const [topDestinations, trafficByRegion] = await Promise.all([
      this.destinationRepository.getTopDestinations(date),
      this.destinationRepository.getTrafficByRegion(date),
    ]);
    return { topDestinations, trafficByRegion };
  }
}
