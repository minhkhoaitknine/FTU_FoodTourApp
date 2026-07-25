import { notFound } from "next/navigation";
import { getRestaurantMenu } from "@/services/restaurants/restaurant-service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const restaurant = await getRestaurantMenu(id);
  if (!restaurant) notFound();

  return Response.json({
    ok: true,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name
    },
    menuCategories: restaurant.menuCategories
  });
}

