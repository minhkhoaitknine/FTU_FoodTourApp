import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { requireApiRole } from "@/lib/auth/api-guards";
import {
  createAdminRestaurant,
  listAdminRestaurants
} from "@/services/admin/admin-service";
import {
  adminCreateRestaurantSchema,
  adminListQuerySchema
} from "@/services/admin/admin-schemas";

export async function GET(request: Request) {
  try {
    const auth = await requireApiRole(["ADMIN"]);
    if (!auth.ok) return jsonError(auth.message, auth.status);

    const url = new URL(request.url);
    const query = adminListQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listAdminRestaurants(query);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiRole(["ADMIN"]);
    if (!auth.ok) return jsonError(auth.message, auth.status);

    const input = adminCreateRestaurantSchema.parse(await request.json());
    const restaurant = await createAdminRestaurant(input);
    return Response.json({ ok: true, restaurant }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "MIN_PRICE_GT_MAX_PRICE") {
      return jsonError("Minimum price cannot be greater than maximum price.", 422);
    }
    console.error(error);
    return serverError();
  }
}
