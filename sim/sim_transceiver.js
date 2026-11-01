// All rights reserved. (c) 2026 //
// =============================================================================
// sim_transceiver.js — SIC XL transceiver, running online (spec §10).
// TXD edges are fed in time order; advanceTo(T) processes them together with
// the timeouts (preselection counter, FAST -> SIC) up to TXD time T.
//  - Preselection in SIC: counter restarts on every TXD edge; after
//    tselect_threshold without edge: TXD=0 -> FAST_TX, TXD=1 -> FAST_RX.
//  - SIC -> FAST_TX: rising edges <= sic2fast apart (FAST_TX preselected);
//    SIC -> FAST_RX: falling edges <= sic2fast apart (FAST_RX preselected).
//  - FAST -> SIC: no further rising (FAST_TX) / falling (FAST_RX) edge within
//    fast2sic (timeout).
//  - Output: SIC passes TXD through; FAST_TX forwards decoded PWM symbols
//    (decoded at symbol end: high time > half symbol => 1); FAST_RX recessive.
// The resulting TX_bus includes t_tc_tx and the rising-edge TX asymmetry.
// =============================================================================

import { DOMINANT, RECESSIVE } from './sim_bittiming.js';
import { pushEdge } from './sim_channel.js';

export const STATE_SIC = 'SIC';
export const STATE_FAST_TX = 'FAST_TX';
export const STATE_FAST_RX = 'FAST_RX';

export class Transceiver {
  constructor(trx) {
    this.trx = trx;
    this.state = STATE_SIC;
    this.pre = STATE_FAST_RX;
    this.preDone = false;
    this.txd = RECESSIVE;
    this.lastEdge = 0;
    this.lastRise = null;
    this.lastFall = null;
    this.symFall = null;
    this.queue = [];
    this.qi = 0;
    this.segs = [];
    this.segStart = 0;
    this.preSegs = [];
    this.preStart = 0;
    this.hiZ = [];           // FAST_RX: bus output high ohmic, on bus time (after t_tc_tx)
    this.hiZStart = null;
    this.actRec = [];        // SIC active recessive phases, on bus time
    this.actRecStart = null;
    this.txbus = [];
  }

  feed(t, v) {
    this.queue.push({ t, v });
  }

  advanceTo(T) {
    for (;;) {
      const e = this.queue[this.qi];
      const eT = e && e.t <= T ? e.t : Infinity;
      const to = this.nextTimeout();
      if (to <= T && to < eT) {
        this.fireTimeout(to);
      } else if (eT !== Infinity) {
        this.qi++;
        this.processEdge(e.t, e.v);
      } else {
        break;
      }
    }
  }

  nextTimeout() {
    if (this.state === STATE_FAST_TX) return this.lastRise + this.trx.fast2sic;
    if (this.state === STATE_FAST_RX) return this.lastFall + this.trx.fast2sic;
    if (!this.preDone) return this.lastEdge + this.trx.tselect_threshold;
    return Infinity;
  }

  fireTimeout(t) {
    if (this.state !== STATE_SIC) {
      // FAST_RX -> SIC: high ohmic -> driven recessive, visible after t_tc_tx without asymmetry.
      const fromRx = this.state === STATE_FAST_RX;
      this.setState(t, STATE_SIC);
      this.output(t, this.txd, fromRx);
      this.preDone = false;
      return;
    }
    const pre = this.txd === DOMINANT ? STATE_FAST_TX : STATE_FAST_RX;
    if (pre !== this.pre) {
      this.preSegs.push({ t0: this.preStart, t1: t, state: this.pre });
      this.preStart = t;
      this.pre = pre;
    }
    this.preDone = true;
  }

  processEdge(t, v) {
    if (v === this.txd) return;
    this.txd = v;
    this.lastEdge = t;
    this.preDone = false;
    const { sic2fast } = this.trx;
    if (v === RECESSIVE) {
      const gap = this.lastRise === null ? Infinity : t - this.lastRise;
      if (this.state === STATE_SIC && this.pre === STATE_FAST_TX && gap <= sic2fast) {
        this.setState(t, STATE_FAST_TX);
        this.output(t, this.decode(t));
      } else if (this.state === STATE_FAST_TX) {
        this.output(t, this.decode(t));
      }
      this.lastRise = t;
      this.symFall = null;
    } else {
      const gap = this.lastFall === null ? Infinity : t - this.lastFall;
      if (this.state === STATE_SIC && this.pre === STATE_FAST_RX && gap <= sic2fast) {
        this.setState(t, STATE_FAST_RX);
        this.output(t, RECESSIVE);
      }
      if (this.symFall === null) this.symFall = t;
      this.lastFall = t;
    }
    if (this.state === STATE_SIC) this.output(t, v);
  }

  // Decode the PWM symbol that ends at t (it started at the last rising edge).
  decode(t) {
    const high = (this.symFall ?? t) - this.lastRise;
    return high > (t - this.lastRise) / 2 ? RECESSIVE : DOMINANT;
  }

  setState(t, s) {
    this.segs.push({ t0: this.segStart, t1: t, state: this.state });
    this.segStart = t;
    if (this.state === STATE_FAST_RX) {
      this.hiZ.push({ t0: this.hiZStart, t1: t + this.trx.t_tc_tx });
      this.hiZStart = null;
    }
    if (s === STATE_FAST_RX) this.hiZStart = t + this.trx.t_tc_tx;
    if (s !== STATE_SIC) this.closeActRec(t + this.trx.t_tc_tx);
    this.state = s;
  }

  // Active recessive ends after t_pas_rec_start or earlier when the bus is no longer driven recessive.
  closeActRec(tEnd) {
    if (this.actRecStart === null) return;
    const t0 = this.actRecStart;
    this.actRec.push({ t0, t1: Math.min(t0 + this.trx.t_pas_rec_start, tEnd) });
    this.actRecStart = null;
  }

  // Logical level towards the bus at TXD time t -> TX_bus edge.
  output(t, v, noAsym = false) {
    let tb = t + this.trx.t_tc_tx;
    if (v === RECESSIVE && !noAsym) tb += this.state === STATE_SIC ? this.trx.a_sic_tx : this.trx.a_fast_tx;
    pushEdge(this.txbus, tb, v);
    if (this.state !== STATE_SIC) return;
    this.closeActRec(tb);
    if (v === RECESSIVE && this.trx.t_pas_rec_start > 0) this.actRecStart = tb;
  }

  stateAt(t) {
    for (const s of this.segs) if (t >= s.t0 && t < s.t1) return s.state;
    return this.state;
  }

  segments(endT) {
    return [...this.segs, { t0: this.segStart, t1: endT, state: this.state }];
  }

  // Preselected FAST mode over time (result of the tselect timer).
  preSegments(endT) {
    return [...this.preSegs, { t0: this.preStart, t1: endT, state: this.pre }];
  }

  // High ohmic intervals of TX_bus (simulated as recessive).
  hiZSegments(endT) {
    return this.hiZStart === null ? [...this.hiZ] : [...this.hiZ, { t0: this.hiZStart, t1: endT }];
  }

  // Active recessive phases of TX_bus (SIC: recessive driven for t_pas_rec_start).
  actRecSegments(endT) {
    const t0 = this.actRecStart;
    return t0 === null ? [...this.actRec]
      : [...this.actRec, { t0, t1: Math.min(t0 + this.trx.t_pas_rec_start, endT) }];
  }
}
