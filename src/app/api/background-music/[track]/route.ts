import { NextResponse } from "next/server";
import { readBackgroundMusicTrack } from "@/lib/music/playlist";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    track: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { track: fileName } = await context.params;
  const result = await readBackgroundMusicTrack(fileName);

  if (!result) {
    return NextResponse.json({ ok: false, error: "Track not found." }, { status: 404 });
  }

  const range = parseRangeHeader(request.headers.get("range"), result.data.byteLength);
  if (range === "invalid") {
    return new NextResponse(null, {
      headers: {
        "Content-Range": `bytes */${result.data.byteLength}`
      },
      status: 416
    });
  }

  if (range) {
    const chunk = result.data.subarray(range.start, range.end + 1);

    return new NextResponse(new Uint8Array(chunk), {
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(chunk.byteLength),
        "Content-Range": `bytes ${range.start}-${range.end}/${result.data.byteLength}`,
        "Content-Type": result.track.mimeType
      },
      status: 206
    });
  }

  return new NextResponse(new Uint8Array(result.data), {
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(result.data.byteLength),
      "Content-Type": result.track.mimeType
    }
  });
}

function parseRangeHeader(value: string | null, size: number) {
  if (!value?.startsWith("bytes=")) return null;

  const [startValue, endValue] = value.slice("bytes=".length).split("-");
  if (!startValue && !endValue) return "invalid" as const;

  if (!startValue) {
    const suffixLength = Number(endValue);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return "invalid" as const;

    return {
      start: Math.max(size - suffixLength, 0),
      end: size - 1
    };
  }

  const start = Number(startValue);
  const end = endValue ? Number(endValue) : size - 1;

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) {
    return "invalid" as const;
  }

  return {
    start,
    end: Math.min(end, size - 1)
  };
}
