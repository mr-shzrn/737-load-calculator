import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { AIRCRAFT_VARIANTS } from '../data/aircraftData.js';
import { performCalculation } from '../utils/calculations.js';
import { validateAll } from '../utils/validation.js';

const CalculationContext = createContext(null);

let nextLmcId = 1;

const initialState = {
  currentStep: 1,
  lmcItems: [],
  lmcPanelOpen: false,
  inputs: {
    aircraftId: '738-MX-16BC',
    dow: 44565,
    doi: 48,
    passengers: { OA: 0, OB: 0, OC: 0, OD: 0 },
    cargo: { HOLD1: 0, HOLD2: 0, HOLD3: 0, HOLD4: 0 },
    fuel: { wingTanks: 0, centerTank: 0, tripFuel: null },
    takeoffConfig: { flaps: 'F5', thrust: '26K' },
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AIRCRAFT':
      return { ...state, inputs: { ...state.inputs, aircraftId: action.payload } };
    case 'SET_DOW':
      return { ...state, inputs: { ...state.inputs, dow: action.payload } };
    case 'SET_DOI':
      return { ...state, inputs: { ...state.inputs, doi: action.payload } };
    case 'SET_PASSENGERS':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          passengers: { ...state.inputs.passengers, [action.zone]: action.payload },
        },
      };
    case 'SET_CARGO':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          cargo: { ...state.inputs.cargo, [action.hold]: action.payload },
        },
      };
    case 'SET_FUEL':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          fuel: { ...state.inputs.fuel, [action.tank]: action.payload },
        },
      };
    case 'SET_TAKEOFF_CONFIG':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          takeoffConfig: { ...state.inputs.takeoffConfig, ...action.payload },
        },
      };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'ADD_LMC':
      return { ...state, lmcItems: [...state.lmcItems, { ...action.payload, id: nextLmcId++ }] };
    case 'REMOVE_LMC':
      return { ...state, lmcItems: state.lmcItems.filter((item) => item.id !== action.payload) };
    case 'CLEAR_LMC':
      return { ...state, lmcItems: [] };
    case 'TOGGLE_LMC_PANEL':
      return { ...state, lmcPanelOpen: !state.lmcPanelOpen };
    default:
      return state;
  }
}

export function CalculationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const aircraft = useMemo(
    () => AIRCRAFT_VARIANTS.find((v) => v.id === state.inputs.aircraftId) || null,
    [state.inputs.aircraftId]
  );

  // Sync thrust when aircraft changes and current thrust is unavailable
  const effectiveConfig = useMemo(() => {
    if (!aircraft) return state.inputs.takeoffConfig;
    const available = aircraft.availableThrust || [];
    const current = state.inputs.takeoffConfig.thrust;
    if (!available.includes(current)) {
      const corrected = available[0] || '26K';
      dispatch({ type: 'SET_TAKEOFF_CONFIG', payload: { thrust: corrected } });
      return { ...state.inputs.takeoffConfig, thrust: corrected };
    }
    return state.inputs.takeoffConfig;
  }, [aircraft, state.inputs.takeoffConfig]);

  const results = useMemo(() => {
    const { dow, doi, passengers, cargo, fuel } = state.inputs;
    if (!aircraft || dow == null || doi == null) return null;

    try {
      return performCalculation({
        aircraft,
        basicWeights: { dow, doi },
        passengers,
        cargo,
        fuel,
        takeoffConfig: effectiveConfig,
        lmcItems: state.lmcItems,
      });
    } catch (e) {
      console.error('Calculation error:', e);
      return null;
    }
  }, [state.inputs, aircraft, effectiveConfig]);

  const validation = useMemo(() => {
    if (!results || !aircraft) return null;
    try {
      return validateAll(results, aircraft);
    } catch (e) {
      console.error('Validation error:', e);
      return null;
    }
  }, [results, aircraft]);

  // Action creators
  const setAircraftId = useCallback((id) => dispatch({ type: 'SET_AIRCRAFT', payload: id }), []);
  const setDow = useCallback((val) => dispatch({ type: 'SET_DOW', payload: val }), []);
  const setDoi = useCallback((val) => dispatch({ type: 'SET_DOI', payload: val }), []);
  const setPassengers = useCallback((zone, count) => dispatch({ type: 'SET_PASSENGERS', zone, payload: count }), []);
  const setCargo = useCallback((hold, weight) => dispatch({ type: 'SET_CARGO', hold, payload: weight }), []);
  const setFuel = useCallback((tank, weight) => dispatch({ type: 'SET_FUEL', tank, payload: weight }), []);
  const setTakeoffConfig = useCallback((config) => dispatch({ type: 'SET_TAKEOFF_CONFIG', payload: config }), []);
  const goToStep = useCallback((n) => dispatch({ type: 'SET_STEP', payload: n }), []);
  const nextStep = useCallback(() => dispatch({ type: 'SET_STEP', payload: Math.min(state.currentStep + 1, 6) }), [state.currentStep]);
  const prevStep = useCallback(() => dispatch({ type: 'SET_STEP', payload: Math.max(state.currentStep - 1, 1) }), [state.currentStep]);
  const addLmcItem = useCallback((item) => dispatch({ type: 'ADD_LMC', payload: item }), []);
  const removeLmcItem = useCallback((id) => dispatch({ type: 'REMOVE_LMC', payload: id }), []);
  const clearLmc = useCallback(() => dispatch({ type: 'CLEAR_LMC' }), []);
  const toggleLmcPanel = useCallback(() => dispatch({ type: 'TOGGLE_LMC_PANEL' }), []);

  const value = useMemo(() => ({
    currentStep: state.currentStep,
    inputs: state.inputs,
    lmcItems: state.lmcItems,
    lmcPanelOpen: state.lmcPanelOpen,
    aircraft,
    results,
    validation,
    setAircraftId,
    setDow,
    setDoi,
    setPassengers,
    setCargo,
    setFuel,
    setTakeoffConfig,
    goToStep,
    nextStep,
    prevStep,
    addLmcItem,
    removeLmcItem,
    clearLmc,
    toggleLmcPanel,
  }), [state, aircraft, results, validation, setAircraftId, setDow, setDoi, setPassengers, setCargo, setFuel, setTakeoffConfig, goToStep, nextStep, prevStep, addLmcItem, removeLmcItem, clearLmc, toggleLmcPanel]);

  return (
    <CalculationContext.Provider value={value}>
      {children}
    </CalculationContext.Provider>
  );
}

export function useCalculation() {
  const ctx = useContext(CalculationContext);
  if (!ctx) throw new Error('useCalculation must be used within CalculationProvider');
  return ctx;
}
