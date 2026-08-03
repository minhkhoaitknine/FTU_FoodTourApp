# Phase 4 - App Layout

Phase 4 introduces a shared application shell for the main Tastetrail experience.
It does not change backend logic, API contracts or the database.

## Classification

Change level: medium, non-breaking.

Rationale:

- Adds reusable layout components.
- Replaces repeated page-level wrappers.
- Keeps page content and business behavior intact.
- Does not rename routes or remove functionality.

## Implemented Components

```text
src/components/layout/app-shell.tsx
src/components/layout/app-navigation.tsx
```

`AppShell` provides:

- Desktop sidebar.
- Sticky top bar.
- Mobile bottom navigation.
- Skip link for keyboard users.
- Shared page padding and mobile bottom spacing.
- Stable content area through `PageContainer`.

`AppNavigation` provides:

- Active route highlighting through `usePathname`.
- Desktop labels and icons.
- Compact mobile navigation for the primary routes.

## Integrated Pages

- `/`
- `/dashboard`
- `/restaurants`
- `/restaurants/[slug]`
- `/map`
- `/tour-generator`
- `/tours`
- `/tours/[id]`
- `/favorites`
- `/soundscape`

Auth pages are intentionally left outside the shell because login/register are
separate entry flows.

Admin is also left on its current internal layout in this phase because
`AdminDashboard` is a large client module with dense management UI. Refactoring
it should be handled as a focused admin cleanup rather than mixed into the app
shell phase.

## Backend/API/Database Impact

Backend impact: none.

API impact: none.

Database impact: none.

Migration required: no.

## Docker Verification

Docker Postgres can be used without editing `.env` by setting a temporary
environment variable for the command:

```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/foodtour?schema=public'
npm.cmd run preflight
```

This keeps the checked-in and local `.env` values unchanged.

For `next start` smoke tests, make sure the production build and start process
use the same local `DATABASE_URL`, or update local `.env` before building. A
build produced while `.env` points to Neon can still try to reach Neon during
runtime page checks.

## Remaining Work

- Phase 5 should connect `AppShell` with dynamic city backgrounds.
- Admin layout cleanup should be handled later after the main user flow is
  visually stable.
- Mobile visual QA should be repeated after Phase 5 because backgrounds will
  affect contrast and spacing.
