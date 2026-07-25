import { prisma } from "@/lib/db/prisma";

export async function listSoundscapes() {
  return prisma.soundscape.findMany({
    where: { isActive: true },
    orderBy: [{ city: { name: "asc" } }, { title: "asc" }],
    include: {
      city: true
    }
  });
}
