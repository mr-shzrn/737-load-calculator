import { jsPDF } from 'jspdf';
import { getAircraftById } from '../data/aircraftData.js';

// Pad string to fixed width (left-aligned)
function padR(str, len) {
  return String(str ?? '').padEnd(len).slice(0, len);
}

// Pad string right-aligned
function padL(str, len) {
  return String(str ?? '').padStart(len).slice(-len);
}

// Format number with no commas for ACARS style
function n(val) {
  return val != null ? Math.round(val).toString() : '----';
}

// Format decimal (1dp)
function d1(val) {
  return val != null ? Number(val).toFixed(1) : '---';
}

export function generateLoadsheetPDF(results, validation, inputs, flightInfo = {}) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const lm = 15;   // left margin
  const W = 180;   // content width
  let y = 8;

  // MAS stripe at top
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, pageW * 0.65, 4, 'F');
  doc.setFillColor(204, 0, 51);
  doc.rect(pageW * 0.65, 0, pageW * 0.35, 4, 'F');

  // ── Use Courier for authentic ACARS monospace look ──
  const setMono = (size = 9, style = 'normal') => {
    doc.setFont('courier', style);
    doc.setFontSize(size);
    doc.setTextColor(20, 20, 20);
  };

  const setLabel = (size = 7) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(100, 100, 100);
  };

  const line = (text, xOffset = 0) => {
    doc.text(text, lm + xOffset, y);
    y += 4.5;
  };

  const hr = () => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(lm, y - 1, pageW - lm, y - 1);
    y += 1.5;
  };

  const blankLine = () => { y += 2; };

  // ────────────────────────────────────────────
  // HEADER
  // ────────────────────────────────────────────
  y = 12;
  setMono(8, 'bold');
  const reg = flightInfo.registration || '9M-???';
  const dep = flightInfo.departure || '???';
  const arr = flightInfo.arrival || '???';
  const flightNum = flightInfo.flightNumber || '----';
  const dateStr = flightInfo.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '').toUpperCase();
  const timeStr = new Date().toISOString().slice(11, 16).replace(':', '') + 'Z';

  // Item 1 — Reference
  line(`AN ${reg}/FI ${flightNum}/MA ---`);
  // Item 2 — Loadsheet type
  setMono(8);
  line(`- LOADSHEET FINAL ${new Date().toISOString().slice(11, 15).replace(':', '')} EDN01`);
  // Item 3 — Flight / Date
  setMono(8, 'bold');
  line(`${flightNum}    ${dateStr}`);
  // Item 4 — Sector / Reg / Crew / Config
  const crew = flightInfo.crew || '2/4';
  const { aircraft: ac } = results;
  const acVariant = getAircraftById(ac?.id || inputs?.aircraftId);
  const config = acVariant?.config || '';
  line(`${dep} ${arr} ${reg}  ${crew}  ${config}`);

  blankLine();
  hr();

  // ────────────────────────────────────────────
  // WEIGHTS
  // ────────────────────────────────────────────
  const { weights, cg, trim, passengers, cargo, fuel, indices } = results;
  const allPass = validation?.allPass ?? true;
  const mzfw = acVariant?.weights?.mzfw ?? 62731;
  const mtow = acVariant?.weights?.mtow ?? 79015;
  const mlw  = acVariant?.weights?.mlw  ?? 66360;

  setMono(9, 'bold');
  // ZFW / MAX ZFW
  line(`ZFW ${padL(n(weights.finalZfw), 6)}  MAX ${n(mzfw)}`);
  // TOF
  line(`TOF ${n(fuel.total)}`);
  // Fuel split — indented sub-line
  setMono(8);
  line(`  WING ${n(fuel.wingTanks)}  CTR ${n(fuel.centerTank)}`);
  setMono(9, 'bold');
  // TOW / MAX TOW
  const limFlag = weights.limitingFactor === 'L' ? '  L' : weights.limitingFactor === 'Z' ? '  Z' : '';
  line(`TOW ${padL(n(weights.tow), 6)}  MAX ${n(mtow)}${limFlag}`);
  // TIF
  line(`TIF ${n(weights.tripFuel)}${weights.tripFuelEstimated ? ' (EST)' : ''}`);
  // LAW / MAX LAW
  line(`LAW ${padL(n(weights.landingWeight), 6)}  MAX ${n(mlw)}${weights.limitingFactor === 'L' ? '  L' : ''}`);
  // UNDLD
  line(`UNDLD ${n(weights.undld)}`);

  blankLine();

  // STAB — immediately after weights
  let stabStr = '---';
  if (trim?.finalTrim != null) {
    const flaps = trim.flaps === 'F5' ? '1/5' : '1/15';
    const dir = trim.finalTrim >= 0 ? 'UP' : 'DN';
    stabStr = `FLAPS ${flaps} ${trim.thrust}    ${Math.abs(trim.finalTrim).toFixed(1)} ${dir}`;
  } else if (trim?.message) {
    stabStr = 'FMC';
  }
  line(`STAB:${stabStr}`);

  blankLine();

  // PAX — single combined line with CHD/INF
  const bcPax = passengers.zones?.OA?.count ?? inputs?.passengers?.OA ?? 0;
  const eyPax = (passengers.totalPax || 0) - bcPax;
  const chd = inputs?.children || 0;
  const inf = inputs?.infants || 0;
  line(`PAX/${bcPax}/${eyPax}  CHD ${chd}  INF ${inf}  TTL ${passengers.totalPax}`);

  blankLine();

  // Zone breakdown
  setMono(9);
  const pz = inputs?.passengers || {};
  line(`A${pz.OA || 0} B${pz.OB || 0} C${pz.OC || 0} D${pz.OD || 0}`);

  blankLine();

  // Cargo — HOLD labels + total
  const cg2 = inputs?.cargo || {};
  line(`HOLD1 ${n(cg2.HOLD1 || 0)}  HOLD2 ${n(cg2.HOLD2 || 0)}  HOLD3 ${n(cg2.HOLD3 || 0)}  HOLD4 ${n(cg2.HOLD4 || 0)}`);
  const cargoTotal = (cg2.HOLD1 || 0) + (cg2.HOLD2 || 0) + (cg2.HOLD3 || 0) + (cg2.HOLD4 || 0);
  line(`CARGO TTL ${n(cargoTotal)} KG`);

  blankLine();
  hr();

  // ────────────────────────────────────────────
  // CG TABLE
  // ────────────────────────────────────────────
  setMono(8, 'bold');
  line('        FWD-LMT  ACTL   AFT-LMT');
  setMono(9);
  line(`ZFMAC   ${padL(d1(cg.zfwFwdLmt), 7)}  ${padL(d1(cg.zfmac), 4)}   ${d1(cg.zfwAftLmt)}`);
  line(`TOMAC   ${padL(d1(cg.towFwdLmt), 7)}  ${padL(d1(cg.tomac), 4)}   ${d1(cg.towAftLmt)}`);

  blankLine();
  hr();

  // ────────────────────────────────────────────
  // LMC (if any)
  // ────────────────────────────────────────────
  const lmcItems = results.lmc?.items || [];
  if (lmcItems.length > 0) {
    setMono(8, 'bold');
    line('LMC:');
    setMono(9);
    for (const item of lmcItems) {
      line(`  ${item.description}  IDX ${item.index > 0 ? '+' : ''}${item.index}`);
    }
    line(`TOTAL LMC ${n(results.lmc.totalWeight)} KG`);
    blankLine();
    hr();
  }

  // ────────────────────────────────────────────
  // VALIDATION STATUS
  // ────────────────────────────────────────────
  setMono(9, 'bold');
  if (allPass) {
    doc.setTextColor(5, 120, 80);
    line('** WITHIN LIMITS **');
    doc.setTextColor(20, 20, 20);
  } else {
    doc.setTextColor(180, 0, 0);
    line('** EXCEEDS LIMITS **');
    doc.setTextColor(20, 20, 20);
    setMono(8);
    for (const err of (validation?.errors || [])) {
      line(`  - ${err}`);
    }
  }

  blankLine();
  hr();

  // ────────────────────────────────────────────
  // PREPARED BY / CREW DETAILS
  // ────────────────────────────────────────────
  setMono(9);
  const preparer = flightInfo.preparer || '';
  const licence  = flightInfo.licence  || '';
  const supervisor = flightInfo.supervisor || '';
  const staffId    = flightInfo.staffId    || '';
  const picName    = flightInfo.picName    || '';

  line(`PREPARED BY ${preparer.toUpperCase()}`);
  if (licence) line(`LICENCE ${licence.toUpperCase()}`);
  if (supervisor) {
    line(`LOADING SUPERVISOR : ${supervisor.toUpperCase()}`);
    if (staffId) line(`STAFF ID : ${staffId}`);
  }
  blankLine();
  line(`AIRCRAFT TYPE : ${ac?.type || 'B737-800'}`);
  if (picName) line(`PIC NAME: ${picName.toUpperCase()}`);
  line('SIGN & LIC NO.: ..............................');

  blankLine();
  hr();

  // Footer
  setLabel(7);
  doc.setTextColor(140, 140, 140);
  doc.text('737 Load & Trim Calculator — Malaysia Airlines Flight Operations Training', lm, y);
  y += 4;
  doc.text(`Generated: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}Z`, lm, y);

  // Save
  const fname = `loadsheet-${flightNum !== '----' ? flightNum : 'draft'}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fname);
}
