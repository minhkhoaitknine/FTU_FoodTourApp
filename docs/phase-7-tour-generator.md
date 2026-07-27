# Phase 7 - Tour Generator

Phase 7 refactors the tour generator UI while keeping the existing backend
contract and saved-tour behavior.

## Classification

Change level: medium, non-breaking.

Rationale:

- Refactors one client component.
- Keeps `/api/food-tours` as the submit target.
- Keeps `createFoodTourSchema` payload shape.
- Does not change recommendation logic, authentication, database schema or API
  routes.

## Implemented

The generator form now has:

- Route basics group: title, city, start address, start time and transport.
- Budget/group group: budget and number of people.
- Taste group: preference chips, vegetarian toggle and allergies.
- Advanced settings in native `<details>`: stops, duration, max distance and
  meal periods.
- Clear loading state with generation steps.
- Inline error state.
- Result panel with saved tour CTA.
- Timeline-like generated stop list.
- Stable empty state before generation.

## Data Contract

The form still posts to:

```text
POST /api/food-tours
```

Payload still maps to:

```text
createFoodTourSchema
```

Fields preserved:

- `title`
- `cityId`
- `cityName`
- `startAddress`
- `startLatitude`
- `startLongitude`
- `startAt`
- `durationHours`
- `numberOfDays`
- `budget`
- `numberOfPeople`
- `transportMode`
- `preferences`
- `vegetarian`
- `allergies`
- `desiredStops`
- `maxDistanceKm`
- `mealTypes`

## Backend/API/Database Impact

Backend impact: none.

API impact: none.

Database impact: none.

Migration required: no.

## UX Improvements

Removed:

- Long single-column form with all controls at the same priority.
- Debug wording about trusted totals.
- Generic result placeholder.

Added:

- Grouped fields.
- Progressive disclosure for advanced settings.
- Preference chips.
- Result transition states: empty, loading, error and generated.
- Clear saved-tour link after generation.

## Remaining Work

- Phase 8 should align restaurant/map list cards with the newer visual system.
- A future non-breaking enhancement could add a preview-only endpoint flow, but
  this phase intentionally preserves current save-on-generate behavior.
