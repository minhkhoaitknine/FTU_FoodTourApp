"use client";

import { Copy, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

type TourActionsProps = {
  tourId: string;
};

export function TourActions({ tourId }: TourActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function cloneTour() {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/food-tours/${tourId}/clone`, { method: "POST" });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        tour?: { id: string };
      } | null;
      if (response.ok && body?.ok && body.tour) {
        router.push(`/tours/${body.tour.id}`);
        router.refresh();
        return;
      }

      setError(body?.error ?? "Could not clone this tour.");
    } catch {
      setError("Network error while cloning this tour.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteTour() {
    const confirmed = window.confirm("Delete this saved tour?");
    if (!confirmed) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/food-tours/${tourId}`, { method: "DELETE" });
      if (response.ok) {
        router.push("/tours");
        router.refresh();
        return;
      }

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Could not delete this tour.");
    } catch {
      setError("Network error while deleting this tour.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingLabel="Working"
          onClick={cloneTour}
          type="button"
          variant="outline"
        >
          <Copy aria-hidden="true" size={16} />
          Clone
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={deleteTour}
          type="button"
          variant="danger"
        >
          <Trash2 aria-hidden="true" size={16} />
          Delete
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
