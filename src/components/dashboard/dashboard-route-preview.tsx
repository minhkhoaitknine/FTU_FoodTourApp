import Link from "next/link";

import { DashboardRouteMap } from "@/components/dashboard/dashboard-route-map";

export type DashboardRoutePoint = {
  id: string;
  label: string;
  href: string;
  latitude: number;
  longitude: number;
};

type DashboardRoutePreviewProps = {
  points: DashboardRoutePoint[];
};

export function DashboardRoutePreview({ points }: DashboardRoutePreviewProps) {
  return (
    <section className="rounded-[28px] bg-surface-elevated/90 p-5 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-content-muted">Map preview</p>
          <h2 className="text-section-title text-content">Food route</h2>
        </div>
        <Link className="text-sm font-bold text-brand-strong" href="/map">
          Full map
        </Link>
      </div>

      <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-app border border-line bg-[linear-gradient(135deg,#f7efe1,#e7f2ea)]">
        <DashboardRouteMap points={points} />
      </div>

      <div className="mt-4 space-y-2">
        {points.slice(0, 4).map((point, index) => (
          <Link
            className="flex items-center gap-3 rounded-app bg-surface-muted px-3 py-2 text-sm font-semibold text-content transition hover:text-brand-strong"
            href={point.href}
            key={point.id}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-xs text-brand-strong">
              {index + 1}
            </span>
            <span className="truncate">{point.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
