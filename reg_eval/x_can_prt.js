// X_CAN: PRT register decoding
import { getBits } from './help_functions.js';
import { sevC } from './help_functions.js';

// ==================================================================================
// Process Nominal Bit Timing Register: Extract parameters, validate ranges, calculate results, generate report
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

  // Rule: only assign reg.general.* values if they get meaningful values
  //       leave values undefined, if a) according registers are not present
  //                                  b) configuration disables a feature (e.g. TMS=OFF => then do not provide PWM settings & results)

  // === MODE: Extract parameters from register ==========================
  if ('MODE' in reg && reg.MODE.int32 !== undefined) {
    const regValue = reg.MODE.int32;

    // 0. Extend existing register structure
    reg.MODE.fields = {};
    reg.MODE.report = []; // Initialize report array

    // 1. Decode all individual bits of MODE register
    reg.MODE.fields.TSSE = getBits(regValue, 13, 13);  // Transceiver Sharing Switch Enable
    reg.MODE.fields.LCHB = getBits(regValue, 12, 12);  // Light Commander High Bit Rate
    reg.MODE.fields.FIME = getBits(regValue, 11, 11);  // Fault Injection Module Enable
    reg.MODE.fields.EFDI = getBits(regValue, 10, 10);  // Error Flag/Frame Dissable
    reg.MODE.fields.XLTR = getBits(regValue, 9, 9);    // TMS Enable (XL Transceiver present)
    reg.MODE.fields.SFS  = getBits(regValue, 8, 8);    // Time Stamp Position: Start of Frame (1), End of Frame (0)
    reg.MODE.fields.RSTR = getBits(regValue, 7, 7);    // Restircted Mode Enable
    reg.MODE.fields.MON  = getBits(regValue, 6, 6);    // (Bus) Monitoring Mode Enable
    reg.MODE.fields.TXP  = getBits(regValue, 5, 5);    // TX Pause
    reg.MODE.fields.EFBI = getBits(regValue, 4, 4);    // Edge Filtering during Bus Integration
    reg.MODE.fields.PXHD = getBits(regValue, 3, 3);    // Protocol Exception Handling Disable
    reg.MODE.fields.TDCE = getBits(regValue, 2, 2);    // TDC: Transmitter Delay Compensation Enable
    reg.MODE.fields.XLOE = getBits(regValue, 1, 1);    // XL Operation Enable
    reg.MODE.fields.FDOE = getBits(regValue, 0, 0);    // FD Operation Enable
    
    // 2. Store MODE-related bit timing settings in general structure
    reg.general.bt_global.set.tms = (reg.MODE.fields.XLTR === 1);
    reg.general.bt_global.set.tdc = (reg.MODE.fields.TDCE === 1);
    reg.general.bt_global.set.es  = (reg.MODE.fields.EFDI === 0); // Error Signaling Enable when EFDI=0
    reg.general.bt_global.set.fd  = (reg.MODE.fields.FDOE === 1 && reg.general.bt_global.set.es === true && reg.general.bt_global.set.tms === false); // FD Operation Enable when FDOE=1
    reg.general.bt_global.set.xl  = (reg.MODE.fields.XLOE === 1); // XL Operation Enable when XLOE=1

    // 3. Generate human-readable register report
  reg.MODE.report.push({
    severityLevel: sevC.Info, // info
        msg: `MODE: ${reg.MODE.name_long} (0x${reg.MODE.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[TSSE] Transceiver Sharing Switch Enable            = ${reg.MODE.fields.TSSE}\n` +
             `[LCHB] FD Light Commander High Bit Rate Mode Enable = ${reg.MODE.fields.LCHB}\n` +
             `[FIME] Fault Injection Module Enable                = ${reg.MODE.fields.FIME}\n` +
             `[EFDI] Error Flag/Frame Disable                     = ${reg.MODE.fields.EFDI}\n` +
             `[XLTR] Transceiver Mode Switching (TMS) Enable      = ${reg.MODE.fields.XLTR}\n` +
             `[SFS ] Time Stamp Position: SOF(1), EOF(0)          = ${reg.MODE.fields.SFS}\n` +
             `[RSTR] Restricted Mode Enable                       = ${reg.MODE.fields.RSTR}\n` +
             `[MON ] (Bus) Monitoring Mode Enable                 = ${reg.MODE.fields.MON}\n` +
             `[TXP ] TX Pause                                     = ${reg.MODE.fields.TXP}\n` +
             `[EFBI] Edge Filtering during Bus Integration        = ${reg.MODE.fields.EFBI}\n` +
             `[PXHD] Protocol Exception Handling Disable          = ${reg.MODE.fields.PXHD}\n` +
             `[TDCE] Transmitter Delay Compensation (TDC) Enable  = ${reg.MODE.fields.TDCE}\n` +
             `[XLOE] XL Operation Enable                          = ${reg.MODE.fields.XLOE}\n` +
             `[FDOE] FD Operation Enable                          = ${reg.MODE.fields.FDOE}`
    });

    // Check: FDOE is set when XLOE is also set
    if (reg.MODE.fields.FDOE === 0 && reg.MODE.fields.XLOE === 1) {
      reg.MODE.report.push({
        severityLevel: sevC.Error, // error
        msg: `MODE: FDOE (${reg.MODE.fields.FDOE}) is not set when XLOE (${reg.MODE.fields.XLOE}) is set. FDOE must be set to 1 when XLOE is set to 1.`
      });
    }

    // Check: TMS=1 while ES=0
    if (reg.MODE.fields.XLTR === 1 && reg.MODE.fields.EFDI === 0) {
      reg.MODE.report.push({
        severityLevel: sevC.Error, // error
        msg: `MODE: TMS=ON while ES=OFF. This is not supported by X_CAN. XLTR (${reg.MODE.fields.XLTR}), EFDI (${reg.MODE.fields.EFDI})`
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
    reg.NBTP.fields.BRP    = getBits(regValue, 29, 25) + 1;  // Bit Rate Prescaler
    reg.NBTP.fields.NTSEG1 = getBits(regValue, 24, 16) + 1;  // Nominal Time Segment 1
    reg.NBTP.fields.NTSEG2 = getBits(regValue, 14, 8) + 1;   // Nominal Time Segment 2
    reg.NBTP.fields.NSJW   = getBits(regValue, 6, 0) + 1;    // Nominal Synchronization Jump Width

    // 2. Store NBTP bit timing settings in general structure
    reg.general.bt_arb.set.brp = reg.NBTP.fields.BRP;
    reg.general.bt_arb.set.prop_and_phaseseg1 = reg.NBTP.fields.NTSEG1;
    reg.general.bt_arb.set.phaseseg2 = reg.NBTP.fields.NTSEG2;
    reg.general.bt_arb.set.sjw = reg.NBTP.fields.NSJW;

    // 3. Generate human-readable register report
  reg.NBTP.report.push({
    severityLevel: sevC.Info, // info
        msg: `NBTP: ${reg.NBTP.name_long} (0x${reg.NBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[BRP   ] Bit Rate Prescaler     = ${reg.NBTP.fields.BRP}\n` +
             `[NTSEG1] Nominal Time Segment 1 = ${reg.NBTP.fields.NTSEG1}\n` +
             `[NTSEG2] Nominal Time Segment 2 = ${reg.NBTP.fields.NTSEG2}\n` +
             `[NSJW  ] Nominal SJW            = ${reg.NBTP.fields.NSJW}`
    });

    // 4. Calculate arbitration phase results and store in general structure
    reg.general.bt_arb.res.tq_len = reg.general.clk_period * reg.general.bt_arb.set.brp;
    reg.general.bt_arb.res.tq_per_bit = 1 + reg.general.bt_arb.set.prop_and_phaseseg1 + reg.general.bt_arb.set.phaseseg2;
    reg.general.bt_arb.res.bitrate = reg.general.clk_freq / (reg.general.bt_arb.set.brp * reg.general.bt_arb.res.tq_per_bit);
    reg.general.bt_arb.res.bit_length = 1000 / reg.general.bt_arb.res.bitrate;
    reg.general.bt_arb.res.sp = 100 - 100 * reg.general.bt_arb.set.phaseseg2 / reg.general.bt_arb.res.tq_per_bit;
    
    // 5. Generate Report about settings
  reg.NBTP.report.push({
    severityLevel: sevC.InfoCalc, // infoCalculated
        msg: `Nominal Bitrate (Arbitration Phase)\n` +
             `Bitrate    = ${reg.general.bt_arb.res.bitrate} Mbit/s\n` +
             `Bit Length = ${reg.general.bt_arb.res.bit_length} ns\n` +
             `TQ per Bit = ${reg.general.bt_arb.res.tq_per_bit}\n` +
             `SP         = ${reg.general.bt_arb.res.sp} %`
    });

    // Check: check for SJW <= min(PhaseSeg1, PhaseSeg2)?
    if (reg.general.bt_arb.set.sjw > reg.general.bt_arb.set.phaseseg2) {
      reg.NBTP.report.push({
        severityLevel: sevC.Error, // error
        msg: `NBTP: SJW (${reg.general.bt_arb.set.sjw}) > PhaseSeg2 (${reg.general.bt_arb.set.phaseseg2}). ISO 11898-1 requires SJW <= PhaseSeg2.`
      });
    }

    // Check: check for PhaseSeg2 >= 2
    if (reg.general.bt_arb.set.phaseseg2 < 2) {
      reg.NBTP.report.push({
        severityLevel: sevC.Error, // error
        msg: `NBTP: PhaseSeg2 (${reg.general.bt_arb.set.phaseseg2}) < 2. ISO 11898-1 requires a value >= 2.`
      });
    }

    // Check: SJW choosen as large as possible?
    if (reg.general.bt_arb.set.sjw < reg.general.bt_arb.set.phaseseg2) {
      reg.NBTP.report.push({
        severityLevel: sevC.Warn, // warning
        msg: `NBTP: SJW (${reg.general.bt_arb.set.sjw}) < PhaseSeg2 (${reg.general.bt_arb.set.phaseseg2}). It is recommended to use SJW=PhaseSeg2.`
      });
    }

    // Check: Number of TQ large enough?
    if (reg.general.bt_arb.res.tq_per_bit < 8) {
      reg.NBTP.report.push({
        severityLevel: sevC.Warn, // warning
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
    reg.DBTP.fields.DTDCO  = getBits(regValue, 31, 24);      // CAN FD Transmitter Delay Compensation Offset
    reg.DBTP.fields.DTSEG1 = getBits(regValue, 23, 16) + 1;  // CAN FD Data Time Segment 1
    reg.DBTP.fields.DTSEG2 = getBits(regValue, 14, 8) + 1;   // CAN FD Data Time Segment 2
    reg.DBTP.fields.DSJW   = getBits(regValue, 6, 0) + 1;    // CAN FD Data Synchronization Jump Width
    // TODO: move storage of global parameters into area after check "FD enabled"
    // 2. Store DBTP bit timing settings in general structure
    reg.general.bt_fddata.set.ssp_offset = reg.DBTP.fields.DTDCO;
    reg.general.bt_fddata.set.prop_and_phaseseg1 = reg.DBTP.fields.DTSEG1;
    reg.general.bt_fddata.set.phaseseg2 = reg.DBTP.fields.DTSEG2;
    reg.general.bt_fddata.set.sjw = reg.DBTP.fields.DSJW;
    // set brp (as a copy of arb)
    reg.general.bt_fddata.set.brp = reg.general.bt_arb.set.brp !== undefined ? reg.general.bt_arb.set.brp : 0; // X_CAN uses same BRP as in arbitration phase

    // different output based on FD enabled yes/no
    if (reg.general.bt_global.set.fd !== undefined && reg.general.bt_global.set.fd === false) {
      // 3. Generate human-readable register report
      reg.DBTP.report.push({
        severityLevel: sevC.Warn, // warning
        msg: `DBTP: ${reg.DBTP.name_long} (0x${reg.DBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `FD Operation is disabled: a) MODE.FDOE=0 OR b) TMS=ON or ES=OFF OR c) MODE register not present in register dump`
      });

    } else { // FD enabled (or MODE register not present)
      // 3. Generate human-readable register report
      reg.DBTP.report.push({
        severityLevel: sevC.Info, // info
          msg: `DBTP: ${reg.DBTP.name_long} (0x${reg.DBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
               `[DTDCO ] FD TDC Offset     = ${reg.DBTP.fields.DTDCO}\n` +
               `[DTSEG1] FD Time Segment 1 = ${reg.DBTP.fields.DTSEG1}\n` +
               `[DTSEG2] FD Time Segment 2 = ${reg.DBTP.fields.DTSEG2}\n` +
               `[DSJW  ] FD SJW            = ${reg.DBTP.fields.DSJW}`
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
      severityLevel: sevC.InfoCalc, // infoCalculated
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
          severityLevel: sevC.Warn, // warning
          msg: `CAN FD: Recommended CAN Clock Frequency is 20, 40, 80 MHz etc. (see CiA 601-3). Current value is ${reg.general.clk_freq} MHz.`
        });
      }

      // Check: check for SJW <= min(PhaseSeg1, PhaseSeg2)?
      if (reg.general.bt_fddata.set.sjw > reg.general.bt_fddata.set.phaseseg2) {
        reg.DBTP.report.push({
          severityLevel: sevC.Error, // error
          msg: `DBTP: SJW (${reg.general.bt_fddata.set.sjw}) > PhaseSeg2 (${reg.general.bt_fddata.set.phaseseg2}). ISO 11898-1 requires SJW <= PhaseSeg2.`
        });
      }

      // Check: check for PhaseSeg2 >= 2
      if (reg.general.bt_fddata.set.phaseseg2 < 2) {
        reg.DBTP.report.push({
          severityLevel: sevC.Error, // error
          msg: `DBTP: PhaseSeg2 (${reg.general.bt_fddata.set.phaseseg2}) < 2. ISO 11898-1 requires a value >= 2.`
        });
      }

      // Check: SJW choosen as large as possible?
      if (reg.general.bt_fddata.set.sjw < reg.general.bt_fddata.set.phaseseg2) {
        reg.DBTP.report.push({
          severityLevel: sevC.Warn, // warning
          msg: `DBTP: SJW (${reg.general.bt_fddata.set.sjw}) < PhaseSeg2 (${reg.general.bt_fddata.set.phaseseg2}). It is recommended to use SJW=PhaseSeg2.`
        });
      }

      // Check: Number of TQ large enough?
      if (reg.general.bt_fddata.res.tq_per_bit < 8) {
        reg.DBTP.report.push({
          severityLevel: sevC.Warn, // warning
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
    reg.XBTP.fields.XTDCO  = getBits(regValue, 31, 24);      // XL Transmitter Delay Compensation Offset
    reg.XBTP.fields.XTSEG1 = getBits(regValue, 23, 16) + 1;  // XL Time Segment 1
    reg.XBTP.fields.XTSEG2 = getBits(regValue, 14, 8) + 1;   // XL Time Segment 2
    reg.XBTP.fields.XSJW   = getBits(regValue, 6, 0) + 1;    // XL Synchronization Jump Width
    
    // 2. Store XBTP bit timing settings in general structure
    reg.general.bt_xldata.set.ssp_offset = reg.XBTP.fields.XTDCO;
    reg.general.bt_xldata.set.prop_and_phaseseg1 = reg.XBTP.fields.XTSEG1;
    reg.general.bt_xldata.set.phaseseg2 = reg.XBTP.fields.XTSEG2;
    reg.general.bt_xldata.set.sjw = reg.XBTP.fields.XSJW;
    // set brp (as a copy of arb)
    reg.general.bt_xldata.set.brp = reg.general.bt_arb.set.brp !== undefined ? reg.general.bt_arb.set.brp : 0; // X_CAN uses same BRP as in arbitration phase

    // different output based on XL enabled yes/no
    if (reg.general.bt_global.set.xl !== undefined && reg.general.bt_global.set.xl === false) {
      // 3. Generate human-readable register report
      reg.XBTP.report.push({
        severityLevel: sevC.Warn, // warning
        msg: `XBTP: ${reg.XBTP.name_long} (0x${reg.XBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `XL Operation is disabled (MODE.XLOE=0) OR MODE register not present`
      });

    } else { // XL enabled (or MODE register not present)
      // 3. Generate human-readable register report
    reg.XBTP.report.push({
      severityLevel: sevC.Info, // info
          msg: `XBTP: ${reg.XBTP.name_long} (0x${reg.XBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
               `[XTDCO ] XL TDC Offset     = ${reg.XBTP.fields.XTDCO}\n` +
               `[XTSEG1] XL Time Segment 1 = ${reg.XBTP.fields.XTSEG1}\n` +
               `[XTSEG2] XL Time Segment 2 = ${reg.XBTP.fields.XTSEG2}\n` +
               `[XSJW  ] XL SJW            = ${reg.XBTP.fields.XSJW}`
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
      severityLevel: sevC.InfoCalc, // infoCalculated
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
          severityLevel: sevC.Warn, // warning
          msg: `CAN XL: Recommended CAN Clock Frequency is 80 MHz or 160 MHz. Current value is ${reg.general.clk_freq} MHz.`
        });
      }

      // Check: check for SJW <= min(PhaseSeg1, PhaseSeg2)?
      if (reg.general.bt_xldata.set.sjw > reg.general.bt_xldata.set.phaseseg2) {
        reg.XBTP.report.push({
          severityLevel: sevC.Error, // error
          msg: `XBTP: SJW (${reg.general.bt_xldata.set.sjw}) > PhaseSeg2 (${reg.general.bt_xldata.set.phaseseg2}). ISO 11898-1 requires SJW <= PhaseSeg2.`
        });
      }

      // Check: check for PhaseSeg2 >= 2
      if (reg.general.bt_xldata.set.phaseseg2 < 2) {
        reg.XBTP.report.push({
          severityLevel: sevC.Error, // error
          msg: `XBTP: PhaseSeg2 (${reg.general.bt_xldata.set.phaseseg2}) < 2. ISO 11898-1 requires a value >= 2.`
        });
      }

      // Check: SJW choosen as large as possible?
      if (reg.general.bt_xldata.set.sjw < reg.general.bt_xldata.set.phaseseg2) {
        reg.XBTP.report.push({
          severityLevel: sevC.Warn, // warning
          msg: `XBTP: SJW (${reg.general.bt_xldata.set.sjw}) < PhaseSeg2 (${reg.general.bt_xldata.set.phaseseg2}). It is recommended to use SJW=PhaseSeg2.`
        });
      }

      // Check: Number of TQ large enough?
      if (reg.general.bt_fddata.res.tq_per_bit < 8) {
        reg.DBTP.report.push({
          severityLevel: sevC.Warn, // warning
          msg: `XBTP: Number of TQ/Bit is small. If possible, increase the TQ/Bit by reducing BRP or increasing the CAN Clock Freq.`
        });
      }

      // Ratio of Arb. Bit Time / XL Data Bit Time >= 2 ?
      if (!reg.MODE || !reg.MODE.fields || reg.MODE.fields.EFDI == 0) { // Error Signaling is enabled
        if (reg.general.bt_arb.res.tq_per_bit < (2 * reg.general.bt_xldata.res.tq_per_bit)) {
          reg.XBTP.report.push({
            severityLevel: sevC.Error, // error
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
    reg.PCFG.fields.PWMO = getBits(regValue, 21, 16);     // PWM Offset
    reg.PCFG.fields.PWML = getBits(regValue, 13, 8) + 1;  // PWM Long
    reg.PCFG.fields.PWMS = getBits(regValue, 5, 0) + 1;   // PWM Short

    // 2. Store PWM settings in XL data structure
    reg.general.bt_xldata.set.pwm_offset = reg.PCFG.fields.PWMO;
    reg.general.bt_xldata.set.pwm_long = reg.PCFG.fields.PWML;
    reg.general.bt_xldata.set.pwm_short = reg.PCFG.fields.PWMS;

    // different output based on XLOE & TMS
    if (!reg.MODE || !reg.MODE.fields || (reg.MODE.fields.XLOE !== undefined && reg.MODE.fields.XLOE == 0) || (reg.MODE.fields.XLTR !== undefined && reg.MODE.fields.XLTR == 0) || !reg.XBTP) {
      // 3. Generate human-readable register report
      reg.PCFG.report.push({
        severityLevel: sevC.Info, // info
        msg: `PCFG: ${reg.PCFG.name_long} (0x${reg.PCFG.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `XL Operation (MODE.XLOE=0) OR Transceiver Mode Switch (MODE.XLTR=0) is disabled OR MODE register not present`
      });

    } else { // MODE.XLTR == 1 && MODE.XLOE == 1
      // 3. Generate human-readable register report
      reg.PCFG.report.push({
        severityLevel: sevC.Info, // info
          msg: `PCFG: ${reg.PCFG.name_long} (0x${reg.PCFG.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
               `[PWMO] PWM Offset      = ${reg.PCFG.fields.PWMO}\n` +
               `[PWML] PWM Phase Long  = ${reg.PCFG.fields.PWML}\n` +
               `[PWMS] PWM Phase Short = ${reg.PCFG.fields.PWMS}`
      });

      // 4. Calculate PWM results and store in XL data structure
      reg.general.bt_xldata.res.pwm_symbol_len_ns = (reg.general.bt_xldata.set.pwm_short + reg.general.bt_xldata.set.pwm_long) * reg.general.clk_period;
      reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles = (reg.general.bt_xldata.set.pwm_short + reg.general.bt_xldata.set.pwm_long);
      reg.general.bt_xldata.res.pwm_symbols_per_bit_time = (reg.general.bt_xldata.res.tq_per_bit * reg.general.bt_arb.set.brp) / reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles;
      
      // 5. Generate Report about settings
      reg.PCFG.report.push({
        severityLevel: sevC.InfoCalc, // infoCalculated
          msg: `PWM Configuration\nPWM Symbol Length = ${reg.general.bt_xldata.res.pwm_symbol_len_ns} ns = ${reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles} clock cycles\nPWM Symbols per XL Data Bit Time = ${reg.general.bt_xldata.res.pwm_symbols_per_bit_time.toFixed(2)}`
      });

      // Ratio of XL Data Bit Time to PWM Symbol Length
      if (!Number.isInteger(reg.general.bt_xldata.res.pwm_symbols_per_bit_time)) {
        reg.PCFG.report.push({
          severityLevel: sevC.Error, // error
          msg: `Length of XL Data Bit Time is not an integer multiple of PWM Symbol Length. tBit/tPWM=${reg.general.bt_xldata.res.pwm_symbols_per_bit_time.toFixed(2)}`
        });
      }

      // PWM Offset correctness
      const pwmo_calculated = (reg.general.bt_arb.res.tq_per_bit * reg.general.bt_arb.set.brp) % reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles;
      if (pwmo_calculated !== reg.general.bt_xldata.set.pwm_offset) {
        reg.PCFG.report.push({
          severityLevel: sevC.Error, // error
          msg: `PWM Offset (PCFG.PWMO = ${reg.general.bt_xldata.set.pwm_offset}) is wrong. Correct value is PCFG.PWMO = ${pwmo_calculated}`
        });
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
    reg.ENDN.fields.ETV = regValue; // Endianness Test Value

    // 2. Generate human-readable register report
    if (regValue === 0x87654321) {
      reg.ENDN.report.push({
        severityLevel: sevC.Info, // info
        msg: `ENDN: ${reg.ENDN.name_long} (0x${reg.ENDN.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[ETV] Endianness Test Value = 0x${regValue.toString(16).toUpperCase().padStart(8, '0')} (Correct)`
      });
    } else {
      reg.ENDN.report.push({
        severityLevel: sevC.Error, // error
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
    reg.PREL.fields.REL = getBits(regValue, 31, 28); // Release
    reg.PREL.fields.STEP = getBits(regValue, 27, 24); // Step
    reg.PREL.fields.SUBSTEP = getBits(regValue, 23, 20); // Substep
    reg.PREL.fields.YEAR = getBits(regValue, 19, 16); // Year
    reg.PREL.fields.MON = getBits(regValue, 15, 8); // Month
    reg.PREL.fields.DAY = getBits(regValue, 7, 0); // Day

    // 2. Generate human-readable register report
    reg.PREL.report.push({
      severityLevel: sevC.Info, // info
      msg: `PREL: ${reg.PREL.name_long} (0x${reg.PREL.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[REL    ] Release  = 0x${reg.PREL.fields.REL.toString(16).toUpperCase()}\n` +
           `[STEP   ] Step     = 0x${reg.PREL.fields.STEP.toString(16).toUpperCase()}\n` +
           `[SUBSTEP] Substep  = 0x${reg.PREL.fields.SUBSTEP.toString(16).toUpperCase()}\n` +
           `[YEAR   ] Year     = 0x${reg.PREL.fields.YEAR.toString(16).toUpperCase()}\n` +
           `[MON    ] Month    = 0x${reg.PREL.fields.MON.toString(16).toUpperCase().padStart(2, '0')}\n` +
           `[DAY    ] Day      = 0x${reg.PREL.fields.DAY.toString(16).toUpperCase().padStart(2, '0')}`
    });

    // Generate Version Report
    reg.PREL.report.push({
      severityLevel: sevC.Info,
      highlight: true,
      msg: `PREL: X_CAN PRT V${reg.PREL.fields.REL.toString(16).toUpperCase()}.${reg.PREL.fields.STEP.toString(16).toUpperCase()}.${reg.PREL.fields.SUBSTEP.toString(16).toUpperCase()}, Date ${reg.PREL.fields.DAY.toString(16).toUpperCase().padStart(2, '0')}.${reg.PREL.fields.MON.toString(16).toUpperCase().padStart(2, '0')}.202${reg.PREL.fields.YEAR.toString(16).toUpperCase()}`
    });
  }

  // === STAT: PRT Status Register =========================================
  if ('STAT' in reg && reg.STAT.int32 !== undefined) {
    const regValue = reg.STAT.int32;

    // 0. Extend existing register structure
    reg.STAT.fields = {};
    reg.STAT.report = []; // Initialize report array

    // 1. Decode all individual bits of STAT register
    reg.STAT.fields.TEC  = getBits(regValue, 31, 24); // Transmit Error Counter
    reg.STAT.fields.RP   = getBits(regValue, 23, 23); // Receive Error Counter Carry Flag
    reg.STAT.fields.REC  = getBits(regValue, 22, 16); // Receive Error Counter
    reg.STAT.fields.TDCV = getBits(regValue, 15, 8);  // TDC Value
    reg.STAT.fields.BO   = getBits(regValue, 7, 7);   // Bus Off State
    reg.STAT.fields.EP   = getBits(regValue, 6, 6);   // Error Passive State
    reg.STAT.fields.FIMA = getBits(regValue, 5, 5);   // Fault Injection Mode Active
    reg.STAT.fields.CLKA = getBits(regValue, 4, 4);   // CLOCK_ACTIVE (1: active)
    reg.STAT.fields.STP  = getBits(regValue, 3, 3);   // Stop (1: Waiting for End of current frame TX/RX)
    reg.STAT.fields.INT  = getBits(regValue, 2, 2);   // Integrating (1: integrating into bus communication)
    reg.STAT.fields.ACT  = getBits(regValue, 1, 0);   // Activity (00: inactive, 01: idle, 10: receiver, 11: transmitter)

    // 2. Generate human-readable register report
    reg.STAT.report.push({
      severityLevel: sevC.Info, // info
      msg: `STAT: ${reg.STAT.name_long} (0x${reg.STAT.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[TEC ] TX Error Counter              = ${reg.STAT.fields.TEC}\n` +
           `[RP  ] RX Error Counter Carry Flag   = ${reg.STAT.fields.RP}\n` +
           `[REC ] RX Error Counter              = ${reg.STAT.fields.REC}\n` +
           `[TDCV] TDC Value (=TLD+SSP_offset)   = ${reg.STAT.fields.TDCV} cycles = ${reg.STAT.fields.TDCV * reg.general.clk_period} ns\n` +
           `[BO  ] Bus-Off State                 = ${reg.STAT.fields.BO}\n` +
           `[EP  ] Error Passive State           = ${reg.STAT.fields.EP}\n` +
           `[FIMA] Fault Injection Module Active = ${reg.STAT.fields.FIMA}\n` +
           `[CLKA] Clock Active                  = ${reg.STAT.fields.CLKA}\n` +
           `[STP ] Stop Request by user          = ${reg.STAT.fields.STP}\n` +
           `[INT ] Integrating                   = ${reg.STAT.fields.INT}\n` +
           `[ACT ] Activity                      = ${reg.STAT.fields.ACT} (0: inactive, 1: idle, 2: receiver, 3: transmitter))`
    });

    // 3. Add status-specific warnings/errors
    if (reg.STAT.fields.BO === 1) {
      reg.STAT.report.push({
        severityLevel: sevC.Warn, // warning
        msg: `CAN controller is in Bus-Off state`
      });
    }
    if (reg.STAT.fields.EP === 1) {
      reg.STAT.report.push({
        severityLevel: sevC.Warn, // warning
        msg: `CAN controller is in Error Passive state`
      });
    }
    if (reg.STAT.fields.TEC > 0) {
      reg.STAT.report.push({
        severityLevel: sevC.Warn,
        msg: `Transmit Error Counter (${reg.STAT.fields.TEC}) > 0: Transmit Errors seen recently.`
      });
    }
    if (reg.STAT.fields.REC > 0) {
      reg.STAT.report.push({
        severityLevel: sevC.Warn,
        msg: `Receive Error Counter (${reg.STAT.fields.REC}) > 0. Receive Errors seen recently.`
      });
    }
    if (reg.STAT.fields.RP === 1) {
      reg.STAT.report.push({
        severityLevel: sevC.Warn,
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
    reg.EVNT.fields.ABO = getBits(regValue, 13, 13); // TX stopped by user at MH/PRT Interface
    reg.EVNT.fields.IFR = getBits(regValue, 12, 12); // Invalid Frame Format (TX message)
    reg.EVNT.fields.USO = getBits(regValue, 11, 11); // Unexpected Sequence Start at MH/PRT Interface
    reg.EVNT.fields.DU  = getBits(regValue, 10, 10); // Data Underrun (TX_MSG)
    reg.EVNT.fields.PXE = getBits(regValue, 9, 9);   // Protocol Exception Event occurred
    reg.EVNT.fields.TXF = getBits(regValue, 8, 8);   // TX Frame successfully
    reg.EVNT.fields.RXF = getBits(regValue, 7, 7);   // RX Frame successfully
    reg.EVNT.fields.DO  = getBits(regValue, 6, 6);   // Data Overflow (RX_MSG)
    reg.EVNT.fields.STE = getBits(regValue, 5, 5);   // Stuff Error
    reg.EVNT.fields.FRE = getBits(regValue, 4, 4);   // Form Error / error counting rule f)
    reg.EVNT.fields.AKE = getBits(regValue, 3, 3);   // Acknowledge Error
    reg.EVNT.fields.B1E = getBits(regValue, 2, 2);   // Bit1 Error
    reg.EVNT.fields.B0E = getBits(regValue, 1, 1);   // Bit0 Error
    reg.EVNT.fields.CRE = getBits(regValue, 0, 0);   // CRC Error

    // 2. Generate human-readable register report (MSB -> LSB)
    reg.EVNT.report.push({
      severityLevel: sevC.Info,
      msg: `EVNT: ${reg.EVNT.name_long} (0x${reg.EVNT.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[ABO] TX stopped by user                  = ${reg.EVNT.fields.ABO}\n` +
           `[IFR] Invalid Frame Format (TX message)   = ${reg.EVNT.fields.IFR}\n` +
           `[USO] Unexpected Seq Start (MH/PRT TX IF) = ${reg.EVNT.fields.USO}\n` +
           `[DU ] Data Underrun (MH/PRT TX Interface) = ${reg.EVNT.fields.DU}\n` +
           `[PXE] Protocol Exception Event            = ${reg.EVNT.fields.PXE}\n` +
           `[TXF] TX Frame successfully               = ${reg.EVNT.fields.TXF}\n` +
           `[RXF] RX Frame successfully               = ${reg.EVNT.fields.RXF}\n` +
           `[DO ] Data Overflow (MH/PRT RX Interface) = ${reg.EVNT.fields.DO}\n` +
           `[STE] Stuff Error                         = ${reg.EVNT.fields.STE}\n` +
           `[FRE] Form Error                          = ${reg.EVNT.fields.FRE}\n` +
           `[AKE] Acknowledge Error                   = ${reg.EVNT.fields.AKE}\n` +
           `[B1E] Bit1 Error                          = ${reg.EVNT.fields.B1E}\n` +
           `[B0E] Bit0 Error                          = ${reg.EVNT.fields.B0E}\n` +
           `[CRE] CRC Error                           = ${reg.EVNT.fields.CRE}`
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
    reg.LOCK.fields.TMK = getBits(regValue, 31, 16); // Test Mode Key
    reg.LOCK.fields.ULK = getBits(regValue, 15, 0);  // Unlock Key

    // 2. Generate human-readable register report (MSB -> LSB)
    reg.LOCK.report.push({
      severityLevel: sevC.Info,
      msg: `LOCK (PRT): ${reg.LOCK.name_long} (0x${reg.LOCK.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[TMK] Test Mode Key = 0x${reg.LOCK.fields.TMK.toString(16).toUpperCase().padStart(4, '0')}\n` +
           `[ULK] Unlock Key    = 0x${reg.LOCK.fields.ULK.toString(16).toUpperCase().padStart(4, '0')}`
    });

    // 3. Additional checks/warnings
    if (regValue !== 0) {
      reg.LOCK.report.push({
        severityLevel: sevC.Warn,
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
    reg.CTRL.fields.TEST = getBits(regValue, 12, 12); // Enable Test Mode Command (needs TMK)
    reg.CTRL.fields.SRES = getBits(regValue, 8, 8);   // Software Reset Command (no unlock needed)
    reg.CTRL.fields.STRT = getBits(regValue, 4, 4);   // Start Command
    reg.CTRL.fields.IMMD = getBits(regValue, 1, 1);   // Stop Immediate Command (with STOP only)
    reg.CTRL.fields.STOP = getBits(regValue, 0, 0);   // Stop Command (needs ULK)

    // 2. Generate human-readable register report (MSB -> LSB)
    reg.CTRL.report.push({
      severityLevel: sevC.Info,
      msg: `CTRL: ${reg.CTRL.name_long} (0x${reg.CTRL.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[TEST] Enable Test Mode Command = ${reg.CTRL.fields.TEST}\n` +
           `[SRES] Software Reset Command   = ${reg.CTRL.fields.SRES}\n` +
           `[STRT] Start Command            = ${reg.CTRL.fields.STRT}\n` +
           `[IMMD] Stop Immediate Command   = ${reg.CTRL.fields.IMMD}\n` +
           `[STOP] Stop Command             = ${reg.CTRL.fields.STOP}`
    });

    // 3. Additional checks/warnings
    if (regValue !== 0) {
      reg.CTRL.report.push({
        severityLevel: sevC.Warn,
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
    reg.FIMC.fields.FIP = getBits(regValue, 14, 0); // Fault Injection (Bit) Position

    // 2. Generate human-readable register report (MSB -> LSB)
    reg.FIMC.report.push({
      severityLevel: sevC.Info,
      msg: `FIMC: ${reg.FIMC.name_long} (0x${reg.FIMC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[FIP] Fault Injection Bit Position = ${reg.FIMC.fields.FIP}`
    });
  }

  // === TEST: Hardware Test Functions Register ===========================
  if ('TEST' in reg && reg.TEST.int32 !== undefined) {
    const regValue = reg.TEST.int32;

    // 0. Extend existing register structure
    reg.TEST.fields = {};
    reg.TEST.report = []; // Initialize report array

    // 1. Decode all individual bits of TEST register (MSB -> LSB)
    reg.TEST.fields.BUS_OFF  = getBits(regValue, 27, 27); // Trigger for IR (for testing)
    reg.TEST.fields.BUS_ON   = getBits(regValue, 26, 26); // Trigger for IR (for testing)
    reg.TEST.fields.E_PASSIVE= getBits(regValue, 25, 25); // Trigger for IR (for testing)
    reg.TEST.fields.E_ACTIVE = getBits(regValue, 24, 24); // Trigger for IR (for testing)
    reg.TEST.fields.BUS_ERR  = getBits(regValue, 23, 23); // Trigger for IR (for testing)
    reg.TEST.fields.RX_EVT   = getBits(regValue, 22, 22); // Trigger for IR (for testing)
    reg.TEST.fields.TX_EVT   = getBits(regValue, 21, 21); // Trigger for IR (for testing)
    reg.TEST.fields.IFF_RQ   = getBits(regValue, 20, 20); // Trigger for IR (for testing)
    reg.TEST.fields.RX_DO    = getBits(regValue, 19, 19); // Trigger for IR (for testing)
    reg.TEST.fields.TX_DU    = getBits(regValue, 18, 18); // Trigger for IR (for testing)
    reg.TEST.fields.USOS     = getBits(regValue, 17, 17); // Trigger for IR (for testing)
    reg.TEST.fields.ABORTED  = getBits(regValue, 16, 16); // Trigger for IR (for testing)
    reg.TEST.fields.HWT      = getBits(regValue, 15, 15); // Hardware Test Mode enabled
    reg.TEST.fields.TXD      = getBits(regValue, 5, 4);   // TX Signal Control
    reg.TEST.fields.RXD      = getBits(regValue, 3, 3);   // RX Signal value
    reg.TEST.fields.LBCK     = getBits(regValue, 0, 0);   // Loop-back mode

    // 2. Generate human-readable register report (MSB -> LSB)
    const txdMap = ['Normal', 'Normal (RX ignored)', 'TX forced 0', 'TX forced 1'];
    reg.TEST.report.push({
      severityLevel: sevC.Info,
      msg: `TEST: ${reg.TEST.name_long} (0x${reg.TEST.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[BUS_OFF ] Trigger IR BUS_OFF  = ${reg.TEST.fields.BUS_OFF}\n` +
           `[BUS_ON  ] Trigger IR BUS_ON   = ${reg.TEST.fields.BUS_ON}\n` +
           `[E_PASSIV] Trigger IR E_PASSIV = ${reg.TEST.fields.E_PASSIVE}\n` +
           `[E_ACTIVE] Trigger IR E_ACTIVE = ${reg.TEST.fields.E_ACTIVE}\n` +
           `[BUS_ERR ] Trigger IR BUS_ERR  = ${reg.TEST.fields.BUS_ERR}\n` +
           `[RX_EVT  ] Trigger IR RX_EVT   = ${reg.TEST.fields.RX_EVT}\n` +
           `[TX_EVT  ] Trigger IR TX_EVT   = ${reg.TEST.fields.TX_EVT}\n` +
           `[IFF_RQ  ] Trigger IR IFF_RQ   = ${reg.TEST.fields.IFF_RQ}\n` +
           `[RX_DO   ] Trigger IR RX_DO    = ${reg.TEST.fields.RX_DO}\n` +
           `[TX_DU   ] Trigger IR TX_DU    = ${reg.TEST.fields.TX_DU}\n` +
           `[USOS    ] Trigger IR USOS     = ${reg.TEST.fields.USOS}\n` +
           `[ABORTED ] Trigger IR ABORTED  = ${reg.TEST.fields.ABORTED}\n` +
           `[HWT     ] Hardware Test Mode  = ${reg.TEST.fields.HWT}\n` +
           `[TXD     ] TX Signal Control   = ${reg.TEST.fields.TXD} (0: PRT controlled, 1: PRT controlled, 2: Dominant, 3: Recessive)\n` +
           `[RXD     ] RX Signal value     = ${reg.TEST.fields.RXD}\n` +
           `[LBCK    ] Loop-back mode      = ${reg.TEST.fields.LBCK}`
    });

  } // TEST
 
} // PRT others