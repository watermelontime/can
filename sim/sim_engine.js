// All rights reserved. (c) 2026 //
// =============================================================================
// sim_engine.js — clocked co-simulation of both nodes (spec §12).
// Each node's BTL, BSP and PWM encoder tick on the node's own clock (incl. df).
// Clock ticks of both nodes are processed in global time order; transceivers,
// channel and bus are evaluated online from the edges produced so far. All
// paths have a positive delay, so every RX_CC sample only depends on the past.
// =============================================================================

import { DOMINANT, RECESSIVE, derivePwm, bitLenNs } from './sim_bittiming.js';
import { buildBitSequence, Bsp } from './sim_bsp.js';
import { Btl } from './sim_btl.js';
import { PwmEncoder } from './sim_pwm.js';
import { Transceiver, STATE_SIC } from './sim_transceiver.js';
import {
  levelAt, dominantIn, pushEdge, delaySignal, wiredAnd,
} from './sim_channel.js';

class SimNode {
  constructor(node, idx, ownSeq, otherSeq, cfg) {
    this.node = node;
    this.idx = idx;
    this.ch = node.channel;
    // Node is idle until txStartT; an earlier bus edge is taken as SOF (hard sync).
    this.txStartT = idx === 1 ? (node.txStartDelay || 0) : 0;
    this.idle = true;
    this.pending = false;  // synced to a foreign SOF, own transmission not started yet
    this.roles = [{ t: 0, role: 'idle' }];
    this.btl = new Btl(node);
    this.bsp = new Bsp(ownSeq, otherSeq);
    const pwm = derivePwm(node);
    this.pwm = pwm ? new PwmEncoder(pwm) : null;
    this.trx = new Transceiver(node.transceiver);
    this.k = 0;
    this.txLevel = RECESSIVE;
    this.txcc = [];
    this.bits = [];
    this.rec = null;
    this.done = false;
    this.errorAt = null;
    this.lostAt = null;
  }

  get nextT() {
    return this.k * this.btl.clkPer;
  }

  setRole(t, role) {
    this.roles.push({ t, role });
  }

  // Idle: evaluate RX_CC at the end of every (arb) tq; a recessive->dominant
  // edge is a hard sync, the edge tq becomes the SyncSeg of the SOF.
  idleTick(t, rxAt) {
    const brp = this.node.bt.arb.brp;
    if (this.k === 0 || this.k % brp !== 0) return;
    const level = rxAt(t);
    const edge = this.btl.prevRx === RECESSIVE && level === DOMINANT;
    this.btl.prevRx = level;
    if (!edge) return;
    this.idle = false;
    this.pending = true;
    this.beginBit(t - brp * this.btl.clkPer, 1);
    this.rec.value = RECESSIVE;
    this.btl.synced = true;
  }

  beginBit(t, startPos = 0) {
    const b = this.bsp.bit;
    this.btl.begin(b.phase, startPos);
    this.rec = {
      name: b.name, field: b.field, subfield: b.subfield, phase: b.phase, stuff: b.stuff, value: this.bsp.drive(),
      t0: t, t1: null, spTime: null, sampled: null, error: false,
      prop: this.btl.cfg.prop, ps1: this.btl.ps1, tqNs: this.btl.tqNs,
      nomPs1: this.btl.cfg.ps1, nomPs2: this.btl.cfg.ps2,
    };
    this.bits.push(this.rec);
    if (b.name === 'ADH' && this.pwm) this.pwm.start(this.bsp.isTx);
  }

  closeRec(t1) {
    this.rec.t1 = t1;
    this.rec.ps1 = this.btl.ps1;
  }

  // End the current bit at t and start the next one; startPos tq of the next
  // bit already elapsed.
  endBit(t, startPos = 0) {
    this.closeRec(t);
    if (this.rec.name === 'FCP0' && this.pwm) this.pwm.stop();
    this.bsp.next();
    if (this.bsp.done) this.finish();
    else this.beginBit(t, startPos);
  }

  finish() {
    this.done = true;
    if (this.pwm) this.pwm.stop();
  }

  // The edge tq (which just elapsed) becomes the SyncSeg of the bit starting at the edge.
  hardSync(t, mode) {
    const tEdge = t - this.btl.tqNs;
    if (mode === 'next') {
      this.endBit(tEdge, 1);
    } else {
      if (this.bits.length > 1) this.bits[this.bits.length - 2].t1 = tEdge;
      this.btl.begin(this.rec.phase, 1);
      Object.assign(this.rec, { t0: tEdge, spTime: null, sampled: null });
    }
    this.btl.synced = true;
  }

  samplePoint(t, rx) {
    if (this.pending) {
      this.pending = false;
      this.bsp.becomeReceiver();
      this.setRole(t, 'receiver');
    }
    this.rec.spTime = t;
    this.rec.sampled = rx;
    const res = this.bsp.sample(rx);
    this.rec.name = this.bsp.bit.name;
    if (res.lost) {
      this.lostAt = t;
      this.setRole(t, 'receiver');
    }
    if (res.error) {
      this.rec.error = true;
      this.errorAt = t;
      this.closeRec(this.rec.t0 + this.btl.len * this.btl.tqNs);
      this.finish();
    }
  }

  tick(t, rxAt) {
    if (this.idle) {
      // An edge seen in the elapsed tq has priority over a transmission start at this tick.
      this.idleTick(t, rxAt);
      if (this.idle) {
        if (t < this.txStartT) {
          this.k++;
          return;
        }
        this.idle = false;
        this.setRole(t, 'transmitter');
        this.beginBit(t);
      } else if (t >= this.txStartT) {
        this.pending = false;
        this.setRole(t, 'transmitter');
        this.rec.value = this.bsp.drive();
      }
    } else {
      if (this.pending && t >= this.txStartT) {
        this.pending = false;
        this.setRole(t, 'transmitter');
        this.rec.value = this.bsp.drive();
      }
      const ctx = {
        isTx: this.bsp.isTx,
        phase: this.bsp.bit.phase,
        drivingDominant: !this.pending && this.bsp.drive() === DOMINANT,
        hardSyncMode: (btl) => this.bsp.hardSyncMode(btl.edgeAfterSp),
      };
      const ev = this.btl.clock(() => rxAt(t), ctx);
      if (ev?.hardSync) this.hardSync(t, ev.hardSync);
      else if (ev?.sp) this.samplePoint(t, ev.rx);
      else if (ev?.end) this.endBit(t - ev.carry * this.btl.tqNs, ev.carry);
    }
    const nrz = this.pending ? RECESSIVE : this.bsp.drive();
    const pwmLevel = this.pwm ? this.pwm.tick(nrz) : null;
    const level = this.done ? RECESSIVE : (pwmLevel ?? nrz);
    if (level !== this.txLevel) {
      this.txLevel = level;
      pushEdge(this.txcc, t, level);
      this.trx.feed(t + this.ch.t_cc_tc_tx, level);
    }
    this.k++;
  }
}

// Segment lengths (ns) of a finished bit record; ps1Sync/ps2Sync flag segments
// whose length differs from nominal due to synchronization.
function segments(rec) {
  const tq = rec.tqNs;
  let rest = rec.t1 - rec.t0;
  const take = (n) => {
    const d = Math.max(0, Math.min(n, rest));
    rest -= d;
    return d;
  };
  const sync = take(tq);
  const prop = take(rec.prop * tq);
  const ps1 = take(rec.ps1 * tq);
  const ps2 = Math.max(0, rest);
  const differs = (ns, nomTq) => Math.abs(ns - nomTq * tq) > tq / 2;
  return {
    sync, prop, ps1, ps2,
    ps1Sync: differs(ps1, rec.nomPs1),
    ps2Sync: differs(ps2, rec.nomPs2),
  };
}

export function runSimulation(cfg) {
  const c = cfg.bus.t_cable;
  const seqs = cfg.nodes.map((n) => buildBitSequence(n));
  const nodes = cfg.nodes.map((n, i) => new SimNode(n, i, seqs[i], seqs[1 - i], cfg));

  const n0 = cfg.nodes[0];
  const nominal = seqs[0].reduce(
    (s, b) => s + bitLenNs(n0.clkMHz, n0.bt[b.phase].brp, n0.df, n0.bt[b.phase]), 0,
  );
  const maxT = 2 * nominal + 10000 + Math.max(...nodes.map((m) => m.txStartT));

  // RX_CC level of node i at time t: own TX_bus directly, far TX_bus after
  // t_cable, then t_tc_rx with rising-edge asymmetry, then t_cc_tc_rx.
  const rxAt = (i) => (t) => {
    const me = nodes[i].trx;
    const far = nodes[1 - i].trx;
    const trx = me.trx;
    const x = t - nodes[i].ch.t_cc_tc_rx;
    const a = me.stateAt(x) === STATE_SIC ? trx.a_sic_rx : trx.a_fast_rx;
    const y = x - trx.t_tc_rx;
    if (a >= 0) {
      return dominantIn(me.txbus, y - a, y) || dominantIn(far.txbus, y - a - c, y - c)
        ? DOMINANT : RECESSIVE;
    }
    const lv = (tau) => Math.min(levelAt(me.txbus, tau), levelAt(far.txbus, tau - c));
    return Math.max(lv(y), lv(y - a));
  };
  const rxFns = nodes.map((_, i) => rxAt(i));

  for (;;) {
    let n = null;
    for (const m of nodes) if (!m.done && (!n || m.nextT < n.nextT)) n = m;
    if (!n || n.nextT > maxT) break;
    const t = n.nextT;
    for (const m of nodes) m.trx.advanceTo(t);
    n.tick(t, rxFns[n.idx]);
  }

  let busTotalT = 0;
  for (const m of nodes) {
    if (m.rec && m.rec.t1 === null) m.closeRec(m.nextT);
    for (const r of m.bits) busTotalT = Math.max(busTotalT, r.t1);
  }
  for (const m of nodes) m.trx.advanceTo(busTotalT);

  // RX_CC edges for drawing (same transformation as rxAt).
  const buildRxCc = (i) => {
    const me = nodes[i].trx;
    const trx = me.trx;
    const seen = wiredAnd(me.txbus, delaySignal(nodes[1 - i].trx.txbus, c));
    const out = [];
    for (const e of seen) {
      let tr = e.t + trx.t_tc_rx;
      if (e.v === RECESSIVE) tr += me.stateAt(tr) === STATE_SIC ? trx.a_sic_rx : trx.a_fast_rx;
      pushEdge(out, tr + nodes[i].ch.t_cc_tc_rx, e.v);
    }
    return out;
  };

  const actRec = nodes.map((m) => m.trx.actRecSegments(busTotalT));

  const nodesOut = nodes.map((m, i) => {
    const roleSegs = m.roles
      .map((r, j) => ({ t0: r.t, t1: m.roles[j + 1]?.t ?? busTotalT, role: r.role }))
      .filter((s) => s.t1 > s.t0);
    return {
      label: m.node.label,
      role: m.bsp.role,
      roleSegs,
      bits: m.bits.map((r) => ({
        name: r.name, field: r.field, subfield: r.subfield, phase: r.phase, stuff: r.stuff, value: r.value,
        t0: r.t0, t1: r.t1, spTime: r.spTime, sampled: r.sampled, error: r.error,
        segs: segments(r),
      })),
      txcc: m.txcc,
      txbus: m.trx.txbus,
      rxcc: buildRxCc(i),
      txState: m.trx.segments(busTotalT),
      txPre: m.trx.preSegments(busTotalT),
      txHiZ: m.trx.hiZSegments(busTotalT),
      txActRec: actRec[i],
      // Own phases plus the far node's phases after t_cable, through the own RX path. The start is a
      // rising edge, so it gets the RX asymmetry like the RX_CC edge (buildRxCc); the end does not.
      rxActRec: (() => {
        const me = m.trx;
        const rx = (segs, extra) => segs.map(({ t0, t1 }) => {
          let s = t0 + extra + me.trx.t_tc_rx;
          s += me.stateAt(s) === STATE_SIC ? me.trx.a_sic_rx : me.trx.a_fast_rx;
          const e = t1 + extra + me.trx.t_tc_rx;
          return { t0: s + m.ch.t_cc_tc_rx, t1: e + m.ch.t_cc_tc_rx };
        }).filter((r) => r.t1 > r.t0);
        return [...rx(actRec[i], 0), ...rx(actRec[1 - i], c)];
      })(),
      errorAt: m.errorAt,
    };
  });

  const d = n0.bt.data;
  return {
    nodes: nodesOut,
    bus: wiredAnd(nodes[0].trx.txbus, nodes[1].trx.txbus),
    busTotalT,
    dataBitNs: bitLenNs(n0.clkMHz, d.brp, n0.df, d),
  };
}
