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

function defaultOpeningHours() {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    openTime: "07:00",
    closeTime: "22:00",
    isClosed: false
  }));
}

function defaultTags(input: AdminCreateRestaurantInput) {
  const tags = new Set(["local-food", "lunch", "dinner"]);

  if (input.isVegetarianFriendly) tags.add("vegetarian");
  if (input.isSpicy) tags.add("spicy");
  if (input.type === "CAFE") tags.add("coffee");
  if (input.type === "DESSERT_SHOP") tags.add("dessert");
  if (input.type === "MARKET_STALL") tags.add("market");
  if (input.type === "STREET_FOOD") tags.add("street-food");

  return Array.from(tags).map((name) => ({ name }));
}

function defaultMenuItems(input: Pick<AdminCreateRestaurantInput, "name" | "minPrice" | "maxPrice" | "isVegetarianFriendly" | "isSpicy">) {
  const averagePrice = Math.max(15_000, Math.round((input.minPrice + input.maxPrice) / 2));

  return [
    {
      name: `${input.name} signature dish`,
      description: "Admin-created demo menu item for food tour planning.",
      price: averagePrice,
      isVegetarian: input.isVegetarianFriendly,
      isSpicy: input.isSpicy,
      allergens: []
    }
  ];
}

function normalizeTagNames(names: string[]) {
  return Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
}

function toTagCreates(input: AdminCreateRestaurantInput) {
  const names = input.tags?.length ? input.tags : defaultTags(input).map((tag) => tag.name);
  return normalizeTagNames(names).map((name) => ({ name }));
}

function toMenuItemCreates(items: ReturnType<typeof defaultMenuItems> | NonNullable<AdminUpdateRestaurantInput["menuItems"]>) {
  return items.map((item) => ({
    name: item.name,
    description: item.description ?? "Admin-created demo menu item.",
    price: item.price,
    isVegetarian: item.isVegetarian,
    isSpicy: item.isSpicy,
    allergens: item.allergens as Prisma.InputJsonValue
  }));
}

function toCreateMenuItems(input: AdminCreateRestaurantInput) {
  return toMenuItemCreates(input.menuItems?.length ? input.menuItems : defaultMenuItems(input));
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
  images: {
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      url: true,
      alt: true,
      sortOrder: true
    }
  },
  tags: {
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true
    }
  },
  menuCategories: {
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      sortOrder: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          isVegetarian: true,
          isSpicy: true,
          allergens: true
        }
      }
    }
  },
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

  const { imageUrl, imageAlt } = input;
  const slug = await createUniqueSlug(input.name);
  return prisma.restaurant.create({
    data: {
      cityId: input.cityId,
      name: input.name,
      description: input.description,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      type: input.type,
      priceRange: input.priceRange,
      averageMealMinutes: input.averageMealMinutes,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
      isVegetarianFriendly: input.isVegetarianFriendly,
      isSpicy: input.isSpicy,
      isActive: input.isActive,
      slug,
      culturalStory: input.culturalStory,
      eatingTips: input.eatingTips,
      isDemo: true,
      ...(imageUrl
        ? {
            images: {
              create: {
                url: imageUrl,
                alt: imageAlt ?? `${input.name} restaurant image`,
                sortOrder: 1
              }
            }
          }
        : {}),
      tags: {
        create: toTagCreates(input)
      },
      openingHours: {
        create: defaultOpeningHours()
      },
      menuCategories: {
        create: {
          name: "Signature dishes",
          sortOrder: 1,
          items: {
            create: toCreateMenuItems(input)
          }
        }
      }
    },
    select: adminRestaurantSelect
  });
}

export async function updateAdminRestaurant(id: string, input: AdminUpdateRestaurantInput) {
  const current =
    input.minPrice === undefined || input.maxPrice === undefined
      ? await prisma.restaurant.findUnique({
          where: { id },
          select: { minPrice: true, maxPrice: true }
        })
      : null;
  const nextMinPrice = input.minPrice ?? current?.minPrice;
  const nextMaxPrice = input.maxPrice ?? current?.maxPrice;

  if (nextMinPrice !== undefined && nextMaxPrice !== undefined && nextMinPrice > nextMaxPrice) {
    throw new Error("MIN_PRICE_GT_MAX_PRICE");
  }

  const { imageUrl, imageAlt, tags, menuItems, ...restaurantData } = input;

  return prisma.$transaction(async (tx) => {
    await tx.restaurant.update({
      where: { id },
      data: restaurantData
    });

    if (imageUrl !== undefined || imageAlt !== undefined) {
      const currentImage = await tx.restaurantImage.findFirst({
        where: { restaurantId: id },
        orderBy: { sortOrder: "asc" },
        select: { url: true }
      });
      const nextUrl = imageUrl ?? currentImage?.url;

      await tx.restaurantImage.deleteMany({ where: { restaurantId: id } });

      if (nextUrl) {
        await tx.restaurantImage.create({
          data: {
            restaurantId: id,
            url: nextUrl,
            alt: imageAlt ?? "Restaurant image",
            sortOrder: 1
          }
        });
      }
    }

    if (tags !== undefined) {
      await tx.restaurantTag.deleteMany({ where: { restaurantId: id } });
      const tagNames = normalizeTagNames(tags);
      if (tagNames.length > 0) {
        await tx.restaurantTag.createMany({
          data: tagNames.map((name) => ({ restaurantId: id, name })),
          skipDuplicates: true
        });
      }
    }

    if (menuItems !== undefined) {
      await tx.menuCategory.deleteMany({ where: { restaurantId: id } });
      await tx.menuCategory.create({
        data: {
          restaurantId: id,
          name: "Signature dishes",
          sortOrder: 1,
          items: {
            create: toMenuItemCreates(menuItems)
          }
        }
      });
    }

    return tx.restaurant.findUniqueOrThrow({
      where: { id },
      select: adminRestaurantSelect
    });
  });
}

export async function deleteAdminRestaurant(id: string) {
  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.findUniqueOrThrow({
      where: { id },
      select: { id: true, name: true }
    });
    const relatedTours = await tx.foodTour.findMany({
      where: {
        stops: {
          some: {
            restaurantId: id
          }
        }
      },
      select: { id: true }
    });

    if (relatedTours.length > 0) {
      await tx.foodTour.deleteMany({
        where: {
          id: {
            in: relatedTours.map((tour) => tour.id)
          }
        }
      });
    }

    await tx.restaurant.delete({
      where: { id }
    });

    return {
      ...restaurant,
      deletedFoodTours: relatedTours.length
    };
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
  if (id === actorId && input.role !== undefined && input.role !== "ADMIN") {
    throw new Error("CANNOT_CHANGE_SELF_ROLE");
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
  restaurantId: true,
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

    const aggregate = await tx.review.aggregate({
      where: {
        restaurantId: review.restaurantId,
        status: ReviewStatus.PUBLISHED,
        deletedAt: null
      },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await tx.restaurant.update({
      where: { id: review.restaurantId },
      data: {
        ratingAverage: Number((aggregate._avg.rating ?? 0).toFixed(2)),
        ratingCount: aggregate._count.rating
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
