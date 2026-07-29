"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { DEFAULT_FOOD_IMAGE_SRC } from "@/lib/assets/image-resolver";
import { cn } from "@/lib/utils";

type AppImageProps = Omit<ImageProps, "alt" | "src"> & {
  alt: string;
  src?: string | null;
  fallbackSrc?: string;
  wrapperClassName?: string;
  imageClassName?: string;
};

export function AppImage({
  alt,
  className,
  fallbackSrc = DEFAULT_FOOD_IMAGE_SRC,
  imageClassName,
  onError,
  sizes = "(max-width: 768px) 100vw, 33vw",
  src,
  wrapperClassName,
  ...props
}: AppImageProps) {
  const resolvedSrc = src || fallbackSrc;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const activeSrc = failedSrc === resolvedSrc ? fallbackSrc : resolvedSrc;
  const isInlineImage = activeSrc.startsWith("data:image/") || activeSrc.startsWith("blob:");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-app bg-surface-muted",
        wrapperClassName,
        className
      )}
    >
      {isInlineImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={alt}
          className={cn("absolute inset-0 h-full w-full object-cover", imageClassName)}
          loading={props.priority ? "eager" : "lazy"}
          onError={(event) => {
            if (activeSrc !== fallbackSrc) setFailedSrc(activeSrc);
            onError?.(event);
          }}
          src={activeSrc}
        />
      ) : (
        <Image
          alt={alt}
          className={cn("object-cover", imageClassName)}
          fill
          onError={(event) => {
            if (activeSrc !== fallbackSrc) setFailedSrc(activeSrc);
            onError?.(event);
          }}
          sizes={sizes}
          src={activeSrc}
          {...props}
        />
      )}
    </div>
  );
}
