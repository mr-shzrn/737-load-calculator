import React, { useState, useEffect } from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { useAircraftRegistry } from '../../hooks/useAircraftRegistry.js';
import { MAX_8_PANTRY_OPTIONS, MAX_8_CREW_CONFIGS } from '../../data/maxRegistrations.js';
import Pill from '../shared/Pill.jsx';

// Typical DOW/DOI hints for 737-800 variants (estimates only; verify from actual W&B report)
const DOW_DOI_HINTS = {
  '738-MS-16BC': { dow: 43850, doi: 46 },
  '738-MS-12BC': { dow: 43780, doi: 45 },
  '738-MX-16BC': { dow: 44565, doi: 48 },
  '738-MX-12BC': { dow: 44495, doi: 47 },
  '738-ML-16BC': { dow: 44600, doi: 48 },
  '738-ML-12BC': { dow: 44530, doi: 47 },
  '738-FF':      { dow: 44610, doi: 49 },
};

function HelpIcon({ tooltip }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="ml-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center border"
        style={{ color: 'var(--color-muted)', borderColor: 'var(--color-muted)', lineHeight: 1 }}
        aria-label="Help"
      >
        ?
      </button>
      {show && (
        <div
          className="absolute z-50 left-6 top-0 rounded-xl shadow-xl p-3 w-64 text-[12px]"
          style={{ background: 'var(--svg-label-bg)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--color-heading)' }}
        >
          {tooltip}
        </div>
      )}
    </span>
  );
}

function fmt(n, decimals) {
  if (n == null) return '—';
  if (decimals != null) return n.toFixed(decimals);
  return n.toLocaleString();
}

function signedFmt(n, decimals = 2) {
  if (n == null) return '—';
  const s = Math.abs(n).toFixed(decimals);
  return n >= 0 ? `+${s}` : `−${s}`;
}

// ── MAX 8 path ──────────────────────────────────────────────────────────────

function Max8DowDoi() {
  const { inputs, setRegistration, setCrewConfig, setPantryType, setDow, setDoi } = useCalculation();
  const registrations = useAircraftRegistry();

  const [manualOverride, setManualOverride] = useState(false);

  const selectedReg    = registrations.find(r => r.reg === inputs.registration) || null;
  const selectedCrew   = MAX_8_CREW_CONFIGS.find(c => c.id === inputs.crewConfig) || null;
  const selectedPantry = MAX_8_PANTRY_OPTIONS.find(p => p.id === inputs.pantryType) || null;

  const allSelected = selectedReg && selectedCrew && selectedPantry;

  const computedDow = allSelected
    ? selectedReg.bew + selectedCrew.weight + selectedPantry.weight
    : null;

  const computedDoiRaw = allSelected
    ? selectedReg.bew_iu + selectedCrew.index + selectedPantry.index
    : null;

  const computedDoi = computedDoiRaw != null ? Math.round(computedDoiRaw) : null;

  // Auto-populate DOW/DOI whenever computed values change (unless user is in manual override)
  useEffect(() => {
    if (!manualOverride && computedDow != null && computedDoi != null) {
      setDow(computedDow);
      setDoi(computedDoi);
    }
  }, [computedDow, computedDoi, manualOverride]);

  function handleRegChange(e) {
    const reg = e.target.value;
    setRegistration(reg);
    // Reset crew/pantry when registration changes to avoid stale DOW/DOI
    setCrewConfig('');
    setPantryType('');
    if (!manualOverride) {
      setDow('');
      setDoi('');
    }
  }

  return (
    <div className="space-y-5">

      {/* Registration */}
      <div>
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
          Aircraft Registration
        </label>
        <select
          value={inputs.registration || ''}
          onChange={handleRegChange}
          className="field-input w-full px-4 py-3.5 text-base"
        >
          <option value="">— Select registration —</option>
          {registrations.map(r => (
            <option key={r.reg} value={r.reg}>{r.reg}</option>
          ))}
        </select>
        {selectedReg && (
          <p className="text-[11px] muted mt-1.5 font-mono text-center">
            BEW: {fmt(selectedReg.bew)} kg &nbsp;·&nbsp; BEW IU: {selectedReg.bew_iu.toFixed(2)}
          </p>
        )}
      </div>

      {/* Crew Config */}
      <div>
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
          Crew Configuration
        </label>
        <select
          value={inputs.crewConfig || ''}
          onChange={e => setCrewConfig(e.target.value)}
          className="field-input w-full px-4 py-3.5 text-base"
        >
          <option value="">— Select crew —</option>
          {MAX_8_CREW_CONFIGS.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        {selectedCrew && (
          <p className="text-[11px] muted mt-1.5 font-mono text-center">
            +{fmt(selectedCrew.weight)} kg &nbsp;·&nbsp; {signedFmt(selectedCrew.index)} IU
          </p>
        )}
      </div>

      {/* Pantry Type */}
      <div>
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
          Pantry Type
        </label>
        <select
          value={inputs.pantryType || ''}
          onChange={e => setPantryType(e.target.value)}
          className="field-input w-full px-4 py-3.5 text-base"
        >
          <option value="">— Select pantry —</option>
          {MAX_8_PANTRY_OPTIONS.map(p => (
            <option key={p.id} value={p.id}>{p.label} ({p.weight} kg)</option>
          ))}
        </select>
        {selectedPantry && (
          <p className="text-[11px] muted mt-1.5 font-mono text-center">
            +{fmt(selectedPantry.weight)} kg &nbsp;·&nbsp; {signedFmt(selectedPantry.index)} IU
          </p>
        )}
      </div>

      {/* Computed DOW/DOI panel */}
      {allSelected && !manualOverride && (
        <div
          className="rounded-xl px-5 py-4"
          style={{ background: 'rgba(0,51,102,0.05)', border: '1.5px solid rgba(0,51,102,0.15)' }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-[10px] font-bold field-label uppercase tracking-wider mb-1">DOW</div>
              <div className="text-2xl font-mono font-bold heading">{fmt(computedDow)} kg</div>
              <div className="text-[10px] muted mt-0.5">
                BEW {fmt(selectedReg.bew)} + Crew {fmt(selectedCrew.weight)} + Pantry {fmt(selectedPantry.weight)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold field-label uppercase tracking-wider mb-1">DOI</div>
              <div className="text-2xl font-mono font-bold heading">{computedDoi}</div>
              <div className="text-[10px] muted mt-0.5">
                {selectedReg.bew_iu.toFixed(2)} {signedFmt(selectedCrew.index)} {signedFmt(selectedPantry.index)} = {computedDoiRaw.toFixed(2)} → {computedDoi}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual override toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setManualOverride(v => !v);
            if (manualOverride && allSelected) {
              // Re-apply computed values when turning override off
              setDow(computedDow);
              setDoi(computedDoi);
            }
          }}
          className="text-[11px] underline muted"
        >
          {manualOverride ? 'Use auto-computed DOW/DOI' : 'Override DOW/DOI manually'}
        </button>
      </div>

      {/* Manual entry fields — shown when override is on, or when not all selectors are filled */}
      {(manualOverride || !allSelected) && (
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5 flex items-center">
              DOW (kg)
              <HelpIcon tooltip="Dry Operating Weight. Auto-computed from BEW + crew + pantry when all selectors are filled. Override here if needed." />
            </label>
            <input
              type="number"
              value={inputs.dow ?? ''}
              onChange={e => setDow(e.target.value ? Number(e.target.value) : '')}
              className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
              placeholder="44674"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5 flex items-center">
              DOI (Index)
              <HelpIcon tooltip="Dry Operating Index. Auto-computed from BEW IU + crew IU + pantry IU, rounded to nearest integer." />
            </label>
            <input
              type="number"
              value={inputs.doi ?? ''}
              onChange={e => setDoi(e.target.value ? Number(e.target.value) : '')}
              className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
              placeholder="37"
            />
          </div>
        </div>
      )}

      <div className="rounded-lg px-4 py-2.5 text-[11px] muted" style={{ background: 'rgba(0,51,102,0.04)', border: '1px solid rgba(0,51,102,0.08)' }}>
        Cabin crew index delta is currently set to 0 (TBD — pending CG Manual sourcing). Tech crew confirmed from LTS Tool V1.
      </div>
    </div>
  );
}

// ── 737-800 path ─────────────────────────────────────────────────────────────

function B738DowDoi() {
  const { inputs, aircraft, setDow, setDoi, setRegistration } = useCalculation();
  const hint = DOW_DOI_HINTS[inputs.aircraftId];

  return (
    <div className="space-y-5">
      {/* Registration */}
      <div>
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
          Aircraft Registration
        </label>
        <input
          type="text"
          value={inputs.registration || ''}
          onChange={e => setRegistration(e.target.value.toUpperCase())}
          className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch uppercase"
          placeholder="9M-MXA"
          maxLength={7}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5 flex items-center">
            DOW (kg)
            <HelpIcon tooltip="Dry Operating Weight — the aircraft's basic weight including crew, catering, and equipment. Found in your aircraft's Weight & Balance Report (Column 'DOW')." />
          </label>
          <input
            type="number"
            value={inputs.dow ?? ''}
            onChange={e => setDow(e.target.value ? Number(e.target.value) : '')}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder={hint ? hint.dow.toString() : '44565'}
          />
          {hint && (
            <p className="text-[10px] muted mt-1 text-center">
              Typical: {hint.dow.toLocaleString()} kg
              {inputs.dow === '' && (
                <button onClick={() => setDow(hint.dow)} className="ml-2 underline text-mas-navy">Use</button>
              )}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5 flex items-center">
            DOI (Index)
            <HelpIcon tooltip="Dry Operating Index — the aircraft's balance index at DOW. Found in the same W&B Report alongside DOW (Column 'DOI' or 'Index')." />
          </label>
          <input
            type="number"
            value={inputs.doi ?? ''}
            onChange={e => setDoi(e.target.value ? Number(e.target.value) : '')}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder={hint ? hint.doi.toString() : '48'}
          />
          {hint && (
            <p className="text-[10px] muted mt-1 text-center">
              Typical: {hint.doi}
              {inputs.doi === '' && (
                <button onClick={() => setDoi(hint.doi)} className="ml-2 underline text-mas-navy">Use</button>
              )}
            </p>
          )}
        </div>
      </div>

      {hint && (
        <div className="rounded-lg px-4 py-2.5 text-[11px] muted" style={{ background: 'rgba(0,51,102,0.04)', border: '1px solid rgba(0,51,102,0.08)' }}>
          Typical values shown are estimates for the selected variant. Always verify against the actual aircraft W&B report.
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function Step2DowDoi() {
  const { aircraft, inputs } = useCalculation();
  const isMax8 = aircraft?.type === '737-MAX-8';

  return (
    <div className="fade-in max-w-xl">
      <h2 className="text-xl font-bold heading mb-1">Basic Weights</h2>
      <p className="text-[14px] muted mb-6">
        {isMax8
          ? 'Select registration, crew, and pantry to auto-compute DOW/DOI.'
          : 'Enter aircraft registration, DOW and DOI from the W&B manual.'}
      </p>

      {isMax8 ? <Max8DowDoi /> : <B738DowDoi />}

      <div className="mt-6 live-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold heading">LMC Correction</span>
          <Pill variant="green">±0 kg</Pill>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div className="h-full bg-green-500 rounded-full" style={{ width: '50%', marginLeft: '25%' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] muted font-mono">-500 kg</span>
          <span className="text-[10px] muted font-mono">+500 kg</span>
        </div>
      </div>
    </div>
  );
}
