import { notFound } from "next/navigation";
import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/users";
import { reviewInputSchema } from "@/services/reviews/review-schemas";
import { createOrUpdateReview } from "@/services/reviews/review-service";
import { listRestaurantReviews } from "@/services/restaurants/restaurant-service";
import { reviewListQuerySchema } from "@/services/restaurants/restaurant-schemas";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const query = reviewListQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listRestaurantReviews(id, query);
    if (!result) notFound();

    return Response.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const { id } = await context.params;
    const input = reviewInputSchema.parse(await request.json());
    const review = await createOrUpdateReview(user.id, id, input);
    if (!review) return jsonError("Restaurant not found.", 404);

    return Response.json({ ok: true, review }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}
