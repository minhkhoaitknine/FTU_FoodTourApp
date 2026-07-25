import type { MealType, PriceRange, RestaurantType, TransportMode } from "@prisma/client";
import type { Coordinate } from "@/services/routing/haversine";
import type { OpeningHourLike } from "@/services/recommendations/opening-hours";

export type RecommendationCandidate = Coordinate & {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  type: RestaurantType;
  priceRange: PriceRange;
  minPrice: number;
  maxPrice: number;
  ratingAverage: number;
  ratingCount: number;
  averageMealMinutes: number;
  isVegetarianFriendly: boolean;
  isSpicy: boolean;
  tags: string[];
  allergens: string[];
  openingHours: OpeningHourLike[];
};

export type RecommendationInput = {
  start: Coordinate;
  startAt: Date;
  budget: number;
  numberOfPeople: number;
  transportMode: Extract<TransportMode, "WALKING" | "BICYCLE" | "MOTORBIKE" | "CAR">;
  preferences: string[];
  vegetarian: boolean;
  allergies: string[];
  desiredStops: number;
  maxDistanceKm: number;
  mealTypes: MealType[];
};

export type ScoredCandidate = {
  candidate: RecommendationCandidate;
  score: number;
  estimatedCostPerPerson: number;
  distanceKm: number;
  reasons: string[];
};

