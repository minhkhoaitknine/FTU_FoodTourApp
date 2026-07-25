import { describe, expect, it } from "vitest";
import { estimateTravelMinutes, haversineDistanceKm } from "@/services/routing/haversine";

describe("haversineDistanceKm", () => {
  it("returns 0 for identical coordinates", () => {
    expect(haversineDistanceKm({ latitude: 16.0544, longitude: 108.2022 }, { latitude: 16.0544, longitude: 108.2022 })).toBe(0);
  });

  it("estimates distance between nearby points", () => {
    const distance = haversineDistanceKm(
      { latitude: 16.4637, longitude: 107.5909 },
      { latitude: 16.47, longitude: 107.6 }
    );

    expect(distance).toBeGreaterThan(1);
    expect(distance).toBeLessThan(2);
  });

  it("estimates travel time by transport mode", () => {
    expect(estimateTravelMinutes(2, "WALKING")).toBeGreaterThan(estimateTravelMinutes(2, "MOTORBIKE"));
  });
});

