import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="w-full max-w-md rounded-[28px] bg-white/90 p-6 shadow-panel backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">FoodTour</p>
        <h1 className="mt-2 text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          New accounts are created with the User role. Admin and Moderator accounts come from the seed script.
        </p>

        <div className="mt-6">
          <Suspense fallback={<div className="rounded-2xl bg-clay-50 p-4 text-sm">Loading form...</div>}>
            <AuthForm mode="register" />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link className="font-bold text-clay-700" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
