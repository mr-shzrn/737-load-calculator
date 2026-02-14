# Boeing 737 Load & Trim Calculator - Project Brief

**Version:** 1.0  
**Date:** February 11, 2026  
**For:** Claude Code Implementation  
**Client:** Malaysia Airlines Flight Operations Training

---

## EXECUTIVE SUMMARY

A progressive web application (PWA) for calculating aircraft center of gravity (% MAC) and stabilizer trim for Boeing 737-800 and 737 MAX 8 aircraft. This tool serves as an operational backup when automatic load systems fail, enabling pilots to perform manual calculations quickly in pre-departure scenarios.

**Critical Requirements:**
- Calculate % MAC (center of gravity) position
- Calculate stabilizer trim units
- Validate all weight limits
- Work offline on iPad
- Complete calculation in < 2 minutes
- Support multiple aircraft variants and configurations

---

## PROJECT SCOPE

### INCLUDED
✅ Multi-step guided input wizard  
✅ Automatic index lookups from weight/balance tables  
✅ CG calculation with envelope validation  
✅ Trim calculation with thrust corrections (737-800 only)  
✅ Weight limit validations (MTOW, MZFW, MLW)  
✅ Last Minute Changes (LMC) support (±500 kg)  
✅ Offline-capable PWA for iPad  
✅ CG envelope visualization  
✅ PDF export of results  
✅ Manual form completion guide  
✅ OCR/image capture for loadsheet scanning  
✅ PDF parsing for automatic data extraction  
✅ LocalStorage persistence of last calculation  

### EXCLUDED
❌ Calculation history/logging  
❌ Pre-set templates  
❌ Comparison/what-if mode  
❌ Training scenarios with answers  
❌ Integration with airline systems  
❌ Real-time ACARS data  
❌ Certified/approved calculation tool (pilots still complete official paperwork)  

---

## AIRCRAFT VARIANTS & CONFIGURATIONS

### Supported Aircraft

Malaysia Airlines operates multiple 737 variants with different configurations. The app supports:

#### 1. Boeing 737-800 Series

**Three Main Series:**
- **MS-series:** CFM56-24K engines (lower thrust)
- **MX-series & MLM onward:** CFM56-26K engines (higher thrust)
- **ML-series:** CFM56-26K engines (Short Field Performance - SFP)
- **FF-series:** CFM56-26K engines (SFP, higher density economy)

**Two Cabin Configurations:**
- **16BC/144EY:** 16 Business + 144 Economy = 160 seats (older configuration)
- **12BC/162EY:** 12 Business + 162 Economy = 174 seats (newer configuration)

#### 2. Boeing 737 MAX 8

**Configuration:**
- **12BC/162EY:** 12 Business + 162 Economy = 174 seats
- **LEAP-1B engines**

### Complete Aircraft Data Structure

```json
{
  "aircraft": [
    {
      "id": "738-MS-16BC",
      "displayName": "737-800 MS-series (16BC/144EY)",
      "series": "MS",
      "registration": "9M-MS*",
      "config": "16BC/144EY",
      "powerplant": "CFM 56-24K",
      "availableThrust": ["24K", "22K"],
      "weights": {
        "mtow": 77000,
        "mtxw": 77227,
        "mlw": 65317,
        "mzfw": 61688
      },
      "zones": {
        "OA": { "rows": "1-4", "type": "Business", "maxPax": 16 },
        "OB": { "rows": "5-12", "type": "Economy", "maxPax": 48 },
        "OC": { "rows": "14-21", "type": "Economy", "maxPax": 48 },
        "OD": { "rows": "22-29", "type": "Economy", "maxPax": 48 }
      },
      "indexTableSet": "738-16BC-144EY"
    },
    {
      "id": "738-MS-12BC",
      "displayName": "737-800 MS-series (12BC/162EY)",
      "series": "MS",
      "registration": "9M-MS*",
      "config": "12BC/162EY",
      "powerplant": "CFM 56-24K",
      "availableThrust": ["24K", "22K"],
      "weights": {
        "mtow": 77000,
        "mtxw": 77227,
        "mlw": 66360,
        "mzfw": 62731
      },
      "zones": {
        "OA": { "rows": "1-3", "type": "Business", "maxPax": 12 },
        "OB": { "rows": "4-12", "type": "Economy", "maxPax": 54 },
        "OC": { "rows": "14-22", "type": "Economy", "maxPax": 54 },
        "OD": { "rows": "23-31", "type": "Economy", "maxPax": 54 }
      },
      "indexTableSet": "738-12BC-162EY"
    },
    {
      "id": "738-MX-16BC",
      "displayName": "737-800 MX-series (16BC/144EY)",
      "series": "MX",
      "registration": "9M-MX*, 9M-MLM*",
      "config": "16BC/144EY",
      "powerplant": "CFM 56-26K",
      "availableThrust": ["26K", "24K", "22K"],
      "weights": {
        "mtow": 79015,
        "mtxw": 79242,
        "mlw": 66360,
        "mzfw": 62731
      },
      "zones": {
        "OA": { "rows": "1-4", "type": "Business", "maxPax": 16 },
        "OB": { "rows": "5-12", "type": "Economy", "maxPax": 48 },
        "OC": { "rows": "14-21", "type": "Economy", "maxPax": 48 },
        "OD": { "rows": "22-29", "type": "Economy", "maxPax": 48 }
      },
      "indexTableSet": "738-16BC-144EY"
    },
    {
      "id": "738-MX-12BC",
      "displayName": "737-800 MX-series (12BC/162EY)",
      "series": "MX",
      "registration": "9M-MX*, 9M-MLM*",
      "config": "12BC/162EY",
      "powerplant": "CFM 56-26K",
      "availableThrust": ["26K", "24K", "22K"],
      "weights": {
        "mtow": 79015,
        "mtxw": 79242,
        "mlw": 66360,
        "mzfw": 62731
      },
      "zones": {
        "OA": { "rows": "1-3", "type": "Business", "maxPax": 12 },
        "OB": { "rows": "4-12", "type": "Economy", "maxPax": 54 },
        "OC": { "rows": "14-22", "type": "Economy", "maxPax": 54 },
        "OD": { "rows": "23-31", "type": "Economy", "maxPax": 54 }
      },
      "indexTableSet": "738-12BC-162EY"
    },
    {
      "id": "738-ML-16BC",
      "displayName": "737-800 ML-series SFP (16BC/144EY)",
      "series": "ML",
      "registration": "9M-ML*",
      "config": "16BC/144EY",
      "powerplant": "CFM 56-26K",
      "availableThrust": ["26K", "24K", "22K"],
      "weights": {
        "mtow": 79015,
        "mtxw": 79242,
        "mlw": 65317,
        "mzfw": 61688
      },
      "zones": {
        "OA": { "rows": "1-4", "type": "Business", "maxPax": 16 },
        "OB": { "rows": "5-12", "type": "Economy", "maxPax": 48 },
        "OC": { "rows": "14-21", "type": "Economy", "maxPax": 48 },
        "OD": { "rows": "22-29", "type": "Economy", "maxPax": 48 }
      },
      "indexTableSet": "738-16BC-144EY",
      "notes": "Short Field Performance"
    },
    {
      "id": "738-ML-12BC",
      "displayName": "737-800 ML-series SFP (12BC/162EY)",
      "series": "ML",
      "registration": "9M-ML*",
      "config": "12BC/162EY",
      "powerplant": "CFM 56-26K",
      "availableThrust": ["26K", "24K", "22K"],
      "weights": {
        "mtow": 79015,
        "mtxw": 79242,
        "mlw": 65317,
        "mzfw": 62731
      },
      "zones": {
        "OA": { "rows": "1-3", "type": "Business", "maxPax": 12 },
        "OB": { "rows": "4-12", "type": "Economy", "maxPax": 54 },
        "OC": { "rows": "14-22", "type": "Economy", "maxPax": 54 },
        "OD": { "rows": "23-31", "type": "Economy", "maxPax": 54 }
      },
      "indexTableSet": "738-12BC-162EY",
      "notes": "Short Field Performance"
    },
    {
      "id": "738-FF",
      "displayName": "737-800 FF-series SFP (16BC/150EY)",
      "series": "FF",
      "registration": "9M-FF*",
      "config": "16BC/150EY",
      "powerplant": "CFM 56-26K",
      "availableThrust": ["26K", "24K", "22K"],
      "weights": {
        "mtow": 79015,
        "mtxw": 79242,
        "mlw": 65317,
        "mzfw": 61688
      },
      "zones": {
        "OA": { "rows": "1-4", "type": "Business", "maxPax": 16 },
        "OB": { "rows": "5-12", "type": "Economy", "maxPax": 48 },
        "OC": { "rows": "14-21", "type": "Economy", "maxPax": 54 },
        "OD": { "rows": "22-29", "type": "Economy", "maxPax": 48 }
      },
      "indexTableSet": "738-16BC-150EY",
      "notes": "Short Field Performance + Higher density economy"
    },
    {
      "id": "73M8",
      "displayName": "737 MAX 8 (12BC/162EY)",
      "series": "MAX-8",
      "config": "12BC/162EY",
      "powerplant": "LEAP-1B",
      "availableThrust": ["N/A"],
      "weights": {
        "mtow": 82644,
        "mtw": 82871,
        "mlw": 69308,
        "mzfw": 65952
      },
      "zones": {
        "OA": { "rows": "1-3", "type": "Business", "maxPax": 12 },
        "OB": { "rows": "4-12", "type": "Economy", "maxPax": 54 },
        "OC": { "rows": "14-22", "type": "Economy", "maxPax": 54 },
        "OD": { "rows": "23-31", "type": "Economy", "maxPax": 54 }
      },
      "indexTableSet": "737-max-8",
      "trimHandling": "FMC",
      "notes": "Trim calculated by FMC, not manually"
    }
  ]
}
```

### Thrust Availability by Series

| Series | Engine | 26K | 24K | 22K |
|--------|--------|-----|-----|-----|
| MS | CFM56-24K | ❌ | ✅ | ✅ |
| MX/MLM | CFM56-26K | ✅ | ✅ | ✅ |
| ML (SFP) | CFM56-26K | ✅ | ✅ | ✅ |
| FF (SFP) | CFM56-26K | ✅ | ✅ | ✅ |
| MAX 8 | LEAP-1B | N/A (FMC calculates) |

---

## PASSENGER WEIGHTS (CAD 6805 Standard)

**Effective April 25, 2022:**

| Passenger Type | Weight | Notes |
|----------------|--------|-------|
| **Adult** | 77 kg | Standard passenger weight |
| **Child** | 35 kg | Ages 2-12 |
| **Infant** | NIL MASS | Under 2 years, not occupying seat |
| **Flight Crew** | 85 kg | Pilots |
| **Cabin Crew** | 75 kg | Flight attendants |

**CRITICAL:** All passenger calculations use 77 kg for adults.

---

## INDEX TABLES

### Passenger Index Table - 16BC/144EY Configuration

```javascript
const PASSENGER_INDEX_16BC_144EY = {
  "OA": [  // Zone OA (Rows 1-4, Business Class)
    { pax: [1, 2],   index: -1 },
    { pax: [3],      index: -2 },
    { pax: [4],      index: -3 },
    { pax: [5, 6],   index: -4 },
    { pax: [7],      index: -5 },
    { pax: [8],      index: -6 },
    { pax: [9, 10],  index: -7 },
    { pax: [11],     index: -8 },
    { pax: [12],     index: -9 },
    { pax: [13, 14], index: -10 },
    { pax: [15],     index: -11 },
    { pax: [16],     index: -12 }
  ],
  
  "OB": [  // Zone OB (Rows 5-12, Economy)
    { pax: [1],      index: 0 },
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
    { pax: [48],     index: -16 }
  ],
  
  "OC": [  // Zone OC (Rows 14-21, Economy)
    { pax: [1, 2],   index: 0 },
    { pax: [3, 8],   index: 1 },
    { pax: [9, 14],  index: 2 },
    { pax: [15, 20], index: 3 },
    { pax: [21, 26], index: 4 },
    { pax: [27, 32], index: 5 },
    { pax: [33, 38], index: 6 },
    { pax: [39, 44], index: 7 },
    { pax: [45, 48], index: 8 }
  ],
  
  "OD": [  // Zone OD (Rows 22-29, Economy)
    { pax: [1, 2],   index: 1 },
    { pax: [3, 4],   index: 2 },
    { pax: [5],      index: 3 },
    { pax: [6, 7],   index: 4 },
    { pax: [8],      index: 5 },
    { pax: [9, 10],  index: 6 },
    { pax: [11, 12], index: 7 },
    { pax: [13],     index: 8 },
    { pax: [14, 15], index: 9 },
    { pax: [16],     index: 10 },
    { pax: [17, 18], index: 11 },
    { pax: [19, 20], index: 12 },
    { pax: [21],     index: 13 },
    { pax: [22, 23], index: 14 },
    { pax: [24, 25], index: 15 },
    { pax: [26],     index: 16 },
    { pax: [27, 28], index: 17 },
    { pax: [29],     index: 18 },
    { pax: [30, 31], index: 19 },
    { pax: [32, 33], index: 20 },
    { pax: [34],     index: 21 },
    { pax: [35, 36], index: 22 },
    { pax: [37],     index: 23 },
    { pax: [38, 39], index: 24 },
    { pax: [40, 41], index: 25 },
    { pax: [42],     index: 26 },
    { pax: [43, 44], index: 27 },
    { pax: [45, 46], index: 28 },
    { pax: [47],     index: 29 },
    { pax: [48],     index: 30 }
  ]
};
```

### Passenger Index Table - 12BC/162EY Configuration

**NOTE:** Extract from earlier load sheets (not in performance manual). Zones:
- OA: Row 1-3 (Business)
- OB: Row 4-12
- OC: Row 14-22
- OD: Row 23-31

*(Full table to be extracted from provided load sheets)*

### Cargo Index Table (Same for all 737-800 configs)

```javascript
const CARGO_INDEX_737_800 = {
  "HOLD1": [
    { weight: [1, 47],     index: 0 },
    { weight: [48, 141],   index: -1 },
    { weight: [142, 236],  index: -2 },
    { weight: [237, 330],  index: -3 },
    { weight: [331, 425],  index: -4 },
    { weight: [426, 519],  index: -5 },
    { weight: [520, 613],  index: -6 },
    { weight: [614, 708],  index: -7 },
    { weight: [709, 802],  index: -8 },
    { weight: [803, 888],  index: -9 }
  ],
  
  "HOLD2": [
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
    { weight: [2540, 2670], index: -17 }
  ],
  
  "HOLD3": [
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
    { weight: [2968, 3157], index: 16 }
  ],
  
  "HOLD4": [
    { weight: [1, 47],     index: 1 },
    { weight: [48, 143],   index: 2 },
    { weight: [144, 238],  index: 3 },
    { weight: [239, 333],  index: 4 },
    { weight: [334, 429],  index: 5 },
    { weight: [430, 474],  index: 6 }
  ]
};
```

### Fuel Index Table (737-800)

```javascript
const FUEL_INDEX_737_800 = {
  "TOTAL_FUEL": [
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
    { weight: 13500,  index: 1 }
  ],
  
  "WING_TANKS_1_2": [
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
    { weight: 20819,  index: -9 }
  ],
  
  "CENTER_TANK": [
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
    { weight: 13019,  index: -17 }
  ]
};
```

### Trim Correction Table (737-800 Only)

```javascript
const TRIM_CORRECTIONS_737_800 = {
  "F5": {
    "26K": 0.0,
    "24K": 0.3,
    "22K": 0.5
  },
  "F15": {
    "26K": -0.8,
    "24K": -0.5,
    "22K": -0.3
  }
};
```

**Note:** 737 MAX 8 does NOT use manual trim corrections. FMC calculates trim automatically.

---

## CALCULATION ALGORITHMS

### Index Unit Formula

```
IU = (Weight(kg) × (Arm - 658.3)) / 40000 + 45
```

This is the fundamental formula, but we use pre-calculated index tables for speed and accuracy.

### Calculation Flow

```
1. INDEX SUMMATION
   ├─ Negative Indices:
   │  ├─ DOI (from input)
   │  ├─ Hold 1 index (table lookup)
   │  ├─ Hold 2 index (table lookup)
   │  ├─ Zone OA index (table lookup)
   │  ├─ Zone OB index (table lookup)
   │  ├─ Wing Tanks index (table lookup)
   │  └─ LMC negative indices
   │  └─ TOTAL NEGATIVE = sum all
   │
   └─ Positive Indices:
      ├─ Hold 3 index (table lookup)
      ├─ Hold 4 index (table lookup)
      ├─ Zone OC index (table lookup)
      ├─ Zone OD index (table lookup)
      ├─ Center Tank index (table lookup)
      └─ LMC positive indices
      └─ TOTAL POSITIVE = sum all

2. WEIGHT CALCULATIONS
   ├─ Sub-total Weight = DOW + Pax Weight + Cargo Weight
   ├─ ZFW = Sub-total Weight
   ├─ ZFI = TOTAL POSITIVE - TOTAL NEGATIVE
   ├─ Final ZFW = ZFW + LMC Weight
   ├─ Final ZFI = ZFI + LMC Index
   ├─ TOW = Final ZFW + Total Fuel
   └─ TOI = Final ZFI + Fuel Index

3. CG CALCULATION (% MAC)
   ├─ Plot TOW (Y-axis) vs TOI (X-axis) on envelope chart
   ├─ Read corresponding % MAC value
   ├─ Interpolate between grid lines if necessary
   ├─ ZFMAC = f(ZFW, ZFI)
   └─ TOMAC = f(TOW, TOI)

4. TRIM CALCULATION (737-800 only)
   ├─ Get base trim from TOI and TOW
   ├─ Apply flap/thrust correction:
   │  └─ Final Trim = Base Trim + TRIM_CORRECTIONS[flap][thrust]
   └─ Output: Stabilizer trim in units

5. VALIDATION
   ├─ TOW ≤ MTOW? ✓/✗
   ├─ TOW ≤ MTXW? ✓/✗
   ├─ ZFW ≤ MZFW? ✓/✗
   ├─ Landing Weight ≤ MLW? ✓/✗
   ├─ % MAC within envelope? ✓/✗
   └─ LMC within ±500 kg? ✓/✗
```

### Index Lookup Functions

```javascript
/**
 * Look up passenger index for a zone
 */
function getPassengerIndex(zone, paxCount, config) {
  const table = config === "16BC/144EY" 
    ? PASSENGER_INDEX_16BC_144EY 
    : PASSENGER_INDEX_12BC_162EY;
  
  const zoneTable = table[zone];
  
  for (const row of zoneTable) {
    if (Array.isArray(row.pax)) {
      // Range check
      if (paxCount >= row.pax[0] && paxCount <= row.pax[1]) {
        return row.index;
      }
    } else {
      // Exact match
      if (paxCount === row.pax) {
        return row.index;
      }
    }
  }
  
  throw new Error(`Passenger count ${paxCount} out of range for zone ${zone}`);
}

/**
 * Look up cargo index for a hold
 */
function getCargoIndex(hold, weight) {
  const holdTable = CARGO_INDEX_737_800[hold];
  
  for (const row of holdTable) {
    if (weight >= row.weight[0] && weight <= row.weight[1]) {
      return row.index;
    }
  }
  
  throw new Error(`Cargo weight ${weight} kg out of range for ${hold}`);
}

/**
 * Look up fuel index with interpolation
 */
function getFuelIndex(fuelType, weight) {
  const table = FUEL_INDEX_737_800[fuelType];
  
  // Find bracketing values
  for (let i = 0; i < table.length - 1; i++) {
    const lower = table[i];
    const upper = table[i + 1];
    
    if (weight >= lower.weight && weight <= upper.weight) {
      // Linear interpolation
      const weightRange = upper.weight - lower.weight;
      const indexRange = upper.index - lower.index;
      const ratio = (weight - lower.weight) / weightRange;
      
      return lower.index + (ratio * indexRange);
    }
  }
  
  // Exact match or out of range
  const exact = table.find(row => row.weight === weight);
  if (exact) return exact.index;
  
  throw new Error(`Fuel weight ${weight} kg out of range for ${fuelType}`);
}

/**
 * Calculate trim with thrust correction (737-800 only)
 */
function calculateTrim(aircraftType, baseTrim, flapSetting, thrustRating) {
  if (aircraftType === "737-MAX-8") {
    return {
      calculated: false,
      message: "Trim will be calculated by FMC",
      baseTrim: baseTrim
    };
  }
  
  const correction = TRIM_CORRECTIONS_737_800[flapSetting][thrustRating];
  return {
    calculated: true,
    value: baseTrim + correction,
    flaps: flapSetting,
    thrust: thrustRating
  };
}
```

---

## USER INTERFACE & WORKFLOW

### Input Method Selection

```
┌─────────────────────────────────────┐
│     HOW TO ENTER DATA?              │
├─────────────────────────────────────┤
│                                     │
│  📷  SCAN LOADSHEET                 │
│  📄  UPLOAD PDF                     │
│  ⌨️   MANUAL ENTRY                  │
│                                     │
└─────────────────────────────────────┘
```

### Manual Entry: 6-Step Wizard

#### Step 1: Aircraft Selection (Two-Step)

**Step 1a: Select Series**
```
○ 737-800 MS-series
○ 737-800 MX-series & MLM onward
○ 737-800 ML-series (SFP)
○ 737-800 FF-series (SFP)
○ 737 MAX 8
```

**Step 1b: Select Configuration** (for MS/MX/ML only)
```
○ 16BC/144EY (160 seats)
○ 12BC/162EY (174 seats)
```

FF-series: Only 16BC/150EY available  
MAX 8: Only 12BC/162EY available

#### Step 2: Basic Weights

```
Dry Operating Weight (DOW):  [_______] kg
Dry Operating Index (DOI):   [_______] units
```

#### Step 3: Load Distribution

```
PASSENGER ZONES
Zone OA (Row 1-3):    [__] pax  →  [____] kg (auto: × 77)
Zone OB (Row 4-12):   [__] pax  →  [____] kg (auto: × 77)
Zone OC (Row 14-22):  [__] pax  →  [____] kg (auto: × 77)
Zone OD (Row 23-31):  [__] pax  →  [____] kg (auto: × 77)

Total: [___] / 174 pax

CARGO HOLDS
Hold 1 (Fwd):         [________] kg
Hold 2 (Fwd Center):  [________] kg
Hold 3 (Aft Center):  [________] kg
Hold 4 (Aft):         [________] kg
```

**Automatic:**
- Passenger weight = pax × 77 kg
- Index lookup for each zone/hold
- Running validation

#### Step 4: Fuel & Takeoff Configuration

```
FUEL DISTRIBUTION
Wing Tanks 1 & 2:     [________] kg
Center Tank:          [________] kg
─────────────────────────────────────
Total Fuel:           [________] kg (auto)

TAKEOFF CONFIGURATION
Flap Setting:   ○ Flap 5    ○ Flap 15

Thrust Rating:  [Dynamic based on aircraft]
  MS-series:    ○ 24K    ○ 22K
  MX/ML/FF:     ○ 26K    ○ 24K    ○ 22K
  MAX 8:        N/A (FMC calculates)
```

#### Step 5: Last Minute Changes (Optional)

```
⚠️  LMC allowance: ±500 kg total

┌────────────────────────────────────────┐
│ Item         Location  Weight  Remove  │
├────────────────────────────────────────┤
│ 5 Passengers Zone OD   385 kg  [×]    │
│ Baggage      Hold 1    100 kg  [×]    │
└────────────────────────────────────────┘

LMC Total: +485 kg ✓ Within limit

[+ Add LMC Item]
```

#### Step 6: Results

```
┌─────────────────────────────────────┐
│     ✓ CALCULATION COMPLETE          │
├─────────────────────────────────────┤
│                                     │
│         % MAC: 23.5%                │
│     ████████████░░░░░░░░            │
│     ✓ WITHIN LIMITS                 │
│                                     │
│═════════════════════════════════════│
│                                     │
│      TRIM UNITS: 5.2                │
│      (Flaps 5, 24K thrust)          │
│                                     │
│─────────────────────────────────────│
│                                     │
│ WEIGHT VALIDATIONS                  │
│ TOW:  61,708 kg ✓ (Max: 79,015)    │
│ ZFW:  53,908 kg ✓ (Max: 62,731)    │
│ LW:   58,208 kg ✓ (Max: 66,360)    │
│                                     │
│─────────────────────────────────────│
│                                     │
│ [View Envelope] [Form Guide] [PDF]  │
│          [New Calculation]          │
│                                     │
└─────────────────────────────────────┘
```

**MAX 8 Results Display:**
```
STABILIZER TRIM
ℹ️  FMC will calculate final trim

Enter into FMC:
• ZFW: 53,908 kg
• ZFCG: 20.0% MAC
```

---

## OCR/PDF PARSING FEATURES

### Image Capture Flow

```
1. Camera/Upload
   ↓
2. OCR Processing (Tesseract.js)
   ↓
3. Pattern matching for MAS loadsheet format
   ↓
4. Extract:
   - Aircraft registration
   - DOW/DOI
   - Passenger distribution
   - Cargo weights
   - Fuel quantities
   ↓
5. Confidence scoring
   ↓
6. Review screen with highlighted low-confidence fields
   ↓
7. User corrections (if needed)
   ↓
8. Continue to calculation
```

### PDF Parsing Flow

```
1. Upload PDF
   ↓
2. Parse with PDF.js
   ↓
3. Extract text content
   ↓
4. Try to extract form fields (if fillable)
   ↓
5. Pattern matching (same as OCR)
   ↓
6. Review screen
   ↓
7. Continue to calculation
```

### Pattern Matching for MAS Loadsheets

```javascript
const LOADSHEET_PATTERNS = {
  aircraft: /9M-M[A-Z]{1,2}\s+\.\s+(\d+)\s*B\s*\/\s*(\d+)\s*Y/,
  dow: /(?:DOW|DRY OPERATING WEIGHT)[:\s]+(\d{5})/,
  doi: /(?:DOI|DRY OPERATING INDEX)[:\s]+(\d{1,3})/,
  passengers: {
    OA: /ZONE\s+OA[:\s]+(\d+)/,
    OB: /ZONE\s+OB[:\s]+(\d+)/,
    OC: /ZONE\s+OC[:\s]+(\d+)/,
    OD: /ZONE\s+OD[:\s]+(\d+)/
  },
  cargo: {
    hold1: /HOLD\s+1[:\s]+(\d+)/,
    hold2: /HOLD\s+2[:\s]+(\d+)/,
    hold3: /HOLD\s+3[:\s]+(\d+)/,
    hold4: /HOLD\s+4[:\s]+(\d+)/
  },
  fuel: /(?:FUEL|TAKE[- ]?OFF FUEL)[:\s]+(\d{4,5})/
};
```

### Confidence Assessment

```javascript
function assessConfidence(field, value) {
  const rules = {
    dow: {
      pattern: /^\d{5}$/,
      range: [40000, 50000]
    },
    doi: {
      pattern: /^\d{1,3}$/,
      range: [30, 60]
    },
    passengers: {
      pattern: /^\d{1,2}$/,
      range: [0, 54]
    },
    cargo: {
      pattern: /^\d{1,4}$/,
      range: [0, 5000]
    }
  };
  
  const rule = rules[field];
  if (!rule.pattern.test(String(value))) return 'low';
  
  const numValue = Number(value);
  if (numValue < rule.range[0] || numValue > rule.range[1]) return 'low';
  
  return 'high';
}
```

---

## TECHNICAL ARCHITECTURE

### Technology Stack

**Frontend:**
- React 18+ (component-based UI)
- Tailwind CSS (utility-first styling, touch-friendly)
- Vite (build tool, faster than CRA)

**PWA:**
- Service Worker (offline capability)
- Web App Manifest (installable)
- Cache API (asset caching)

**OCR/PDF:**
- Tesseract.js (client-side OCR)
- PDF.js (PDF parsing)

**Storage:**
- LocalStorage (last calculation persistence)

**Charts/Visualization:**
- Recharts or Chart.js (CG envelope)

**PDF Generation:**
- jsPDF (export results)

**Hosting:**
- GitHub Pages (free, HTTPS, auto-deploy)

### Project Structure

```
737-load-calculator/
├── public/
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
├── src/
│   ├── components/
│   │   ├── AircraftSelection.jsx
│   │   ├── BasicWeights.jsx
│   │   ├── LoadDistribution.jsx
│   │   ├── FuelInput.jsx
│   │   ├── LMCManager.jsx
│   │   ├── Results.jsx
│   │   ├── CGEnvelope.jsx
│   │   ├── OCRCapture.jsx
│   │   └── PDFUpload.jsx
│   ├── data/
│   │   ├── aircraftData.json
│   │   ├── indexTables.json
│   │   └── trimCorrections.json
│   ├── utils/
│   │   ├── indexLookup.js
│   │   ├── calculations.js
│   │   ├── validation.js
│   │   ├── ocr.js
│   │   └── pdfParser.js
│   ├── hooks/
│   │   ├── useCalculation.js
│   │   └── useOCR.js
│   ├── context/
│   │   └── CalculationContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### State Management

```javascript
const CalculationState = {
  // Step 1: Aircraft
  aircraft: {
    series: 'MX',
    config: '12BC/162EY',
    variant: { /* full variant object */ }
  },
  
  // Step 2: Basic Weights
  basicWeights: {
    dow: 44565,
    doi: 48
  },
  
  // Step 3: Load
  load: {
    passengers: {
      OA: { pax: 4, weight: 308, index: -3 },
      OB: { pax: 37, weight: 2849, index: -12 },
      OC: { pax: 30, weight: 2310, index: 5 },
      OD: { pax: 20, weight: 1540, index: 12 }
    },
    cargo: {
      hold1: { weight: 750, index: -8 },
      hold2: { weight: 900, index: -6 },
      hold3: { weight: 700, index: 4 },
      hold4: { weight: 350, index: 5 }
    }
  },
  
  // Step 4: Fuel
  fuel: {
    wingTanks: { weight: 7000, index: 5 },
    centerTank: { weight: 800, index: -10 },
    total: { weight: 7800, index: 8 }
  },
  
  // Step 4b: Takeoff Config
  takeoffConfig: {
    flaps: "F5",
    thrust: "24K"
  },
  
  // Step 5: LMC
  lmc: {
    items: [],
    totalWeight: 0,
    totalIndex: 0
  },
  
  // Results
  results: {
    weights: {
      zfw: 53908,
      tow: 61708,
      landingWeight: 58208
    },
    indices: {
      zfi: 45,
      toi: 53
    },
    cg: {
      zfmac: 20.0,
      tomac: 23.5
    },
    trim: {
      base: 4.9,
      final: 5.2,
      flaps: "F5",
      thrust: "24K"
    },
    validations: {
      towOk: true,
      zfwOk: true,
      mlwOk: true,
      cgOk: true,
      lmcOk: true
    }
  },
  
  // UI
  ui: {
    currentStep: 6,
    inputMethod: 'manual', // 'manual' | 'ocr' | 'pdf'
    showEnvelope: false,
    errors: []
  }
};
```

### Offline Strategy

```javascript
// service-worker.js
const CACHE_NAME = '737-calc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/main.js',
  '/assets/main.css',
  '/data/aircraftData.json',
  '/data/indexTables.json',
  '/data/trimCorrections.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## VALIDATION & TEST CASES

### Test Case 1: From Performance Manual

**Input:**
- Aircraft: 737-800 MX-series (16BC/144EY)
- DOW: 44,565 kg, DOI: 48
- Passengers: OA=4, OB=37, OC=30, OD=20 (91 total)
- Cargo: H1=750, H2=900, H3=700, H4=350
- Fuel: Wing=7000, Center=800
- Flaps: 5, Thrust: 26K (TO1)

**Expected Output:**
- ZFMAC: 20.0%
- TOMAC: 23.5%
- Trim F5: 5.2 units
- All validations pass

### Validation Rules

```javascript
const VALIDATIONS = {
  // Weight limits
  tow: (tow, mtow, mtxw) => {
    if (tow > mtow) return { pass: false, error: 'TOW exceeds MTOW' };
    if (tow > mtxw) return { pass: false, error: 'TOW exceeds MTXW' };
    return { pass: true };
  },
  
  zfw: (zfw, mzfw) => {
    if (zfw > mzfw) return { pass: false, error: 'ZFW exceeds MZFW' };
    return { pass: true };
  },
  
  landingWeight: (lw, mlw) => {
    if (lw > mlw) return { pass: false, error: 'Landing weight exceeds MLW' };
    return { pass: true };
  },
  
  // CG envelope
  cgEnvelope: (weight, indexUnits, envelope) => {
    // Check if point is within envelope boundaries
    const forwardLimit = getForwardLimit(weight, envelope);
    const aftLimit = getAftLimit(weight, envelope);
    
    if (indexUnits < forwardLimit) {
      return { pass: false, error: 'CG too far forward' };
    }
    if (indexUnits > aftLimit) {
      return { pass: false, error: 'CG too far aft' };
    }
    
    return { pass: true };
  },
  
  // LMC
  lmc: (totalLMC) => {
    if (Math.abs(totalLMC) > 500) {
      return { pass: false, error: 'LMC exceeds ±500 kg limit' };
    }
    return { pass: true };
  },
  
  // Passenger distribution
  passengerZone: (pax, maxPax) => {
    if (pax > maxPax) {
      return { pass: false, error: `Exceeds zone capacity (${maxPax})` };
    }
    return { pass: true };
  }
};
```

---

## IMPLEMENTATION PRIORITIES

### Phase 1: Core MVP (Week 1-2)

**Priority 1: Data & Calculation Engine**
1. Create data files (aircraftData.json, indexTables.json)
2. Implement index lookup functions
3. Implement calculation engine
4. Add validation logic
5. Test against manual example

**Priority 2: Basic UI**
6. Project setup (React + Vite)
7. Step 1-2: Aircraft selection + Basic weights
8. Step 3: Load distribution
9. Step 4: Fuel + Takeoff config
10. Step 6: Results display
11. State management (Context API)

**Priority 3: Thrust & Trim**
12. Thrust selection logic (series-specific)
13. Trim calculation (737-800)
14. MAX 8 special handling

### Phase 2: Enhanced Features (Week 3)

**Priority 4: LMC & Polish**
15. Step 5: LMC manager
16. LocalStorage persistence
17. Error handling & user feedback
18. Responsive design (iPad optimization)
19. Loading states & transitions

**Priority 5: Visualizations**
20. CG Envelope chart
21. Weight bars/indicators
22. Visual validations (colors, icons)

### Phase 3: Advanced Features (Week 4)

**Priority 6: Export & Documentation**
23. PDF export
24. Manual form guide
25. Help/instructions

**Priority 7: OCR/PDF**
26. Image capture interface
27. Tesseract.js integration
28. PDF.js integration
29. Review & correction UI
30. Confidence scoring

**Priority 8: PWA**
31. Service Worker
32. Offline capability
33. Install prompt
34. App manifest

### Phase 4: Deployment (Week 5)

35. GitHub Pages setup
36. CI/CD with GitHub Actions
37. Testing on actual iPads
38. User acceptance testing
39. Documentation
40. Training materials

---

## DEPLOYMENT

### GitHub Pages Setup

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### vite.config.js

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/737-load-calculator/', // GitHub repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

---

## KEY REMINDERS

### Critical Implementation Notes

1. **Passenger Weight:** Always use 77 kg for adults (CAD 6805 standard)

2. **Thrust Limitations:**
   - MS-series: 24K and 22K only (NO 26K)
   - MX/ML/FF: All thrust settings available
   - MAX 8: No manual trim calculation

3. **Index Tables:** 
   - Separate tables for 16BC/144EY and 12BC/162EY configs
   - Cargo tables are the same for all 737-800 variants
   - Use interpolation for fuel indices

4. **LMC Limit:** ±500 kg maximum

5. **Validation Priority:**
   - Block calculation if weight limits exceeded
   - Block calculation if CG out of envelope
   - Warn but allow if unusual distributions

6. **Offline First:**
   - All index tables cached
   - Calculation engine runs entirely client-side
   - No server dependencies for core functionality

7. **OCR/PDF:**
   - Client-side processing (Tesseract.js)
   - Always require user review
   - Highlight low-confidence fields
   - Privacy-friendly (no cloud uploads)

---

## SUCCESS CRITERIA

### For Pilots (Operational Use)
- ✅ Calculate % MAC and Trim in < 2 minutes
- ✅ Works offline in cockpit
- ✅ Clear pass/fail on weight limits
- ✅ Export results for documentation
- ✅ Scan loadsheet faster than manual entry

### For Training (Educational Use)
- ✅ Understand CG calculations
- ✅ See loading/trim relationship
- ✅ Manual form completion guidance
- ✅ Visual CG envelope

### For Maintenance (Operations Team)
- ✅ Update configs in < 5 minutes
- ✅ No code changes for weight updates
- ✅ Easy to add new variants
- ✅ Version controlled data

---

## CONTACT & SUPPORT

**Primary User:** Malaysia Airlines Flight Operations Training  
**Use Case:** Operational backup when automatic load systems fail  
**Target Device:** iPad (landscape 1024x768)  
**Regulatory:** This is NOT a certified tool - pilots must still complete official paperwork

---

## APPENDIX: GLOSSARY

**% MAC:** Percentage of Mean Aerodynamic Chord - CG position  
**CG:** Center of Gravity  
**DOI:** Dry Operating Index  
**DOW:** Dry Operating Weight  
**IU:** Index Units  
**LMC:** Last Minute Changes  
**MAC:** Mean Aerodynamic Chord  
**MLW:** Maximum Landing Weight  
**MTOW:** Maximum Takeoff Weight  
**MTXW:** Maximum Taxi Weight  
**MZFW:** Maximum Zero Fuel Weight  
**SFP:** Short Field Performance  
**TOI:** Takeoff Index  
**TOW:** Takeoff Weight  
**ZFI:** Zero Fuel Index  
**ZFW:** Zero Fuel Weight  

---

**END OF PROJECT BRIEF**

*This document contains all information needed to implement the 737 Load & Trim Calculator. For questions or clarifications, refer to the original planning conversation.*
