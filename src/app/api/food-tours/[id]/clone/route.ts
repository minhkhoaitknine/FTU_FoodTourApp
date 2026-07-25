import { jsonError, serverError } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/users";
import { cloneUserFoodTour } from "@/services/food-tours/food-tour-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const { id } = await context.params;
    const tour = await cloneUserFoodTour(user.id, id);
    if (!tour) return jsonError("Food tour not found.", 404);

    return Response.json({ ok: true, tour }, { status: 201 });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}

