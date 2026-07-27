import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import {
  withCityUiMetadata,
  withRestaurantUiMetadata
} from "@/lib/api/ui-metadata";
import { prisma } from "@/lib/db/prisma";
import type { RestaurantListQuery, ReviewListQuery } from "@/services/restaurants/restaurant-schemas";

export const RESTAURANT_CACHE_TAG = "restaurant-catalog";

const restaurantListSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  address: true,
  latitude: true,
  longitude: true,
  type: true,
  priceRange: true,
  minPrice: true,
  maxPrice: true,
  ratingAverage: true,
  ratingCount: true,
  isVegetarianFriendly: true,
  isSpicy: true,
  averageMealMinutes: true,
  city: {
    select: {
      id: true,
      name: true,
      region: true
    }
  },
  images: {
    orderBy: { sortOrder: "asc" },
    take: 1,
    select: {
      url: true,
      alt: true
    }
  },
  tags: {
    select: {
      name: true
    },
    orderBy: {
      name: "asc"
    }
  }
} satisfies Prisma.RestaurantSelect;

export type RestaurantCard = Prisma.RestaurantGetPayload<{
  select: typeof restaurantListSelect;
}>;

const getRestaurantCatalog = unstable_cache(
  () =>
    prisma.restaurant.findMany({
      where: {
        isActive: true,
        deletedAt: null
      },
      select: restaurantListSelect,
      orderBy: [{ ratingAverage: "desc" }, { ratingCount: "desc" }, { name: "asc" }]
    }),
  ["public-restaurant-catalog-v1"],
  {
    revalidate: 300,
    tags: [RESTAURANT_CACHE_TAG]
  }
);

const getCachedCities = unstable_cache(
  () =>
    prisma.city.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        region: true,
        latitude: true,
        longitude: true
      }
    }),
  ["public-city-list-v1"],
  {
    revalidate: 3600,
    tags: ["cities"]
  }
);

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("vi");
}

export function filterRestaurantCatalog(
  catalog: RestaurantCard[],
  query: RestaurantListQuery
) {
  const search = normalizeSearch(query.q);
  const city = normalizeSearch(query.city);

  return catalog.filter((restaurant) => {
    if (search) {
      const matchesSearch = [
        restaurant.name,
        restaurant.description,
        restaurant.address,
        ...restaurant.tags.map((tag) => tag.name)
      ].some((value) => normalizeSearch(value).includes(search));

      if (!matchesSearch) return false;
    }

    if (city && !normalizeSearch(restaurant.city.name).includes(city)) return false;
    if (query.type && restaurant.type !== query.type) return false;
    if (query.priceRange && restaurant.priceRange !== query.priceRange) return false;
    if (
      query.vegetarian !== undefined &&
      restaurant.isVegetarianFriendly !== query.vegetarian
    ) {
      return false;
    }
    if (query.spicy !== undefined && restaurant.isSpicy !== query.spicy) return false;
    if (query.minRating !== undefined && restaurant.ratingAverage < query.minRating) {
      return false;
    }

    return true;
  });
}

export async function listRestaurants(query: RestaurantListQuery) {
  const catalog = await getRestaurantCatalog();
  const filtered = filterRestaurantCatalog(catalog, query);

  const skip = (query.page - 1) * query.limit;
  const items = filtered.slice(skip, skip + query.limit);
  const total = filtered.length;

  return {
    items: items.map(withRestaurantUiMetadata),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}

export async function listMapRestaurants(limit = 80) {
  const catalog = await getRestaurantCatalog();

  return [...catalog]
    .sort(
      (a, b) =>
        a.city.name.localeCompare(b.city.name, "vi") ||
        b.ratingAverage - a.ratingAverage ||
        a.name.localeCompare(b.name, "vi")
    )
    .slice(0, limit)
    .map(withRestaurantUiMetadata);
}

export async function getRestaurantBySlugOrId(slugOrId: string) {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [{ id: slugOrId }, { slug: slugOrId }],
      isActive: true,
      deletedAt: null
    },
    include: {
      city: true,
      images: { orderBy: { sortOrder: "asc" } },
      tags: { orderBy: { name: "asc" } },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      menuCategories: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { price: "asc" }
          }
        }
      },
      reviews: {
        where: {
          status: "PUBLISHED",
          deletedAt: null
        },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: {
            select: {
              fullName: true,
              avatarUrl: true
            }
          }
        }
      }
    }
  });

  return restaurant ? withRestaurantUiMetadata(restaurant) : null;
}

export async function getRestaurantMenu(slugOrId: string) {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [{ id: slugOrId }, { slug: slugOrId }],
      isActive: true,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      menuCategories: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { price: "asc" }
          }
        }
      }
    }
  });

  return restaurant;
}

export async function listRestaurantReviews(slugOrId: string, query: ReviewListQuery) {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [{ id: slugOrId }, { slug: slugOrId }],
      isActive: true,
      deletedAt: null
    },
    select: { id: true, name: true }
  });

  if (!restaurant) return null;

  const where: Prisma.ReviewWhereInput = {
    restaurantId: restaurant.id,
    status: query.status,
    deletedAt: null
  };

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
            avatarUrl: true
          }
        }
      }
    }),
    prisma.review.count({ where })
  ]);

  return {
    restaurant,
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}

export async function listCities() {
  const cities = await getCachedCities();
  return cities.map(withCityUiMetadata);
}
