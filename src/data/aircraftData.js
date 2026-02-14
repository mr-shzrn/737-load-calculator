// Boeing 737 Aircraft Variants for Malaysia Airlines
// All weights in kg

export const PASSENGER_WEIGHTS = {
  adult: 77,    // CAD 6805 Standard (effective April 25, 2022)
  child: 35,    // Ages 2-12
  infant: 0,    // Under 2 years, not occupying seat
  flightCrew: 85,
  cabinCrew: 75,
};

export const AIRCRAFT_VARIANTS = [
  {
    id: '738-MS-16BC',
    displayName: '737-800 MS-series (16BC/144EY)',
    type: '737-800',
    series: 'MS',
    registration: '9M-MS*',
    config: '16BC/144EY',
    powerplant: 'CFM 56-24K',
    availableThrust: ['24K', '22K'],
    weights: {
      mtow: 77000,
      mtxw: 77227,
      mlw: 65317,
      mzfw: 61688,
    },
    zones: {
      OA: { rows: '1-4', type: 'Business', maxPax: 16 },
      OB: { rows: '5-12', type: 'Economy', maxPax: 48 },
      OC: { rows: '14-21', type: 'Economy', maxPax: 48 },
      OD: { rows: '22-29', type: 'Economy', maxPax: 48 },
    },
    totalSeats: 160,
    indexTableSet: '738-16BC-144EY',
  },
  {
    id: '738-MS-12BC',
    displayName: '737-800 MS-series (12BC/162EY)',
    type: '737-800',
    series: 'MS',
    registration: '9M-MS*',
    config: '12BC/162EY',
    powerplant: 'CFM 56-24K',
    availableThrust: ['24K', '22K'],
    weights: {
      mtow: 77000,
      mtxw: 77227,
      mlw: 66360,
      mzfw: 62731,
    },
    zones: {
      OA: { rows: '1-3', type: 'Business', maxPax: 12 },
      OB: { rows: '4-12', type: 'Economy', maxPax: 54 },
      OC: { rows: '14-22', type: 'Economy', maxPax: 54 },
      OD: { rows: '23-31', type: 'Economy', maxPax: 54 },
    },
    totalSeats: 174,
    indexTableSet: '738-12BC-162EY',
  },
  {
    id: '738-MX-16BC',
    displayName: '737-800 MX-series (16BC/144EY)',
    type: '737-800',
    series: 'MX',
    registration: '9M-MX*, 9M-MLM*',
    config: '16BC/144EY',
    powerplant: 'CFM 56-26K',
    availableThrust: ['26K', '24K', '22K'],
    weights: {
      mtow: 79015,
      mtxw: 79242,
      mlw: 66360,
      mzfw: 62731,
    },
    zones: {
      OA: { rows: '1-4', type: 'Business', maxPax: 16 },
      OB: { rows: '5-12', type: 'Economy', maxPax: 48 },
      OC: { rows: '14-21', type: 'Economy', maxPax: 48 },
      OD: { rows: '22-29', type: 'Economy', maxPax: 48 },
    },
    totalSeats: 160,
    indexTableSet: '738-16BC-144EY',
  },
  {
    id: '738-MX-12BC',
    displayName: '737-800 MX-series (12BC/162EY)',
    type: '737-800',
    series: 'MX',
    registration: '9M-MX*, 9M-MLM*',
    config: '12BC/162EY',
    powerplant: 'CFM 56-26K',
    availableThrust: ['26K', '24K', '22K'],
    weights: {
      mtow: 79015,
      mtxw: 79242,
      mlw: 66360,
      mzfw: 62731,
    },
    zones: {
      OA: { rows: '1-3', type: 'Business', maxPax: 12 },
      OB: { rows: '4-12', type: 'Economy', maxPax: 54 },
      OC: { rows: '14-22', type: 'Economy', maxPax: 54 },
      OD: { rows: '23-31', type: 'Economy', maxPax: 54 },
    },
    totalSeats: 174,
    indexTableSet: '738-12BC-162EY',
  },
  {
    id: '738-ML-16BC',
    displayName: '737-800 ML-series SFP (16BC/144EY)',
    type: '737-800',
    series: 'ML',
    registration: '9M-ML*',
    config: '16BC/144EY',
    powerplant: 'CFM 56-26K',
    availableThrust: ['26K', '24K', '22K'],
    weights: {
      mtow: 79015,
      mtxw: 79242,
      mlw: 65317,
      mzfw: 61688,
    },
    zones: {
      OA: { rows: '1-4', type: 'Business', maxPax: 16 },
      OB: { rows: '5-12', type: 'Economy', maxPax: 48 },
      OC: { rows: '14-21', type: 'Economy', maxPax: 48 },
      OD: { rows: '22-29', type: 'Economy', maxPax: 48 },
    },
    totalSeats: 160,
    indexTableSet: '738-16BC-144EY',
    notes: 'Short Field Performance',
  },
  {
    id: '738-ML-12BC',
    displayName: '737-800 ML-series SFP (12BC/162EY)',
    type: '737-800',
    series: 'ML',
    registration: '9M-ML*',
    config: '12BC/162EY',
    powerplant: 'CFM 56-26K',
    availableThrust: ['26K', '24K', '22K'],
    weights: {
      mtow: 79015,
      mtxw: 79242,
      mlw: 65317,
      mzfw: 62731,
    },
    zones: {
      OA: { rows: '1-3', type: 'Business', maxPax: 12 },
      OB: { rows: '4-12', type: 'Economy', maxPax: 54 },
      OC: { rows: '14-22', type: 'Economy', maxPax: 54 },
      OD: { rows: '23-31', type: 'Economy', maxPax: 54 },
    },
    totalSeats: 174,
    indexTableSet: '738-12BC-162EY',
    notes: 'Short Field Performance',
  },
  {
    id: '738-FF',
    displayName: '737-800 FF-series SFP (16BC/150EY)',
    type: '737-800',
    series: 'FF',
    registration: '9M-FF*',
    config: '16BC/150EY',
    powerplant: 'CFM 56-26K',
    availableThrust: ['26K', '24K', '22K'],
    weights: {
      mtow: 79015,
      mtxw: 79242,
      mlw: 65317,
      mzfw: 61688,
    },
    zones: {
      OA: { rows: '1-4', type: 'Business', maxPax: 16 },
      OB: { rows: '5-12', type: 'Economy', maxPax: 48 },
      OC: { rows: '14-21', type: 'Economy', maxPax: 54 },
      OD: { rows: '22-29', type: 'Economy', maxPax: 48 },
    },
    totalSeats: 166,
    indexTableSet: '738-16BC-150EY',
    notes: 'Short Field Performance + Higher density economy',
  },
  {
    id: '73M8',
    displayName: '737 MAX 8 (12BC/162EY)',
    type: '737-MAX-8',
    series: 'MAX-8',
    config: '12BC/162EY',
    powerplant: 'LEAP-1B',
    availableThrust: ['N/A'],
    weights: {
      mtow: 82644,
      mtxw: 82871,
      mlw: 69308,
      mzfw: 65952,
    },
    zones: {
      OA: { rows: '1-3', type: 'Business', maxPax: 12 },
      OB: { rows: '4-12', type: 'Economy', maxPax: 54 },
      OC: { rows: '14-22', type: 'Economy', maxPax: 54 },
      OD: { rows: '23-31', type: 'Economy', maxPax: 54 },
    },
    totalSeats: 174,
    indexTableSet: '737-max-8',
    trimHandling: 'FMC',
    notes: 'Trim calculated by FMC, not manually',
  },
];

// Helper to find aircraft variant by ID
export function getAircraftById(id) {
  return AIRCRAFT_VARIANTS.find((a) => a.id === id);
}

// Get variants filtered by series
export function getVariantsBySeries(series) {
  return AIRCRAFT_VARIANTS.filter((a) => a.series === series);
}

// Get unique series list for selection
export const SERIES_OPTIONS = [
  { value: 'MS', label: '737-800 MS-series', engine: 'CFM56-24K' },
  { value: 'MX', label: '737-800 MX-series & MLM onward', engine: 'CFM56-26K' },
  { value: 'ML', label: '737-800 ML-series (SFP)', engine: 'CFM56-26K' },
  { value: 'FF', label: '737-800 FF-series (SFP)', engine: 'CFM56-26K' },
  { value: 'MAX-8', label: '737 MAX 8', engine: 'LEAP-1B' },
];
