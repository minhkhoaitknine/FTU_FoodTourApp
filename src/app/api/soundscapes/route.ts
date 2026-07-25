import { serverError } from "@/lib/api/responses";
import { listSoundscapes } from "@/services/soundscapes/soundscape-service";

export async function GET() {
  try {
    const soundscapes = await listSoundscapes();
    return Response.json({ ok: true, soundscapes });
  } catch (error) {
    console.error(error);
    return serverError();
  }
}
