"use client";

import dynamic from "next/dynamic";

import type { DashboardRoutePoint } from "@/components/dashboard/dashboard-route-preview";

type DashboardRouteMapProps = {
  points: DashboardRoutePoint[];
};

const DashboardRouteLeafletMap = dynamic(
  () =>
    import("@/components/dashboard/dashboard-route-leaflet-map").then(
      (module) => module.DashboardRouteLeafletMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full min-h-[320px] place-items-center rounded-app bg-surface-muted p-6 text-center">
        <p className="text-sm font-bold text-brand-strong">Loading map preview...</p>
      </div>
    )
  }
);

export function DashboardRouteMap({ points }: DashboardRouteMapProps) {
  return <DashboardRouteLeafletMap points={points} />;
}
