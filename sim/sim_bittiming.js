// All rights reserved. (c) 2026 //
// =============================================================================
// sim_bittiming.js — bit-time math, sample point, PWM parameter derivation.
// Pure functions shared by BTL / BSP / PWM / engine. No DOM access.
// =============================================================================

export const DOMINANT = 0;
export const RECESSIVE = 1;

// Number of tq in one bit for a phase config {prop, ps1, ps2}. SyncSeg = 1 tq.
export function tqPerBit(cfg) {
  return 1 + cfg.prop + cfg.ps1 + cfg.ps2;
}

// Sample-point offset in tq from bit start = Sync + Prop + PhaseSeg1.
export function spOffsetTq(cfg) {
  return 1 + cfg.prop + cfg.ps1;
}

// Clock period in ns. df (in %) scales the frequency: F' = F * (1 + df) => T' = T / (1 + df).
export function clkPeriodNs(clkMHz, dfPercent = 0) {
  return 1000 / (clkMHz * (1 + dfPercent / 100));
}

// Length of one tq in ns for a node with clock deviation df (in %).
// A positive df shortens tq (faster clock).
export function tqLenNs(clkMHz, brp, dfPercent) {
  return brp * clkPeriodNs(clkMHz, dfPercent);
}

// Length of one bit in ns for a phase.
export function bitLenNs(clkMHz, brp, dfPercent, cfg) {
  return tqLenNs(clkMHz, brp, dfPercent) * tqPerBit(cfg);
}

// Number of PWM symbols per bit (ported from xl_bt/script_main.js getPWMsymbolsPerBit).
// Returns 0 when no valid PWM configuration exists for this bit length.
export function pwmSymbolsPerBit(bitLenInClkPeriods, clkPeriod) {
  const MIN = 50;  // ns
  const MAX = 200; // ns
  const totalNs = bitLenInClkPeriods * clkPeriod;
  if (totalNs <= MAX) {
    if (totalNs < MIN) return 0;
    return 1;
  }
  const minSymbols = Math.ceil(totalNs / MAX);
  for (let i = minSymbols; i < 100; i++) {
    if (bitLenInClkPeriods % i === 0) {
      const symLenClk = bitLenInClkPeriods / i;
      return symLenClk * clkPeriod >= MIN ? i : 0;
    }
  }
  return 0;
}

// Derive PWMO / PWML / PWMS (clock-period counts) for the data phase, per xl_bt.
// Returns null when TMS is off or no PWM config exists.
export function derivePwm(node) {
  if (!node.tms) return null;
  const brp = node.bt.data.brp;
  const clkP = clkPeriodNs(node.clkMHz);
  const tqBitData = tqPerBit(node.bt.data);
  const tqBitArb = tqPerBit(node.bt.arb);
  const bitLenClk = tqBitData * brp;
  const symbols = pwmSymbolsPerBit(bitLenClk, clkP);
  if (symbols <= 0) return null;
  const symLenClk = bitLenClk / symbols;
  const pwms = Math.ceil(symLenClk / 4);
  const pwml = symLenClk - pwms;
  const pwmo = (tqBitArb * node.bt.arb.brp) % symLenClk;
  return {
    symbols,
    symLenClk,
    symLenNs: symLenClk * clkP,
    pwms,
    pwml,
    pwmo,
    clkPeriodNs: clkP,
  };
}
