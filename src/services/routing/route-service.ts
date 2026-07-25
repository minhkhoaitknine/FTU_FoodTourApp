import { z } from "zod";
import { haversineDistanceKm, estimateTravelMinutes, type Coordinate } from "@/services/routing/haversine";

export const routeRequestSchema = z.object({
  transportMode: z.enum(["WALKING", "BICYCLE", "MOTORBIKE", "CAR"]).optional().default("MOTORBIKE"),
  points: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
      })
    )
    .min(2)
    .max(12)
});

export type RouteRequest = z.infer<typeof routeRequestSchema>;

export function estimateRoute(points: Coordinate[], transportMode: RouteRequest["transportMode"]) {
  const legs = [];
  let totalDistanceKm = 0;
  let totalTravelMinutes = 0;

  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const distanceKm = haversineDistanceKm(from, to);
    const travelMinutes = estimateTravelMinutes(distanceKm, transportMode);
    totalDistanceKm += distanceKm;
    totalTravelMinutes += travelMinutes;

    legs.push({
      from,
      to,
      distanceKm,
      travelMinutes
    });
  }

  return {
    provider: "haversine-fallback",
    isEstimated: true,
    transportMode,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalTravelMinutes,
    polyline: points,
    legs
  };
}

