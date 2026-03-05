import { useState, useEffect } from 'react';
import { MAX_8_REGISTRATIONS } from '../data/maxRegistrations.js';

// Fetches /max8_registry.json at runtime; falls back to seed data if offline or fetch fails.
// To add a new registration: edit public/max8_registry.json, commit, and deploy.
// All PWA clients auto-update on next network load via service worker cache refresh.
export function useAircraftRegistry() {
  const [registrations, setRegistrations] = useState(MAX_8_REGISTRATIONS);

  useEffect(() => {
    let cancelled = false;
    fetch('/max8_registry.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (!cancelled && Array.isArray(data?.registrations) && data.registrations.length > 0) {
          setRegistrations(data.registrations);
        }
      })
      .catch(() => { /* stay on seed data */ });
    return () => { cancelled = true; };
  }, []);

  return registrations;
}
