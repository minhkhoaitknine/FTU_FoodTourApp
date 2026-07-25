import { getSessionFromCookies, type AuthRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function requireApiUser() {
  const session = await getSessionFromCookies();
  if (!session) return { ok: false as const, status: 401, message: "Authentication required." };

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      deletedAt: null,
      isLocked: false
    },
    select: {
      id: true,
      email: true,
      role: true
    }
  });

  if (!user) return { ok: false as const, status: 401, message: "Authentication required." };
  return { ok: true as const, user };
}

export async function requireApiRole(roles: AuthRole[]) {
  const result = await requireApiUser();
  if (!result.ok) return result;

  if (!roles.includes(result.user.role)) {
    return { ok: false as const, status: 403, message: "Insufficient permissions." };
  }

  return result;
}
