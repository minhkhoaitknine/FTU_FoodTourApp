import { prisma } from "@/lib/db/prisma";

export async function listFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      userId: true,
      restaurantId: true,
      createdAt: true,
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          minPrice: true,
          maxPrice: true,
          ratingAverage: true,
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
            orderBy: { name: "asc" },
            select: {
              name: true
            }
          }
        }
      }
    }
  });
}

export async function isFavorite(userId: string, restaurantId: string) {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId
      }
    },
    select: { userId: true }
  });

  return Boolean(favorite);
}

export async function addFavorite(userId: string, restaurantId: string) {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: restaurantId,
      isActive: true,
      deletedAt: null
    },
    select: { id: true }
  });

  if (!restaurant) return null;

  return prisma.favorite.upsert({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId
      }
    },
    create: {
      userId,
      restaurantId
    },
    update: {}
  });
}

export async function removeFavorite(userId: string, restaurantId: string) {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId
      }
    }
  });

  if (!favorite) return null;

  return prisma.favorite.delete({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId
      }
    }
  });
}
