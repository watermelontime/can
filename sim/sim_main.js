// All rights reserved. (c) 2026 //
// =============================================================================
// sim_main.js — DOM wiring. Builds the configuration form from defaultConfig(),
// runs the simulation and injects the SVG. Only this file and sim_draw.js touch
// the DOM.
// =============================================================================

import {
  defaultConfig, validateConfig, BT_PRESETS, applyPreset, SLIDER_RANGES,
} from './sim_config.js';
import { runSimulation } from './sim_engine.js';
import { renderResult, timeAxis } from './sim_draw.js';
import { tqPerBit, derivePwm } from './sim_bittiming.js';
import * as drawBt from '../draw_bits_svg.js';
import { createSO8svg } from '../draw_transceiver_svg.js';

const APP_VERSION = 'V0.2.0';
const cfg = defaultConfig();
const SVG_NS = 'http://www.w3.org/2000/svg';

// ---- small form helpers ----------------------------------------------------

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) e.append(c);
  return e;
}

function svgEl(id, width, height) {
  const s = document.createElementNS(SVG_NS, 'svg');
  s.setAttribute('id', id);
  s.setAttribute('width', width);
  s.setAttribute('height', height);
  return s;
}

// ---- value binding ----------------------------------------------------------
// Every displayed value registers a view function; after any change all views
// are refreshed from cfg, so copies (setup / configuration) stay in sync.

const views = [];
function refreshViews() {
  for (const f of views) f();
}
function changed() {
  refreshViews();
  scheduleRun();
}

const hex = (v, digits) => '0x' + (v >>> 0).toString(16).toUpperCase().padStart(digits, '0');

// Bind an <input> to get/set. kind: 'num' | 'hex' | 'check'.
function bind(input, kind, get, set, hexDigits = 1) {
  const show = () => {
    if (kind === 'check') input.checked = !!get();
    else if (document.activeElement !== input) input.value = kind === 'hex' ? hex(get(), hexDigits) : String(get());
  };
  views.push(show);
  show();
  input.addEventListener(kind === 'check' ? 'change' : 'input', () => {
    let v;
    if (kind === 'check') v = input.checked;
    else if (kind === 'hex') v = parseInt(input.value.trim().replace(/^0x/i, ''), 16);
    else v = parseFloat(input.value);
    const bad = kind !== 'check' && Number.isNaN(v);
    input.classList.toggle('input-error', bad);
    if (bad) return;
    set(v);
    changed();
  });
  input.addEventListener('blur', show);
  return input;
}

const numInput = (get, set, attrs = {}) => bind(el('input', { type: 'number', class: 'input-field', ...attrs }), 'num', get, set);
const hexInput = (get, set, digits, width) => bind(el('input', { type: 'text', class: 'input-field', style: `width:${width}ch` }), 'hex', get, set, digits);
const checkInput = (get, set) => bind(el('input', { type: 'checkbox', class: 'input-field' }), 'check', get, set);

function resultField(get) {
  const f = el('input', { type: 'text', class: 'result-field', readonly: '' });
  views.push(() => { f.value = get(); });
  return f;
}

// Slider row (label | range | number) for SLIDER_RANGES[key] of getObj().
function sliderRow(label, getObj, key) {
  const [min, max] = SLIDER_RANGES[key];
  const range = el('input', { type: 'range', min, max, step: 1, class: 'sim-slider' });
  views.push(() => { range.value = String(getObj()[key]); });
  range.addEventListener('input', () => { getObj()[key] = parseFloat(range.value); changed(); });
  const num = numInput(() => getObj()[key], (v) => { getObj()[key] = v; }, { min, max, step: 1 });
  return el('tr', {}, [el('td', { text: label }), el('td', {}, [range]), el('td', {}, [num])]);
}

// Parse a comma/space separated hex byte list into an array.
function parseBytes(str) {
  return str.split(/[,\s]+/).filter(Boolean).map((s) => parseInt(s.replace(/^0x/i, ''), 16) & 0xFF);
}

const fix = (v, n) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(n) : String(v));
const round = (v) => (typeof v === 'number' && Number.isFinite(v) ? String(Math.round(v)) : String(v));

// Derived bit timing values of a node (same formulas as xl_bt/script_main.js).
function nodeResults(node) {
  const { arb, data } = node.bt;
  const clkP = 1000 / node.clkMHz;
  const tqA = tqPerBit(arb);
  const tqD = tqPerBit(data);
  const r = {
    clkP,
    tqA, tqD,
    rateA: node.clkMHz / (arb.brp * tqA),
    rateD: node.clkMHz / (data.brp * tqD),
    spA: (1 - arb.ps2 / tqA) * 100,
    spD: (1 - data.ps2 / tqD) * 100,
    tqLen: clkP * arb.brp,
  };
  r.bitLenA = 1000 / r.rateA;
  r.bitLenD = 1000 / r.rateD;
  if (!node.tdc) r.sspOffset = 'TDC off';
  else if (node.tms) r.sspOffset = 'TMS on';
  else r.sspOffset = (data.prop + data.ps1 + 1) * data.brp - 1;
  r.ssp = typeof r.sspOffset === 'number' ? r.sspOffset / (tqD * data.brp) * 100 : r.sspOffset;
  r.pwm = derivePwm(node);
  return r;
}

// Number shown with at most `n` decimals (trailing zeros dropped).
const short = (v, n) => String(Number(v.toFixed(n)));

// ---- Part 1: setup (node / transceiver / bus overview) -----------------------

function ccChipSvg() {
  const W = 130, H = 110, bx = 12, by = 10, bw = W - 2 * bx, bh = H - 2 * by;
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  for (let k = 0; k < 12; k++) {
    const x = (bx + 6 + k * (bw - 12) / 11 - 1.5).toFixed(1);
    s += `<rect x="${x}" y="${by - 8}" width="3" height="8" fill="#999"/>`
       + `<rect x="${x}" y="${by + bh}" width="3" height="8" fill="#999"/>`;
  }
  for (let k = 0; k < 9; k++) {
    const y = (by + 6 + k * (bh - 12) / 8 - 1.5).toFixed(1);
    s += `<rect x="${bx - 8}" y="${y}" width="8" height="3" fill="#999"/>`
       + `<rect x="${bx + bw}" y="${y}" width="8" height="3" fill="#999"/>`;
  }
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="#111"/>`;
  s += `<rect x="${bx + 12}" y="${by + 12}" width="${bw - 24}" height="${bh - 24}" fill="#ccc" stroke="#888"/>`;
  ['CAN', 'Controller', '(CC)'].forEach((t, i) => {
    s += `<text x="${W / 2}" y="${by + bh / 2 + (i - 1) * 17 + 5}" text-anchor="middle" font-size="14" fill="#222">${t}</text>`;
  });
  return s + '</svg>';
}

function txdRxdSvg() {
  const H = 56;
  return `<svg width="100" height="${H}">`
    + `<line x1="44" y1="0" x2="44" y2="${H - 8}" stroke="#1565c0" stroke-width="2"/>`
    + `<polygon points="39,${H - 9} 49,${H - 9} 44,${H}" fill="#1565c0"/>`
    + `<line x1="56" y1="${H}" x2="56" y2="8" stroke="#1565c0" stroke-width="2"/>`
    + `<polygon points="51,9 61,9 56,0" fill="#1565c0"/>`
    + `<text x="38" y="${H / 2 + 5}" text-anchor="end" font-size="14">TXD</text>`
    + `<text x="62" y="${H / 2 + 5}" font-size="14">RXD</text></svg>`;
}

function htmlBox(cls, html) {
  const d = el('div', { class: cls });
  d.innerHTML = html;
  return d;
}

const kv = (label, input) => el('div', { class: 'sim-setup-kv' }, [el('label', { text: label }), input]);

// Delay parameter next to a vertical arrow; dir 'down' (TX path) or 'up' (RX path).
function pathCell(area, label, input, dir) {
  const arrow = el('div', { class: `sim-arrow sim-arrow-${dir}` });
  const p = el('div', { class: 'sim-setup-param' }, [el('label', { text: label }), el('span', {}, [input, ' ns'])]);
  return el('div', { class: `sim-path sim-path-${dir} sim-ga-${area}` }, dir === 'down' ? [p, arrow] : [arrow, p]);
}

function buildSetupNode(node) {
  const res = () => nodeResults(node);
  const ch = () => node.channel;
  const tc = () => node.transceiver;
  const head = el('div', { class: 'sim-setup-head' }, [el('span', { class: 'sim-setup-title', text: node.label })]);
  if (node.index === 1) {
    head.append(el('label', { class: 'sim-setup-delay' }, [
      'delay transmission start by [ns] ',
      numInput(() => node.txStartDelay, (v) => { node.txStartDelay = v; }, { min: 0, step: 1 }),
    ]));
  }
  const trxSvg = createSO8svg('SIC XL');
  trxSvg.setAttribute('width', 80);
  trxSvg.setAttribute('height', 60);
  const grid = el('div', { class: 'sim-setup-grid' }, [
    el('div', { class: 'sim-ga-rates' }, [
      kv('Arb. [kbit/s]', resultField(() => short(res().rateA * 1000, 1))),
      kv('Data [Mbit/s]', resultField(() => short(res().rateD, 2))),
    ]),
    htmlBox('sim-ga-cc', ccChipSvg()),
    el('div', { class: 'sim-ga-df' }, [kv('df [%]', numInput(() => node.df, (v) => { node.df = v; }, { step: 0.1 }))]),
    pathCell('tx1', 't_cc_tc_tx', numInput(() => ch().t_cc_tc_tx, (v) => { ch().t_cc_tc_tx = v; }), 'down'),
    htmlBox('sim-ga-lines', txdRxdSvg()),
    pathCell('rx1', 't_cc_tc_rx', numInput(() => ch().t_cc_tc_rx, (v) => { ch().t_cc_tc_rx = v; }), 'up'),
    pathCell('tx2', 't_tc_tx', numInput(() => tc().t_tc_tx, (v) => { tc().t_tc_tx = v; }), 'down'),
    el('div', { class: 'sim-ga-trx sim-setup-trx' }, [trxSvg]),
    pathCell('rx2', 't_tc_rx', numInput(() => tc().t_tc_rx, (v) => { tc().t_tc_rx = v; }), 'up'),
  ]);
  return el('div', { class: 'sim-setup-node' }, [head, grid]);
}

// Twisted pair (two phase-shifted sine wires) along a straight line.
function twisted(x0, y0, x1, y1) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const wire = (ph, color) => {
    const pts = [];
    for (let s = 0; s <= len; s += 2) {
      const o = 5 * Math.sin(2 * Math.PI * s / 22 + ph);
      pts.push(`${(x0 + ux * s - uy * o).toFixed(1)},${(y0 + uy * s + ux * o).toFixed(1)}`);
    }
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2"/>`;
  };
  return wire(0, '#f5a742') + wire(Math.PI, '#8cc8ff');
}

// Bus, stubs and terminations are drawn on an overlay measured from the layout.
function drawBus(host, overlay) {
  const box = host.getBoundingClientRect();
  const trx = [...host.querySelectorAll('.sim-setup-trx')].map((e) => e.getBoundingClientRect());
  if (trx.length < 2 || !box.width) return;
  const yBus = host.querySelector('.sim-setup-bus').getBoundingClientRect().top - box.top + 22;
  const xs = trx.map((r) => r.left + r.width / 2 - box.left);
  const xL = xs[0] - 40;
  const xR = xs[1] + 40;
  let s = twisted(xL, yBus, xR, yBus);
  trx.forEach((r, i) => { s += twisted(xs[i], r.bottom - box.top - 4, xs[i], yBus); });
  for (const x of [xL - 14, xR]) {
    s += `<rect x="${x}" y="${yBus - 12}" width="14" height="24" fill="#ddd" stroke="#999"/>`
       + `<text x="${x + 7}" y="${yBus + 5}" text-anchor="middle" font-size="14" font-weight="bold">T</text>`;
  }
  s += `<text x="${(xs[0] + xs[1]) / 2}" y="${yBus - 12}" text-anchor="middle" font-size="15">CAN bus</text>`;
  overlay.setAttribute('width', box.width);
  overlay.setAttribute('height', box.height);
  overlay.innerHTML = s;
}

function buildSetup() {
  const host = document.getElementById('sim-setup');
  const overlay = document.createElementNS(SVG_NS, 'svg');
  overlay.setAttribute('class', 'sim-setup-overlay');
  const bus = el('div', { class: 'sim-setup-bus' }, [
    el('label', {}, ['t_cable: ', numInput(() => cfg.bus.t_cable, (v) => { cfg.bus.t_cable = v; }), ' ns']),
  ]);
  host.append(el('div', { class: 'sim-setup-nodes' }, cfg.nodes.map(buildSetupNode)), bus, overlay);
  new ResizeObserver(() => drawBus(host, overlay)).observe(host);
}

// ---- Part 2: configuration view ---------------------------------------------

let configVisible = false;

const td = (c, attrs = {}) => el('td', attrs, c === undefined ? [] : [c]);
const tr = (...cells) => el('tr', {}, cells);
const dash = () => td('---');
const thead = (title) => el('thead', {}, [
  el('tr', {}, [el('th', { colspan: 3, class: 'headline_in_table', text: title })]),
  el('tr', {}, [el('th'), el('th', { text: 'Arb.' }), el('th', { text: 'Data' })]),
]);
const column = (cls, title, children) => el('div', { class: `column ${cls}` }, [el('h3', { text: title }), ...children]);

// Input 1: transceiver type, examples, clock.
function buildInput1(node) {
  const group = el('div', { class: 'transceiver-group' });
  for (const [label, val] of [['FD', 'TFD'], ['SIC', 'TSIC'], ['SIC XL', 'TSICXL']]) {
    const b = el('button', { type: 'button', class: 'transceiver-btn', title: label });
    b.append(createSO8svg(label));
    if (val === node.transceiverType) b.classList.add('active');
    else { b.disabled = true; b.title = `${label}: not supported by the simulation yet`; }
    group.append(b);
  }
  const select = el('select', { class: 'styled-select' });
  for (const [key, [label]] of Object.entries(BT_PRESETS)) select.append(el('option', { value: key, text: label }));
  const load = el('button', { type: 'button', class: 'styled-button', text: 'Load Example' });
  load.addEventListener('click', () => { applyPreset(node, select.value); changed(); });
  const clk = el('table', {}, [
    el('thead', {}, [tr(el('th'), el('th', { text: 'Value' }), el('th', { text: 'Unit' }))]),
    el('tbody', {}, [
      tr(td('Frequency'), td(numInput(() => node.clkMHz, (v) => { node.clkMHz = v; })), td('MHz')),
      tr(td('df_used'), td(numInput(() => node.df, (v) => { node.df = v; }, { step: 0.1 })), td('%')),
      tr(td('Clock period'), td(resultField(() => fix(1000 / node.clkMHz, 2))), td('ns')),
    ]),
  ]);
  return column('settings-column', 'Input 1', [
    el('h3', { text: 'Transceiver Type' }), group,
    el('h3', { text: 'Example Configurations' }), select, load,
    el('h3', { text: 'CAN Clock settings' }), clk,
  ]);
}

// Input 2: bit timing parameters (BRP shared by both phases).
function buildInput2(node) {
  const bt = (ph, key) => numInput(() => node.bt[ph][key], (v) => { node.bt[ph][key] = v; });
  const brp = numInput(() => node.bt.arb.brp, (v) => { node.bt.arb.brp = v; node.bt.data.brp = v; });
  const pwm = (k) => resultField(() => {
    const p = nodeResults(node).pwm;
    if (!node.tms) return 'TMS off';
    return p ? String(p[k]) : 'no PWM';
  });
  const segs = [['PropSeg', 'prop'], ['PhaseSeg1', 'ps1'], ['PhaseSeg2', 'ps2'], ['SJW', 'sjw']];
  const table = el('table', {}, [
    thead('Bit Timing Settings'),
    el('tbody', {}, [
      tr(td('BRP'), td(brp, { colspan: 2, class: 'table_colspan_center' })),
      ...segs.map(([label, key]) => tr(td(label), td(bt('arb', key)), td(bt('data', key)))),
      tr(td('TDC'), dash(), td(checkInput(() => node.tdc, (v) => { node.tdc = v; }))),
      tr(td('SSP Offset'), dash(), td(resultField(() => round(nodeResults(node).sspOffset)))),
      tr(td('TMS'), dash(), td(checkInput(() => node.tms, (v) => { node.tms = v; }))),
    ]),
    thead('PWM Settings (calculated)'),
    el('tbody', {}, [
      tr(td('PWMO'), dash(), td(pwm('pwmo'))),
      tr(td('PWMS'), dash(), td(pwm('pwms'))),
      tr(td('PWML'), dash(), td(pwm('pwml'))),
    ]),
  ]);
  return column('settings-column', 'Input 2: Bit Timing Parameters', [table]);
}

// Output 1: derived bit timing / PWM properties.
function buildOutput1(node) {
  const R = (f) => resultField(() => f(nodeResults(node)));
  const P = (f) => R((r) => {
    if (!node.tms) return 'TMS off';
    return r.pwm ? f(r.pwm) : 'no PWM';
  });
  const table = el('table', {}, [
    thead('Bit Timing Properties'),
    el('tbody', {}, [
      tr(td('Bit-rate [Mbit/s]'), td(R((r) => fix(r.rateA, 2))), td(R((r) => fix(r.rateD, 2)))),
      tr(td('SP [%]'), td(R((r) => fix(r.spA, 2))), td(R((r) => fix(r.spD, 2)))),
      tr(td('SSP [%]'), dash(), td(R((r) => fix(r.ssp, 2)))),
      tr(td('tq per bit time'), td(R((r) => round(r.tqA))), td(R((r) => round(r.tqD)))),
      tr(td('tq length [ns]'), td(R((r) => fix(r.tqLen, 2)), { colspan: 2, class: 'table_colspan_center' })),
      tr(td('Bit length [ns]'), td(R((r) => round(r.bitLenA))), td(R((r) => round(r.bitLenD)))),
    ]),
    thead('PWM Properties'),
    el('tbody', {}, [
      tr(td('PWM length [ns]'), dash(), td(P((p) => fix(p.symLenNs, 2)))),
      tr(td('PWM length [cycle]'), dash(), td(P((p) => String(p.symLenClk)))),
      tr(td('PWMs per bit time'), dash(), td(P((p) => String(p.symbols)))),
    ]),
  ]);
  return column('output-column', 'Output 1: Bit Timing Properties', [table]);
}

const BT_SVG_W = 330;
const BT_SVG_H = 60;

// Output 2: bit timing drawings (draw_bits_svg.js needs visible SVGs).
function drawBtViews(node, [idA, idD, idP, idL]) {
  if (!configVisible) return;
  const r = nodeResults(node);
  const { arb, data } = node.bt;
  const w = BT_SVG_W;
  const h = BT_SVG_H;
  drawBt.drawBitTiming(arb.prop, arb.ps1, arb.ps2, r.spA, arb.sjw, 10, false, idA, 'Arbitration Phase', w, h);
  drawBt.drawBitTiming(data.prop, data.ps1, data.ps2, r.spD, data.sjw, r.ssp, node.tdc && typeof r.ssp === 'number', idD, 'XL Data Phase', w, h);
  const pwmName = 'XL Data Phase PWM symbols';
  if (!node.tms) drawBt.drawErrorMessage(idP, pwmName, 'TMS = off, means no PWM used', w, h);
  else if (!r.pwm) drawBt.drawErrorMessage(idP, pwmName, 'no PWM config exists for this bit rate', w, h);
  else drawBt.drawPWMsymbols(r.pwm.pwms, r.pwm.pwml, r.pwm.symbols, idP, pwmName, w, h);
  drawBt.drawBTLegend(idL, w);
}

function buildOutput2(node) {
  const ids = ['arb', 'data', 'pwm', 'legend'].map((k) => `sim-n${node.index + 1}-bt-${k}`);
  const children = [];
  ids.forEach((id, k) => {
    children.push(svgEl(id, BT_SVG_W, k === 3 ? 20 : BT_SVG_H), el('div', { class: 'inter-svg-spacing' }));
  });
  const dl = (fmt) => {
    const a = el('a', { href: '#', text: `\u21E9 ${fmt.toUpperCase()}` });
    a.addEventListener('click', (e) => {
      e.preventDefault();
      drawBt.downloadCombinedSVGs(ids, `bt_node${node.index + 1}`, fmt, 16, 5);
    });
    return a;
  };
  children.push(el('div', { class: 'download-links' }, [dl('svg'), dl('png')]));
  views.push(() => drawBtViews(node, ids));
  return column('output-column', 'Output 2: Bit Timing Visualization', children);
}

// Input 3: transceiver parameters.
function buildInput3(node) {
  const t = () => node.transceiver;
  const rows = [
    ['t_tc_tx [ns]', 't_tc_tx'], ['t_tc_rx [ns]', 't_tc_rx'],
    ['a_sic_tx [ns]', 'a_sic_tx'], ['a_sic_rx [ns]', 'a_sic_rx'],
    ['a_fast_tx [ns]', 'a_fast_tx'], ['a_fast_rx [ns]', 'a_fast_rx'],
    ['t_select [ns]', 'tselect_threshold'],
  ].map(([label, key]) => sliderRow(label, t, key));
  rows.push(
    tr(td('SIC→FAST [ns]'), td(), td(numInput(() => t().sic2fast, (v) => { t().sic2fast = v; }))),
    tr(td('FAST→SIC [ns]'), td(), td(numInput(() => t().fast2sic, (v) => { t().fast2sic = v; }))),
  );
  return column('settings-column', 'Input 3: Transceiver Parameters', [el('table', { class: 'sim-slider-table' }, rows)]);
}

// Input 4: channel (CC <-> transceiver) parameters.
function buildInput4(node) {
  const c = () => node.channel;
  const rows = [['t_cc_tc_tx [ns]', 't_cc_tc_tx'], ['t_cc_tc_rx [ns]', 't_cc_tc_rx']]
    .map(([label, key]) => sliderRow(label, c, key));
  return column('settings-column', 'Input 4: MCU Delays', [el('table', { class: 'sim-slider-table' }, rows)]);
}

// Input 5: frame content (layout as in the Frame Generator).
function buildInput5(node) {
  const f = () => node.frame;
  const data = el('textarea', {
    class: 'input-field', rows: 4, style: 'width:34ch; resize:vertical;', placeholder: 'DE AD BE EF ...',
  });
  const showData = () => {
    if (document.activeElement !== data) data.value = f().data.map((b) => hex(b, 2).slice(2)).join(' ');
  };
  views.push(showData);
  data.addEventListener('input', () => {
    const bytes = parseBytes(data.value);
    data.classList.toggle('input-error', !bytes.length);
    if (bytes.length) { f().data = bytes; changed(); }
  });
  data.addEventListener('blur', showData);
  const hint = (t) => el('span', { class: 'range-hint', text: t });
  const row = (label, ...c) => tr(td(label), el('td', {}, c));
  const flag = (key) => checkInput(() => f()[key], (v) => { f()[key] = v ? 1 : 0; });
  const table = el('table', { class: 'input-table' }, [
    row('Frame Type', 'CAN XL: XBFF (ID11)'),
    row('ID (hex)', hexInput(() => f().id, (v) => { f().id = v; }, 3, 12)),
    row('DLC', numInput(() => f().dlc, (v) => { f().dlc = v; }, { min: 0, max: 2047, style: 'width:8ch' }), hint('(0–2047)')),
    row('RRS', flag('rrs')),
    row('SEC', flag('sec')),
    row('SDT (hex)', hexInput(() => f().sdt, (v) => { f().sdt = v; }, 2, 8)),
    row('VCID (hex)', hexInput(() => f().vcid, (v) => { f().vcid = v; }, 2, 8)),
    row('AF (hex)', hexInput(() => f().af, (v) => { f().af = v; }, 8, 12), hint(' [31:0]')),
    row('Data (hex)', data),
  ]);
  return column('settings-column', 'Input 5: Frame', [table]);
}

// Copy everything of Node 1 (incl. frame) except Node 2's own start delay.
function copyNode1() {
  const [n1, n2] = cfg.nodes;
  for (const k of ['clkMHz', 'df', 'tms', 'tdc', 'transceiverType', 'bt', 'channel', 'transceiver', 'frame']) {
    n2[k] = structuredClone(n1[k]);
  }
  changed();
}

function buildNodeConfig(node) {
  const head = el('div', { class: 'sim-part-head' }, [
    el('h3', { class: 'sim-part-title', text: `${node.label} Configuration` }),
  ]);
  if (node.index === 1) {
    const b = el('button', { type: 'button', class: 'styled-button', text: 'Copy Node 1 configuration' });
    b.addEventListener('click', copyNode1);
    head.append(b);
  }
  return el('section', { class: 'sim-part sim-part-dark' }, [head, el('div', { class: 'responsive-container' }, [
    buildInput1(node), buildInput2(node), buildOutput1(node), buildOutput2(node),
    buildInput3(node), buildInput4(node), buildInput5(node),
  ])]);
}

function buildBusConfig() {
  const table = el('table', { class: 'sim-slider-table' }, [sliderRow('t_cable [ns]', () => cfg.bus, 't_cable')]);
  return el('section', { class: 'sim-part sim-part-dark' }, [
    el('h3', { class: 'sim-part-title', text: 'Bus Configuration' }),
    el('div', { class: 'responsive-container' }, [column('settings-column', 'Bus Parameter', [table])]),
  ]);
}

function buildConfig() {
  const host = document.getElementById('sim-config');
  host.append(buildBusConfig(), ...cfg.nodes.map(buildNodeConfig));
  setupToggle(host, 'sim-config-toggle', (v) => { configVisible = v; });
}

// Hidden by default; onChange(visible) runs before the views are refreshed.
function setupToggle(host, btnId, onChange = () => {}) {
  const btn = document.getElementById(btnId);
  let visible = false;
  const show = () => {
    host.style.display = visible ? '' : 'none';
    btn.textContent = visible ? 'Hide' : 'Show';
  };
  show();
  btn.addEventListener('click', () => {
    visible = !visible;
    onChange(visible);
    show();
    if (visible) refreshViews();
  });
}

// ---- evaluation view: propagation delays (df ignored, nominal clock) --------

function buildEvalNode(i) {
  const a = i + 1;
  const b = 2 - i;
  const me = () => cfg.nodes[i];
  const far = () => cfg.nodes[1 - i];
  const oneWay = (from, to) => from.channel.t_cc_tc_tx + from.transceiver.t_tc_tx + cfg.bus.t_cable
    + to.transceiver.t_tc_rx + to.channel.t_cc_tc_rx;
  const propseg = () => me().bt.arb.prop * me().bt.arb.brp * 1000 / me().clkMHz;
  const rows = [
    [`t${a}_propseg`, propseg,
      `PropSeg_arb · BRP / f_clk${a}`, 'PropSeg duration (arbitration phase)'],
    [`t${a}_cable_max`, () => propseg() / 2 - me().channel.t_cc_tc_tx - me().transceiver.t_tc_tx
      - far().transceiver.t_tc_rx - far().channel.t_cc_tc_rx,
      `t${a}_propseg / 2 - t${a}_cc_tc_tx - t${a}_tc_tx - t${b}_tc_rx - t${b}_cc_tc_rx`, 'maximum supported cable length'],
    [`t_n${a}_n${b}`, () => oneWay(me(), far()),
      `t${a}_cc_tc_tx + t${a}_tc_tx + t_cable + t${b}_tc_rx + t${b}_cc_tc_rx`, `Node ${a} ⇒ Node ${b} one way propagation delay`],
    ['t_round_trip', () => oneWay(me(), far()) + oneWay(far(), me()),
      `t_n${a}_n${b} + t_n${b}_n${a}`, 'round trip delay, with same transceivers it is 2 · t_one_way'],
  ];
  const table = el('table', {}, [
    el('thead', {}, [tr(...['Parameter', 'Value', 'Formula', 'Description'].map((t) => el('th', { text: t })))]),
    el('tbody', {}, rows.map(([name, f, formula, desc]) => tr(
      td(name), el('td', { style: 'white-space:nowrap' }, [resultField(() => fix(f(), 1)), ' ns']), td(formula), td(desc),
    ))),
  ]);
  return column('settings-column', `Calculation for Node ${a}`, [table]);
}

function buildEval() {
  const host = document.getElementById('sim-eval');
  host.append(el('section', { class: 'sim-part sim-part-dark' }, [
    el('div', { class: 'responsive-container' }, cfg.nodes.map((_, i) => buildEvalNode(i))),
  ]));
  setupToggle(host, 'sim-eval-toggle');
}

// ---- markers: cursor line with time readout, pinned markers -----------------

// Pinned marker times (ns); kept across re-runs.
const pins = [];

const fmtNs = (t) => `${t.toFixed(1)} ns`;

function markerEl(m, color, width) {
  const line = el('div', { class: 'sim-marker' });
  line.style.borderLeft = `${width}px solid ${color}`;
  const label = el('div', { class: 'sim-marker-label' });
  label.style.color = color;
  label.style.background = m.labelBg;
  label.style.fontSize = `${m.labelFontSize}px`;
  return { line, label };
}

function placeMarker({ line, label }, x, text, delta = '') {
  line.style.left = `${x}px`;
  label.style.left = `${x + 4}px`;
  label.textContent = text;
  if (delta) label.append(el('br'), el('b', { text: delta }));
}

function setupMarkers(scroller, axis, m) {
  if (!scroller) return;
  const tToX = (t) => axis.left + t * axis.pxPerNs;
  const xToT = (x) => (x - axis.left) / axis.pxPerNs;
  const contentX = (e) => e.clientX - scroller.getBoundingClientRect().left + scroller.scrollLeft;

  const pinLayer = el('div');
  scroller.appendChild(pinLayer);
  const drawPins = () => {
    pinLayer.innerHTML = '';
    pins.sort((a, b) => a - b).forEach((t, i) => {
      const mk = markerEl(m, m.pinColor, m.pinWidth);
      const delta = i > 0 ? `Δ ${fmtNs(t - pins[i - 1])}` : '';
      placeMarker(mk, tToX(t), fmtNs(t), delta);
      mk.label.style.top = '2px';
      pinLayer.append(mk.line, mk.label);
    });
  };

  const cursor = markerEl(m, m.cursorColor, m.cursorWidth);
  cursor.label.style.bottom = '2px';
  cursor.line.style.display = cursor.label.style.display = 'none';
  scroller.append(cursor.line, cursor.label);

  scroller.addEventListener('mousemove', (e) => {
    const x = contentX(e);
    const t = xToT(x);
    const last = pins.length ? pins[pins.length - 1] : null;
    const delta = last === null ? '' : `Δ ${fmtNs(t - last)}`;
    placeMarker(cursor, x, fmtNs(t), delta);
    cursor.line.style.display = cursor.label.style.display = 'block';
  });
  scroller.addEventListener('mouseleave', () => {
    cursor.line.style.display = cursor.label.style.display = 'none';
  });
  // Click pins a marker; clicking near an existing pin removes it.
  scroller.addEventListener('click', (e) => {
    const x = contentX(e);
    const hit = pins.findIndex((t) => Math.abs(tToX(t) - x) <= m.snapPx);
    if (hit >= 0) pins.splice(hit, 1);
    else pins.push(xToT(x));
    drawPins();
  });
  drawPins();
}

// ---- zoom / wheel scrolling -------------------------------------------------

// Current zoom = pixel width of a data bit; kept across re-runs.
let zoomPx = null;
let lastResult = null;

const viewCfg = () => ({ ...cfg, view: { ...cfg.view, dataBitPx: zoomPx } });

// Zoom so that time t stays at offsetPx from the left edge of the visible area.
function zoomTo(px, t, offsetPx) {
  const z = cfg.view.zoom;
  zoomPx = Math.min(z.maxDataBitPx, Math.max(z.minDataBitPx, px));
  render({ t, offsetPx });
}

// Fill the zoom buttons into the result button row.
function buildZoomBar(bar, getScroller) {
  const z = cfg.view.zoom;
  bar.innerHTML = '';
  const centerZoom = (f) => {
    const sc = getScroller();
    const axis = timeAxis(lastResult, viewCfg());
    const offset = sc.clientWidth / 2;
    zoomTo(zoomPx * f, (sc.scrollLeft + offset - axis.left) / axis.pxPerNs, offset);
  };
  const btn = (text, title, fn) => {
    const b = el('button', { type: 'button', class: 'styled-button', title, text });
    b.addEventListener('click', fn);
    return b;
  };
  bar.append(
    btn('−', 'Zoom out', () => centerZoom(1 / z.step)),
    btn('+', 'Zoom in', () => centerZoom(z.step)),
    btn('Fit', 'Show the whole frame', () => fitView(getScroller())),
    el('span', { class: 'sim-zoom-info', text: `Scroll (horizontal): wheel, Zoom: CTRL + wheel (data bit = ${zoomPx.toFixed(1)} px)` }),
  );
}

// Zoom so that the whole frame fits into the visible width.
function fitView(scroller) {
  zoomTo((scroller.clientWidth - 30) / lastResult.busTotalT * lastResult.dataBitNs, 0, 0);
}

function setupWheel(scroller, axis) {
  const z = cfg.view.zoom;
  scroller.addEventListener('wheel', (e) => {
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 16 : 1; // line-based deltas (Firefox)
    if (e.ctrlKey) {
      const offset = e.clientX - scroller.getBoundingClientRect().left;
      const t = (scroller.scrollLeft + offset - axis.left) / axis.pxPerNs;
      zoomTo(zoomPx * (e.deltaY < 0 ? z.step : 1 / z.step), t, offset);
    } else {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scroller.scrollLeft += d * unit * z.wheelScrollFactor;
    }
  }, { passive: false });
}

// Draw lastResult at the current zoom. anchor = { t, offsetPx } or keep scroll position.
function render(anchor) {
  const out = document.getElementById('sim-output');
  const prev = out.querySelector('.sim-node-scroller');
  const prevScroll = prev ? prev.scrollLeft : 0;
  const vc = viewCfg();
  out.innerHTML = '';
  buildZoomBar(document.getElementById('sim-zoom-host'), () => out.querySelector('.sim-node-scroller'));
  out.insertAdjacentHTML('beforeend', renderResult(lastResult, vc));
  const scroller = out.querySelector('.sim-node-scroller');
  const axis = timeAxis(lastResult, vc);
  scroller.scrollLeft = anchor ? axis.left + anchor.t * axis.pxPerNs - anchor.offsetPx : prevScroll;
  setupMarkers(scroller, axis, cfg.view.marker);
  setupWheel(scroller, axis);
}

// ---- run / render ----------------------------------------------------------

let runTimer = null;
function scheduleRun() {
  clearTimeout(runTimer);
  runTimer = setTimeout(run, 200);
}

function run() {
  const errBox = document.getElementById('sim-errors');
  const out = document.getElementById('sim-output');
  const v = validateConfig(cfg);
  if (!v.valid) {
    errBox.style.display = 'block';
    errBox.innerHTML = '<strong>Configuration errors:</strong><ul>'
      + v.errors.map((e) => `<li>${e}</li>`).join('') + '</ul>';
    out.innerHTML = '';
    return;
  }
  errBox.style.display = 'none';
  try {
    lastResult = runSimulation(cfg);
    const first = zoomPx === null;
    if (first) zoomPx = cfg.view.dataBitPx;
    render();
    if (first) fitView(out.querySelector('.sim-node-scroller'));
  } catch (e) {
    errBox.style.display = 'block';
    errBox.textContent = 'Simulation error: ' + (e && e.message ? e.message : e);
    out.innerHTML = '';
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

// ---- share link: all user parameters in the URL hash ------------------------

const NODE_KEYS = ['clkMHz', 'df', 'tms', 'tdc', 'transceiverType', 'txStartDelay', 'bt', 'channel', 'transceiver', 'frame'];

function userSettings() {
  return {
    nodes: cfg.nodes.map((n) => Object.fromEntries(NODE_KEYS.map((k) => [k, n[k]]))),
    bus: cfg.bus,
    pins,
  };
}

// Copy only keys known in target with a matching type (untrusted input from the URL).
function mergeKnown(target, src) {
  if (!src || typeof src !== 'object') return;
  for (const k of Object.keys(target)) {
    const t = target[k];
    const s = src[k];
    if (s === undefined) continue;
    if (Array.isArray(t)) {
      if (Array.isArray(s) && s.length && s.every((v) => Number.isFinite(v))) target[k] = s.slice();
    } else if (t && typeof t === 'object') {
      mergeKnown(t, s);
    } else if (typeof s === typeof t && (typeof s !== 'number' || Number.isFinite(s))) {
      target[k] = s;
    }
  }
}

function applySettingsFromHash() {
  const raw = new URLSearchParams(location.hash.slice(1)).get('cfg');
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    cfg.nodes.forEach((n, i) => mergeKnown(n, s.nodes?.[i]));
    mergeKnown(cfg.bus, s.bus);
    if (Array.isArray(s.pins)) pins.push(...s.pins.filter((t) => Number.isFinite(t)));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[Warning] Invalid settings in link:', e);
  }
}

async function copyShareLink(button) {
  const link = `${location.origin}${location.pathname}#cfg=${encodeURIComponent(JSON.stringify(userSettings()))}`;
  let ok = true;
  try {
    await navigator.clipboard.writeText(link);
  } catch {
    // Fallback for contexts without clipboard permission.
    const tmp = el('textarea');
    tmp.value = link;
    document.body.append(tmp);
    tmp.select();
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    tmp.remove();
  }
  const original = button.dataset.originalLabel || button.textContent;
  button.dataset.originalLabel = original;
  button.textContent = ok ? 'Link copied!' : 'Copy failed';
  setTimeout(() => { button.textContent = original; }, 1500);
}

const versionEl = document.getElementById('appVersion');
if (versionEl) versionEl.textContent = APP_VERSION;
const shareBtn = document.getElementById('copyShareLinkButton');
shareBtn.addEventListener('click', () => copyShareLink(shareBtn));
applySettingsFromHash();
buildSetup();
buildEval();
buildConfig();
refreshViews();
run();
