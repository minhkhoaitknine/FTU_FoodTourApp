import { jsonError, serverError } from "@/lib/api/responses";
import { requireApiRole } from "@/lib/auth/api-guards";
import { getAdminDashboard } from "@/services/admin/admin-service";

export async function GET() {
  try {
    const auth = await requireApiRole(["ADMIN"]);
    if (!auth.ok) return jsonError(auth.message, auth.status);

    const dashboard = await getAdminDashboard();
    return Response.json({ ok: true, dashboard });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
