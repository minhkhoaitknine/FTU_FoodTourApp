# Deployment Checklist

This project is prepared for a public demo deployment with Vercel plus a managed PostgreSQL database such as Neon or Supabase.

## Required Environment Variables

- `NEXT_PUBLIC_APP_URL`: public app URL after deployment.
- `DATABASE_URL`: managed PostgreSQL connection string.
- `AUTH_SECRET`: long random secret for JWT signing.
- `OPENROUTESERVICE_API_KEY`: optional; leave empty for MVP Haversine fallback.
- `ENABLE_EXTERNAL_ROUTING`: `false` for the current MVP.

Do not deploy with the development `AUTH_SECRET`.

## Database Steps

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` in the hosting provider.
3. Run migrations:

   ```powershell
   npm.cmd run db:deploy
   ```

4. Seed demo data when preparing a demo environment:

   ```powershell
   npm.cmd run db:seed
   ```

The seed data is fictitious and is intended for student/demo presentation only.

## Preflight

Run this before deploying or recording:

```powershell
npm.cmd run preflight
```

The preflight script checks:

- Required environment variables.
- Database connectivity.
- Minimum seeded demo data counts.
- Unsafe development auth secret warning.

## Vercel Build Settings

- Framework preset: Next.js.
- Install command: `npm install`.
- Build command: `npm run build`.
- Output directory: managed by Next.js.
- Node runtime: 22 or newer.

`postinstall` runs `prisma generate`, so Prisma Client is generated before the Vercel build.

This repository also includes `vercel.json` with the install and build commands.

## Post-Deploy Smoke Test

Open these URLs after deployment:

- `/api/health`: should return `ok: true` and `database: "reachable"`.
- `/login`: sign in with a seeded demo account.
- `/restaurants`: restaurant listing should show seeded data.
- `/map`: map should render OpenStreetMap tiles and markers.
- `/tour-generator`: signed-in user should generate and save a food tour.
- `/admin`: admin account should access dashboard, normal user should be rejected.

Demo accounts after seeding:

- `admin@foodtour.demo`
- `moderator@foodtour.demo`
- `user@foodtour.demo`

Password:

```text
FoodTour@123
```

## Known Production Notes

- Background music is loaded from real files in the project `music` folder.
- The MVP recommendation engine is rule-based, not an LLM.
- OpenStreetMap attribution must remain visible.
- Public seed data must remain clearly described as fictitious demo content.
