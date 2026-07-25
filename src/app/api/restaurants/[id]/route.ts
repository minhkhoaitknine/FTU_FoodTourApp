import { notFound } from "next/navigation";
import { getRestaurantBySlugOrId } from "@/services/restaurants/restaurant-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const restaurant = await getRestaurantBySlugOrId(id);
  if (!restaurant) notFound();

  return Response.json({ ok: true, restaurant });
}

