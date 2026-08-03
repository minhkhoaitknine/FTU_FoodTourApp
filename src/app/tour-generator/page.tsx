import Link from "next/link";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { TourGeneratorForm } from "@/components/tours/tour-generator-form";
import { requireUser } from "@/lib/auth/users";
import { listCities } from "@/services/restaurants/restaurant-service";

export default async function TourGeneratorPage() {
  await requireUser();
  const cities = await listCities();

  return (
    <AppShell currentCityNames={cities.map((city) => city.name)}>
      <PageContainer>
        <header className="flex flex-col gap-3 rounded-[28px] bg-white/85 p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-strong">Tour generator</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Tastetrail Planner</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Choose a city, budget, group size and food preferences to generate a saved route.
            </p>
          </div>
          <Link className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" href="/tours">
            Tour history
          </Link>
        </header>

        <TourGeneratorForm cities={cities} />
      </PageContainer>
    </AppShell>
  );
}
