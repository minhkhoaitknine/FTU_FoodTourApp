import { PriceRange, TransportMode, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { jsonError, serverError, validationError } from "@/lib/api/responses";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/auth/schemas";
import { setAuthCookie } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/auth/users";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true }
    });

    if (existingUser) {
      return jsonError("Email is already registered.", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        role: UserRole.USER,
        preference: {
          create: {
            spicyLevel: 2,
            vegetarian: false,
            preferredPriceRange: PriceRange.MODERATE,
            preferredTransport: TransportMode.MOTORBIKE,
            cuisines: [],
            allergies: []
          }
        }
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true
      }
    });

    const response = NextResponse.json({ ok: true, user: toSafeUser(user) }, { status: 201 });
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

