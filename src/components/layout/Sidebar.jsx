import React, { useState } from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { useDarkMode } from '../../hooks/useDarkMode.js';
import Pill from '../shared/Pill.jsx';

const STEPS = [
  { step: 1, label: 'Aircraft' },
  { step: 2, label: 'DOW / DOI' },
  { step: 3, label: 'Passengers' },
  { step: 4, label: 'Cargo' },
  { step: 5, label: 'Fuel' },
  { step: 6, label: 'Results' },
];

function fmt(n) {
  return n != null ? n.toLocaleString() : '---';
}

function ResetConfirmModal({ onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="rounded-2xl shadow-2xl p-6 w-72" style={{ background: 'var(--svg-label-bg, #fff)' }}>
          <h3 className="text-[15px] font-bold heading mb-2">Start New Calculation?</h3>
          <p className="text-[13px] muted mb-5">This will clear all entries including passengers, cargo and fuel.</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border font-semibold text-[13px] muted"
              style={{ borderColor: 'rgba(0,0,0,0.12)' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] text-white"
              style={{ background: '#cc0033' }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { currentStep, goToStep, inputs, aircraft, results, lmcItems, toggleLmcPanel, resetAll } = useCalculation();
  const [isDark, toggleDark] = useDarkMode();
  const [showReset, setShowReset] = useState(false);

  const totalPax = Object.values(inputs.passengers).reduce((s, v) => s + (v || 0), 0);
  const hasDow = inputs.dow !== '' && inputs.dow != null;
  const hasDoi = inputs.doi !== '' && inputs.doi != null;

  // Step availability: each step requires the previous to have minimum data
  function isStepAvailable(step) {
    if (step <= 1) return true;
    if (step <= 2) return !!inputs.aircraftId;
    if (step <= 3) return !!inputs.aircraftId && hasDow && hasDoi;
    return true; // Cargo, fuel, results are always accessible
  }

  return (
    <aside className="sidebar w-64 flex-shrink-0 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-[14px] leading-tight">737 Load & Trim</p>
          <p className="text-white/40 text-[10px]">MH Flight Ops</p>
        </div>
      </div>

      {/* Step Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {STEPS.map(({ step, label }) => {
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          const available = isStepAvailable(step);
          let cls = 'sidebar-step';
          if (isActive) cls += ' active';
          else if (isDone) cls += ' done';

          return (
            <button
              key={step}
              onClick={() => available && goToStep(step)}
              disabled={!available}
              className={`${cls} w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left touch transition-all ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={!available ? 'Complete earlier steps first' : undefined}
            >
              <span className={`w-7 h-7 rounded-full ${isActive ? 'bg-white/20' : 'bg-white/10'} flex items-center justify-center text-[12px] font-bold`}>
                {isDone ? '✓' : step}
              </span>
              <span className="text-[13px] font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Live Summary */}
      <div className="px-4 py-4 border-t border-white/10 space-y-2.5">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Live Summary</p>
        {inputs.registration && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/60">Reg</span>
            <Pill variant="white" size="sm">{inputs.registration}</Pill>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-white/60">Variant</span>
          <Pill variant="white" size="sm">{inputs.aircraftId}</Pill>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-white/60">Pax</span>
          <Pill variant="white" size="sm">{totalPax} pax</Pill>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-white/60">ZFW</span>
          <Pill variant="white" size="sm">{results ? fmt(results.weights.finalZfw) : '---'} kg</Pill>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-white/60">TOW</span>
          <Pill variant="white" size="sm">{results ? fmt(results.weights.tow) : '---'} kg</Pill>
        </div>
      </div>

      {/* LMC Button */}
      <div className="px-4 py-2 border-t border-white/10">
        <button
          onClick={toggleLmcPanel}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all hover:bg-white/5"
          style={{ background: lmcItems.length > 0 ? 'rgba(245,158,11,0.15)' : 'transparent' }}
        >
          <span className={`text-[12px] font-semibold ${lmcItems.length > 0 ? 'text-amber-300' : 'text-white/60'}`}>
            LMC
          </span>
          <Pill variant={lmcItems.length > 0 ? 'amber' : 'white'} size="sm">
            {lmcItems.length > 0 ? `${lmcItems.length} items` : 'None'}
          </Pill>
        </button>
      </div>

      {/* Reset Button */}
      <div className="px-4 py-2 border-t border-white/10">
        <button
          onClick={() => setShowReset(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
        >
          <span className="text-[12px] font-semibold">New Calculation</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Dark Mode Toggle */}
      <div className="px-4 py-3 border-t border-white/10">
        <button
          onClick={toggleDark}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/5 transition-all"
        >
          <span className="text-[12px] font-semibold">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          {isDark ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>

      {showReset && (
        <ResetConfirmModal
          onConfirm={() => { resetAll(); setShowReset(false); }}
          onCancel={() => setShowReset(false)}
        />
      )}
    </aside>
  );
}
