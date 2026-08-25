/**
 * Core domain entity for destination analysis.
 */

export interface Destination {
  rank: number;
  city: string;
  code: string;
  country: string;
  passengers: number;
  sharePercent: number;
  barColor: string;
}

export interface RegionTraffic {
  region: string;
  q1: number;
  q2: number;
}

export interface TrafficPoint {
  time: string;
  value: number;
}
