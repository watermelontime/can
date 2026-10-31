// All rights reserved. (c) 2026 //
// =============================================================================
// sim_btl.js — Bit Timing Logic (per node, clocked by the node clock, §7.1).
// Counts clock periods -> time quanta (tq) -> bit segments. RX_CC is evaluated
// at the END of every tq; an edge first seen at the end of tq q happened in tq q
// (phase error e = q, SyncSeg = tq 0). Synchronization works in tq granularity.
// Synchronization:
//  - only recessive->dominant edges, only if the last SP sampled recessive,
//    at most one synchronization between two sample points;
//  - edge in SyncSeg: no resynchronization;
//  - late edge (before SP): PhaseSeg1 lengthened by min(e, SJW);
//  - early edge (after SP): PhaseSeg2 shortened by min(|e|, SJW);
//  - a node sending dominant ignores late edges (also a receiver sending the
//    ACK slot: its own edge is always late);
//  - data phase: only receivers resynchronize (data SJW);
//  - hard sync is requested by the BSP via ctx.hardSyncMode().
// =============================================================================

import { DOMINANT, RECESSIVE, clkPeriodNs } from './sim_bittiming.js';

export class Btl {
  constructor(node) {
    this.node = node;
    this.clkPer = clkPeriodNs(node.clkMHz, node.df);
    this.prevRx = RECESSIVE;
    this.lastSampled = RECESSIVE;
  }

  // Start a new bit with the timing of the given phase. startPos > 0 when the
  // bit's first tq(s) already elapsed (edge tq becomes SyncSeg after a sync).
  begin(phase, startPos = 0) {
    const cfg = phase === 'arb' ? this.node.bt.arb : this.node.bt.data;
    this.cfg = cfg;
    this.clk = startPos * cfg.brp;
    this.pos = startPos;
    this.ps1 = cfg.ps1;
    this.spPos = 1 + cfg.prop + cfg.ps1;
    this.len = this.spPos + cfg.ps2;
    this.synced = false;
  }

  get tqNs() {
    return this.cfg.brp * this.clkPer;
  }

  // One node clock period elapsed. rx() returns the current RX_CC level.
  // Returns null or one event: { hardSync } | { sp, rx } | { end, carry }.
  // carry = tq of the next bit that already elapsed (edge tq = its SyncSeg).
  clock(rx, ctx) {
    this.clk++;
    if (this.clk % this.cfg.brp !== 0) return null;
    this.pos++;
    const level = rx();
    const edge = this.prevRx === RECESSIVE && level === DOMINANT;
    this.prevRx = level;
    if (edge) {
      const mode = ctx.hardSyncMode(this);
      if (mode) return { hardSync: mode };
      this.resync(ctx);
    }
    if (this.pos === this.spPos) {
      this.lastSampled = level;
      this.synced = false;
      return { sp: true, rx: level };
    }
    if (this.pos >= this.len) return { end: true, carry: this.pos - this.len };
    return null;
  }

  // Tq in which the edge just seen happened.
  get edgeTq() {
    return this.pos - 1;
  }

  // Edge after the sample point (early edge)?
  get edgeAfterSp() {
    return this.edgeTq >= this.spPos;
  }

  resync(ctx) {
    if (this.synced || this.lastSampled !== RECESSIVE) return;
    if (ctx.isTx && ctx.phase === 'data') return;
    const q = this.edgeTq;
    if (q === 0) return;
    const sjw = this.cfg.sjw;
    if (!this.edgeAfterSp) {
      if (ctx.drivingDominant) return;
      const d = Math.min(q, sjw);
      this.ps1 += d;
      this.spPos += d;
      this.len += d;
    } else {
      this.len -= Math.min(this.len - q, sjw);
    }
    this.synced = true;
  }
}
