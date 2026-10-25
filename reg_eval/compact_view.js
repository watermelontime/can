// All rights reserved. (c) 2026 //
// ===================================================================================
// compact_view.js
// Renders the "compact" tab of the Evaluation Report: a bit-accurate visual layout
// of every decoded register:
//   - register name, address and 32-bit value (header row)
//   - bit numbers 31..0
//   - value of each bit / field (non-zero values highlighted, reserved bits greyed)
//   - names of the bits / fields (vertical text)
//
// Field bit-ranges and values are read directly from the decoded `reg` object
// (reg.<REG>.fields.<NAME> = { value, msb, lsb, name_short, name_long }), produced by the
// decoders via defineField() — the single source of truth, no source parsing required.
// ===================================================================================

import { getBits } from './help_functions.js';

// ===================================================================================
// Public entry point: render the compact register view into `container`.
// reg        : global register result object (single source of truth)
// moduleName : selected CAN module (used for signature stability / caller context)
// container  : target DOM element
// options    : { mode, isShown }
//   mode     : 'normal' (default) renders only selected registers;
//              'config' renders ALL registers, each with a "show" checkbox.
//   isShown  : (regName) => boolean; which registers are selected. Default: all.
export async function buildCompactView(reg, moduleName, container, options = {}) {
  if (!container) return;
  const mode = options.mode === 'config' ? 'config' : 'normal';
  const isShown = typeof options.isShown === 'function' ? options.isShown : () => true;

  if (!reg || typeof reg !== 'object') {
    container.innerHTML = `<p class="compact-note">No decoded registers to display. Process a register dump first.</p>`;
    return;
  }

  // Collect registers present in the memory dump (have a decoded value and address)
  const regs = [];
  for (const key of Object.keys(reg)) {
    const entry = reg[key];
    if (entry && typeof entry === 'object' &&
        typeof entry.int32 === 'number' && typeof entry.addr === 'number') {
      regs.push({ name: key, addr: entry.addr, int32: entry.int32, fields: extractFields(entry.fields) });
    }
  }
  if (regs.length === 0) {
    container.innerHTML = `<p class="compact-note">No decoded registers to display. Process a register dump first.</p>`;
    return;
  }

  regs.sort((a, b) => a.addr - b.addr);

  // Config view: show every register with a "show" checkbox to its left.
  if (mode === 'config') {
    container.innerHTML = regs.map(r => buildConfigRow(r, isShown(r.name))).join('');
    return;
  }

  // Normal view: show only the selected registers.
  const shownRegs = regs.filter(r => isShown(r.name));
  if (shownRegs.length === 0) {
    container.innerHTML = `<p class="compact-note">No registers selected. Change visible registers via &lt;select registers&gt; button.</p>`;
    return;
  }
  container.innerHTML = shownRegs.map(r => buildRegisterTable(r, r.fields)).join('');
}

// ===================================================================================
// Build a config-view row: a "show" checkbox on the left and the register table.
function buildConfigRow(r, checked) {
  const table = buildRegisterTable(r, r.fields);
  const checkedAttr = checked ? ' checked' : '';
  return `
<div class="cv-config-row">
  <label class="cv-show"><input type="checkbox" class="cv-show-cb" data-reg="${escapeHtml(r.name)}"${checkedAttr} /> show</label>
  <div class="cv-config-table">${table}</div>
</div>`;
}

// ===================================================================================
// Build the field layout array from a decoded register's `fields` object.
// Returns [{ name_short, name_long, msb, lsb, value }] for every field with a valid bit range.
function extractFields(fields) {
  if (!fields || typeof fields !== 'object') return [];
  const out = [];
  for (const f of Object.values(fields)) {
    if (!f || typeof f !== 'object') continue;
    const { msb, lsb, value } = f;
    if (typeof msb !== 'number' || typeof lsb !== 'number') continue;
    if (!(msb >= 0 && msb <= 31 && lsb >= 0 && lsb <= msb)) continue; // skip malformed
    out.push({ name_short: f.name_short, name_long: f.name_long, msb, lsb, value });
  }
  return out;
}

// ===================================================================================
// Build the HTML table for a single register.
function buildRegisterTable(r, fields) {
  const value = r.int32 >>> 0;
  const segments = buildSegments(fields, value);

  const addrHex = '0x' + (r.addr >>> 0).toString(16).toUpperCase();
  const valHex = '0x' + value.toString(16).toUpperCase().padStart(8, '0');
  const title = `${escapeHtml(r.name)} (${addrHex}), value = ${valHex}`;

  // Bit-number row: 31 .. 0
  let bitNumCells = '';
  for (let b = 31; b >= 0; b--) {
    bitNumCells += `<td class="cv-bitnum">${b}</td>`;
  }

  // Value row and name row use the SAME segmentation, so their colspans align.
  let valueCells = '';
  let nameCells = '';
  for (const seg of segments) {
    const span = seg.msb - seg.lsb + 1;

    const valClasses = ['cv-value'];
    if (seg.reserved) valClasses.push('cv-reserved');
    if (seg.value !== 0) valClasses.push('cv-nonzero');
    valueCells += `<td class="${valClasses.join(' ')}" colspan="${span}">${formatValue(seg.value, span)}</td>`;

    const nameClasses = ['cv-name'];
    if (seg.reserved) nameClasses.push('cv-reserved');
    if (seg.value !== 0) nameClasses.push('cv-nonzero');
    const label = seg.reserved ? 'res' : escapeHtml(seg.name_short);
    const longAttr = (!seg.reserved && seg.name_long) ? ` data-long="${escapeHtml(seg.name_long)}"` : '';
    nameCells += `<td class="${nameClasses.join(' ')}" colspan="${span}"${longAttr}><span class="cv-name-text">${label}</span></td>`;
  }

  return `
<table class="cv-table">
  <tbody>
    <tr><th class="cv-header" colspan="32">${title}</th></tr>
    <tr class="cv-bitnum-row">${bitNumCells}</tr>
    <tr class="cv-value-row">${valueCells}</tr>
    <tr class="cv-name-row">${nameCells}</tr>
  </tbody>
</table>`;
}

// ===================================================================================
// Split the 32 bits into contiguous segments of fields and reserved gaps (MSB -> LSB).
function buildSegments(fields, value) {
  const owner = new Array(32).fill(null); // bit index -> field index (or null = reserved)
  if (Array.isArray(fields)) {
    fields.forEach((f, idx) => {
      for (let b = f.lsb; b <= f.msb && b < 32; b++) {
        if (owner[b] === null) owner[b] = idx; // first definition wins on (rare) overlaps
      }
    });
  }

  const segments = [];
  let b = 31;
  while (b >= 0) {
    const current = owner[b];
    const hi = b;
    while (b >= 0 && owner[b] === current) b--;
    const lo = b + 1;

    if (current === null) {
      segments.push({ msb: hi, lsb: lo, reserved: true, value: getBits(value, hi, lo), name_short: 'res' });
    } else {
      const f = fields[current];
      const fval = (typeof f.value === 'number') ? f.value : getBits(value, f.msb, f.lsb);
      segments.push({ msb: f.msb, lsb: f.lsb, reserved: false, value: fval, name_short: f.name_short, name_long: f.name_long });
    }
  }
  return segments;
}

// ===================================================================================
// Format a field value: single bit -> "0"/"1", multi-bit field -> hex ("0x..").
function formatValue(value, span) {
  if (span === 1) return String(value & 1);
  const nibbles = Math.ceil(span / 4);
  return '0x' + (value >>> 0).toString(16).toUpperCase().padStart(nibbles, '0');
}

// ===================================================================================
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
