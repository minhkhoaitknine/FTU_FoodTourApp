import { jsonError, serverError } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/users";
import { removeFavorite } from "@/services/favorites/favorite-service";

type RouteContext = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const { restaurantId } = await context.params;
    await removeFavorite(user.id, restaurantId);
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}

