import React from 'react';
import { CalculationProvider } from './context/CalculationContext.jsx';
import MainLayout from './components/layout/MainLayout.jsx';

function App() {
  return (
    <CalculationProvider>
      <MainLayout />
    </CalculationProvider>
  );
}

export default App;
