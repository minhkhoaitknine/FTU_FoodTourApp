import { serverError } from "@/lib/api/responses";
import { listCities } from "@/services/restaurants/restaurant-service";

export async function GET() {
  try {
    const cities = await listCities();
    return Response.json({ ok: true, cities });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
