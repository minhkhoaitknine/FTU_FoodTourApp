"use client";

import { Loader2, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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

    const body = (await response.json()) as { ok: boolean; error?: string };
    setIsSubmitting(false);

    if (!response.ok || !body.ok) {
      setError(body.error ?? "Could not save review.");
      return;
    }

    router.refresh();
  }

  async function deleteReview() {
    if (!existingReview) return;
    const confirmed = window.confirm("Delete your review?");
    if (!confirmed) return;

    setIsSubmitting(true);
    const response = await fetch(`/api/reviews/${existingReview.id}`, { method: "DELETE" });
    setIsSubmitting(false);
    if (response.ok) router.refresh();
  }

  return (
    <form className="rounded-[28px] bg-white/90 p-5 shadow-panel" onSubmit={submitReview}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Your review</p>
          <h2 className="mt-1 text-2xl font-bold">{existingReview ? "Edit review" : "Write a review"}</h2>
        </div>
        <Star className="text-clay-700" fill="currentColor" />
      </div>

      <div className="mt-4 grid gap-3">
        <label>
          <span className="text-sm font-bold text-stone-700">Rating</span>
          <select
            className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
            defaultValue={existingReview?.rating ?? 5}
            name="rating"
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} stars
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-sm font-bold text-stone-700">Comment</span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
            defaultValue={existingReview?.comment ?? ""}
            maxLength={800}
            minLength={2}
            name="comment"
            placeholder="Share what stood out."
            required
          />
        </label>
      </div>

      {error ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
          {existingReview ? "Save changes" : "Post review"}
        </button>
        {existingReview ? (
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 disabled:opacity-70"
            disabled={isSubmitting}
            onClick={deleteReview}
            type="button"
          >
            <Trash2 size={16} />
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}

