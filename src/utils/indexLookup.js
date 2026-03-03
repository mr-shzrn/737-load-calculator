// Index lookup functions for passenger zones, cargo holds, and fuel
import {
  CARGO_TABLE_MAP,
  FUEL_TABLE_MAP,
  PASSENGER_TABLE_MAP,
} from '../data/indexTables.js';
import { PASSENGER_WEIGHTS } from '../data/aircraftData.js';

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
 * @param {string} [cargoTableSet='738'] - Cargo table set identifier
 * @returns {number} Index value for the hold
 */
export function getCargoIndex(hold, weight, cargoTableSet = '738') {
  if (weight === 0) return 0;

  const tableSet = CARGO_TABLE_MAP[cargoTableSet];
  if (!tableSet) {
    throw new Error(`Unknown cargo table set: ${cargoTableSet}`);
  }

  const holdTable = tableSet[hold];
  if (!holdTable) {
    throw new Error(`Unknown hold: ${hold}`);
  }

  for (const row of holdTable) {
    if (weight >= row.weight[0] && weight <= row.weight[1]) {
      return row.index;
    }
  }

  throw new Error(`Cargo weight ${weight} kg out of range for ${hold} (table: ${cargoTableSet})`);
}

/**
 * Interpolate within a fuel table array (discrete weight points).
 * @param {Array} table - [{ weight, index }]
 * @param {number} weight - Fuel weight in kg
 * @returns {number} Interpolated index value
 */
function interpolateFuelTable(table, weight) {
  const exact = table.find((row) => row.weight === weight);
  if (exact) return exact.index;

  if (weight < table[0].weight) return table[0].index;
  if (weight > table[table.length - 1].weight) return table[table.length - 1].index;

  for (let i = 0; i < table.length - 1; i++) {
    const lower = table[i];
    const upper = table[i + 1];
    if (weight >= lower.weight && weight <= upper.weight) {
      const ratio = (weight - lower.weight) / (upper.weight - lower.weight);
      return Math.round(lower.index + ratio * (upper.index - lower.index));
    }
  }

  return table[table.length - 1].index;
}

/**
 * Look up fuel index with linear interpolation between table entries.
 * @param {string} fuelType - Table key (e.g. 'TOTAL_FUEL', 'ALL_TANKS', 'WING_TANKS_1_2', 'CENTER_TANK')
 * @param {number} weight - Fuel weight in kg
 * @param {string} [fuelTableSet='738'] - Fuel table set identifier
 * @returns {number} Interpolated index value
 */
export function getFuelIndex(fuelType, weight, fuelTableSet = '738') {
  if (weight === 0) return 0;

  const fuelTables = FUEL_TABLE_MAP[fuelTableSet];
  if (!fuelTables) throw new Error(`Unknown fuel table set: ${fuelTableSet}`);

  const table = fuelTables[fuelType];
  if (!table) throw new Error(`Unknown fuel type: ${fuelType} (table: ${fuelTableSet})`);

  return interpolateFuelTable(table, weight);
}

/**
 * Calculate fuel index for the given total fuel load.
 *
 * 737-800: uses TOTAL_FUEL table for ≤13,500 kg; splits into WING_TANKS_1_2 +
 *   CENTER_TANK for higher loads.
 * 737 MAX 8: uses ALL_TANKS table for the full range (0–21,961 kg); no split needed.
 *
 * @param {number} totalFuel - Total fuel weight in kg
 * @param {number} [wingFuel=0] - Wing tank fuel (used for 737-800 split calculation)
 * @param {number} [centerFuel=0] - Center tank fuel (used for 737-800 split calculation)
 * @param {string} [fuelTableSet='738'] - Fuel table set identifier
 * @returns {{ index: number, method: string }} Fuel index and method used
 */
export function calculateFuelIndex(totalFuel, wingFuel = 0, centerFuel = 0, fuelTableSet = '738') {
  if (totalFuel === 0) return { index: 0, method: 'none' };

  const fuelTables = FUEL_TABLE_MAP[fuelTableSet];
  if (!fuelTables) throw new Error(`Unknown fuel table set: ${fuelTableSet}`);

  // MAX 8 (and any variant with ALL_TANKS): single table covers full range
  if (fuelTables.ALL_TANKS) {
    return { index: getFuelIndex('ALL_TANKS', totalFuel, fuelTableSet), method: 'all_tanks' };
  }

  // 737-800: split at 13,500 kg
  if (totalFuel <= 13500) {
    return { index: getFuelIndex('TOTAL_FUEL', totalFuel, fuelTableSet), method: 'total' };
  }

  const wingIndex = wingFuel > 0 ? getFuelIndex('WING_TANKS_1_2', wingFuel, fuelTableSet) : 0;
  const centerIndex = centerFuel > 0 ? getFuelIndex('CENTER_TANK', centerFuel, fuelTableSet) : 0;
  return { index: wingIndex + centerIndex, method: 'split', wingIndex, centerIndex };
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
      weight: pax * PASSENGER_WEIGHTS.adult,
      index: getPassengerIndex(zone, pax, tableSet),
    };
  }
  return result;
}

/**
 * Get all cargo indices for all holds at once.
 * @param {Object} cargo - { HOLD1: number, HOLD2: number, HOLD3: number, HOLD4: number }
 * @param {string} [cargoTableSet='738'] - Cargo table set identifier
 * @returns {Object} { HOLD1: { weight, index }, HOLD2: { weight, index }, ... }
 */
export function getAllCargoIndices(cargo, cargoTableSet = '738') {
  const result = {};
  for (const hold of ['HOLD1', 'HOLD2', 'HOLD3', 'HOLD4']) {
    const weight = cargo[hold] || 0;
    result[hold] = {
      weight,
      index: getCargoIndex(hold, weight, cargoTableSet),
    };
  }
  return result;
}
