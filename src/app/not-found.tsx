import { MapPinned, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-ink">
      <section className="w-full max-w-xl rounded-[24px] bg-white/90 p-6 text-center shadow-panel">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-clay-50 text-clay-700">
          <Search size={26} />
        </div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">404</p>
        <h1 className="mt-2 text-3xl font-bold">This food stop is not on the route</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          The page may have moved, or the demo item may no longer be active.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" href="/">
            Home
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-clay-700 shadow-sm"
            href="/map"
          >
            <MapPinned size={17} />
            Food map
          </Link>
        </div>
      </section>
    </main>
  );
}
