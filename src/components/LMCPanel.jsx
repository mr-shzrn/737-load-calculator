import React, { useState } from 'react';
import { useCalculation } from '../context/CalculationContext.jsx';
import { getPassengerIndex, getCargoIndex } from '../utils/indexLookup.js';
import { PASSENGER_WEIGHTS } from '../data/aircraftData.js';
import Pill from './shared/Pill.jsx';

const LMC_LIMIT = 500;

function computeLmcEntry(type, location, delta, aircraft, currentPax) {
  if (type === 'pax') {
    const zone = location;
    const currentCount = currentPax[zone] || 0;
    const newCount = Math.max(0, currentCount + delta);
    const tableSet = aircraft.indexTableSet;
    const indexBefore = getPassengerIndex(zone, currentCount, tableSet);
    const indexAfter = getPassengerIndex(zone, newCount, tableSet);
    const weight = delta * PASSENGER_WEIGHTS.adult;
    return {
      type: 'pax',
      location: zone,
      delta,
      weight,
      index: indexAfter - indexBefore,
      description: `${delta > 0 ? '+' : ''}${delta} pax in ${zone}`,
    };
  } else {
    const hold = location;
    const weight = delta;
    const indexAfter = getCargoIndex(hold, Math.abs(weight));
    const index = weight >= 0 ? indexAfter : -indexAfter;
    return {
      type: 'cargo',
      location: hold,
      delta: weight,
      weight,
      index,
      description: `${weight > 0 ? '+' : ''}${weight} kg in ${hold}`,
    };
  }
}

export default function LMCPanel() {
  const {
    lmcItems, lmcPanelOpen, toggleLmcPanel,
    addLmcItem, removeLmcItem, clearLmc,
    aircraft, inputs,
  } = useCalculation();

  const [type, setType] = useState('pax');
  const [location, setLocation] = useState('OA');
  const [delta, setDelta] = useState('');
  const [error, setError] = useState('');

  if (!lmcPanelOpen) return null;

  const totalLmcWeight = lmcItems.reduce((s, i) => s + (i.weight || 0), 0);
  const pctLimit = Math.abs(totalLmcWeight) / LMC_LIMIT * 100;
  const overLimit = Math.abs(totalLmcWeight) > LMC_LIMIT;

  const paxLocations = ['OA', 'OB', 'OC', 'OD'];
  const cargoLocations = ['HOLD1', 'HOLD2', 'HOLD3', 'HOLD4'];

  const handleAdd = () => {
    setError('');
    const val = Number(delta);
    if (!val || isNaN(val)) {
      setError('Enter a valid number');
      return;
    }

    try {
      const entry = computeLmcEntry(type, location, val, aircraft, inputs.passengers);
      if (Math.abs(totalLmcWeight + entry.weight) > LMC_LIMIT) {
        setError(`Would exceed ±${LMC_LIMIT} kg limit`);
        return;
      }
      addLmcItem(entry);
      setDelta('');
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={toggleLmcPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 z-50 flex flex-col shadow-2xl"
        style={{ background: 'var(--svg-label-bg, #fff)' }}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <h2 className="text-[16px] font-bold heading">Last Minute Changes</h2>
          <button onClick={toggleLmcPanel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors">
            <svg className="w-5 h-5 muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* LMC Weight Bar */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold field-label uppercase tracking-wider">Total LMC</span>
            <Pill variant={overLimit ? 'red' : Math.abs(totalLmcWeight) > 300 ? 'amber' : 'green'}>
              {totalLmcWeight > 0 ? '+' : ''}{totalLmcWeight} kg
            </Pill>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(pctLimit, 100)}%`,
                marginLeft: totalLmcWeight < 0 ? `${Math.max(50 - pctLimit / 2, 0)}%` : '50%',
                background: overLimit ? '#ef4444' : pctLimit > 60 ? '#f59e0b' : '#10b981',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] muted font-mono">-{LMC_LIMIT} kg</span>
            <span className="text-[10px] muted font-mono">+{LMC_LIMIT} kg</span>
          </div>
        </div>

        {/* Add LMC Form */}
        <div className="px-5 py-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => { setType('pax'); setLocation('OA'); }}
              className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                type === 'pax' ? 'bg-mas-navy text-white' : 'live-panel heading'
              }`}
            >
              Passenger
            </button>
            <button
              onClick={() => { setType('cargo'); setLocation('HOLD1'); }}
              className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                type === 'cargo' ? 'bg-mas-navy text-white' : 'live-panel heading'
              }`}
            >
              Cargo
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[10px] font-bold field-label uppercase tracking-wider mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="field-input w-full px-3 py-2 text-[13px] font-semibold"
              >
                {(type === 'pax' ? paxLocations : cargoLocations).map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold field-label uppercase tracking-wider mb-1">
                {type === 'pax' ? 'Pax (+/-)' : 'Weight kg (+/-)'}
              </label>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                className="field-input w-full px-3 py-2 text-[13px] font-mono font-bold text-center"
                placeholder={type === 'pax' ? '+2 or -1' : '+50 or -100'}
              />
            </div>
          </div>

          {error && <p className="text-[12px] text-red-500 mb-2">{error}</p>}

          <button
            onClick={handleAdd}
            className="w-full py-2.5 rounded-lg bg-mas-navy text-white font-semibold text-[13px] transition-all hover:opacity-90"
          >
            Add Change
          </button>
        </div>

        {/* LMC Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {lmcItems.length === 0 ? (
            <p className="text-[13px] muted text-center py-4">No changes added yet.</p>
          ) : (
            lmcItems.map((item) => (
              <div key={item.id} className="live-panel p-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold heading">{item.description}</p>
                  <p className="text-[11px] muted">Idx: {item.index > 0 ? '+' : ''}{item.index}</p>
                </div>
                <button
                  onClick={() => removeLmcItem(item.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Clear All */}
        {lmcItems.length > 0 && (
          <div className="px-5 py-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <button
              onClick={clearLmc}
              className="w-full py-2.5 rounded-lg border border-red-200 text-red-500 font-semibold text-[13px] hover:bg-red-50 transition-all"
            >
              Clear All Changes
            </button>
          </div>
        )}
      </div>
    </>
  );
}
