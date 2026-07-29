import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { requireApiUser } from "@/lib/auth/api-guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setAuthCookie } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/auth/users";
import { prisma } from "@/lib/db/prisma";
import { updateProfileSchema } from "@/services/profile/profile-schemas";

export async function PATCH(request: Request) {
  try {
    const auth = await requireApiUser();
    if (!auth.ok) return jsonError(auth.message, auth.status);

    const input = updateProfileSchema.parse(await request.json());

    if (input.fullName !== undefined && input.fullName.length < 2) {
      return jsonError("Full name must be at least 2 characters.", 422);
    }

    const currentUser = await prisma.user.findUniqueOrThrow({
      where: { id: auth.user.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true
      }
    });

    const data: Prisma.UserUpdateInput = {};
    if (input.fullName !== undefined) data.fullName = input.fullName;
    if (input.email !== undefined) data.email = input.email;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;

    if (input.newPassword) {
      const passwordMatches = await verifyPassword(input.currentPassword ?? "", currentUser.passwordHash);
      if (!passwordMatches) {
        return jsonError("Current password is incorrect.", 401);
      }

      data.passwordHash = await hashPassword(input.newPassword);
    }

    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true
      }
    });

    const response = NextResponse.json({ ok: true, user: toSafeUser(user) });
    if (user.email !== currentUser.email) {
      await setAuthCookie(response, {
        userId: user.id,
        email: user.email,
        role: user.role
      });
    }

    return response;
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Email is already registered.", 409);
    }
    console.error(error);
    return serverError();
  }
}
