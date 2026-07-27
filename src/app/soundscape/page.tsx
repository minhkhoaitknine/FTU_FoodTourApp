import Link from "next/link";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { SoundscapePlayer } from "@/components/soundscapes/soundscape-player";
import { buttonVariants } from "@/components/ui";
import { listSoundscapes } from "@/services/soundscapes/soundscape-service";

export const dynamic = "force-dynamic";

export default async function SoundscapePage() {
  const soundscapes = await listSoundscapes();
  const cityNames = soundscapes.map((soundscape) => soundscape.city.name);

  return (
    <AppShell currentCityNames={cityNames}>
      <PageContainer size="5xl">
        <header className="flex flex-col gap-4 rounded-[28px] bg-surface-elevated/90 p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-strong">City ambience</p>
            <h1 className="mt-2 text-page-title text-content">Street Soundscape</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-content-muted">
              Simple audio player for city ambience placeholders. Replace with licensed audio assets before production.
            </p>
          </div>
          <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/dashboard">
            Dashboard
          </Link>
        </header>

        <SoundscapePlayer soundscapes={soundscapes} />
      </PageContainer>
    </AppShell>
  );
}
