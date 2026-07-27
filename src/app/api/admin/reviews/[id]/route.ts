import { revalidateTag } from "next/cache";
import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { requireApiRole } from "@/lib/auth/api-guards";
import { moderateAdminReview } from "@/services/admin/admin-service";
import { adminModerateReviewSchema } from "@/services/admin/admin-schemas";
import { RESTAURANT_CACHE_TAG } from "@/services/restaurants/restaurant-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireApiRole(["ADMIN", "MODERATOR"]);
    if (!auth.ok) return jsonError(auth.message, auth.status);

    const { id } = await context.params;
    const input = adminModerateReviewSchema.parse(await request.json());
    const review = await moderateAdminReview(id, input, auth.user.id);
    revalidateTag(RESTAURANT_CACHE_TAG, { expire: 0 });
    return Response.json({ ok: true, review });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}
