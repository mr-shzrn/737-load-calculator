import React from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import Pill from '../shared/Pill.jsx';

function fmt(n) {
  return n != null ? n.toLocaleString() : '---';
}

export default function Step5Fuel() {
  const { inputs, aircraft, results, setFuel, setTakeoffConfig } = useCalculation();
  const fuel = inputs.fuel;
  const totalFuel = (fuel.wingTanks || 0) + (fuel.centerTank || 0);
  const fuelIndex = results?.fuel?.index ?? '---';
  const config = inputs.takeoffConfig;
  const availableThrust = aircraft?.availableThrust || ['26K', '24K', '22K'];

  return (
    <div className="fade-in max-w-xl">
      <h2 className="text-xl font-bold heading mb-1">Fuel Loading</h2>
      <p className="text-[14px] muted mb-6">Takeoff Fuel (TOF) distribution by tank.</p>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
            Left + Right Wing TOF (kg)
          </label>
          <input
            type="number"
            min="0"
            value={fuel.wingTanks || ''}
            onChange={(e) => setFuel('wingTanks', e.target.value ? Number(e.target.value) : 0)}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
            Centre Tank TOF (kg)
          </label>
          <input
            type="number"
            min="0"
            value={fuel.centerTank || ''}
            onChange={(e) => setFuel('centerTank', e.target.value ? Number(e.target.value) : 0)}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder="0"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
          TIF — Trip In-Flight Fuel (kg) <span className="font-normal normal-case">— optional, defaults to 60% of TOF</span>
        </label>
        <input
          type="number"
          min="0"
          value={fuel.tripFuel || ''}
          onChange={(e) => setFuel('tripFuel', e.target.value ? Number(e.target.value) : null)}
          className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
          placeholder={totalFuel > 0 ? `Est. ${fmt(Math.round(totalFuel * 0.6))}` : '0'}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="live-panel p-4 text-center">
          <span className="text-[10px] font-bold field-label uppercase tracking-wider block mb-2">Total TOF</span>
          <Pill variant="navy" size="xl">{fmt(totalFuel)} kg</Pill>
        </div>
        <div className="live-panel p-4 text-center">
          <span className="text-[10px] font-bold field-label uppercase tracking-wider block mb-2">Fuel Index</span>
          <Pill variant="navy" size="xl">{fuelIndex}</Pill>
        </div>
      </div>

      {/* Takeoff Configuration */}
      <div className="mt-6">
        <h3 className="text-[14px] font-bold heading mb-3">Takeoff Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
              Flap Setting
            </label>
            <div className="flex gap-2">
              {['F5', 'F15'].map((flap) => (
                <button
                  key={flap}
                  onClick={() => setTakeoffConfig({ flaps: flap })}
                  className={`flex-1 touch rounded-lg font-semibold text-[14px] transition-all ${
                    config.flaps === flap
                      ? 'bg-mas-navy text-white shadow-sm'
                      : 'live-panel heading'
                  }`}
                >
                  {flap}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
              Thrust Setting
            </label>
            <div className="flex gap-2">
              {availableThrust.map((thrust) => (
                <button
                  key={thrust}
                  onClick={() => setTakeoffConfig({ thrust })}
                  className={`flex-1 touch rounded-lg font-semibold text-[14px] transition-all ${
                    config.thrust === thrust
                      ? 'bg-mas-navy text-white shadow-sm'
                      : 'live-panel heading'
                  }`}
                >
                  {thrust}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
