"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormMode = "login" | "register";

type AuthFormProps = {
  mode: AuthFormMode;
};

const demoAccounts = [
  { label: "Admin", email: "admin@foodtour.demo" },
  { label: "Moderator", email: "moderator@foodtour.demo" },
  { label: "User", email: "user@foodtour.demo" }
];

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload =
      mode === "register"
        ? {
            fullName: String(form.get("fullName") ?? ""),
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? "")
          }
        : {
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? "")
          };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { ok: boolean; error?: string };
    setIsSubmitting(false);

    if (!response.ok || !result.ok) {
      setError(result.error ?? "Authentication failed.");
      return;
    }

    const nextPath = searchParams.get("next");
    router.push(nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard");
    router.refresh();
  }

  function fillDemoAccount(email: string) {
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const passwordInput = document.querySelector<HTMLInputElement>('input[name="password"]');
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = "FoodTour@123";
  }

  return (
    <form className="space-y-4" onSubmit={submitForm}>
      {mode === "register" ? (
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Full name</span>
          <input
            className="mt-2 w-full rounded-2xl border border-clay-100 bg-white px-4 py-3 outline-none ring-clay-500 transition focus:ring-2"
            name="fullName"
            placeholder="Nguyen An"
            required
            type="text"
          />
        </label>
      ) : null}

      <label className="block">
        <span className="text-sm font-semibold text-stone-700">Email</span>
        <input
          className="mt-2 w-full rounded-2xl border border-clay-100 bg-white px-4 py-3 outline-none ring-clay-500 transition focus:ring-2"
          name="email"
          placeholder="user@foodtour.demo"
          required
          type="email"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-stone-700">Password</span>
        <input
          className="mt-2 w-full rounded-2xl border border-clay-100 bg-white px-4 py-3 outline-none ring-clay-500 transition focus:ring-2"
          minLength={mode === "register" ? 8 : 1}
          name="password"
          placeholder="FoodTour@123"
          required
          type="password"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 font-bold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
        {mode === "register" ? "Create account" : "Login"}
      </button>

      {mode === "login" ? (
        <div className="space-y-2 rounded-2xl bg-clay-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay-700">
            Demo accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((account) => (
              <button
                className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:text-clay-700"
                key={account.email}
                onClick={() => fillDemoAccount(account.email)}
                type="button"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}

