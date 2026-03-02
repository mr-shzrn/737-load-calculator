import React, { useState } from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import ExportModal from '../ExportModal.jsx';

export default function Footer() {
  const { currentStep, nextStep, prevStep } = useCalculation();
  const [showExport, setShowExport] = useState(false);

  return (
    <>
      <div className="footer-area px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="touch px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-[14px] muted transition-all disabled:opacity-30"
        >
          ← Previous
        </button>
        <span className="text-[12px] font-semibold muted">
          Step {currentStep} of 6
        </span>
        <button
          onClick={currentStep === 6 ? () => setShowExport(true) : nextStep}
          className="touch px-6 py-3 rounded-xl font-semibold text-[14px] text-white transition-all"
          style={{ background: '#003366' }}
        >
          {currentStep === 6 ? 'Export PDF ↓' : 'Next →'}
        </button>
      </div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  );
}
