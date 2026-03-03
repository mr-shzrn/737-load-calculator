import { useState, useCallback } from 'react';

const STORAGE_KEY = '737calc_history';
const MAX_ENTRIES = 5;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function save(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (_) { /* ignore */ }
}

export function useSessionHistory() {
  const [history, setHistory] = useState(load);

  const addEntry = useCallback((inputs, results) => {
    if (!results) return;
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      aircraftId: inputs.aircraftId,
      registration: inputs.registration || '',
      tow: results.weights.tow,
      zfw: results.weights.finalZfw,
      tomac: results.cg.tomac,
      inputs,
      lmcItems: [],
    };
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      save(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
