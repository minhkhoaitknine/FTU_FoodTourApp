import {
  ModerationActionType,
  Prisma,
  ReviewStatus,
  type PriceRange,
  type RestaurantType,
  type UserRole
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  AdminCreateRestaurantInput,
  AdminListQuery,
  AdminModerateReviewInput,
  AdminReviewListQuery,
  AdminUpdateRestaurantInput,
  AdminUpdateUserInput
} from "@/services/admin/admin-schemas";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

async function createUniqueSlug(name: string) {
  const base = slugify(name) || "demo-restaurant";
  let slug = base;
  let suffix = 2;

  while (await prisma.restaurant.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function getAdminDashboard() {
  const [
    users,
    lockedUsers,
    restaurants,
    inactiveRestaurants,
    reviews,
    hiddenReviews,
    flaggedReviews,
    tours,
    recentReviews,
    recentTours
  ] = await prisma.$transaction([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, isLocked: true } }),
    prisma.restaurant.count({ where: { deletedAt: null } }),
    prisma.restaurant.count({ where: { deletedAt: null, isActive: false } }),
    prisma.review.count({ where: { deletedAt: null } }),
    prisma.review.count({ where: { deletedAt: null, status: ReviewStatus.HIDDEN } }),
    prisma.review.count({ where: { deletedAt: null, status: ReviewStatus.FLAGGED } }),
    prisma.foodTour.count({ where: { deletedAt: null } }),
    prisma.review.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        rating: true,
        status: true,
        comment: true,
        createdAt: true,
        user: { select: { fullName: true, email: true } },
        restaurant: { select: { name: true, city: { select: { name: true } } } }
      }
    }),
    prisma.foodTour.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        totalCost: true,
        createdAt: true,
        user: { select: { fullName: true, email: true } },
        city: { select: { name: true } }
      }
    })
  ]);

  return {
    stats: {
      users,
      lockedUsers,
      restaurants,
      inactiveRestaurants,
      reviews,
      hiddenReviews,
      flaggedReviews,
      tours
    },
    recentReviews,
    recentTours
  };
}

const adminRestaurantSelect = {
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
  averageMealMinutes: true,
  isVegetarianFriendly: true,
  isSpicy: true,
  isActive: true,
  createdAt: true,
  city: { select: { id: true, name: true, region: true } },
  _count: { select: { reviews: true, favorites: true, tourStops: true } }
} satisfies Prisma.RestaurantSelect;

export type AdminRestaurant = Prisma.RestaurantGetPayload<{ select: typeof adminRestaurantSelect }>;

export async function listAdminRestaurants(query: AdminListQuery) {
  const where: Prisma.RestaurantWhereInput = {
    deletedAt: null,
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { address: { contains: query.q, mode: "insensitive" } },
            { city: { name: { contains: query.q, mode: "insensitive" } } }
          ]
        }
      : {})
  };
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await prisma.$transaction([
    prisma.restaurant.findMany({
      where,
      select: adminRestaurantSelect,
      orderBy: [{ isActive: "asc" }, { updatedAt: "desc" }],
      skip,
      take: query.limit
    }),
    prisma.restaurant.count({ where })
  ]);

  return {
    items,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) }
  };
}

export async function createAdminRestaurant(input: AdminCreateRestaurantInput) {
  if (input.minPrice > input.maxPrice) {
    throw new Error("MIN_PRICE_GT_MAX_PRICE");
  }

  const slug = await createUniqueSlug(input.name);
  return prisma.restaurant.create({
    data: {
      ...input,
      slug,
      culturalStory: input.culturalStory,
      eatingTips: input.eatingTips,
      isDemo: true
    },
    select: adminRestaurantSelect
  });
}

export async function updateAdminRestaurant(id: string, input: AdminUpdateRestaurantInput) {
  if (
    input.minPrice !== undefined &&
    input.maxPrice !== undefined &&
    input.minPrice > input.maxPrice
  ) {
    throw new Error("MIN_PRICE_GT_MAX_PRICE");
  }

  return prisma.restaurant.update({
    where: { id },
    data: input,
    select: adminRestaurantSelect
  });
}

const adminUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isLocked: true,
  createdAt: true,
  _count: { select: { reviews: true, favorites: true, foodTours: true } }
} satisfies Prisma.UserSelect;

export type AdminUser = Prisma.UserGetPayload<{ select: typeof adminUserSelect }>;

export async function listAdminUsers(query: AdminListQuery) {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(query.q
      ? {
          OR: [
            { email: { contains: query.q, mode: "insensitive" } },
            { fullName: { contains: query.q, mode: "insensitive" } }
          ]
        }
      : {})
  };
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: adminUserSelect,
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      skip,
      take: query.limit
    }),
    prisma.user.count({ where })
  ]);

  return {
    items,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) }
  };
}

export async function updateAdminUser(id: string, input: AdminUpdateUserInput, actorId: string) {
  if (id === actorId && input.isLocked === true) {
    throw new Error("CANNOT_LOCK_SELF");
  }

  return prisma.user.update({
    where: { id },
    data: input,
    select: adminUserSelect
  });
}

const adminReviewSelect = {
  id: true,
  rating: true,
  comment: true,
  status: true,
  moderationReason: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, fullName: true, email: true } },
  restaurant: { select: { id: true, name: true, slug: true, city: { select: { name: true } } } }
} satisfies Prisma.ReviewSelect;

export type AdminReview = Prisma.ReviewGetPayload<{ select: typeof adminReviewSelect }>;

export async function listAdminReviews(query: AdminReviewListQuery) {
  const where: Prisma.ReviewWhereInput = {
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { comment: { contains: query.q, mode: "insensitive" } },
            { user: { fullName: { contains: query.q, mode: "insensitive" } } },
            { user: { email: { contains: query.q, mode: "insensitive" } } },
            { restaurant: { name: { contains: query.q, mode: "insensitive" } } }
          ]
        }
      : {})
  };
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      select: adminReviewSelect,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip,
      take: query.limit
    }),
    prisma.review.count({ where })
  ]);

  return {
    items,
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) }
  };
}

function toModerationAction(status: ReviewStatus): ModerationActionType {
  if (status === ReviewStatus.PUBLISHED) return ModerationActionType.PUBLISH_REVIEW;
  if (status === ReviewStatus.HIDDEN) return ModerationActionType.HIDE_REVIEW;
  return ModerationActionType.FLAG_REVIEW;
}

export async function moderateAdminReview(id: string, input: AdminModerateReviewInput, moderatorId: string) {
  return prisma.$transaction(async (tx) => {
    const review = await tx.review.update({
      where: { id },
      data: {
        status: input.status,
        moderationReason: input.reason
      },
      select: adminReviewSelect
    });

    await tx.moderationAction.create({
      data: {
        moderatorId,
        reviewId: id,
        action: toModerationAction(input.status),
        reason: input.reason
      }
    });

    return review;
  });
}

export async function listAdminCities() {
  return prisma.city.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, region: true, latitude: true, longitude: true }
  });
}

export const adminEnums = {
  roles: ["USER", "MODERATOR", "ADMIN"] satisfies UserRole[],
  reviewStatuses: ["PUBLISHED", "HIDDEN", "FLAGGED"] satisfies ReviewStatus[],
  restaurantTypes: [
    "STREET_FOOD",
    "LOCAL_EATERY",
    "RESTAURANT",
    "CAFE",
    "MARKET_STALL",
    "DESSERT_SHOP"
  ] satisfies RestaurantType[],
  priceRanges: ["BUDGET", "MODERATE", "PREMIUM"] satisfies PriceRange[]
};
