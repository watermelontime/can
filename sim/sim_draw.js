// All rights reserved. (c) 2026 //
// =============================================================================
// sim_draw.js — SVG rendering of a simulation result. Pure string generation;
// only sim_main.js injects the result into the DOM. Time is mapped linearly to
// pixels (data bit = view.dataBitPx), so arbitration bits appear proportionally
// wider by their bit-time ratio. Horizontal scrolling shows the full frame.
// =============================================================================

import { RECESSIVE } from './sim_bittiming.js';
import { STATE_FAST_TX, STATE_FAST_RX } from './sim_transceiver.js';
import { FIELD_NAMES } from './sim_bsp.js';

const ML = 96;          // width of the fixed label column (px)
const CL = 4;           // left padding of the scrolling content (px)
const PAD = 20;         // right padding (px)
const ROW_H = 20;       // metadata band row height
const WAVE_GAP = 8;     // gap between waveforms

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Nominal data bit length sets the pixel scale.
function pxPerNs(result, view) {
  return view.dataBitPx / result.dataBitNs;
}

// Step waveform as an SVG polyline. v=RECESSIVE -> top, v=DOMINANT -> bottom.
function waveform(sig, t1, x, yTop, yBot, color, lineWidth) {
  const yFor = (v) => (v === RECESSIVE ? yTop : yBot);
  let level = RECESSIVE;
  const pts = [[x(0), yFor(level)]];
  for (const e of sig) {
    if (e.t < 0) { level = e.v; continue; }
    if (e.t > t1) break;
    const px = x(e.t);
    pts.push([px, yFor(level)]);
    level = e.v;
    pts.push([px, yFor(level)]);
  }
  pts.push([x(t1), yFor(level)]);
  const d = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return `<polyline points="${d}" fill="none" stroke="${color}" stroke-width="${lineWidth}" />`;
}

// A labelled band of boxes along the time axis. align: 'left' | 'center' | 'auto'.
function band(items, x, y, h, fill, textColor, fontSize, align = 'auto') {
  let s = '';
  for (const it of items) {
    const x0 = x(it.t0);
    const w = x(it.t1) - x0;
    if (w <= 0) continue;
    s += `<rect x="${x0.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h}" `
       + `fill="${it.fill || fill}" fill-opacity="${it.opacity ?? 1}" stroke="#ffffff" stroke-width="0.5" />`;
    if (it.label && w > String(it.label).length * fontSize * 0.6 + 4) {
      // auto: wide spans get a left-aligned label so it is visible at the span start.
      const left = align === 'left' || (align === 'auto' && w > 300);
      const tx = left ? x0 + 6 : x0 + w / 2;
      s += `<text x="${tx.toFixed(1)}" y="${textY(y, h, fontSize)}" text-anchor="${left ? 'start' : 'middle'}" `
         + `font-size="${fontSize}" fill="${textColor}">${esc(it.label)}</text>`;
    }
  }
  return s;
}

// Baseline that vertically centres text of the given size in a row.
function textY(y, h, fontSize) {
  return (y + h / 2 + fontSize * 0.35).toFixed(1);
}

function rowLabel(text, y, h, fontSize) {
  return `<text x="6" y="${textY(y, h, fontSize)}" font-size="${fontSize}" fill="#444">${esc(text)}</text>`;
}

function stateColor(state, colors) {
  if (state === STATE_FAST_TX) return colors.stateFastTx;
  if (state === STATE_FAST_RX) return colors.stateFastRx;
  return colors.stateSIC;
}

// Draws one node block starting at y0; returns { content, labels, height }.
// labels go to the fixed label column, content to the scrolling SVG.
function drawNode(node, result, view, y0) {
  const colors = view.colors;
  const pps = pxPerNs(result, view);
  const t1 = result.busTotalT;
  const x = (t) => CL + t * pps;
  const fs = view.fontSize.label;
  const fsHead = view.fontSize.headline;

  // Merge consecutive bits sharing the same key into labelled spans.
  const mergeBy = (key, labelOf) => {
    const items = [];
    for (const b of node.bits) {
      const last = items[items.length - 1];
      if (last && last.key === b[key]) last.t1 = b.t1;
      else items.push({ key: b[key], t0: b.t0, t1: b.t1, label: labelOf(b[key]) });
    }
    return items;
  };
  const roleLabel = { transmitter: 'Transmitter', receiver: 'Receiver', idle: 'Idle' };
  const roleFill = { transmitter: colors.roleTx, receiver: colors.roleRx, idle: colors.roleIdle };
  const roleItems = node.roleSegs.map((s) => ({
    t0: s.t0, t1: s.t1, label: roleLabel[s.role], fill: roleFill[s.role],
  }));
  const op = colors.frameOpacity;
  const phaseItems = mergeBy('phase', (p) => (p === 'arb' ? 'Arbitration phase' : 'Data phase'))
    .map((it) => ({ ...it, fill: it.key === 'arb' ? colors.phaseArb : colors.phaseData, opacity: op }));
  // Field / subfield colors as in the Frame Generator: subfields alternate a, b, a, ... per field.
  const pairOf = (field) => colors.fieldColors[field] || [colors.bit, colors.bit];
  const fieldItems = mergeBy('field', (f) => FIELD_NAMES[f] ?? f)
    .map((it) => ({ ...it, fill: pairOf(it.key)[0], opacity: op }));
  const subfieldItems = [];
  const bitSubfieldFill = [];
  let alt = 0;
  node.bits.forEach((b, i) => {
    const last = subfieldItems[subfieldItems.length - 1];
    if (last && last.key === b.subfield && last.field === b.field) {
      last.t1 = b.t1;
    } else {
      alt = last && last.field === b.field ? alt + 1 : 0;
      subfieldItems.push({
        key: b.subfield, field: b.field, t0: b.t0, t1: b.t1, label: b.subfield,
        fill: pairOf(b.field)[alt % 2], opacity: op,
      });
    }
    bitSubfieldFill[i] = subfieldItems[subfieldItems.length - 1].fill;
  });
  // Bit band: background of the corresponding subfield.
  const bitItems = node.bits.map((b, i) => ({
    t0: b.t0, t1: b.t1,
    label: b.stuff ? 's' : `${b.name}`,
    fill: b.error ? colors.bitError : (b.stuff ? colors.bitStuff : bitSubfieldFill[i]),
    opacity: b.error || b.stuff ? 1 : op,
  }));
  // Bit-phase band (level 5): SyncSeg / PropSeg / PhaseSeg1 / PhaseSeg2.
  const segItems = [];
  for (const b of node.bits) {
    let t = b.t0;
    for (const [k, label, fill] of [
      ['sync', 'Sync', colors.segSync], ['prop', 'Prop', colors.segProp],
      ['ps1', 'PS1', b.segs.ps1Sync ? colors.syncPhaseSegColor : colors.segPs1],
      ['ps2', 'PS2', b.segs.ps2Sync ? colors.syncPhaseSegColor : colors.segPs2],
    ]) {
      const d = b.segs[k];
      if (d > 0) segItems.push({ t0: t, t1: t + d, label, fill });
      t += d;
    }
  }

  let y = y0 + 4;
  let svg = '';
  let labels = '';

  labels += `<text x="6" y="${y + fsHead}" font-size="${fsHead}" font-weight="bold" fill="#222">`
       + `${esc(node.label)}</text>`;
  y += fsHead + 6;

  const names = view.rowNames;
  const traceTop = y;
  labels += rowLabel(names.role, y, ROW_H, fs);
  svg += band(roleItems, x, y, ROW_H, colors.roleTx, '#222', fs, 'left'); y += ROW_H;
  const phaseY = y;
  labels += rowLabel(names.phase, y, ROW_H, fs);
  svg += band(phaseItems, x, y, ROW_H, colors.phaseArb, '#222', fs, 'left'); y += ROW_H;
  labels += rowLabel(names.field, y, ROW_H, fs);
  svg += band(fieldItems, x, y, ROW_H, colors.bit, '#222', fs, 'center'); y += ROW_H;
  labels += rowLabel(names.subField, y, ROW_H, fs);
  svg += band(subfieldItems, x, y, ROW_H, colors.bit, '#222', fs, 'center'); y += ROW_H;
  labels += rowLabel(names.bit, y, ROW_H, fs);
  svg += band(bitItems, x, y, ROW_H, colors.bit, '#222', fs, 'center'); y += ROW_H;
  const spTop = y;
  labels += rowLabel(names.bitPhase, y, ROW_H, fs);
  svg += band(segItems, x, y, ROW_H, colors.segSync, '#555', fs, 'center'); y += ROW_H;

  const wavesTop = y + 6;
  const rows = [
    { label: names.txCc, sig: node.txcc, color: colors.tx_cc },
    { label: names.txBus, sig: node.txbus, color: colors.tx_bus },
    { label: names.rxCc, sig: node.rxcc, color: colors.rx_cc },
  ];
  const WAVE_H = view.waveHeight;
  const spBottom = wavesTop + rows.length * (WAVE_H + WAVE_GAP) - WAVE_GAP;

  let spLines = '';
  for (const b of node.bits) {
    if (b.spTime === null) continue;
    const px = x(b.spTime);
    spLines += `<line x1="${px.toFixed(1)}" y1="${spTop}" x2="${px.toFixed(1)}" y2="${spBottom}" `
             + `stroke="${colors.spLine}" stroke-width="${view.spLine.width}" `
             + `${view.spLine.dash ? `stroke-dasharray="${view.spLine.dash}" ` : ''}opacity="${view.spLine.opacity}" />`;
  }

  // Waveforms.
  let yy = wavesTop;
  let waves = '';
  for (const r of rows) {
    labels += rowLabel(r.label, yy, WAVE_H, fs);
    waves += waveform(r.sig, t1, x, yy + 6, yy + WAVE_H - 6, r.color, view.waveLineWidth);
    yy += WAVE_H + WAVE_GAP;
  }

  // Transceiver state band (coloured per mode).
  labels += rowLabel(names.tcState, yy, ROW_H, fs);
  const stateItems = node.txState.map((s) => ({
    t0: s.t0, t1: s.t1, label: s.state, fill: stateColor(s.state, colors),
  }));
  const stateBand = band(stateItems, x, yy, ROW_H, colors.stateSIC, '#222', fs);
  yy += ROW_H;

  labels += rowLabel(names.tcPreselect, yy, ROW_H, fs);
  const preItems = node.txPre.map((s) => ({
    t0: s.t0, t1: s.t1, label: s.state,
    fill: s.state === STATE_FAST_TX ? colors.preFastTx : colors.preFastRx,
  }));
  const preBand = band(preItems, x, yy, ROW_H, colors.preFastRx, '#222', fs);
  yy += ROW_H;

  // Error marker; text sits on the phase row (spec §13.4).
  let errMark = '';
  if (node.errorAt != null) {
    const px = x(node.errorAt);
    errMark = `<line x1="${px.toFixed(1)}" y1="${traceTop}" x2="${px.toFixed(1)}" y2="${yy}" stroke="#d50000" stroke-width="1.5" />`
      + `<text x="${(px + 4).toFixed(1)}" y="${textY(phaseY, ROW_H, fs)}" font-size="${fs}" fill="#d50000" font-weight="bold">${esc(view.errorText)}</text>`;
  }

  return { content: svg + waves + stateBand + preBand + spLines + errMark, labels, height: yy + 10 - y0 };
}

// Mapping between time (ns) and the x coordinate within the scrolling SVG.
export function timeAxis(result, cfg) {
  return { left: CL, pxPerNs: pxPerNs(result, cfg.view) };
}

const NODE_GAP = 24;

// Render both nodes stacked: a fixed label column plus one scrolling SVG for
// all nodes, so the nodes scroll together and the row names stay in place.
export function renderResult(result, cfg) {
  const view = cfg.view;
  const width = CL + result.busTotalT * pxPerNs(result, view) + PAD;
  const divider = (w, yLine) => `<line x1="0" y1="${yLine}" x2="${w}" y2="${yLine}" `
    + `stroke="${view.colors.grid}" stroke-width="1" />`;
  let y = 0;
  let content = '';
  let labels = '';
  result.nodes.forEach((node, i) => {
    if (i > 0) {
      content += divider(width.toFixed(0), y + NODE_GAP / 2);
      labels += divider(ML, y + NODE_GAP / 2);
      y += NODE_GAP;
    }
    const n = drawNode(node, result, view, y);
    content += n.content;
    labels += n.labels;
    y += n.height;
  });
  return `<div class="sim-figure">`
    + `<svg class="sim-label-svg" width="${ML}" height="${y}" viewBox="0 0 ${ML} ${y}" `
    + `xmlns="http://www.w3.org/2000/svg">${labels}</svg>`
    + `<div class="sim-node-scroller"><svg class="sim-node-svg" width="${width.toFixed(0)}" height="${y}" `
    + `viewBox="0 0 ${width.toFixed(0)} ${y}" xmlns="http://www.w3.org/2000/svg">${content}</svg></div>`
    + `</div>`;
}
