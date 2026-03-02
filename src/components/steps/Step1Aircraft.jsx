import React from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { AIRCRAFT_VARIANTS } from '../../data/aircraftData.js';
import Pill from '../shared/Pill.jsx';

function fmt(n) {
  return n != null ? n.toLocaleString() : '---';
}

export default function Step1Aircraft() {
  const { inputs, aircraft, setAircraftId } = useCalculation();

  return (
    <div className="fade-in max-w-xl">
      <h2 className="text-xl font-bold heading mb-1">Aircraft Selection</h2>
      <p className="text-[14px] muted mb-6">Choose the aircraft variant for this calculation.</p>

      <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
        Aircraft Variant
      </label>
      <select
        value={inputs.aircraftId}
        onChange={(e) => setAircraftId(e.target.value)}
        className="field-input w-full px-4 py-3.5 text-[15px] font-semibold touch"
      >
        {AIRCRAFT_VARIANTS.map((v) => (
          <option key={v.id} value={v.id}>{v.id} — {v.displayName}</option>
        ))}
      </select>

      {aircraft && (
        <>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="live-panel p-4 text-center">
              <span className="text-[10px] font-bold field-label uppercase tracking-wider block mb-2">MTOW</span>
              <Pill variant="navy" size="lg">{fmt(aircraft.weights.mtow)}</Pill>
              <span className="text-[10px] muted block mt-1">kg</span>
            </div>
            <div className="live-panel p-4 text-center">
              <span className="text-[10px] font-bold field-label uppercase tracking-wider block mb-2">MZFW</span>
              <Pill variant="navy" size="lg">{fmt(aircraft.weights.mzfw)}</Pill>
              <span className="text-[10px] muted block mt-1">kg</span>
            </div>
            <div className="live-panel p-4 text-center">
              <span className="text-[10px] font-bold field-label uppercase tracking-wider block mb-2">MLW</span>
              <Pill variant="navy" size="lg">{fmt(aircraft.weights.mlw)}</Pill>
              <span className="text-[10px] muted block mt-1">kg</span>
            </div>
          </div>

          <div className="mt-4 live-panel p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mas-navy/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-mas-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] field-label">Configuration</span>
              <p className="text-[15px] font-bold heading">{aircraft.config} — {aircraft.totalSeats} Seats</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
