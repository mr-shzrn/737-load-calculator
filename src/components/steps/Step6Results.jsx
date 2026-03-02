import React from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { CG_ENVELOPE_737_800 } from '../../data/trimCorrections.js';
import Pill from '../shared/Pill.jsx';

function fmt(n) {
  return n != null ? n.toLocaleString() : '---';
}

function CGEnvelope({ zfmac, tomac, zfw, tow, landingMac, landingWeight }) {
  const towEnvelope = CG_ENVELOPE_737_800.tow;
  const zfwEnvelope = CG_ENVELOPE_737_800.zfw;

  // Chart dimensions — taller for more detail
  const pad = { top: 25, right: 40, bottom: 40, left: 62 };
  const w = 460, h = 320;
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  // Data ranges
  const minMac = 8, maxMac = 40;
  const minWt = 36000, maxWt = 84000;

  const scaleX = (mac) => pad.left + ((mac - minMac) / (maxMac - minMac)) * innerW;
  const scaleY = (wt) => pad.top + ((maxWt - wt) / (maxWt - minWt)) * innerH;

  // Build envelope polygon
  const buildPoly = (env) => {
    const fwd = env.map((p) => `${scaleX(p.forward)},${scaleY(p.weight)}`);
    const aft = [...env].reverse().map((p) => `${scaleX(p.aft)},${scaleY(p.weight)}`);
    return [...fwd, ...aft].join(' ');
  };
  const towPoly = buildPoly(towEnvelope);
  const zfwPoly = buildPoly(zfwEnvelope);

  // Plot points
  const zfwX = scaleX(zfmac || 0);
  const zfwY = scaleY(zfw || 0);
  const towX = scaleX(tomac || 0);
  const towY = scaleY(tow || 0);
  const lwX = scaleX(landingMac || 0);
  const lwY = scaleY(landingWeight || 0);

  // Grid ticks
  const macTicks = [10, 15, 20, 25, 30, 35];
  const wtTicks = [40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000];

  // Axis labels
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

      {/* Chart border */}
      <rect x={pad.left} y={pad.top} width={innerW} height={innerH} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" rx="2" />

      {/* Grid lines */}
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

      {/* Axis titles */}
      <text x={w / 2} y={h - 4} textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="10" fontFamily="Inter" fontWeight="600">% MAC</text>
      <text x={12} y={h / 2} textAnchor="middle" fill="currentColor" opacity="0.5" fontSize="10" fontFamily="Inter" fontWeight="600" transform={`rotate(-90, 12, ${h / 2})`}>Weight (kg)</text>

      {/* TOW Envelope */}
      <polygon points={towPoly} fill="url(#towFill)" stroke="#003366" strokeWidth="1.5" strokeOpacity="0.35" />

      {/* ZFW Envelope */}
      <polygon points={zfwPoly} fill="url(#zfwFill)" stroke="#059669" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="4,2" />

      {/* Forward / Aft limit labels */}
      <text x={scaleX(14.5)} y={scaleY(80000) + 12} fill="#003366" opacity="0.35" fontSize="8" fontFamily="Inter" fontWeight="600">FWD LIMIT</text>
      <text x={scaleX(31)} y={scaleY(80000) + 12} fill="#003366" opacity="0.35" fontSize="8" fontFamily="Inter" fontWeight="600">AFT LIMIT</text>

      {/* Envelope labels */}
      <text x={scaleX(35.5)} y={scaleY(48000)} fill="#003366" opacity="0.3" fontSize="8" fontFamily="Inter" fontWeight="600" textAnchor="end">TOW</text>
      <text x={scaleX(35.5)} y={scaleY(41000)} fill="#059669" opacity="0.3" fontSize="8" fontFamily="Inter" fontWeight="600" textAnchor="end">ZFW</text>

      {/* Connecting line ZFW → TOW */}
      {zfw && tow && (
        <line x1={zfwX} y1={zfwY} x2={towX} y2={towY} stroke="#6b7280" strokeWidth="1.2" strokeDasharray="5,3" />
      )}

      {/* ZFW point */}
      {zfw && (
        <>
          {/* Crosshair */}
          <line x1={zfwX - 10} y1={zfwY} x2={zfwX + 10} y2={zfwY} stroke="#059669" strokeWidth="0.6" opacity="0.4" />
          <line x1={zfwX} y1={zfwY - 10} x2={zfwX} y2={zfwY + 10} stroke="#059669" strokeWidth="0.6" opacity="0.4" />
          {/* Outer ring */}
          <circle cx={zfwX} cy={zfwY} r="10" fill="none" stroke="#059669" strokeWidth="1" opacity="0.25" />
          {/* Inner dot */}
          <circle cx={zfwX} cy={zfwY} r="5" fill="#059669" />
          {/* Label with background */}
          <rect x={zfwX + 14} y={zfwY - 22} width={90} height={30} rx="5" fill="var(--svg-label-bg)" fillOpacity="0.9" stroke="#059669" strokeWidth="0.8" />
          <text x={zfwX + 18} y={zfwY - 10} fill="#059669" fontSize="9" fontFamily="Inter" fontWeight="700">ZFW</text>
          <text x={zfwX + 18} y={zfwY + 2} fill="#059669" fontSize="10" fontFamily="Roboto Mono" fontWeight="700">{zfmac}% / {fmt(zfw)}</text>
        </>
      )}

      {/* TOW point */}
      {tow && (
        <>
          {/* Crosshair */}
          <line x1={towX - 10} y1={towY} x2={towX + 10} y2={towY} stroke="#003366" strokeWidth="0.6" opacity="0.4" />
          <line x1={towX} y1={towY - 10} x2={towX} y2={towY + 10} stroke="#003366" strokeWidth="0.6" opacity="0.4" />
          {/* Outer ring */}
          <circle cx={towX} cy={towY} r="10" fill="none" stroke="#003366" strokeWidth="1" opacity="0.25" />
          {/* Inner dot */}
          <circle cx={towX} cy={towY} r="5" fill="#003366" />
          {/* Label with background */}
          <rect x={towX + 14} y={towY - 22} width={92} height={30} rx="5" fill="var(--svg-label-bg)" fillOpacity="0.9" stroke="#003366" strokeWidth="0.8" />
          <text x={towX + 18} y={towY - 10} fill="#003366" fontSize="9" fontFamily="Inter" fontWeight="700">TOW</text>
          <text x={towX + 18} y={towY + 2} fill="#003366" fontSize="10" fontFamily="Roboto Mono" fontWeight="700">{tomac}% / {fmt(tow)}</text>
        </>
      )}

      {/* Fuel burn trajectory TOW → LW */}
      {tow && landingWeight && (
        <line x1={towX} y1={towY} x2={lwX} y2={lwY} stroke="#b45309" strokeWidth="1.5" strokeDasharray="6,3" markerEnd="url(#arrowhead)" />
      )}

      {/* Landing Weight point */}
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

      {/* Legend */}
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

export default function Step6Results() {
  const { results, validation } = useCalculation();

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

  // Trim display
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
          <div>
            <p className="text-[14px] font-bold text-red-700">Exceeds Limits</p>
            <ul className="text-[12px] text-red-600 mt-1 space-y-0.5">
              {errors.map((err, i) => <li key={i}>• {err}</li>)}
            </ul>
          </div>
        </div>
      )}

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
            <span className="text-[14px]">+ Passengers ({passengers.totalPax} × 77 kg)</span>
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
            <span className="text-[14px] font-semibold heading">UNDLD <span className="text-[11px] muted font-normal">(Underload — limiting: {weights.limitingFactor})</span></span>
            <Pill variant={weights.undld < 0 ? 'red' : weights.undld < 1000 ? 'amber' : 'green'} size="lg">{fmt(weights.undld)} kg</Pill>
          </div>
        </div>
      </div>

      {/* CG Envelope */}
      <div className="live-panel p-5">
        <h3 className="text-[11px] font-bold field-label uppercase tracking-wider mb-3">CG Envelope</h3>
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.02)' }}>
          <CGEnvelope
            zfmac={cg.zfmac}
            tomac={cg.tomac}
            zfw={weights.finalZfw}
            tow={weights.tow}
            landingMac={cg.landingMac}
            landingWeight={weights.landingWeight}
          />
        </div>
      </div>
    </div>
  );
}
