import { revalidateTag } from "next/cache";
import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { requireApiRole } from "@/lib/auth/api-guards";
import { updateAdminRestaurant } from "@/services/admin/admin-service";
import { adminUpdateRestaurantSchema } from "@/services/admin/admin-schemas";
import { RESTAURANT_CACHE_TAG } from "@/services/restaurants/restaurant-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireApiRole(["ADMIN"]);
    if (!auth.ok) return jsonError(auth.message, auth.status);

    const { id } = await context.params;
    const input = adminUpdateRestaurantSchema.parse(await request.json());
    const restaurant = await updateAdminRestaurant(id, input);
    revalidateTag(RESTAURANT_CACHE_TAG, { expire: 0 });
    return Response.json({ ok: true, restaurant });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "MIN_PRICE_GT_MAX_PRICE") {
      return jsonError("Minimum price cannot be greater than maximum price.", 422);
    }
    console.error(error);
    return serverError();
  }
}
