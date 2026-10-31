// All rights reserved. (c) 2026 //
// =============================================================================
// sim_pwm.js — PWM encoding block (after the BTL, clocked by the node clock, §9).
// Started by the BSP at the beginning of ADH and stopped at the end of FCP0;
// in between it replaces the NRZ level on TX_CC by a continuous symbol stream.
//  - transmitter: start delayed by PWMO; symbols start 1, then 0;
//                 the first two symbols are always PWM_0
//  - receiver:    PWMO ignored (start at ADH); symbols start 0, then 1
// At each symbol start the encoder samples the NRZ bit level. The portion at
// the encoded level lasts PWML, the other portion PWMS (clock periods).
// =============================================================================

import { DOMINANT, RECESSIVE } from './sim_bittiming.js';

const FORCED_PWM0_SYMBOLS = 2;

export class PwmEncoder {
  constructor(pwm) {
    this.p = pwm;
    this.active = false;
  }

  start(isTransmitter) {
    this.active = true;
    this.first = isTransmitter ? RECESSIVE : DOMINANT;
    this.wait = isTransmitter ? this.p.pwmo : 0;
    this.forced = isTransmitter ? FORCED_PWM0_SYMBOLS : 0;
    this.pos = 0;
  }

  stop() {
    this.active = false;
  }

  // Called once per node clock with the current NRZ level. Returns the TX_CC
  // level for this clock period, or null when PWM is not driving.
  tick(nrz) {
    if (!this.active) return null;
    if (this.wait > 0) {
      this.wait--;
      return null;
    }
    if (this.pos === 0) {
      let v = nrz;
      if (this.forced > 0) {
        v = DOMINANT;
        this.forced--;
      }
      this.firstLen = v === this.first ? this.p.pwml : this.p.pwms;
    }
    const level = this.pos < this.firstLen ? this.first : 1 - this.first;
    this.pos = (this.pos + 1) % this.p.symLenClk;
    return level;
  }
}
