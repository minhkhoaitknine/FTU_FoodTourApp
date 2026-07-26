import { revalidateTag } from "next/cache";
import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/users";
import { reviewInputSchema } from "@/services/reviews/review-schemas";
import { deleteOwnReview, updateOwnReview } from "@/services/reviews/review-service";
import { RESTAURANT_CACHE_TAG } from "@/services/restaurants/restaurant-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const { id } = await context.params;
    const input = reviewInputSchema.parse(await request.json());
    const review = await updateOwnReview(user.id, id, input);
    if (!review) return jsonError("Review not found.", 404);

    revalidateTag(RESTAURANT_CACHE_TAG, { expire: 0 });
    return Response.json({ ok: true, review });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const { id } = await context.params;
    const review = await deleteOwnReview(user.id, id);
    if (!review) return jsonError("Review not found.", 404);

    revalidateTag(RESTAURANT_CACHE_TAG, { expire: 0 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
