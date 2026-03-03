import React from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { PASSENGER_WEIGHTS } from '../../data/aircraftData.js';
import Pill from '../shared/Pill.jsx';
import NumericInput from '../shared/NumericInput.jsx';

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
  const { inputs, aircraft, setPassengers, setChildren, setInfants } = useCalculation();
  const pax = inputs.passengers;
  const children = inputs.children || 0;
  const infants = inputs.infants || 0;
  const totalAdultPax = Object.values(pax).reduce((s, v) => s + (v || 0), 0);
  const totalPax = totalAdultPax + children + infants;
  const totalWeight = totalAdultPax * PASSENGER_WEIGHTS.adult + children * PASSENGER_WEIGHTS.child;

  return (
    <div className="fade-in max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold heading mb-0.5">Passengers</h2>
          <p className="text-[14px] muted">Adult: {PASSENGER_WEIGHTS.adult} kg · Child: {PASSENGER_WEIGHTS.child} kg · Infant: 0 kg</p>
        </div>
        <div className="text-right">
          <Pill variant="navy" size="xl">{totalPax}</Pill>
          <span className="text-[11px] muted block mt-1">of {aircraft?.totalSeats || '---'}</span>
        </div>
      </div>

      {/* Zone inputs */}
      <div className="grid grid-cols-2 gap-4">
        {['OA', 'OB', 'OC', 'OD'].map((zone) => {
          const count = pax[zone] || 0;
          const weight = count * PASSENGER_WEIGHTS.adult;
          const maxPax = aircraft?.zones?.[zone]?.maxPax || 99;
          const rows = aircraft?.zones?.[zone]?.rows || '';

          return (
            <div key={zone} className="live-panel p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-bold heading">Zone {zone}</span>
                <span className="text-[10px] muted">{ZONE_LABELS[zone]}</span>
              </div>
              {rows && <span className="text-[10px] muted block mb-2">Rows {rows} — max {maxPax}</span>}
              <NumericInput
                value={pax[zone] || 0}
                min={0}
                max={maxPax}
                onChange={(v) => setPassengers(zone, v)}
              />
              <div className="mt-2 text-center">
                <Pill variant="navy">{fmt(weight)} kg</Pill>
              </div>
            </div>
          );
        })}
      </div>

      {/* Children & Infants */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="live-panel p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] font-bold heading">Children</span>
            <span className="text-[10px] muted">Age 2–12</span>
          </div>
          <span className="text-[10px] muted block mb-2">{PASSENGER_WEIGHTS.child} kg each</span>
          <NumericInput
            value={children}
            min={0}
            onChange={(v) => setChildren(v)}
          />
          <div className="mt-2 text-center">
            <Pill variant="amber">{fmt(children * PASSENGER_WEIGHTS.child)} kg</Pill>
          </div>
        </div>
        <div className="live-panel p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13px] font-bold heading">Infants</span>
            <span className="text-[10px] muted">Under 2</span>
          </div>
          <span className="text-[10px] muted block mb-2">No seat · 0 kg</span>
          <NumericInput
            value={infants}
            min={0}
            onChange={(v) => setInfants(v)}
          />
          <div className="mt-2 text-center">
            <Pill variant="green">0 kg</Pill>
          </div>
        </div>
      </div>

      <div className="mt-4 live-panel p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[14px] font-semibold heading">Total Pax ({totalPax})</span>
          <Pill variant="navy" size="xl">{fmt(totalWeight)} kg</Pill>
        </div>
        {(children > 0 || infants > 0) && (
          <p className="text-[11px] muted mt-1">
            {totalAdultPax} adults × {PASSENGER_WEIGHTS.adult} kg
            {children > 0 && ` + ${children} children × ${PASSENGER_WEIGHTS.child} kg`}
            {infants > 0 && ` + ${infants} infants × 0 kg`}
          </p>
        )}
      </div>
    </div>
  );
}
