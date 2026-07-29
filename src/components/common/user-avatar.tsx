"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl"
} as const;

type UserAvatarProps = {
  className?: string;
  name: string;
  src?: string | null;
  size?: keyof typeof sizeClasses;
};

export function UserAvatar({ className, name, size = "md", src }: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getInitials(name);

  if (src && !imageFailed) {
    return (
      <span className={cn("relative block shrink-0 overflow-hidden rounded-full bg-brand-soft", sizeClasses[size], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${name} avatar`}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
          src={src}
        />
      </span>
    );
  }

  return (
    <span
      aria-label={`${name} default avatar`}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-brand text-center font-bold uppercase text-content-inverse shadow-sm",
        sizeClasses[size],
        className
      )}
      role="img"
    >
      {initials}
    </span>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return `${first}${last}`.toUpperCase();
}
