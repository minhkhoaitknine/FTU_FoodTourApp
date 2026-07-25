import { z, ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/users";
import { addFavorite, listFavorites } from "@/services/favorites/favorite-service";

const favoriteInputSchema = z.object({
  restaurantId: z.string().min(1)
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const favorites = await listFavorites(user.id);
    return Response.json({ ok: true, favorites });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const input = favoriteInputSchema.parse(await request.json());
    const favorite = await addFavorite(user.id, input.restaurantId);
    if (!favorite) return jsonError("Restaurant not found.", 404);

    return Response.json({ ok: true, favorite }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}

