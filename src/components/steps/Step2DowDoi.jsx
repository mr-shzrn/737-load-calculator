import React from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import Pill from '../shared/Pill.jsx';

export default function Step2DowDoi() {
  const { inputs, setDow, setDoi } = useCalculation();

  return (
    <div className="fade-in max-w-xl">
      <h2 className="text-xl font-bold heading mb-1">Dry Operating Weight</h2>
      <p className="text-[14px] muted mb-6">Enter DOW and DOI from aircraft loadsheet.</p>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
            DOW (kg)
          </label>
          <input
            type="number"
            value={inputs.dow ?? ''}
            onChange={(e) => setDow(e.target.value ? Number(e.target.value) : null)}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder="44565"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold field-label uppercase tracking-wider mb-1.5">
            DOI (Index)
          </label>
          <input
            type="number"
            value={inputs.doi ?? ''}
            onChange={(e) => setDoi(e.target.value ? Number(e.target.value) : null)}
            className="field-input w-full px-4 py-3.5 text-xl font-mono font-bold text-center touch"
            placeholder="48"
          />
        </div>
      </div>

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
