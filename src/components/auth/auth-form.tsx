"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Input } from "@/components/ui";

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

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !result?.ok) {
        setError(result?.error ?? "Authentication failed.");
        return;
      }

      const nextPath = searchParams.get("next");
      router.push(nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error while authenticating.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillDemoAccount(email: string) {
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const passwordInput = document.querySelector<HTMLInputElement>('input[name="password"]');
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = "FoodTour@123";
  }

  return (
    <form aria-describedby={error ? "auth-form-error" : undefined} className="space-y-4" onSubmit={submitForm}>
      {mode === "register" ? (
        <label className="block">
          <span className="text-sm font-semibold text-content">Full name</span>
          <Input
            autoComplete="name"
            className="mt-2"
            name="fullName"
            placeholder="Nguyen An"
            required
            type="text"
          />
        </label>
      ) : null}

      <label className="block">
        <span className="text-sm font-semibold text-content">Email</span>
        <Input
          autoComplete="email"
          className="mt-2"
          name="email"
          placeholder="user@foodtour.demo"
          required
          type="email"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-content">Password</span>
        <Input
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className="mt-2"
          minLength={mode === "register" ? 8 : 1}
          name="password"
          placeholder="FoodTour@123"
          required
          type="password"
        />
      </label>

      {error ? (
        <div
          className="rounded-app border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger"
          id="auth-form-error"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <Button
        fullWidth
        isLoading={isSubmitting}
        loadingLabel={mode === "register" ? "Creating account" : "Logging in"}
        type="submit"
      >
        {mode === "register" ? "Create account" : "Login"}
      </Button>

      {mode === "login" ? (
        <div className="space-y-2 rounded-app bg-brand-soft p-3">
          <p className="text-xs font-semibold uppercase text-brand-strong">
            Demo accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((account) => (
              <button
                className="min-h-11 rounded-app-sm bg-surface-elevated px-3 py-2 text-sm font-semibold text-content shadow-sm transition hover:text-brand-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20"
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
