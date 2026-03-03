import React, { useState } from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import Pill from '../shared/Pill.jsx';

// Typical DOW/DOI values per aircraft variant (from typical W&B reports)
// These are hints only; operator must verify from actual aircraft W&B manual.
const DOW_DOI_HINTS = {
  '738-MS-16BC': { dow: 43850, doi: 46 },
  '738-MS-12BC': { dow: 43780, doi: 45 },
  '738-MX-16BC': { dow: 44565, doi: 48 },
  '738-MX-12BC': { dow: 44495, doi: 47 },
  '738-ML-16BC': { dow: 44600, doi: 48 },
  '738-ML-12BC': { dow: 44530, doi: 47 },
  '738-FF':      { dow: 44610, doi: 49 },
  '73M8':        { dow: 46320, doi: 52 },
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

export default function Step2DowDoi() {
  const { inputs, aircraft, setDow, setDoi, setRegistration } = useCalculation();
  const hint = DOW_DOI_HINTS[inputs.aircraftId];

  return (
    <div className="fade-in max-w-xl">
      <h2 className="text-xl font-bold heading mb-1">Basic Weights</h2>
      <p className="text-[14px] muted mb-6">Enter aircraft registration, DOW and DOI from the W&B manual.</p>

      {/* Registration */}
      <div className="mb-5">
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
          Aircraft Registration
        </label>
        <input
          type="text"
          value={inputs.registration || ''}
          onChange={(e) => setRegistration(e.target.value.toUpperCase())}
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
            onChange={(e) => setDow(e.target.value ? Number(e.target.value) : '')}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder={hint ? hint.dow.toString() : '44565'}
          />
          {hint && (
            <p className="text-[10px] muted mt-1 text-center">
              Typical: {hint.dow.toLocaleString()} kg
              {inputs.dow === '' && (
                <button
                  onClick={() => setDow(hint.dow)}
                  className="ml-2 underline text-mas-navy"
                >
                  Use
                </button>
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
            onChange={(e) => setDoi(e.target.value ? Number(e.target.value) : '')}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder={hint ? hint.doi.toString() : '48'}
          />
          {hint && (
            <p className="text-[10px] muted mt-1 text-center">
              Typical: {hint.doi}
              {inputs.doi === '' && (
                <button
                  onClick={() => setDoi(hint.doi)}
                  className="ml-2 underline text-mas-navy"
                >
                  Use
                </button>
              )}
            </p>
          )}
        </div>
      </div>

      {hint && (
        <div className="mt-3 rounded-lg px-4 py-2.5 text-[11px] muted" style={{ background: 'rgba(0,51,102,0.04)', border: '1px solid rgba(0,51,102,0.08)' }}>
          Typical values shown are estimates for the selected variant. Always verify against the actual aircraft W&B report.
        </div>
      )}

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
