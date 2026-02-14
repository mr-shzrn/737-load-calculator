// Index lookup tables for Boeing 737 Load & Trim Calculator
// All index tables from the Performance Manual

// =============================================================================
// PASSENGER INDEX TABLES
// =============================================================================

// 16BC/144EY Configuration (MS/MX/ML 16BC variants)
export const PASSENGER_INDEX_16BC_144EY = {
  OA: [ // Zone OA (Rows 1-4, Business Class, max 16 pax)
    { pax: [1, 2],   index: -1 },
    { pax: [3, 3],   index: -2 },
    { pax: [4, 4],   index: -3 },
    { pax: [5, 6],   index: -4 },
    { pax: [7, 7],   index: -5 },
    { pax: [8, 8],   index: -6 },
    { pax: [9, 10],  index: -7 },
    { pax: [11, 11], index: -8 },
    { pax: [12, 12], index: -9 },
    { pax: [13, 14], index: -10 },
    { pax: [15, 15], index: -11 },
    { pax: [16, 16], index: -12 },
  ],

  OB: [ // Zone OB (Rows 5-12, Economy, max 48 pax)
    { pax: [1, 1],   index: 0 },
    { pax: [2, 4],   index: -1 },
    { pax: [5, 7],   index: -2 },
    { pax: [8, 10],  index: -3 },
    { pax: [11, 13], index: -4 },
    { pax: [14, 16], index: -5 },
    { pax: [17, 19], index: -6 },
    { pax: [20, 23], index: -7 },
    { pax: [24, 26], index: -8 },
    { pax: [27, 29], index: -9 },
    { pax: [30, 32], index: -10 },
    { pax: [33, 35], index: -11 },
    { pax: [36, 38], index: -12 },
    { pax: [39, 41], index: -13 },
    { pax: [42, 44], index: -14 },
    { pax: [45, 47], index: -15 },
    { pax: [48, 48], index: -16 },
  ],

  OC: [ // Zone OC (Rows 14-21, Economy, max 48 pax)
    { pax: [1, 2],   index: 0 },
    { pax: [3, 8],   index: 1 },
    { pax: [9, 14],  index: 2 },
    { pax: [15, 20], index: 3 },
    { pax: [21, 26], index: 4 },
    { pax: [27, 32], index: 5 },
    { pax: [33, 38], index: 6 },
    { pax: [39, 44], index: 7 },
    { pax: [45, 48], index: 8 },
  ],

  OD: [ // Zone OD (Rows 22-29, Economy, max 48 pax)
    { pax: [1, 2],   index: 1 },
    { pax: [3, 4],   index: 2 },
    { pax: [5, 5],   index: 3 },
    { pax: [6, 7],   index: 4 },
    { pax: [8, 8],   index: 5 },
    { pax: [9, 10],  index: 6 },
    { pax: [11, 12], index: 7 },
    { pax: [13, 13], index: 8 },
    { pax: [14, 15], index: 9 },
    { pax: [16, 16], index: 10 },
    { pax: [17, 18], index: 11 },
    { pax: [19, 20], index: 12 },
    { pax: [21, 21], index: 13 },
    { pax: [22, 23], index: 14 },
    { pax: [24, 25], index: 15 },
    { pax: [26, 26], index: 16 },
    { pax: [27, 28], index: 17 },
    { pax: [29, 29], index: 18 },
    { pax: [30, 31], index: 19 },
    { pax: [32, 33], index: 20 },
    { pax: [34, 34], index: 21 },
    { pax: [35, 36], index: 22 },
    { pax: [37, 37], index: 23 },
    { pax: [38, 39], index: 24 },
    { pax: [40, 41], index: 25 },
    { pax: [42, 42], index: 26 },
    { pax: [43, 44], index: 27 },
    { pax: [45, 46], index: 28 },
    { pax: [47, 47], index: 29 },
    { pax: [48, 48], index: 30 },
  ],
};

// 12BC/162EY Configuration (MS/MX/ML 12BC variants and MAX 8)
// NOTE: This table needs to be extracted from actual loadsheets.
// Using estimated values based on the 16BC table patterns scaled for the configuration.
export const PASSENGER_INDEX_12BC_162EY = {
  OA: [ // Zone OA (Rows 1-3, Business Class, max 12 pax)
    { pax: [1, 2],   index: -1 },
    { pax: [3, 3],   index: -2 },
    { pax: [4, 4],   index: -3 },
    { pax: [5, 6],   index: -4 },
    { pax: [7, 7],   index: -5 },
    { pax: [8, 8],   index: -6 },
    { pax: [9, 10],  index: -7 },
    { pax: [11, 11], index: -8 },
    { pax: [12, 12], index: -9 },
  ],

  OB: [ // Zone OB (Rows 4-12, Economy, max 54 pax)
    { pax: [1, 1],   index: 0 },
    { pax: [2, 4],   index: -1 },
    { pax: [5, 7],   index: -2 },
    { pax: [8, 10],  index: -3 },
    { pax: [11, 13], index: -4 },
    { pax: [14, 16], index: -5 },
    { pax: [17, 19], index: -6 },
    { pax: [20, 23], index: -7 },
    { pax: [24, 26], index: -8 },
    { pax: [27, 29], index: -9 },
    { pax: [30, 32], index: -10 },
    { pax: [33, 35], index: -11 },
    { pax: [36, 38], index: -12 },
    { pax: [39, 41], index: -13 },
    { pax: [42, 44], index: -14 },
    { pax: [45, 47], index: -15 },
    { pax: [48, 50], index: -16 },
    { pax: [51, 53], index: -17 },
    { pax: [54, 54], index: -18 },
  ],

  OC: [ // Zone OC (Rows 14-22, Economy, max 54 pax)
    { pax: [1, 2],   index: 0 },
    { pax: [3, 8],   index: 1 },
    { pax: [9, 14],  index: 2 },
    { pax: [15, 20], index: 3 },
    { pax: [21, 26], index: 4 },
    { pax: [27, 32], index: 5 },
    { pax: [33, 38], index: 6 },
    { pax: [39, 44], index: 7 },
    { pax: [45, 50], index: 8 },
    { pax: [51, 54], index: 9 },
  ],

  OD: [ // Zone OD (Rows 23-31, Economy, max 54 pax)
    { pax: [1, 2],   index: 1 },
    { pax: [3, 4],   index: 2 },
    { pax: [5, 5],   index: 3 },
    { pax: [6, 7],   index: 4 },
    { pax: [8, 8],   index: 5 },
    { pax: [9, 10],  index: 6 },
    { pax: [11, 12], index: 7 },
    { pax: [13, 13], index: 8 },
    { pax: [14, 15], index: 9 },
    { pax: [16, 16], index: 10 },
    { pax: [17, 18], index: 11 },
    { pax: [19, 20], index: 12 },
    { pax: [21, 21], index: 13 },
    { pax: [22, 23], index: 14 },
    { pax: [24, 25], index: 15 },
    { pax: [26, 26], index: 16 },
    { pax: [27, 28], index: 17 },
    { pax: [29, 29], index: 18 },
    { pax: [30, 31], index: 19 },
    { pax: [32, 33], index: 20 },
    { pax: [34, 34], index: 21 },
    { pax: [35, 36], index: 22 },
    { pax: [37, 37], index: 23 },
    { pax: [38, 39], index: 24 },
    { pax: [40, 41], index: 25 },
    { pax: [42, 42], index: 26 },
    { pax: [43, 44], index: 27 },
    { pax: [45, 46], index: 28 },
    { pax: [47, 47], index: 29 },
    { pax: [48, 48], index: 30 },
    { pax: [49, 50], index: 31 },
    { pax: [51, 52], index: 32 },
    { pax: [53, 53], index: 33 },
    { pax: [54, 54], index: 34 },
  ],
};

// FF-series uses same as 16BC/144EY but OC has 54 max pax
// We use the same table but extend OC range
export const PASSENGER_INDEX_16BC_150EY = {
  ...PASSENGER_INDEX_16BC_144EY,
  OC: [
    ...PASSENGER_INDEX_16BC_144EY.OC,
    { pax: [49, 54], index: 9 },
  ],
};

// =============================================================================
// CARGO INDEX TABLE (Same for all 737-800 configs)
// =============================================================================

export const CARGO_INDEX_737_800 = {
  HOLD1: [
    { weight: [1, 47],     index: 0 },
    { weight: [48, 141],   index: -1 },
    { weight: [142, 236],  index: -2 },
    { weight: [237, 330],  index: -3 },
    { weight: [331, 425],  index: -4 },
    { weight: [426, 519],  index: -5 },
    { weight: [520, 613],  index: -6 },
    { weight: [614, 708],  index: -7 },
    { weight: [709, 802],  index: -8 },
    { weight: [803, 888],  index: -9 },
  ],

  HOLD2: [
    { weight: [1, 76],      index: 0 },
    { weight: [77, 230],    index: -1 },
    { weight: [231, 384],   index: -2 },
    { weight: [385, 538],   index: -3 },
    { weight: [539, 692],   index: -4 },
    { weight: [693, 846],   index: -5 },
    { weight: [847, 1000],  index: -6 },
    { weight: [1001, 1154], index: -7 },
    { weight: [1155, 1308], index: -8 },
    { weight: [1309, 1462], index: -9 },
    { weight: [1463, 1616], index: -10 },
    { weight: [1617, 1769], index: -11 },
    { weight: [1770, 1923], index: -12 },
    { weight: [1924, 2077], index: -13 },
    { weight: [2078, 2231], index: -14 },
    { weight: [2232, 2385], index: -15 },
    { weight: [2386, 2539], index: -16 },
    { weight: [2540, 2670], index: -17 },
  ],

  HOLD3: [
    { weight: [1, 95],      index: 0 },
    { weight: [96, 287],    index: 1 },
    { weight: [288, 478],   index: 2 },
    { weight: [479, 670],   index: 3 },
    { weight: [671, 861],   index: 4 },
    { weight: [862, 1053],  index: 5 },
    { weight: [1054, 1244], index: 6 },
    { weight: [1245, 1436], index: 7 },
    { weight: [1437, 1627], index: 8 },
    { weight: [1628, 1819], index: 9 },
    { weight: [1820, 2010], index: 10 },
    { weight: [2011, 2202], index: 11 },
    { weight: [2203, 2393], index: 12 },
    { weight: [2394, 2584], index: 13 },
    { weight: [2585, 2776], index: 14 },
    { weight: [2777, 2967], index: 15 },
    { weight: [2968, 3157], index: 16 },
  ],

  HOLD4: [
    { weight: [1, 47],     index: 1 },
    { weight: [48, 143],   index: 2 },
    { weight: [144, 238],  index: 3 },
    { weight: [239, 333],  index: 4 },
    { weight: [334, 429],  index: 5 },
    { weight: [430, 474],  index: 6 },
  ],
};

// =============================================================================
// FUEL INDEX TABLE (737-800)
// =============================================================================

export const FUEL_INDEX_737_800 = {
  TOTAL_FUEL: [
    { weight: 500,    index: 0 },
    { weight: 1000,   index: 0 },
    { weight: 1500,   index: 0 },
    { weight: 2000,   index: 0 },
    { weight: 2500,   index: 0 },
    { weight: 3000,   index: 0 },
    { weight: 3500,   index: 0 },
    { weight: 4000,   index: 1 },
    { weight: 4500,   index: 1 },
    { weight: 5000,   index: 2 },
    { weight: 5500,   index: 3 },
    { weight: 6000,   index: 3 },
    { weight: 6500,   index: 4 },
    { weight: 7000,   index: 5 },
    { weight: 7500,   index: 7 },
    { weight: 8000,   index: 8 },
    { weight: 8500,   index: 7 },
    { weight: 9000,   index: 7 },
    { weight: 9500,   index: 6 },
    { weight: 10000,  index: 6 },
    { weight: 10500,  index: 5 },
    { weight: 11000,  index: 5 },
    { weight: 11500,  index: 4 },
    { weight: 12000,  index: 3 },
    { weight: 12500,  index: 2 },
    { weight: 13000,  index: 2 },
    { weight: 13500,  index: 1 },
  ],

  WING_TANKS_1_2: [
    { weight: 14000,  index: 0 },
    { weight: 14500,  index: 0 },
    { weight: 15000,  index: -1 },
    { weight: 15500,  index: -2 },
    { weight: 16000,  index: -2 },
    { weight: 16500,  index: -3 },
    { weight: 17000,  index: -3 },
    { weight: 17500,  index: -4 },
    { weight: 18000,  index: -4 },
    { weight: 18500,  index: -5 },
    { weight: 19000,  index: -6 },
    { weight: 19500,  index: -6 },
    { weight: 20000,  index: -7 },
    { weight: 20500,  index: -8 },
    { weight: 20819,  index: -9 },
  ],

  CENTER_TANK: [
    { weight: 500,    index: 0 },
    { weight: 1000,   index: -1 },
    { weight: 1500,   index: -2 },
    { weight: 2000,   index: -3 },
    { weight: 2500,   index: -3 },
    { weight: 3000,   index: -4 },
    { weight: 3500,   index: -4 },
    { weight: 4000,   index: -5 },
    { weight: 4500,   index: -6 },
    { weight: 5000,   index: -6 },
    { weight: 5500,   index: -7 },
    { weight: 6000,   index: -8 },
    { weight: 6500,   index: -8 },
    { weight: 7000,   index: -9 },
    { weight: 7500,   index: -10 },
    { weight: 7801,   index: 8 },
    { weight: 8000,   index: -10 },
    { weight: 8500,   index: -11 },
    { weight: 9000,   index: -12 },
    { weight: 9500,   index: -12 },
    { weight: 10000,  index: -13 },
    { weight: 10500,  index: -13 },
    { weight: 11000,  index: -14 },
    { weight: 11500,  index: -14 },
    { weight: 12000,  index: -15 },
    { weight: 12500,  index: -16 },
    { weight: 13000,  index: -17 },
    { weight: 13019,  index: -17 },
  ],
};

// =============================================================================
// TABLE SET MAPPING
// =============================================================================

// Maps indexTableSet identifiers to their actual passenger index tables
export const PASSENGER_TABLE_MAP = {
  '738-16BC-144EY': PASSENGER_INDEX_16BC_144EY,
  '738-12BC-162EY': PASSENGER_INDEX_12BC_162EY,
  '738-16BC-150EY': PASSENGER_INDEX_16BC_150EY,
  '737-max-8': PASSENGER_INDEX_12BC_162EY, // MAX 8 uses same as 12BC/162EY
};
