import React, { useState } from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { CG_ENVELOPE_737_800, CG_ENVELOPE_737_MAX_8 } from '../../data/trimCorrections.js';
import Pill from '../shared/Pill.jsx';

function fmt(n) {
  return n != null ? n.toLocaleString() : '---';
}

function CGEnvelope({ zfmac, tomac, zfw, tow, landingMac, landingWeight, aircraftType }) {
  const envelopeSet = aircraftType === '737-MAX-8' ? CG_ENVELOPE_737_MAX_8 : CG_ENVELOPE_737_800;
  const towEnvelope = envelopeSet.tow;
  const zfwEnvelope = envelopeSet.zfw;

  // Chart dimensions
  const pad = { top: 25, right: 40, bottom: 40, left: 62 };
  const w = 460, h = 320;
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const minMac = 8, maxMac = 40;
  const maxEnvWt = aircraftType === '737-MAX-8' ? 86000 : 84000;
  const minWt = 36000;

  const scaleX = (mac) => pad.left + ((mac - minMac) / (maxMac - minMac)) * innerW;
  const scaleY = (wt) => pad.top + ((maxEnvWt - wt) / (maxEnvWt - minWt)) * innerH;

  const buildPoly = (env) => {
    const fwd = env.map((p) => `${scaleX(p.forward)},${scaleY(p.weight)}`);
    const aft = [...env].reverse().map((p) => `${scaleX(p.aft)},${scaleY(p.weight)}`);
    return [...fwd, ...aft].join(' ');
  };
  const towPoly = buildPoly(towEnvelope);
  const zfwPoly = buildPoly(zfwEnvelope);

  const zfwX = scaleX(zfmac || 0);
  const zfwY = scaleY(zfw || 0);
  const towX = scaleX(tomac || 0);
  const towY = scaleY(tow || 0);
  const lwX = scaleX(landingMac || 0);
  const lwY = scaleY(landingWeight || 0);

  const macTicks = [10, 15, 20, 25, 30, 35];
  const wtStep = aircraftType === '737-MAX-8' ? 10000 : 5000;
  const wtTicks = [];
  for (let wt = 40000; wt <= maxEnvWt - 4000; wt += wtStep) wtTicks.push(wt);

  const chartBottom = h - pad.bottom;
  const chartRight = w - pad.right;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 340 }}>
      <defs>
        <linearGradient id="towFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003366" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#003366" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="zfwFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
        </linearGradient>
        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#b45309" />
        </marker>
      </defs>

      <rect x={pad.left} y={pad.top} width={innerW} height={innerH} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" rx="2" />

      {macTicks.map((m) => (
        <g key={`mac-${m}`}>
          <line x1={scaleX(m)} y1={pad.top} x2={scaleX(m)} y2={chartBottom} stroke="currentColor" strokeWidth="0.3" opacity="0.08" strokeDasharray="2,4" />
          <text x={scaleX(m)} y={chartBottom + 14} textAnchor="middle" fill="currentColor" opacity="0.45" fontSize="9" fontFamily="Roboto Mono">{m}</text>
        </g>
      ))}
      {wtTicks.map((wt) => (
        <g key={`wt-${wt}`}>
          <line x1={pad.left} y1={scaleY(wt)} x2={chartRight} y2={scaleY(wt)} stroke="currentColor" strokeWidth="0.3" opacity="0.08" strokeDasharray="2,4" />
          <text x={pad.left - 6} y={scaleY(wt) + 3} textAnchor="end" fill="currentColor" opacity="0.45" fontSize="9" fontFamily="Roboto Mono">{(wt / 1000)}K</text>
        </g>
      ))}

      <text x={w / 2} y={h - 4} textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="10" fontFamily="Inter" fontWeight="600">% MAC</text>
      <text x={12} y={h / 2} textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="10" fontFamily="Inter" fontWeight="600" transform={`rotate(-90, 12, ${h / 2})`}>Weight (kg)</text>

      <polygon points={towPoly} fill="url(#towFill)" stroke="#003366" strokeWidth="1.5" strokeOpacity="0.35" />
      <polygon points={zfwPoly} fill="url(#zfwFill)" stroke="#059669" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="4,2" />

      <text x={scaleX(14.5)} y={scaleY(maxEnvWt - 2000) + 12} fill="#003366" opacity="0.35" fontSize="8" fontFamily="Inter" fontWeight="600">FWD LIMIT</text>
      <text x={scaleX(31)} y={scaleY(maxEnvWt - 2000) + 12} fill="#003366" opacity="0.35" fontSize="8" fontFamily="Inter" fontWeight="600">AFT LIMIT</text>

      <text x={scaleX(35.5)} y={scaleY(48000)} fill="#003366" opacity="0.3" fontSize="8" fontFamily="Inter" fontWeight="600" textAnchor="end">TOW</text>
      <text x={scaleX(35.5)} y={scaleY(41000)} fill="#059669" opacity="0.3" fontSize="8" fontFamily="Inter" fontWeight="600" textAnchor="end">ZFW</text>

      {zfw && tow && (
        <line x1={zfwX} y1={zfwY} x2={towX} y2={towY} stroke="#6b7280" strokeWidth="1.2" strokeDasharray="5,3" />
      )}

      {zfw && (
        <>
          <line x1={zfwX - 10} y1={zfwY} x2={zfwX + 10} y2={zfwY} stroke="#059669" strokeWidth="0.6" opacity="0.4" />
          <line x1={zfwX} y1={zfwY - 10} x2={zfwX} y2={zfwY + 10} stroke="#059669" strokeWidth="0.6" opacity="0.4" />
          <circle cx={zfwX} cy={zfwY} r="10" fill="none" stroke="#059669" strokeWidth="1" opacity="0.25" />
          <circle cx={zfwX} cy={zfwY} r="5" fill="#059669" />
          <rect x={zfwX + 14} y={zfwY - 22} width={90} height={30} rx="5" fill="var(--svg-label-bg)" fillOpacity="0.9" stroke="#059669" strokeWidth="0.8" />
          <text x={zfwX + 18} y={zfwY - 10} fill="#059669" fontSize="9" fontFamily="Inter" fontWeight="700">ZFW</text>
          <text x={zfwX + 18} y={zfwY + 2} fill="#059669" fontSize="10" fontFamily="Roboto Mono" fontWeight="700">{zfmac}% / {fmt(zfw)}</text>
        </>
      )}

      {tow && (
        <>
          <line x1={towX - 10} y1={towY} x2={towX + 10} y2={towY} stroke="#003366" strokeWidth="0.6" opacity="0.4" />
          <line x1={towX} y1={towY - 10} x2={towX} y2={towY + 10} stroke="#003366" strokeWidth="0.6" opacity="0.4" />
          <circle cx={towX} cy={towY} r="10" fill="none" stroke="#003366" strokeWidth="1" opacity="0.25" />
          <circle cx={towX} cy={towY} r="5" fill="#003366" />
          <rect x={towX + 14} y={towY - 22} width={92} height={30} rx="5" fill="var(--svg-label-bg)" fillOpacity="0.9" stroke="#003366" strokeWidth="0.8" />
          <text x={towX + 18} y={towY - 10} fill="#003366" fontSize="9" fontFamily="Inter" fontWeight="700">TOW</text>
          <text x={towX + 18} y={towY + 2} fill="#003366" fontSize="10" fontFamily="Roboto Mono" fontWeight="700">{tomac}% / {fmt(tow)}</text>
        </>
      )}

      {tow && landingWeight && (
        <line x1={towX} y1={towY} x2={lwX} y2={lwY} stroke="#b45309" strokeWidth="1.5" strokeDasharray="6,3" markerEnd="url(#arrowhead)" />
      )}

      {landingWeight && (
        <>
          <line x1={lwX - 10} y1={lwY} x2={lwX + 10} y2={lwY} stroke="#b45309" strokeWidth="0.6" opacity="0.4" />
          <line x1={lwX} y1={lwY - 10} x2={lwX} y2={lwY + 10} stroke="#b45309" strokeWidth="0.6" opacity="0.4" />
          <circle cx={lwX} cy={lwY} r="10" fill="none" stroke="#b45309" strokeWidth="1" opacity="0.25" />
          <circle cx={lwX} cy={lwY} r="5" fill="#b45309" />
          <rect x={lwX + 14} y={lwY - 22} width={88} height={30} rx="5" fill="var(--svg-label-bg)" fillOpacity="0.9" stroke="#b45309" strokeWidth="0.8" />
          <text x={lwX + 18} y={lwY - 10} fill="#b45309" fontSize="9" fontFamily="Inter" fontWeight="700">LW</text>
          <text x={lwX + 18} y={lwY + 2} fill="#b45309" fontSize="10" fontFamily="Roboto Mono" fontWeight="700">{landingMac}% / {fmt(landingWeight)}</text>
        </>
      )}

      <g transform={`translate(${pad.left + 5}, ${pad.top + 8})`}>
        <rect width="90" height="50" rx="4" fill="var(--svg-label-bg)" fillOpacity="0.8" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
        <circle cx="10" cy="11" r="4" fill="#003366" />
        <text x="18" y="14" fill="currentColor" opacity="0.6" fontSize="8" fontFamily="Inter" fontWeight="500">TOW Envelope</text>
        <circle cx="10" cy="26" r="4" fill="#059669" />
        <text x="18" y="29" fill="currentColor" opacity="0.6" fontSize="8" fontFamily="Inter" fontWeight="500">ZFW Envelope</text>
        <line x1="5" y1="40" x2="15" y2="40" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3,2" />
        <text x="18" y="43" fill="currentColor" opacity="0.6" fontSize="8" fontFamily="Inter" fontWeight="500">Fuel Burn</text>
      </g>
    </svg>
  );
}

/** Compute actionable guidance for each limit exceedance */
function computeGuidance(results, aircraft) {
  if (!results || !aircraft) return [];
  const guidance = [];
  const { weights, cg } = results;

  // TOW exceedance
  const mtow = aircraft.weights.mtow;
  if (weights.tow > mtow) {
    const over = Math.ceil(weights.tow - mtow);
    guidance.push(`Reduce total load by ${over.toLocaleString()} kg to meet MTOW (${mtow.toLocaleString()} kg)`);
  }

  // ZFW exceedance
  const mzfw = aircraft.weights.mzfw;
  if (weights.finalZfw > mzfw) {
    const over = Math.ceil(weights.finalZfw - mzfw);
    guidance.push(`Reduce payload by ${over.toLocaleString()} kg to meet MZFW (${mzfw.toLocaleString()} kg)`);
  }

  // Landing weight exceedance
  const mlw = aircraft.weights.mlw;
  if (weights.landingWeight > mlw) {
    const over = Math.ceil(weights.landingWeight - mlw);
    guidance.push(`Reduce fuel or payload by ${over.toLocaleString()} kg to meet MLW (${mlw.toLocaleString()} kg)`);
  }

  // Forward CG
  if (cg.towFwdLmt != null && cg.tomac < cg.towFwdLmt) {
    guidance.push(`CG is forward of limit — shift cargo from HOLD 1/2 to HOLD 3/4, or move passengers aft`);
  }

  // Aft CG
  if (cg.towAftLmt != null && cg.tomac > cg.towAftLmt) {
    guidance.push(`CG is aft of limit — shift cargo from HOLD 3/4 to HOLD 1/2, or move passengers forward`);
  }

  return guidance;
}

function StepByStepExplanation({ results, inputs }) {
  const { weights, indices, passengers, cargo, fuel } = results;
  const dow = weights.dow;
  const doi = indices.doi;
  const IU_REF = 658.3, IU_SCALE = 40000, IU_OFFSET = 45;

  return (
    <div className="space-y-4 text-[12px]">
      <div className="rounded-xl p-4" style={{ background: 'rgba(0,51,102,0.04)', border: '1px solid rgba(0,51,102,0.1)' }}>
        <p className="font-bold heading mb-2">Step 1 — Zero Fuel Weight</p>
        <p className="muted font-mono">ZFW = DOW + Passengers + Cargo</p>
        <p className="muted font-mono mt-1">
          ZFW = {dow.toLocaleString()} + {passengers.totalWeight.toLocaleString()} + {cargo.totalWeight.toLocaleString()}
          {' '}= <span className="font-bold heading">{weights.finalZfw.toLocaleString()} kg</span>
        </p>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'rgba(0,51,102,0.04)', border: '1px solid rgba(0,51,102,0.1)' }}>
        <p className="font-bold heading mb-2">Step 2 — Zero Fuel Index (ZFI)</p>
        <p className="muted font-mono">ZFI = DOI + Σ(Zone Indices) + Σ(Hold Indices)</p>
        <p className="muted font-mono mt-1">
          ZFI = {doi} + ({indices.allPaxIndex.toFixed(1)}) + ({indices.allCargoIndex.toFixed(1)})
          {' '}= <span className="font-bold heading">{indices.finalZfi.toFixed(1)}</span>
        </p>
        <div className="mt-2 grid grid-cols-4 gap-1 text-center">
          {Object.entries(passengers.zones).map(([z, v]) => (
            <div key={z} className="rounded p-1" style={{ background: 'rgba(0,0,0,0.04)' }}>
              <span className="block muted">Zone {z}</span>
              <span className="font-mono font-bold heading">{v.index >= 0 ? '+' : ''}{v.index}</span>
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-4 gap-1 text-center">
          {Object.entries(cargo.holds).map(([h, v]) => (
            <div key={h} className="rounded p-1" style={{ background: 'rgba(0,0,0,0.04)' }}>
              <span className="block muted">{h.replace('HOLD', 'H')}</span>
              <span className="font-mono font-bold heading">{v.index >= 0 ? '+' : ''}{v.index}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'rgba(0,51,102,0.04)', border: '1px solid rgba(0,51,102,0.1)' }}>
        <p className="font-bold heading mb-2">Step 3 — CG at Zero Fuel (% MAC)</p>
        <p className="muted font-mono">Arm = ((ZFI − {IU_OFFSET}) × {IU_SCALE} / ZFW) + {IU_REF}</p>
        <p className="muted font-mono">%MAC = ((Arm − LEMAC) / 147.31) × 100</p>
        <p className="muted font-mono mt-1">
          MACZFW = <span className="font-bold heading">{results.cg.zfmac}%</span>
        </p>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'rgba(0,51,102,0.04)', border: '1px solid rgba(0,51,102,0.1)' }}>
        <p className="font-bold heading mb-2">Step 4 — Takeoff Weight & Index</p>
        <p className="muted font-mono">TOW = ZFW + TOF = {weights.finalZfw.toLocaleString()} + {fuel.total.toLocaleString()} = <span className="font-bold heading">{weights.tow.toLocaleString()} kg</span></p>
        <p className="muted font-mono mt-1">TOI = ZFI + Fuel Index = {indices.finalZfi.toFixed(1)} + {fuel.index} = <span className="font-bold heading">{indices.toi.toFixed(1)}</span></p>
        <p className="muted font-mono mt-1">MACTOW = <span className="font-bold heading">{results.cg.tomac}%</span></p>
      </div>
    </div>
  );
}

export default function Step6Results() {
  const { results, validation, aircraft, inputs, toggleLmcPanel } = useCalculation();
  const [showExplanation, setShowExplanation] = useState(false);

  if (!results) {
    return (
      <div className="fade-in max-w-xl">
        <h2 className="text-xl font-bold heading mb-1">Results</h2>
        <div className="live-panel p-6 text-center mt-4">
          <p className="text-[14px] muted">Enter DOW, DOI, and other data in previous steps to see results.</p>
        </div>
      </div>
    );
  }

  const { weights, cg, trim, passengers, cargo, fuel } = results;
  const allPass = validation?.allPass ?? true;
  const errors = validation?.errors || [];
  const guidance = !allPass ? computeGuidance(results, aircraft) : [];

  let trimDisplay = '---';
  let trimSubtitle = '';
  if (trim) {
    if (trim.finalTrim != null) {
      trimDisplay = trim.finalTrim.toFixed(1);
      trimSubtitle = `${trim.flaps} / ${trim.thrust}`;
    } else if (trim.message) {
      trimDisplay = 'FMC';
      trimSubtitle = trim.message;
    }
  }

  const limitLabel = { Z: 'MZFW', T: 'MTOW', L: 'MLW' }[weights.limitingFactor] || weights.limitingFactor;

  return (
    <div className="fade-in space-y-5">
      {/* Status Banner */}
      {allPass ? (
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-bold text-green-700">Within Limits</p>
            <p className="text-[12px] text-green-600/70">All weights and CG within operational envelope.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-red-700">Exceeds Limits</p>
            <ul className="text-[12px] text-red-600 mt-1 space-y-0.5">
              {errors.map((err, i) => <li key={i}>• {err}</li>)}
            </ul>
            {guidance.length > 0 && (
              <div className="mt-3 pt-2 border-t border-red-200">
                <p className="text-[11px] font-bold text-red-700 mb-1">How to fix:</p>
                <ul className="text-[11px] text-red-600 space-y-0.5">
                  {guidance.map((g, i) => <li key={i}>→ {g}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LMC quick access */}
      <button
        onClick={toggleLmcPanel}
        className="w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-amber-700">Add Last Minute Change (LMC)</span>
        <svg className="w-4 h-4 text-amber-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Key Results */}
      <div className="grid grid-cols-4 gap-3">
        <div className="live-panel p-4 text-center">
          <span className="text-[10px] font-bold field-label uppercase tracking-wider block mb-3">MACZFW</span>
          <Pill variant="green" size="xl">{cg.zfmac}%</Pill>
        </div>
        <div className="live-panel p-4 text-center">
          <span className="text-[10px] font-bold field-label uppercase tracking-wider block mb-3">MACTOW</span>
          <Pill variant="navy" size="xl">{cg.tomac}%</Pill>
        </div>
        <div className="live-panel p-4 text-center">
          <span className="text-[10px] font-bold field-label uppercase tracking-wider block mb-3">STAB</span>
          <Pill variant="green" size="xl">{trimDisplay}</Pill>
          {trimSubtitle && <span className="text-[11px] muted block mt-1.5">{trimSubtitle}</span>}
        </div>
        <div className="live-panel p-4 text-center">
          <span className="text-[10px] font-bold field-label uppercase tracking-wider block mb-3">LAW</span>
          <Pill variant="amber" size="xl">{fmt(weights.landingWeight)}</Pill>
          {weights.tripFuelEstimated && <span className="text-[10px] muted block mt-1.5">Est.</span>}
        </div>
      </div>

      {/* CG Limits: FWD-LMT / ACTL / AFT-LMT */}
      <div className="live-panel p-4">
        <div className="grid grid-cols-4 gap-2 mb-2 text-center">
          <span className="field-label text-[10px] font-bold uppercase tracking-wider text-left"></span>
          <span className="field-label text-[10px] font-bold uppercase tracking-wider">FWD-LMT</span>
          <span className="field-label text-[10px] font-bold uppercase tracking-wider">ACTL</span>
          <span className="field-label text-[10px] font-bold uppercase tracking-wider">AFT-LMT</span>
        </div>
        <div className="grid grid-cols-4 gap-2 items-center py-2 border-t divider-line text-center">
          <span className="heading font-bold text-[13px] text-left font-mono">MACZFW</span>
          <span className="muted text-[13px] font-mono">{cg.zfwFwdLmt ?? '---'}</span>
          <Pill variant="green">{cg.zfmac}%</Pill>
          <span className="muted text-[13px] font-mono">{cg.zfwAftLmt ?? '---'}</span>
        </div>
        <div className="grid grid-cols-4 gap-2 items-center py-2 border-t divider-line text-center">
          <span className="heading font-bold text-[13px] text-left font-mono">TOMAC</span>
          <span className="muted text-[13px] font-mono">{cg.towFwdLmt ?? '---'}</span>
          <Pill variant="navy">{cg.tomac}%</Pill>
          <span className="muted text-[13px] font-mono">{cg.towAftLmt ?? '---'}</span>
        </div>
      </div>

      {/* Weight Breakdown */}
      <div className="live-panel p-5">
        <h3 className="text-[11px] font-bold field-label uppercase tracking-wider mb-3">Weight Breakdown</h3>
        <div className="space-y-0">
          <div className="divider-line border-b flex items-center justify-between py-2.5">
            <span className="text-[14px]">Dry Operating Weight</span>
            <Pill variant="navy">{fmt(weights.dow)} kg</Pill>
          </div>
          <div className="divider-line border-b flex items-center justify-between py-2.5">
            <span className="text-[14px]">
              + Passengers ({passengers.totalAdultPax} × 77 kg
              {passengers.children > 0 && `, ${passengers.children} children × 35 kg`}
              {passengers.infants > 0 && `, ${passengers.infants} infants`})
            </span>
            <Pill variant="navy">{fmt(passengers.totalWeight)} kg</Pill>
          </div>
          <div className="divider-line border-b flex items-center justify-between py-2.5">
            <span className="text-[14px]">+ Cargo</span>
            <Pill variant="navy">{fmt(cargo.totalWeight)} kg</Pill>
          </div>
          <div className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg my-1" style={{ background: 'rgba(0,51,102,0.05)' }}>
            <span className="text-[14px] font-bold heading">ZFW (Zero Fuel Weight)</span>
            <Pill variant="navy" size="lg">{fmt(weights.finalZfw)} kg</Pill>
          </div>
          <div className="divider-line border-b flex items-center justify-between py-2.5">
            <span className="text-[14px]">+ TOF (Takeoff Fuel)</span>
            <Pill variant="navy">{fmt(fuel.total)} kg</Pill>
          </div>
          <div className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg mt-1" style={{ background: '#003366' }}>
            <span className="text-[14px] font-bold text-white">TOW (Takeoff Weight)</span>
            <span className="font-mono text-[20px] font-bold text-white">{fmt(weights.tow)} kg</span>
          </div>
          <div className="divider-line border-b flex items-center justify-between py-2.5 mt-1">
            <span className="text-[14px]">- TIF {weights.tripFuelEstimated ? '(est.)' : ''}</span>
            <Pill variant="navy">{fmt(weights.tripFuel)} kg</Pill>
          </div>
          <div className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg mt-1" style={{ background: '#b45309' }}>
            <span className="text-[14px] font-bold text-white">LAW (Landing Actual Weight)</span>
            <span className="font-mono text-[20px] font-bold text-white">{fmt(weights.landingWeight)} kg</span>
          </div>
          <div className="divider-line border-t flex items-center justify-between py-2.5 mt-1">
            <div>
              <span className="text-[14px] font-semibold heading">UNDLD</span>
              <span className="text-[11px] muted ml-1.5">— limiting: {limitLabel}</span>
              <p className="text-[10px] muted mt-0.5">Remaining payload capacity before hitting {limitLabel}</p>
            </div>
            <Pill variant={weights.undld < 0 ? 'red' : weights.undld < 1000 ? 'amber' : 'green'} size="lg">{fmt(weights.undld)} kg</Pill>
          </div>
        </div>
      </div>

      {/* CG Envelope */}
      <div className="live-panel p-5">
        <h3 className="text-[11px] font-bold field-label uppercase tracking-wider mb-3">CG Envelope</h3>
        {aircraft?.type === '737-MAX-8' && (
          <p className="text-[10px] muted mb-2">Note: MAX 8 CG envelope is estimated pending official LTS confirmation.</p>
        )}
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.02)' }}>
          <CGEnvelope
            zfmac={cg.zfmac}
            tomac={cg.tomac}
            zfw={weights.finalZfw}
            tow={weights.tow}
            landingMac={cg.landingMac}
            landingWeight={weights.landingWeight}
            aircraftType={aircraft?.type}
          />
        </div>
      </div>

      {/* Step-by-step Explanation */}
      <div className="live-panel">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex items-center justify-between p-5"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-mas-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636 6.364l.707-.707M12 20v1M7.05 7.05L6.343 6.343M17.657 6.343l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <span className="text-[13px] font-bold heading">Step-by-Step Explanation</span>
          </div>
          <svg className={`w-4 h-4 muted transition-transform ${showExplanation ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {showExplanation && (
          <div className="px-5 pb-5">
            <StepByStepExplanation results={results} inputs={inputs} />
          </div>
        )}
      </div>
    </div>
  );
}
