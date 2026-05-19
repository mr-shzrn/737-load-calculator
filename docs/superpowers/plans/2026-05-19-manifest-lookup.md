# Manifest Number Lookup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crew types a delivery manifest number (e.g. `1N716`) in Step 2; the app auto-identifies the registration and locks all delivery figures, leaving only fuel entry.

**Architecture:** Add a `buildManifestLookup(registrations)` utility that derives a manifest-number-keyed map from the registry's existing `deliveryPreset` entries. Wire this into `Max8DowDoi` with a manifest input at the top of the non-delivery path. Also fix the stale-localStorage bug where a registration with a `deliveryPreset` in the registry was showing old localStorage data.

**Tech Stack:** React 18, Vite, no test framework (manual browser verification only).

---

## File Map

| File | Change |
|---|---|
| `src/utils/deliveryMode.js` | Add `buildManifestLookup(registrations)` export |
| `src/components/steps/Step2DowDoi.jsx` | Add manifest input + match card + confirm handler + stale-localStorage fix to `Max8DowDoi` |

---

## Task 1: Add `buildManifestLookup` to `deliveryMode.js`

**Files:**
- Modify: `src/utils/deliveryMode.js`

- [ ] **Step 1: Open `src/utils/deliveryMode.js` and append the new export at the bottom of the file (after the `computeFlightDowDoi` function)**

```js
// ── Manifest number → delivery data lookup ────────────────────────────────────
// Derives a lookup map from the registry's deliveryPreset entries.
// Key = manifest number stripped of date suffix, e.g. "1N716 / 18-MAY-2026" → "1N716".
// Each new deliveryPreset added to the registry is automatically included.
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

- [ ] **Step 2: Run a build to confirm no syntax errors**

```bash
npm run build
```

Expected: build completes with no errors. Warnings about chunk size are fine.

- [ ] **Step 3: Commit**

```bash
git add src/utils/deliveryMode.js
git commit -m "feat: add buildManifestLookup utility to deliveryMode"
```

---

## Task 2: Wire manifest lookup into `Max8DowDoi`

**Files:**
- Modify: `src/components/steps/Step2DowDoi.jsx`

All changes are inside the `Max8DowDoi` function.

- [ ] **Step 1: Add `useMemo` to the React import at the top of the file**

Existing line 1:
```js
import React, { useState, useEffect } from 'react';
```

Replace with:
```js
import React, { useState, useEffect, useMemo } from 'react';
```

- [ ] **Step 2: Add `buildManifestLookup` to the deliveryMode import**

Existing line 5:
```js
import { loadDeliveryFromStorage } from '../../utils/deliveryMode.js';
```

Replace with:
```js
import { loadDeliveryFromStorage, buildManifestLookup } from '../../utils/deliveryMode.js';
```

- [ ] **Step 3: Add `manifestInput` state inside `Max8DowDoi`, after the existing `useState` declarations (after line `const [showScanner, setShowScanner] = useState(false);`)**

```js
const [manifestInput, setManifestInput] = useState('');
```

- [ ] **Step 4: Add the manifest lookup memo and match computation, after the `savedDelivery` line (line 92)**

```js
const manifestLookup = useMemo(() => buildManifestLookup(registrations), [registrations]);
const manifestMatch = manifestInput.length >= 4
  ? (manifestLookup[manifestInput.trim().toUpperCase()] ?? null)
  : null;
```

- [ ] **Step 5: Add the `handleManifestConfirm` function inside `Max8DowDoi`, after `handleSetupSave`**

```js
function handleManifestConfirm() {
  setRegistration(manifestMatch.reg);
  setDeliveryLoad(manifestMatch, 0, 0, 15);
}
```

- [ ] **Step 6: Add the manifest input field and match card to the JSX — insert it as the FIRST child inside the outer `<div className="space-y-5">` in the non-delivery return (around line 304, right before the `{/* Registration */}` block)**

```jsx
{/* ── Manifest lookup — primary delivery path ── */}
<div>
  <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
    Delivery Manifest Number
  </label>
  <input
    type="text"
    value={manifestInput}
    onChange={e => setManifestInput(e.target.value.toUpperCase())}
    className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch uppercase"
    placeholder="e.g. 1N716"
    maxLength={10}
  />
</div>

{manifestMatch && (
  <div className="rounded-xl px-5 py-4 space-y-3" style={{ background: 'rgba(5,150,105,0.07)', border: '1.5px solid rgba(5,150,105,0.35)' }}>
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(4,120,87,0.8)' }}>MANIFEST FOUND</div>
      <div className="text-2xl font-mono font-bold heading mt-1">{manifestMatch.reg}</div>
      <div className="text-[12px] muted mt-0.5">{manifestMatch.manifest}</div>
    </div>
    <div className="text-[12px] heading space-y-1">
      <div>
        ZFW <span className="font-mono font-bold">{manifestMatch.dow?.toLocaleString()} kg</span>
        {' · '}
        <span className="font-mono font-bold">{manifestMatch.mac}% MAC</span>
      </div>
      <div>
        <span className="font-mono font-bold">{manifestMatch.crew}</span> crew
        {' · '}
        <span className="font-mono font-bold">{manifestMatch.pax}</span> pax
        {' · '}
        cargo {Object.values(manifestMatch.cargo || {}).every(v => !v) ? 'nil' : 'per manifest'}
      </div>
    </div>
    <button
      type="button"
      onClick={handleManifestConfirm}
      className="w-full py-3 rounded-xl font-bold text-[14px] text-white"
      style={{ background: '#059669' }}
    >
      CONFIRM & LOCK LOAD
    </button>
  </div>
)}

{manifestInput.length >= 4 && !manifestMatch && (
  <p className="text-[12px] muted text-center">Manifest not found — enter manually below.</p>
)}
```

- [ ] **Step 7: Build and check for errors**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 8: Start dev server and manually verify the manifest lookup**

```bash
npm run dev
```

Checks:
1. Open Step 2. A "Delivery Manifest Number" input appears at the top.
2. Type `1N716` — a green card appears showing `9M-MVP`, ZFW 45,772 kg, 15.32% MAC, 3 crew, 5 pax, cargo nil.
3. Type `1N715` — a green card appears showing `9M-MVO`, ZFW 45,501 kg, 14.97% MAC, 3 crew, 4 pax.
4. Type `XXXX` — "Manifest not found" message appears.
5. Click "CONFIRM & LOCK LOAD" for 1N716 — delivery mode locks, locked panel shows 9M-MVP with manifest 1N716/18-MAY-2026.
6. Proceed to Step 5 (Fuel) — pax/cargo steps are locked as expected.

- [ ] **Step 9: Commit**

```bash
git add src/components/steps/Step2DowDoi.jsx
git commit -m "feat: manifest number lookup auto-fills delivery data in Step 2"
```

---

## Task 3: Fix stale localStorage bug

**Files:**
- Modify: `src/components/steps/Step2DowDoi.jsx`

The bug: if a previous session saved delivery data for a registration under a different manifest number than what the registry's `deliveryPreset` now shows, the stale data is shown in the "RESTORE" button.

Fix: only use `loadDeliveryFromStorage` data if its manifest matches the registry preset (or if no preset exists).

- [ ] **Step 1: Replace the `savedDelivery` declaration inside `Max8DowDoi` (currently line 92)**

Existing:
```js
const savedDelivery  = inputs.registration ? loadDeliveryFromStorage(inputs.registration) : null;
```

Replace with:
```js
const storedDelivery = inputs.registration ? loadDeliveryFromStorage(inputs.registration) : null;
const presetKey = selectedReg?.deliveryPreset?.manifest?.split('/')[0]?.trim()?.toUpperCase();
const storedKey = storedDelivery?.manifest?.split('/')[0]?.trim()?.toUpperCase();
const savedDelivery = (presetKey && storedKey && presetKey !== storedKey)
  ? null
  : storedDelivery;
```

- [ ] **Step 2: Build and check**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 3: Manually verify the bug is fixed**

In the dev server:
1. Open Step 2, select registration 9M-MVP.
2. The "RESTORE" button (if it appeared) should now show `1N716` not `1N715`.
3. If localStorage had `1N715` for MVP, the RESTORE button should be gone (stale data suppressed).

- [ ] **Step 4: Commit**

```bash
git add src/components/steps/Step2DowDoi.jsx
git commit -m "fix: ignore stale localStorage delivery data when registry preset has changed"
```

---

## Task 4: Push to remote

- [ ] **Step 1: Push all commits**

```bash
git push
```

Expected: `master -> master` pushed to origin.
