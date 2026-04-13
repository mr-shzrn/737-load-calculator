// ── Delivery Mode Utilities ──────────────────────────────────────────────────
// Shared between CalculationContext, Step2, Step6, and pdfExport.

export const DELIVERY_CREW_ARM = 44.0;   // cockpit arm (in) — from 1N715 manifest analysis
export const DELIVERY_PAX_ARM  = 550.0;  // mid-cabin arm (in) — from 1N715 manifest analysis
export const IU_REF_ARM = 658.3;
export const IU_SCALE   = 40000;
export const IU_OFFSET  = 45;

// ── DOI from manifest ZFW + ZFW Moment ──────────────────────────────────────
// Formula: IU = (moment − ZFW × IU_REF_ARM) / IU_SCALE + IU_OFFSET
// Verified: ZFW=45501, moment=29601222 → doi=36 ✓
export function doiFromMoment(zfw, moment) {
  return Math.round((moment - zfw * IU_REF_ARM) / IU_SCALE + IU_OFFSET);
}

// ── QR payload encode / decode ───────────────────────────────────────────────
export function encodeDelivery(data) {
  return JSON.stringify({ v: 1, ...data });
}

export function decodeDelivery(raw) {
  try {
    const data = JSON.parse(raw);
    if (
      data.v !== 1 ||
      typeof data.reg !== 'string' ||
      typeof data.manifest !== 'string' ||
      typeof data.dow !== 'number' ||
      typeof data.doi !== 'number' ||
      typeof data.crew !== 'number' ||
      typeof data.pax !== 'number'
    ) return null;
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

// ── Per-flight DOW/DOI with crew/pax delta ──────────────────────────────────
// deliveryData.dow = manifest ZFW (all cargo + baseline crew/pax already inside)
// Extra crew/pax are deltas from the manifest baseline.
export function computeFlightDowDoi(deliveryData, extraCrew, extraPax, bagKg) {
  const crewWt  = extraCrew * (85 + bagKg);
  const paxWt   = extraPax  * (77 + bagKg);
  const wtDelta = crewWt + paxWt;
  const iuDelta = crewWt * (DELIVERY_CREW_ARM - IU_REF_ARM) / IU_SCALE
                + paxWt  * (DELIVERY_PAX_ARM  - IU_REF_ARM) / IU_SCALE;
  return {
    dow: Math.round(deliveryData.dow + wtDelta),
    doi: Math.round(deliveryData.doi + iuDelta),
  };
}
