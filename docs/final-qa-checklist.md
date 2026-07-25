# Final QA Checklist

Run this checklist before recording the demo or deploying the app publicly.

## Automated Checks

```powershell
npm.cmd run preflight
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd audit --omit=dev
```

Expected result:

- Preflight passes required checks.
- ESLint passes.
- TypeScript passes.
- Vitest passes all recommendation/routing tests.
- Production build completes.
- Production dependency audit reports no vulnerabilities.

## Manual Smoke Test

1. Open `/api/health`; confirm `ok: true` and `database: "reachable"`.
2. Open `/restaurants`; search by `Hue`, `Da Nang` or `Ha Noi`.
3. Open one restaurant detail page; confirm menu, review list, favorite button and review form render.
4. Open `/map`; confirm markers and route preview render.
5. Sign in with `user@foodtour.demo` and generate a tour at `/tour-generator`.
6. Save the generated tour, then open `/tours` and its detail page.
7. Favorite a restaurant, then confirm it appears in `/favorites`.
8. Open `/soundscape`; confirm seeded soundscape metadata appears.
9. Sign in with `admin@foodtour.demo`; open `/admin`.
10. Hide/restore a restaurant, lock/unlock a non-admin user and moderate a review.
11. Sign in with `user@foodtour.demo`; confirm `/admin` redirects away in the browser and `/api/admin/dashboard` returns `403`.

## Demo Integrity

- Restaurant/demo data must be described as fictitious.
- Do not present soundscape placeholder URLs as licensed production audio.
- Do not claim the recommendation engine uses LLM/AI; it is rule-based.
- Keep OpenStreetMap attribution visible.
- Do not expose real secrets in screenshots or repository files.
