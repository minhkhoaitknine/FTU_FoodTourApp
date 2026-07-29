import { CityBackground } from "@/components/layout/city-background";
import type { ResolvedImageAsset } from "@/lib/assets/image-resolver";

export const APP_BACKGROUND_SRC = "/images/brand/background-web.jpg";

const appBackgroundImage: ResolvedImageAsset = {
  src: APP_BACKGROUND_SRC,
  alt: "Vietnam travel and food illustration",
  kind: "city",
  source: "exact"
};

export function AppBackground() {
  return <CityBackground images={[appBackgroundImage]} />;
}
