import { MapPinned, Search } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6 text-content">
      <section className="w-full max-w-xl rounded-[24px] bg-surface-elevated/90 p-6 text-center shadow-panel">
        <div className="mx-auto flex size-14 items-center justify-center rounded-app bg-brand-soft text-brand-strong">
          <Search aria-hidden="true" size={26} />
        </div>
        <p className="mt-4 text-sm font-semibold uppercase text-brand-strong">404</p>
        <h1 className="mt-2 text-page-title">This food stop is not on the route</h1>
        <p className="mt-2 text-sm leading-6 text-content-muted">
          The page may have moved, or the demo item may no longer be active.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link className={buttonVariants()} href="/">
            Home
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/map"
          >
            <MapPinned aria-hidden="true" size={17} />
            Food map
          </Link>
        </div>
      </section>
    </main>
  );
}
