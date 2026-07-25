import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { requireApiRole } from "@/lib/auth/api-guards";
import { moderateAdminReview } from "@/services/admin/admin-service";
import { adminModerateReviewSchema } from "@/services/admin/admin-schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireApiRole(["ADMIN"]);
    if (!auth.ok) return jsonError(auth.message, auth.status);

    const { id } = await context.params;
    const input = adminModerateReviewSchema.parse(await request.json());
    const review = await moderateAdminReview(id, input, auth.user.id);
    return Response.json({ ok: true, review });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}
