import { MealType } from "@prisma/client";
import { estimateTravelMinutes, haversineDistanceKm } from "@/services/routing/haversine";
import { fitsRemainingBudget } from "@/services/recommendations/budget";
import { isOpenAt } from "@/services/recommendations/opening-hours";
import { hasAllergyConflict, scoreCandidate } from "@/services/recommendations/scoring";
import type {
  RecommendationCandidate,
  RecommendationInput,
  ScoredCandidate
} from "@/services/recommendations/types";

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function scheduleTimeForStop(startAt: Date, stopIndex: number) {
  const offsets = [0, 240, 480, 690, 840, 960, 1110, 1260];
  return addMinutes(startAt, offsets[stopIndex] ?? stopIndex * 180);
}

function diversityPenalty(candidate: RecommendationCandidate, selected: ScoredCandidate[]) {
  const candidateTags = new Set(candidate.tags);
  const overlap = selected.reduce((count, item) => {
    return count + item.candidate.tags.filter((tag) => candidateTags.has(tag)).length;
  }, 0);

  return Math.min(12, overlap * 2);
}

function nearestNeighborOrder(start: RecommendationInput["start"], selected: ScoredCandidate[]) {
  const remaining = [...selected];
  const ordered: ScoredCandidate[] = [];
  let current = start;

  while (remaining.length > 0) {
    remaining.sort(
      (a, b) =>
        haversineDistanceKm(current, a.candidate) - haversineDistanceKm(current, b.candidate)
    );
    const next = remaining.shift();
    if (!next) break;
    ordered.push(next);
    current = next.candidate;
  }

  return ordered;
}

export function generateRecommendation(input: RecommendationInput, candidates: RecommendationCandidate[]) {
  const filtered = candidates.filter((candidate) => {
    if (hasAllergyConflict(candidate, input.allergies)) return false;
    if (input.vegetarian && !candidate.isVegetarianFriendly) return false;
    if (haversineDistanceKm(input.start, candidate) > input.maxDistanceKm) return false;
    return true;
  });

  const selected: ScoredCandidate[] = [];
  let totalCost = 0;

  for (let index = 0; index < Math.min(input.desiredStops, input.mealTypes.length); index += 1) {
    const mealType = input.mealTypes[index] ?? MealType.SNACK;
    const plannedTime = scheduleTimeForStop(input.startAt, index);
    const available = filtered
      .filter((candidate) => !selected.some((item) => item.candidate.id === candidate.id))
      .filter((candidate) => isOpenAt(candidate.openingHours, plannedTime))
      .map((candidate) => {
        const scored = scoreCandidate(candidate, input, mealType);
        return {
          ...scored,
          score: Number((scored.score - diversityPenalty(candidate, selected)).toFixed(2))
        };
      })
      .filter((scored) =>
        fitsRemainingBudget({
          currentTotalCost: totalCost,
          stopCostPerPerson: scored.estimatedCostPerPerson,
          numberOfPeople: input.numberOfPeople,
          totalBudget: input.budget
        })
      )
      .sort((a, b) => b.score - a.score);

    const chosen = available[0];
    if (!chosen) continue;
    selected.push(chosen);
    totalCost += chosen.estimatedCostPerPerson * input.numberOfPeople;
  }

  const ordered = nearestNeighborOrder(input.start, selected);
  let current = input.start;
  let totalDistanceKm = 0;
  let totalTravelMinutes = 0;

  const stops = ordered.map((item, index) => {
    const distanceFromPreviousKm = haversineDistanceKm(current, item.candidate);
    const estimatedTravelMinutes = estimateTravelMinutes(distanceFromPreviousKm, input.transportMode);
    totalDistanceKm += distanceFromPreviousKm;
    totalTravelMinutes += estimatedTravelMinutes;
    current = item.candidate;

    return {
      order: index + 1,
      mealType: input.mealTypes[index] ?? MealType.SNACK,
      plannedArrivalAt: scheduleTimeForStop(input.startAt, index).toISOString(),
      restaurant: item.candidate,
      recommendationScore: item.score,
      estimatedCostPerPerson: item.estimatedCostPerPerson,
      estimatedCost: item.estimatedCostPerPerson * input.numberOfPeople,
      estimatedMealMinutes: item.candidate.averageMealMinutes,
      estimatedTravelMinutes,
      distanceFromPreviousKm,
      reason: item.reasons.join(". ")
    };
  });

  return {
    stops,
    summary: {
      requestedStops: input.desiredStops,
      selectedStops: stops.length,
      totalCost,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      totalTravelMinutes,
      isRouteEstimated: true
    },
    warnings: stops.length < input.desiredStops ? ["Not enough eligible restaurants matched all constraints."] : []
  };
}
