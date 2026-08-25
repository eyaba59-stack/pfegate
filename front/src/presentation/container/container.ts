import { ApiFlightRepository } from "@/data/repositories/api/ApiFlightRepository";
import { ApiAirlineRepository } from "@/data/repositories/api/ApiAirlineRepository";
import { ApiDestinationRepository } from "@/data/repositories/api/ApiDestinationRepository";
import { ApiAnalyticsRepository } from "@/data/repositories/api/ApiAnalyticsRepository";
import { ApiReportRepository } from "@/data/repositories/api/ApiReportRepository";
import { ApiUserRepository } from "@/data/repositories/api/ApiUserRepository";

import { GetDashboardOverview } from "@/core/usecases/GetDashboardOverview";
import { GetFlights } from "@/core/usecases/GetFlights";
import { GetAirlinePerformance } from "@/core/usecases/GetAirlinePerformance";
import { GetDestinationAnalysis } from "@/core/usecases/GetDestinationAnalysis";
import { GetAnalyticsOverview } from "@/core/usecases/GetAnalyticsOverview";
import { GetHourlyTraffic } from "@/core/usecases/GetHourlyTraffic";
import { GetPeakHours } from "@/core/usecases/GetPeakHours";
import { GetReports } from "@/core/usecases/GetReports";
import { GetUserProfile } from "@/core/usecases/GetUserProfile";

/**
 * Composition root. Central place to swap the data layer (mock -> API) without
 * touching pages or domain code.
 *
 * The API repositories run server-side (Server Components) and authenticate
 * through the `mir.token` cookie set by AuthContext after login.
 */
export const container = {
  getDashboardOverview: new GetDashboardOverview(new ApiFlightRepository()),
  getFlights: new GetFlights(new ApiFlightRepository()),
  getAirlinePerformance: new GetAirlinePerformance(new ApiAirlineRepository()),
  getDestinationAnalysis: new GetDestinationAnalysis(new ApiDestinationRepository()),
  getAnalyticsOverview: new GetAnalyticsOverview(new ApiAnalyticsRepository()),
  getHourlyTraffic: new GetHourlyTraffic(new ApiAnalyticsRepository()),
  getPeakHours: new GetPeakHours(new ApiAnalyticsRepository()),
  getReports: new GetReports(new ApiReportRepository()),
  getUserProfile: new GetUserProfile(new ApiUserRepository()),
};
