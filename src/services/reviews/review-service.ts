import { ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { ReviewInput } from "@/services/reviews/review-schemas";

export async function recalculateRestaurantRating(restaurantId: string) {
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

  const existing = await prisma.review.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId
      }
    },
    select: {
      id: true,
      status: true
    }
  });

  const review = existing
    ? await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: input.rating,
          comment: input.comment,
          status:
            existing.status === ReviewStatus.PUBLISHED
              ? ReviewStatus.PUBLISHED
              : ReviewStatus.PENDING,
          moderationReason:
            existing.status === ReviewStatus.PUBLISHED ? null : "Edited by user; pending review.",
          deletedAt: null
        }
      })
    : await prisma.review.create({
        data: {
          userId,
          restaurantId,
          rating: input.rating,
          comment: input.comment,
          status: ReviewStatus.PUBLISHED
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
      restaurantId: true,
      status: true
    }
  });

  if (!existing) return null;

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: input.rating,
      comment: input.comment,
      status:
        existing.status === ReviewStatus.PUBLISHED
          ? ReviewStatus.PUBLISHED
          : ReviewStatus.PENDING,
      moderationReason:
        existing.status === ReviewStatus.PUBLISHED ? null : "Edited by user; pending review."
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
