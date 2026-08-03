import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { BrandLogo } from "@/components/common/brand-logo";
import { AppBackground } from "@/components/layout/app-background";

export default function RegisterPage() {
  return (
    <main className="relative isolate grid min-h-screen place-items-center bg-canvas p-4 text-content">
      <AppBackground />
      <section className="relative z-10 w-full max-w-md rounded-[28px] bg-surface-elevated/[0.65] p-6 shadow-panel backdrop-blur">
        <div className="flex items-center gap-3">
          <BrandLogo className="size-12" priority />
          <p className="text-sm font-semibold uppercase text-brand-strong">Tastetrail</p>
        </div>
        <h1 className="mt-2 text-page-title">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-content-muted">
          New accounts are created with the User role. Admin and Moderator accounts come from the seed script.
        </p>

        <div className="mt-6">
          <Suspense fallback={<div className="rounded-app bg-brand-soft p-4 text-sm">Loading form...</div>}>
            <AuthForm mode="register" />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-sm text-content-muted">
          Already have an account?{" "}
          <Link className="font-bold text-brand-strong focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
