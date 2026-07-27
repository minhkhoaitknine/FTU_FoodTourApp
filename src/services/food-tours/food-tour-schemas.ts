import { MealType } from "@prisma/client";
import { z } from "zod";
import { recommendationRequestSchema } from "@/services/recommendations/recommendation-schemas";

export const createFoodTourSchema = recommendationRequestSchema.extend({
  title: z.string().trim().min(2).max(120).default("My Food Tour")
});

export const updateFoodTourPlanSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  stops: z
    .array(
      z.object({
        restaurantId: z.string().min(1),
        mealType: z.nativeEnum(MealType),
        plannedArrivalAt: z.coerce.date(),
        estimatedMealMinutes: z.number().int().min(5).max(240),
        estimatedCost: z.number().int().min(0).max(20_000_000),
        reason: z.string().trim().min(2).max(500)
      })
    )
    .min(1)
    .max(8)
});

export type CreateFoodTourInput = z.infer<typeof createFoodTourSchema>;
export type UpdateFoodTourPlanInput = z.infer<typeof updateFoodTourPlanSchema>;
