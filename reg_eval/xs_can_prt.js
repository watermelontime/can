// XS_CAN: PRT register decoding
import { getBits } from './help_functions.js';
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
    reg.MODE.fields.TSSE = getBits(regValue, 13, 13);  // Transceiver Sharing Switch Mode Enable
    reg.MODE.fields.LCHB = getBits(regValue, 12, 12);  // CAN FD Light Commander High Bit Rate Mode

    // 2. Store MODE-related bit timing settings in general structure
    //   (no extra settings yet for X_CANB)

    // 3. Generate human-readable register report
    reg.MODE.report.push({
      severityLevel: sevC.info, // info
          msg: `MODE part 2: ${reg.MODE.name_long} (0x${reg.MODE.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
               `[TSSE] Transceiver Sharing Switch Enable           = ${reg.MODE.fields.TSSE} (only in XS_CAN V1.0.0)\n` +
               `[LCHB] FD light Commander High Bit Rate mode       = ${reg.MODE.fields.LCHB} (0=disabled, 1=enabled)`
      });

  } // end if MODE

  // === STAT0: PRT Status Register =========================================
    // Register-Name changed from X_CAN to XS_CAN
    // X_CAN:  STAT
    // XS_CAN: STAT0

    // Renamin the register is not possible, only copying it to a new register is possible. But this changes the print order.
    // Decision: keep register with wrong name for the moment

  // === STAT1: PRT Status 1 Register =========================================
  if ('STAT1' in reg && reg.STAT1.int32 !== undefined) {
    const regValue = reg.STAT1.int32;

    // 0. Extend existing register structure
    reg.STAT1.fields = {};
    reg.STAT1.report = []; // Initialize report array

    // 1. Decode STAT1 fields per XS_CAN template
    reg.STAT1.fields.RX_TSS         = getBits(regValue, 6, 6); // RX Transmitter Sharing Suppress
    reg.STAT1.fields.TX_FSM_STATUS  = getBits(regValue, 5, 3); // Tx FSM Status (xcan_prt_shr RTL)
    reg.STAT1.fields.RX_FSM_STATUS  = getBits(regValue, 2, 0); // Rx FSM Status (xcan_prt_rxc RTL)

    // 2. Generate human-readable STAT1 report
    reg.STAT1.report.push({
      severityLevel: sevC.info, // info
      msg: `STAT1: ${reg.STAT1.name_long} (0x${reg.STAT1.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[RX_TSS       ] RX Transceiver Sharing Suppress = ${reg.STAT1.fields.RX_TSS} (1: suppress ACK/PWM)\n` +
           `[TX_FSM_STATUS] Tx FSM Status (xcan_prt_shr)    = ${reg.STAT1.fields.TX_FSM_STATUS}\n` +
           `[RX_FSM_STATUS] Rx FSM Status (xcan_prt_rxc)    = ${reg.STAT1.fields.RX_FSM_STATUS}`
    });
  }

  // === STATISTIC_COUNTER: PRT Statistic Counter Register ==============================
  if ('STATISTIC_COUNTER' in reg && reg.STATISTIC_COUNTER.int32 !== undefined) {
    const regValue = reg.STATISTIC_COUNTER.int32;

    // 0. Extend existing register structure
    reg.STATISTIC_COUNTER.fields = {};
    reg.STATISTIC_COUNTER.report = []; // Initialize report array

    // 1. Decode counters
    reg.STATISTIC_COUNTER.fields.RX_UNSUCC = getBits(regValue, 31, 24); // RX unsuccessful receptions (ended in error)
    reg.STATISTIC_COUNTER.fields.RX_SUCC   = getBits(regValue, 23, 16); // RX successful receptions
    reg.STATISTIC_COUNTER.fields.TX_UNSUCC = getBits(regValue, 15, 8);  // TX unsuccessful attempts (error on bus)
    reg.STATISTIC_COUNTER.fields.TX_SUCC   = getBits(regValue, 7, 0);   // TX successful messages

    // 2. Generate human-readable register report
    reg.STATISTIC_COUNTER.report.push({
      severityLevel: sevC.info, // info
      msg: `STATISTIC_COUNTER: ${reg.STATISTIC_COUNTER.name_long} (0x${reg.STATISTIC_COUNTER.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[RX_UNSUCC] RX unsuccessful receptions = ${reg.STATISTIC_COUNTER.fields.RX_UNSUCC}\n` +
           `[RX_SUCC  ] RX successful receptions   = ${reg.STATISTIC_COUNTER.fields.RX_SUCC}\n` +
           `[TX_UNSUCC] TX unsuccessful attempts   = ${reg.STATISTIC_COUNTER.fields.TX_UNSUCC} (excludes ARBLOST/HFI)\n` +
           `[TX_SUCC  ] TX successful messages     = ${reg.STATISTIC_COUNTER.fields.TX_SUCC}`
    });
  }

  // === EVNT: Extract the additional parameters from this register ================================
  if ('EVNT' in reg && reg.EVNT.int32 !== undefined && reg.EVNT.fields !== undefined) {
    // Entry Condition: Checks if main PRT Decoding was already processed

    const regValue = reg.MODE.int32;

    // 0. Extend existing register structure
    if (reg.MODE.fields === undefined) {
      reg.MODE.fields = {}; 
    }
    if (reg.MODE.report === undefined) {
      reg.MODE.report = []; // Initialize report array
    }

    // 1. Decode all individual bits of EVNT register (MSB -> LSB)
    reg.EVNT.fields.TX_PARITY_ERR_TS = getBits(regValue, 15, 15); // Parity Error in TS of Tx MSG
    reg.EVNT.fields.RX_PARITY_ERR_TS = getBits(regValue, 14, 14); // Parity Error in TS of Rx MSG

    // 2. Generate human-readable register report (MSB -> LSB)
    reg.EVNT.report.push({
      severityLevel: sevC.info,
       msg: `EVNT part 2: ${reg.EVNT.name_long} (0x${reg.EVNT.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
         `[TX_PARITY_ERR_TS] Parity Error in TS of Tx MSG = ${reg.EVNT.fields.TX_PARITY_ERR_TS}\n` +
         `[RX_PARITY_ERR_TS] Parity Error in TS of Rx MSG = ${reg.EVNT.fields.RX_PARITY_ERR_TS}`
    });

    // 3. Additional summary/reporting
  } // EVNT

} // PRT