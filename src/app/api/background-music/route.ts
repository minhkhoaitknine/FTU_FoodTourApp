import { NextResponse } from "next/server";
import { listBackgroundMusicTracks } from "@/lib/music/playlist";

export const runtime = "nodejs";

export async function GET() {
  const tracks = await listBackgroundMusicTracks();
  return NextResponse.json({ ok: true, tracks });
}
