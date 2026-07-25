import { jsonError, serverError } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/users";
import { deleteUserFoodTour, getUserFoodTour } from "@/services/food-tours/food-tour-service";

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

