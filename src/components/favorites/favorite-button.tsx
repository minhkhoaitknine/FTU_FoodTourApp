"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FavoriteButtonProps = {
  restaurantId: string;
  initialIsFavorite: boolean;
  disabled?: boolean;
};

export function FavoriteButton({ restaurantId, initialIsFavorite, disabled = false }: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function toggleFavorite() {
    if (disabled) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(isFavorite ? `/api/favorites/${restaurantId}` : "/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: isFavorite ? undefined : JSON.stringify({ restaurantId })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Could not update favorite.");
        return;
      }

      setIsFavorite((value) => !value);
      router.refresh();
    } catch {
      setError("Network error while updating favorite.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <button
        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold shadow-sm transition disabled:opacity-70 ${
          isFavorite ? "bg-red-50 text-red-700" : "bg-white text-clay-700"
        }`}
        disabled={isSubmitting}
        onClick={toggleFavorite}
        type="button"
      >
        <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
        {isFavorite ? "Favorited" : "Favorite"}
      </button>
      {error ? <span className="text-xs font-semibold text-danger">{error}</span> : null}
    </span>
  );
}
