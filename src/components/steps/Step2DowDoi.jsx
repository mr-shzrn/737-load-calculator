import React, { useState, useEffect } from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { useAircraftRegistry } from '../../hooks/useAircraftRegistry.js';
import { MAX_8_PANTRY_OPTIONS, MAX_8_CREW_CONFIGS } from '../../data/maxRegistrations.js';
import { loadDeliveryFromStorage } from '../../utils/deliveryMode.js';
import Pill from '../shared/Pill.jsx';
import DeliverySetupModal from './DeliverySetupModal.jsx';
import DeliveryScanner from './DeliveryScanner.jsx';
import DeliveryQRCode from './DeliveryQRCode.jsx';

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
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)} onBlur={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="ml-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center border"
        style={{ color: 'var(--color-muted)', borderColor: 'var(--color-muted)', lineHeight: 1 }}
        aria-label="Help"
      >?</button>
      {show && (
        <div className="absolute z-50 left-6 top-0 rounded-xl shadow-xl p-3 w-64 text-[12px]"
          style={{ background: 'var(--svg-label-bg)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--color-heading)' }}>
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
  return n >= 0 ? `+${Math.abs(n).toFixed(decimals)}` : `−${Math.abs(n).toFixed(decimals)}`;
}

// ── Stepper (±1) ─────────────────────────────────────────────────────────────
function StepperInput({ value, onChange, min = -99, label, unit = '' }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] heading font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg text-lg font-bold flex items-center justify-center"
          style={{ background: 'rgba(0,51,102,0.12)', color: 'rgba(0,51,102,0.8)' }}>−</button>
        <span className="w-8 text-center font-mono font-bold text-[15px] heading">
          {value >= 0 ? `+${value}` : value}
        </span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg text-lg font-bold flex items-center justify-center"
          style={{ background: 'rgba(0,51,102,0.12)', color: 'rgba(0,51,102,0.8)' }}>+</button>
        {unit && <span className="text-[11px] muted w-8">{unit}</span>}
      </div>
    </div>
  );
}

// ── MAX 8 path ────────────────────────────────────────────────────────────────
function Max8DowDoi() {
  const {
    inputs, setRegistration, setCrewConfig, setPantryType,
    setDow, setDoi, setDeliveryLoad, setDeliveryAdjustment, exitDeliveryMode,
  } = useCalculation();
  const registrations = useAircraftRegistry();

  const [manualOverride, setManualOverride] = useState(false);
  const [showSetup,      setShowSetup]      = useState(false);
  const [showScanner,    setShowScanner]    = useState(false);

  const selectedReg    = registrations.find(r => r.reg === inputs.registration) || null;
  const selectedCrew   = MAX_8_CREW_CONFIGS.find(c => c.id === inputs.crewConfig) || null;
  const selectedPantry = MAX_8_PANTRY_OPTIONS.find(p => p.id === inputs.pantryType) || null;
  const allSelected    = selectedReg && selectedCrew && selectedPantry;
  const savedDelivery  = inputs.registration ? loadDeliveryFromStorage(inputs.registration) : null;

  const computedDow    = allSelected ? selectedReg.bew + selectedCrew.weight + selectedPantry.weight : null;
  const computedDoiRaw = allSelected ? selectedReg.bew_iu + selectedCrew.index + selectedPantry.index : null;
  const computedDoi    = computedDoiRaw != null ? Math.round(computedDoiRaw) : null;

  useEffect(() => {
    if (!manualOverride && computedDow != null && computedDoi != null && !inputs.deliveryMode) {
      setDow(computedDow);
      setDoi(computedDoi);
    }
  }, [computedDow, computedDoi, manualOverride, inputs.deliveryMode]);

  function handleRegChange(e) {
    setRegistration(e.target.value);
    setCrewConfig('');
    setPantryType('');
    if (!manualOverride) { setDow(''); setDoi(''); }
  }

  function handleScanResult(data) {
    setShowScanner(false);
    setDeliveryLoad(data);
  }

  function handleSetupSave(data) {
    setShowSetup(false);
    setDeliveryLoad(data);
  }

  // ── Delivery mode: locked panel ──────────────────────────────────────────
  if (inputs.deliveryMode && inputs.deliveryData) {
    const dd         = inputs.deliveryData;
    const extraCrew  = inputs.deliveryExtraCrew ?? 0;
    const extraPax   = inputs.deliveryExtraPax  ?? 0;
    const bagKg      = inputs.deliveryBagKg     ?? 15;
    const crewWtDelta = extraCrew * (85 + bagKg);
    const paxWtDelta  = extraPax  * (77 + bagKg);
    const totalWtDelta = crewWtDelta + paxWtDelta;
    const iuDelta = (crewWtDelta * (44.0 - 658.3) / 40000)
                  + (paxWtDelta  * (550.0 - 658.3) / 40000);
    const update = (ec, ep, bk) => setDeliveryAdjustment(ec, ep, bk);

    return (
      <div className="space-y-5">
        {/* Registration display */}
        <div className="text-center">
          <p className="text-[11px] font-bold field-label uppercase tracking-wider mb-1">Aircraft Registration</p>
          <p className="text-2xl font-mono font-bold heading">{dd.reg || inputs.registration}</p>
        </div>

        {/* Locked panel */}
        <div className="rounded-xl px-5 py-4 space-y-4" style={{ background: 'rgba(0,51,102,0.07)', border: '1.5px solid rgba(0,51,102,0.25)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(0,51,102,0.7)' }}>
                DELIVERY LOAD LOCKED
              </div>
              <div className="text-[10px] muted mt-0.5">{dd.manifest}</div>
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,51,102,0.12)' }}>
              <svg className="w-4 h-4" style={{ color: 'rgba(0,51,102,0.7)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Baseline summary */}
          <div className="text-[11px] muted">
            Manifest baseline: <span className="font-semibold heading">{dd.crew} flight crew · {dd.pax} pax · ZFW {dd.dow?.toLocaleString()} kg</span>
          </div>

          {/* Per-flight adjustments */}
          <div className="space-y-3 pt-1">
            <StepperInput label="Extra flight crew" value={extraCrew} min={-dd.crew} onChange={v => update(v, extraPax, bagKg)} />
            <StepperInput label="Extra pax / observers" value={extraPax} min={-dd.pax} onChange={v => update(extraCrew, v, bagKg)} />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] heading font-medium">Bag weight / person</span>
              <div className="flex items-center gap-1">
                <input
                  type="number" value={bagKg} min={0} max={50}
                  onChange={e => update(extraCrew, extraPax, Math.max(0, Number(e.target.value) || 0))}
                  className="field-input w-16 px-2 py-1.5 text-center font-mono text-[13px]"
                />
                <span className="text-[11px] muted">kg</span>
              </div>
            </div>
          </div>

          {/* Delta summary */}
          {totalWtDelta !== 0 && (
            <div className="rounded-lg px-3 py-2 text-[11px]" style={{ background: 'rgba(0,51,102,0.06)', border: '1px solid rgba(0,51,102,0.15)' }}>
              <div className="flex justify-between">
                <span className="muted">Weight delta</span>
                <span className="font-mono font-bold heading">{totalWtDelta >= 0 ? '+' : ''}{totalWtDelta} kg</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="muted">Index delta</span>
                <span className="font-mono font-bold heading">{iuDelta >= 0 ? '+' : ''}{iuDelta.toFixed(2)} IU</span>
              </div>
              <div className="text-[10px] muted mt-1">Crew at cockpit arm (44 in) · Pax at cabin arm (550 in)</div>
            </div>
          )}

          {/* Effective DOW / DOI */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="text-center">
              <div className="text-[10px] font-bold field-label uppercase tracking-wider mb-1">DOW (ZFW)</div>
              <div className="text-2xl font-mono font-bold heading">{inputs.dow?.toLocaleString()} kg</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold field-label uppercase tracking-wider mb-1">DOI (ZFI)</div>
              <div className="text-2xl font-mono font-bold heading">{inputs.doi}</div>
            </div>
          </div>

          {/* QR code */}
          <DeliveryQRCode deliveryData={dd} collapsed={true} />

          <div className="text-center pt-1">
            <button type="button" onClick={exitDeliveryMode} className="text-[11px] underline muted">
              Exit delivery mode
            </button>
          </div>
        </div>

        {/* Scanner modal */}
        {showScanner && (
          <DeliveryScanner
            expectedReg={inputs.registration}
            onScan={handleScanResult}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    );
  }

  // ── Normal (non-delivery) flow ───────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Registration */}
      <div>
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">Aircraft Registration</label>
        <select value={inputs.registration || ''} onChange={handleRegChange} className="field-input w-full px-4 py-3.5 text-base">
          <option value="">— Select registration —</option>
          {registrations.map(r => <option key={r.reg} value={r.reg}>{r.reg}</option>)}
        </select>
        {selectedReg && (
          <p className="text-[11px] muted mt-1.5 font-mono text-center">
            BEW: {fmt(selectedReg.bew)} kg &nbsp;·&nbsp; BEW IU: {selectedReg.bew_iu.toFixed(2)}
          </p>
        )}
        {selectedReg?.temp && (
          <div className="mt-2 rounded-lg px-4 py-2.5 text-[11px]" style={{ background: 'rgba(200,80,0,0.08)', border: '1px solid rgba(200,80,0,0.35)', color: 'rgba(180,60,0,0.9)' }}>
            <strong>TEMP DATA — FERRY USE ONLY.</strong> BEW IU estimated from Boeing delivery manifest. Verify against MAS Aircraft Weighing Report before scheduled ops.
          </div>
        )}
      </div>

      {/* Delivery entry buttons (only when reg selected) */}
      {selectedReg && (
        <div className="space-y-2">
          {/* Scan QR */}
          <button type="button" onClick={() => setShowScanner(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-bold"
            style={{ background: 'rgba(0,51,102,0.08)', border: '1.5px dashed rgba(0,51,102,0.35)', color: 'rgba(0,51,102,0.85)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            SCAN DELIVERY QR
          </button>

          {/* Restore from localStorage */}
          {savedDelivery && (
            <button type="button" onClick={() => setDeliveryLoad(savedDelivery)}
              className="w-full rounded-lg px-4 py-2.5 text-[12px] font-bold text-center"
              style={{ background: 'rgba(5,150,105,0.09)', border: '1.5px solid rgba(5,150,105,0.35)', color: 'rgba(4,120,87,0.9)' }}>
              RESTORE — {savedDelivery.manifest} · ZFW {savedDelivery.dow?.toLocaleString()} kg
            </button>
          )}

          {/* Enter new delivery */}
          <button type="button" onClick={() => setShowSetup(true)}
            className="w-full rounded-lg px-4 py-2.5 text-[12px] font-bold text-center"
            style={{ background: 'rgba(0,51,102,0.06)', border: '1px solid rgba(0,51,102,0.18)', color: 'rgba(0,51,102,0.7)' }}>
            {savedDelivery ? 'ENTER NEW DELIVERY LOAD' : 'ENTER DELIVERY LOAD'}
          </button>
        </div>
      )}

      {/* Crew Config */}
      <div>
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">Crew Configuration</label>
        <select value={inputs.crewConfig || ''} onChange={e => setCrewConfig(e.target.value)} className="field-input w-full px-4 py-3.5 text-base">
          <option value="">— Select crew —</option>
          {MAX_8_CREW_CONFIGS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        {selectedCrew && (
          <p className="text-[11px] muted mt-1.5 font-mono text-center">
            +{fmt(selectedCrew.weight)} kg &nbsp;·&nbsp; {signedFmt(selectedCrew.index)} IU
          </p>
        )}
      </div>

      {/* Pantry Type */}
      <div>
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">Pantry Type</label>
        <select value={inputs.pantryType || ''} onChange={e => setPantryType(e.target.value)} className="field-input w-full px-4 py-3.5 text-base">
          <option value="">— Select pantry —</option>
          {MAX_8_PANTRY_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label} ({p.weight} kg)</option>)}
        </select>
        {selectedPantry && (
          <p className="text-[11px] muted mt-1.5 font-mono text-center">
            +{fmt(selectedPantry.weight)} kg &nbsp;·&nbsp; {signedFmt(selectedPantry.index)} IU
          </p>
        )}
      </div>

      {/* Computed DOW/DOI */}
      {allSelected && !manualOverride && (
        <div className="rounded-xl px-5 py-4" style={{ background: 'rgba(0,51,102,0.05)', border: '1.5px solid rgba(0,51,102,0.15)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-[10px] font-bold field-label uppercase tracking-wider mb-1">DOW</div>
              <div className="text-2xl font-mono font-bold heading">{fmt(computedDow)} kg</div>
              <div className="text-[10px] muted mt-0.5">BEW {fmt(selectedReg.bew)} + Crew {fmt(selectedCrew.weight)} + Pantry {fmt(selectedPantry.weight)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold field-label uppercase tracking-wider mb-1">DOI</div>
              <div className="text-2xl font-mono font-bold heading">{computedDoi}</div>
              <div className="text-[10px] muted mt-0.5">{selectedReg.bew_iu.toFixed(2)} {signedFmt(selectedCrew.index)} {signedFmt(selectedPantry.index)} = {computedDoiRaw.toFixed(2)} → {computedDoi}</div>
            </div>
          </div>
        </div>
      )}

      {/* Manual override toggle */}
      <div className="flex items-center gap-2">
        <button type="button"
          onClick={() => { setManualOverride(v => !v); if (manualOverride && allSelected) { setDow(computedDow); setDoi(computedDoi); } }}
          className="text-[11px] underline muted">
          {manualOverride ? 'Use auto-computed DOW/DOI' : 'Override DOW/DOI manually'}
        </button>
      </div>

      {/* Manual entry */}
      {(manualOverride || !allSelected) && (
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5 flex items-center">
              DOW (kg)
              <HelpIcon tooltip="Dry Operating Weight. Auto-computed from BEW + crew + pantry when all selectors are filled." />
            </label>
            <input type="number" value={inputs.dow ?? ''} onChange={e => setDow(e.target.value ? Number(e.target.value) : '')}
              className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch" placeholder="44674" />
          </div>
          <div>
            <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5 flex items-center">
              DOI (Index)
              <HelpIcon tooltip="Dry Operating Index. Auto-computed from BEW IU + crew IU + pantry IU, rounded to nearest integer." />
            </label>
            <input type="number" value={inputs.doi ?? ''} onChange={e => setDoi(e.target.value ? Number(e.target.value) : '')}
              className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch" placeholder="37" />
          </div>
        </div>
      )}

      <div className="rounded-lg px-4 py-2.5 text-[11px] muted" style={{ background: 'rgba(0,51,102,0.04)', border: '1px solid rgba(0,51,102,0.08)' }}>
        Cabin crew index delta is currently set to 0 (TBD — pending CG Manual sourcing). Tech crew confirmed from LTS Tool V1.
      </div>

      {/* Modals */}
      {showSetup && (
        <DeliverySetupModal
          registration={inputs.registration}
          onSave={handleSetupSave}
          onClose={() => setShowSetup(false)}
        />
      )}
      {showScanner && (
        <DeliveryScanner
          expectedReg={inputs.registration}
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

// ── 737-800 path ──────────────────────────────────────────────────────────────
function B738DowDoi() {
  const { inputs, aircraft, setDow, setDoi, setRegistration } = useCalculation();
  const hint = DOW_DOI_HINTS[inputs.aircraftId];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">Aircraft Registration</label>
        <input type="text" value={inputs.registration || ''} onChange={e => setRegistration(e.target.value.toUpperCase())}
          className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch uppercase"
          placeholder="9M-MXA" maxLength={7} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5 flex items-center">
            DOW (kg)
            <HelpIcon tooltip="Dry Operating Weight — the aircraft's basic weight including crew, catering, and equipment. Found in your aircraft's Weight & Balance Report." />
          </label>
          <input type="number" value={inputs.dow ?? ''} onChange={e => setDow(e.target.value ? Number(e.target.value) : '')}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder={hint ? hint.dow.toString() : '44565'} />
          {hint && (
            <p className="text-[10px] muted mt-1 text-center">
              Typical: {hint.dow.toLocaleString()} kg
              {inputs.dow === '' && <button onClick={() => setDow(hint.dow)} className="ml-2 underline text-mas-navy">Use</button>}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5 flex items-center">
            DOI (Index)
            <HelpIcon tooltip="Dry Operating Index — found in the same W&B Report alongside DOW." />
          </label>
          <input type="number" value={inputs.doi ?? ''} onChange={e => setDoi(e.target.value ? Number(e.target.value) : '')}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder={hint ? hint.doi.toString() : '48'} />
          {hint && (
            <p className="text-[10px] muted mt-1 text-center">
              Typical: {hint.doi}
              {inputs.doi === '' && <button onClick={() => setDoi(hint.doi)} className="ml-2 underline text-mas-navy">Use</button>}
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
          ? 'Select registration, crew, and pantry to auto-compute DOW/DOI. For delivery flights, scan QR or enter manifest figures.'
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
