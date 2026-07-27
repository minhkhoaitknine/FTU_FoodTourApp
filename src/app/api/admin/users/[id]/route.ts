import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { requireApiRole } from "@/lib/auth/api-guards";
import { updateAdminUser } from "@/services/admin/admin-service";
import { adminUpdateUserSchema } from "@/services/admin/admin-schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireApiRole(["ADMIN"]);
    if (!auth.ok) return jsonError(auth.message, auth.status);

    const { id } = await context.params;
    const input = adminUpdateUserSchema.parse(await request.json());
    const user = await updateAdminUser(id, input, auth.user.id);
    return Response.json({ ok: true, user });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Error && error.message === "CANNOT_LOCK_SELF") {
      return jsonError("Admins cannot lock their own current account.", 422);
    }
    if (error instanceof Error && error.message === "CANNOT_CHANGE_SELF_ROLE") {
      return jsonError("Admins cannot remove their own admin role.", 422);
    }
    console.error(error);
    return serverError();
  }
}
