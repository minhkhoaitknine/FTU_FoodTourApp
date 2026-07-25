import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/users";
import {
  generateAndSaveFoodTour,
  listUserFoodTours
} from "@/services/food-tours/food-tour-service";
import { createFoodTourSchema } from "@/services/food-tours/food-tour-schemas";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const tours = await listUserFoodTours(user.id);
    return Response.json({ ok: true, tours });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonError("Authentication required.", 401);

    const input = createFoodTourSchema.parse(await request.json());
    const result = await generateAndSaveFoodTour(user.id, input);

    if (!result.tour) {
      return Response.json(
        {
          ok: false,
          error: "No eligible restaurants matched the constraints.",
          recommendation: result.result
        },
        { status: 422 }
      );
    }

    return Response.json({
      ok: true,
      tour: result.tour,
      recommendation: result.result
    }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "City not found.") return jsonError(error.message, 404);
    console.error(error);
    return serverError();
  }
}

