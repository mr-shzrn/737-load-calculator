import React from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import Pill from '../shared/Pill.jsx';

function fmt(n) {
  return n != null ? n.toLocaleString() : '---';
}

const FLAP_LABELS = {
  F5:  'Standard departure',
  F15: 'Short / hot / high field',
};

const THRUST_LABELS = {
  '26K': 'Full rated',
  '24K': 'Derate 1',
  '22K': 'Derate 2',
  'N/A': 'Set by FMC',
};

export default function Step5Fuel() {
  const { inputs, aircraft, results, validation, setFuel, setTakeoffConfig } = useCalculation();
  const fuel = inputs.fuel;
  const totalFuel = (fuel.wingTank1 || 0) + (fuel.wingTank2 || 0) + (fuel.centerTank || 0);
  const fuelIndex = results?.fuel?.index ?? '---';
  const config = inputs.takeoffConfig;
  const availableThrust = aircraft?.availableThrust || ['26K', '24K', '22K'];

  const wingMaxEach = Math.floor((aircraft?.wingTankMax || 7830) / 2);
  const centerMax   = aircraft?.centerTankMax || (aircraft?.type === '737-MAX-8' ? 13763 : 13066);

  const fuelErrors = validation?.fuel?.errors || [];

  return (
    <div className="fade-in max-w-xl">
      <h2 className="text-xl font-bold heading mb-1">Fuel Loading</h2>
      <p className="text-[14px] muted mb-6">Takeoff Fuel (TOF) by tank.</p>

      {fuelErrors.length > 0 && (
        <div className="mb-4 rounded-xl p-3 text-[12px]" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          {fuelErrors.map((e, i) => <p key={i} className="text-red-700">⚠ {e}</p>)}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
              Wing Tank 1 (kg) <span className="font-normal normal-case muted">max {fmt(wingMaxEach)}</span>
            </label>
            <input
              type="number"
              min="0"
              max={wingMaxEach}
              value={fuel.wingTank1 || ''}
              onChange={(e) => setFuel('wingTank1', e.target.value ? Number(e.target.value) : 0)}
              className={`field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch ${(fuel.wingTank1 || 0) > wingMaxEach ? 'border-red-400' : ''}`}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
              Wing Tank 2 (kg) <span className="font-normal normal-case muted">max {fmt(wingMaxEach)}</span>
            </label>
            <input
              type="number"
              min="0"
              max={wingMaxEach}
              value={fuel.wingTank2 || ''}
              onChange={(e) => setFuel('wingTank2', e.target.value ? Number(e.target.value) : 0)}
              className={`field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch ${(fuel.wingTank2 || 0) > wingMaxEach ? 'border-red-400' : ''}`}
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
            Centre Tank TOF (kg) <span className="font-normal normal-case muted">max {fmt(centerMax)}</span>
          </label>
          <input
            type="number"
            min="0"
            max={centerMax}
            value={fuel.centerTank || ''}
            onChange={(e) => setFuel('centerTank', e.target.value ? Number(e.target.value) : 0)}
            className={`field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch ${(fuel.centerTank || 0) > centerMax ? 'border-red-400' : ''}`}
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
            <p className="text-[10px] muted mt-1.5 text-center">{FLAP_LABELS[config.flaps]}</p>
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
            <p className="text-[10px] muted mt-1.5 text-center">{THRUST_LABELS[config.thrust] || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
