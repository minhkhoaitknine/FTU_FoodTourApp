"use client";

import {
  CalendarDays,
  Heart,
  History,
  LayoutDashboard,
  MapPinned,
  Shield,
  Store
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/common/brand-logo";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Plan tour", href: "/tour-generator", icon: CalendarDays },
  { label: "Restaurants", href: "/restaurants", icon: Store },
  { label: "Food map", href: "/map", icon: MapPinned },
  { label: "Tours", href: "/tours", icon: History },
  { label: "Favorites", href: "/favorites", icon: Heart }
] as const;

type AdminNavItem = {
  label: string;
  href: "/admin";
  icon: typeof Shield;
};

type NavItem = (typeof primaryNavItems)[number] | AdminNavItem;

type AppNavigationProps = {
  adminLabel?: string;
  homeHref?: string;
  showAdmin?: boolean;
};

export function DesktopSidebar({
  adminLabel = "Admin Panel",
  homeHref = "/",
  showAdmin = false
}: AppNavigationProps) {
  const adminNavItem = { label: adminLabel, href: "/admin", icon: Shield } as const;
  const navItems = showAdmin ? [...primaryNavItems, adminNavItem] : primaryNavItems;

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-white/55 bg-surface-elevated/[0.65] px-4 py-5 shadow-panel backdrop-blur-xl lg:flex lg:flex-col">
      <Link className="flex items-center gap-3 rounded-app px-2 py-2" href={homeHref}>
        <BrandLogo className="size-12" priority />
          <span>
          <span className="block text-xl font-bold text-content">Tastetrail</span>
          <span className="block text-xs text-content-muted">Plan less, taste more</span>
        </span>
      </Link>

      <nav aria-label="Main navigation" className="mt-8 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  );
}

export function MobileNavigation({
  adminLabel = "Admin Panel",
  showAdmin = false
}: Pick<AppNavigationProps, "adminLabel" | "showAdmin">) {
  const adminNavItem = { label: adminLabel, href: "/admin", icon: Shield } as const;
  const mobileNavItems = showAdmin
    ? [primaryNavItems[0], primaryNavItems[1], primaryNavItems[2], primaryNavItems[3], adminNavItem]
    : primaryNavItems.slice(0, 5);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-sticky grid grid-cols-5 rounded-app border border-white/65 bg-surface-elevated/[0.65] p-1 shadow-overlay backdrop-blur-xl lg:hidden"
    >
      {mobileNavItems.map((item) => (
        <MobileNavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}

function NavLink({
  href,
  icon: Icon,
  label
}: {
  href: string;
  icon: NavItem["icon"];
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-app px-3 text-sm font-semibold transition-colors duration-fast ease-app focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20",
        isActive
          ? "bg-brand-soft text-brand-strong shadow-sm"
          : "text-content-muted hover:bg-surface-muted hover:text-content"
      )}
      href={href}
    >
      <Icon aria-hidden="true" size={18} />
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  label
}: {
  href: string;
  icon: NavItem["icon"];
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "grid min-h-14 place-items-center rounded-app-sm px-1 text-[11px] font-semibold transition-colors duration-fast ease-app focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20",
        isActive ? "bg-brand-soft text-brand-strong" : "text-content-muted"
      )}
      href={href}
    >
      <Icon aria-hidden="true" size={19} />
      <span className="mt-0.5 max-w-full truncate">{label}</span>
    </Link>
  );
}
