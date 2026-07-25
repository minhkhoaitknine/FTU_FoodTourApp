import { ZodError } from "zod";
import { serverError, validationError } from "@/lib/api/responses";
import { estimateRoute, routeRequestSchema } from "@/services/routing/route-service";

export async function POST(request: Request) {
  try {
    const input = routeRequestSchema.parse(await request.json());
    const route = estimateRoute(input.points, input.transportMode);

    return Response.json({
      ok: true,
      route,
      notice: "Route is estimated with Haversine fallback. No external routing API was called."
    });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}
