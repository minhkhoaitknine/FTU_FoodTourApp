import Image from "next/image";

import { cn } from "@/lib/utils";

export const FOODTOUR_LOGO_SRC = "/images/brand/foodtour-logo.png";

export function BrandLogo({
  className,
  priority = false
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-app bg-brand-soft shadow-sm",
        className
      )}
    >
      <Image
        alt=""
        className="object-cover"
        fill
        priority={priority}
        sizes="64px"
        src={FOODTOUR_LOGO_SRC}
      />
    </span>
  );
}
