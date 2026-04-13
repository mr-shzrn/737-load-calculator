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

// ── Pre-calculate page height from variable content ──
// Constants must match the render path exactly.
function computePageHeight(results, validation, flightInfo) {
  const L = 4.5, BL = 2, HR = 1.5;
  let h = 12;

  h += 4 * L + BL + HR;               // header + separator
  h += 7 * L;                          // ZFW TOF WING/CTR TOW TIF LAW UNDLD
  h += BL + L + BL;                    // blank STAB blank
  h += L + BL;                         // PAX blank
  h += L + BL;                         // zone blank
  h += 2 * L + BL + HR;               // HOLD + CARGO TTL + separator
  h += 3 * L + BL + HR;               // CG header + ZFMAC + TOMAC + separator

  const lmcItems = results.lmc?.items || [];
  if (lmcItems.length > 0) {
    h += L + lmcItems.length * L + L + BL + HR; // LMC block
  }

  h += L;                              // validation status line
  if (!(validation?.allPass ?? true)) {
    h += (validation?.errors || []).length * L;
  }
  h += BL + HR;

  h += L;                              // PREPARED BY
  if (flightInfo.licence)    h += L;
  if (flightInfo.supervisor) h += L;
  if (flightInfo.supervisor && flightInfo.staffId) h += L;
  h += BL + L;                         // blank + AIRCRAFT TYPE
  if (flightInfo.picName) h += L;
  h += L + BL + HR;                   // SIGN & LIC + separator

  h += 4 + 4 + 8;                     // footer 2 lines + bottom pad

  return Math.ceil(h);
}

export function generateLoadsheetPDF(results, validation, inputs, flightInfo = {}) {
  const pageW = 148;               // ACARS narrow width (mm)
  const lm    = 8;                 // left margin
  const W     = pageW - 2 * lm;   // content width = 132 mm
  const pageH = computePageHeight(results, validation, flightInfo);

  const doc = new jsPDF('p', 'mm', [pageW, pageH]);
  let y = 8;

  // MAS stripe at top
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, pageW * 0.65, 4, 'F');
  doc.setFillColor(204, 0, 51);
  doc.rect(pageW * 0.65, 0, pageW * 0.35, 4, 'F');

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

  // Hard yellow — single row (ZFW, TOW, TOMAC)
  const highlightYellow = () => {
    doc.setFillColor(255, 240, 0);
    doc.rect(lm - 2, y - 3.2, W + 4, 4.8, 'F');
  };

  // Soft green — double row band covering TOF + WING/CTR
  const highlightGreenDouble = () => {
    doc.setFillColor(180, 230, 180);
    doc.rect(lm - 2, y - 3.2, W + 4, 9.6, 'F');
  };

  // ────────────────────────────────────────────
  // HEADER
  // ────────────────────────────────────────────
  y = 12;
  setMono(8, 'bold');
  const reg       = flightInfo.registration || '9M-???';
  const dep       = flightInfo.departure    || '???';
  const arr       = flightInfo.arrival      || '???';
  const flightNum = flightInfo.flightNumber || '----';
  const dateStr   = flightInfo.date || new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
    .replace(/ /g, '').toUpperCase();

  line(`AN ${reg}/FI ${flightNum}/MA ---`);
  setMono(8);
  line(`- LOADSHEET FINAL ${new Date().toISOString().slice(11, 15).replace(':', '')} EDN01`);
  setMono(8, 'bold');
  line(`${flightNum}    ${dateStr}`);
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
  const { weights, cg, trim, passengers, fuel } = results;
  const allPass = validation?.allPass ?? true;
  const mzfw = acVariant?.weights?.mzfw ?? 62731;
  const mtow = acVariant?.weights?.mtow ?? 79015;
  const mlw  = acVariant?.weights?.mlw  ?? 66360;

  setMono(9, 'bold');

  // ZFW — yellow highlight
  highlightYellow();
  line(`ZFW ${padL(n(weights.finalZfw), 6)}  MAX ${n(mzfw)}`);

  // TOF + WING/CTR — single green band drawn before TOF
  highlightGreenDouble();
  line(`TOF ${n(fuel.total)}`);
  setMono(8);
  line(`  WING ${n(fuel.wingTanks)}  CTR ${n(fuel.centerTank)}`);

  setMono(9, 'bold');

  // TOW — yellow highlight
  const limFlag = weights.limitingFactor === 'L' ? '  L'
                : weights.limitingFactor === 'Z' ? '  Z' : '';
  highlightYellow();
  line(`TOW ${padL(n(weights.tow), 6)}  MAX ${n(mtow)}${limFlag}`);

  line(`TIF ${n(weights.tripFuel)}${weights.tripFuelEstimated ? ' (EST)' : ''}`);
  line(`LAW ${padL(n(weights.landingWeight), 6)}  MAX ${n(mlw)}${weights.limitingFactor === 'L' ? '  L' : ''}`);
  line(`UNDLD ${n(weights.undld)}`);

  blankLine();

  // STAB
  let stabStr = '---';
  if (trim?.finalTrim != null) {
    const flaps = trim.flaps === 'F5' ? '1/5' : '1/15';
    const dir   = trim.finalTrim >= 0 ? 'UP' : 'DN';
    stabStr = `FLAPS ${flaps} ${trim.thrust}    ${Math.abs(trim.finalTrim).toFixed(1)} ${dir}`;
  } else if (trim?.message) {
    stabStr = 'FMC';
  }
  line(`STAB:${stabStr}`);

  blankLine();

  // PAX
  const bcPax = passengers.zones?.OA?.count ?? inputs?.passengers?.OA ?? 0;
  const eyPax = (passengers.totalPax || 0) - bcPax;
  const chd   = inputs?.children || 0;
  const inf   = inputs?.infants  || 0;
  line(`PAX/${bcPax}/${eyPax}  CHD ${chd}  INF ${inf}  TTL ${passengers.totalPax}`);

  blankLine();

  // Zone breakdown
  setMono(9);
  const pz = inputs?.passengers || {};
  line(`A${pz.OA || 0} B${pz.OB || 0} C${pz.OC || 0} D${pz.OD || 0}`);

  blankLine();

  // Cargo
  const cg2 = inputs?.cargo || {};
  line(`HOLD1 ${n(cg2.HOLD1 || 0)}  HOLD2 ${n(cg2.HOLD2 || 0)}  HOLD3 ${n(cg2.HOLD3 || 0)}  HOLD4 ${n(cg2.HOLD4 || 0)}`);
  const cargoTotal = (cg2.HOLD1 || 0) + (cg2.HOLD2 || 0) + (cg2.HOLD3 || 0) + (cg2.HOLD4 || 0);
  line(`CARGO TTL ${n(cargoTotal)} KG`);

  blankLine();
  hr();

  // ────────────────────────────────────────────
  // CG TABLE — absolute x positions, right-aligned values
  // ────────────────────────────────────────────
  const cgX = { label: lm, fwd: 58, actl: 88, aft: pageW - lm };

  const cgHeaderRow = () => {
    setMono(8, 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('FWD-LMT', cgX.fwd,  y, { align: 'right' });
    doc.text('ACTL',    cgX.actl, y, { align: 'right' });
    doc.text('AFT-LMT', cgX.aft,  y, { align: 'right' });
    doc.setTextColor(20, 20, 20);
    y += 4.5;
  };

  const cgDataRow = (label, fwd, actl, aft, doHighlight = false) => {
    if (doHighlight) highlightYellow();
    setMono(9, doHighlight ? 'bold' : 'normal');
    doc.text(label, cgX.label, y);
    doc.text(fwd,   cgX.fwd,  y, { align: 'right' });
    doc.text(actl,  cgX.actl, y, { align: 'right' });
    doc.text(aft,   cgX.aft,  y, { align: 'right' });
    y += 4.5;
  };

  cgHeaderRow();
  cgDataRow('ZFMAC', d1(cg.zfwFwdLmt), d1(cg.zfmac), d1(cg.zfwAftLmt));
  cgDataRow('TOMAC', d1(cg.towFwdLmt), d1(cg.tomac), d1(cg.towAftLmt), true);

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
  const preparer   = flightInfo.preparer   || '';
  const licence    = flightInfo.licence    || '';
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
  doc.text('737 Load & Trim — MAS Flight Ops Training', lm, y);
  y += 4;
  doc.text(`Generated: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}Z`, lm, y);

  // Save
  const fname = `loadsheet-${flightNum !== '----' ? flightNum : 'draft'}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fname);
}
