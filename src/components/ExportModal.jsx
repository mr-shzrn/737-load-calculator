import React, { useState } from 'react';
import { useCalculation } from '../context/CalculationContext.jsx';
import { generateLoadsheetPDF } from '../utils/pdfExport.js';

export default function ExportModal({ onClose }) {
  const { results, validation, inputs } = useCalculation();

  // Flight header
  const [flightNumber, setFlightNumber] = useState('');
  const [registration, setRegistration] = useState('9M-');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [crew, setCrew] = useState('2/4');

  // Personnel
  const [preparer, setPreparer] = useState('');
  const [licence, setLicence] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [staffId, setStaffId] = useState('');
  const [picName, setPicName] = useState('');

  const handleExport = () => {
    generateLoadsheetPDF(results, validation, inputs, {
      flightNumber: flightNumber || undefined,
      registration: registration || undefined,
      date,
      departure: departure.toUpperCase() || undefined,
      arrival: arrival.toUpperCase() || undefined,
      crew: crew || undefined,
      preparer: preparer || undefined,
      licence: licence || undefined,
      supervisor: supervisor || undefined,
      staffId: staffId || undefined,
      picName: picName || undefined,
    });
    onClose();
  };

  const fieldClass = 'field-input w-full px-3 py-2.5 text-[13px] font-semibold';
  const labelClass = 'block text-[10px] font-bold field-label uppercase tracking-wider mb-1';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4" style={{ background: 'var(--svg-label-bg, #fff)' }}>
          <h2 className="text-[16px] font-bold heading mb-1">Export Loadsheet PDF</h2>
          <p className="text-[11px] muted mb-4">Fill in flight details for the ACARS-format loadsheet.</p>

          {/* ── FLIGHT INFO ── */}
          <p className="text-[10px] font-bold uppercase tracking-widest muted mb-2 mt-3">Flight Information</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Flight No.</label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className={fieldClass}
                  placeholder="MH 123"
                />
              </div>
              <div>
                <label className={labelClass}>Registration</label>
                <input
                  type="text"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                  className={fieldClass}
                  placeholder="9M-MXA"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>From (ICAO/IATA)</label>
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value.toUpperCase())}
                  className={`${fieldClass} uppercase`}
                  placeholder="KUL"
                  maxLength={4}
                />
              </div>
              <div>
                <label className={labelClass}>To (ICAO/IATA)</label>
                <input
                  type="text"
                  value={arrival}
                  onChange={(e) => setArrival(e.target.value.toUpperCase())}
                  className={`${fieldClass} uppercase`}
                  placeholder="SIN"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Crew (Flt Deck / Cabin)</label>
                <input
                  type="text"
                  value={crew}
                  onChange={(e) => setCrew(e.target.value)}
                  className={fieldClass}
                  placeholder="2/4"
                />
              </div>
            </div>
          </div>

          {/* ── PERSONNEL ── */}
          <p className="text-[10px] font-bold uppercase tracking-widest muted mb-2 mt-5">Personnel</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Prepared By (Loadmaster)</label>
                <input
                  type="text"
                  value={preparer}
                  onChange={(e) => setPreparer(e.target.value)}
                  className={fieldClass}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className={labelClass}>Licence No.</label>
                <input
                  type="text"
                  value={licence}
                  onChange={(e) => setLicence(e.target.value)}
                  className={fieldClass}
                  placeholder="LM-12345"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Loading Supervisor</label>
                <input
                  type="text"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className={fieldClass}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className={labelClass}>Staff ID</label>
                <input
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className={fieldClass}
                  placeholder="MH-00000"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>PIC Name (Captain)</label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className={fieldClass}
                placeholder="Full name"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-[14px] muted transition-all hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex-1 py-3 rounded-xl font-semibold text-[14px] text-white transition-all"
              style={{ background: '#003366' }}
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
