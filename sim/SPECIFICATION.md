# CAN Bus Simulator — Specification V0.1 (DRAFT)

> Status: **Specification draft for review.** No implementation until the user gives the explicit start command.
> Folder: `sim/`. Fourth tool of the CAN Tools website.

---

## 1. Overview & Goal

A single-page browser tool that simulates **two CAN XL controllers** connected through their
SIC XL transceivers and a cable, and visualizes what happens on the wire during
**arbitration, data transmission, and the ACK phase**.

Both nodes start transmitting at the same time. The tool computes the complete signal
history (static, one-shot) and renders, **per node**:

- **A hierarchical state trace** (transmitter/receiver → phase → field → bit → bit-phase + SP).
- **Three digital waveforms:** `TX_CC`, `TX_bus`, `RX_CC`.

The visual style is similar to (not identical to) the Frame Generator figures in
"real arb/data bit ratio" mode. Bit-phase segmentation is drawn **discreetly** using
light/opaque shades.

The reference sketches live in [simulation_sketch.pptx](simulation_sketch.pptx):
- **Slide 1** = configuration / block-diagram layout (incl. transceiver **TXD/RXD** pins and the
  transceiver **state visualization**).
- **Slide 2** = per-node trace + waveform layout.

The CAN standard reference is [ISO11898-1_2024_FINAL.PDF](ISO11898-1_2024_FINAL.PDF).

---

## 2. Scope & Non-Goals

### In scope
- CAN **XL** frame format only (**XLFF**, 11-bit ID).
- Two fully configurable nodes, both transmitting simultaneously.
- Simplified ISO 11898-1 controller model (see §7).
- SIC XL transceiver model with propagation delays + SIC/FAST rising-edge asymmetry + PWM decoding.
- Cable delay model.
- Static full-frame computation; no animation, no play/step controls.

### Explicit non-goals (controller model does **NOT** support)
- **No CRC calculation and no CRC check.** The CRC fields are **fixed defaults** transmitted verbatim and are
  **not user-editable**; any received CRC is accepted as valid.
- **No error-flag transmission.** On a detected error the node enters **error state and stays
  there forever** (no active/passive error flag is driven on the bus).
- No CAN CC / CAN FD frames.
- No bit-error injection UI beyond what the configurable frame fields allow.
- No message/retransmission logic, no IFS/intermission handling beyond EOF.

---

## 3. Technology Stack & File Structure

Follows the **Frame Generator** pattern: plain HTML/CSS + **ES modules** (`<script type="module">`),
no build step. Shared site chrome via `/can/menu.js` and `/can/footer.js`, shared `../styles.css`
plus a local stylesheet.

```
sim/
  index.html              # page shell + configuration UI + SVG containers
  style_sim.css           # local styles (sliders, trace rows, waveform colors)
  sim_main.js             # entry module: wires UI, orchestrates run, calls draw
  sim_config.js           # config data model, defaults, validation, (de)serialization
  sim_btl.js              # BTL: Bit Timing Logic (per node) — segmentation, sync/resync, SP sampling
  sim_bsp.js              # BSP: Bit Stream Processor (per node) — frame format, arbitration, errors, ACK
  sim_bittiming.js        # bit-time math, SP, PWM parameter derivation (shared helpers for BTL/BSP)
  sim_pwm.js              # PWM encoding block (per node) after BTL — ADH…FPC0, PWMO offset, TX_CC symbol gen (§9)
  sim_transceiver.js      # transceiver model: delays, SIC/FAST asymmetry, PWM decode
  sim_channel.js          # cc<->tc path delays + cable delay
  sim_engine.js           # top-level simulation loop over fine time grid, produces signal/trace data
  sim_draw.js             # SVG rendering of per-node trace + 3 waveforms
  versionhistory.html     # version log (as in other tools)
```

> File split is a proposal; may be consolidated during implementation. Each module exports
> pure functions / small classes; `sim_main.js` is the only module touching the DOM besides `sim_draw.js`.

---

## 4. Site Integration

IMPORTANT: The CAN Bus Simulator is under active development and not ready for public use.
Do not integrate the site yet. It shall be hidden for initial development and testing purposes.

---

## 5. System Model (block diagram — Slide 1)

```
 Node 1                                   cable                                   Node 2
 ┌──────────┐   t_cc_tc_tx →  ┌──────────┐          ┌──────────┐  ← t_cc_tc_rx   ┌──────────┐
 │  CC (1)  │ ─────────────── │ SIC XL   │ ==bus===│ SIC XL   │ ─────────────── │  CC (2)  │
 │          │ ← t_cc_tc_rx    │ transc.  │ t_cable │ transc.  │   t_cc_tc_tx →   │          │
 └──────────┘                 └──────────┘          └──────────┘                 └──────────┘
```

Signal path, TX direction (controller → bus):
`TX_CC` → (`t_cc_tc_tx`) → transceiver TX decode/drive → (`t_tc_tx` + asymmetry) → `TX_bus` on bus.

Signal path, RX direction (bus → controller):
bus → (`t_cable`) → other transceiver → (`t_tc_rx` + asymmetry) → (`t_cc_tc_rx`) → `RX_CC`.

The **bus level** is the wired-AND of both transceivers' driven levels (dominant `0` wins).

---

## 6. Configuration UI

Layout mirrors Slide 1 (block diagram with editable values) plus per-node frame and bit-timing panels.
All numeric inputs validated; invalid values flagged inline (reuse existing `.input-field` / error styles).

### 6.1 Per-node — Operation mode
| Field | Control | Default | Notes |
|---|---|---|---|
| Transceiver Mode Switching (TMS) | toggle ON/OFF | ON | Enables SIC→FAST switch + PWM in data phase. |
| Clock frequency | number (MHz) | 160 | |
| Clock tolerance `df` | number field, step 0.1 (spin buttons) | 0.2 | Relative clock deviation in %, may be **negative** (slower clock); **independent configuration parameter per node**. |

### 6.2 Per-node — Bit timing
| Parameter | Arb default | Data default |
|---|---|---|
| BRP | 1 | 1 |
| Prop seg (tq) | 191 | 0 |
| Phase seg 1 (tq) | 64 | 4 |
| Phase seg 2 (tq) | 64 | 3 |
| SJW (tq) | 64 | 3 |
| tq/bit | 320 | 8 |
| Resulting bit rate | 500 kbit/s | 20 Mbit/s |

With clk = 160 MHz → tq = 6.25 ns. Arb bit = 2000 ns; data bit = 50 ns.

Node 2 has a checkbox **"Use bit timing of Node 1"** (default: checked). When checked, Node 2's bit timing
inputs are locked and mirror Node 1's values (clock frequency and `df` stay per node).

A **"Bit timing preset"** drop-down loads predefined configurations into both nodes: clock frequency,
bit timing (arb + data) and TMS; `df` and frame contents stay unchanged. Each preset is defined by one line in
`BT_PRESETS` (`sim_config.js`): unique internal ID, drop-down label and values.
SyncSeg is always 1 tq. SP = after (Sync + Prop + PhaseSeg1).

**PWM configuration** (derived like the XL BT tool, editable/overridable): `PWMO`, `PWML`, `PWMS`
(clock-period counts). Used by the transceiver PWM decode (§9, §10).

### 6.3 Per-node — Frame (XLFF, 11-bit ID)
Fields in transmission order per ISO 11898-1 XL data frame:
SOF, ID[28:18], RRS, IDE, FDF, resXL/XLF marker, SBC bits, SDT, SEC, VCID, 
DLC (payload length), AF (acceptance field), **PCRC (13-bit)**, payload data, **FCRC (32-bit)**,
CRC delimiter, ACK slot, ACK delimiter, EOF.
The XLFF field list and sizes follow the XL frame definition in `frame/frame_definitions.js`.

> CRC is **never computed**: both CRCs are **fixed defaults** transmitted verbatim (allowing worst-case
> stuff/edge patterns) and are **not user-editable** — PCRC default `0x155`, FCRC default `0x55555555`.
> ACK slot handling: see §7.5.

**Default frame contents** (chosen so arbitration yields a clear winner/loser):

| Field | Node 1 | Node 2 |
|---|---|---|
| ID | 0x547 | 0x567 |
| RRS | 0 | 0 |
| SEC | 0 | 0 |
| SDT | 0x88 | 0x88 |
| VCID | 0x33 | 0x33 |
| AF | 0x01234567 | 0x01234567 |
| DLC | 0 | 0 |
| data | 0x11 | 0x22 |
| PCRC | 0x155 | 0x155 |
| FCRC | 0x55555555 | 0x55555555 |

### 6.4 Channel delays (per node; `t_cable` shared on the bus)
| Symbol | Meaning | Default |
|---|---|---|
| `t_cc_tc_tx` | CC → transceiver (TX path) | 15 ns |
| `t_cc_tc_rx` | transceiver → CC (RX path) | 20 ns |
| `t_cable` | transceiver ↔ transceiver (bus propagation) | 20 ns |
| `txStartDelay` (Node 2 only) | Node 2 is idle (Role = Idle) until this time, then starts transmitting. A recessive→dominant edge seen while idle is a hard sync on SOF; if Node 2 has not started transmitting by the SP of that SOF, it becomes receiver from that SP on | 0 ns |

### 6.5 Transceiver (per node, SIC XL)
| Symbol | Meaning | Min (ISO 11898-2) | Max (ISO 11898-2) |
|---|---|---|---|
| `t_tc_tx` | transceiver TX pin → bus | 0 ns |  80 ns (default)|
| `t_tc_rx` | bus → transceiver RX pin | 0 ns | 110 ns (default)|
| `a_sic_tx` | SIC-mode asymmetry added to rising edge, TX | -10 ns | +10 ns (default)|
| `a_sic_rx` | SIC-mode asymmetry added to rising edge, RX | -20 ns | +15 ns (default)|
| `a_fast_tx` | FAST-mode asymmetry added to rising edge, TX | -5 ns | +5 ns (default)|
| `a_fast_rx` | FAST-mode asymmetry added to rising edge, RX | -5 ns | +5 ns (default)|

Each asymmetry is a **slider** ranging within the ISO-defined bounds (as specified in the table). Asymmetry is applied **only to the rising (recessive-going) edge**.

All channel delays (§6.4) and transceiver parameters except `SIC→FAST` / `FAST→SIC` are set with a **slider
(step 1 ns)** plus a number field showing the value; slider ranges are defined in `SLIDER_RANGES`
(`sim_config.js`). `SIC→FAST` / `FAST→SIC` remain plain number fields.

> The Min/Max bounds are ISO 11898-2 placeholders (final values to be provided by the user); the **default** value equals the Max column.

### 6.6 Central / global configuration
All essential parameters shall be user-configurable from a **central place** (`defaultView()` in
`sim_config.js`), including:
- Colors of the waveforms and graphics (incl. SP line `spLine`, the four bit-phase greys
  `segSync` / `segProp` / `segPs1` / `segPs2`, transceiver state colors).
- Bit length of data bits (pixels).
- Font sizes: node headline, and one common size for row names and bit/field/state names.
- SP line style: width, dash pattern, opacity.
- Waveform line width and waveform row height (one value each for all three waveforms).
- Marker style: cursor and pinned-marker color/width, readout font size and background, click distance for
  removing a pinned marker.
- Zoom: step factor, min/max data bit width (px), mouse-wheel scroll speed.
- Error-state text.
- Horizontal scaling / zoom preferences.
- Transceiver-specific settings.
- default values for all configurable parameters.

---

## 7. CAN Controller Model (simplified ISO 11898-1)

Each node's controller is modelled as **two cooperating state machines**, mirroring real CAN
controller architecture. This separation keeps bit-level timing independent from frame-level logic.

```
        ┌──────────────────────────────┐      sampled bit value at Sample point, bit boundary (= sample point) tick
        │  BTL — Bit Timing Logic       │ ───────────────────────────────────────▶ ┌──────────────────────────────┐
        │  (knows only "what a bit is") │                                           │  BSP — Bit Stream Processor   │
 RX_CC ─▶  • bit-time segmentation      │ ◀─────────────────────────────────────── │  (knows the frame format)     │
        │  • SyncSeg/Prop/PS1/PS2       │      next TX bit value, TX enable         │                               │
 TX_CC ◀─  • sampling at SP             │                                           └──────────────────────────────┘
        │  • hard sync + resync (SJW)   │
        └──────────────────────────────┘
```

### 7.1 BTL — Bit Timing Logic
Operates purely at the level of a **single bit**. It knows nothing about fields, frame structure,
or arbitration. Responsibilities:
- Internal bit-time segmentation into **SyncSeg, PropSeg, PhaseSeg1, PhaseSeg2** (exposed for drawing).
- **Synchronization** (see §7.1.1), adjusting PhaseSeg1 (lengthen) / PhaseSeg2 (shorten) by up to SJW tq based
  on the measured phase error, per ISO 11898-1.
- **Sampling** the incoming level (`RX_CC`) at the **Sample Point** (`Sync + Prop + PhaseSeg1` from bit start).
- Driving the bit level provided by the BSP onto `TX_CC` for the duration of the bit
  (NRZ outside the PWM region, PWM symbols from ADH to FCP0 when TMS is ON — see §9).
- Emitting, each bit, to the BSP: the **sampled bit value** and a **bit-boundary tick**;
  also exposes the current bit-phase for the trace.

The two nodes run independent clocks (`df` each) inside their BTLs → edges drift relative to each other;
this drift drives the arbitration/sample-point behaviour the tool visualizes.

#### 7.1.1 Synchronization rules
- Synchronization is performed in **tq granularity**. The BTL counts node clock periods → time quanta and
  evaluates `RX_CC` at the **end of every tq**.
- **Edge timing:** an edge that happens in tq `q` is seen at the end of tq `q`; the phase error is `e = q`
  (SyncSeg = tq 0). If the edge happens in the **SyncSeg** (no resync necessary), the CC sees the new value at
  the end of the first tq. A resync is necessary when the (falling) edge happens **outside the SyncSeg**.
- Synchronization (hard sync and resync) only on **recessive→dominant** edges.
- When a synchronization makes a bit start at the edge, the edge tq (already elapsed) becomes the **SyncSeg** of
  that bit.
- **Hard synchronization:**
  - **SOF:** both nodes start transmitting SOF at the same time (t = 0); a transmitter's bit timing starts with
    its **own SOF transmission**. Hard sync at SOF follows the general rules: a **receiver** always hard-syncs,
    a **transmitter only on early edges** (the received SOF edge is a late edge while the transmitter is already
    sending `0`, so it is not used).
  - **XLF → resXL** edge (receivers only): if the edge is seen after the SP of XLF or during resXL, resXL
    starts at the edge.
  - **DL1** edge, i.e. the edge at the end of the DH\* bits (receivers only): DL1 starts at the edge (if the edge
    is seen after the SP of the current DH bit, the next bit starts at the edge; otherwise the current bit
    restarts at the edge).
- **Resynchronization:**
  - only if the value sampled at the **previous SP was recessive**;
  - at most **one synchronization between two sample points**;
  - edge in SyncSeg (`e = 0`): no resynchronization;
  - **late edge** (edge tq before the SP): PhaseSeg1 is lengthened by `min(e, SJW)`;
  - **early edge** (edge tq after the SP): PhaseSeg2 is shortened by `min(|e|, SJW)`;
  - a **node sending dominant ignores late edges** (it is already sending `0`). This applies to transmitters and
    to receivers: a receiver also sees its own edge (e.g. when driving the ACK slot dominant), which is always
    late and therefore never used for synchronization;
  - **arbitration phase:** all nodes resynchronize (arbitration SJW);
  - **data phase:** only **receivers** resynchronize (data SJW); the transmitter never resynchronizes.
- The bit-rate switch happens at the bit boundaries (ADH is an arbitration-phase bit, DH1 the first data-phase bit;
  the last data-phase bit is FCP0).

### 7.2 BSP — Bit Stream Processor
Operates at the level of the **bit stream / frame**. It consumes sampled bits and bit ticks from the BTL
and produces the next bit to transmit. Responsibilities:
- Maintains the **frame state**: phase (arbitration / data), field, bit index within field, bit name.
- **Arbitration:** when transmitting recessive but the BTL samples dominant at the SP, the node **loses**
  arbitration and switches to **receiver** for the rest of the frame (no error).
- **Stuff-bit generation** per ISO 11898-1 for XLFF:
  - **Dynamic bit stuffing** from SOF to IDE: after 5 consecutive equal bits a bit of the inverse value is
    inserted; the last dynamic stuff bit can be inserted after the IDE bit.
  - **Fixed bit stuffing** in the control field, data field and FCRC sequence: stuff rate 11, i.e. a fixed stuff
    bit is inserted after each 10th frame bit, counted from and including the DL1 bit in the ADS. Its value is the
    inverse of the preceding bit. The last fixed stuff bit is in the FCRC sequence (latest possible position:
    directly after FCRC bit 0; the actual position depends on the DLC).
  - A receiver detects a form error if a fixed stuff bit has the same value as its preceding bit (covered by
    the receiver's sampled-vs-expected check, §7.4a).
  - SBC is transmitted as fixed `0` (stuff-bit count not computed).
- **ACK transmission:** the **transmitter sends the ACK slot recessive (`1`)**; every **receiver drives the
  ACK slot dominant (`0`)**.
- **ACK validation:** the transmitter checks that the ACK slot is read back dominant; otherwise it detects an
  ACK error.
- **Error detection:** bit errors, stuff errors, form errors, ACK errors — all detected **on bit level**
  (CRC value errors are **not** checked).
- Decides the next `TX_CC` bit value (and TX-enable) handed back to the BTL.
- Provides the PWM block (§9) with its control information: PWM start/stop and transmitter/receiver role.

The BSP tracks and exposes, for the trace: role (transmitter/receiver), phase, field, bit name
(the per-bit phase segmentation and SP come from the BTL).

### 7.3 Explicitly unsupported (per §2)
- No CRC calc, no CRC check (CRC sent as-is, any CRC accepted) — handled in the BSP as pass-through.
- No error-flag transmission. On detected error → **error state forever** (BSP freezes the node).

### 7.4 Transmit bit-error check
- Compare the driven `TX_CC` bit vs the value the BTL sampled from `RX_CC` at the SP
  (accounting for arbitration/ACK exceptions handled by the BSP).
- A **transmitter ignores any error from the beginning of the ADH bit to the end of the FCP0 bit**.

### 7.4a Receiver error check
- A **receiver always detects errors**: the level sampled at the SP must match the expected frame bit.
- The **sampled value of the ADH bit is ignored** by transmitter and receiver.
- **Exception — tolerance at the beginning of the data phase** (number of DH* bits seen):
  - **Min:** after ADH the receiver requires **DH1** (sampled `1`); otherwise an error is detected.
  - After DH1, each following bit is interpreted as **DH2** when sampled `1`, or as **DL1** when sampled `0`.
    The same applies to DH2 … DH5 (next bit = DH3 … DH6 or DL1).
  - **Max:** at most DH1 … DH6 are tolerated. After DH6 a `0` must be sampled (= DL1);
    otherwise an error is detected.
  - Hence DH2 … DH6 may or may not be present; the receiver's following bits shift accordingly
    (incl. the position of its ACK slot).

### 7.5 Arbitration & ACK scenario (default)
1. Both nodes start SOF at t = 0 (own bit timing, no SOF hard sync) and transmit their configured frames.
2. During arbitration, the node that sends recessive but reads dominant at SP loses and becomes receiver.
3. The winner continues transmitting through control/data/CRC.
4. In the ACK slot, the transmitter sends recessive and the receiver drives dominant; the transmitter validates
   the ACK (dominant read back).
5. On any detected error at either node → that node prints "error detected" and stops updating (§13.4).

---

## 8. Bit Timing & Time Base

- Internal time: **floating-point nanoseconds**. Signal edges placed at exact computed times.
- A node's nominal tq = `BRP / clk_freq`. `df` scales the **clock frequency**: `F' = F · (1 + df)`, hence
  `T' = 1 / F' = T / (1 + df)` and actual tq = `BRP · T'` (a positive `df` means a faster clock).
- Controller events (BTL/BSP/PWM) happen at the node's clock ticks; transceiver delays/asymmetry and cable delay
  are added as exact ns values on the edge lists, so ns-scale and tq-scale timing combine exactly.

---

## 9. PWM Model (CAN XL data phase)

Per the user's decision:
- **`TX_CC` carries PWM symbols** inside the **PWM region** (ADH … FCP0, see below) when TMS is ON,
  using `PWMO` / `PWML` / `PWMS` (clock-period based), consistent with the XL Bit Timing tool.
- **The transceiver decodes each PWM symbol at the END of the symbol**, producing a clean logical level.
- **`TX_bus` and `RX_CC` are plain digital `0`/`1`** (post-decode levels), not PWM.
- Outside the PWM region (and always when TMS is OFF), `TX_CC` is a plain NRZ level (no PWM).

**PWM encoding specifics:**
- PWM encoding applies to **both the transmitting and the receiving node**.
- The PWM block gets its control information **from the BSP**: (a) **when to start** (ADH) and stop (FCP0)
  PWM encoding, and (b) whether the node is **transmitter or receiver**.
- A **transmitter** always sends PWM symbols that **start with `1`, then continue with `0`**.
  - The start is delayed by **PWMO** (PWM offset) relative to the start of ADH.
  - The **first two PWM symbols are always `PWM_0` symbols**, i.e. encoded as if `TXD` were `0`
    (although the ADH bit is `1`).
- A **receiver** always sends PWM symbols that **start with `0`, then continue with `1`** on its `TX_CC`;
  however the receiving node's transceiver is high-ohmic on the bus and does **not** decode/forward these symbols.
  - **PWMO is ignored**: without PWM decoding the symbol alignment is irrelevant, so the symbols start
    right at the beginning of ADH.
- The part of the symbol at the encoded bit level lasts `PWML`, the other part lasts `PWMS`.
- PWM encoding is a **dedicated block placed after the BTL**. It runs as a **continuous symbol stream** from the
  **start of the ADH bit** (plus PWMO for a transmitter) to the **end of the FCP0 bit**.
  At the beginning of each PWM symbol the encoder evaluates the current `TX_CC` bit level (NRZ) and emits the
  corresponding symbol. Symbols are not aligned to individual bits.
- Symbol length, `PWML`, `PWMS` and `PWMO` are clock-period based and therefore scaled by the node's `df`.
- Symbol count per bit and the `PWMO` / `PWML` / `PWMS` derivation reuse `getPWMsymbolsPerBit` from `xl_bt/script_main.js`.

---

## 10. Transceiver Model (SIC XL)

Both transceivers share identical parameters (per requirement). Each transceiver is modelled as a
**state machine** plus signal delay / asymmetry / PWM-decode logic.

### 10.1 Pins
- **TXD:** transceiver input from the controller, connected to `TX_CC`.
- **RXD:** transceiver output to the controller, connected to `RX_CC`.
- **Bus:** differential side; its digital value is `TX_bus`.

In **all** states the transceiver keeps **receiving** from the bus.

### 10.2 States
| State | Drives bus? | Notes |
|---|---|---|
| **SIC** (default) | yes — sends `0` & `1` | Slow / arbitration mode. |
| **FAST_TX** | yes — sends `0` & `1` | Fast data mode, transmitting node. |
| **FAST_RX** | no — high-ohmic, sends nothing | Fast data mode, receiving node. |

### 10.3 Preselection (while in SIC mode)
- A **single counter** restarts after **every edge on TXD**.
- When the counter reaches `tselect_threshold = 700 ns`, the transceiver **preselects** its FAST target:
  - TXD = `0` at threshold → preselect **FAST_TX**.
  - TXD = `1` at threshold → preselect **FAST_RX**.
- By default, FAST_RX is preselected if no other condition is met.

### 10.4 Transitions
- **SIC → FAST_TX** (FAST_TX preselected): distance between two **rising** edges ≤ `205 ns`.
- **SIC → FAST_RX** (FAST_RX preselected): distance between two **falling** edges ≤ `205 ns`.
- **FAST_TX → SIC:** distance between two **rising** edges > `245 ns`.
- **FAST_RX → SIC:** distance between two **falling** edges > `245 ns`.
- FAST → SIC is detected by **timeout**: the switch happens `245 ns` after the last relevant edge if no further
  edge arrives (not only when the next edge eventually arrives).

With PWM active (§9) the transmitter's `TXD` shows one rising edge per symbol and the receiver's `TXD` one
falling edge per symbol, so the transmitter enters FAST_TX and the receiver enters FAST_RX during the PWM region.

### 10.5 Signal path
1. **TX direction:** take `TXD` (= `TX_CC` after `t_cc_tc_tx`), derive the bus level according to the state,
   then drive the bus after `t_tc_tx`. Add asymmetry to the **rising edge** only: `a_sic_tx` in SIC mode,
   `a_fast_tx` in FAST mode.
   - **SIC:** the transceiver outputs exactly what it sees on `TXD` (pass-through, incl. any PWM symbols that
     arrive before the switch to FAST).
   - **FAST_TX:** every PWM symbol (rising edge to next rising edge on `TXD`) is decoded in a simple way at the
     **end of the symbol**: `PWM_0` → `0`, `PWM_1` → `1` (high time > half the symbol length → `PWM_1`).
     The transceiver does **not** know about the two forced `PWM_0` symbols at the beginning of ADH (§9); they
     are decoded as `0` like any other symbol.
   - **Entering FAST_TX:** the switch happens at the **end of the first PWM symbol** (the rising edge that
     completes it, §10.4). At that moment the first symbol is decoded and from then on **only decoded symbol
     values** are forwarded to `TX_bus` (with the transceiver delay); `TXD` is no longer passed through.
   - Attention: start of PWM symbol decoding introduces an additional delay of one PWM symbol (= time jump).
   - Attention: stop of PWM symbol decoding removes the additional delay of one PWM symbol (= time jump).
   - In **FAST_RX** the transceiver does not drive the bus (high-ohmic → recessive); PWM on `TXD` is **not**
     decoded/forwarded.
2. **Bus:** wired-AND of both transceivers (dominant `0` wins).
3. **RX direction:** each transceiver receives the wired-AND of its **own** bus output (no cable delay) and the
   **far** transceiver's bus output delayed by `t_cable`; then `t_tc_rx`, add rising-edge
   asymmetry (`a_sic_rx` / `a_fast_rx`), then deliver to CC after `t_cc_tc_rx` → `RX_CC`.
4. **Mode ↔ asymmetry:** SIC-mode asymmetry (`a_sic_*`) applies in SIC; FAST-mode asymmetry (`a_fast_*`)
   applies in FAST_TX / FAST_RX.

---

## 11. Cable Model

Pure delay block: `t_cable` applied **only** to the signal propagating from one node's transceiver to the
other node's transceiver (both directions). A node sees its own bus output without `t_cable`.

---

## 12. Simulation Engine (clocked co-simulation)

1. Build each node's bit sequence from its frame config (fields, stuff bits, fixed CRCs, ACK, EOF).
2. Both nodes start SOF at t = 0.
3. **Clocked co-simulation:** the BTL, BSP and PWM encoder of each node tick on the node's **own clock**
   (period `1 / (clk · (1 + df))`). Clock ticks of both nodes are processed in **global time order**.
   Transceiver, channel and bus are not clocked; they run **online** on the edges produced so far:
   - `TX_CC` (NRZ or PWM) is emitted at the clock ticks,
   - the transceiver processes `TXD` edges and its timeouts (preselection, FAST → SIC) in time order and
     produces `TX_bus` (delays + asymmetry + PWM decode),
   - `RX_CC` of a node is evaluated from its own `TX_bus` and the far `TX_bus` (after `t_cable`), plus
     `t_tc_rx`, rising-edge asymmetry and `t_cc_tc_rx`.
   All paths have a positive delay, so every `RX_CC` sample only depends on already computed signals.
4. Per node and tq: edge detection and synchronization (§7.1.1); at the SP: sampling, arbitration, ACK and
   error decisions in the BSP (online). The loser of arbitration continues as receiver of the other node's frame.
5. Stop a node on error (freeze, drives recessive) or at the end of EOF.
6. Emit, per node: an ordered **trace** (hierarchy rows with time spans) and three **waveform** signals
   (level/time edge lists). Hand off to `sim_draw.js`.

---

## 13. Visualization (Slide 2)

Rendered as a single SVG containing one block per node, stacked. Shared horizontal time axis across
all node blocks, so all nodes scroll together. The node headlines and row names are drawn in a separate,
fixed label column to the left of the scrolling SVG, so they stay in place while scrolling.

### 13.1 Per-node hierarchical trace (6 levels)
1. **Role:** transmitter / receiver.
2. **Phase:** arbitration phase / data phase.
3. **Field:** only the frame fields as used in the Frame Generator (`frame/frame_definitions.js`):
   SOF, Arbitration field, Control field, Data field, CRC field, ACK field, EOF.
4. **SubField:** the sub-field name (e.g. Priority ID, ADS, SDT, DLC, AF, Byte0, FCRC, FCP, DAS); for
   single-bit elements (e.g. RRS, IDE, SEC, ACK slot) the bit name (then visible twice, intended).
   Row name is user-configurable (`rowNames.subField`).
5. **Bit:** bit name (e.g. SOF, ID28 …, DLC bits, …).
6. **Bit phase:** SyncSeg, PropSeg, PhaseSeg1, PhaseSeg2 drawn as **discreet** light-grey bands
   (four different, user-configurable shades); PhaseSeg1/PhaseSeg2 that were **lengthened or shortened by a
   synchronization** are drawn in a separate color (`syncPhaseSegColor`);
   **SP drawn as a red vertical line** from the Bit phase row (including) down to `RX_CC` (including).

**Band colors (same values as in the Frame Generator, `frame/frame_draw.js`; defined locally in `sim_config.js`):**
- **Phase:** arbitration / data phase colors (`arbPhase`, `dataPhase`).
- **Field:** each field has a color pair `[a, b]`; the Field band uses `a`.
- **SubField:** subfields within a field alternate `a, b, a, b, …`.
- **Bit:** same background as its subfield (stuff bits and error bits keep their own colors).
- All of these are drawn with a configurable fill opacity (`colors.frameOpacity`).

Row labels are drawn left of the rows. Labels of spans wider than 300 px are left-aligned at the span start
(applies to all rows incl. the transceiver state row); labels that do not fit their span are omitted.

### 13.2 Waveforms (all digital, top→bottom)
- `TX_CC` — controller output (PWM symbols from ADH to FCP0; NRZ otherwise).
- `TX_bus` — transceiver output on the bus (digital value of what is normally differential).
- `RX_CC` — what the controller sees.

Waveforms are drawn without background fill and without a bounding box.

### 13.3 Style
- Similar to Frame Generator "real arb/data bit ratio" figures, **not identical**.
- Bit widths proportional to real bit times (arb bits much wider than data bits).
- Bit-phase bands use subtle shading (opacity), not strong colors; SP line is red.
- Bit length of data bit shall be 100 pixels (default value, configurable in user settings). The arbitration bit length shall be proportionally wider according to the real bit time ratio.

### 13.4 Error-state display
- When a node detects an error, its **phase (arb/data) trace line shows the text "error detected"**
  at that point; the node is **not updated further** (waveforms stop/stay recessive afterwards).

### 13.5 Transceiver state display
- Each node's transceiver **state** (SIC / FAST_TX / FAST_RX) is visualized over time (per Slide 1).

### 13.6 Horizontal scaling / zoom
- The **full frame** is shown by default (fitted to the visible width on page load); the user can **scroll left/right** (as in the Frame Generator view).
- **Mouse wheel** over the figure scrolls horizontally (Shift + wheel too); outside the figure the page
  scrolls normally.
- **Zoom** re-draws the figure with a new time scale (pixel width of a data bit) from the last simulation
  result (no re-simulation), so text and line widths stay sharp:
  - **Ctrl + wheel** over the figure zooms around the mouse position (the time under the cursor stays in place);
  - buttons **− / +** zoom around the center of the visible area; **Fit** shows the whole frame;
  - zoom step, min/max data bit width and wheel scroll speed are configurable (§6.6).
- Zoom level and pinned markers are kept when the simulation is re-run.

### 13.7 Markers
- A **vertical cursor line** follows the mouse through the whole figure (all nodes). It is an HTML overlay,
  not part of the SVG. A readout shows the time at the cursor (ns) and the distance Δ to the last pinned marker.
- **Click** pins a marker at the cursor position; clicking near an existing pinned marker removes it.
  Each pinned marker shows its time and Δ to the previous pinned marker. Pinned markers persist across re-runs.
- Marker style is configurable (§6.6).

---

*End of draft. Awaiting review and the explicit start command before implementing.*
