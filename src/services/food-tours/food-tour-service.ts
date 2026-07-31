import { Prisma, TourStatus, TransportMode } from "@prisma/client";
import { withFoodTourUiMetadata } from "@/lib/api/ui-metadata";
import { prisma } from "@/lib/db/prisma";
import { generateRecommendation } from "@/services/recommendations/recommendation-engine";
import { listRecommendationCandidates } from "@/services/recommendations/recommendation-data";
import { estimateTravelMinutes, haversineDistanceKm, type Coordinate } from "@/services/routing/haversine";
import type {
  CreateFoodTourInput,
  UpdateFoodTourPlanInput
} from "@/services/food-tours/food-tour-schemas";

function engineTransportMode(mode: TransportMode) {
  return mode === TransportMode.PUBLIC_TRANSIT ? TransportMode.MOTORBIKE : mode;
}

function routingTransportMode(mode: TransportMode) {
  return mode === TransportMode.PUBLIC_TRANSIT ? TransportMode.MOTORBIKE : mode;
}

async function resolveCity(input: CreateFoodTourInput) {
  const city = await prisma.city.findFirst({
    where: {
      ...(input.cityId ? { id: input.cityId } : {}),
      ...(input.cityName ? { name: { equals: input.cityName, mode: "insensitive" } } : {})
    }
  });

  if (!city) {
    throw new Error("City not found.");
  }

  return city;
}

export async function generateAndSaveFoodTour(userId: string, input: CreateFoodTourInput) {
  const city = await resolveCity(input);
  const candidates = await listRecommendationCandidates({ cityId: city.id });
  const result = generateRecommendation(
    {
      start: {
        latitude: input.startLatitude,
        longitude: input.startLongitude
      },
      startAt: input.startAt,
      budget: input.budget,
      numberOfPeople: input.numberOfPeople,
      transportMode: engineTransportMode(input.transportMode),
      preferences: input.preferences,
      vegetarian: input.vegetarian,
      allergies: input.allergies,
      desiredStops: input.desiredStops,
      maxDistanceKm: input.maxDistanceKm,
      mealTypes: input.mealTypes
    },
    candidates
  );

  if (result.stops.length === 0) {
    return { tour: null, result };
  }

  const tour = await prisma.foodTour.create({
    data: {
      userId,
      cityId: city.id,
      title: input.title,
      startAddress: input.startAddress,
      startLatitude: input.startLatitude,
      startLongitude: input.startLongitude,
      startAt: input.startAt,
      durationHours: input.durationHours,
      numberOfDays: input.numberOfDays,
      numberOfPeople: input.numberOfPeople,
      budget: input.budget,
      transportMode: input.transportMode,
      preferences: {
        preferences: input.preferences,
        vegetarian: input.vegetarian,
        allergies: input.allergies,
        desiredStops: input.desiredStops,
        maxDistanceKm: input.maxDistanceKm,
        mealTypes: input.mealTypes
      },
      totalCost: result.summary.totalCost,
      totalDistanceKm: result.summary.totalDistanceKm,
      totalTravelMinutes: result.summary.totalTravelMinutes,
      status: TourStatus.SAVED,
      stops: {
        create: result.stops.map((stop) => ({
          restaurantId: stop.restaurant.id,
          stopOrder: stop.order,
          mealType: stop.mealType,
          plannedArrivalAt: new Date(stop.plannedArrivalAt),
          estimatedMealMinutes: stop.estimatedMealMinutes,
          estimatedTravelMinutes: stop.estimatedTravelMinutes,
          distanceFromPreviousKm: stop.distanceFromPreviousKm,
          estimatedCost: stop.estimatedCost,
          reason: stop.reason
        }))
      }
    },
    include: foodTourDetailInclude
  });

  return { tour: withFoodTourUiMetadata(tour), result };
}

export const foodTourDetailInclude = {
  city: true,
  stops: {
    orderBy: { stopOrder: "asc" as const },
    include: {
      restaurant: {
        include: {
          images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
          tags: { orderBy: { name: "asc" as const } }
        }
      }
    }
  }
};

export async function listUserFoodTours(userId: string) {
  const tours = await prisma.foodTour.findMany({
    where: {
      userId,
      deletedAt: null
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      totalCost: true,
      totalDistanceKm: true,
      totalTravelMinutes: true,
      transportMode: true,
      city: {
        select: {
          id: true,
          name: true,
          region: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          updatedAt: true
        }
      },
      stops: {
        orderBy: { stopOrder: "asc" },
        select: {
          id: true,
          restaurant: {
            select: {
              name: true,
              slug: true
            }
          },
          distanceFromPreviousKm: true,
          estimatedTravelMinutes: true
        }
      },
      _count: {
        select: {
          stops: true
        }
      }
    }
  });

  return tours.map((tour) => {
    const mapped = withFoodTourUiMetadata(tour);
    return {
      ...mapped,
      summary: {
        ...mapped.summary,
        stopCount: tour._count.stops
      }
    };
  });
}

export async function getUserFoodTour(userId: string, tourId: string) {
  const tour = await prisma.foodTour.findFirst({
    where: {
      id: tourId,
      userId,
      deletedAt: null
    },
    include: foodTourDetailInclude
  });

  return tour ? withFoodTourUiMetadata(tour) : null;
}

export async function cloneUserFoodTour(userId: string, tourId: string) {
  const existing = await getUserFoodTour(userId, tourId);
  if (!existing) return null;

  const cloned = await prisma.foodTour.create({
    data: {
      userId,
      cityId: existing.cityId,
      title: `${existing.title} (clone)`,
      startAddress: existing.startAddress,
      startLatitude: existing.startLatitude,
      startLongitude: existing.startLongitude,
      startAt: existing.startAt,
      durationHours: existing.durationHours,
      numberOfDays: existing.numberOfDays,
      numberOfPeople: existing.numberOfPeople,
      budget: existing.budget,
      transportMode: existing.transportMode,
      preferences: existing.preferences as Prisma.InputJsonValue,
      totalCost: existing.totalCost,
      totalDistanceKm: existing.totalDistanceKm,
      totalTravelMinutes: existing.totalTravelMinutes,
      status: TourStatus.SAVED,
      stops: {
        create: existing.stops.map((stop) => ({
          restaurantId: stop.restaurantId,
          stopOrder: stop.stopOrder,
          mealType: stop.mealType,
          plannedArrivalAt: stop.plannedArrivalAt,
          estimatedMealMinutes: stop.estimatedMealMinutes,
          estimatedTravelMinutes: stop.estimatedTravelMinutes,
          distanceFromPreviousKm: stop.distanceFromPreviousKm,
          estimatedCost: stop.estimatedCost,
          reason: stop.reason
        }))
      }
    },
    include: foodTourDetailInclude
  });

  return withFoodTourUiMetadata(cloned);
}

export async function deleteUserFoodTour(userId: string, tourId: string) {
  const existing = await prisma.foodTour.findFirst({
    where: {
      id: tourId,
      userId,
      deletedAt: null
    },
    select: { id: true }
  });

  if (!existing) return null;

  return prisma.foodTour.update({
    where: { id: tourId },
    data: {
      deletedAt: new Date(),
      status: TourStatus.ARCHIVED
    }
  });
}

export async function updateUserFoodTourPlan(
  userId: string,
  tourId: string,
  input: UpdateFoodTourPlanInput
) {
  const existing = await prisma.foodTour.findFirst({
    where: {
      id: tourId,
      userId,
      deletedAt: null
    },
    select: {
      id: true,
      cityId: true,
      title: true,
      startLatitude: true,
      startLongitude: true,
      transportMode: true
    }
  });

  if (!existing) return null;

  const restaurantIds = Array.from(new Set(input.stops.map((stop) => stop.restaurantId)));
  const restaurants = await prisma.restaurant.findMany({
    where: {
      id: { in: restaurantIds },
      cityId: existing.cityId,
      isActive: true,
      deletedAt: null
    },
    select: {
      id: true,
      latitude: true,
      longitude: true
    }
  });
  const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));

  if (restaurants.length !== restaurantIds.length) {
    throw new Error("Invalid tour restaurant.");
  }

  let current: Coordinate = {
    latitude: existing.startLatitude,
    longitude: existing.startLongitude
  };
  let totalCost = 0;
  let totalDistanceKm = 0;
  let totalTravelMinutes = 0;

  const normalizedStops = input.stops.map((stop, index) => {
    const restaurant = restaurantById.get(stop.restaurantId);
    if (!restaurant) throw new Error("Invalid tour restaurant.");

    const distanceFromPreviousKm = haversineDistanceKm(current, restaurant);
    const estimatedTravelMinutes = estimateTravelMinutes(
      distanceFromPreviousKm,
      routingTransportMode(existing.transportMode)
    );
    current = restaurant;
    totalCost += stop.estimatedCost;
    totalDistanceKm += distanceFromPreviousKm;
    totalTravelMinutes += estimatedTravelMinutes;

    return {
      restaurantId: stop.restaurantId,
      stopOrder: index + 1,
      mealType: stop.mealType,
      plannedArrivalAt: stop.plannedArrivalAt,
      estimatedMealMinutes: stop.estimatedMealMinutes,
      estimatedTravelMinutes,
      distanceFromPreviousKm,
      estimatedCost: stop.estimatedCost,
      reason: stop.reason
    };
  });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.foodTourStop.deleteMany({
      where: {
        foodTourId: existing.id
      }
    });

    return tx.foodTour.update({
      where: { id: existing.id },
      data: {
        title: input.title ?? existing.title,
        totalCost,
        totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
        totalTravelMinutes,
        stops: {
          create: normalizedStops
        }
      },
      include: foodTourDetailInclude
    });
  });

  return withFoodTourUiMetadata(updated);
}
