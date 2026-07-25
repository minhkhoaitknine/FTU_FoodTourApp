import { PriceRange, RestaurantType, ReviewStatus } from "@prisma/client";
import { z } from "zod";

const booleanQuery = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined || value === "") return undefined;
    return value === "true";
  });

export const restaurantListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  type: z.nativeEnum(RestaurantType).optional(),
  priceRange: z.nativeEnum(PriceRange).optional(),
  vegetarian: booleanQuery,
  spicy: booleanQuery,
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(48).optional().default(12)
});

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  status: z.nativeEnum(ReviewStatus).optional().default(ReviewStatus.PUBLISHED)
});

export type RestaurantListQuery = z.infer<typeof restaurantListQuerySchema>;
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;

