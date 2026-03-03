// Core calculation engine for 737 Load & Trim Calculator
import { PASSENGER_WEIGHTS } from '../data/aircraftData.js';
import { TRIM_CORRECTIONS_737_800, TRIM_TABLE_737_800, CG_ENVELOPE_737_800 } from '../data/trimCorrections.js';
import {
  getAllPassengerIndices,
  getAllCargoIndices,
  calculateFuelIndex,
} from './indexLookup.js';

/**
 * Perform the complete load and trim calculation.
 * @param {Object} input - All input data
 * @param {Object} input.aircraft - Selected aircraft variant
 * @param {Object} input.basicWeights - { dow, doi }
 * @param {Object} input.passengers - { OA, OB, OC, OD } pax counts
 * @param {Object} input.cargo - { HOLD1, HOLD2, HOLD3, HOLD4 } weights in kg
 * @param {Object} input.fuel - { wingTanks, centerTank } weights in kg
 * @param {Object} input.takeoffConfig - { flaps: 'F5'|'F15', thrust: '26K'|'24K'|'22K' }
 * @param {Array} input.lmcItems - [{ type, location, weight, index }]
 * @returns {Object} Complete calculation results
 */
export function performCalculation(input) {
  const { aircraft, basicWeights, passengers, cargo, fuel, takeoffConfig, lmcItems = [] } = input;

  // 1. Calculate all indices
  const passengerIndices = getAllPassengerIndices(passengers, aircraft.indexTableSet);
  const cargoIndices = getAllCargoIndices(cargo, aircraft.cargoTableSet || '738');
  const totalFuel = (fuel.wingTanks || 0) + (fuel.centerTank || 0);
  const fuelIndexResult = calculateFuelIndex(totalFuel, fuel.wingTanks, fuel.centerTank, aircraft.fuelTableSet || '738');

  // 2. Calculate passenger totals
  const totalPax = Object.values(passengers).reduce((sum, p) => sum + (p || 0), 0);
  const totalPaxWeight = totalPax * PASSENGER_WEIGHTS.adult;

  // 3. Calculate cargo totals
  const totalCargoWeight = Object.values(cargo).reduce((sum, w) => sum + (w || 0), 0);

  // 4. Separate indices into negative and positive
  const negativeIndices = {
    doi: basicWeights.doi,
    hold1: cargoIndices.HOLD1.index,
    hold2: cargoIndices.HOLD2.index,
    zoneOA: passengerIndices.OA.index,
    zoneOB: passengerIndices.OB.index,
  };

  const positiveIndices = {
    hold3: cargoIndices.HOLD3.index,
    hold4: cargoIndices.HOLD4.index,
    zoneOC: passengerIndices.OC.index,
    zoneOD: passengerIndices.OD.index,
  };

  // Sum negatives (only count values that are actually negative)
  const totalNegative = Object.values(negativeIndices).reduce((sum, val) => {
    return sum + (val < 0 ? val : 0);
  }, 0);

  // Sum positives (only count values that are actually positive)
  const totalPositive = Object.values(positiveIndices).reduce((sum, val) => {
    return sum + (val > 0 ? val : 0);
  }, 0);

  // DOI contributes to the balance — it can be positive too
  const doiContribution = basicWeights.doi;

  // 5. Weight calculations
  const subtotalWeight = basicWeights.dow + totalPaxWeight + totalCargoWeight;
  const zfw = subtotalWeight;

  // ZFI = DOI + sum of all passenger indices + sum of all cargo indices
  const allPaxIndex = Object.values(passengerIndices).reduce((sum, z) => sum + z.index, 0);
  const allCargoIndex = Object.values(cargoIndices).reduce((sum, h) => sum + h.index, 0);
  const zfi = doiContribution + allPaxIndex + allCargoIndex;

  // 6. LMC calculations
  const lmcTotalWeight = lmcItems.reduce((sum, item) => sum + (item.weight || 0), 0);
  const lmcTotalIndex = lmcItems.reduce((sum, item) => sum + (item.index || 0), 0);

  const finalZfw = zfw + lmcTotalWeight;
  const finalZfi = zfi + lmcTotalIndex;

  // 7. TOW calculations
  const tow = finalZfw + totalFuel;
  const toi = finalZfi + fuelIndexResult.index;

  // 8. Landing weight (TOW - trip fuel; use total fuel as estimate if trip fuel not provided)
  const tripFuelExplicit = input.fuel?.tripFuel || input.tripFuel;
  const tripFuel = tripFuelExplicit || totalFuel * 0.6; // Rough estimate: 60% of total fuel
  const tripFuelEstimated = !tripFuelExplicit;
  const landingWeight = tow - tripFuel;

  // 9. CG calculation (% MAC) - use variant-specific LEMAC
  const variantLemac = aircraft.lemac || LEMAC;
  const zfmac = indexToMac(finalZfi, finalZfw, variantLemac);
  const tomac = indexToMac(toi, tow, variantLemac);
  const landingIndex = totalFuel > 0 ? toi - fuelIndexResult.index * (tripFuel / totalFuel) : toi;
  const landingMac = indexToMac(landingIndex, landingWeight, variantLemac);

  // 10. Trim calculation
  const trimResult = calculateTrim(aircraft, toi, tow, takeoffConfig);

  // 11. CG limits at actual weights (interpolated from envelope)
  const zfwLimits = getCgLimitsAtWeight(CG_ENVELOPE_737_800.zfw, finalZfw);
  const towLimits = getCgLimitsAtWeight(CG_ENVELOPE_737_800.tow, tow);

  // 12. UNDLD — spare payload before hitting tightest structural limit
  const undldZfw = (aircraft.weights.mzfw || 999999) - finalZfw;
  const undldTow = (aircraft.weights.mtow || 999999) - tow;
  const undldLaw = (aircraft.weights.mlw || 999999) - landingWeight;
  const undld = Math.min(undldZfw, undldTow, undldLaw);
  const limitingFactor = undld === undldLaw ? 'L' : undld === undldTow ? 'T' : 'Z';

  return {
    // Input summary
    aircraft: {
      id: aircraft.id,
      displayName: aircraft.displayName,
      type: aircraft.type,
    },

    // Passenger details
    passengers: {
      zones: passengerIndices,
      totalPax,
      totalWeight: totalPaxWeight,
    },

    // Cargo details
    cargo: {
      holds: cargoIndices,
      totalWeight: totalCargoWeight,
    },

    // Fuel details
    fuel: {
      wingTanks: fuel.wingTanks || 0,
      centerTank: fuel.centerTank || 0,
      total: totalFuel,
      index: fuelIndexResult.index,
      method: fuelIndexResult.method,
    },

    // Index breakdown
    indices: {
      doi: doiContribution,
      negative: {
        ...negativeIndices,
        total: totalNegative,
      },
      positive: {
        ...positiveIndices,
        total: totalPositive,
      },
      allPaxIndex,
      allCargoIndex,
      zfi,
      finalZfi,
      toi,
    },

    // Weight results
    weights: {
      dow: basicWeights.dow,
      subtotal: subtotalWeight,
      zfw,
      finalZfw,
      tow,
      landingWeight: Math.round(landingWeight),
      tripFuel: Math.round(tripFuel),
      tripFuelEstimated,
      undld: Math.round(undld),
      limitingFactor,
    },

    // CG results
    cg: {
      zfmac: Math.round(zfmac * 10) / 10,
      tomac: Math.round(tomac * 10) / 10,
      landingMac: Math.round(landingMac * 10) / 10,
      zfwFwdLmt: zfwLimits.forward,
      zfwAftLmt: zfwLimits.aft,
      towFwdLmt: towLimits.forward,
      towAftLmt: towLimits.aft,
    },

    // Trim results
    trim: trimResult,

    // LMC
    lmc: {
      items: lmcItems,
      totalWeight: lmcTotalWeight,
      totalIndex: lmcTotalIndex,
    },

    // Takeoff config
    takeoffConfig,
  };
}

/**
 * Interpolate forward/aft CG limits at a given weight from the envelope table.
 */
function getCgLimitsAtWeight(envelope, weight) {
  if (!envelope || envelope.length === 0) return { forward: null, aft: null };
  if (weight <= envelope[0].weight) return { forward: envelope[0].forward, aft: envelope[0].aft };
  const last = envelope[envelope.length - 1];
  if (weight >= last.weight) return { forward: last.forward, aft: last.aft };
  for (let i = 0; i < envelope.length - 1; i++) {
    if (weight >= envelope[i].weight && weight <= envelope[i + 1].weight) {
      const ratio = (weight - envelope[i].weight) / (envelope[i + 1].weight - envelope[i].weight);
      return {
        forward: Math.round((envelope[i].forward + ratio * (envelope[i + 1].forward - envelope[i].forward)) * 100) / 100,
        aft: Math.round((envelope[i].aft + ratio * (envelope[i + 1].aft - envelope[i].aft)) * 100) / 100,
      };
    }
  }
  return { forward: null, aft: null };
}

// 737-800 CG reference constants derived from the Boeing performance manual.
// IU formula: IU = (Weight × (Arm - K)) / C + D
// where K = 658.3 (reference arm), C = 40000 (scale factor), D = 45 (index offset)
const IU_REF_ARM = 658.3;  // Reference arm in inches
const IU_SCALE = 40000;     // Scale factor
const IU_OFFSET = 45;       // Index offset
const LEMAC = 628.84;       // Leading Edge of MAC in inches
const MAC_LENGTH = 147.31;  // Mean Aerodynamic Chord length in inches

/**
 * Convert index units to % MAC using the IU formula.
 * Derivation:
 *   IU = (W × (Arm - 658.3)) / 40000 + 45
 *   Arm = ((IU - 45) × 40000 / W) + 658.3
 *   %MAC = ((Arm - LEMAC) / MAC) × 100
 *
 * When weight is not provided, we use a weight-independent linear approximation
 * calibrated from the performance manual.
 *
 * @param {number} indexValue - Index units
 * @param {number} [weight] - Weight in kg (for accurate calculation)
 * @returns {number} % MAC
 */
export function indexToMac(indexValue, weight, lemac = LEMAC) {
  if (weight && weight > 0) {
    const arm = ((indexValue - IU_OFFSET) * IU_SCALE / weight) + IU_REF_ARM;
    return ((arm - lemac) / MAC_LENGTH) * 100;
  }

  // Fallback: linear approximation (less accurate without weight)
  // Calibrated so that index 45 ≈ 20% MAC at typical ZFW
  return ((indexValue - IU_OFFSET) * IU_SCALE / 55000 + IU_REF_ARM - lemac) / MAC_LENGTH * 100;
}

/**
 * Look up base trim from the trim table using bilinear interpolation.
 * @param {number} toi - Takeoff index
 * @param {number} tow - Takeoff weight
 * @returns {number} Base trim value in units
 */
function lookupBaseTrim(toi, tow) {
  const table = TRIM_TABLE_737_800;

  // Clamp TOW to table range
  const clampedTow = Math.max(table[0].tow, Math.min(tow, table[table.length - 1].tow));

  // Find bracketing TOW rows
  let lowerRow = table[0];
  let upperRow = table[table.length - 1];

  for (let i = 0; i < table.length - 1; i++) {
    if (clampedTow >= table[i].tow && clampedTow <= table[i + 1].tow) {
      lowerRow = table[i];
      upperRow = table[i + 1];
      break;
    }
  }

  // Interpolate trim for the lower TOW row
  const lowerTrim = interpolateTrimRow(lowerRow.entries, toi);
  // Interpolate trim for the upper TOW row
  const upperTrim = interpolateTrimRow(upperRow.entries, toi);

  // Interpolate between the two TOW rows
  if (lowerRow.tow === upperRow.tow) return lowerTrim;

  const towRatio = (clampedTow - lowerRow.tow) / (upperRow.tow - lowerRow.tow);
  return lowerTrim + towRatio * (upperTrim - lowerTrim);
}

/**
 * Interpolate within a single trim row to find trim for a given TOI.
 * @param {Array} entries - [{ toi, trim }]
 * @param {number} toi - Target TOI value
 * @returns {number} Interpolated trim value
 */
function interpolateTrimRow(entries, toi) {
  if (toi <= entries[0].toi) return entries[0].trim;
  if (toi >= entries[entries.length - 1].toi) return entries[entries.length - 1].trim;

  for (let i = 0; i < entries.length - 1; i++) {
    if (toi >= entries[i].toi && toi <= entries[i + 1].toi) {
      const range = entries[i + 1].toi - entries[i].toi;
      const ratio = (toi - entries[i].toi) / range;
      return entries[i].trim + ratio * (entries[i + 1].trim - entries[i].trim);
    }
  }

  return entries[0].trim;
}

/**
 * Calculate stabilizer trim with thrust/flap corrections.
 * 737 MAX 8 does not use manual trim — FMC calculates it.
 * @param {Object} aircraft - Aircraft variant object
 * @param {number} toi - Takeoff index
 * @param {number} tow - Takeoff weight
 * @param {Object} config - { flaps: 'F5'|'F15', thrust: '26K'|'24K'|'22K' }
 * @returns {Object} Trim result
 */
export function calculateTrim(aircraft, toi, tow, config) {
  if (aircraft.type === '737-MAX-8') {
    return {
      calculated: false,
      message: 'Trim will be calculated by FMC',
      baseTrim: null,
      finalTrim: null,
      flaps: config.flaps,
      thrust: 'N/A',
    };
  }

  const baseTrim = lookupBaseTrim(toi, tow);
  const correction = TRIM_CORRECTIONS_737_800[config.flaps]?.[config.thrust] || 0;
  const finalTrim = Math.round((baseTrim + correction) * 10) / 10;

  return {
    calculated: true,
    baseTrim: Math.round(baseTrim * 10) / 10,
    correction,
    finalTrim,
    flaps: config.flaps,
    thrust: config.thrust,
  };
}
