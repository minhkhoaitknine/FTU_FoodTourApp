import { TransportMode } from "@prisma/client";
import { ZodError } from "zod";
import { serverError, validationError } from "@/lib/api/responses";
import { generateRecommendation } from "@/services/recommendations/recommendation-engine";
import { listRecommendationCandidates } from "@/services/recommendations/recommendation-data";
import { recommendationRequestSchema } from "@/services/recommendations/recommendation-schemas";

function supportedTransportMode(mode: TransportMode) {
  return mode === TransportMode.PUBLIC_TRANSIT ? TransportMode.MOTORBIKE : mode;
}

export async function POST(request: Request) {
  try {
    const input = recommendationRequestSchema.parse(await request.json());
    const candidates = await listRecommendationCandidates({
      cityId: input.cityId,
      cityName: input.cityName
    });

    const recommendation = generateRecommendation(
      {
        start: {
          latitude: input.startLatitude,
          longitude: input.startLongitude
        },
        startAt: input.startAt,
        budget: input.budget,
        numberOfPeople: input.numberOfPeople,
        transportMode: supportedTransportMode(input.transportMode),
        preferences: input.preferences,
        vegetarian: input.vegetarian,
        allergies: input.allergies,
        desiredStops: input.desiredStops,
        maxDistanceKm: input.maxDistanceKm,
        mealTypes: input.mealTypes
      },
      candidates
    );

    return Response.json({
      ok: true,
      engine: "rule-based-weighted-recommendation",
      ...recommendation
    });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}
