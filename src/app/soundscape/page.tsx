import Link from "next/link";
import { SoundscapePlayer } from "@/components/soundscapes/soundscape-player";
import { listSoundscapes } from "@/services/soundscapes/soundscape-service";

export default async function SoundscapePage() {
  const soundscapes = await listSoundscapes();

  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <section className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-col gap-3 rounded-[28px] bg-white/85 p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Phase 9</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Street Soundscape</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Simple audio player for city ambience placeholders. Replace with licensed audio assets before production.
            </p>
          </div>
          <Link className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" href="/dashboard">
            Dashboard
          </Link>
        </header>

        <SoundscapePlayer soundscapes={soundscapes} />
      </section>
    </main>
  );
}
