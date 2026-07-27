import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-4 text-content">
      <section className="w-full max-w-md rounded-[28px] bg-surface-elevated/92 p-6 shadow-panel backdrop-blur">
        <p className="text-sm font-semibold uppercase text-brand-strong">FoodTour</p>
        <h1 className="mt-2 text-page-title">Login</h1>
        <p className="mt-2 text-sm leading-6 text-content-muted">
          Use a demo account or your registered account to access the food tour dashboard.
        </p>

        <div className="mt-6">
          <Suspense fallback={<div className="rounded-app bg-brand-soft p-4 text-sm">Loading form...</div>}>
            <AuthForm mode="login" />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-sm text-content-muted">
          No account yet?{" "}
          <Link className="font-bold text-brand-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20" href="/register">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
