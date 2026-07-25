import { ZodError } from "zod";
import { serverError, validationError } from "@/lib/api/responses";
import { listRestaurants } from "@/services/restaurants/restaurant-service";
import { restaurantListQuerySchema } from "@/services/restaurants/restaurant-schemas";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = restaurantListQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listRestaurants(query);

    return Response.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}

