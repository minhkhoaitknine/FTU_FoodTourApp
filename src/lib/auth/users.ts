import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSessionFromCookies, type AuthRole } from "@/lib/auth/session";

export type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: AuthRole;
};

export function toSafeUser(user: {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: AuthRole;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: normalizeLegacyBrandName(user.fullName),
    avatarUrl: user.avatarUrl,
    role: user.role
  } satisfies SafeUser;
}

function normalizeLegacyBrandName(name: string) {
  if (name === "FoodTour Admin") return "Tastetrail Admin";
  if (name === "FoodTour Moderator") return "Tastetrail Moderator";
  if (name === "FoodTour User") return "Tastetrail User";
  return name;
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
      deletedAt: null,
      isLocked: false
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true
    }
  });

  return user ? toSafeUser(user) : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: AuthRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}
