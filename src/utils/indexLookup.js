// Index lookup functions for passenger zones, cargo holds, and fuel
import {
  CARGO_INDEX_737_800,
  FUEL_INDEX_737_800,
  PASSENGER_TABLE_MAP,
} from '../data/indexTables.js';

/**
 * Look up passenger index for a zone based on passenger count.
 * @param {string} zone - Zone identifier (OA, OB, OC, OD)
 * @param {number} paxCount - Number of passengers in the zone
 * @param {string} tableSet - Index table set identifier (e.g., '738-16BC-144EY')
 * @returns {number} Index value for the zone
 */
export function getPassengerIndex(zone, paxCount, tableSet) {
  if (paxCount === 0) return 0;

  const table = PASSENGER_TABLE_MAP[tableSet];
  if (!table) {
    throw new Error(`Unknown index table set: ${tableSet}`);
  }

  const zoneTable = table[zone];
  if (!zoneTable) {
    throw new Error(`Unknown zone: ${zone}`);
  }

  for (const row of zoneTable) {
    const [min, max] = row.pax;
    if (paxCount >= min && paxCount <= max) {
      return row.index;
    }
  }

  throw new Error(
    `Passenger count ${paxCount} out of range for zone ${zone}`
  );
}

/**
 * Look up cargo index for a hold based on weight.
 * @param {string} hold - Hold identifier (HOLD1, HOLD2, HOLD3, HOLD4)
 * @param {number} weight - Cargo weight in kg
 * @returns {number} Index value for the hold
 */
export function getCargoIndex(hold, weight) {
  if (weight === 0) return 0;

  const holdTable = CARGO_INDEX_737_800[hold];
  if (!holdTable) {
    throw new Error(`Unknown hold: ${hold}`);
  }

  for (const row of holdTable) {
    if (weight >= row.weight[0] && weight <= row.weight[1]) {
      return row.index;
    }
  }

  throw new Error(`Cargo weight ${weight} kg out of range for ${hold}`);
}

/**
 * Look up fuel index with linear interpolation between table entries.
 * The fuel table uses discrete weight points, so we interpolate for in-between values.
 * @param {string} fuelType - Fuel type (TOTAL_FUEL, WING_TANKS_1_2, CENTER_TANK)
 * @param {number} weight - Fuel weight in kg
 * @returns {number} Interpolated index value
 */
export function getFuelIndex(fuelType, weight) {
  if (weight === 0) return 0;

  const table = FUEL_INDEX_737_800[fuelType];
  if (!table) {
    throw new Error(`Unknown fuel type: ${fuelType}`);
  }

  // Exact match
  const exact = table.find((row) => row.weight === weight);
  if (exact) return exact.index;

  // Check boundaries
  if (weight < table[0].weight) {
    return table[0].index;
  }
  if (weight > table[table.length - 1].weight) {
    return table[table.length - 1].index;
  }

  // Find bracketing values and interpolate
  for (let i = 0; i < table.length - 1; i++) {
    const lower = table[i];
    const upper = table[i + 1];

    if (weight >= lower.weight && weight <= upper.weight) {
      const weightRange = upper.weight - lower.weight;
      const indexRange = upper.index - lower.index;
      const ratio = (weight - lower.weight) / weightRange;
      return Math.round(lower.index + ratio * indexRange);
    }
  }

  throw new Error(`Fuel weight ${weight} kg out of range for ${fuelType}`);
}

/**
 * Determine the correct fuel index calculation method based on total fuel weight.
 * For fuel <= 13,500 kg: use TOTAL_FUEL table directly.
 * For fuel > 13,500 kg: use WING_TANKS_1_2 + CENTER_TANK tables separately.
 * @param {number} totalFuel - Total fuel weight in kg
 * @param {number} wingFuel - Wing tank fuel weight (optional, for split calculation)
 * @param {number} centerFuel - Center tank fuel weight (optional, for split calculation)
 * @returns {{ index: number, method: string }} Fuel index and method used
 */
export function calculateFuelIndex(totalFuel, wingFuel = 0, centerFuel = 0) {
  if (totalFuel === 0) {
    return { index: 0, method: 'none' };
  }

  // If total fuel fits in the TOTAL_FUEL table range
  if (totalFuel <= 13500) {
    const index = getFuelIndex('TOTAL_FUEL', totalFuel);
    return { index, method: 'total' };
  }

  // For higher fuel loads, use split wing + center tank calculation
  const wingIndex = wingFuel > 0 ? getFuelIndex('WING_TANKS_1_2', wingFuel) : 0;
  const centerIndex = centerFuel > 0 ? getFuelIndex('CENTER_TANK', centerFuel) : 0;

  return {
    index: wingIndex + centerIndex,
    method: 'split',
    wingIndex,
    centerIndex,
  };
}

/**
 * Get all passenger indices for all zones at once.
 * @param {Object} passengers - { OA: number, OB: number, OC: number, OD: number }
 * @param {string} tableSet - Index table set identifier
 * @returns {Object} { OA: { pax, index }, OB: { pax, index }, ... }
 */
export function getAllPassengerIndices(passengers, tableSet) {
  const result = {};
  for (const zone of ['OA', 'OB', 'OC', 'OD']) {
    const pax = passengers[zone] || 0;
    result[zone] = {
      pax,
      weight: pax * 77, // CAD 6805 standard weight
      index: getPassengerIndex(zone, pax, tableSet),
    };
  }
  return result;
}

/**
 * Get all cargo indices for all holds at once.
 * @param {Object} cargo - { HOLD1: number, HOLD2: number, HOLD3: number, HOLD4: number }
 * @returns {Object} { HOLD1: { weight, index }, HOLD2: { weight, index }, ... }
 */
export function getAllCargoIndices(cargo) {
  const result = {};
  for (const hold of ['HOLD1', 'HOLD2', 'HOLD3', 'HOLD4']) {
    const weight = cargo[hold] || 0;
    result[hold] = {
      weight,
      index: getCargoIndex(hold, weight),
    };
  }
  return result;
}
