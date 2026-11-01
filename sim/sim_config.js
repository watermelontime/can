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

// Default clock / bit timing / TMS of both nodes.
const DEFAULT_PRESET = 'cfg01';

function defaultNode(index) {
  const isNode1 = index === 0;
  const node = {
    index,
    label: `Node ${index + 1}`,
    df: 0.2,                 // clock tolerance in %, independent per node
    tdc: false,              // Transmitter Delay Compensation (not used by the simulation yet)
    transceiverType: 'TSICXL', // only SIC XL is simulated
    txStartDelay: 0,         // ns, Node 2 only: idle until then
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
  return { t_cc_tc_tx: 15, t_cc_tc_rx: 20 };
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
    tselect_threshold: 700,  // ns
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
      txCc:     'TX_CC',
      txBus:    'TX_bus',
      rxCc:     'RX_CC',
      tcState:  'TC state',
      tcPreselect: 'TC preselect',
    },
    colors: {
      roleTx:    '#dfe8f3', // Node state: Transmitter
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
      frameOpacity: 0.5,     // fill opacity of the frame colors above
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
      stateSIC:    '#90caf9',
      stateFastTx: '#a5d6a7',
      stateFastRx: '#fce3bb',
      activeRecessiveColor: '#ff6666', // background of TX_bus / RX_CC during active recessive
      activeRecessiveOpacity: 0.25,    // overlapping phases (both nodes) look darker
      preFastTx:   '#a5d6a7', // TC preselect band, same as stateFastTx
      preFastRx:   '#fce3bb', // TC preselect band, same as stateFastRx
      grid:   '#cccccc', // horizontal grid line between the two nodes in SVG
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
