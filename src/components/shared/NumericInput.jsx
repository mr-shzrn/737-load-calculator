import React from 'react';

/**
 * Touch-friendly numeric input with large +/- stepper buttons.
 * Designed for iPad use where native number spinners are tiny.
 */
export default function NumericInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder = '0',
  className = '',
}) {
  const numVal = value === '' || value == null ? '' : Number(value);

  function increment() {
    const current = numVal === '' ? 0 : numVal;
    const next = max != null ? Math.min(current + step, max) : current + step;
    onChange(next);
  }

  function decrement() {
    const current = numVal === '' ? 0 : numVal;
    const next = Math.max(current - step, min);
    onChange(next);
  }

  function handleChange(e) {
    if (e.target.value === '') {
      onChange(0);
      return;
    }
    const v = Number(e.target.value);
    if (isNaN(v)) return;
    if (max != null && v > max) return;
    if (v < min) return;
    onChange(v);
  }

  return (
    <div className={`flex items-stretch gap-0 rounded-xl overflow-hidden ${className}`} style={{ border: '1px solid var(--border-input, rgba(0,0,0,0.12))' }}>
      <button
        type="button"
        onClick={decrement}
        className="w-12 flex-shrink-0 flex items-center justify-center text-[20px] font-bold touch transition-all select-none"
        style={{ background: 'rgba(0,51,102,0.06)', color: 'var(--color-heading)' }}
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="number"
        value={numVal === 0 ? '' : numVal}
        onChange={handleChange}
        min={min}
        max={max}
        placeholder={placeholder}
        className="flex-1 px-2 py-3 text-xl font-mono font-bold text-center bg-transparent outline-none"
        style={{ color: 'var(--color-heading)', MozAppearance: 'textfield' }}
      />
      <button
        type="button"
        onClick={increment}
        className="w-12 flex-shrink-0 flex items-center justify-center text-[20px] font-bold touch transition-all select-none"
        style={{ background: 'rgba(0,51,102,0.06)', color: 'var(--color-heading)' }}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
