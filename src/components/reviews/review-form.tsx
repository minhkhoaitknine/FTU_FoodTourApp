"use client";

import { Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Select, Textarea } from "@/components/ui";

type ReviewFormProps = {
  restaurantId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
  isAuthenticated: boolean;
};

export function ReviewForm({ restaurantId, existingReview, isAuthenticated }: ReviewFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const form = new FormData(event.currentTarget);
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        existingReview ? `/api/reviews/${existingReview.id}` : `/api/restaurants/${restaurantId}/reviews`,
        {
          method: existingReview ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: Number(form.get("rating") ?? 5),
            comment: String(form.get("comment") ?? "")
          })
        }
      );

      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !body?.ok) {
        setError(body?.error ?? "Could not save review.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error while saving review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteReview() {
    if (!existingReview) return;
    const confirmed = window.confirm("Delete your review?");
    if (!confirmed) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/reviews/${existingReview.id}`, { method: "DELETE" });
      if (response.ok) {
        router.refresh();
        return;
      }

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Could not delete review.");
    } catch {
      setError("Network error while deleting review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      aria-describedby={error ? "review-form-error" : undefined}
      className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel"
      onSubmit={submitReview}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-strong">Your review</p>
          <h2 className="mt-1 text-section-title text-content">{existingReview ? "Edit review" : "Write a review"}</h2>
        </div>
        <Star aria-hidden="true" className="text-brand" fill="currentColor" />
      </div>

      <div className="mt-4 grid gap-3">
        <label>
          <span className="text-sm font-bold text-content">Rating</span>
          <Select
            className="mt-2"
            defaultValue={existingReview?.rating ?? 5}
            name="rating"
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} stars
              </option>
            ))}
          </Select>
        </label>

        <label>
          <span className="text-sm font-bold text-content">Comment</span>
          <Textarea
            className="mt-2"
            defaultValue={existingReview?.comment ?? ""}
            maxLength={800}
            minLength={2}
            name="comment"
            placeholder="Share what stood out."
            required
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 rounded-app bg-danger-soft p-3 text-sm text-danger" id="review-form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          isLoading={isSubmitting}
          loadingLabel="Saving"
          type="submit"
        >
          {existingReview ? "Save changes" : "Post review"}
        </Button>
        {existingReview ? (
          <Button
            disabled={isSubmitting}
            onClick={deleteReview}
            type="button"
            variant="danger"
          >
            <Trash2 aria-hidden="true" size={16} />
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
