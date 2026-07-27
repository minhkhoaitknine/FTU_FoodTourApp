import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";

const getCachedSoundscapes = unstable_cache(
  () =>
    prisma.soundscape.findMany({
      where: { isActive: true },
      orderBy: [{ city: { name: "asc" } }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        audioUrl: true,
        attribution: true,
        city: {
          select: {
            id: true,
            name: true,
            region: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    }),
  ["public-soundscapes-v1"],
  {
    revalidate: 3600,
    tags: ["soundscapes"]
  }
);

export async function listSoundscapes() {
  return getCachedSoundscapes();
}
