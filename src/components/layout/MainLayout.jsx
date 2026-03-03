import React, { useEffect, useRef, createContext, useContext } from 'react';
import { useCalculation } from '../../context/CalculationContext.jsx';
import { useSessionHistory } from '../../hooks/useSessionHistory.js';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import Step1Aircraft from '../steps/Step1Aircraft.jsx';
import Step2DowDoi from '../steps/Step2DowDoi.jsx';
import Step3Passengers from '../steps/Step3Passengers.jsx';
import Step4Cargo from '../steps/Step4Cargo.jsx';
import Step5Fuel from '../steps/Step5Fuel.jsx';
import Step6Results from '../steps/Step6Results.jsx';
import LMCPanel from '../LMCPanel.jsx';

export const HistoryContext = createContext({ history: [], addEntry: () => {}, clearHistory: () => {} });

export function useHistory() {
  return useContext(HistoryContext);
}

export default function MainLayout() {
  const { currentStep, inputs, results } = useCalculation();
  const { history, addEntry, clearHistory } = useSessionHistory();
  const savedStep6Ref = useRef(null);

  // Auto-save to history when user first lands on Step 6 with valid results
  useEffect(() => {
    if (currentStep === 6 && results && results.weights.tow !== savedStep6Ref.current) {
      savedStep6Ref.current = results.weights.tow;
      addEntry(inputs, results);
    }
  }, [currentStep, results, inputs, addEntry]);

  return (
    <HistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      <div className="min-h-screen font-sans flex flex-col">
        <div className="mas-stripe" />
        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 3px)' }}>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="main-area min-h-full p-6">
                {currentStep === 1 && <Step1Aircraft />}
                {currentStep === 2 && <Step2DowDoi />}
                {currentStep === 3 && <Step3Passengers />}
                {currentStep === 4 && <Step4Cargo />}
                {currentStep === 5 && <Step5Fuel />}
                {currentStep === 6 && <Step6Results />}
              </div>
            </div>
            <Footer />
          </div>
        </div>
        <LMCPanel />
      </div>
    </HistoryContext.Provider>
  );
}
