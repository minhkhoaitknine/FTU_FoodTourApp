import { MealType, PriceRange, RestaurantType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { generateRecommendation } from "@/services/recommendations/recommendation-engine";
import { hasAllergyConflict, scoreCandidate } from "@/services/recommendations/scoring";
import type { RecommendationCandidate, RecommendationInput } from "@/services/recommendations/types";

function candidate(overrides: Partial<RecommendationCandidate>): RecommendationCandidate {
  return {
    id: "candidate-1",
    name: "Demo Place",
    slug: "demo-place",
    cityId: "city-1",
    latitude: 16.4638,
    longitude: 107.591,
    type: RestaurantType.LOCAL_EATERY,
    priceRange: PriceRange.BUDGET,
    minPrice: 30_000,
    maxPrice: 60_000,
    ratingAverage: 4.8,
    ratingCount: 20,
    averageMealMinutes: 45,
    isVegetarianFriendly: true,
    isSpicy: false,
    tags: ["breakfast", "local-food", "noodle"],
    allergens: [],
    openingHours: [{ dayOfWeek: 1, openTime: "07:00", closeTime: "22:00", isClosed: false }],
    ...overrides
  };
}

const input: RecommendationInput = {
  start: { latitude: 16.4637, longitude: 107.5909 },
  startAt: new Date("2026-07-27T07:30:00+07:00"),
  budget: 500_000,
  numberOfPeople: 2,
  transportMode: "MOTORBIKE",
  preferences: ["local-food", "noodle"],
  vegetarian: false,
  allergies: [],
  desiredStops: 2,
  maxDistanceKm: 10,
  mealTypes: [MealType.BREAKFAST, MealType.LUNCH]
};

describe("recommendation scoring", () => {
  it("detects allergy conflicts", () => {
    expect(hasAllergyConflict(candidate({ allergens: ["seafood"] }), ["seafood"])).toBe(true);
    expect(hasAllergyConflict(candidate({ allergens: ["soy"] }), ["seafood"])).toBe(false);
  });

  it("scores preference matches higher than unrelated candidates", () => {
    const matched = scoreCandidate(candidate({ tags: ["local-food", "noodle"] }), input, MealType.BREAKFAST);
    const unrelated = scoreCandidate(candidate({ tags: ["dessert"] }), input, MealType.BREAKFAST);

    expect(matched.score).toBeGreaterThan(unrelated.score);
  });
});

describe("generateRecommendation", () => {
  it("filters allergy conflicts and returns eligible stops", () => {
    const result = generateRecommendation(
      { ...input, allergies: ["seafood"] },
      [
        candidate({ id: "bad", slug: "bad", name: "Seafood Place", allergens: ["seafood"], ratingAverage: 5 }),
        candidate({ id: "good", slug: "good", name: "Noodle Place", allergens: [], ratingAverage: 4.5 }),
        candidate({
          id: "good-2",
          slug: "good-2",
          name: "Lunch Place",
          tags: ["lunch", "local-food"],
          longitude: 107.592
        })
      ]
    );

    expect(result.stops.length).toBe(2);
    expect(result.stops.some((stop) => stop.restaurant.id === "bad")).toBe(false);
  });

  it("returns warning when budget is too low", () => {
    const result = generateRecommendation({ ...input, budget: 40_000 }, [candidate({ id: "a" })]);

    expect(result.stops.length).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("includes travel time from the start point to the first stop", () => {
    const result = generateRecommendation(
      {
        ...input,
        desiredStops: 1,
        mealTypes: [MealType.BREAKFAST],
        transportMode: "WALKING"
      },
      [
        candidate({
          id: "far-first-stop",
          slug: "far-first-stop",
          latitude: 16.492,
          longitude: 107.5909
        })
      ]
    );

    expect(result.stops[0].distanceFromPreviousKm).toBeGreaterThan(3);
    expect(result.stops[0].estimatedTravelMinutes).toBeGreaterThanOrEqual(20);
    expect(result.stops[0].estimatedTravelMinutes).toBeLessThanOrEqual(30);
    expect(result.summary.totalTravelMinutes).toBe(result.stops[0].estimatedTravelMinutes);
  });
});
