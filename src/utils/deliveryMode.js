// ── Delivery Mode Utilities ──────────────────────────────────────────────────
// Shared between CalculationContext, Step2, Step6, and pdfExport.

export const DELIVERY_CREW_ARM = 44.0;   // cockpit arm (in) — from 1N715 manifest analysis
export const DELIVERY_PAX_ARM  = 550.0;  // mid-cabin arm (in) — from 1N715 manifest analysis
export const IU_REF_ARM = 658.3;
export const IU_SCALE   = 40000;
export const IU_OFFSET  = 45;

// ── DOI from manifest MACZFW % ──────────────────────────────────────────────
// Formula: moment = ZFW × ((mac% / 100 × macLength) + lemac)
//          DOI = round((moment − ZFW × IU_REF_ARM) / IU_SCALE + IU_OFFSET)
// Simplified: DOI = round(ZFW × ((mac%/100 × macLength) + lemac − IU_REF_ARM) / IU_SCALE + IU_OFFSET)
// Verified: ZFW=45501, mac=14.97, lemac=628.0, macLength=149.5 → doi=36 ✓
export function doiFromMac(zfw, macPercent, lemac, macLength) {
  return Math.round(
    zfw * ((macPercent / 100 * macLength) + lemac - IU_REF_ARM) / IU_SCALE + IU_OFFSET
  );
}

// ── DOI from manifest ZFW moment (kept for backward compat) ─────────────────
export function doiFromMoment(zfw, moment) {
  return Math.round((moment - zfw * IU_REF_ARM) / IU_SCALE + IU_OFFSET);
}

// ── QR payload encode / decode ───────────────────────────────────────────────
// v:2 adds mac, cargo, cargoTableSet fields.
// encodeDelivery spreads data — if data.v = 2 it overrides the prefix.
export function encodeDelivery(data) {
  return JSON.stringify({ v: 2, ...data });
}

export function decodeDelivery(raw) {
  try {
    const data = JSON.parse(raw);
    // Accept v:1 (legacy) or v:2
    if (
      (data.v !== 1 && data.v !== 2) ||
      typeof data.reg !== 'string' ||
      typeof data.manifest !== 'string' ||
      typeof data.dow !== 'number' ||
      typeof data.doi !== 'number' ||
      typeof data.crew !== 'number' ||
      typeof data.pax !== 'number'
    ) return null;

    // Normalise: ensure cargo field exists (v:1 back-compat)
    if (!data.cargo) {
      data.cargo = { HOLD1: 0, HOLD2: 0, HOLD3: 0, HOLD4: 0 };
    }
    return data;
  } catch (_) {
    return null;
  }
}

// ── localStorage ─────────────────────────────────────────────────────────────
const storageKey = (reg) => `737calc_delivery_${reg}`;

export function saveDeliveryToStorage(data) {
  try { localStorage.setItem(storageKey(data.reg), JSON.stringify(data)); } catch (_) {}
}

export function loadDeliveryFromStorage(reg) {
  try {
    const raw = localStorage.getItem(storageKey(reg));
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

export function clearDeliveryFromStorage(reg) {
  try { localStorage.removeItem(storageKey(reg)); } catch (_) {}
}

// ── Per-flight DOW/DOI with crew/pax/cargo delta ─────────────────────────────
// deliveryData.dow = manifest ZFW (all cargo + baseline crew/pax already inside).
// Extra crew/pax are deltas from the manifest baseline.
// cargoWtDelta / cargoIuDelta are pre-computed by the caller (CalculationContext)
// using the aircraft's cargo index table so this function stays sync & pure.
export function computeFlightDowDoi(
  deliveryData,
  extraCrew,
  extraPax,
  bagKg,
  cargoWtDelta = 0,
  cargoIuDelta = 0,
) {
  const crewWt  = extraCrew * (85 + bagKg);
  const paxWt   = extraPax  * (77 + bagKg);
  const wtDelta = crewWt + paxWt + cargoWtDelta;
  const iuDelta = crewWt * (DELIVERY_CREW_ARM - IU_REF_ARM) / IU_SCALE
                + paxWt  * (DELIVERY_PAX_ARM  - IU_REF_ARM) / IU_SCALE
                + cargoIuDelta;
  return {
    dow: Math.round(deliveryData.dow + wtDelta),
    doi: Math.round(deliveryData.doi + iuDelta),
  };
}

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
