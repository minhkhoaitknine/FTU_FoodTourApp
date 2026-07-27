"use client";

import { useEffect, useMemo, useState } from "react";

import type { ResolvedImageAsset } from "@/lib/assets/image-resolver";
import { cn } from "@/lib/utils";

type CityBackgroundProps = {
  images: ResolvedImageAsset[];
  intervalMs?: number;
};

export function CityBackground({ images, intervalMs = 8000 }: CityBackgroundProps) {
  const uniqueImages = useMemo(() => dedupeImages(images), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = uniqueImages.length > 1;
  const normalizedActiveIndex = uniqueImages.length === 0 ? 0 : activeIndex % uniqueImages.length;

  useEffect(() => {
    if (!hasMultipleImages) return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return undefined;

    const preloadNext = (index: number) => {
      const nextImage = uniqueImages[(index + 1) % uniqueImages.length];
      if (!nextImage) return;

      const preload = new window.Image();
      preload.src = nextImage.src;
    };

    preloadNext(0);
    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % uniqueImages.length;
        preloadNext(next);
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [hasMultipleImages, intervalMs, uniqueImages]);

  if (uniqueImages.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-base overflow-hidden">
      {uniqueImages.map((image, index) => (
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-background ease-entrance",
            index === normalizedActiveIndex && "opacity-100"
          )}
          key={image.src}
          style={{ backgroundImage: `url("${image.src}")` }}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--color-canvas)/0.82),hsl(var(--color-canvas)/0.58)_42%,hsl(var(--color-canvas)/0.42))]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--color-canvas)/0.16),hsl(var(--color-canvas)/0.72))]" />
    </div>
  );
}

function dedupeImages(images: ResolvedImageAsset[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}
