import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { requireApiRole } from "@/lib/auth/api-guards";
import { listAdminReviews } from "@/services/admin/admin-service";
import { adminReviewListQuerySchema } from "@/services/admin/admin-schemas";

export async function GET(request: Request) {
  try {
    const auth = await requireApiRole(["ADMIN", "MODERATOR"]);
    if (!auth.ok) return jsonError(auth.message, auth.status);

    const url = new URL(request.url);
    const query = adminReviewListQuerySchema.parse(Object.fromEntries(url.searchParams));
    const result = await listAdminReviews(query);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}
