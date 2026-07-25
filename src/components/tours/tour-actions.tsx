"use client";

import { Copy, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TourActionsProps = {
  tourId: string;
};

export function TourActions({ tourId }: TourActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function cloneTour() {
    setIsSubmitting(true);
    const response = await fetch(`/api/food-tours/${tourId}/clone`, { method: "POST" });
    const body = (await response.json()) as { ok: boolean; tour?: { id: string } };
    setIsSubmitting(false);
    if (response.ok && body.ok && body.tour) {
      router.push(`/tours/${body.tour.id}`);
      router.refresh();
    }
  }

  async function deleteTour() {
    const confirmed = window.confirm("Delete this saved tour?");
    if (!confirmed) return;

    setIsSubmitting(true);
    const response = await fetch(`/api/food-tours/${tourId}`, { method: "DELETE" });
    setIsSubmitting(false);
    if (response.ok) {
      router.push("/tours");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-clay-700 shadow-sm disabled:opacity-70"
        disabled={isSubmitting}
        onClick={cloneTour}
        type="button"
      >
        <Copy size={16} />
        Clone
      </button>
      <button
        className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 shadow-sm disabled:opacity-70"
        disabled={isSubmitting}
        onClick={deleteTour}
        type="button"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  );
}

