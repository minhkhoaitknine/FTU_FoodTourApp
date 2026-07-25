import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      service: "food-tour-generator",
      phase: "release-readiness",
      database: "reachable",
      uptimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        ok: false,
        service: "food-tour-generator",
        phase: "release-readiness",
        database: "unreachable",
        uptimeMs: Date.now() - startedAt,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
