import Link from "next/link";
import { ArrowRight, CalendarDays, MapPinned, Plus, Route } from "lucide-react";
import { AppImage } from "@/components/common/app-image";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { Badge, buttonVariants } from "@/components/ui";
import { resolveCityImage } from "@/lib/assets/image-resolver";
import { formatVnd } from "@/lib/format";
import { requireUser } from "@/lib/auth/users";
import { listUserFoodTours } from "@/services/food-tours/food-tour-service";

export default async function TourHistoryPage() {
  const user = await requireUser();
  const tours = await listUserFoodTours(user.id);
  const cityNames = tours.map((tour) => tour.city.name);

  return (
    <AppShell currentCityNames={cityNames}>
      <PageContainer size="6xl">
        <header className="flex flex-col gap-4 rounded-[28px] bg-surface-elevated/90 p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-strong">Saved tours</p>
            <h1 className="mt-2 text-page-title text-content">Tour history</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-content-muted">
              Review, clone and restart your generated food routes.
            </p>
          </div>
          <Link className={buttonVariants({ size: "lg" })} href="/tour-generator">
            <Plus aria-hidden="true" size={18} />
            Create new tour
          </Link>
        </header>

        {tours.length > 0 ? (
          <>
            <section className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] bg-surface-elevated/90 p-4 shadow-panel">
                <p className="text-sm text-content-muted">Saved tours</p>
                <p className="mt-1 text-2xl font-bold text-content">{tours.length}</p>
              </div>
              <div className="rounded-[24px] bg-surface-elevated/90 p-4 shadow-panel">
                <p className="text-sm text-content-muted">Cities</p>
                <p className="mt-1 text-2xl font-bold text-content">{new Set(cityNames).size}</p>
              </div>
              <div className="rounded-[24px] bg-surface-elevated/90 p-4 shadow-panel">
                <p className="text-sm text-content-muted">Total stops</p>
                <p className="mt-1 text-2xl font-bold text-content">
                  {tours.reduce((total, tour) => total + tour.summary.stopCount, 0)}
                </p>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              {tours.map((tour) => {
                const cityImage = resolveCityImage(tour.city.name);

                return (
                  <Link
                    className="group overflow-hidden rounded-[28px] bg-surface-elevated/92 shadow-panel transition motion-safe:hover:-translate-y-0.5"
                    href={`/tours/${tour.id}`}
                    key={tour.id}
                  >
                    <AppImage
                      alt={cityImage.alt}
                      className="h-44 rounded-b-none"
                      imageClassName="transition duration-300 group-hover:scale-105"
                      src={cityImage.src}
                    />
                    <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-brand-strong">{tour.city.name}</p>
                        <h2 className="mt-1 text-card-title text-content">{tour.title}</h2>
                      </div>
                      <CalendarDays className="shrink-0 text-brand" aria-hidden="true" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-app bg-surface-muted p-3">
                        <p className="text-content-muted">Cost</p>
                        <p className="font-bold text-content">{formatVnd(tour.totalCost)}</p>
                      </div>
                      <div className="rounded-app bg-surface-muted p-3">
                        <p className="text-content-muted">Distance</p>
                        <p className="font-bold text-content">{tour.totalDistanceKm} km</p>
                      </div>
                      <div className="rounded-app bg-surface-muted p-3">
                        <p className="text-content-muted">Stops</p>
                        <p className="font-bold text-content">{tour.summary.stopCount}</p>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-content-muted">
                      {tour.stops.map((stop) => stop.restaurant.name).join(" -> ")}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <Badge variant="info">
                        <Route aria-hidden="true" size={13} />
                        {tour.totalTravelMinutes} min travel
                      </Badge>
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-strong">
                        View route
                        <ArrowRight
                          aria-hidden="true"
                          className="transition group-hover:translate-x-0.5"
                          size={16}
                        />
                      </span>
                    </div>
                  </div>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid gap-5 rounded-[28px] bg-surface-elevated/90 p-8 text-center shadow-panel md:grid-cols-[1fr_auto] md:text-left">
            <div>
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand-strong md:mx-0">
                <MapPinned aria-hidden="true" size={24} />
              </div>
              <h2 className="mt-4 text-section-title text-content">No saved tours yet</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-content-muted">
                Generate a route, save it, then come back here to clone or review it.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Link className={buttonVariants({ size: "lg" })} href="/tour-generator">
                Create first tour
              </Link>
            </div>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
