// All rights reserved. (c) 2026 //
// =============================================================================
// sim_channel.js — cable/path delays and shared signal (edge-list) utilities.
// A signal is a time-sorted array of { t, v } transitions; v is the level that
// begins at time t and holds until the next entry. Idle level = RECESSIVE.
// =============================================================================

import { DOMINANT, RECESSIVE } from './sim_bittiming.js';

// Index of the last edge with time <= t, or -1.
function lastIdxAtOrBefore(sig, t) {
  let lo = 0;
  let hi = sig.length - 1;
  let res = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sig[mid].t <= t + 1e-9) { res = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return res;
}

// Level of a signal at time t (initial level before the first edge = RECESSIVE).
export function levelAt(sig, t, initial = RECESSIVE) {
  const i = lastIdxAtOrBefore(sig, t);
  return i < 0 ? initial : sig[i].v;
}

// True if the signal is dominant anywhere in [a, b].
export function dominantIn(sig, a, b) {
  let i = lastIdxAtOrBefore(sig, a);
  if (i >= 0 && sig[i].v === DOMINANT) return true;
  for (i += 1; i < sig.length && sig[i].t <= b + 1e-9; i++) {
    if (sig[i].v === DOMINANT) return true;
  }
  return false;
}

// Append an edge to a time-sorted signal. Edges at or after t are dropped first,
// so pulses shorter than an applied delay difference are swallowed.
export function pushEdge(sig, t, v) {
  while (sig.length && sig[sig.length - 1].t >= t - 1e-9) sig.pop();
  const prev = sig.length ? sig[sig.length - 1].v : RECESSIVE;
  if (prev !== v) sig.push({ t, v });
}

// Remove redundant transitions (same level as previous) after sorting by time.
export function normalize(sig, initial = RECESSIVE) {
  const s = sig.slice().sort((a, b) => a.t - b.t);
  const out = [];
  let prev = initial;
  for (const e of s) {
    if (e.v !== prev) {
      out.push({ t: e.t, v: e.v });
      prev = e.v;
    }
  }
  return out;
}

// Shift every transition by a constant delay (ns).
export function delaySignal(sig, delayNs) {
  return sig.map((e) => ({ t: e.t + delayNs, v: e.v }));
}

// Wired-AND of two signals (dominant 0 wins). Returns merged edge list.
export function wiredAnd(a, b) {
  const times = [];
  for (const e of a) times.push(e.t);
  for (const e of b) times.push(e.t);
  times.sort((x, y) => x - y);
  const out = [];
  let prev = RECESSIVE;
  for (const t of times) {
    const v = Math.min(levelAt(a, t), levelAt(b, t)); // dominant (0) wins
    if (v !== prev) {
      out.push({ t, v });
      prev = v;
    }
  }
  return out;
}
