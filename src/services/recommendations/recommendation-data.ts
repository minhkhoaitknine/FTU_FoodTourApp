import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { RecommendationCandidate } from "@/services/recommendations/types";

const candidateSelect = {
  id: true,
  name: true,
  slug: true,
  cityId: true,
  latitude: true,
  longitude: true,
  type: true,
  priceRange: true,
  minPrice: true,
  maxPrice: true,
  ratingAverage: true,
  ratingCount: true,
  averageMealMinutes: true,
  isVegetarianFriendly: true,
  isSpicy: true,
  tags: {
    select: { name: true }
  },
  openingHours: {
    select: {
      dayOfWeek: true,
      openTime: true,
      closeTime: true,
      breakStart: true,
      breakEnd: true,
      isClosed: true
    }
  },
  menuCategories: {
    select: {
      items: {
        select: {
          allergens: true
        }
      }
    }
  }
} satisfies Prisma.RestaurantSelect;

type CandidateRecord = Prisma.RestaurantGetPayload<{
  select: typeof candidateSelect;
}>;

function jsonStringArray(value: Prisma.JsonValue) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toCandidate(record: CandidateRecord): RecommendationCandidate {
  const allergens = new Set<string>();
  for (const category of record.menuCategories) {
    for (const item of category.items) {
      for (const allergen of jsonStringArray(item.allergens)) {
        allergens.add(allergen.toLowerCase());
      }
    }
  }

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    cityId: record.cityId,
    latitude: record.latitude,
    longitude: record.longitude,
    type: record.type,
    priceRange: record.priceRange,
    minPrice: record.minPrice,
    maxPrice: record.maxPrice,
    ratingAverage: record.ratingAverage,
    ratingCount: record.ratingCount,
    averageMealMinutes: record.averageMealMinutes,
    isVegetarianFriendly: record.isVegetarianFriendly,
    isSpicy: record.isSpicy,
    tags: record.tags.map((tag) => tag.name),
    allergens: Array.from(allergens),
    openingHours: record.openingHours
  };
}

export async function listRecommendationCandidates(params: { cityId?: string; cityName?: string }) {
  const records = await prisma.restaurant.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      ...(params.cityId ? { cityId: params.cityId } : {}),
      ...(params.cityName ? { city: { name: { equals: params.cityName, mode: "insensitive" } } } : {})
    },
    select: candidateSelect,
    take: 120
  });

  return records.map(toCandidate);
}

