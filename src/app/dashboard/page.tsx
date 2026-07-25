import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/auth/users";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="min-h-screen p-4 md:p-6">
      <section className="mx-auto max-w-5xl rounded-[28px] bg-white/90 p-6 shadow-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">
              Protected user route
            </p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {user.fullName}</h1>
            <p className="mt-2 text-sm text-stone-600">
              Signed in as {user.email} with role {user.role}.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-6">
          <Link className="rounded-2xl bg-clay-50 p-4 font-semibold text-clay-700" href="/">
            View public preview
          </Link>
          <Link className="rounded-2xl bg-leaf-500/10 p-4 font-semibold text-leaf-700" href="/admin">
            Try admin guard
          </Link>
          <Link className="rounded-2xl bg-stone-100 p-4 font-semibold text-stone-700" href="/restaurants">
            Browse restaurants
          </Link>
          <Link className="rounded-2xl bg-clay-50 p-4 font-semibold text-clay-700" href="/map">
            Open food map
          </Link>
          <Link className="rounded-2xl bg-leaf-500/10 p-4 font-semibold text-leaf-700" href="/tour-generator">
            Generate tour
          </Link>
          <Link className="rounded-2xl bg-stone-100 p-4 font-semibold text-stone-700" href="/favorites">
            Favorites
          </Link>
        </div>
      </section>
    </main>
  );
}
