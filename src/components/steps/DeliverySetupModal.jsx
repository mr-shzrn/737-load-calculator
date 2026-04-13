import React, { useState, useEffect } from 'react';
import { doiFromMac, loadDeliveryFromStorage } from '../../utils/deliveryMode.js';

export default function DeliverySetupModal({ registration, lemac, macLength, cargoTableSet, onSave, onClose }) {
  const saved = registration ? loadDeliveryFromStorage(registration) : null;

  const [manifest, setManifest]   = useState(saved?.manifest ?? '');
  const [zfw,      setZfw]        = useState(saved?.dow ?? '');
  const [mac,      setMac]        = useState(saved?.mac ?? '');
  const [doi,      setDoi]        = useState(saved?.doi ?? '');
  const [crew,     setCrew]       = useState(saved?.crew ?? 3);
  const [pax,      setPax]        = useState(saved?.pax ?? 4);
  const [doiAuto,  setDoiAuto]    = useState(false);
  const [cargo,    setCargo]      = useState({
    HOLD1: saved?.cargo?.HOLD1 ?? 0,
    HOLD2: saved?.cargo?.HOLD2 ?? 0,
    HOLD3: saved?.cargo?.HOLD3 ?? 0,
    HOLD4: saved?.cargo?.HOLD4 ?? 0,
  });
  const [error, setError] = useState('');

  // Auto-compute DOI when ZFW + MACZFW are both entered
  useEffect(() => {
    const z = Number(zfw);
    const m = Number(mac);
    const l = lemac || 628.0;
    const ml = macLength || 149.5;
    if (z > 0 && m > 0 && m < 50) {
      setDoi(doiFromMac(z, m, l, ml));
      setDoiAuto(true);
    } else {
      setDoiAuto(false);
    }
  }, [zfw, mac, lemac, macLength]);

  function handleSave() {
    const zfwN  = Number(zfw);
    const doiN  = Number(doi);
    const macN  = Number(mac);
    const crewN = Number(crew);
    const paxN  = Number(pax);

    if (!manifest.trim())        { setError('Manifest reference is required.'); return; }
    if (!zfwN || zfwN < 30000)  { setError('ZFW must be a valid weight (kg).'); return; }
    if (!macN || macN <= 0)     { setError('MACZFW % is required.'); return; }
    if (isNaN(doiN))            { setError('DOI / Index is required.'); return; }
    if (crewN < 1)              { setError('Baseline crew must be at least 1.'); return; }
    if (paxN < 0)               { setError('Baseline pax cannot be negative.'); return; }

    onSave({
      v: 2,
      reg: registration,
      manifest: manifest.trim(),
      dow: zfwN,
      doi: doiN,
      mac: macN,
      crew: crewN,
      pax: paxN,
      cargo: {
        HOLD1: Number(cargo.HOLD1) || 0,
        HOLD2: Number(cargo.HOLD2) || 0,
        HOLD3: Number(cargo.HOLD3) || 0,
        HOLD4: Number(cargo.HOLD4) || 0,
      },
      cargoTableSet: cargoTableSet || '737-max-8',
    });
  }

  const fieldCls = 'field-input w-full px-3 py-2.5 text-[14px] font-mono font-bold';
  const labelCls = 'block text-[10px] font-bold field-label uppercase tracking-wider mb-1';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="rounded-2xl shadow-2xl w-full max-w-sm p-6 my-4" style={{ background: 'var(--svg-label-bg, #fff)' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[16px] font-bold heading">Delivery Load Setup</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center muted" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] muted mb-1">{registration}</p>
          <p className="text-[11px] muted mb-5">Enter figures from the Boeing Flight Loading Manifest. ZFW and MACZFW lock the baseline — only crew count, pax count, cargo and fuel change per flight.</p>

          {/* Restore notice */}
          {saved && (
            <div className="rounded-lg px-3 py-2 mb-4 text-[11px]" style={{ background: 'rgba(0,51,102,0.07)', border: '1px solid rgba(0,51,102,0.2)' }}>
              <span className="font-bold heading">Saved: </span>
              <span className="muted">{saved.manifest} — ZFW {saved.dow?.toLocaleString()} kg</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Manifest ref */}
            <div>
              <label className={labelCls}>Manifest Reference</label>
              <input
                type="text"
                value={manifest}
                onChange={e => setManifest(e.target.value.toUpperCase())}
                className={fieldCls + ' uppercase'}
                placeholder="e.g. 1N715"
              />
            </div>

            {/* ZFW */}
            <div>
              <label className={labelCls}>Zero Fuel Weight — ZFW (kg)</label>
              <input
                type="number"
                value={zfw}
                onChange={e => setZfw(e.target.value)}
                className={fieldCls}
                placeholder="45501"
              />
              <p className="text-[10px] muted mt-1">Bottom of the manifest: "ZERO FUEL WT." figure.</p>
            </div>

            {/* MACZFW → auto DOI */}
            <div>
              <label className={labelCls}>MACZFW (%) <span className="normal-case font-normal">— auto-computes DOI</span></label>
              <input
                type="number"
                value={mac}
                step="0.01"
                onChange={e => setMac(e.target.value)}
                className={fieldCls}
                placeholder="14.97"
              />
              <p className="text-[10px] muted mt-1">CG % MAC printed on the manifest next to ZERO FUEL WT.</p>
            </div>

            {/* DOI */}
            <div>
              <label className={labelCls}>
                DOI / Index
                {doiAuto && <span className="ml-2 text-green-600 font-normal normal-case">auto-computed</span>}
              </label>
              <input
                type="number"
                value={doi}
                onChange={e => { setDoi(e.target.value); setDoiAuto(false); }}
                className={fieldCls}
                placeholder="36"
              />
            </div>

            {/* Baseline crew / pax */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Baseline Crew (QTY)</label>
                <input
                  type="number"
                  value={crew}
                  min={1}
                  onChange={e => setCrew(e.target.value)}
                  className={fieldCls + ' text-center'}
                />
                <p className="text-[10px] muted mt-1">Crew & Flightbags QTY.</p>
              </div>
              <div>
                <label className={labelCls}>Baseline Pax (QTY)</label>
                <input
                  type="number"
                  value={pax}
                  min={0}
                  onChange={e => setPax(e.target.value)}
                  className={fieldCls + ' text-center'}
                />
                <p className="text-[10px] muted mt-1">Passengers QTY.</p>
              </div>
            </div>

            {/* Manifest cargo */}
            <div>
              <label className={labelCls}>Manifest Cargo — baked into ZFW</label>
              <p className="text-[10px] muted mb-2">Enter exactly as shown on the manifest. Leave at 0 if no cargo in that hold.</p>
              <div className="grid grid-cols-2 gap-2">
                {['HOLD1', 'HOLD2', 'HOLD3', 'HOLD4'].map((hold, i) => (
                  <div key={hold} className="flex items-center gap-1.5">
                    <span className="text-[11px] muted font-semibold w-10">H{i + 1}</span>
                    <input
                      type="number"
                      value={cargo[hold]}
                      min={0}
                      onChange={e => setCargo(prev => ({ ...prev, [hold]: e.target.value }))}
                      className="field-input flex-1 px-2 py-2 text-center font-mono text-[13px]"
                      placeholder="0"
                    />
                    <span className="text-[10px] muted">kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-[12px] font-semibold" style={{ color: '#b91c1c' }}>{error}</p>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border font-semibold text-[14px] muted" style={{ borderColor: 'rgba(0,0,0,0.12)' }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl font-semibold text-[14px] text-white"
              style={{ background: '#003366' }}
            >
              Lock Delivery Load
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
