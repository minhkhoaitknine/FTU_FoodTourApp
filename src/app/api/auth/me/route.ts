import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/users";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ ok: true, user: null }, { status: 200 });
  }

  return NextResponse.json({ ok: true, user });
}

