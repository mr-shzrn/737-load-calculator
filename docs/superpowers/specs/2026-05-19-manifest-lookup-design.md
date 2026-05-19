# Manifest Number Lookup — Design Spec

**Date:** 2026-05-19  
**Status:** Approved

## Problem

1. Crew must manually type ZFW, MAC%, crew count, pax count, and cargo figures from the Boeing Flight Loading Manifest into the Delivery Load Setup modal — error-prone and slow.
2. 9M-MVP is showing stale 1N715 data because stale localStorage from a prior session overrides the correct 1N716 `deliveryPreset` baked into the registry.

## Goal

Crew types a manifest number (e.g. `1N716`). The app auto-identifies the registration and pre-fills all delivery figures. Only fuel entry remains.

---

## Architecture

### Data source

No new data file. The registry already stores `deliveryPreset` on each registration entry:

```json
{ "reg": "9M-MVP", "bew": 44160, "bew_iu": 38.95,
  "deliveryPreset": { "v": 2, "manifest": "1N716 / 18-MAY-2026",
    "dow": 45772, "doi": 37, "mac": 15.32, "crew": 3, "pax": 5,
    "cargo": { "HOLD1": 0, ... }, "cargoTableSet": "737-max-8" } }
```

At runtime, a manifest lookup map is derived from the `registrations` array:

```js
// key = manifest number stripped of date suffix
{
  '1N715': { reg: '9M-MVO', dow: 45501, doi: 36, mac: 14.97, crew: 3, pax: 4, ... },
  '1N716': { reg: '9M-MVP', dow: 45772, doi: 37, mac: 15.32, crew: 3, pax: 5, ... },
}
```

Every new `deliveryPreset` added to the registry is automatically included — no extra work.

### Lookup utility

A small pure function in `src/utils/deliveryMode.js`:

```js
export function buildManifestLookup(registrations) {
  const map = {};
  for (const r of registrations) {
    if (!r.deliveryPreset?.manifest) continue;
    const key = r.deliveryPreset.manifest.split('/')[0].trim().toUpperCase();
    map[key] = { ...r.deliveryPreset, reg: r.reg };
  }
  return map;
}
```

---

## UX Flow

### Step 1 (unchanged)
Crew selects MAX 8.

### Step 2 — new manifest-first layout

```
┌─────────────────────────────────────┐
│  Delivery Manifest Number           │
│  [ 1N716_________________________] │  ← auto-uppercase, live match
│                                     │
│  ┌─ match found ─────────────────┐  │
│  │ 9M-MVP                        │  │
│  │ 1N716 / 18-MAY-2026           │  │
│  │ ZFW 45,772 kg · 15.32% MAC    │  │
│  │ 3 crew · 5 pax · cargo nil    │  │
│  │                               │  │
│  │  [  CONFIRM & LOCK LOAD  ]    │  │
│  └───────────────────────────────┘  │
│                                     │
│  Enter manually instead ↗           │
└─────────────────────────────────────┘
```

- Input is auto-uppercase; matching is case-insensitive, ignores spaces/dashes
- Confirmation card appears as soon as there is an exact match — no submit button needed
- **Confirm & Lock Load**: calls `setRegistration(preset.reg)` then `setDeliveryLoad(preset)` — delivery mode locks, pax/cargo steps are locked, only fuel entry remains
- **Enter manually instead**: reveals the existing `DeliverySetupModal` (unchanged)
- Crew config / pantry dropdowns remain hidden in delivery mode (existing behaviour)

### Steps 3–6 (unchanged)
Delivery mode locking of pax/cargo steps already works correctly.

---

## Bug Fix: Stale localStorage

When the registry has a `deliveryPreset` for a registration and its manifest number **does not match** what is in localStorage, the localStorage entry is ignored. The registry `deliveryPreset` is authoritative.

Implementation: in `Max8DowDoi`, derive `savedDelivery` only if its manifest matches the selected registration's `deliveryPreset.manifest` (or if no `deliveryPreset` exists).

---

## Edge Cases

| Case | Behaviour |
|---|---|
| Partial number typed (`1N7`) | No card shown, no error |
| Unknown manifest | "Manifest not found" hint; "Enter manually instead" revealed |
| Stale localStorage manifest mismatch | localStorage silently ignored; registry preset is authoritative |
| Offline (no fetch) | Lookup built from seed `maxRegistrations.js` — works fully offline |
| Duplicate manifest number prefix | Exact-match only, no ambiguity |

---

## Files Changed

| File | Change |
|---|---|
| `src/utils/deliveryMode.js` | Add `buildManifestLookup(registrations)` |
| `src/components/steps/Step2DowDoi.jsx` | Rewrite `Max8DowDoi` top section: manifest input + confirmation card; fix stale localStorage bug |

No changes to: `DeliverySetupModal`, `CalculationContext`, `Step3`–`Step6`, `pdfExport`.
