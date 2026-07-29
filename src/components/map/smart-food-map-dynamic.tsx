"use client";

import dynamic from "next/dynamic";
import type { RestaurantCard } from "@/services/restaurants/restaurant-service";

type SmartFoodMapDynamicProps = {
  restaurants: RestaurantCard[];
  cities: Array<{
    id: string;
    name: string;
    region: string;
  }>;
};

const SmartFoodMap = dynamic(
  () => import("@/components/map/smart-food-map").then((module) => module.SmartFoodMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid min-h-[520px] place-items-center rounded-[28px] bg-surface-elevated/[0.65] p-6 shadow-panel md:min-h-[680px]">
        <p className="font-bold text-brand-strong">Loading map...</p>
      </div>
    )
  }
);

export function SmartFoodMapDynamic(props: SmartFoodMapDynamicProps) {
  return <SmartFoodMap {...props} />;
}
