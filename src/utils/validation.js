// Validation logic for 737 Load & Trim Calculator
import { CG_ENVELOPE_737_800 } from '../data/trimCorrections.js';

/**
 * Validate Takeoff Weight against limits.
 * @param {number} tow - Takeoff weight in kg
 * @param {Object} limits - { mtow, mtxw }
 * @returns {Object} { pass: boolean, errors: string[] }
 */
export function validateTOW(tow, limits) {
  const errors = [];
  if (tow > limits.mtow) {
    errors.push(`TOW ${tow} kg exceeds MTOW ${limits.mtow} kg (over by ${tow - limits.mtow} kg)`);
  }
  if (limits.mtxw && tow > limits.mtxw) {
    errors.push(`TOW ${tow} kg exceeds MTXW ${limits.mtxw} kg`);
  }
  return { pass: errors.length === 0, errors };
}

/**
 * Validate Zero Fuel Weight against limit.
 * @param {number} zfw - Zero fuel weight in kg
 * @param {number} mzfw - Maximum zero fuel weight in kg
 * @returns {Object} { pass: boolean, errors: string[] }
 */
export function validateZFW(zfw, mzfw) {
  const errors = [];
  if (zfw > mzfw) {
    errors.push(`ZFW ${zfw} kg exceeds MZFW ${mzfw} kg (over by ${zfw - mzfw} kg)`);
  }
  return { pass: errors.length === 0, errors };
}

/**
 * Validate Landing Weight against limit.
 * @param {number} lw - Landing weight in kg
 * @param {number} mlw - Maximum landing weight in kg
 * @returns {Object} { pass: boolean, errors: string[] }
 */
export function validateLandingWeight(lw, mlw) {
  const errors = [];
  if (lw > mlw) {
    errors.push(`Landing weight ${lw} kg exceeds MLW ${mlw} kg (over by ${lw - mlw} kg)`);
  }
  return { pass: errors.length === 0, errors };
}

/**
 * Validate CG position is within the envelope.
 * Uses linear interpolation between envelope data points.
 * @param {number} weight - Weight in kg (ZFW or TOW)
 * @param {number} macPercent - CG position in % MAC
 * @param {string} phase - 'zfw' or 'tow'
 * @returns {Object} { pass: boolean, errors: string[], forwardLimit, aftLimit }
 */
export function validateCGEnvelope(weight, macPercent, phase = 'tow') {
  const envelope = CG_ENVELOPE_737_800[phase];
  if (!envelope || envelope.length === 0) {
    return { pass: true, errors: [], forwardLimit: null, aftLimit: null };
  }

  const forwardLimit = interpolateLimit(envelope, weight, 'forward');
  const aftLimit = interpolateLimit(envelope, weight, 'aft');

  const errors = [];
  if (macPercent < forwardLimit) {
    errors.push(`CG ${macPercent}% MAC is forward of limit ${forwardLimit}% MAC`);
  }
  if (macPercent > aftLimit) {
    errors.push(`CG ${macPercent}% MAC is aft of limit ${aftLimit}% MAC`);
  }

  return {
    pass: errors.length === 0,
    errors,
    forwardLimit: Math.round(forwardLimit * 10) / 10,
    aftLimit: Math.round(aftLimit * 10) / 10,
  };
}

/**
 * Interpolate a limit value from the envelope for a given weight.
 */
function interpolateLimit(envelope, weight, limitType) {
  if (weight <= envelope[0].weight) return envelope[0][limitType];
  if (weight >= envelope[envelope.length - 1].weight) return envelope[envelope.length - 1][limitType];

  for (let i = 0; i < envelope.length - 1; i++) {
    const lower = envelope[i];
    const upper = envelope[i + 1];

    if (weight >= lower.weight && weight <= upper.weight) {
      const ratio = (weight - lower.weight) / (upper.weight - lower.weight);
      return lower[limitType] + ratio * (upper[limitType] - lower[limitType]);
    }
  }

  return envelope[0][limitType];
}

/**
 * Validate Last Minute Changes total weight.
 * @param {number} lmcTotal - Total LMC weight in kg (can be negative)
 * @returns {Object} { pass: boolean, errors: string[] }
 */
export function validateLMC(lmcTotal) {
  const errors = [];
  if (Math.abs(lmcTotal) > 500) {
    errors.push(`LMC total ${lmcTotal} kg exceeds ±500 kg limit`);
  }
  return { pass: errors.length === 0, errors };
}

/**
 * Validate passenger count doesn't exceed zone capacity.
 * @param {number} pax - Passenger count
 * @param {number} maxPax - Maximum capacity for the zone
 * @param {string} zone - Zone identifier for error messages
 * @returns {Object} { pass: boolean, errors: string[] }
 */
export function validatePassengerZone(pax, maxPax, zone) {
  const errors = [];
  if (pax > maxPax) {
    errors.push(`Zone ${zone}: ${pax} pax exceeds capacity of ${maxPax}`);
  }
  if (pax < 0) {
    errors.push(`Zone ${zone}: passenger count cannot be negative`);
  }
  return { pass: errors.length === 0, errors };
}

/**
 * Validate cargo weight is within hold limits.
 * @param {string} hold - Hold identifier
 * @param {number} weight - Cargo weight in kg
 * @returns {Object} { pass: boolean, errors: string[] }
 */
export function validateCargoWeight(hold, weight) {
  const maxWeights = {
    HOLD1: 888,
    HOLD2: 2670,
    HOLD3: 3157,
    HOLD4: 474,
  };

  const errors = [];
  if (weight < 0) {
    errors.push(`${hold}: cargo weight cannot be negative`);
  }
  if (maxWeights[hold] && weight > maxWeights[hold]) {
    errors.push(`${hold}: ${weight} kg exceeds max ${maxWeights[hold]} kg`);
  }
  return { pass: errors.length === 0, errors };
}

/**
 * Run all validations against calculation results.
 * @param {Object} results - Output from performCalculation()
 * @param {Object} aircraft - Aircraft variant with weight limits
 * @returns {Object} Complete validation results
 */
export function validateAll(results, aircraft) {
  const towValidation = validateTOW(results.weights.tow, aircraft.weights);
  const zfwValidation = validateZFW(results.weights.finalZfw, aircraft.weights.mzfw);
  const lwValidation = validateLandingWeight(results.weights.landingWeight, aircraft.weights.mlw);
  const lmcValidation = validateLMC(results.lmc.totalWeight);

  const cgZfwValidation = validateCGEnvelope(results.weights.finalZfw, results.cg.zfmac, 'zfw');
  const cgTowValidation = validateCGEnvelope(results.weights.tow, results.cg.tomac, 'tow');

  // Validate each passenger zone
  const paxValidations = {};
  for (const zone of ['OA', 'OB', 'OC', 'OD']) {
    const pax = results.passengers.zones[zone].pax;
    const maxPax = aircraft.zones[zone].maxPax;
    paxValidations[zone] = validatePassengerZone(pax, maxPax, zone);
  }

  // Validate each cargo hold
  const cargoValidations = {};
  for (const hold of ['HOLD1', 'HOLD2', 'HOLD3', 'HOLD4']) {
    const weight = results.cargo.holds[hold].weight;
    cargoValidations[hold] = validateCargoWeight(hold, weight);
  }

  // Collect all errors
  const allErrors = [
    ...towValidation.errors,
    ...zfwValidation.errors,
    ...lwValidation.errors,
    ...lmcValidation.errors,
    ...cgZfwValidation.errors,
    ...cgTowValidation.errors,
    ...Object.values(paxValidations).flatMap((v) => v.errors),
    ...Object.values(cargoValidations).flatMap((v) => v.errors),
  ];

  return {
    allPass: allErrors.length === 0,
    errors: allErrors,
    tow: towValidation,
    zfw: zfwValidation,
    landingWeight: lwValidation,
    lmc: lmcValidation,
    cgZfw: cgZfwValidation,
    cgTow: cgTowValidation,
    passengers: paxValidations,
    cargo: cargoValidations,
  };
}
