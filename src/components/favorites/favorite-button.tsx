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

  async function toggleFavorite() {
    if (disabled) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch(isFavorite ? `/api/favorites/${restaurantId}` : "/api/favorites", {
      method: isFavorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: isFavorite ? undefined : JSON.stringify({ restaurantId })
    });
    setIsSubmitting(false);

    if (response.ok) {
      setIsFavorite((value) => !value);
      router.refresh();
    }
  }

  return (
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
  );
}

