import { z } from "zod";
import { recommendationRequestSchema } from "@/services/recommendations/recommendation-schemas";

export const createFoodTourSchema = recommendationRequestSchema.extend({
  title: z.string().trim().min(2).max(120).default("My Food Tour")
});

export type CreateFoodTourInput = z.infer<typeof createFoodTourSchema>;

