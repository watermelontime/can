// TODO: add TSSE bit for XS_CAN 1.1.0

// All rights reserved. (c) 2026 //

// XS_CAN: PRT register decoding
import { getBits, defineField } from './help_functions.js';
import { sevC } from './help_functions.js';

// ==================================================================================
// Process Nominal Bit Timing Register: Extract parameters, validate ranges, calculate results, generate report
export function procRegsPrtExtraXsCan(reg) {
  // This function processes the extra XS_CAN PRT registers & difference to X_CAN PRT

  // Difference in XS_CAN 1.0.0 PRT vs X_CAN PRT:
  //   no PREL Register
  //   MODE: new bits TSSE, LCHB
  //   STAT0 = new name of STAT, uses PREL address
  //   STAT1 = new
  //   STATISTIC_COUNTER = new
  //   EVNT register has 2 new bits: 14, 15
  
  // Rule: only assign reg.general.* values if they are meaningful
  //       leave values undefined, if a) according registers are not present
  //                                  b) configuration disables a feature (e.g. TMS=OFF => then do not provide PWM settings & results)

  // === MODE: Extract the additional parameters from this register ==========================
  if ('MODE' in reg && reg.MODE.int32 !== undefined && reg.MODE.fields !== undefined) {
    // Entry Condition: Checks if main PRT Decoding was already processed

    const regValue = reg.MODE.int32;

    // 0. Extend existing register structure
    if (reg.MODE.fields === undefined) {
      reg.MODE.fields = {}; 
    }
    if (reg.MODE.report === undefined) {
      reg.MODE.report = []; // Initialize report array
    }
  
    // 1. Decode all individual bits of MODE register
    defineField(reg.MODE, regValue, 'TSSE', 13, 13, 'Transceiver Sharing Switch Enable');
    defineField(reg.MODE, regValue, 'LCHB', 12, 12, 'FD light Commander High Bit Rate mode');

    // 2. Store MODE-related bit timing settings in general structure
    //   (no extra settings yet for X_CANB)

    // 3. Generate human-readable register report
    const f = reg.MODE.fields;
    reg.MODE.report.push({
      severityLevel: sevC.info, // info
          msg: `MODE part 2: ${reg.MODE.name_long} (0x${reg.MODE.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
               `[${f.TSSE.name_short.padEnd(4)}] ${f.TSSE.name_long.padEnd(43)} = ${f.TSSE.value} (only present in XS_CAN V1.0.0)\n` +
               `[${f.LCHB.name_short.padEnd(4)}] ${f.LCHB.name_long.padEnd(43)} = ${f.LCHB.value} (0=disabled, 1=enabled)`
      });

  } // end if MODE

  // === STAT0: PRT Status Register =========================================
    // Register-Name changed from X_CAN to XS_CAN
    // X_CAN:  STAT
    // XS_CAN: STAT0

    // Renaming the register is not possible, only copying it to a new register is possible. But this changes the print order.
    // Decision: keep register with wrong name for the moment

  // === STAT1: PRT Status 1 Register =========================================
  if ('STAT1' in reg && reg.STAT1.int32 !== undefined) {
    const regValue = reg.STAT1.int32;

    // 0. Extend existing register structure
    reg.STAT1.fields = {};
    reg.STAT1.report = []; // Initialize report array

    // 1. Decode STAT1 fields per XS_CAN template
    defineField(reg.STAT1, regValue, 'RX_TSS', 6, 6, 'RX Transceiver Sharing Suppress');
    defineField(reg.STAT1, regValue, 'TX_FSM_STATUS', 5, 3, 'Tx FSM Status (xcan_prt_shr)');
    defineField(reg.STAT1, regValue, 'RX_FSM_STATUS', 2, 0, 'Rx FSM Status (xcan_prt_rxc)');

    // 2. Generate human-readable STAT1 report
    const f = reg.STAT1.fields;
    reg.STAT1.report.push({
      severityLevel: sevC.info, // info
      msg: `STAT1: ${reg.STAT1.name_long} (0x${reg.STAT1.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.RX_TSS.name_short.padEnd(13)}] ${f.RX_TSS.name_long.padEnd(31)} = ${f.RX_TSS.value} (1: suppress ACK/PWM)\n` +
           `[${f.TX_FSM_STATUS.name_short.padEnd(13)}] ${f.TX_FSM_STATUS.name_long.padEnd(31)} = ${f.TX_FSM_STATUS.value}\n` +
           `[${f.RX_FSM_STATUS.name_short.padEnd(13)}] ${f.RX_FSM_STATUS.name_long.padEnd(31)} = ${f.RX_FSM_STATUS.value}`
    });
  }

  // === STATISTIC_COUNTER: PRT Statistic Counter Register ==============================
  if ('STATISTIC_COUNTER' in reg && reg.STATISTIC_COUNTER.int32 !== undefined) {
    const regValue = reg.STATISTIC_COUNTER.int32;

    // 0. Extend existing register structure
    reg.STATISTIC_COUNTER.fields = {};
    reg.STATISTIC_COUNTER.report = []; // Initialize report array

    // 1. Decode counters
    defineField(reg.STATISTIC_COUNTER, regValue, 'RX_UNSUCC', 31, 24, 'RX unsuccessful receptions');
    defineField(reg.STATISTIC_COUNTER, regValue, 'RX_SUCC', 23, 16, 'RX successful receptions');
    defineField(reg.STATISTIC_COUNTER, regValue, 'TX_UNSUCC', 15, 8, 'TX unsuccessful attempts');
    defineField(reg.STATISTIC_COUNTER, regValue, 'TX_SUCC', 7, 0, 'TX successful messages');

    // 2. Generate human-readable register report
    const f = reg.STATISTIC_COUNTER.fields;
    reg.STATISTIC_COUNTER.report.push({
      severityLevel: sevC.info, // info
      msg: `STATISTIC_COUNTER: ${reg.STATISTIC_COUNTER.name_long} (0x${reg.STATISTIC_COUNTER.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.RX_UNSUCC.name_short.padEnd(9)}] ${f.RX_UNSUCC.name_long.padEnd(26)} = ${f.RX_UNSUCC.value}\n` +
           `[${f.RX_SUCC.name_short.padEnd(9)}] ${f.RX_SUCC.name_long.padEnd(26)} = ${f.RX_SUCC.value}\n` +
           `[${f.TX_UNSUCC.name_short.padEnd(9)}] ${f.TX_UNSUCC.name_long.padEnd(26)} = ${f.TX_UNSUCC.value} (excludes ARBLOST/HFI)\n` +
           `[${f.TX_SUCC.name_short.padEnd(9)}] ${f.TX_SUCC.name_long.padEnd(26)} = ${f.TX_SUCC.value}`
    });
  }

  // === EVNT: Extract the additional parameters from this register ================================
  if ('EVNT' in reg && reg.EVNT.int32 !== undefined && reg.EVNT.fields !== undefined) {
    // Entry Condition: Checks if main PRT Decoding was already processed

    const regValue = reg.EVNT.int32;

    // 0. Extend existing register structure
    if (reg.EVNT.fields === undefined) {
      reg.EVNT.fields = {}; 
    }
    if (reg.EVNT.report === undefined) {
      reg.EVNT.report = []; // Initialize report array
    }

    // 1. Decode all individual bits of EVNT register (MSB -> LSB)
    defineField(reg.EVNT, regValue, 'TX_PARITY_ERR_TS', 15, 15, 'Parity Error in TS of Tx MSG');
    defineField(reg.EVNT, regValue, 'RX_PARITY_ERR_TS', 14, 14, 'Parity Error in TS of Rx MSG');

    // 2. Generate human-readable register report (MSB -> LSB)
    const f = reg.EVNT.fields;
    reg.EVNT.report.push({
      severityLevel: sevC.info,
       msg: `EVNT: ${reg.EVNT.name_long} (0x${reg.EVNT.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
         `Part 2 of EVNT decoding. These bits are additional to ones in X_CAN.PRT.EVNT. Bits are reported separately to enable code reuse.\n` +
         `[${f.TX_PARITY_ERR_TS.name_short.padEnd(16)}] ${f.TX_PARITY_ERR_TS.name_long.padEnd(28)} = ${f.TX_PARITY_ERR_TS.value}\n` +
         `[${f.RX_PARITY_ERR_TS.name_short.padEnd(16)}] ${f.RX_PARITY_ERR_TS.name_long.padEnd(28)} = ${f.RX_PARITY_ERR_TS.value}`
    });
  } // EVNT

} // PRT