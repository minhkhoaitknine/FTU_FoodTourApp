import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/users";
import {
  deleteUserFoodTour,
  getUserFoodTour,
  updateUserFoodTourPlan
} from "@/services/food-tours/food-tour-service";
import { updateFoodTourPlanSchema } from "@/services/food-tours/food-tour-schemas";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const { id } = await context.params;
    const tour = await getUserFoodTour(user.id, id);
    if (!tour) return jsonError("Food tour not found.", 404);

    return Response.json({ ok: true, tour });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const { id } = await context.params;
    const deleted = await deleteUserFoodTour(user.id, id);
    if (!deleted) return jsonError("Food tour not found.", 404);

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const { id } = await context.params;
    const input = updateFoodTourPlanSchema.parse(await request.json());
    const tour = await updateUserFoodTourPlan(user.id, id, input);
    if (!tour) return jsonError("Food tour not found.", 404);

    return Response.json({ ok: true, tour });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "Invalid tour restaurant.") {
      return jsonError("Every stop must use an active restaurant in this tour city.", 400);
    }
    console.error(error);
    return serverError();
  }
}
