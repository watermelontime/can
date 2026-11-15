// All rights reserved. (c) 2026 //
// =============================================================================
// sim_config.js — configuration data model, defaults, validation.
// The config is a plain data object; derived values (PWM, timelines) are
// computed by sim_bittiming / sim_engine.
// =============================================================================

// Bit timing presets for the drop-down. Key = internal ID (unique), label = drop-down text.
//            label,            clkMHz, brp, | arb: prop, ps1, ps2, sjw | data: prop, ps1, ps2, sjw | tms
export const BT_PRESETS = {
  cfg01: ['500k / 20 Mbit/s @160MHz',   160,     1,         191,  64,  64,  64,           0,   4,   3,   3,   true],
  cfg02: ['1000k / 2 Mbit/s @10MHz',     10,     1,           5,   2,   2,   2,           0,   2,   2,   2,  false],
  cfg03: ['500k /  1 Mbit/s @160MHz',   160,     1,         191,  64,  64,  64,           0,  80,  79,  79,   true],
  cfg04: ['500k /  2 Mbit/s @160MHz',   160,     1,         191,  64,  64,  64,           0,  40,  39,  39,   true],
  cfg05: ['500k /  5 Mbit/s @160MHz',   160,     1,         191,  64,  64,  64,           0,  16,  15,  15,   true],
  cfg06: ['500k /  8 Mbit/s @160MHz',   160,     1,         191,  64,  64,  64,           0,  10,   9,   9,   true],
  cfg07: ['500k / 10 Mbit/s @160MHz',   160,     1,         191,  64,  64,  64,           0,   8,   7,   7,   true],
  cfg08: ['500k / 12 Mbit/s @160MHz',   160,     1,         191,  64,  64,  64,           0,   6,   6,   6,   true],
};

// Apply a preset (clock, bit timing, TMS) to a node; df and frame stay unchanged.
export function applyPreset(node, key) {
  const [, clkMHz, brp, aProp, aPs1, aPs2, aSjw, dProp, dPs1, dPs2, dSjw, tms] = BT_PRESETS[key];
  node.clkMHz = clkMHz;
  node.tms = tms;
  node.bt = {
    arb:  { brp, prop: aProp, ps1: aPs1, ps2: aPs2, sjw: aSjw },
    data: { brp, prop: dProp, ps1: dPs1, ps2: dPs2, sjw: dSjw },
  };
}

// Example configurations in drop-down.
// Loading an example
//    a) first resets all parameters to their defaults (defaultConfig()) and then
//    b) applies the values given here.
// Every parameter is optional: a parameter that is omitted (or set to null / undefined) keeps its default value.
// - nodes[0] = Node 1, nodes[1] = Node 2
// - times in ns, clkMHz in MHz, df in %
// - txStartDelay (per node): "delay TX start by [field] ns"
// - showSicTime: check box "SIC active recessive" (default false)
// - showPhaseError: check box "Phase Error" (default false)
// - markers: times in ns of the pinned markers, any number (default: none)
// - description: text shown in the "Description" box when the example is selected in the drop-down.
//     line break = new line, empty line = new paragraph,
//     lines starting with "- " = bullet list, lines starting with "1. " = numbered list,
//     **text** = bold
export const EXAMPLE_CONFIGS = [
  {
    label: '[POS] Default',          // nothing given => all defaults
    description: `
      **Default configuration: all parameters are set to their default values.**
      - Arbitration 500 kbit/s, Data 20 Mbit/s @ 160 MHz
      - Transceiver delays and asymmetries are at the maximum values allowed by the ISO 11898-2 specification (§6.5)
      - Node 1 wins arbiration
    `,
  },
  { // ---- CONFIGURATION START: 1.5 Mbit/s Arbitration, 20 Mbit/s Data, tSelect low
    label: '[POS] Arb 1.600 Mbit/s',
    description: `
      **Arbitration at 1.600 Mbit/s, Data at 20 Mbit/s.**
      - t_cable = 19.4 ns (max. possible)
      - tSelect threshold of both transceivers set to 600 ns (tBit = 625 ns)
      - Node 1 syncs on Node 2 and so completely uses PropSeg.
      - Node 1 wins arbitration
    `,
    bus: { t_cable: 31.3 },
    showSicTime: true,
    showPhaseError: true,
    nodes: [
      { // ---- Node 1 ----
        df: 0,
        txStartDelay: 400,
        bt: {
          arb:  { brp: 1, prop:  79, ps1: 10, ps2: 10, sjw: 10 },
          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
        },
        transceiver: {
          tselect_threshold: 600,
        },
        frame: { id: 0x55F, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
      { // ---- Node 2 ----
        df: 0,
        txStartDelay: 0,
        bt: {
          arb:  { brp: 1, prop:  79, ps1: 10, ps2: 10, sjw: 10 },
          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
        },
        transceiver: {
          tselect_threshold: 600,
        },
        frame: { id: 0x577, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
    ],
  },
  { // ---- CONFIGURATION START: 1.5 Mbit/s Arbitration, 20 Mbit/s Data, tSelect low
    label: '[POS] Arb 1.495 Mbit/s',
    description: `
      **Arbitration at 1.495 Mbit/s, Data at 20 Mbit/s.**
      - t_cable = 31.3 ns (max. possible)
      - tSelect threshold of both transceivers set to 600 ns (tBit = 669 ns)
      - Node 1 syncs on Node 2 and so completely uses PropSeg.
      - Node 1 wins arbitration
    `,
    bus: { t_cable: 31.3 },
    showSicTime: true,
    showPhaseError: true,
    nodes: [
      { // ---- Node 1 ----
        df: 0,
        txStartDelay: 400,
        bt: {
          arb:  { brp: 1, prop:  82, ps1: 12, ps2: 12, sjw: 12 },
          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
        },
        transceiver: {
          tselect_threshold: 600,
        },
        frame: { id: 0x55F, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
      { // ---- Node 2 ----
        df: 0,
        txStartDelay: 0,
        bt: {
          arb:  { brp: 1, prop:  82, ps1: 12, ps2: 12, sjw: 12 },
          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
        },
        transceiver: {
          tselect_threshold: 600,
        },
        frame: { id: 0x577, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
    ],
  },
  { // ---- CONFIGURATION START: 1.5 Mbit/s Arbitration, 20 Mbit/s Data, tSelect low
    label: '[POS] Arb 1.495 Mbit/s + ideal system',
    description: `
      **Arbitration at 1.495 Mbit/s, Data at 20 Mbit/s in an IDEAL SYSTEM.**
      - Transceiver delays & asymmetries = 0 ns
      - df = 0 % (no clock tolerance)
      - t_cable = 256.3 ns (max. possible)
      - Node 1 syncs on Node 2 and so completely uses PropSeg
      - Node 1 wins arbitration
      - Markers are set at the interesting points in time.
    `,
    bus: { t_cable: 256.3 },
    showSicTime: true,
    showPhaseError: true,
    markers: [667.9, 924.8, 1181.3, 1187.5, 8538],    // e.g. [2000, 4000]
    nodes: [
      { // ---- Node 1 ----
        df: 0,
        txStartDelay: 400,
        bt: {
          arb:  { brp: 1, prop:  82, ps1: 12, ps2: 12, sjw: 12 },
          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
        },
        channel: { t_cc_tc_tx: 0, t_cc_tc_rx: 0 },
        transceiver: {
          t_tc_tx: 0, t_tc_rx: 0,
          a_sic_tx: 0, a_sic_rx: 0,
          a_fast_tx: 0, a_fast_rx: 0,
          tselect_threshold: 600,
          t_pas_rec_start: 530,
          sic2fast: 205, fast2sic: 245,
        },
        frame: { id: 0x555, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
      { // ---- Node 2 ----
        df: 0,
        txStartDelay: 0,
        bt: {
          arb:  { brp: 1, prop:  82, ps1: 12, ps2: 12, sjw: 12 },
          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
        },
        channel: { t_cc_tc_tx: 0, t_cc_tc_rx: 0 },
        transceiver: {
          t_tc_tx: 0, t_tc_rx: 0,
          a_sic_tx: 0, a_sic_rx: 0,
          a_fast_tx: 0, a_fast_rx: 0,
          tselect_threshold: 600,
          t_pas_rec_start: 530,
          sic2fast: 205, fast2sic: 245,
        },
        frame: { id: 0x555, rrs: 1, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
    ],
  },
  { // ---- CONFIGURATION START: SIC time leads to Arbitration fail ==> at ID24
    label: '[NEG] SIC limit + Full ID space',
    description: `
      **Negative example: SIC active recessive could lead to an arbitration failure.**
      - Dominant value and active recessive overlap during sample point of Node 1.
      - Marker: shows the point in time where the arbitration could fail.
      Hint: For failing several Nodes must loose arbitration at the same time, means N x active recessive is needed to fight a dominant bit.
    `,
    showSicTime: true,
    markers: [5788],               // e.g. [2000, 4000]
    bus: { t_cable: 150 },
    nodes: [
      { // ---- Node 1 ----
        bt: {
          arb:  { brp: 1, prop:  95, ps1: 32, ps2: 32, sjw: 32 },
          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
        },
        frame: { id: 0x500, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
      { // ---- Node 2 ----
        bt: {
          arb:  { brp: 1, prop:  95, ps1: 32, ps2: 32, sjw: 32 },
          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
        },
        frame: { id: 0x555, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
    ],
  },
  { // ---- CONFIGURATION START: 1 Mbit/s Arbitration, 2 Mbit/s Data, low number of TQ per bit as training example
    label: '[POS] Training example (Arb 1 Mbit/s, Data 2 Mbit/s)',
    description: `
      **Example for Synchronition and Bit Timing at Arb 1 Mbit/s, Data at 2 Mbit/s.**
      - Low number of Timequanta (TQ) per Bit
      - Node 1 syncs on Node 2 at SOF, so Node 1 and 2 hat the maximum phase shift.
      - Node 2 looses arbitration and has to sync on Node 1
    `,
    bus: { t_cable: 31.3 },
    showSicTime: false,
    showPhaseError: true,
    nodes: [
      { // ---- Node 1 ----
        clkMHz: 10,
        df: 0.2,
        txStartDelay: 400,
        tms: false,
        tdc: true,
        bt: {
          arb:  { brp: 1, prop:   5, ps1:  2, ps2:  2, sjw:  2 },
          data: {         prop:   0, ps1:  2, ps2:  2, sjw:  2 },
        },
        frame: { id: 0x55F, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
      { // ---- Node 2 ----
        clkMHz: 10,
        df: -0.5,
        txStartDelay: 0,
        tms: false,
        tdc: true,
        bt: {
          arb:  { brp: 1, prop:   5, ps1:  2, ps2:  2, sjw:  2 },
          data: {         prop:   0, ps1:  2, ps2:  2, sjw:  2 },
        },
        frame: { id: 0x577, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
      },
    ],
  },
//  {
//    // Template listing all parameters (values = defaults). Copy, rename and edit;
//    // delete the lines that shall stay at their default.
//    label: '[POS] Template (all parameters)',
//    description: `
//      Template that lists all parameters with their default values.
//      Intended as starting point for new entries in EXAMPLE_CONFIGS (sim_config.js).
//
//      How to add an example:
//      1. Copy the template
//      2. Change the label and the description
//      3. Edit the values, delete the lines that shall stay at their default
//    `,
//    showSicTime: false,
//    showPhaseError: false,
//    markers: [],               // e.g. [2000, 4000]
//    bus: { t_cable: 20 },
//    nodes: [
//      { // ---- Node 1 ----
//        clkMHz: 160,
//        df: 0.2,
//        txStartDelay: 0,
//        tms: true,
//        tdc: false,
//        bt: {
//          arb:  { brp: 1, prop: 191, ps1: 64, ps2: 64, sjw: 64 },
//          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
//        },
//        channel: { t_cc_tc_tx: 15, t_cc_tc_rx: 20 },
//        transceiver: {
//          t_tc_tx: 80, t_tc_rx: 110,
//          a_sic_tx: 10, a_sic_rx: 15,
//          a_fast_tx: 5, a_fast_rx: 5,
//          tselect_threshold: 980,
//          t_pas_rec_start: 530,
//          sic2fast: 205, fast2sic: 245,
//        },
//        frame: { id: 0x547, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x11] },
//      },
//      { // ---- Node 2 ----
//        clkMHz: 160,
//        df: -0.2,
//        txStartDelay: 0,
//        tms: true,
//        tdc: false,
//        bt: {
//          arb:  { brp: 1, prop: 191, ps1: 64, ps2: 64, sjw: 64 },
//          data: {         prop:   0, ps1:  4, ps2:  3, sjw:  3 },
//        },
//        channel: { t_cc_tc_tx: 15, t_cc_tc_rx: 20 },
//        transceiver: {
//          t_tc_tx: 80, t_tc_rx: 110,
//          a_sic_tx: 10, a_sic_rx: 15,
//          a_fast_tx: 5, a_fast_rx: 5,
//          tselect_threshold: 980,
//          t_pas_rec_start: 530,
//          sic2fast: 205, fast2sic: 245,
//        },
//        frame: { id: 0x567, rrs: 0, sec: 0, sdt: 0x88, vcid: 0x33, af: 0x01234567, dlc: 0, data: [0x22] },
//      },
//    ],
//  },
];

// Default clock / bit timing / TMS of both nodes.
const DEFAULT_PRESET = 'cfg01';

function defaultNode(index) {
  const isNode1 = index === 0;
  const node = {
    index,
    label: `Node ${index + 1}`,
    df: isNode1 ? 0.2 : -0.2, // clock tolerance in %, independent per node
    tdc: false,              // Transmitter Delay Compensation (not used by the simulation yet)
    transceiverType: 'TSICXL', // only SIC XL is simulated
    txStartDelay: 0,         // ns, the node is idle until then
    channel: defaultChannel(),
    transceiver: defaultTransceiver(),
    frame: {
      id:   isNode1 ? 0x547 : 0x567,
      rrs:  0,
      sec:  0,
      sdt:  0x88,
      vcid: 0x33,
      af:   0x01234567,
      dlc:  0,
      data: [isNode1 ? 0x11 : 0x22],
      pcrc: 0x155,           // 13-bit, fixed default
      fcrc: 0x55555555,      // 32-bit, fixed default
    },
  };
  applyPreset(node, DEFAULT_PRESET); // sets clkMHz, tms, bt
  return node;
}

// Slider ranges [min, max] in ns for channel / transceiver parameters (step 1).
// Transceiver delays and asymmetries follow the ISO 11898-2 bounds of the spec (§6.5).
export const SLIDER_RANGES = {
  t_cc_tc_tx:        [0, 100],
  t_cc_tc_rx:        [0, 100],
  t_cable:           [0, 700],
  txStartDelay:      [0, 2000],
  t_tc_tx:           [0, 80],    // according to ISO 11898-2 spec
  t_tc_rx:           [0, 110],   // according to ISO 11898-2 spec
  a_sic_tx:          [-10, 10],  // according to ISO 11898-2 spec
  a_sic_rx:          [-20, 15],  // according to ISO 11898-2 spec
  a_fast_tx:         [-5, 5],    // according to ISO 11898-2 spec
  a_fast_rx:         [-5, 5],    // according to ISO 11898-2 spec
  tselect_threshold: [500, 980], // according to ISO 11898-2 spec
  t_pas_rec_start:   [0, 530],
};

// Per-node path delays between CAN controller and transceiver.
function defaultChannel() {
  return {
    t_cc_tc_tx: 10,     // TX delay from CC to TC
    t_cc_tc_rx: 27.5    // RX delay from TC to CC
  };
}

// Bus between both transceivers (shared).
function defaultBus() {
  return { t_cable: 20 };
}

function defaultTransceiver() {
  return {
    t_tc_tx: 80,
    t_tc_rx: 110,
    a_sic_tx: 10,
    a_sic_rx: 15,
    a_fast_tx: 5,
    a_fast_rx: 5,
    tselect_threshold: 980,  // ns
    t_pas_rec_start: 530,    // ns, SIC active recessive phase after a rising edge / after entering SIC
    sic2fast: 205,           // ns (<= switches SIC -> FAST)
    fast2sic: 245,           // ns (>  switches FAST -> SIC)
  };
}

// Central appearance / view configuration.
function defaultView() {
  return {
    dataBitPx: 100,          // pixel width of one data bit; arb bits scale by bit-time ratio
    zoom: {
      step: 1.25,            // factor per Ctrl+wheel step / button click
      minDataBitPx: 0.5,
      maxDataBitPx: 1000,
      wheelScrollFactor: 1,  // horizontal scroll speed of the plain mouse wheel
    },
    errorText: 'error detected',
    noSyncText: 'no sync',   // phase error band: bits in which the node does not synchronize
    waveLineWidth: 1.5,      // px, stroke width of TX_CC / TX_bus / RX_CC
    hiZLine: {               // TX_bus high ohmic state (FAST_RX), color = tx_bus
      width: 1.5,            // px
      dash: '6,4',           // SVG stroke-dasharray
    },
    waveHeight: 42,          // px, row height of each waveform (incl. 6 px top/bottom margin)
    fontSize: {
      headline: 16,          // node headline, e.g. "Node 1 — transmitter"
      label: 14,             // row names and bit/field/state names
    },
    spLine: {
      width: 1.5,            // px
      dash: '2,2',           // SVG stroke-dasharray; '' = solid
      opacity: 0.5,
    },
    marker: {
      cursorColor: '#424242', // vertical line following the mouse
      cursorWidth: 1,           // px
      pinColor:    '#ff0000', // markers pinned by click (old: #ff6f00)
      pinWidth:    2,       // px
      labelFontSize: 14,      // px, time readout
      labelBg:     'rgba(255,255,255,0.85)',
      snapPx:      5,         // click within this distance of a pin removes it
    },
    rowNames: {
      role:     'Role',
      phase:    'Phase',
      field:    'Field',
      subField: 'SubField',
      bit:      'Bit',
      bitPhase: 'Bit phase',
      phaseError: 'Phase error',
      txCc:     'TX_CC',
      txBus:    'TX_bus',
      rxCc:     'RX_CC',
      tcState:  'TC state',
      tcPreselect: 'TC preselect',
    },
    colors: {
      roleTx:    '#9eacfc', // Node state: Transmitter (old color: #dfe8f3)
      roleRx:    '#fce3bb', // Node state: Receiver
      roleIdle:  '#f5f5f5', // Node state: Idle
      // Field / subfield / bit / phase backgrounds, same values as the Frame Generator (frame/frame_draw.js).
      // Per field ID [a, b]: field band uses a; subfields alternate a, b, a, ...; bits follow their subfield.
      fieldColors: {
        sofField:  ['#B0BEC5', '#CFD8DC'],
        arbField:  ['#74c0ff', '#BBDEFB'],
        ctrlField: ['#89cc8b', '#b9ddba'],
        dataField: ['#CE93D8', '#E1BEE7'],
        crcField:  ['#22f8ff', '#a1f1fc'],
        ackField:  ['#ee7ca2', '#F8BBD0'],
        eofField:  ['#B0BEC5', '#CFD8DC'],
      },
      phaseArb:  '#a1c7f0',
      phaseData: '#e27979',
      frameOpacity: 0.5,       // fill opacity of the frame colors above
      bit:       '#f5f5f5',  // fallback for bits outside the known fields
      bitStuff:  '#eeeeee',
      bitError:  '#ffcccc',
      tx_cc:  '#1565c0',
      tx_bus: '#2e7d32',
      rx_cc:  '#c62828',
      spLine: '#d50000',
      segSync: '#c8c8c8',    // bit-phase bands (level 5), light greys
      segProp: '#dadada',
      segPs1:  '#e8e8e8',
      segPs2:  '#f4f4f4',
      syncPhaseSegColor: '#ffd180', // PS1/PS2 lengthened/shortened by synchronization
      // Phase error band: light = |PE| <= SJW (correctable with the next sync) or hard sync, dark = |PE| > SJW
      pePosLight: '#a5d6a7', // positive PE (late edge)
      pePosDark:  '#2e7d32', // positive PE (late edge) & PE > SJW (not fully correctable with the next sync)
      peNegLight: '#ef9a9a', // negative PE (early edge)
      peNegDark:  '#c62828', // negative PE (early edge) & PE > SJW (not fully correctable with the next sync)
      peNoSync:   '#e0e0e0', // node does not synchronize (transmitter in the data phase)
      // Transceiver (TC)
      stateSIC:    '#90caf9',
      stateFastTx: '#a5d6a7',
      stateFastRx: '#fce3bb',
      activeRecessiveColor: '#ff6666', // background of TX_bus / RX_CC during active recessive
      activeRecessiveOpacity: 0.25,    // overlapping phases (both nodes) look darker
      preFastTx:   '#a5d6a7', // TC preselect band, same as stateFastTx
      preFastRx:   '#fce3bb', // TC preselect band, same as stateFastRx
      // misc
      grid:   '#cccccc', // horizontal grid line between the two nodes in SVG
      nodeBackgroundColor: '#ffffff', // Setup: background of the node boxes
      canBusColorWire1: '#2e7d32', // Setup: CAN bus twisted pair, wire 1 (same as tx_bus)
      canBusColorWire2: '#c2c2c2', // Setup: CAN bus twisted pair, wire 2
    },
  };
}

export function defaultConfig() {
  return {
    nodes: [defaultNode(0), defaultNode(1)],
    bus: defaultBus(),
    view: defaultView(),
  };
}

// Light validation: returns { valid, errors[] }. Boundary checks only.
export function validateConfig(cfg) {
  const errors = [];
  const req = (cond, msg) => { if (!cond) errors.push(msg); };

  cfg.nodes.forEach((n, i) => {
    req(n.clkMHz > 0, `Node ${i + 1}: clock frequency must be > 0`);
    req(n.df > -100, `Node ${i + 1}: df must be > -100 %`);
    ['arb', 'data'].forEach((ph) => {
      const b = n.bt[ph];
      req(b.brp >= 1, `Node ${i + 1} ${ph}: BRP must be >= 1`);
      req(b.ps1 >= 1, `Node ${i + 1} ${ph}: PhaseSeg1 must be >= 1`);
      req(b.ps2 >= 1, `Node ${i + 1} ${ph}: PhaseSeg2 must be >= 1`);
      req(b.prop >= 0, `Node ${i + 1} ${ph}: PropSeg must be >= 0`);
      req(b.sjw >= 1 && b.sjw <= b.ps2, `Node ${i + 1} ${ph}: SJW must be 1..PhaseSeg2`);
    });
    req(n.frame.id >= 0 && n.frame.id <= 0x7FF, `Node ${i + 1}: ID must be 11-bit`);
    req(n.transceiver.t_tc_tx >= 0 && n.transceiver.t_tc_rx >= 0, `Node ${i + 1}: transceiver delays must be >= 0`);
  });

  return { valid: errors.length === 0, errors };
}
