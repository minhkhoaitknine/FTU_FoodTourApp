"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setIsSubmitting(true);
    setError("");

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setError("Could not log out. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm transition hover:text-clay-700 disabled:opacity-70"
        disabled={isSubmitting}
        onClick={logout}
        type="button"
      >
        <LogOut size={16} />
        Logout
      </button>
      {error ? <span className="text-xs font-semibold text-danger">{error}</span> : null}
    </span>
  );
}
