import { z } from "zod";

export const reviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(2).max(800)
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

