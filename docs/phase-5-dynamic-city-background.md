# Phase 5 - Dynamic City Background

Phase 5 connects the app shell to city imagery from the asset resolver. It keeps
the current backend, API and database unchanged.

## Classification

Change level: medium, non-breaking.

Rationale:

- Adds a visual background component.
- Extends `AppShell` props without removing the existing `currentCityName` prop.
- Uses existing public image assets and resolver metadata.
- Does not change routes, Prisma schema, migrations or API contracts.

## Implemented Components

```text
src/components/layout/city-background.tsx
src/components/layout/app-shell.tsx
```

`CityBackground` provides:

- Full-screen city photo layer.
- Crossfade slideshow for multiple cities.
- Next-image preload before slide changes.
- Fallback through `resolveCityImage`.
- `prefers-reduced-motion` support by disabling the timer.
- Timer cleanup through the effect cleanup function.
- Decorative `aria-hidden` rendering so screen readers stay focused on content.

`AppShell` now accepts:

```ts
currentCityName?: string;
currentCityNames?: string[];
```

Use `currentCityName` for a single city page. Use `currentCityNames` when the
screen represents multiple cities, such as restaurant browsing, maps or saved
tours.

## Integrated Pages

Single-city background:

- `/restaurants/[slug]`
- `/tours/[id]`

Multi-city slideshow:

- `/`
- `/dashboard`
- `/restaurants`
- `/map`
- `/tour-generator`
- `/tours`
- `/favorites`
- `/soundscape`

If a list is empty, `AppShell` falls back to the default Vietnam/Hoi An image.

## Backend/API/Database Impact

Backend impact: none.

API impact: none.

Database impact: none.

Migration required: no.

## Performance Notes

- Images are not all preloaded at once.
- Only the next image is preloaded before a slide changes.
- The map/form state is not coupled to background state.
- The slideshow state lives in `CityBackground`, not in page components.
- The component uses CSS opacity transitions instead of JavaScript animation.

## Accessibility Notes

- Background is decorative and `aria-hidden`.
- Text remains on raised surfaces over overlays.
- Global `prefers-reduced-motion` CSS still removes transition duration.
- `CityBackground` also avoids starting the slideshow timer when reduced motion
  is enabled.

## Remaining Work

- Run visual QA on mobile/tablet after Phase 6 because dashboard composition
  will change significantly.
- Consider compressed WebP/AVIF variants for large city images before final
  deployment polish.
- Admin still uses its existing dense layout and does not consume the shell yet.
