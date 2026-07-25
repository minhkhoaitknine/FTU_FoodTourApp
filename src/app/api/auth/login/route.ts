import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/schemas";
import { setAuthCookie } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/auth/users";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        isLocked: true,
        deletedAt: true
      }
    });

    if (!user || user.deletedAt) {
      return jsonError("Invalid email or password.", 401);
    }

    if (user.isLocked) {
      return jsonError("This account is locked.", 403);
    }

    const passwordMatches = await verifyPassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      return jsonError("Invalid email or password.", 401);
    }

    const response = NextResponse.json({
      ok: true,
      user: toSafeUser(user)
    });

    await setAuthCookie(response, {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    console.error(error);
    return serverError();
  }
}

