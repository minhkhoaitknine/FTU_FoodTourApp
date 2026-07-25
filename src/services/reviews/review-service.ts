import { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { ReviewInput } from "@/services/reviews/review-schemas";

async function recalculateRestaurantRating(restaurantId: string) {
  const aggregate = await prisma.review.aggregate({
    where: {
      restaurantId,
      status: ReviewStatus.PUBLISHED,
      deletedAt: null
    },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      ratingAverage: Number((aggregate._avg.rating ?? 0).toFixed(2)),
      ratingCount: aggregate._count.rating
    }
  });
}

export async function createOrUpdateReview(userId: string, restaurantId: string, input: ReviewInput) {
  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: restaurantId,
      isActive: true,
      deletedAt: null
    },
    select: { id: true }
  });

  if (!restaurant) return null;

  const review = await prisma.review.upsert({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId
      }
    },
    create: {
      userId,
      restaurantId,
      rating: input.rating,
      comment: input.comment,
      status: ReviewStatus.PUBLISHED
    },
    update: {
      rating: input.rating,
      comment: input.comment,
      status: ReviewStatus.PUBLISHED,
      moderationReason: null,
      deletedAt: null
    }
  });

  await recalculateRestaurantRating(restaurantId);
  return review;
}

export async function updateOwnReview(userId: string, reviewId: string, input: ReviewInput) {
  const existing = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId,
      deletedAt: null
    },
    select: {
      id: true,
      restaurantId: true
    }
  });

  if (!existing) return null;

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: input.rating,
      comment: input.comment,
      status: ReviewStatus.PUBLISHED,
      moderationReason: null
    }
  });

  await recalculateRestaurantRating(existing.restaurantId);
  return review;
}

export async function deleteOwnReview(userId: string, reviewId: string) {
  const existing = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId,
      deletedAt: null
    },
    select: {
      id: true,
      restaurantId: true
    }
  });

  if (!existing) return null;

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      deletedAt: new Date()
    }
  });

  await recalculateRestaurantRating(existing.restaurantId);
  return review;
}

export async function findOwnReview(userId: string, restaurantId: string) {
  return prisma.review.findFirst({
    where: {
      userId,
      restaurantId,
      deletedAt: null
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      status: true
    }
  });
}

