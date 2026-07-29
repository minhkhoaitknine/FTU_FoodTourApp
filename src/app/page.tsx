import { ArrowRight, Heart, MapPinned, Route, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/common/brand-logo";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui";
import { getSessionFromCookies } from "@/lib/auth/session";

const featuredCities = ["Hoi An", "Da Nang", "Ha Noi", "Ho Chi Minh City", "Da Lat"];

export default async function HomePage() {
  const session = await getSessionFromCookies();
  if (session) redirect("/dashboard");

  return (
    <AppShell currentCityNames={featuredCities}>
      <PageContainer>
        <header className="rounded-[28px] bg-surface-elevated/[0.65] p-6 shadow-panel backdrop-blur md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-strong">FoodTour</p>
              <h1 className="mt-3 max-w-3xl text-display text-content">
                Plan local food routes across Vietnam travel cities
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-content-muted">
                Search restaurants, generate a route, edit the stops and save food tours for your trip.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className={buttonVariants({ size: "lg" })} href="/login">
                Login
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/restaurants">
                Explore places
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PublicFeature
            description="Browse seeded restaurants by city, type, price and rating."
            icon={<Search aria-hidden="true" size={22} />}
            title="Explore places"
          />
          <PublicFeature
            description="Create a rule-based itinerary from budget, time and preferences."
            icon={<Route aria-hidden="true" size={22} />}
            title="Plan a tour"
          />
          <PublicFeature
            description="Preview food places and choose markers on the map."
            icon={<MapPinned aria-hidden="true" size={22} />}
            title="Use the map"
          />
          <PublicFeature
            description="Save favorite restaurants and revisit saved tour history after login."
            icon={<Heart aria-hidden="true" size={22} />}
            title="Save picks"
          />
        </section>

        <section className="rounded-[28px] bg-surface-elevated/[0.65] p-6 shadow-panel md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <BrandLogo className="size-14" />
              <h2 className="mt-4 text-section-title text-content">Demo accounts are available</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-content-muted">
                Use the login page to enter as User, Moderator or Admin and review the complete workflow.
              </p>
            </div>
            <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href="/login">
              Open login
            </Link>
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}

function PublicFeature({
  description,
  icon,
  title
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <article className="rounded-[24px] bg-surface-elevated/[0.65] p-5 shadow-panel">
      <div className="flex size-11 items-center justify-center rounded-app bg-brand-soft text-brand-strong">
        {icon}
      </div>
      <h2 className="mt-4 text-card-title text-content">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-content-muted">{description}</p>
    </article>
  );
}
