import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { RestaurantListQuery, ReviewListQuery } from "@/services/restaurants/restaurant-schemas";

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

export async function listRestaurants(query: RestaurantListQuery) {
  const where: Prisma.RestaurantWhereInput = {
    isActive: true,
    deletedAt: null,
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
            { address: { contains: query.q, mode: "insensitive" } },
            { tags: { some: { name: { contains: query.q, mode: "insensitive" } } } }
          ]
        }
      : {}),
    ...(query.city ? { city: { name: { contains: query.city, mode: "insensitive" } } } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.priceRange ? { priceRange: query.priceRange } : {}),
    ...(query.vegetarian !== undefined ? { isVegetarianFriendly: query.vegetarian } : {}),
    ...(query.spicy !== undefined ? { isSpicy: query.spicy } : {}),
    ...(query.minRating !== undefined ? { ratingAverage: { gte: query.minRating } } : {})
  };

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await prisma.$transaction([
    prisma.restaurant.findMany({
      where,
      select: restaurantListSelect,
      orderBy: [{ ratingAverage: "desc" }, { ratingCount: "desc" }, { name: "asc" }],
      skip,
      take: query.limit
    }),
    prisma.restaurant.count({ where })
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit))
    }
  };
}

export async function listMapRestaurants(limit = 80) {
  return prisma.restaurant.findMany({
    where: {
      isActive: true,
      deletedAt: null
    },
    select: restaurantListSelect,
    orderBy: [{ city: { name: "asc" } }, { ratingAverage: "desc" }, { name: "asc" }],
    take: limit
  });
}

export async function getRestaurantBySlugOrId(slugOrId: string) {
  return prisma.restaurant.findFirst({
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
  return prisma.city.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      region: true,
      latitude: true,
      longitude: true
    }
  });
}
