import React from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { PASSENGER_WEIGHTS } from '../../data/aircraftData.js';
import Pill from '../shared/Pill.jsx';

const ZONE_LABELS = {
  OA: 'Forward',
  OB: 'Fwd-Mid',
  OC: 'Aft-Mid',
  OD: 'Aft',
};

function fmt(n) {
  return n != null ? n.toLocaleString() : '---';
}

export default function Step3Passengers() {
  const { inputs, aircraft, setPassengers } = useCalculation();
  const pax = inputs.passengers;
  const totalPax = Object.values(pax).reduce((s, v) => s + (v || 0), 0);
  const totalWeight = totalPax * PASSENGER_WEIGHTS.adult;

  return (
    <div className="fade-in max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold heading mb-0.5">Passengers</h2>
          <p className="text-[14px] muted">Std weight: {PASSENGER_WEIGHTS.adult} kg/pax</p>
        </div>
        <div className="text-right">
          <Pill variant="navy" size="xl">{totalPax}</Pill>
          <span className="text-[11px] muted block mt-1">of {aircraft?.totalSeats || '---'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {['OA', 'OB', 'OC', 'OD'].map((zone) => {
          const count = pax[zone] || 0;
          const weight = count * PASSENGER_WEIGHTS.adult;
          const maxPax = aircraft?.zones?.[zone]?.maxPax || 99;

          return (
            <div key={zone} className="live-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-bold heading">Zone {zone}</span>
                <span className="text-[10px] muted">{ZONE_LABELS[zone]}</span>
              </div>
              <input
                type="number"
                min="0"
                max={maxPax}
                value={pax[zone] || ''}
                onChange={(e) => setPassengers(zone, e.target.value ? Number(e.target.value) : 0)}
                className="field-input w-full px-3 py-3 text-xl font-mono font-bold text-center touch"
                placeholder="0"
              />
              <div className="mt-2 text-center">
                <Pill variant="navy">{fmt(weight)} kg</Pill>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 live-panel p-4 flex items-center justify-between">
        <span className="text-[14px] font-semibold heading">Total Passenger Weight</span>
        <Pill variant="navy" size="xl">{fmt(totalWeight)} kg</Pill>
      </div>
    </div>
  );
}
