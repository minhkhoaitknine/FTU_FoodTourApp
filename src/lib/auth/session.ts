import { jwtVerify, SignJWT } from "jose";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_SESSION_SECONDS } from "@/lib/auth/constants";

export type AuthRole = "USER" | "MODERATOR" | "ADMIN";

export type AuthSession = {
  userId: string;
  email: string;
  role: AuthRole;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: AuthSession) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_SESSION_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      !["USER", "MODERATOR", "ADMIN"].includes(String(payload.role))
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role as AuthRole
    } satisfies AuthSession;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function setAuthCookie(response: NextResponse, session: AuthSession) {
  const token = await createSessionToken(session);

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: await shouldUseSecureCookie(),
    path: "/",
    maxAge: AUTH_SESSION_SECONDS
  });
}

export async function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: await shouldUseSecureCookie(),
    path: "/",
    maxAge: 0
  });
}

async function shouldUseSecureCookie() {
  if (process.env.NODE_ENV !== "production") return false;

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "";
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "";

  if (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]")
  ) {
    return false;
  }

  return forwardedProto === "https" || process.env.VERCEL === "1";
}
