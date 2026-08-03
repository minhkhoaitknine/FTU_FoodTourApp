import { ProfileForm } from "@/components/profile/profile-form";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/users";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <AppShell>
      <PageContainer size="6xl">
        <header className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel backdrop-blur">
          <p className="text-sm font-semibold uppercase text-brand-strong">Account profile</p>
          <h1 className="mt-2 text-page-title text-content">Manage your Tastetrail account</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-content-muted">
            Update your display name, email, avatar and password.
          </p>
        </header>

        <ProfileForm user={user} />
      </PageContainer>
    </AppShell>
  );
}
