import { MealType } from "@prisma/client";
import { haversineDistanceKm } from "@/services/routing/haversine";
import { estimateStopCostPerPerson } from "@/services/recommendations/budget";
import type { RecommendationCandidate, RecommendationInput, ScoredCandidate } from "@/services/recommendations/types";

const mealTagMap: Record<MealType, string[]> = {
  BREAKFAST: ["breakfast", "noodle", "coffee"],
  LUNCH: ["lunch", "local-food", "vegetarian"],
  SNACK: ["snack", "dessert", "coffee", "street-food"],
  DINNER: ["dinner", "seafood", "night-food"],
  COFFEE: ["coffee", "dessert"],
  NIGHT: ["night-food", "street-food", "seafood"]
};

function normalize(values: string[]) {
  return values.map((value) => value.toLowerCase().trim()).filter(Boolean);
}

export function hasAllergyConflict(candidate: RecommendationCandidate, allergies: string[]) {
  const normalizedAllergies = normalize(allergies);
  if (normalizedAllergies.length === 0) return false;

  const candidateAllergens = normalize(candidate.allergens);
  return normalizedAllergies.some((allergy) => candidateAllergens.includes(allergy));
}

export function matchesMealType(candidate: RecommendationCandidate, mealType: MealType) {
  const tags = normalize(candidate.tags);
  return mealTagMap[mealType].some((tag) => tags.includes(tag));
}

export function scoreCandidate(
  candidate: RecommendationCandidate,
  input: RecommendationInput,
  mealType: MealType
): ScoredCandidate {
  const tags = normalize(candidate.tags);
  const preferences = normalize(input.preferences);
  const matchedPreferences = preferences.filter((preference) => tags.includes(preference));
  const distanceKm = haversineDistanceKm(input.start, candidate);
  const estimatedCostPerPerson = estimateStopCostPerPerson(candidate.minPrice, candidate.maxPrice);
  const perPersonBudget = input.budget / input.numberOfPeople;
  const reasons: string[] = [];

  let score = 0;

  if (matchedPreferences.length > 0) {
    score += Math.min(30, matchedPreferences.length * 10);
    reasons.push(`Matches preferences: ${matchedPreferences.join(", ")}`);
  }

  if (!input.vegetarian || candidate.isVegetarianFriendly) {
    score += 20;
    if (input.vegetarian) reasons.push("Vegetarian friendly");
  }

  score += Math.min(15, candidate.ratingAverage * 3);
  if (candidate.ratingAverage >= 4.5) reasons.push("Highly rated");

  const distanceScore = Math.max(0, 15 - (distanceKm / input.maxDistanceKm) * 15);
  score += distanceScore;
  if (distanceKm <= input.maxDistanceKm) reasons.push(`Within ${input.maxDistanceKm} km range`);

  const budgetScore = Math.max(0, 10 - (estimatedCostPerPerson / perPersonBudget) * 10);
  score += budgetScore;
  if (estimatedCostPerPerson <= perPersonBudget) reasons.push("Fits budget");

  if (matchesMealType(candidate, mealType)) {
    score += 8;
    reasons.push(`Good fit for ${mealType.toLowerCase()}`);
  }

  if (candidate.isSpicy && preferences.includes("spicy")) {
    score += 5;
    reasons.push("Matches spicy preference");
  }

  return {
    candidate,
    score: Number(score.toFixed(2)),
    estimatedCostPerPerson,
    distanceKm,
    reasons: reasons.length > 0 ? reasons : ["Balanced score across rating, distance and budget"]
  };
}

