import { MealType, TransportMode } from "@prisma/client";
import { z } from "zod";

export const recommendationRequestSchema = z.object({
  cityId: z.string().optional(),
  cityName: z.string().trim().optional(),
  startAddress: z.string().trim().min(2).max(160).default("Demo start point"),
  startLatitude: z.number().min(-90).max(90),
  startLongitude: z.number().min(-180).max(180),
  startAt: z.coerce.date(),
  durationHours: z.number().int().min(2).max(16).default(10),
  numberOfDays: z.number().int().min(1).max(3).default(1),
  budget: z.number().int().min(20_000).max(20_000_000),
  numberOfPeople: z.number().int().min(1).max(20).default(1),
  transportMode: z.nativeEnum(TransportMode).default(TransportMode.MOTORBIKE),
  preferences: z.array(z.string().trim().min(1)).default([]),
  vegetarian: z.boolean().default(false),
  allergies: z.array(z.string().trim().min(1)).default([]),
  desiredStops: z.number().int().min(1).max(8).default(4),
  maxDistanceKm: z.number().min(0.5).max(80).default(15),
  mealTypes: z.array(z.nativeEnum(MealType)).min(1).max(8).default([
    MealType.BREAKFAST,
    MealType.LUNCH,
    MealType.SNACK,
    MealType.DINNER
  ])
});

export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>;

