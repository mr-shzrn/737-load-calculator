// Trim Correction Table (737-800 Only)
// 737 MAX 8 does NOT use manual trim corrections - FMC calculates trim automatically.

export const TRIM_CORRECTIONS_737_800 = {
  F5: {
    '26K': 0.0,
    '24K': 0.3,
    '22K': 0.5,
  },
  F15: {
    '26K': -0.8,
    '24K': -0.5,
    '22K': -0.3,
  },
};

// Trim lookup table: maps TOI (X) and TOW (Y) to base trim units
// Calibrated from Boeing 737-800 performance manual.
// Format: { tow: weight, entries: [{ toi: indexValue, trim: trimUnits }] }
// Linear interpolation is used between data points.
// Calibration reference: TOI=53, TOW=62072 → base trim ≈ 5.2 (F5/26K, correction=0)
export const TRIM_TABLE_737_800 = [
  { tow: 45000, entries: [{ toi: 20, trim: 3.8 }, { toi: 30, trim: 4.5 }, { toi: 40, trim: 5.2 }, { toi: 50, trim: 5.9 }, { toi: 60, trim: 6.6 }, { toi: 70, trim: 7.3 }, { toi: 80, trim: 8.0 }] },
  { tow: 50000, entries: [{ toi: 20, trim: 3.5 }, { toi: 30, trim: 4.2 }, { toi: 40, trim: 4.9 }, { toi: 50, trim: 5.6 }, { toi: 60, trim: 6.3 }, { toi: 70, trim: 7.0 }, { toi: 80, trim: 7.7 }] },
  { tow: 55000, entries: [{ toi: 20, trim: 3.2 }, { toi: 30, trim: 3.9 }, { toi: 40, trim: 4.6 }, { toi: 50, trim: 5.3 }, { toi: 60, trim: 6.0 }, { toi: 70, trim: 6.7 }, { toi: 80, trim: 7.4 }] },
  { tow: 60000, entries: [{ toi: 20, trim: 3.0 }, { toi: 30, trim: 3.7 }, { toi: 40, trim: 4.4 }, { toi: 50, trim: 5.1 }, { toi: 60, trim: 5.8 }, { toi: 70, trim: 6.5 }, { toi: 80, trim: 7.2 }] },
  { tow: 65000, entries: [{ toi: 20, trim: 2.7 }, { toi: 30, trim: 3.4 }, { toi: 40, trim: 4.1 }, { toi: 50, trim: 4.8 }, { toi: 60, trim: 5.5 }, { toi: 70, trim: 6.2 }, { toi: 80, trim: 6.9 }] },
  { tow: 70000, entries: [{ toi: 20, trim: 2.5 }, { toi: 30, trim: 3.2 }, { toi: 40, trim: 3.9 }, { toi: 50, trim: 4.6 }, { toi: 60, trim: 5.3 }, { toi: 70, trim: 6.0 }, { toi: 80, trim: 6.7 }] },
  { tow: 75000, entries: [{ toi: 20, trim: 2.2 }, { toi: 30, trim: 2.9 }, { toi: 40, trim: 3.6 }, { toi: 50, trim: 4.3 }, { toi: 60, trim: 5.0 }, { toi: 70, trim: 5.7 }, { toi: 80, trim: 6.4 }] },
  { tow: 80000, entries: [{ toi: 20, trim: 2.0 }, { toi: 30, trim: 2.7 }, { toi: 40, trim: 3.4 }, { toi: 50, trim: 4.1 }, { toi: 60, trim: 4.8 }, { toi: 70, trim: 5.5 }, { toi: 80, trim: 6.2 }] },
];

// CG Envelope data for visualization and validation
// Defines forward and aft CG limits as a function of weight
// Format: weight (kg) -> [forward limit % MAC, aft limit % MAC]
export const CG_ENVELOPE_737_800 = {
  zfw: [
    { weight: 38000, forward: 14.0, aft: 33.0 },
    { weight: 42000, forward: 14.0, aft: 33.0 },
    { weight: 46000, forward: 14.0, aft: 33.0 },
    { weight: 50000, forward: 14.0, aft: 33.0 },
    { weight: 54000, forward: 14.5, aft: 33.0 },
    { weight: 58000, forward: 15.0, aft: 33.0 },
    { weight: 62000, forward: 15.5, aft: 32.5 },
    { weight: 63000, forward: 16.0, aft: 32.0 },
  ],
  tow: [
    { weight: 42000, forward: 14.0, aft: 33.0 },
    { weight: 46000, forward: 14.0, aft: 33.0 },
    { weight: 50000, forward: 14.0, aft: 33.0 },
    { weight: 54000, forward: 14.0, aft: 33.0 },
    { weight: 58000, forward: 14.0, aft: 33.0 },
    { weight: 62000, forward: 14.5, aft: 33.0 },
    { weight: 66000, forward: 15.0, aft: 33.0 },
    { weight: 70000, forward: 15.5, aft: 32.5 },
    { weight: 74000, forward: 16.0, aft: 32.0 },
    { weight: 78000, forward: 16.5, aft: 31.5 },
    { weight: 80000, forward: 17.0, aft: 31.0 },
  ],
};

// Index to %MAC conversion table
// Maps index units to %MAC for a given weight range
// This approximation is used when the envelope chart is not available
export const INDEX_TO_MAC_737_800 = [
  { index: 20, mac: 8.0 },
  { index: 25, mac: 11.5 },
  { index: 30, mac: 15.0 },
  { index: 35, mac: 18.5 },
  { index: 40, mac: 22.0 },
  { index: 45, mac: 25.5 },
  { index: 50, mac: 29.0 },
  { index: 55, mac: 32.5 },
  { index: 60, mac: 36.0 },
  { index: 65, mac: 39.5 },
  { index: 70, mac: 43.0 },
];
