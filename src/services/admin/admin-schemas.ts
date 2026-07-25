import { PriceRange, RestaurantType, ReviewStatus, UserRole } from "@prisma/client";
import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === "" ? undefined : value));

export const adminListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12)
});

export const adminReviewListQuerySchema = adminListQuerySchema.extend({
  status: z.nativeEnum(ReviewStatus).optional()
});

export const adminCreateRestaurantSchema = z.object({
  cityId: z.string().cuid(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(600),
  culturalStory: z.string().trim().min(10).max(800).default("Demo cultural story for presentation."),
  eatingTips: z.string().trim().min(5).max(500).default("Arrive outside peak hours and confirm prices before ordering."),
  address: z.string().trim().min(5).max(220),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  type: z.nativeEnum(RestaurantType),
  priceRange: z.nativeEnum(PriceRange),
  averageMealMinutes: z.coerce.number().int().min(15).max(180).default(45),
  minPrice: z.coerce.number().int().min(0).max(10000000),
  maxPrice: z.coerce.number().int().min(0).max(10000000),
  isVegetarianFriendly: z.boolean().optional().default(false),
  isSpicy: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true)
});

export const adminUpdateRestaurantSchema = z
  .object({
    name: optionalText(120),
    description: optionalText(600),
    culturalStory: optionalText(800),
    eatingTips: optionalText(500),
    address: optionalText(220),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    type: z.nativeEnum(RestaurantType).optional(),
    priceRange: z.nativeEnum(PriceRange).optional(),
    averageMealMinutes: z.coerce.number().int().min(15).max(180).optional(),
    minPrice: z.coerce.number().int().min(0).max(10000000).optional(),
    maxPrice: z.coerce.number().int().min(0).max(10000000).optional(),
    isVegetarianFriendly: z.boolean().optional(),
    isSpicy: z.boolean().optional(),
    isActive: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

export const adminUpdateUserSchema = z
  .object({
    role: z.nativeEnum(UserRole).optional(),
    isLocked: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

export const adminModerateReviewSchema = z.object({
  status: z.enum([ReviewStatus.PUBLISHED, ReviewStatus.HIDDEN, ReviewStatus.FLAGGED]),
  reason: z.string().trim().min(3).max(300)
});

export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
export type AdminReviewListQuery = z.infer<typeof adminReviewListQuerySchema>;
export type AdminCreateRestaurantInput = z.infer<typeof adminCreateRestaurantSchema>;
export type AdminUpdateRestaurantInput = z.infer<typeof adminUpdateRestaurantSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type AdminModerateReviewInput = z.infer<typeof adminModerateReviewSchema>;
