import Link from "next/link";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import { DesktopSidebar, MobileNavigation } from "@/components/layout/app-navigation";
import { CityBackground } from "@/components/layout/city-background";
import { getCurrentUser } from "@/lib/auth/users";
import { resolveCityImage, type ResolvedImageAsset } from "@/lib/assets/image-resolver";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  className?: string;
  currentCityName?: string;
  currentCityNames?: string[];
};

const baseMobileMenuLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Plan tour", href: "/tour-generator" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Food map", href: "/map" },
  { label: "Saved tours", href: "/tours" },
  { label: "Favorites", href: "/favorites" },
  { label: "Soundscape", href: "/soundscape" }
] as const;

export async function AppShell({
  children,
  className,
  currentCityName = "Vietnam",
  currentCityNames
}: AppShellProps) {
  const user = await getCurrentUser();
  const isSignedIn = Boolean(user);
  const showAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";
  const adminLabel = user?.role === "MODERATOR" ? "Moderation" : "Admin Panel";
  const homeHref = isSignedIn ? "/dashboard" : "/";
  const backgroundImages = resolveShellBackgrounds(currentCityNames ?? [currentCityName]);

  return (
    <div className="relative isolate min-h-screen bg-canvas text-content">
      <CityBackground images={backgroundImages} />
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-app focus:bg-surface-inverse focus:px-4 focus:py-2 focus:text-content-inverse"
        href="#main-content"
      >
        Skip to content
      </a>

      <div className="relative z-10 lg:flex">
        <DesktopSidebar adminLabel={adminLabel} homeHref={homeHref} showAdmin={showAdmin} />
        <div className="min-w-0 flex-1">
          <TopBar adminLabel={adminLabel} homeHref={homeHref} showAdmin={showAdmin} />
          <main
            className={cn(
              "px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 md:px-6 md:pb-10 lg:px-8",
              "lg:pt-8",
              className
            )}
            id="main-content"
          >
            {children}
          </main>
        </div>
      </div>

      <MobileNavigation adminLabel={adminLabel} showAdmin={showAdmin} />
    </div>
  );
}

function resolveShellBackgrounds(cityNames: string[]) {
  const images: ResolvedImageAsset[] = [];
  const seen = new Set<string>();

  for (const cityName of cityNames) {
    const image = resolveCityImage(cityName);
    if (seen.has(image.src)) continue;
    seen.add(image.src);
    images.push(image);
  }

  if (images.length === 0) images.push(resolveCityImage("Vietnam"));
  return images;
}

export function PageContainer({
  children,
  className,
  size = "7xl"
}: {
  children: ReactNode;
  className?: string;
  size?: "5xl" | "6xl" | "7xl";
}) {
  const maxWidth = {
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl"
  }[size];

  return <section className={cn("mx-auto space-y-5", maxWidth, className)}>{children}</section>;
}

function TopBar({
  adminLabel,
  homeHref,
  showAdmin
}: {
  adminLabel: string;
  homeHref: string;
  showAdmin: boolean;
}) {
  return (
    <header className="sticky top-0 z-sticky border-b border-white/50 bg-canvas/82 px-4 py-3 backdrop-blur-xl md:px-6 lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Link
          aria-label="FoodTour"
          className="flex min-w-0 items-center gap-2 rounded-app px-1 py-1 lg:hidden"
          href={homeHref}
        >
          <span className="grid size-9 place-items-center rounded-app bg-brand text-content-inverse">
            FT
          </span>
          <span className="truncate font-bold">FoodTour</span>
        </Link>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <Link
            className="rounded-app border border-line bg-surface-elevated px-3 py-2 text-sm font-semibold text-content transition hover:border-brand hover:text-brand-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20"
            href="/restaurants"
          >
            Explore
          </Link>
          <Link
            className="hidden rounded-app bg-surface-inverse px-3 py-2 text-sm font-semibold text-content-inverse transition hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20 xs:inline-flex"
            href="/tour-generator"
          >
            Create
          </Link>
          <MobileMoreMenu adminLabel={adminLabel} showAdmin={showAdmin} />
        </div>
      </div>
    </header>
  );
}

function MobileMoreMenu({ adminLabel, showAdmin }: { adminLabel: string; showAdmin: boolean }) {
  const adminMobileMenuLink = { label: adminLabel, href: "/admin" } as const;
  const mobileMenuLinks = showAdmin
    ? [...baseMobileMenuLinks, adminMobileMenuLink]
    : baseMobileMenuLinks;

  return (
    <details className="group relative lg:hidden">
      <summary
        aria-label="Open navigation menu"
        className="grid size-11 cursor-pointer list-none place-items-center rounded-app border border-line bg-surface-elevated text-content transition hover:border-brand hover:text-brand-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20 [&::-webkit-details-marker]:hidden"
      >
        <Menu aria-hidden="true" size={20} />
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(18rem,calc(100vw-2rem))] rounded-app border border-line bg-surface-elevated p-2 shadow-overlay">
        <nav aria-label="All mobile navigation" className="grid gap-1">
          {mobileMenuLinks.map((item) => (
            <Link
              className="rounded-app px-3 py-2 text-sm font-semibold text-content-muted transition hover:bg-surface-muted hover:text-content focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </details>
  );
}
