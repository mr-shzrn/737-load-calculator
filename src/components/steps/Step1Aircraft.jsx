import React, { useState } from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { useHistory } from '../layout/MainLayout.jsx';
import { AIRCRAFT_VARIANTS } from '../../data/aircraftData.js';
import { TRAINING_SCENARIOS } from '../../data/trainingScenarios.js';
import Pill from '../shared/Pill.jsx';

const DIFFICULTY_COLORS = {
  Beginner: 'green',
  Intermediate: 'amber',
  Advanced: 'red',
};

function fmt(n) {
  return n != null ? n.toLocaleString() : '---';
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}

export default function Step1Aircraft() {
  const { inputs, aircraft, setAircraftId, restoreInputs, goToStep } = useCalculation();
  const { history, clearHistory } = useHistory();
  const [showScenarios, setShowScenarios] = useState(false);

  function handleRecall(entry) {
    restoreInputs(entry.inputs, entry.lmcItems || []);
    goToStep(6);
  }

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

      {/* Session History */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold field-label uppercase tracking-wider">Recent Calculations</h3>
            <button onClick={clearHistory} className="text-[11px] muted underline">Clear</button>
          </div>
          <div className="space-y-2">
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleRecall(entry)}
                className="w-full live-panel p-3 text-left hover:shadow-md transition-all rounded-xl flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-bold heading truncate">{entry.aircraftId}</span>
                    {entry.registration && (
                      <Pill variant="navy" size="sm">{entry.registration}</Pill>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] muted">
                    <span>TOW {fmt(entry.tow)} kg</span>
                    <span>·</span>
                    <span>ZFW {fmt(entry.zfw)} kg</span>
                    <span>·</span>
                    <span>MACTOW {entry.tomac}%</span>
                  </div>
                  <span className="text-[10px] muted">{fmtDate(entry.timestamp)}</span>
                </div>
                <svg className="w-4 h-4 muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
          <p className="text-[10px] muted mt-2 text-center">Tap to recall all inputs from a previous calculation</p>
        </div>
      )}

      {/* Training Scenarios */}
      <div className="mt-6">
        <button
          onClick={() => setShowScenarios(!showScenarios)}
          className="w-full live-panel px-4 py-3 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-mas-navy/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-mas-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold heading">Training Scenarios</span>
            <Pill variant="navy" size="sm">{TRAINING_SCENARIOS.length}</Pill>
          </div>
          <svg className={`w-4 h-4 muted transition-transform ${showScenarios ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {showScenarios && (
          <div className="mt-2 space-y-2">
            {TRAINING_SCENARIOS.map((sc) => (
              <div key={sc.id} className="live-panel p-4 rounded-xl">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-[13px] font-bold heading">{sc.title}</span>
                  <Pill variant={DIFFICULTY_COLORS[sc.difficulty] || 'navy'} size="sm">{sc.difficulty}</Pill>
                </div>
                <p className="text-[12px] muted mb-3">{sc.description}</p>
                {sc.reference.note && (
                  <p className="text-[11px] muted italic mb-3">{sc.reference.note}</p>
                )}
                <button
                  onClick={() => { restoreInputs(sc.inputs, []); goToStep(2); }}
                  className="w-full py-2 rounded-lg font-semibold text-[13px] text-white transition-all"
                  style={{ background: '#003366' }}
                >
                  Load Scenario
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
