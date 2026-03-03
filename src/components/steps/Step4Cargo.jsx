import React from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import Pill from '../shared/Pill.jsx';
import NumericInput from '../shared/NumericInput.jsx';

const HOLDS = [
  { id: 'HOLD1', label: 'Hold 1 — Forward', max: 888 },
  { id: 'HOLD2', label: 'Hold 2 — Forward', max: 2670 },
  { id: 'HOLD3', label: 'Hold 3 — Aft', max: 3157 },
  { id: 'HOLD4', label: 'Hold 4 — Bulk', max: 474 },
];

function fmt(n) {
  return n != null ? n.toLocaleString() : '---';
}

export default function Step4Cargo() {
  const { inputs, setCargo } = useCalculation();
  const cargo = inputs.cargo;
  const totalCargo = Object.values(cargo).reduce((s, v) => s + (v || 0), 0);

  return (
    <div className="fade-in max-w-xl">
      <h2 className="text-xl font-bold heading mb-1">Cargo Loading</h2>
      <p className="text-[14px] muted mb-6">Weight per hold compartment.</p>

      <div className="space-y-3">
        {HOLDS.map(({ id, label, max }) => {
          const weight = cargo[id] || 0;
          const pct = max > 0 ? Math.round((weight / max) * 100) : 0;
          const pillVariant = pct > 80 ? 'red' : pct > 60 ? 'amber' : 'navy';

          return (
            <div key={id} className="live-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-bold heading">{label}</span>
                <Pill variant={pillVariant}>{pct}%</Pill>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <NumericInput
                  value={cargo[id] || 0}
                  min={0}
                  max={max}
                  step={50}
                  onChange={(v) => setCargo(id, v)}
                  className="flex-1"
                />
                <span className="text-[11px] muted font-mono w-20 text-right">/ {fmt(max)} kg</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 live-panel p-4 flex items-center justify-between">
        <span className="text-[14px] font-semibold heading">Total Cargo</span>
        <Pill variant="navy" size="xl">{fmt(totalCargo)} kg</Pill>
      </div>
    </div>
  );
}
