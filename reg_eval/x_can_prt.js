// All rights reserved. (c) 2026 //

// X_CAN: PRT register decoding
import { getBits } from './help_functions.js';
import { defineField } from './help_functions.js';
import { sevC } from './help_functions.js';

// TODO: check bit timing check rules, some things might be missing

// ==================================================================================
// Process Bit Timing Register: Extract parameters, validate ranges, calculate results, generate report
export function procRegsPrtBitTiming(reg) {

  // Initialize bit timing structure in reg.general
  if (!reg.general.bt_global) {
    reg.general.bt_global = { set: {}, res: {} };
  }
  // Initialize bit timing structure in reg.general
  if (!reg.general.bt_arb) {
    reg.general.bt_arb = { set: {}, res: {} };
  }
  // Initialize bit timing structure in reg.general
  if (!reg.general.bt_fddata) {
    reg.general.bt_fddata = { set: {}, res: {} };
  }
  // Initialize bit timing structure in reg.general
  if (!reg.general.bt_xldata) {
    reg.general.bt_xldata = { set: {}, res: {} };
  }

  // Rule: only assign reg.general.* values if they are meaningful
  //       leave values undefined, if a) according registers are not present
  //                                  b) configuration disables a feature (e.g. TMS=OFF => then do not provide PWM settings & results)

  // === MODE: Extract parameters from register ==========================
  if ('MODE' in reg && reg.MODE.int32 !== undefined) {
    const regValue = reg.MODE.int32;

    // 0. Extend existing register structure
    reg.MODE.fields = {};
    reg.MODE.report = []; // Initialize report array

    // 1. Decode all individual bits of MODE register
    defineField(reg.MODE, regValue, 'FIME', 11, 11, 'Fault Injection Module Enable');
    defineField(reg.MODE, regValue, 'EFDI', 10, 10, 'Error Flag/Frame Disable');
    defineField(reg.MODE, regValue, 'XLTR',  9,  9, 'Transceiver Mode Switching (TMS) Enable');
    defineField(reg.MODE, regValue, 'SFS',   8,  8, 'Time Stamp Position: SOF(1), EOF(0)');
    defineField(reg.MODE, regValue, 'RSTR',  7,  7, 'Restricted Mode Enable');
    defineField(reg.MODE, regValue, 'MON',   6,  6, '(Bus) Monitoring Mode Enable');
    defineField(reg.MODE, regValue, 'TXP',   5,  5, 'TX Pause');
    defineField(reg.MODE, regValue, 'EFBI',  4,  4, 'Edge Filtering during Bus Integration');
    defineField(reg.MODE, regValue, 'PXHD',  3,  3, 'Protocol Exception Handling Disable');
    defineField(reg.MODE, regValue, 'TDCE',  2,  2, 'Transmitter Delay Compensation (TDC) Enable');
    defineField(reg.MODE, regValue, 'XLOE',  1,  1, 'XL Operation Enable');
    defineField(reg.MODE, regValue, 'FDOE',  0,  0, 'FD Operation Enable');

    const f = reg.MODE.fields;

    // 2. Store MODE-related bit timing settings in general structure
    reg.general.bt_global.set.tms = (f.XLTR.value === 1);
    reg.general.bt_global.set.tdc = (f.TDCE.value === 1);
    reg.general.bt_global.set.es  = (f.EFDI.value === 0); // Error Signaling Enable when EFDI=0
    reg.general.bt_global.set.fd  = (f.FDOE.value === 1 && reg.general.bt_global.set.es === true && reg.general.bt_global.set.tms === false); // FD Operation Enable when FDOE=1
    reg.general.bt_global.set.xl  = (f.XLOE.value === 1); // XL Operation Enable when XLOE=1

    // 3. Generate human-readable register report
  reg.MODE.report.push({
    severityLevel: sevC.info, // info
        msg: `MODE: ${reg.MODE.name_long} (0x${reg.MODE.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[${f.FIME.name_short.padEnd(4)}] ${f.FIME.name_long.padEnd(43)} = ${f.FIME.value}\n` +
             `[${f.EFDI.name_short.padEnd(4)}] ${f.EFDI.name_long.padEnd(43)} = ${f.EFDI.value}\n` +
             `[${f.XLTR.name_short.padEnd(4)}] ${f.XLTR.name_long.padEnd(43)} = ${f.XLTR.value}\n` +
             `[${f.SFS.name_short.padEnd(4)}] ${f.SFS.name_long.padEnd(43)} = ${f.SFS.value}\n` +
             `[${f.RSTR.name_short.padEnd(4)}] ${f.RSTR.name_long.padEnd(43)} = ${f.RSTR.value}\n` +
             `[${f.MON.name_short.padEnd(4)}] ${f.MON.name_long.padEnd(43)} = ${f.MON.value}\n` +
             `[${f.TXP.name_short.padEnd(4)}] ${f.TXP.name_long.padEnd(43)} = ${f.TXP.value}\n` +
             `[${f.EFBI.name_short.padEnd(4)}] ${f.EFBI.name_long.padEnd(43)} = ${f.EFBI.value}\n` +
             `[${f.PXHD.name_short.padEnd(4)}] ${f.PXHD.name_long.padEnd(43)} = ${f.PXHD.value}\n` +
             `[${f.TDCE.name_short.padEnd(4)}] ${f.TDCE.name_long.padEnd(43)} = ${f.TDCE.value}\n` +
             `[${f.XLOE.name_short.padEnd(4)}] ${f.XLOE.name_long.padEnd(43)} = ${f.XLOE.value}\n` +
             `[${f.FDOE.name_short.padEnd(4)}] ${f.FDOE.name_long.padEnd(43)} = ${f.FDOE.value}`
    });

    // Check: FDOE is set when XLOE is also set
    if (f.FDOE.value === 0 && f.XLOE.value === 1) {
      reg.MODE.report.push({
        severityLevel: sevC.error, // error
        msg: `MODE: FDOE (${f.FDOE.value}) is not set when XLOE (${f.XLOE.value}) is set. FDOE must be set to 1 when XLOE is set to 1.`
      });
    }

    // Check: TMS=1 while ES=0
    if (f.XLTR.value === 1 && f.EFDI.value === 0) {
      reg.MODE.report.push({
        severityLevel: sevC.error, // error
        msg: `MODE: TMS=ON while ES=OFF. This is not supported by X_CAN. XLTR (${f.XLTR.value}), EFDI (${f.EFDI.value})`
      });
    }
  }

  // === NBTP: Extract parameters from register ==========================
  if ('NBTP' in reg && reg.NBTP.int32 !== undefined) {
    const regValue = reg.NBTP.int32;

    // 0. Extend existing register structure
    reg.NBTP.fields = {};
    reg.NBTP.report = []; // Initialize report array

    // 1. Decode all individual bits of NBTP register
    defineField(reg.NBTP, regValue, 'BRP',    29, 25, 'Bit Rate Prescaler', r => r + 1);
    defineField(reg.NBTP, regValue, 'NTSEG1', 24, 16, 'Nominal Time Segment 1', r => r + 1);
    defineField(reg.NBTP, regValue, 'NTSEG2', 14,  8, 'Nominal Time Segment 2', r => r + 1);
    defineField(reg.NBTP, regValue, 'NSJW',    6,  0, 'Nominal SJW', r => r + 1);

    const f = reg.NBTP.fields;

    // 2. Store NBTP bit timing settings in general structure
    reg.general.bt_arb.set.brp = f.BRP.decoded;
    reg.general.bt_arb.set.prop_and_phaseseg1 = f.NTSEG1.decoded;
    reg.general.bt_arb.set.phaseseg2 = f.NTSEG2.decoded;
    reg.general.bt_arb.set.sjw = f.NSJW.decoded;

    // 3. Generate human-readable register report
  reg.NBTP.report.push({
    severityLevel: sevC.info, // info
        msg: `NBTP: ${reg.NBTP.name_long} (0x${reg.NBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[${f.BRP.name_short.padEnd(6)}] ${f.BRP.name_long.padEnd(22)} = ${f.BRP.decoded.toString(10).padStart(3,' ')} (range: 1- 32)\n` +
             `[${f.NTSEG1.name_short.padEnd(6)}] ${f.NTSEG1.name_long.padEnd(22)} = ${f.NTSEG1.decoded.toString(10).padStart(3,' ')} (range: 1-512) TQ\n` +
             `[${f.NTSEG2.name_short.padEnd(6)}] ${f.NTSEG2.name_long.padEnd(22)} = ${f.NTSEG2.decoded.toString(10).padStart(3,' ')} (range: 1-128) TQ\n` +
             `[${f.NSJW.name_short.padEnd(6)}] ${f.NSJW.name_long.padEnd(22)} = ${f.NSJW.decoded.toString(10).padStart(3,' ')} (range: 1-128) TQ`
    });

    // 4. Calculate arbitration phase results and store in general structure
    reg.general.bt_arb.res.tq_len = reg.general.clk_period * reg.general.bt_arb.set.brp;
    reg.general.bt_arb.res.tq_per_bit = 1 + reg.general.bt_arb.set.prop_and_phaseseg1 + reg.general.bt_arb.set.phaseseg2;
    reg.general.bt_arb.res.bitrate = reg.general.clk_freq / (reg.general.bt_arb.set.brp * reg.general.bt_arb.res.tq_per_bit);
    reg.general.bt_arb.res.bit_length = 1000 / reg.general.bt_arb.res.bitrate;
    reg.general.bt_arb.res.sp = 100 - 100 * reg.general.bt_arb.set.phaseseg2 / reg.general.bt_arb.res.tq_per_bit;
    
    // 5. Generate Report about settings
  reg.NBTP.report.push({
    severityLevel: sevC.calculation, // infoCalculated
        msg: `Nominal Bitrate (Arbitration Phase)\n` +
             `Bitrate    = ${reg.general.bt_arb.res.bitrate} Mbit/s\n` +
             `Bit Length = ${reg.general.bt_arb.res.bit_length} ns\n` +
             `TQ per Bit = ${reg.general.bt_arb.res.tq_per_bit}\n` +
             `SP         = ${reg.general.bt_arb.res.sp} %`
    });

    // Check: check for SJW <= min(PhaseSeg1, PhaseSeg2)?
    if (reg.general.bt_arb.set.sjw > reg.general.bt_arb.set.phaseseg2) {
      reg.NBTP.report.push({
        severityLevel: sevC.error, // error
        msg: `NBTP: SJW (${reg.general.bt_arb.set.sjw}) > PhaseSeg2 (${reg.general.bt_arb.set.phaseseg2}). ISO 11898-1 requires SJW <= PhaseSeg2.`
      });
    }

    // Check: check for PhaseSeg2 >= 2
    if (reg.general.bt_arb.set.phaseseg2 < 2) {
      reg.NBTP.report.push({
        severityLevel: sevC.error, // error
        msg: `NBTP: PhaseSeg2 (${reg.general.bt_arb.set.phaseseg2}) < 2. ISO 11898-1 requires a value >= 2.`
      });
    }

    // Check: SJW choosen as large as possible?
    if (reg.general.bt_arb.set.sjw < reg.general.bt_arb.set.phaseseg2) {
      reg.NBTP.report.push({
        severityLevel: sevC.warning, // warning
        msg: `NBTP: SJW (${reg.general.bt_arb.set.sjw}) < PhaseSeg2 (${reg.general.bt_arb.set.phaseseg2}). It is recommended to use SJW=PhaseSeg2.`
      });
    }

    // Check: Number of TQ large enough?
    if (reg.general.bt_arb.res.tq_per_bit < 8) {
      reg.NBTP.report.push({
        severityLevel: sevC.warning, // warning
        msg: `NBTP: Number of TQ/Bit is small. If possible, increase the TQ/Bit by reducing BRP or increasing the CAN Clock Freq.`
      });
    }
  } // end if NBTP

  // === DBTP: Extract parameters from register ==========================
  if ('DBTP' in reg && reg.DBTP.int32 !== undefined) {
    const regValue = reg.DBTP.int32;

    // 0. Extend existing register structure
    reg.DBTP.fields = {};
    reg.DBTP.report = []; // Initialize report array

    // 1. Decode all individual bits of DBTP register
    defineField(reg.DBTP, regValue, 'DTDCO',  31, 24, 'FD TDC Offset');
    defineField(reg.DBTP, regValue, 'DTSEG1', 23, 16, 'FD Time Segment 1', r => r + 1);
    defineField(reg.DBTP, regValue, 'DTSEG2', 14,  8, 'FD Time Segment 2', r => r + 1);
    defineField(reg.DBTP, regValue, 'DSJW',    6,  0, 'FD SJW', r => r + 1);

    const f = reg.DBTP.fields;
    // TODO: move storage of global parameters into area after check "FD enabled"
    // 2. Store DBTP bit timing settings in general structure
    reg.general.bt_fddata.set.ssp_offset = f.DTDCO.value;
    reg.general.bt_fddata.set.prop_and_phaseseg1 = f.DTSEG1.decoded;
    reg.general.bt_fddata.set.phaseseg2 = f.DTSEG2.decoded;
    reg.general.bt_fddata.set.sjw = f.DSJW.decoded;
    // set brp (as a copy of arb)
    reg.general.bt_fddata.set.brp = reg.general.bt_arb.set.brp !== undefined ? reg.general.bt_arb.set.brp : 0; // X_CAN uses same BRP as in arbitration phase

    // different output based on FD enabled yes/no
    if (reg.general.bt_global.set.fd !== undefined && reg.general.bt_global.set.fd === false) {
      // 3. Generate human-readable register report
      reg.DBTP.report.push({
        severityLevel: sevC.warning, // warning
        msg: `DBTP: ${reg.DBTP.name_long} (0x${reg.DBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `FD Operation is disabled: a) MODE.FDOE=0 OR b) TMS=ON or ES=OFF OR c) MODE register not present in register dump`
      });

    } else { // FD enabled (or MODE register not present)
      // 3. Generate human-readable register report
      reg.DBTP.report.push({
        severityLevel: sevC.info, // info
          msg: `DBTP: ${reg.DBTP.name_long} (0x${reg.DBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
               `[${f.DTDCO.name_short.padEnd(6)}] ${f.DTDCO.name_long.padEnd(17)} = ${f.DTDCO.value.toString(10).padStart(3,' ')} (range: 0-255) clock periods\n` +
               `[${f.DTSEG1.name_short.padEnd(6)}] ${f.DTSEG1.name_long.padEnd(17)} = ${f.DTSEG1.decoded.toString(10).padStart(3,' ')} (range: 1-256) TQ\n` +
               `[${f.DTSEG2.name_short.padEnd(6)}] ${f.DTSEG2.name_long.padEnd(17)} = ${f.DTSEG2.decoded.toString(10).padStart(3,' ')} (range: 1-128) TQ\n` +
               `[${f.DSJW.name_short.padEnd(6)}] ${f.DSJW.name_long.padEnd(17)} = ${f.DSJW.decoded.toString(10).padStart(3,' ')} (range: 1-128) TQ`
        });

      // 4. Calculate FD data phase results and store in general structure
      reg.general.bt_fddata.res.tq_len = reg.general.clk_period * reg.general.bt_fddata.set.brp;
      reg.general.bt_fddata.res.tq_per_bit = 1 + reg.general.bt_fddata.set.prop_and_phaseseg1 + reg.general.bt_fddata.set.phaseseg2;
      reg.general.bt_fddata.res.bitrate = reg.general.clk_freq / (reg.general.bt_fddata.set.brp * reg.general.bt_fddata.res.tq_per_bit);
      reg.general.bt_fddata.res.bit_length = 1000 / reg.general.bt_fddata.res.bitrate;
      reg.general.bt_fddata.res.sp = 100 - 100 * reg.general.bt_fddata.set.phaseseg2 / reg.general.bt_fddata.res.tq_per_bit;
      
      // Calculate SSP (Secondary Sample Point) if TDC is enabled
      if (reg.general.bt_global.set.tdc === true) {
        reg.general.bt_fddata.res.ssp = 100*reg.general.bt_fddata.set.ssp_offset/reg.general.bt_fddata.res.tq_per_bit;
      } else {
        reg.general.bt_fddata.res.ssp = 0; // SSP not used when TDC disabled
      }

      // 5. Generate Report about settings
    reg.DBTP.report.push({
      severityLevel: sevC.calculation, // infoCalculated
          msg: `CAN FD Data Phase Bitrate\n` +
               `Bitrate    = ${reg.general.bt_fddata.res.bitrate} Mbit/s\n` +
               `Bit Length = ${reg.general.bt_fddata.res.bit_length} ns\n` +
               `TQ per Bit = ${reg.general.bt_fddata.res.tq_per_bit}\n` +
               `SP         = ${reg.general.bt_fddata.res.sp} %\n` +
               `SSP        = ${reg.general.bt_fddata.res.ssp} %`
      });

      // Check: CAN Clock Frequency as recommended in CiA 601-3?
      if ((reg.general.clk_freq != 160) && (reg.general.clk_freq != 80) && (reg.general.clk_freq != 40) && (reg.general.clk_freq != 20)) {
        reg.DBTP.report.push({
          severityLevel: sevC.warning, // warning
          msg: `CAN FD: Recommended CAN Clock Frequency is 20, 40, 80 MHz etc. (see CiA 601-3). Current value is ${reg.general.clk_freq} MHz.`
        });
      }

      // Check: check for SJW <= min(PhaseSeg1, PhaseSeg2)?
      if (reg.general.bt_fddata.set.sjw > reg.general.bt_fddata.set.phaseseg2) {
        reg.DBTP.report.push({
          severityLevel: sevC.error, // error
          msg: `DBTP: SJW (${reg.general.bt_fddata.set.sjw}) > PhaseSeg2 (${reg.general.bt_fddata.set.phaseseg2}). ISO 11898-1 requires SJW <= PhaseSeg2.`
        });
      }

      // Check: check for PhaseSeg2 >= 2
      if (reg.general.bt_fddata.set.phaseseg2 < 2) {
        reg.DBTP.report.push({
          severityLevel: sevC.error, // error
          msg: `DBTP: PhaseSeg2 (${reg.general.bt_fddata.set.phaseseg2}) < 2. ISO 11898-1 requires a value >= 2.`
        });
      }

      // Check: SJW choosen as large as possible?
      if (reg.general.bt_fddata.set.sjw < reg.general.bt_fddata.set.phaseseg2) {
        reg.DBTP.report.push({
          severityLevel: sevC.warning, // warning
          msg: `DBTP: SJW (${reg.general.bt_fddata.set.sjw}) < PhaseSeg2 (${reg.general.bt_fddata.set.phaseseg2}). It is recommended to use SJW=PhaseSeg2.`
        });
      }

      // Check: Number of TQ large enough?
      if (reg.general.bt_fddata.res.tq_per_bit < 8) {
        reg.DBTP.report.push({
          severityLevel: sevC.warning, // warning
          msg: `DBTP: Number of TQ/Bit is small. If possible, increase the TQ/Bit by reducing BRP or increasing the CAN Clock Freq.`
        });
      }
    } // end if FDOE
    
  } // end if DBTP

  // === XBTP: Extract parameters from register ==========================
  if ('XBTP' in reg && reg.XBTP.int32 !== undefined) {
    const regValue = reg.XBTP.int32;

    // 0. Extend existing register structure
    reg.XBTP.fields = {};
    reg.XBTP.report = []; // Initialize report array

    // 1. Decode all individual bits of XBTP register
    defineField(reg.XBTP, regValue, 'XTDCO',  31, 24, 'XL TDC Offset');
    defineField(reg.XBTP, regValue, 'XTSEG1', 23, 16, 'XL Time Segment 1', r => r + 1);
    defineField(reg.XBTP, regValue, 'XTSEG2', 14,  8, 'XL Time Segment 2', r => r + 1);
    defineField(reg.XBTP, regValue, 'XSJW',    6,  0, 'XL SJW', r => r + 1);

    const f = reg.XBTP.fields;

    // 2. Store XBTP bit timing settings in general structure
    reg.general.bt_xldata.set.ssp_offset = f.XTDCO.value;
    reg.general.bt_xldata.set.prop_and_phaseseg1 = f.XTSEG1.decoded;
    reg.general.bt_xldata.set.phaseseg2 = f.XTSEG2.decoded;
    reg.general.bt_xldata.set.sjw = f.XSJW.decoded;
    // set brp (as a copy of arb)
    reg.general.bt_xldata.set.brp = reg.general.bt_arb.set.brp !== undefined ? reg.general.bt_arb.set.brp : 0; // X_CAN uses same BRP as in arbitration phase

    // different output based on XL enabled yes/no
    if (reg.general.bt_global.set.xl !== undefined && reg.general.bt_global.set.xl === false) {
      // 3. Generate human-readable register report
      reg.XBTP.report.push({
        severityLevel: sevC.warning,
        msg: `XBTP: ${reg.XBTP.name_long} (0x${reg.XBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `XL Operation is disabled (MODE.XLOE=0) OR MODE register not present`
      });

    } else { // XL enabled (or MODE register not present)
      // 3. Generate human-readable register report
    reg.XBTP.report.push({
      severityLevel: sevC.info, // info
          msg: `XBTP: ${reg.XBTP.name_long} (0x${reg.XBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
               `[${f.XTDCO.name_short.padEnd(6)}] ${f.XTDCO.name_long.padEnd(17)} = ${f.XTDCO.value.toString(10).padStart(3,' ')} (range: 0-255) clock periods\n` +
               `[${f.XTSEG1.name_short.padEnd(6)}] ${f.XTSEG1.name_long.padEnd(17)} = ${f.XTSEG1.decoded.toString(10).padStart(3,' ')} (range: 1-256) TQ\n` +
               `[${f.XTSEG2.name_short.padEnd(6)}] ${f.XTSEG2.name_long.padEnd(17)} = ${f.XTSEG2.decoded.toString(10).padStart(3,' ')} (range: 1-128) TQ\n` +
               `[${f.XSJW.name_short.padEnd(6)}] ${f.XSJW.name_long.padEnd(17)} = ${f.XSJW.decoded.toString(10).padStart(3,' ')} (range: 1-128) TQ`
      });

      // 4. Calculate XL data phase results and store in general structure
      reg.general.bt_xldata.res.tq_len = reg.general.clk_period * reg.general.bt_xldata.set.brp;
      reg.general.bt_xldata.res.tq_per_bit = 1 + reg.general.bt_xldata.set.prop_and_phaseseg1 + reg.general.bt_xldata.set.phaseseg2;
      reg.general.bt_xldata.res.bitrate = reg.general.clk_freq / (reg.general.bt_xldata.set.brp * reg.general.bt_xldata.res.tq_per_bit);
      reg.general.bt_xldata.res.bit_length = 1000 / reg.general.bt_xldata.res.bitrate;
      reg.general.bt_xldata.res.sp = 100 - 100 * reg.general.bt_xldata.set.phaseseg2 / reg.general.bt_xldata.res.tq_per_bit;
      
      // Calculate SSP (Secondary Sample Point) if TDC is enabled
      if (reg.general.bt_global.set.tdc === true) {
        reg.general.bt_xldata.res.ssp = 100 - 100*reg.general.bt_xldata.set.ssp_offset/reg.general.bt_xldata.res.tq_per_bit;
      } else {
        reg.general.bt_xldata.res.ssp = 0; // SSP not used when TDC disabled
      }

      // 5. Generate Report about settings
    reg.XBTP.report.push({
      severityLevel: sevC.calculation, // infoCalculated
          msg: `XL Data Phase Bitrate\n` +
               `Bitrate    = ${reg.general.bt_xldata.res.bitrate} Mbit/s\n` +
               `Bit Length = ${reg.general.bt_xldata.res.bit_length} ns\n` +
               `TQ per Bit = ${reg.general.bt_xldata.res.tq_per_bit}\n` +
               `SP         = ${reg.general.bt_xldata.res.sp} %\n` +
               `SSP        = ${reg.general.bt_xldata.res.ssp} %`
      });

      // Check: CAN Clock Frequency as recommended in CiA 612-1?
      if ((reg.general.clk_freq != 160) && (reg.general.clk_freq != 80)) {
        reg.XBTP.report.push({
          severityLevel: sevC.warning,
          msg: `CAN XL: Recommended CAN Clock Frequency is 80 MHz or 160 MHz. Current value is ${reg.general.clk_freq} MHz.`
        });
      }

      // Check: check for SJW <= min(PhaseSeg1, PhaseSeg2)?
      if (reg.general.bt_xldata.set.sjw > reg.general.bt_xldata.set.phaseseg2) {
        reg.XBTP.report.push({
          severityLevel: sevC.error,
          msg: `XBTP: SJW (${reg.general.bt_xldata.set.sjw}) > PhaseSeg2 (${reg.general.bt_xldata.set.phaseseg2}). ISO 11898-1 requires SJW <= PhaseSeg2.`
        });
      }

      // Check: check for PhaseSeg2 >= 2
      if (reg.general.bt_xldata.set.phaseseg2 < 2) {
        reg.XBTP.report.push({
          severityLevel: sevC.error,
          msg: `XBTP: PhaseSeg2 (${reg.general.bt_xldata.set.phaseseg2}) < 2. ISO 11898-1 requires a value >= 2.`
        });
      }

      // Check: SJW choosen as large as possible?
      if (reg.general.bt_xldata.set.sjw < reg.general.bt_xldata.set.phaseseg2) {
        reg.XBTP.report.push({
          severityLevel: sevC.warning,
          msg: `XBTP: SJW (${reg.general.bt_xldata.set.sjw}) < PhaseSeg2 (${reg.general.bt_xldata.set.phaseseg2}). It is recommended to use SJW=PhaseSeg2.`
        });
      }

      // Check: Number of TQ large enough?
      if (reg.general.bt_fddata.res.tq_per_bit < 8) {
        reg.DBTP.report.push({
          severityLevel: sevC.warning,
          msg: `XBTP: Number of TQ/Bit is small. If possible, increase the TQ/Bit by reducing BRP or increasing the CAN Clock Freq.`
        });
      }

      // Ratio of Arb. Bit Time / XL Data Bit Time >= 2 ?
      if (!reg.MODE || !reg.MODE.fields || reg.MODE.fields.EFDI.value == 0) { // Error Signaling is enabled
        if (reg.general.bt_arb.res.tq_per_bit < (2 * reg.general.bt_xldata.res.tq_per_bit)) {
          reg.XBTP.report.push({
            severityLevel: sevC.error, // error
            msg: `Minimum Ratio of [XL Data Bitrate / Nominal Bitrate] = ${reg.general.bt_arb.res.tq_per_bit / reg.general.bt_xldata.res.tq_per_bit}. Minimum ratio is 2, when Error Signaling is enabled (MODE.ESDI=0).`
          });
        }
      } // end if EFDI
    } // end if XLOE
  } // end if XBTP
  
  // === PCFG: Extract parameters from register (if TMS is enabled) ==============
  if ('PCFG' in reg && reg.PCFG.int32 !== undefined) {
    const regValue = reg.PCFG.int32;

    // 0. Extend existing register structure
    reg.PCFG.fields = {};
    reg.PCFG.report = []; // Initialize report array

    // 1. Decode all individual bits of PCFG register
    defineField(reg.PCFG, regValue, 'PWMO', 21, 16, 'PWM Offset');
    defineField(reg.PCFG, regValue, 'PWML', 13,  8, 'PWM Phase Long', r => r + 1);
    defineField(reg.PCFG, regValue, 'PWMS',  5,  0, 'PWM Phase Short', r => r + 1);

    const f = reg.PCFG.fields;

    // 2. Store PWM settings in XL data structure
    reg.general.bt_xldata.set.pwm_offset = f.PWMO.value;
    reg.general.bt_xldata.set.pwm_long = f.PWML.decoded;
    reg.general.bt_xldata.set.pwm_short = f.PWMS.decoded;

    // different output based on XLOE & TMS
    // PWM SETTINGS NOT USED
    if (!reg.MODE || !reg.MODE.fields || (reg.MODE.fields.XLOE !== undefined && reg.MODE.fields.XLOE.value == 0) || (reg.MODE.fields.XLTR !== undefined && reg.MODE.fields.XLTR.value == 0) || !reg.XBTP) {
      // 3. Generate human-readable register report
      reg.PCFG.report.push({
        severityLevel: sevC.info, // info
        msg: `PCFG: ${reg.PCFG.name_long} (0x${reg.PCFG.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `XL Operation (MODE.XLOE=0) OR Transceiver Mode Switch (MODE.XLTR=0) is disabled OR MODE register not present`
      });

    } else { // PWM SETTINGS USED (MODE.XLTR == 1 && MODE.XLOE == 1)
      // 3. Generate human-readable register report
      reg.PCFG.report.push({
        severityLevel: sevC.info, // info
          msg: `PCFG: ${reg.PCFG.name_long} (0x${reg.PCFG.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
               `[${f.PWMO.name_short.padEnd(4)}] ${f.PWMO.name_long.padEnd(15)} = ${f.PWMO.value}\n` +
               `[${f.PWML.name_short.padEnd(4)}] ${f.PWML.name_long.padEnd(15)} = ${f.PWML.decoded}\n` +
               `[${f.PWMS.name_short.padEnd(4)}] ${f.PWMS.name_long.padEnd(15)} = ${f.PWMS.decoded}`
      });

      // 4. Calculate PWM results and store in XL data structure
      reg.general.bt_xldata.res.pwm_symbol_len_ns = (reg.general.bt_xldata.set.pwm_short + reg.general.bt_xldata.set.pwm_long) * reg.general.clk_period;
      reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles = (reg.general.bt_xldata.set.pwm_short + reg.general.bt_xldata.set.pwm_long);
      reg.general.bt_xldata.res.pwm_symbols_per_bit_time = (reg.general.bt_xldata.res.tq_per_bit * reg.general.bt_arb.set.brp) / reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles;
      
      // 5. Generate Report about settings
      reg.PCFG.report.push({
        severityLevel: sevC.calculation, // infoCalculated
          msg: `PWM Configuration\nPWM Symbol Length = ${reg.general.bt_xldata.res.pwm_symbol_len_ns} ns = ${reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles} clock cycles\nPWM Symbols per XL Data Bit Time = ${reg.general.bt_xldata.res.pwm_symbols_per_bit_time.toFixed(2)}`
      });

      // Check: Ratio of XL Data Bit Time to PWM Symbol Length
      if (!Number.isInteger(reg.general.bt_xldata.res.pwm_symbols_per_bit_time)) {
        reg.PCFG.report.push({
          severityLevel: sevC.error, // error
          msg: `Length of XL Data Bit Time is not an integer multiple of PWM Symbol Length. tBit/tPWM=${reg.general.bt_xldata.res.pwm_symbols_per_bit_time.toFixed(2)}`
        });
      }

      // Check: PWM Offset correctness
      const pwmo_calculated = (reg.general.bt_arb.res.tq_per_bit * reg.general.bt_arb.set.brp) % reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles;
      if (pwmo_calculated !== reg.general.bt_xldata.set.pwm_offset) {
        reg.PCFG.report.push({
          severityLevel: sevC.error, // error
          msg: `PWM Offset (PCFG.PWMO = ${reg.general.bt_xldata.set.pwm_offset}) is wrong. Correct value is PCFG.PWMO = ${pwmo_calculated}`
        });
      }

      // Check: PWML > PWMS 
      if (f.PWML.decoded <= f.PWMS.decoded) {
        reg.PCFG.report.push({
          severityLevel: sevC.error, // error
          msg: `PWM Phase Long (PCFG.PWML = ${f.PWML.decoded}) must be larger than PWM Phase Short (PCFG.PWMS = ${f.PWMS.decoded})`
        });
      } else {
        // Check: PWML >= 2*PWMS
        if (f.PWML.decoded < (2 * f.PWMS.decoded)) {
          reg.PCFG.report.push({
            severityLevel: sevC.warning, // warning
            msg: `PWM Phase Long (PCFG.PWML = ${f.PWML.decoded}) is only slightly larger than PWM Phase Short (PCFG.PWMS = ${f.PWMS.decoded}). Recommended are PWML = 75%, PWMS= 25% of PWM length.`
          });
        }
      }

    } // end if XLOE || XLTR
  } // end if PCFG
}

// ===================================================================================
// Process Other PRT Registers: Extract parameters, validate ranges, generate report
export function procRegsPrtOther(reg) {

  // === ENDN: Endianness Test Register ====================================
  if ('ENDN' in reg && reg.ENDN.int32 !== undefined) {
    const regValue = reg.ENDN.int32;

    // 0. Extend existing register structure
    reg.ENDN.fields = {};
    reg.ENDN.report = []; // Initialize report array

    // 1. Decode ENDN register (simple 32-bit value)
    defineField(reg.ENDN, regValue, 'ETV', 31, 0, 'Endianness Test Value'); // Endianness Test Value

    // 2. Generate human-readable register report
    if (regValue === 0x87654321) {
      reg.ENDN.report.push({
        severityLevel: sevC.info, // info
        msg: `ENDN: ${reg.ENDN.name_long} (0x${reg.ENDN.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[ETV] Endianness Test Value = 0x${regValue.toString(16).toUpperCase().padStart(8, '0')} (Correct)`
      });
    } else {
      reg.ENDN.report.push({
        severityLevel: sevC.error, // error
        msg: `ENDN: ${reg.ENDN.name_long} (0x${reg.ENDN.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[ETV] Endianness Test Value = 0x${regValue.toString(16).toUpperCase().padStart(8, '0')} (Expected: 0x87654321)`
      });
    }
  }

  // === PREL: PRT Release Identification Register =========================
  if ('PREL' in reg && reg.PREL.int32 !== undefined) {
    const regValue = reg.PREL.int32;

    // 0. Extend existing register structure
    reg.PREL.fields = {};
    reg.PREL.report = []; // Initialize report array

    // 1. Decode all individual bits of PREL register
    defineField(reg.PREL, regValue, 'REL',     31, 28, 'Release');
    defineField(reg.PREL, regValue, 'STEP',    27, 24, 'Step');
    defineField(reg.PREL, regValue, 'SUBSTEP', 23, 20, 'Substep');
    defineField(reg.PREL, regValue, 'YEAR',    19, 16, 'Year');
    defineField(reg.PREL, regValue, 'MON',     15,  8, 'Month');
    defineField(reg.PREL, regValue, 'DAY',      7,  0, 'Day');

    const f = reg.PREL.fields;

    // 2. Generate human-readable register report
    reg.PREL.report.push({
      severityLevel: sevC.info, // info
      msg: `PREL: ${reg.PREL.name_long} (0x${reg.PREL.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.REL.name_short.padEnd(7)}] ${f.REL.name_long.padEnd(8)} = 0x${f.REL.value.toString(16).toUpperCase()}\n` +
           `[${f.STEP.name_short.padEnd(7)}] ${f.STEP.name_long.padEnd(8)} = 0x${f.STEP.value.toString(16).toUpperCase()}\n` +
           `[${f.SUBSTEP.name_short.padEnd(7)}] ${f.SUBSTEP.name_long.padEnd(8)} = 0x${f.SUBSTEP.value.toString(16).toUpperCase()}\n` +
           `[${f.YEAR.name_short.padEnd(7)}] ${f.YEAR.name_long.padEnd(8)} = 0x${f.YEAR.value.toString(16).toUpperCase()}\n` +
           `[${f.MON.name_short.padEnd(7)}] ${f.MON.name_long.padEnd(8)} = 0x${f.MON.value.toString(16).toUpperCase().padStart(2, '0')}\n` +
           `[${f.DAY.name_short.padEnd(7)}] ${f.DAY.name_long.padEnd(8)} = 0x${f.DAY.value.toString(16).toUpperCase().padStart(2, '0')}`
    });

    // Generate Version Report
    reg.PREL.report.push({
      severityLevel: sevC.infoBold,
      msg: `PREL: PRT V${f.REL.value.toString(16).toUpperCase()}.${f.STEP.value.toString(16).toUpperCase()}.${f.SUBSTEP.value.toString(16).toUpperCase()}, Date ${f.DAY.value.toString(16).toUpperCase().padStart(2, '0')}.${f.MON.value.toString(16).toUpperCase().padStart(2, '0')}.202${f.YEAR.value.toString(16).toUpperCase()}`
    });
  }

  // === STAT: PRT Status Register =========================================
  if ('STAT' in reg && reg.STAT.int32 !== undefined) {
    const regValue = reg.STAT.int32;

    // 0. Extend existing register structure
    reg.STAT.fields = {};
    reg.STAT.report = []; // Initialize report array

    // 1. Decode all individual bits of STAT register
    defineField(reg.STAT, regValue, 'TEC',  31, 24, 'TX Error Counter');
    defineField(reg.STAT, regValue, 'RP',   23, 23, 'RX Error Counter Carry Flag');
    defineField(reg.STAT, regValue, 'REC',  22, 16, 'RX Error Counter');
    defineField(reg.STAT, regValue, 'TDCV', 15,  8, 'TDC Value (=TLD+SSP_offset)');
    defineField(reg.STAT, regValue, 'BO',    7,  7, 'Bus-Off State');
    defineField(reg.STAT, regValue, 'EP',    6,  6, 'Error Passive State');
    defineField(reg.STAT, regValue, 'FIMA',  5,  5, 'Fault Injection Module Active');
    defineField(reg.STAT, regValue, 'CLKA',  4,  4, 'Clock Active');
    defineField(reg.STAT, regValue, 'STP',   3,  3, 'Stop Request by user');
    defineField(reg.STAT, regValue, 'INT',   2,  2, 'Integrating');
    defineField(reg.STAT, regValue, 'ACT',   1,  0, 'Activity');

    const f = reg.STAT.fields;

    // 2. Generate human-readable register report
    reg.STAT.report.push({
      severityLevel: sevC.info, // info
      msg: `STAT: ${reg.STAT.name_long} (0x${reg.STAT.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TEC.name_short.padEnd(4)}] ${f.TEC.name_long.padEnd(29)} = ${f.TEC.value}\n` +
           `[${f.RP.name_short.padEnd(4)}] ${f.RP.name_long.padEnd(29)} = ${f.RP.value}\n` +
           `[${f.REC.name_short.padEnd(4)}] ${f.REC.name_long.padEnd(29)} = ${f.REC.value}\n` +
           `[${f.TDCV.name_short.padEnd(4)}] ${f.TDCV.name_long.padEnd(29)} = ${f.TDCV.value} cycles = ${f.TDCV.value * reg.general.clk_period} ns\n` +
           `[${f.BO.name_short.padEnd(4)}] ${f.BO.name_long.padEnd(29)} = ${f.BO.value}\n` +
           `[${f.EP.name_short.padEnd(4)}] ${f.EP.name_long.padEnd(29)} = ${f.EP.value}\n` +
           `[${f.FIMA.name_short.padEnd(4)}] ${f.FIMA.name_long.padEnd(29)} = ${f.FIMA.value}\n` +
           `[${f.CLKA.name_short.padEnd(4)}] ${f.CLKA.name_long.padEnd(29)} = ${f.CLKA.value}\n` +
           `[${f.STP.name_short.padEnd(4)}] ${f.STP.name_long.padEnd(29)} = ${f.STP.value}\n` +
           `[${f.INT.name_short.padEnd(4)}] ${f.INT.name_long.padEnd(29)} = ${f.INT.value}\n` +
           `[${f.ACT.name_short.padEnd(4)}] ${f.ACT.name_long.padEnd(29)} = ${f.ACT.value} (0: inactive, 1: idle, 2: receiver, 3: transmitter))`
    });

    // 3. Add status-specific warnings/errors
    if (f.BO.value === 1) {
      reg.STAT.report.push({
        severityLevel: sevC.warning, // warning
        msg: `CAN controller is in Bus-Off state`
      });
    }
    if (f.EP.value === 1) {
      reg.STAT.report.push({
        severityLevel: sevC.warning, // warning
        msg: `CAN controller is in Error Passive state`
      });
    }
    if (f.TEC.value > 0) {
      reg.STAT.report.push({
        severityLevel: sevC.warning,
        msg: `Transmit Error Counter (${f.TEC.value}) > 0: Transmit Errors seen recently.`
      });
    }
    if (f.REC.value > 0) {
      reg.STAT.report.push({
        severityLevel: sevC.warning,
        msg: `Receive Error Counter (${f.REC.value}) > 0. Receive Errors seen recently.`
      });
    }
    if (f.RP.value === 1) {
      reg.STAT.report.push({
        severityLevel: sevC.warning,
        msg: `Receive Error Passive flag is set. CAN controller is in error passive state for receive.`
      });
    }
  }

  // === EVNT: Event Status Flags Register ================================
  if ('EVNT' in reg && reg.EVNT.int32 !== undefined) {
    const regValue = reg.EVNT.int32;

    // 0. Extend existing register structure
    reg.EVNT.fields = {};
    reg.EVNT.report = []; // Initialize report array

    // 1. Decode all individual bits of EVNT register (MSB -> LSB)
    defineField(reg.EVNT, regValue, 'ABO', 13, 13, 'TX stopped by user (MH/PRT TX IF)');
    defineField(reg.EVNT, regValue, 'IFR', 12, 12, 'Invalid Frame Format (TX message)');
    defineField(reg.EVNT, regValue, 'USO', 11, 11, 'Unexpected Seq Start (MH/PRT TX IF)');
    defineField(reg.EVNT, regValue, 'DU',  10, 10, 'Data Underrun (MH/PRT TX IF)');
    defineField(reg.EVNT, regValue, 'PXE',  9,  9, 'Protocol Exception Event');
    defineField(reg.EVNT, regValue, 'TXF',  8,  8, 'TX Frame successfully');
    defineField(reg.EVNT, regValue, 'RXF',  7,  7, 'RX Frame successfully');
    defineField(reg.EVNT, regValue, 'DO',   6,  6, 'Data Overflow (MH/PRT RX IF)');
    defineField(reg.EVNT, regValue, 'STE',  5,  5, 'Stuff Error');
    defineField(reg.EVNT, regValue, 'FRE',  4,  4, 'Form Error');
    defineField(reg.EVNT, regValue, 'AKE',  3,  3, 'Acknowledge Error');
    defineField(reg.EVNT, regValue, 'B1E',  2,  2, 'Bit1 Error');
    defineField(reg.EVNT, regValue, 'B0E',  1,  1, 'Bit0 Error');
    defineField(reg.EVNT, regValue, 'CRE',  0,  0, 'CRC Error');

    const f = reg.EVNT.fields;

    // 2. Generate human-readable register report (MSB -> LSB)
    reg.EVNT.report.push({
      severityLevel: sevC.info,
      msg: `EVNT: ${reg.EVNT.name_long} (0x${reg.EVNT.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.ABO.name_short.padEnd(3)}] ${f.ABO.name_long.padEnd(35)} = ${f.ABO.value}\n` +
           `[${f.IFR.name_short.padEnd(3)}] ${f.IFR.name_long.padEnd(35)} = ${f.IFR.value}\n` +
           `[${f.USO.name_short.padEnd(3)}] ${f.USO.name_long.padEnd(35)} = ${f.USO.value}\n` +
           `[${f.DU.name_short.padEnd(3)}] ${f.DU.name_long.padEnd(35)} = ${f.DU.value}\n` +
           `[${f.PXE.name_short.padEnd(3)}] ${f.PXE.name_long.padEnd(35)} = ${f.PXE.value}\n` +
           `[${f.TXF.name_short.padEnd(3)}] ${f.TXF.name_long.padEnd(35)} = ${f.TXF.value}\n` +
           `[${f.RXF.name_short.padEnd(3)}] ${f.RXF.name_long.padEnd(35)} = ${f.RXF.value}\n` +
           `[${f.DO.name_short.padEnd(3)}] ${f.DO.name_long.padEnd(35)} = ${f.DO.value}\n` +
           `[${f.STE.name_short.padEnd(3)}] ${f.STE.name_long.padEnd(35)} = ${f.STE.value}\n` +
           `[${f.FRE.name_short.padEnd(3)}] ${f.FRE.name_long.padEnd(35)} = ${f.FRE.value}\n` +
           `[${f.AKE.name_short.padEnd(3)}] ${f.AKE.name_long.padEnd(35)} = ${f.AKE.value}\n` +
           `[${f.B1E.name_short.padEnd(3)}] ${f.B1E.name_long.padEnd(35)} = ${f.B1E.value}\n` +
           `[${f.B0E.name_short.padEnd(3)}] ${f.B0E.name_long.padEnd(35)} = ${f.B0E.value}\n` +
           `[${f.CRE.name_short.padEnd(3)}] ${f.CRE.name_long.padEnd(35)} = ${f.CRE.value}`
    });

    // 3. Additional summary/reporting
  } // EVNT

  // === LOCK: Unlock Sequence Register ==================================
  if ('LOCK' in reg && reg.LOCK.int32 !== undefined) {
    const regValue = reg.LOCK.int32;

    // 0. Extend existing register structure
    reg.LOCK.fields = {};
    reg.LOCK.report = []; // Initialize report array

    // 1. Decode all individual bits of LOCK register (MSB -> LSB)
    defineField(reg.LOCK, regValue, 'TMK', 31, 16, 'Test Mode Key');
    defineField(reg.LOCK, regValue, 'ULK', 15,  0, 'Unlock Key');

    const f = reg.LOCK.fields;

    // 2. Generate human-readable register report (MSB -> LSB)
    reg.LOCK.report.push({
      severityLevel: sevC.info,
      msg: `LOCK (PRT): ${reg.LOCK.name_long} (0x${reg.LOCK.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TMK.name_short.padEnd(3)}] ${f.TMK.name_long.padEnd(13)} = 0x${f.TMK.value.toString(16).toUpperCase().padStart(4, '0')}\n` +
           `[${f.ULK.name_short.padEnd(3)}] ${f.ULK.name_long.padEnd(13)} = 0x${f.ULK.value.toString(16).toUpperCase().padStart(4, '0')}`
    });

    // 3. Additional checks/warnings
    if (regValue !== 0) {
      reg.LOCK.report.push({
        severityLevel: sevC.warning,
        msg: `LOCK: Read value is not 0x00000000. Spec states read returns 0.`
      });
    }
  }

  // === CTRL: Control Register ==========================================
  if ('CTRL' in reg && reg.CTRL.int32 !== undefined) {
    const regValue = reg.CTRL.int32;

    // 0. Extend existing register structure
    reg.CTRL.fields = {};
    reg.CTRL.report = []; // Initialize report array

    // 1. Decode all individual bits of CTRL register (MSB -> LSB)
    defineField(reg.CTRL, regValue, 'TEST', 12, 12, 'Enable Test Mode Command');
    defineField(reg.CTRL, regValue, 'SRES',  8,  8, 'Software Reset Command');
    defineField(reg.CTRL, regValue, 'STRT',  4,  4, 'Start Command');
    defineField(reg.CTRL, regValue, 'IMMD',  1,  1, 'Stop Immediate Command');
    defineField(reg.CTRL, regValue, 'STOP',  0,  0, 'Stop Command');

    const f = reg.CTRL.fields;

    // 2. Generate human-readable register report (MSB -> LSB)
    reg.CTRL.report.push({
      severityLevel: sevC.info,
      msg: `CTRL: ${reg.CTRL.name_long} (0x${reg.CTRL.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')}) a write-only register\n` +
           `[${f.TEST.name_short.padEnd(4)}] ${f.TEST.name_long.padEnd(24)} = ${f.TEST.value}\n` +
           `[${f.SRES.name_short.padEnd(4)}] ${f.SRES.name_long.padEnd(24)} = ${f.SRES.value}\n` +
           `[${f.STRT.name_short.padEnd(4)}] ${f.STRT.name_long.padEnd(24)} = ${f.STRT.value}\n` +
           `[${f.IMMD.name_short.padEnd(4)}] ${f.IMMD.name_long.padEnd(24)} = ${f.IMMD.value}\n` +
           `[${f.STOP.name_short.padEnd(4)}] ${f.STOP.name_long.padEnd(24)} = ${f.STOP.value}`
    });

    // 3. Additional checks/warnings
    if (regValue !== 0) {
      reg.CTRL.report.push({
        severityLevel: sevC.warning,
        msg: `CTRL: Read value is not 0x00000000. Spec states read returns 0.`
      });
    }
  }

  // === FIMC: Fault Injection Module Control Register ====================
  if ('FIMC' in reg && reg.FIMC.int32 !== undefined) {
    const regValue = reg.FIMC.int32;

    // 0. Extend existing register structure
    reg.FIMC.fields = {};
    reg.FIMC.report = []; // Initialize report array

    // 1. Decode all individual bits of FIMC register (MSB -> LSB of defined fields)
    defineField(reg.FIMC, regValue, 'FIP', 14, 0, 'Fault Injection Bit Position');

    const f = reg.FIMC.fields;

    // 2. Generate human-readable register report (MSB -> LSB)
    reg.FIMC.report.push({
      severityLevel: sevC.info,
      msg: `FIMC: ${reg.FIMC.name_long} (0x${reg.FIMC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.FIP.name_short.padEnd(3)}] ${f.FIP.name_long.padEnd(28)} = ${f.FIP.value}`
    });
  }

  // === TEST: Hardware Test Functions Register ===========================
  if ('TEST' in reg && reg.TEST.int32 !== undefined) {
    const regValue = reg.TEST.int32;

    // 0. Extend existing register structure
    reg.TEST.fields = {};
    reg.TEST.report = []; // Initialize report array

    // 1. Decode all individual bits of TEST register (MSB -> LSB)
    defineField(reg.TEST, regValue, 'BUS_OFF',   27, 27, 'Trigger IR BUS_OFF');
    defineField(reg.TEST, regValue, 'BUS_ON',    26, 26, 'Trigger IR BUS_ON');
    defineField(reg.TEST, regValue, 'E_PASSIVE', 25, 25, 'Trigger IR E_PASSIV');
    defineField(reg.TEST, regValue, 'E_ACTIVE',  24, 24, 'Trigger IR E_ACTIVE');
    defineField(reg.TEST, regValue, 'BUS_ERR',   23, 23, 'Trigger IR BUS_ERR');
    defineField(reg.TEST, regValue, 'RX_EVT',    22, 22, 'Trigger IR RX_EVT');
    defineField(reg.TEST, regValue, 'TX_EVT',    21, 21, 'Trigger IR TX_EVT');
    defineField(reg.TEST, regValue, 'IFF_RQ',    20, 20, 'Trigger IR IFF_RQ');
    defineField(reg.TEST, regValue, 'RX_DO',     19, 19, 'Trigger IR RX_DO');
    defineField(reg.TEST, regValue, 'TX_DU',     18, 18, 'Trigger IR TX_DU');
    defineField(reg.TEST, regValue, 'USOS',      17, 17, 'Trigger IR USOS');
    defineField(reg.TEST, regValue, 'ABORTED',   16, 16, 'Trigger IR ABORTED');
    defineField(reg.TEST, regValue, 'HWT',       15, 15, 'Hardware Test Mode');
    defineField(reg.TEST, regValue, 'TXC',        5,  4, 'TX Signal Control');
    defineField(reg.TEST, regValue, 'RXD',        3,  3, 'RX Signal value');
    defineField(reg.TEST, regValue, 'LBCK',       0,  0, 'Loop-back mode');

    const f = reg.TEST.fields;

    // 2. Generate human-readable register report (MSB -> LSB)
    const txdMap = ['Normal', 'Normal (RX ignored)', 'TX forced 0', 'TX forced 1'];
    reg.TEST.report.push({
      severityLevel: sevC.info,
      msg: `TEST: ${reg.TEST.name_long} (0x${reg.TEST.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.BUS_OFF.name_short.padEnd(8).slice(0, 8)}] ${f.BUS_OFF.name_long.padEnd(19)} = ${f.BUS_OFF.value}\n` +
           `[${f.BUS_ON.name_short.padEnd(8).slice(0, 8)}] ${f.BUS_ON.name_long.padEnd(19)} = ${f.BUS_ON.value}\n` +
           `[${f.E_PASSIVE.name_short.padEnd(8).slice(0, 8)}] ${f.E_PASSIVE.name_long.padEnd(19)} = ${f.E_PASSIVE.value}\n` +
           `[${f.E_ACTIVE.name_short.padEnd(8).slice(0, 8)}] ${f.E_ACTIVE.name_long.padEnd(19)} = ${f.E_ACTIVE.value}\n` +
           `[${f.BUS_ERR.name_short.padEnd(8).slice(0, 8)}] ${f.BUS_ERR.name_long.padEnd(19)} = ${f.BUS_ERR.value}\n` +
           `[${f.RX_EVT.name_short.padEnd(8).slice(0, 8)}] ${f.RX_EVT.name_long.padEnd(19)} = ${f.RX_EVT.value}\n` +
           `[${f.TX_EVT.name_short.padEnd(8).slice(0, 8)}] ${f.TX_EVT.name_long.padEnd(19)} = ${f.TX_EVT.value}\n` +
           `[${f.IFF_RQ.name_short.padEnd(8).slice(0, 8)}] ${f.IFF_RQ.name_long.padEnd(19)} = ${f.IFF_RQ.value}\n` +
           `[${f.RX_DO.name_short.padEnd(8).slice(0, 8)}] ${f.RX_DO.name_long.padEnd(19)} = ${f.RX_DO.value}\n` +
           `[${f.TX_DU.name_short.padEnd(8).slice(0, 8)}] ${f.TX_DU.name_long.padEnd(19)} = ${f.TX_DU.value}\n` +
           `[${f.USOS.name_short.padEnd(8).slice(0, 8)}] ${f.USOS.name_long.padEnd(19)} = ${f.USOS.value}\n` +
           `[${f.ABORTED.name_short.padEnd(8).slice(0, 8)}] ${f.ABORTED.name_long.padEnd(19)} = ${f.ABORTED.value}\n` +
           `[${f.HWT.name_short.padEnd(8).slice(0, 8)}] ${f.HWT.name_long.padEnd(19)} = ${f.HWT.value}\n` +
           `[${f.TXC.name_short.padEnd(8).slice(0, 8)}] ${f.TXC.name_long.padEnd(19)} = ${f.TXC.value} (0: normal, 1: normal for loopback (RX ignored), 2: output=0, 3: output=1)\n` +
           `[${f.RXD.name_short.padEnd(8).slice(0, 8)}] ${f.RXD.name_long.padEnd(19)} = ${f.RXD.value}\n` +
           `[${f.LBCK.name_short.padEnd(8).slice(0, 8)}] ${f.LBCK.name_long.padEnd(19)} = ${f.LBCK.value}`
    });

    // 3. Additional checks/warnings
    if (f.LBCK.value === 1) {
      if (f.TXC.value === 0) {
        reg.TEST.report.push({
          severityLevel: sevC.error,
          msg: `TEST: Loop-back mode enabled (LBCK = ${f.LBCK.value}) but TXC = ${f.TXC.value}. Loop-back configuration is not functional.\n` +
               `In Loop-back mode TXC must be set to\n` +
               `TXC=1: external loop-back (TX shows frame, RX ignored)\n` +
               `TXC=3: internal loop-back (TX forced 1).`
        });
      } else if (f.TXC.value === 1) { // External Loop-back
        reg.TEST.report.push({
          severityLevel: sevC.warning,
          msg: `TEST: External Loop-back mode enabled (LBCK = ${f.LBCK.value} and TXC = ${f.TXC.value}). TX shows frame, RX ignored.`
        });
      } else if (f.TXC.value === 2) {
        reg.TEST.report.push({
          severityLevel: sevC.warning,
          msg: `TEST: Internal Loop-back mode enabled (LBCK = ${f.LBCK.value} and TXC = ${f.TXC.value}). ATTENTION: TX forced 0, RX ignored.`
        });
      } else if (f.TXC.value === 3) {
        reg.TEST.report.push({
          severityLevel: sevC.warning,
          msg: `TEST: Internal Loop-back mode enabled (LBCK = ${f.LBCK.value} and TXC = ${f.TXC.value}). TX forced 1, RX ignored.`
        });
      }
    } // if

  } // TEST

} // PRT others