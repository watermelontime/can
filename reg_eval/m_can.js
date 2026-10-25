// All rights reserved. (c) 2026 //
// ===================================================================================
// M_CAN
// Main script for processing registers.
// ===================================================================================

import { getBits } from './help_functions.js';
import { defineField } from './help_functions.js';
import { sevC } from './help_functions.js';
import { getBinaryLineData } from './help_functions.js';

// TODO: IR and IE combined bit wise view: highlight enabled IR
//       e.g. print vertically (instead of horizontally)
//       but not clear how to add formating inside a report => via own special characters, e.g. <b> asdf <\b>
//       that are replaced in the report print process
// TODO: visualize gaps in the Memory Map as own rows and also generate according report to inform about this
// TODO: support different M_CAN version => ask Florian before


// ===================================================================================
// X_CAN: Process User Register Values: parse, validate, calculate results, generate report
export function processRegs(reg) {

  // c1) Process Bit Timing registers
  procRegsPrtBitTiming(reg);
  
  // c2) Process Other PRT registers
  procRegsPrtOther(reg);

  // c3) check MRAM Memory Map and visualise it
  checkMcanMessageRamMap(reg);
}

// ==================================================================================
// Example Register Values for M_CAN
export function loadExampleRegisterValues() {
  const clock = 80;
  const registerString = `# M_CAN example register values
# Format to use: 0xADDR 0xVALUE
# 0xADDR is internal module address
#        or global address (e.g. 32bit)
0x000 0x32150323
0x004 0x87654321
0x008 0x00000000
0x00C 0x00801ABB
0x010 0x00000080
0x014 0x00000F0F
0x018 0x00000300
0x01C 0x3E007E1F
0x020 0x00000000
0x024 0x00000000
0x028 0xFFFF0000
0x02C 0x0000FFFF
0x040 0x00000000
0x044 0x00273008
0x048 0x00001B00
0x050 0x000000D0
0x054 0x00001001
0x058 0x00000000
0x05C 0x00000001
0x080 0x0000003F
0x084 0x000A0000
0x088 0x00010028
0x090 0x1FFFFFFF
0x094 0x00000000
0x098 0x00000000
0x09C 0x00000000
0x0A0 0x00400030
0x0A4 0x00141400
0x0A8 0x00000013
0x0AC 0x00000000
0x0B0 0x00071230
0x0B4 0x02020405
0x0B8 0x00000003
0x0BC 0x00000077
0x0C0 0x00051528
0x0C4 0x00000000
0x0C8 0x00000005
0x0CC 0x00000000
0x0D0 0x00000000
0x0D4 0x00000000
0x0D8 0x00000003
0x0DC 0x00000000
0x0E0 0x00000000
0x0E4 0x00000000
0x0F0 0x00201428
0x0F4 0x00111100
0x0F8 0x00000010`;

return {exampleRegisterValues: registerString, clockFrequency: clock};
}

// Address Mask to be able to consider the local address bits
export const regLocalAddrMask = 0x000001FF; // 9 LSBit are the M_CAN local address bits

// Mapping table to map: Register-Addresses to Register-Names
export const regAddrMap = {
  0x000: { shortName: 'CREL', longName: 'Core Release Register' },
  0x004: { shortName: 'ENDN', longName: 'Endian Register' },
  0x008: { shortName: 'CUST', longName: 'Customer Register' },
  0x00C: { shortName: 'DBTP', longName: 'Data Bit Timing & Prescaler Register' },
  0x010: { shortName: 'TEST', longName: 'Test Register' },
  0x014: { shortName: 'RWD', longName: 'RAM Watchdog' },
  0x018: { shortName: 'CCCR', longName: 'CC Control Register' },
  0x01C: { shortName: 'NBTP', longName: 'Nominal Bit Timing & Prescaler Register' },
  0x020: { shortName: 'TSCC', longName: 'Timestamp Counter Configuration' },
  0x024: { shortName: 'TSCV', longName: 'Timestamp Counter Value' },
  0x028: { shortName: 'TOCC', longName: 'Timeout Counter Configuration' },
  0x02C: { shortName: 'TOCV', longName: 'Timeout Counter Value' },
  0x040: { shortName: 'ECR', longName: 'Error Counter Register' },
  0x044: { shortName: 'PSR', longName: 'Protocol Status Register' },
  0x048: { shortName: 'TDCR', longName: 'Transmitter Delay Compensation Register' },
  0x050: { shortName: 'IR', longName: 'Interrupt Register' },
  0x054: { shortName: 'IE', longName: 'Interrupt Enable' },
  0x058: { shortName: 'ILS', longName: 'Interrupt Line Select' },
  0x05C: { shortName: 'ILE', longName: 'Interrupt Line Enable' },
  0x080: { shortName: 'GFC', longName: 'Global Filter Configuration' },
  0x084: { shortName: 'SIDFC', longName: 'Standard ID Filter Configuration' },
  0x088: { shortName: 'XIDFC', longName: 'Extended ID Filter Configuration' },
  0x090: { shortName: 'XIDAM', longName: 'Extended ID AND Mask' },
  0x094: { shortName: 'HPMS', longName: 'High Priority Message Status' },
  0x098: { shortName: 'NDAT1', longName: 'New Data 1' },
  0x09C: { shortName: 'NDAT2', longName: 'New Data 2' },
  0x0A0: { shortName: 'RXF0C', longName: 'Rx FIFO 0 Configuration' },
  0x0A4: { shortName: 'RXF0S', longName: 'Rx FIFO 0 Status' },
  0x0A8: { shortName: 'RXF0A', longName: 'Rx FIFO 0 Acknowledge' },
  0x0AC: { shortName: 'RXBC', longName: 'Rx Buffer Configuration' },
  0x0B0: { shortName: 'RXF1C', longName: 'Rx FIFO 1 Configuration' },
  0x0B4: { shortName: 'RXF1S', longName: 'Rx FIFO 1 Status' },
  0x0B8: { shortName: 'RXF1A', longName: 'Rx FIFO 1 Acknowledge' },
  0x0BC: { shortName: 'RXESC', longName: 'Rx Buffer / FIFO Element Size Configuration' },
  0x0C0: { shortName: 'TXBC', longName: 'Tx Buffer Configuration' },
  0x0C4: { shortName: 'TXFQS', longName: 'Tx FIFO/Queue Status' },
  0x0C8: { shortName: 'TXESC', longName: 'Tx Buffer Element Size Configuration' },
  0x0CC: { shortName: 'TXBRP', longName: 'Tx Buffer Request Pending' },
  0x0D0: { shortName: 'TXBAR', longName: 'Tx Buffer Add Request' },
  0x0D4: { shortName: 'TXBCR', longName: 'Tx Buffer Cancellation Request' },
  0x0D8: { shortName: 'TXBTO', longName: 'Tx Buffer Transmission Occurred' },
  0x0DC: { shortName: 'TXBCF', longName: 'Tx Buffer Cancellation Finished' },
  0x0E0: { shortName: 'TXBTIE', longName: 'Tx Buffer Transmission Interrupt Enable' },
  0x0E4: { shortName: 'TXBCIE', longName: 'Tx Buffer Cancellation Finished Interrupt Enable' },
  0x0F0: { shortName: 'TXEFC', longName: 'Tx Event FIFO Configuration' },
  0x0F4: { shortName: 'TXEFS', longName: 'Tx Event FIFO Status' },
  0x0F8: { shortName: 'TXEFA', longName: 'Tx Event FIFO Acknowledge' }
};

// Reserved Address Array: list reserved addresses in M_CAN address range (inclusive, word-aligned step = 4 bytes)
export const resAddrArray = [
  { lowerResAddr: 0x030, upperResAddr: 0x03C }, // 0x030, 0x034, 0x038, 0x03C  -> (4)
  { lowerResAddr: 0x04C, upperResAddr: 0x04C }, // 0x04C                       -> (1)
  { lowerResAddr: 0x060, upperResAddr: 0x07C }, // 0x060..0x07C step 4         -> (8)
  { lowerResAddr: 0x08C, upperResAddr: 0x08C }, // 0x08C                       -> (1)
  { lowerResAddr: 0x0E8, upperResAddr: 0x0EC }, // 0x0E8, 0x0EC                -> (2)
  { lowerResAddr: 0x0FC, upperResAddr: 0x1FC }  // 0x0FC..0x1FC step 4         -> (65)
];

// ==== Exported Funktions/Structures up to here =====================================
// ===================================================================================

// ===================================================================================
// Help function: Translate configured data field size to bytes
function decodeConfiguredDataFieldSizeInByte(field) {
  switch (field & 0x7) {
    case 0: return 8;
    case 1: return 12;
    case 2: return 16;
    case 3: return 20;
    case 4: return 24;
    case 5: return 32;
    case 6: return 48;
    case 7: return 64;
    default: return '?';
  }
} // decodeConfiguredDataFieldSizeInByte

// ===================================================================================
// Process Nominal Bit Timing Register: Extract parameters, validate ranges, calculate results, generate report
function procRegsPrtBitTiming(reg) {

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

  // Rule: only assign reg.general.* values if they get meaningful values
  //       leave values undefined, if a) according registers are not present
  //                                  b) configuration disables a feature (e.g. TMS=OFF => then do not provide PWM settings & results)

  // === CCCR: Extract parameters from register ==========================
  if ('CCCR' in reg && reg.CCCR.int32 !== undefined) {
    const regValue = reg.CCCR.int32;

    // 0. Extend existing register structure
    reg.CCCR.fields = {};
    reg.CCCR.report = []; // Initialize report array

    // 1. Decode all individual bits of CCCR register (M_CAN CC Control Register)
    defineField(reg.CCCR, regValue, 'NISO', 15, 15, 'Non ISO Operation');
    defineField(reg.CCCR, regValue, 'TXP',  14, 14, 'Transmit Pause');
    defineField(reg.CCCR, regValue, 'EFBI', 13, 13, 'Edge Filtering during Bus Integration');
    defineField(reg.CCCR, regValue, 'PXHD', 12, 12, 'Protocol Exception Handling Disable');
    defineField(reg.CCCR, regValue, 'WMM',  11, 11, 'Wide Message Marker');
    defineField(reg.CCCR, regValue, 'UTSU', 10, 10, 'Use Timestamping Unit (TSU)');
    defineField(reg.CCCR, regValue, 'BRSE', 9, 9, 'Bit Rate Switch Enable');
    defineField(reg.CCCR, regValue, 'FDOE', 8, 8, 'FD Operation Enable');
    defineField(reg.CCCR, regValue, 'TEST', 7, 7, 'Test Mode Enable');
    defineField(reg.CCCR, regValue, 'DAR',  6, 6, 'Disable Automatic Retransmission');
    defineField(reg.CCCR, regValue, 'MON',  5, 5, 'Bus Monitoring Mode');
    defineField(reg.CCCR, regValue, 'CSR',  4, 4, 'Clock Stop Request');
    defineField(reg.CCCR, regValue, 'CSA',  3, 3, 'Clock Stop Acknowledge');
    defineField(reg.CCCR, regValue, 'ASM',  2, 2, 'Restricted Operation Mode');
    defineField(reg.CCCR, regValue, 'CCE',  1, 1, 'Configuration Change Enable');
    defineField(reg.CCCR, regValue, 'INIT', 0, 0, 'Initialization');

    const f = reg.CCCR.fields;

    // 2. Store CCCR-related bit timing settings in general structure
    reg.general.bt_global.set.fd  = (f.FDOE.value === 1); // FD Operation Enable when FDOE=1
    reg.general.bt_global.set.fdbrs = (f.BRSE.value === 1); // FD Bit Rate Switch Enable when BRSE=1
    reg.general.bt_global.set.es  = true;  // Error signaling always enabled in standard M_CAN
    reg.general.bt_global.set.tms = false; // No TMS (Transceiver Mode Switching) in standard M_CAN
    reg.general.bt_global.set.xl  = false; // No XL support in standard M_CAN

    // 3. Generate human-readable register report
    reg.CCCR.report.push({
        severityLevel: sevC.info, // info
        msg: `CCCR: ${reg.CCCR.name_long} (0x${reg.CCCR.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[${f.NISO.name_short.padEnd(4)}] ${f.NISO.name_long.padEnd(37)} = ${f.NISO.value}\n` +
             `[${f.TXP.name_short.padEnd(4)}] ${f.TXP.name_long.padEnd(37)} = ${f.TXP.value}\n` +
             `[${f.EFBI.name_short.padEnd(4)}] ${f.EFBI.name_long.padEnd(37)} = ${f.EFBI.value}\n` +
             `[${f.PXHD.name_short.padEnd(4)}] ${f.PXHD.name_long.padEnd(37)} = ${f.PXHD.value}\n` +
             `[${f.WMM.name_short.padEnd(4)}] ${f.WMM.name_long.padEnd(37)} = ${f.WMM.value} (0: 8 bit MM, 1: 16 bit MM)\n` +
             `[${f.UTSU.name_short.padEnd(4)}] ${f.UTSU.name_long.padEnd(37)} = ${f.UTSU.value} (0: internal, 1: use TSU)\n` +
             `[${f.BRSE.name_short.padEnd(4)}] ${f.BRSE.name_long.padEnd(37)} = ${f.BRSE.value}\n` +
             `[${f.FDOE.name_short.padEnd(4)}] ${f.FDOE.name_long.padEnd(37)} = ${f.FDOE.value}\n` +
             `[${f.TEST.name_short.padEnd(4)}] ${f.TEST.name_long.padEnd(37)} = ${f.TEST.value}\n` +
             `[${f.DAR.name_short.padEnd(4)}] ${f.DAR.name_long.padEnd(37)} = ${f.DAR.value}\n` +
             `[${f.MON.name_short.padEnd(4)}] ${f.MON.name_long.padEnd(37)} = ${f.MON.value}\n` +
             `[${f.CSR.name_short.padEnd(4)}] ${f.CSR.name_long.padEnd(37)} = ${f.CSR.value}\n` +
             `[${f.CSA.name_short.padEnd(4)}] ${f.CSA.name_long.padEnd(37)} = ${f.CSA.value}\n` +
             `[${f.ASM.name_short.padEnd(4)}] ${f.ASM.name_long.padEnd(37)} = ${f.ASM.value}\n` +
             `[${f.CCE.name_short.padEnd(4)}] ${f.CCE.name_long.padEnd(37)} = ${f.CCE.value}\n` +
             `[${f.INIT.name_short.padEnd(4)}] ${f.INIT.name_long.padEnd(37)} = ${f.INIT.value}`
    });

    // Check: FDOE and BRSE should both be set for FD operation
    if (f.FDOE.value === 1 && f.BRSE.value === 0) {
      reg.CCCR.report.push({
        severityLevel: sevC.recommendation,
        msg: `CCCR: FDOE is set but BRSE is not set. For full CAN FD operation, both FDOE and BRSE should be enabled.`
      });
    }

    // Check: Configuration should not be in initialization mode during normal operation
    if (f.INIT.value === 1 || f.CCE.value === 1) {
      reg.CCCR.report.push({
        severityLevel: sevC.warning,
        msg: `CCCR: M_CAN is not started (no RX/TX possible): (INIT=1) or (CCE=1).`
      });
    }

    // Check: Test mode indication
    if (f.TEST.value === 1) {
      reg.CCCR.report.push({
        severityLevel: sevC.warning,
        msg: `CCCR: Test Mode is enabled (TEST=1). This should only be used for testing purposes.`
      });
    }

    // Check: Bus monitoring mode indication
    if (f.MON.value === 1) {
      reg.CCCR.report.push({
        severityLevel: sevC.warning,
        msg: `CCCR: Bus Monitoring Mode is active (MON=1). Controller will not transmit on TX pin at all, also no ACK or Error Frames.`
      });
    }

    // Check: Restricted operation mode
    if (f.ASM.value === 1) {
      reg.CCCR.report.push({
        severityLevel: sevC.warning,
        msg: `CCCR: Restricted Operation Mode is active (ASM=1). Controller will not transmit frames, but it will transmit an ACK on successful reception.`
      });
    }
  } // CCCR

  // === NBTP: Extract parameters from register ==========================
  if ('NBTP' in reg && reg.NBTP.int32 !== undefined) {
    const regValue = reg.NBTP.int32;

    // 0. Extend existing register structure
    reg.NBTP.fields = {};
    reg.NBTP.report = []; // Initialize report array

    // 1. Decode all individual bits of NBTP register (M_CAN specification)
    defineField(reg.NBTP, regValue, 'NSJW',   31, 25, 'Nominal SJW', r => r + 1);                // Nominal Synchronization Jump Width (8 bits)
    defineField(reg.NBTP, regValue, 'NBRP',   24, 16, 'Nominal Bit Rate Prescaler', r => r + 1); // Nominal Bit Rate Prescaler (7 bits)
    defineField(reg.NBTP, regValue, 'NTSEG1', 15,  8, 'Nominal Time Segment 1', r => r + 1);      // Nominal Time Segment 1 (9 bits)
    defineField(reg.NBTP, regValue, 'NTSEG2',  7,  0, 'Nominal Time Segment 2', r => r + 1);      // Nominal Time Segment 2 (8 bits)

    const f = reg.NBTP.fields;

    // 2. Store NBTP bit timing settings in general structure
    reg.general.bt_arb.set.brp = f.NBRP.decoded;
    reg.general.bt_arb.set.prop_and_phaseseg1 = f.NTSEG1.decoded;
    reg.general.bt_arb.set.phaseseg2 = f.NTSEG2.decoded;
    reg.general.bt_arb.set.sjw = f.NSJW.decoded;

    // 3. Generate human-readable register report
    reg.NBTP.report.push({
        severityLevel: sevC.info, // info
        msg: `NBTP: ${reg.NBTP.name_long} (0x${reg.NBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[${f.NSJW.name_short.padEnd(6)}] ${f.NSJW.name_long.padEnd(26)} = ${f.NSJW.decoded.toString(10).padStart(3,' ')} (range: 1-128) TQ\n` +
             `[${f.NBRP.name_short.padEnd(6)}] ${f.NBRP.name_long.padEnd(26)} = ${f.NBRP.decoded.toString(10).padStart(3,' ')} (range: 1-128)\n` +
             `[${f.NTSEG1.name_short.padEnd(6)}] ${f.NTSEG1.name_long.padEnd(26)} = ${f.NTSEG1.decoded.toString(10).padStart(3,' ')} (range: 1-256) TQ\n` +
             `[${f.NTSEG2.name_short.padEnd(6)}] ${f.NTSEG2.name_long.padEnd(26)} = ${f.NTSEG2.decoded.toString(10).padStart(3,' ')} (range: 1-128) TQ`
    });

    // 4. Calculate arbitration phase results and store in general structure
    reg.general.bt_arb.res.tq_len = reg.general.clk_period * reg.general.bt_arb.set.brp;
    reg.general.bt_arb.res.tq_per_bit = 1 + reg.general.bt_arb.set.prop_and_phaseseg1 + reg.general.bt_arb.set.phaseseg2;
    reg.general.bt_arb.res.bitrate = reg.general.clk_freq / (reg.general.bt_arb.set.brp * reg.general.bt_arb.res.tq_per_bit);
    reg.general.bt_arb.res.bit_length = 1000 / reg.general.bt_arb.res.bitrate;
    reg.general.bt_arb.res.sp = 100 - 100 * reg.general.bt_arb.set.phaseseg2 / reg.general.bt_arb.res.tq_per_bit;
    
    // 5. Generate Report about settings
    reg.NBTP.report.push({
        severityLevel: sevC.calculation,
        msg: `Nominal Bitrate (Arbitration Phase)\n` +
             `Bitrate    = ${reg.general.bt_arb.res.bitrate} Mbit/s\n` +
             `Bit Length = ${reg.general.bt_arb.res.bit_length} ns\n` +
             `TQ per Bit = ${reg.general.bt_arb.res.tq_per_bit}\n` +
             `TQ Length  = ${reg.general.bt_arb.res.tq_len} ns\n` +
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
        msg: `NBTP: Number of TQ/Bit is small. If possible, increase the TQ/Bit by reducing NBRP or increasing the CAN Clock Freq.`
      });
    }
  } // end if NBTP

  // === TDCR: Extract parameters from register ==========================
  if ('TDCR' in reg && reg.TDCR.int32 !== undefined) {
    const regValue = reg.TDCR.int32;

    // 0. Extend existing register structure
    reg.TDCR.fields = {};
    reg.TDCR.report = []; // Initialize report array

    // 1. Decode all individual bits of TDCR register (M_CAN specification)
    // See Bosch M_CAN User's Manual v3.3.1, Page 19
    defineField(reg.TDCR, regValue, 'TDCF', 6, 0, 'TDC Filter Window Length');  // Transmitter Delay Compensation Filter Window Length (7 bits)
    defineField(reg.TDCR, regValue, 'TDCO', 14, 8, 'TDC SSP Offset');           // Transmitter Delay Compensation SSP Offset (7 bits)

    const f = reg.TDCR.fields;

    // only exclude processing register, if it is clear that a) FD operation is disabled OR b) BRS is disabled
    if (reg.general.bt_global.set.fd !== undefined && reg.general.bt_global.set.fd === false ||
        reg.general.bt_global.set.fdbrs !== undefined && reg.general.bt_global.set.fdbrs === false) {
      // 3. Generate human-readable register report
      reg.TDCR.report.push({
        severityLevel: sevC.warning, // warning
        msg: `TDCR: ${reg.TDCR.name_long} (0x${reg.TDCR.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `FD Operation wir BRS is disabled: a) CCCR.FDOE=0 OR b) CCCR.BRSE=0 OR c) CCCR register not present in register dump`
      });

    } else {
      // 2. Store DBTP bit timing settings in general structure
      reg.general.bt_fddata.set.ssp_offset = f.TDCO.value;

      // 3. Generate human-readable register report
      reg.TDCR.report.push({
        severityLevel: sevC.info, // info
        msg: `TDCR: ${reg.TDCR.name_long} (0x${reg.TDCR.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[${f.TDCF.name_short.padEnd(4)}] ${f.TDCF.name_long.padEnd(24)} = ${f.TDCF.value}\n` +
             `[${f.TDCO.name_short.padEnd(4)}] ${f.TDCO.name_long.padEnd(24)} = ${f.TDCO.value}`
      });
    }
  } // end if TDCR

  // === DBTP: Extract parameters from register ==========================
  if ('DBTP' in reg && reg.DBTP.int32 !== undefined) {
    const regValue = reg.DBTP.int32;

    // 0. Extend existing register structure
    reg.DBTP.fields = {};
    reg.DBTP.report = []; // Initialize report array

    // 1. Decode all individual bits of DBTP register (M_CAN specification)
    defineField(reg.DBTP, regValue, 'TDC',    23, 23, 'Transmitter Delay Compensation');  // Transmitter Delay Compensation (1 bit)
    defineField(reg.DBTP, regValue, 'DBRP',   20, 16, 'Data Bit Rate Prescaler', r => r + 1); // Data Bit Rate Prescaler (5 bits)
    defineField(reg.DBTP, regValue, 'DTSEG1', 12,  8, 'Data Time Segment 1', r => r + 1);      // Data Time Segment 1 (5 bits)
    defineField(reg.DBTP, regValue, 'DTSEG2',  7,  4, 'Data Time Segment 2', r => r + 1);      // Data Time Segment 2 (4 bits)
    defineField(reg.DBTP, regValue, 'DSJW',    3,  0, 'Data SJW', r => r + 1);                 // Data Synchronization Jump Width (4 bits)

    const f = reg.DBTP.fields;

    // different output based on FD enabled yes/no
    if (reg.general.bt_global.set.fd !== undefined && reg.general.bt_global.set.fd === false ||
        reg.general.bt_global.set.fdbrs !== undefined && reg.general.bt_global.set.fdbrs === false) {
      // 3. Generate human-readable register report
      reg.DBTP.report.push({
        severityLevel: sevC.warning, // warning
        msg: `DBTP: ${reg.DBTP.name_long} (0x${reg.DBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `FD Operation is disabled: a) CCCR.FDOE=0 OR b) CCCR.BRSE=0 OR c) CCCR register not present`
      });

    } else { // FD enabled (or CCCR register not present)
      // 2. Store DBTP bit timing settings in general structure
      reg.general.bt_global.set.tdc = (f.TDC.value === 1); // TDC enabled when TDC=1
      reg.general.bt_fddata.set.prop_and_phaseseg1 = f.DTSEG1.decoded;
      reg.general.bt_fddata.set.phaseseg2 = f.DTSEG2.decoded;
      reg.general.bt_fddata.set.sjw = f.DSJW.decoded;
      // set brp (M_CAN uses separate data phase prescaler)
      reg.general.bt_fddata.set.brp = f.DBRP.decoded;
      
      // 3. Generate human-readable register report
    reg.DBTP.report.push({
      severityLevel: sevC.info, // info
      msg: `DBTP: ${reg.DBTP.name_long} (0x${reg.DBTP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TDC.name_short.padEnd(6)}] ${f.TDC.name_long.padEnd(30)} =  ${f.TDC.value} (on/off)\n` +
           `[${f.DBRP.name_short.padEnd(6)}] ${f.DBRP.name_long.padEnd(30)} = ${f.DBRP.decoded.toString(10).padStart(2,' ')} (range: 1-32)\n` +
           `[${f.DTSEG1.name_short.padEnd(6)}] ${f.DTSEG1.name_long.padEnd(30)} = ${f.DTSEG1.decoded.toString(10).padStart(2,' ')} (range: 1-32) TQ\n` +
           `[${f.DTSEG2.name_short.padEnd(6)}] ${f.DTSEG2.name_long.padEnd(30)} = ${f.DTSEG2.decoded.toString(10).padStart(2,' ')} (range: 1-16) TQ\n` +
           `[${f.DSJW.name_short.padEnd(6)}] ${f.DSJW.name_long.padEnd(30)} = ${f.DSJW.decoded.toString(10).padStart(2,' ')} (range: 1-16) TQ`
      });

      // 4. Calculate FD data phase results and store in general structure
      reg.general.bt_fddata.res.tq_len = reg.general.clk_period * reg.general.bt_fddata.set.brp;
      reg.general.bt_fddata.res.tq_per_bit = 1 + reg.general.bt_fddata.set.prop_and_phaseseg1 + reg.general.bt_fddata.set.phaseseg2;
      reg.general.bt_fddata.res.bitrate = reg.general.clk_freq / (reg.general.bt_fddata.set.brp * reg.general.bt_fddata.res.tq_per_bit);
      reg.general.bt_fddata.res.bit_length = 1000 / reg.general.bt_fddata.res.bitrate;
      reg.general.bt_fddata.res.sp = 100 - 100 * reg.general.bt_fddata.set.phaseseg2 / reg.general.bt_fddata.res.tq_per_bit;
      // Calculate SSP (Secondary Sample Point) if TDC is enabled
      if (reg.general.bt_global.set.tdc === true &&
          reg.general.bt_fddata.set.ssp_offset !== undefined) {
        reg.general.bt_fddata.res.ssp = 100*reg.general.bt_fddata.set.ssp_offset/reg.general.bt_fddata.res.tq_per_bit;
      } 

      // 5. Generate Report about settings
      reg.DBTP.report.push({
          severityLevel: sevC.calculation,
          msg: `CAN FD Data Phase Bitrate\n` +
               `Bitrate    = ${reg.general.bt_fddata.res.bitrate} Mbit/s\n` +
               `Bit Length = ${reg.general.bt_fddata.res.bit_length} ns\n` +
               `TQ per Bit = ${reg.general.bt_fddata.res.tq_per_bit}\n` +
               `TQ Length  = ${reg.general.bt_fddata.res.tq_len} ns\n` +
               `SP         = ${reg.general.bt_fddata.res.sp} %\n` +
               `SSP        = ${reg.general.bt_fddata.res.ssp} %`
      });

      // Check: CAN Clock Frequency as recommended in CiA 601-3?
      if ((reg.general.clk_freq != 160) && (reg.general.clk_freq != 80) && (reg.general.clk_freq != 40) && (reg.general.clk_freq != 20)) {
        reg.DBTP.report.push({
          severityLevel: sevC.warning,
          msg: `CAN FD: Recommended CAN Clock Frequency is 20, 40, 80 MHz and multiples (see CiA 601-3). Current value is ${reg.general.clk_freq} MHz.`
        });
      }

      // Check: check for SJW <= min(PhaseSeg1, PhaseSeg2)?
      if (reg.general.bt_fddata.set.sjw > reg.general.bt_fddata.set.phaseseg2) {
        reg.DBTP.report.push({
          severityLevel: sevC.error,
          msg: `DBTP: SJW (${reg.general.bt_fddata.set.sjw}) > PhaseSeg2 (${reg.general.bt_fddata.set.phaseseg2}). ISO 11898-1 requires SJW <= PhaseSeg2.`
        });
      }

      // Check: check for PhaseSeg2 >= 2
      if (reg.general.bt_fddata.set.phaseseg2 < 2) {
        reg.DBTP.report.push({
          severityLevel: sevC.error,
          msg: `DBTP: PhaseSeg2 (${reg.general.bt_fddata.set.phaseseg2}) < 2. ISO 11898-1 requires a value >= 2.`
        });
      }

      // Check: SJW choosen as large as possible?
      if (reg.general.bt_fddata.set.sjw < reg.general.bt_fddata.set.phaseseg2) {
        reg.DBTP.report.push({
          severityLevel: sevC.warning,
          msg: `DBTP: SJW (${reg.general.bt_fddata.set.sjw}) < PhaseSeg2 (${reg.general.bt_fddata.set.phaseseg2}). It is recommended to use SJW=PhaseSeg2.`
        });
      }

      // Check: Number of TQ large enough?
      if (reg.general.bt_fddata.res.tq_per_bit < 8) {
        reg.DBTP.report.push({
          severityLevel: sevC.warning,
          msg: `DBTP: Number of TQ/Bit is small (<8). If possible, increase the TQ/Bit by reducing DBRP or increasing the CAN Clock Freq.`
        });
      }

      // Check if BRP Data > 1
      if (reg.general.bt_fddata.set.brp > 1) {
        reg.DBTP.report.push({
          severityLevel: sevC.warning,
          msg: `DBTP: BRP (${reg.general.bt_fddata.set.brp}) > 1. A BRP > 1 may reduce robustness. Try using BRP=1 (encoded BRP=0).`
        });
      }

      // Check if BRP > 1, when TDC is enabled
      if (reg.general.bt_global.set.tdc === true && reg.general.bt_fddata.set.brp > 1) {
        reg.DBTP.report.push({
          severityLevel: sevC.error,
          msg: `DBTP: If TDC=1 then BRP must be <=2 (encoded value <=1). Here BRP=${reg.general.bt_fddata.set.brp} (raw BRP=${reg.general.bt_fddata.set.brp - 1}). See M_CAN User Manual.`
        });
      }
    } // end if FDOE=1
  } // end if DBTP

} // end procRegsPrtBitTiming

// ===================================================================================
// Process Other PRT Registers: Extract parameters, validate ranges, generate report
function procRegsPrtOther(reg) {

  // === CREL: PRT Release Identification Register =========================
  if ('CREL' in reg && reg.CREL.int32 !== undefined) {
    const regValue = reg.CREL.int32;

    // 0. Extend existing register structure
    reg.CREL.fields = {};
    reg.CREL.report = []; // Initialize report array

    // 1. Decode all individual bits
    defineField(reg.CREL, regValue, 'REL',     31, 28, 'Release');
    defineField(reg.CREL, regValue, 'STEP',    27, 24, 'Step');
    defineField(reg.CREL, regValue, 'SUBSTEP', 23, 20, 'Substep');
    defineField(reg.CREL, regValue, 'YEAR',    19, 16, 'Year');
    defineField(reg.CREL, regValue, 'MON',     15,  8, 'Month');
    defineField(reg.CREL, regValue, 'DAY',      7,  0, 'Day');

    const f = reg.CREL.fields;

    // 2. Generate human-readable register report
    reg.CREL.report.push({
      severityLevel: sevC.info, // info
      msg: `CREL: ${reg.CREL.name_long} (0x${reg.CREL.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.REL.name_short.padEnd(7)}] ${f.REL.name_long.padEnd(7)} = 0x${f.REL.value.toString(16).toUpperCase()}\n` +
           `[${f.STEP.name_short.padEnd(7)}] ${f.STEP.name_long.padEnd(7)} = 0x${f.STEP.value.toString(16).toUpperCase()}\n` +
           `[${f.SUBSTEP.name_short.padEnd(7)}] ${f.SUBSTEP.name_long.padEnd(7)} = 0x${f.SUBSTEP.value.toString(16).toUpperCase()}\n` +
           `[${f.YEAR.name_short.padEnd(7)}] ${f.YEAR.name_long.padEnd(7)} = 0x${f.YEAR.value.toString(16).toUpperCase()}\n` +
           `[${f.MON.name_short.padEnd(7)}] ${f.MON.name_long.padEnd(7)} = 0x${f.MON.value.toString(16).toUpperCase().padStart(2, '0')}\n` +
           `[${f.DAY.name_short.padEnd(7)}] ${f.DAY.name_long.padEnd(7)} = 0x${f.DAY.value.toString(16).toUpperCase().padStart(2, '0')}`
    });

    // Generate Version Report
    reg.CREL.report.push({
      severityLevel: sevC.infoBold,
      msg: `CREL: M_CAN V${f.REL.value.toString(16).toUpperCase()}.${f.STEP.value.toString(16).toUpperCase()}.${f.SUBSTEP.value.toString(16).toUpperCase()}, Date ${f.DAY.value.toString(16).toUpperCase().padStart(2, '0')}.${f.MON.value.toString(16).toUpperCase().padStart(2, '0')}.201${f.YEAR.value.toString(16).toUpperCase()}`
    });
  }

  // === ENDN: Endianness Test Register ====================================
  if ('ENDN' in reg && reg.ENDN.int32 !== undefined) {
    const regValue = reg.ENDN.int32;

    // 0. Extend existing register structure
    reg.ENDN.fields = {};
    reg.ENDN.report = []; // Initialize report array

    // 1. Decode ENDN register (simple 32-bit value)
    defineField(reg.ENDN, regValue, 'ETV', 31, 0, 'Endianness Test Value'); // whole 32-bit value

    const f = reg.ENDN.fields;

    // 2. Generate human-readable register report
    if (regValue === 0x87654321) {
      reg.ENDN.report.push({
        severityLevel: sevC.info, // info
  msg: `ENDN: ${reg.ENDN.name_long} (0x${reg.ENDN.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[${f.ETV.name_short}] ${f.ETV.name_long} = 0x${regValue.toString(16).toUpperCase().padStart(8, '0')} (Correct)`
      });
    } else {
      reg.ENDN.report.push({
        severityLevel: sevC.error, // error
        msg: `ENDN: ${reg.ENDN.name_long} (0x${reg.ENDN.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[${f.ETV.name_short}] ${f.ETV.name_long} = 0x${regValue.toString(16).toUpperCase().padStart(8, '0')} (Expected: 0x87654321)`
      });
    }
  } // ENDN

  // === CUST: Customer Register ================================
  if ('CUST' in reg && reg.CUST.int32 !== undefined) {
    const regValue = reg.CUST.int32;

    // 0. Extend existing register structure
    reg.CUST.fields = {};
    reg.CUST.report = []; // Initialize report array

    // 1. Decode all individual bits of TEST register
    // but fields must contain value to be recognized as decoded by main function
    defineField(reg.CUST, regValue, 'BITS', 31, 0, 'Customer-specific value');


    // Generate human-readable register report
    reg.CUST.report.push({
      severityLevel: sevC.info, // info
      msg: `CUST: ${reg.CUST.name_long} (0x${reg.CUST.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})`
    });
  } // CUST

  // === TEST: Hardware Test Functions Register ========================
  if ('TEST' in reg && reg.TEST.int32 !== undefined) {
    const regValue = reg.TEST.int32;

    // 0. Extend existing register structure
    reg.TEST.fields = {};
    reg.TEST.report = []; // Initialize report array

    // 1. Decode all individual bits of TEST register
    defineField(reg.TEST, regValue, 'SVAL',  21, 21, 'Started Valid');              // Started Valid
    defineField(reg.TEST, regValue, 'TXBNS', 20, 16, 'TX Buffer Number Started');   // TX Buffer Number Started
    defineField(reg.TEST, regValue, 'PVAL',  13, 13, 'Prepend Valid');              // Prepend Valid
    defineField(reg.TEST, regValue, 'TXBNP', 12,  8, 'TX Buffer Number Prepared');  // TX Buffer Number Prepend
    defineField(reg.TEST, regValue, 'RX',     7,  7, 'RX Pin');                     // Receive Pin
    defineField(reg.TEST, regValue, 'TX',     6,  5, 'TX Pin Control');             // TX Pin Control
    defineField(reg.TEST, regValue, 'LBCK',   4,  4, 'Loop Back Mode');             // Loop Back Mode

    const f = reg.TEST.fields;

    // 2. Generate human-readable register report
    reg.TEST.report.push({
      severityLevel: sevC.info, // info
      msg: `TEST: ${reg.TEST.name_long} (0x${reg.TEST.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.SVAL.name_short.padEnd(5)}] ${f.SVAL.name_long.padEnd(25)} = ${f.SVAL.value} (only in M_CAN V3.3.0 or later)\n` +
           `[${f.TXBNS.name_short.padEnd(5)}] ${f.TXBNS.name_long.padEnd(25)} = ${f.TXBNS.value} (only in M_CAN V3.3.0 or later)\n` +
           `[${f.PVAL.name_short.padEnd(5)}] ${f.PVAL.name_long.padEnd(25)} = ${f.PVAL.value} (only in M_CAN V3.3.0 or later)\n` +
           `[${f.TXBNP.name_short.padEnd(5)}] ${f.TXBNP.name_long.padEnd(25)} = ${f.TXBNP.value} (only in M_CAN V3.3.0 or later)\n` +
           `[${f.RX.name_short.padEnd(5)}] ${f.RX.name_long.padEnd(25)} = ${f.RX.value}\n` +
           `[${f.TX.name_short.padEnd(5)}] ${f.TX.name_long.padEnd(25)} = ${f.TX.value} (0: PRT controlled, 1: SP monitor, 2: Dominant, 3: Recessive)\n` +
           `[${f.LBCK.name_short.padEnd(5)}] ${f.LBCK.name_long.padEnd(25)} = ${f.LBCK.value} (1: enabled)`
    });

    // 3. Report test mode information messages
    if (f.LBCK.value === 1) {
      reg.TEST.report.push({
        severityLevel: sevC.warning,
        msg: `Loop Back Mode is active - for testing only\n` +
             `When CCCR.MON=1 it is the internal loopback (TX pin shows always recessive)\n` +
             `When CCCR.MON=0 it is the external loopback (TX pin driven by M_CAN PRT)`
      });
    }
    
    if (f.TX.value !== 0) {
      reg.TEST.report.push({
        severityLevel: sevC.warning,
        msg: `Test Mode is active: TX Pin is under manual control! CAN messages cannot be transmitted.`
      });
    }
  }


  // === RWD: RAM Watchdog ================================================
  if ('RWD' in reg && reg.RWD.int32 !== undefined) {
    const regValue = reg.RWD.int32;

    // 0. Extend existing register structure
    reg.RWD.fields = {};
    reg.RWD.report = []; // Initialize report array

    // 1. Decode all individual bits of RWD register (M_CAN User Manual v3.3.1, page 10)
    defineField(reg.RWD, regValue, 'WDV', 15, 8, 'Watchdog Value');          // Watchdog Value (8 bits)
    defineField(reg.RWD, regValue, 'WDC',  7, 0, 'Watchdog Configuration');  // Watchdog Configuration (8 bits)

    const f = reg.RWD.fields;

    // 2. Generate human-readable register report
    reg.RWD.report.push({
      severityLevel: sevC.info, // info
      msg: `RWD: ${reg.RWD.name_long} (0x${reg.RWD.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.WDV.name_short.padEnd(3)}] ${f.WDV.name_long.padEnd(22)} = ${f.WDV.value} (current Watchdog counter value)\n` +
           `[${f.WDC.name_short.padEnd(3)}] ${f.WDC.name_long.padEnd(22)} = ${f.WDC.value} (0: disabled, else: start value of Watchdog down-counter)`
    });

    // 3. Add warnings or info if Watchdog Value is close to Configuration
    if (f.WDC.value > 0) {
      reg.RWD.report.push({
        severityLevel: sevC.infoBold,
        msg: `RAM Watchdog is enabled. Configuration: WDC = ${f.WDC.value} Host Clock Cycles`
      });
    }
  }

  // === TSCC: Timestamp Counter Configuration =============================
  if ('TSCC' in reg && reg.TSCC.int32 !== undefined) {
    const regValue = reg.TSCC.int32;

    // 0. Extend existing register structure
    reg.TSCC.fields = {};
    reg.TSCC.report = []; // Initialize report array

    // 1. Decode all individual bits of TSCC register (M_CAN User Manual v3.3.1, page 14)
    defineField(reg.TSCC, regValue, 'TCP', 19, 16, 'Timestamp Counter Prescaler', r => r + 1); // (4 bits)
    defineField(reg.TSCC, regValue, 'TSS',  1,  0, 'Timestamp Select'); // (2 bits)

    const f = reg.TSCC.fields;

    // 2. Generate human-readable register report
    reg.TSCC.report.push({
      severityLevel: sevC.info, // info
      msg: `TSCC: ${reg.TSCC.name_long} (0x${reg.TSCC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TCP.name_short.padEnd(3)}] ${f.TCP.name_long.padEnd(27)} = ${f.TCP.decoded} (values 1..16)\n` +
           `[${f.TSS.name_short.padEnd(3)}] ${f.TSS.name_long.padEnd(27)} = ${f.TSS.value} (0: disabled, 1: TS counter internal, 2: TS counter external, 3: disabled)`
    });
  } // TSCC

  // === TSCV: Timestamp Counter Value =========================================
  if ('TSCV' in reg && reg.TSCV.int32 !== undefined) {
    const regValue = reg.TSCV.int32;

    // 0. Extend existing register structure
    reg.TSCV.fields = {};
    reg.TSCV.report = []; // Initialize report array

    // 1. Decode all individual bits of TSCV register (M_CAN User Manual v3.3.1, page 14)
    defineField(reg.TSCV, regValue, 'TSC', 15, 0, 'Timestamp Counter Value'); // (16 bits)

    const f = reg.TSCV.fields;

    // 2. Generate human-readable register report
    reg.TSCV.report.push({
      severityLevel: sevC.info, // info
      msg: `TSCV: ${reg.TSCV.name_long} (0x${reg.TSCV.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TSC.name_short.padEnd(3)}] ${f.TSC.name_long.padEnd(23)} = ${f.TSC.value} (counter width: 16 bit)`
    });
  } // TSCV

  // === TOCC: Timeout Counter Configuration ==============================
  if ('TOCC' in reg && reg.TOCC.int32 !== undefined) {
    const regValue = reg.TOCC.int32;

    // 0. Extend existing register structure
    reg.TOCC.fields = {};
    reg.TOCC.report = []; // Initialize report array

    // 1. Decode all individual bits of TOCC register (M_CAN User Manual v3.3.1, page 15)
    defineField(reg.TOCC, regValue, 'TOP',  31, 16, 'Timeout Period');         // (16 bits)
    defineField(reg.TOCC, regValue, 'TOS',   2,  1, 'Timeout Select');         // (2 bits)
    defineField(reg.TOCC, regValue, 'ETOC',  0,  0, 'Enable Timeout Counter'); // (1 bit)

    const f = reg.TOCC.fields;

    // 2. Generate human-readable register report
    reg.TOCC.report.push({
      severityLevel: sevC.info, // info
      msg: `TOCC: ${reg.TOCC.name_long} (0x${reg.TOCC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TOP.name_short.padEnd(4)}] ${f.TOP.name_long.padEnd(22)} = ${f.TOP.value}\n` +
           `[${f.TOS.name_short.padEnd(4)}] ${f.TOS.name_long.padEnd(22)} = ${f.TOS.value} (0: continuous, 1: TX Event FIFO, 2: RX FIFO0, 3: RX FIFO1)\n` +
           `[${f.ETOC.name_short.padEnd(4)}] ${f.ETOC.name_long.padEnd(22)} = ${f.ETOC.value}`  
    });
  }

  // === TOCV: Timeout Counter Value ======================================
  if ('TOCV' in reg && reg.TOCV.int32 !== undefined) {
    const regValue = reg.TOCV.int32;

    // 0. Extend existing register structure
    reg.TOCV.fields = {};
    reg.TOCV.report = []; // Initialize report array

    // 1. Decode all individual bits of TOCV register (M_CAN User Manual v3.3.1, page 15)
    defineField(reg.TOCV, regValue, 'TOC', 15, 0, 'Timeout Counter Value'); // (16 bits)

    const f = reg.TOCV.fields;

    // 2. Generate human-readable register report
    reg.TOCV.report.push({
      severityLevel: sevC.info, // info
      msg: `TOCV: ${reg.TOCV.name_long} (0x${reg.TOCV.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TOC.name_short.padEnd(3)}] ${f.TOC.name_long.padEnd(21)} = ${f.TOC.value} (counter width: 16 bit)`
    });
  }

  // === ECR: Error Counter Register =======================================
  if ('ECR' in reg && reg.ECR.int32 !== undefined) {
    const regValue = reg.ECR.int32;

    // 0. Extend existing register structure
    reg.ECR.fields = {};
    reg.ECR.report = []; // Initialize report array

    // 1. Decode all individual bits of ECR register (M_CAN User Manual v3.3.1, page 16)
    defineField(reg.ECR, regValue, 'CEL', 23, 16, 'CAN Error Logging');           // (8 bits)
    defineField(reg.ECR, regValue, 'RP',  15, 15, 'RX Error Counter Carry Flag'); // Receive Error Passive (1 bit)
    defineField(reg.ECR, regValue, 'REC', 14,  8, 'RX Error Counter');            // Receive Error Counter (7 bits)
    defineField(reg.ECR, regValue, 'TEC',  7,  0, 'TX Error Counter');            // Transmit Error Counter (8 bits)

    const f = reg.ECR.fields;

    // 2. Generate human-readable register report
    reg.ECR.report.push({
      severityLevel: sevC.info, // info
      msg: `ECR: ${reg.ECR.name_long} (0x${reg.ECR.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.CEL.name_short.padEnd(3)}] ${f.CEL.name_long.padEnd(27)} = ${f.CEL.value}\n` +
           `[${f.RP.name_short.padEnd(3)}] ${f.RP.name_long.padEnd(27)} = ${f.RP.value} (1: REC reached Error Passive Level of 128)\n` +
           `[${f.REC.name_short.padEnd(3)}] ${f.REC.name_long.padEnd(27)} = ${f.REC.value}\n` +
           `[${f.TEC.name_short.padEnd(3)}] ${f.TEC.name_long.padEnd(27)} = ${f.TEC.value}`
    });

    // 3. Add warnings if error counters are high
    if (f.TEC.value > 0) {
      reg.ECR.report.push({
        severityLevel: sevC.warning,
        msg: `Transmit Error Counter (${f.TEC.value}) > 0: Transmit Errors seen recently.`
      });
    }
    if (f.REC.value > 0) {
      reg.ECR.report.push({
        severityLevel: sevC.warning,
        msg: `Receive Error Counter (${f.REC.value}) > 0. Receive Errors seen recently.`
      });
    }
    if (f.RP.value === 1) {
      reg.ECR.report.push({
        severityLevel: sevC.warning,
        msg: `Receive Error Passive flag is set. CAN controller is in error passive state for receive.`
      });
    }
  }

  // === PSR: PRT Status Register =========================================
  if ('PSR' in reg && reg.PSR.int32 !== undefined) {
    const regValue = reg.PSR.int32;

    // 0. Extend existing register structure
    reg.PSR.fields = {};
    reg.PSR.report = []; // Initialize report array

    // 1. Decode all individual bits of PSR register (M_CAN User Manual v3.3.1, pages 17-18)
    defineField(reg.PSR, regValue, 'LEC',   2,  0, 'Last Error Code Arb. Phase'); // Last Error Code (3 bits)
    defineField(reg.PSR, regValue, 'ACT',   4,  3, 'Activity');                   // Activity (2 bits)
    defineField(reg.PSR, regValue, 'EP',    5,  5, 'Error Passive');              // Error Passive (1 bit)
    defineField(reg.PSR, regValue, 'EW',    6,  6, 'Error Warning');              // Error Warning (1 bit)
    defineField(reg.PSR, regValue, 'BO',    7,  7, 'Bus-Off');                    // Bus Off (1 bit)
    defineField(reg.PSR, regValue, 'DLEC', 10,  8, 'Last Error Code Data Phase'); // Data Phase Last Error Code (3 bits)
    defineField(reg.PSR, regValue, 'RESI', 11, 11, 'ESI flag of last CAN FD msg');// ESI flag of last received CAN FD message (1 bit)
    defineField(reg.PSR, regValue, 'RBRS', 12, 12, 'BRS flag of last CAN FD msg');// BRS flag of last received CAN FD message (1 bit)
    defineField(reg.PSR, regValue, 'RFDF', 13, 13, 'Received a CAN FD Message');  // Received a CAN FD Message(1 bit)
    defineField(reg.PSR, regValue, 'TDCV', 20, 16, 'TDC Value (=TLD+SSP_offset)');// Transmitter Delay Compensation Value (5 bits)

    const f = reg.PSR.fields;

    // 2. Generate human-readable register report
    reg.PSR.report.push({
      severityLevel: sevC.info,
      msg: `PSR: ${reg.PSR.name_long} (0x${reg.PSR.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.LEC.name_short.padEnd(4)}] ${f.LEC.name_long.padEnd(27)} = ${f.LEC.value} (0: No Error, 1: Stuff, 2: Form, 3: Ack, 4: Bit1, 5: Bit0, 6: CRC, 7: No Change)\n` +
           `[${f.ACT.name_short.padEnd(4)}] ${f.ACT.name_long.padEnd(27)} = ${f.ACT.value} (0: Synchronizing, 1: Idle, 2: Receiver, 3: Transmitter)\n` +
           `[${f.EP.name_short.padEnd(4)}] ${f.EP.name_long.padEnd(27)} = ${f.EP.value}\n` +
           `[${f.EW.name_short.padEnd(4)}] ${f.EW.name_long.padEnd(27)} = ${f.EW.value}\n` +
           `[${f.BO.name_short.padEnd(4)}] ${f.BO.name_long.padEnd(27)} = ${f.BO.value}\n` +
           `[${f.DLEC.name_short.padEnd(4)}] ${f.DLEC.name_long.padEnd(27)} = ${f.DLEC.value} (0: No Error, 1: Stuff, 2: Form, 3: Ack, 4: Bit1, 5: Bit0, 6: CRC, 7: No Change)\n` +
           `[${f.RESI.name_short.padEnd(4)}] ${f.RESI.name_long.padEnd(27)} = ${f.RESI.value}\n` +
           `[${f.RBRS.name_short.padEnd(4)}] ${f.RBRS.name_long.padEnd(27)} = ${f.RBRS.value}\n` +
           `[${f.RFDF.name_short.padEnd(4)}] ${f.RFDF.name_long.padEnd(27)} = ${f.RFDF.value}\n` +
           `[${f.TDCV.name_short.padEnd(4)}] ${f.TDCV.name_long.padEnd(27)} = ${f.TDCV.value} => ${f.TDCV.value*reg.general.clk_period} ns`
    });

    // 3. Add status-specific warnings/errors
    if (f.BO.value === 1) {
      reg.PSR.report.push({
        severityLevel: sevC.warning,
        msg: `CAN controller is in Bus-Off state`
      });
    }
    if (f.EP.value === 1) {
      reg.PSR.report.push({
        severityLevel: sevC.warning,
        msg: `CAN controller is in Error Passive state`
      });
    }
    if (f.LEC.value > 0 && f.LEC.value < 7) {
      reg.PSR.report.push({
        severityLevel: sevC.warning,
        msg: `Last Error Code (Arbitration Phase) indicates a recent error: ${f.LEC.value}`
      });
    }
    if (f.DLEC.value > 0 && f.DLEC.value < 7) {
      reg.PSR.report.push({
        severityLevel: sevC.warning,
        msg: `Last Error Code (Data Phase) indicates a recent error: ${f.DLEC.value}`
      });
    }
  } // PSR

  // === IR: Interrupt Register =======================================
  if ('IR' in reg && reg.IR.int32 !== undefined) {
    const regValue = reg.IR.int32;

    // 0. Extend existing register structure
    reg.IR.fields = {};
    reg.IR.report = []; // Initialize report array

    // 1. Decode all individual bits of IR register (M_CAN User Manual v3.3.1, pages 20-24)
    defineField(reg.IR, regValue, 'ARA',  29, 29, 'Access to Reserved Address');
    defineField(reg.IR, regValue, 'PED',  28, 28, 'Protocol Error Data Phase');
    defineField(reg.IR, regValue, 'PEA',  27, 27, 'Protocol Error Arbitration');
    defineField(reg.IR, regValue, 'WDI',  26, 26, 'Watchdog Interrupt');
    defineField(reg.IR, regValue, 'BO',   25, 25, 'Bus_Off Status');
    defineField(reg.IR, regValue, 'EW',   24, 24, 'Warning Status');
    defineField(reg.IR, regValue, 'EP',   23, 23, 'Error Passive');
    defineField(reg.IR, regValue, 'ELO',  22, 22, 'Error Logging Overflow');
    defineField(reg.IR, regValue, 'BEU',  21, 21, 'Bit Error Uncorrected');
    defineField(reg.IR, regValue, 'BEC',  20, 20, 'Bit Error Corrected');
    defineField(reg.IR, regValue, 'DRX',  19, 19, 'Msg stored at Dedic. RX Buffer');
    defineField(reg.IR, regValue, 'TOO',  18, 18, 'Timeout Occurred');
    defineField(reg.IR, regValue, 'MRAF', 17, 17, 'Message RAM Access Failure');
    defineField(reg.IR, regValue, 'TSW',  16, 16, 'Timestamp Wraparound');
    defineField(reg.IR, regValue, 'TEFL', 15, 15, 'Tx Event FIFO Element Lost');
    defineField(reg.IR, regValue, 'TEFF', 14, 14, 'Tx Event FIFO Full');
    defineField(reg.IR, regValue, 'TEFW', 13, 13, 'Tx Event FIFO Watermark Reached');
    defineField(reg.IR, regValue, 'TEFN', 12, 12, 'Tx Event FIFO New Entry');
    defineField(reg.IR, regValue, 'TFE',  11, 11, 'Tx FIFO Empty');
    defineField(reg.IR, regValue, 'TCF',  10, 10, 'Transmission Cancellation Fin.');
    defineField(reg.IR, regValue, 'TC',    9,  9, 'Transmission Completed');
    defineField(reg.IR, regValue, 'HPM',   8,  8, 'High Priority Message');
    defineField(reg.IR, regValue, 'RF1L',  7,  7, 'Rx FIFO 1 Message Lost');
    defineField(reg.IR, regValue, 'RF1F',  6,  6, 'Rx FIFO 1 Full');
    defineField(reg.IR, regValue, 'RF1W',  5,  5, 'Rx FIFO 1 Watermark Reached');
    defineField(reg.IR, regValue, 'RF1N',  4,  4, 'Rx FIFO 1 New Message');
    defineField(reg.IR, regValue, 'RF0L',  3,  3, 'Rx FIFO 0 Message Lost');
    defineField(reg.IR, regValue, 'RF0F',  2,  2, 'Rx FIFO 0 Full');
    defineField(reg.IR, regValue, 'RF0W',  1,  1, 'Rx FIFO 0 Watermark Reached');
    defineField(reg.IR, regValue, 'RF0N',  0,  0, 'Rx FIFO 0 New Message');

    const f = reg.IR.fields;

    // 2. Generate human-readable register report
    reg.IR.report.push({
      severityLevel: sevC.info,
      msg: `IR: ${reg.IR.name_long} (0x${reg.IR.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.ARA.name_short.padEnd(4)}] ${f.ARA.name_long.padEnd(31)} = ${f.ARA.value}\n` +
           `[${f.PED.name_short.padEnd(4)}] ${f.PED.name_long.padEnd(31)} = ${f.PED.value}\n` +
           `[${f.PEA.name_short.padEnd(4)}] ${f.PEA.name_long.padEnd(31)} = ${f.PEA.value}\n` +
           `[${f.WDI.name_short.padEnd(4)}] ${f.WDI.name_long.padEnd(31)} = ${f.WDI.value}\n` +
           `[${f.BO.name_short.padEnd(4)}] ${f.BO.name_long.padEnd(31)} = ${f.BO.value}\n` +
           `[${f.EW.name_short.padEnd(4)}] ${f.EW.name_long.padEnd(31)} = ${f.EW.value}\n` +
           `[${f.EP.name_short.padEnd(4)}] ${f.EP.name_long.padEnd(31)} = ${f.EP.value}\n` +
           `[${f.ELO.name_short.padEnd(4)}] ${f.ELO.name_long.padEnd(31)} = ${f.ELO.value}\n` +
           `[${f.BEU.name_short.padEnd(4)}] ${f.BEU.name_long.padEnd(31)} = ${f.BEU.value}\n` +
           `[${f.BEC.name_short.padEnd(4)}] ${f.BEC.name_long.padEnd(31)} = ${f.BEC.value}\n` +
           `[${f.DRX.name_short.padEnd(4)}] ${f.DRX.name_long.padEnd(31)} = ${f.DRX.value}\n` +
           `[${f.TOO.name_short.padEnd(4)}] ${f.TOO.name_long.padEnd(31)} = ${f.TOO.value}\n` +
           `[${f.MRAF.name_short.padEnd(4)}] ${f.MRAF.name_long.padEnd(31)} = ${f.MRAF.value}\n` +
           `[${f.TSW.name_short.padEnd(4)}] ${f.TSW.name_long.padEnd(31)} = ${f.TSW.value}\n` +
           `[${f.TEFL.name_short.padEnd(4)}] ${f.TEFL.name_long.padEnd(31)} = ${f.TEFL.value}\n` +
           `[${f.TEFF.name_short.padEnd(4)}] ${f.TEFF.name_long.padEnd(31)} = ${f.TEFF.value}\n` +
           `[${f.TEFW.name_short.padEnd(4)}] ${f.TEFW.name_long.padEnd(31)} = ${f.TEFW.value}\n` +
           `[${f.TEFN.name_short.padEnd(4)}] ${f.TEFN.name_long.padEnd(31)} = ${f.TEFN.value}\n` +
           `[${f.TFE.name_short.padEnd(4)}] ${f.TFE.name_long.padEnd(31)} = ${f.TFE.value}\n` +
           `[${f.TCF.name_short.padEnd(4)}] ${f.TCF.name_long.padEnd(31)} = ${f.TCF.value}\n` +
           `[${f.TC.name_short.padEnd(4)}] ${f.TC.name_long.padEnd(31)} = ${f.TC.value}\n` +
           `[${f.HPM.name_short.padEnd(4)}] ${f.HPM.name_long.padEnd(31)} = ${f.HPM.value}\n` +
           `[${f.RF1L.name_short.padEnd(4)}] ${f.RF1L.name_long.padEnd(31)} = ${f.RF1L.value}\n` +
           `[${f.RF1F.name_short.padEnd(4)}] ${f.RF1F.name_long.padEnd(31)} = ${f.RF1F.value}\n` +
           `[${f.RF1W.name_short.padEnd(4)}] ${f.RF1W.name_long.padEnd(31)} = ${f.RF1W.value}\n` +
           `[${f.RF1N.name_short.padEnd(4)}] ${f.RF1N.name_long.padEnd(31)} = ${f.RF1N.value}\n` +
           `[${f.RF0L.name_short.padEnd(4)}] ${f.RF0L.name_long.padEnd(31)} = ${f.RF0L.value}\n` +
           `[${f.RF0F.name_short.padEnd(4)}] ${f.RF0F.name_long.padEnd(31)} = ${f.RF0F.value}\n` +
           `[${f.RF0W.name_short.padEnd(4)}] ${f.RF0W.name_long.padEnd(31)} = ${f.RF0W.value}\n` +
           `[${f.RF0N.name_short.padEnd(4)}] ${f.RF0N.name_long.padEnd(31)} = ${f.RF0N.value}`
    });
  } // IR

  // === IE: Interrupt Enable Register =======================================
  if ('IE' in reg && reg.IE.int32 !== undefined) {
    const regValue = reg.IE.int32;

    // 0. Extend existing register structure
    reg.IE.fields = {};
    reg.IE.report = []; // Initialize report array

    // 1. Decode all individual bits of IE register (M_CAN User Manual v3.3.1, pages 20-24)
    defineField(reg.IE, regValue, 'ARAE',  29, 29, 'Access to Reserved Address');
    defineField(reg.IE, regValue, 'PEDE',  28, 28, 'Protocol Error Data Phase');
    defineField(reg.IE, regValue, 'PEAE',  27, 27, 'Protocol Error Arbitration');
    defineField(reg.IE, regValue, 'WDIE',  26, 26, 'Watchdog Interrupt');
    defineField(reg.IE, regValue, 'BOE',   25, 25, 'Bus_Off Status');
    defineField(reg.IE, regValue, 'EWE',   24, 24, 'Warning Status');
    defineField(reg.IE, regValue, 'EPE',   23, 23, 'Error Passive');
    defineField(reg.IE, regValue, 'ELOE',  22, 22, 'Error Logging Overflow');
    defineField(reg.IE, regValue, 'BEUE',  21, 21, 'Bit Error Uncorrected');
    defineField(reg.IE, regValue, 'BECE',  20, 20, 'Bit Error Corrected');
    defineField(reg.IE, regValue, 'DRXE',  19, 19, 'Msg stored at Dedic. RX Buffer');
    defineField(reg.IE, regValue, 'TOOE',  18, 18, 'Timeout Occurred');
    defineField(reg.IE, regValue, 'MRAFE', 17, 17, 'Message RAM Access Failure');
    defineField(reg.IE, regValue, 'TSWE',  16, 16, 'Timestamp Wraparound');
    defineField(reg.IE, regValue, 'TEFLE', 15, 15, 'Tx Event FIFO Element Lost');
    defineField(reg.IE, regValue, 'TEFFE', 14, 14, 'Tx Event FIFO Full');
    defineField(reg.IE, regValue, 'TEFWE', 13, 13, 'Tx Event FIFO Watermark Reached');
    defineField(reg.IE, regValue, 'TEFNE', 12, 12, 'Tx Event FIFO New Entry');
    defineField(reg.IE, regValue, 'TFEE',  11, 11, 'Tx FIFO Empty');
    defineField(reg.IE, regValue, 'TCFE',  10, 10, 'Transmission Cancellation Fin.');
    defineField(reg.IE, regValue, 'TCE',    9,  9, 'Transmission Completed');
    defineField(reg.IE, regValue, 'HPME',   8,  8, 'High Priority Message');
    defineField(reg.IE, regValue, 'RF1LE',  7,  7, 'Rx FIFO 1 Message Lost');
    defineField(reg.IE, regValue, 'RF1FE',  6,  6, 'Rx FIFO 1 Full');
    defineField(reg.IE, regValue, 'RF1WE',  5,  5, 'Rx FIFO 1 Watermark Reached');
    defineField(reg.IE, regValue, 'RF1NE',  4,  4, 'Rx FIFO 1 New Message');
    defineField(reg.IE, regValue, 'RF0LE',  3,  3, 'Rx FIFO 0 Message Lost');
    defineField(reg.IE, regValue, 'RF0FE',  2,  2, 'Rx FIFO 0 Full');
    defineField(reg.IE, regValue, 'RF0WE',  1,  1, 'Rx FIFO 0 Watermark Reached');
    defineField(reg.IE, regValue, 'RF0NE',  0,  0, 'Rx FIFO 0 New Message');

    const f = reg.IE.fields;

    // 2. Generate human-readable register report
    reg.IE.report.push({
      severityLevel: sevC.info,
      msg: `IE: ${reg.IE.name_long} (0x${reg.IE.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.ARAE.name_short.padEnd(5)}] ${f.ARAE.name_long.padEnd(31)} = ${f.ARAE.value}\n` +
           `[${f.PEDE.name_short.padEnd(5)}] ${f.PEDE.name_long.padEnd(31)} = ${f.PEDE.value}\n` +
           `[${f.PEAE.name_short.padEnd(5)}] ${f.PEAE.name_long.padEnd(31)} = ${f.PEAE.value}\n` +
           `[${f.WDIE.name_short.padEnd(5)}] ${f.WDIE.name_long.padEnd(31)} = ${f.WDIE.value}\n` +
           `[${f.BOE.name_short.padEnd(5)}] ${f.BOE.name_long.padEnd(31)} = ${f.BOE.value}\n` +
           `[${f.EWE.name_short.padEnd(5)}] ${f.EWE.name_long.padEnd(31)} = ${f.EWE.value}\n` +
           `[${f.EPE.name_short.padEnd(5)}] ${f.EPE.name_long.padEnd(31)} = ${f.EPE.value}\n` +
           `[${f.ELOE.name_short.padEnd(5)}] ${f.ELOE.name_long.padEnd(31)} = ${f.ELOE.value}\n` +
           `[${f.BEUE.name_short.padEnd(5)}] ${f.BEUE.name_long.padEnd(31)} = ${f.BEUE.value}\n` +
           `[${f.BECE.name_short.padEnd(5)}] ${f.BECE.name_long.padEnd(31)} = ${f.BECE.value}\n` +
           `[${f.DRXE.name_short.padEnd(5)}] ${f.DRXE.name_long.padEnd(31)} = ${f.DRXE.value}\n` +
           `[${f.TOOE.name_short.padEnd(5)}] ${f.TOOE.name_long.padEnd(31)} = ${f.TOOE.value}\n` +
           `[${f.MRAFE.name_short.padEnd(5)}] ${f.MRAFE.name_long.padEnd(31)} = ${f.MRAFE.value}\n` +
           `[${f.TSWE.name_short.padEnd(5)}] ${f.TSWE.name_long.padEnd(31)} = ${f.TSWE.value}\n` +
           `[${f.TEFLE.name_short.padEnd(5)}] ${f.TEFLE.name_long.padEnd(31)} = ${f.TEFLE.value}\n` +
           `[${f.TEFFE.name_short.padEnd(5)}] ${f.TEFFE.name_long.padEnd(31)} = ${f.TEFFE.value}\n` +
           `[${f.TEFWE.name_short.padEnd(5)}] ${f.TEFWE.name_long.padEnd(31)} = ${f.TEFWE.value}\n` +
           `[${f.TEFNE.name_short.padEnd(5)}] ${f.TEFNE.name_long.padEnd(31)} = ${f.TEFNE.value}\n` +
           `[${f.TFEE.name_short.padEnd(5)}] ${f.TFEE.name_long.padEnd(31)} = ${f.TFEE.value}\n` +
           `[${f.TCFE.name_short.padEnd(5)}] ${f.TCFE.name_long.padEnd(31)} = ${f.TCFE.value}\n` +
           `[${f.TCE.name_short.padEnd(5)}] ${f.TCE.name_long.padEnd(31)} = ${f.TCE.value}\n` +
           `[${f.HPME.name_short.padEnd(5)}] ${f.HPME.name_long.padEnd(31)} = ${f.HPME.value}\n` +
           `[${f.RF1LE.name_short.padEnd(5)}] ${f.RF1LE.name_long.padEnd(31)} = ${f.RF1LE.value}\n` +
           `[${f.RF1FE.name_short.padEnd(5)}] ${f.RF1FE.name_long.padEnd(31)} = ${f.RF1FE.value}\n` +
           `[${f.RF1WE.name_short.padEnd(5)}] ${f.RF1WE.name_long.padEnd(31)} = ${f.RF1WE.value}\n` +
           `[${f.RF1NE.name_short.padEnd(5)}] ${f.RF1NE.name_long.padEnd(31)} = ${f.RF1NE.value}\n` +
           `[${f.RF0LE.name_short.padEnd(5)}] ${f.RF0LE.name_long.padEnd(31)} = ${f.RF0LE.value}\n` +
           `[${f.RF0FE.name_short.padEnd(5)}] ${f.RF0FE.name_long.padEnd(31)} = ${f.RF0FE.value}\n` +
           `[${f.RF0WE.name_short.padEnd(5)}] ${f.RF0WE.name_long.padEnd(31)} = ${f.RF0WE.value}\n` +
           `[${f.RF0NE.name_short.padEnd(5)}] ${f.RF0NE.name_long.padEnd(31)} = ${f.RF0NE.value}`
    });
  } // IE

  // === ILS: Interrupt Line Select Register =======================================
  if ('ILS' in reg && reg.ILS.int32 !== undefined) {
    const regValue = reg.ILS.int32;

    // 0. Extend existing register structure
    reg.ILS.fields = {};
    reg.ILS.report = []; // Initialize report array

    // 1. Decode all individual bits of IE register (M_CAN User Manual v3.3.1, pages 20-24)
    defineField(reg.ILS, regValue, 'ARAL',  29, 29, 'Access to Reserved Address');
    defineField(reg.ILS, regValue, 'PEDL',  28, 28, 'Protocol Error Data Phase');
    defineField(reg.ILS, regValue, 'PEAL',  27, 27, 'Protocol Error Arbitration');
    defineField(reg.ILS, regValue, 'WDIL',  26, 26, 'Watchdog Interrupt');
    defineField(reg.ILS, regValue, 'BOL',   25, 25, 'Bus_Off Status');
    defineField(reg.ILS, regValue, 'EWL',   24, 24, 'Warning Status');
    defineField(reg.ILS, regValue, 'EPL',   23, 23, 'Error Passive');
    defineField(reg.ILS, regValue, 'ELOL',  22, 22, 'Error Logging Overflow');
    defineField(reg.ILS, regValue, 'BEUL',  21, 21, 'Bit Error Uncorrected');
    defineField(reg.ILS, regValue, 'BECL',  20, 20, 'Bit Error Corrected');
    defineField(reg.ILS, regValue, 'DRXL',  19, 19, 'Msg stored at Dedic. RX Buffer');
    defineField(reg.ILS, regValue, 'TOOL',  18, 18, 'Timeout Occurred');
    defineField(reg.ILS, regValue, 'MRAFL', 17, 17, 'Message RAM Access Failure');
    defineField(reg.ILS, regValue, 'TSWL',  16, 16, 'Timestamp Wraparound');
    defineField(reg.ILS, regValue, 'TEFLL', 15, 15, 'Tx Event FIFO Element Lost');
    defineField(reg.ILS, regValue, 'TEFFL', 14, 14, 'Tx Event FIFO Full');
    defineField(reg.ILS, regValue, 'TEFWL', 13, 13, 'Tx Event FIFO Watermark Reached');
    defineField(reg.ILS, regValue, 'TEFNL', 12, 12, 'Tx Event FIFO New Entry');
    defineField(reg.ILS, regValue, 'TFEL',  11, 11, 'Tx FIFO Empty');
    defineField(reg.ILS, regValue, 'TCFL',  10, 10, 'Transmission Cancellation Fin.');
    defineField(reg.ILS, regValue, 'TCL',    9,  9, 'Transmission Completed');
    defineField(reg.ILS, regValue, 'HPML',   8,  8, 'High Priority Message');
    defineField(reg.ILS, regValue, 'RF1LL',  7,  7, 'Rx FIFO 1 Message Lost');
    defineField(reg.ILS, regValue, 'RF1FL',  6,  6, 'Rx FIFO 1 Full');
    defineField(reg.ILS, regValue, 'RF1WL',  5,  5, 'Rx FIFO 1 Watermark Reached');
    defineField(reg.ILS, regValue, 'RF1NL',  4,  4, 'Rx FIFO 1 New Message');
    defineField(reg.ILS, regValue, 'RF0LL',  3,  3, 'Rx FIFO 0 Message Lost');
    defineField(reg.ILS, regValue, 'RF0FL',  2,  2, 'Rx FIFO 0 Full');
    defineField(reg.ILS, regValue, 'RF0WL',  1,  1, 'Rx FIFO 0 Watermark Reached');
    defineField(reg.ILS, regValue, 'RF0NL',  0,  0, 'Rx FIFO 0 New Message');

    const f = reg.ILS.fields;

    // 2. Generate human-readable register report
    reg.ILS.report.push({
      severityLevel: sevC.info,
      msg: `ILS: ${reg.ILS.name_long} (0x${reg.ILS.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.ARAL.name_short.padEnd(5)}] ${f.ARAL.name_long.padEnd(31)} = ${f.ARAL.value}\n` +
           `[${f.PEDL.name_short.padEnd(5)}] ${f.PEDL.name_long.padEnd(31)} = ${f.PEDL.value}\n` +
           `[${f.PEAL.name_short.padEnd(5)}] ${f.PEAL.name_long.padEnd(31)} = ${f.PEAL.value}\n` +
           `[${f.WDIL.name_short.padEnd(5)}] ${f.WDIL.name_long.padEnd(31)} = ${f.WDIL.value}\n` +
           `[${f.BOL.name_short.padEnd(5)}] ${f.BOL.name_long.padEnd(31)} = ${f.BOL.value}\n` +
           `[${f.EWL.name_short.padEnd(5)}] ${f.EWL.name_long.padEnd(31)} = ${f.EWL.value}\n` +
           `[${f.EPL.name_short.padEnd(5)}] ${f.EPL.name_long.padEnd(31)} = ${f.EPL.value}\n` +
           `[${f.ELOL.name_short.padEnd(5)}] ${f.ELOL.name_long.padEnd(31)} = ${f.ELOL.value}\n` +
           `[${f.BEUL.name_short.padEnd(5)}] ${f.BEUL.name_long.padEnd(31)} = ${f.BEUL.value}\n` +
           `[${f.BECL.name_short.padEnd(5)}] ${f.BECL.name_long.padEnd(31)} = ${f.BECL.value}\n` +
           `[${f.DRXL.name_short.padEnd(5)}] ${f.DRXL.name_long.padEnd(31)} = ${f.DRXL.value}\n` +
           `[${f.TOOL.name_short.padEnd(5)}] ${f.TOOL.name_long.padEnd(31)} = ${f.TOOL.value}\n` +
           `[${f.MRAFL.name_short.padEnd(5)}] ${f.MRAFL.name_long.padEnd(31)} = ${f.MRAFL.value}\n` +
           `[${f.TSWL.name_short.padEnd(5)}] ${f.TSWL.name_long.padEnd(31)} = ${f.TSWL.value}\n` +
           `[${f.TEFLL.name_short.padEnd(5)}] ${f.TEFLL.name_long.padEnd(31)} = ${f.TEFLL.value}\n` +
           `[${f.TEFFL.name_short.padEnd(5)}] ${f.TEFFL.name_long.padEnd(31)} = ${f.TEFFL.value}\n` +
           `[${f.TEFWL.name_short.padEnd(5)}] ${f.TEFWL.name_long.padEnd(31)} = ${f.TEFWL.value}\n` +
           `[${f.TEFNL.name_short.padEnd(5)}] ${f.TEFNL.name_long.padEnd(31)} = ${f.TEFNL.value}\n` +
           `[${f.TFEL.name_short.padEnd(5)}] ${f.TFEL.name_long.padEnd(31)} = ${f.TFEL.value}\n` +
           `[${f.TCFL.name_short.padEnd(5)}] ${f.TCFL.name_long.padEnd(31)} = ${f.TCFL.value}\n` +
           `[${f.TCL.name_short.padEnd(5)}] ${f.TCL.name_long.padEnd(31)} = ${f.TCL.value}\n` +
           `[${f.HPML.name_short.padEnd(5)}] ${f.HPML.name_long.padEnd(31)} = ${f.HPML.value}\n` +
           `[${f.RF1LL.name_short.padEnd(5)}] ${f.RF1LL.name_long.padEnd(31)} = ${f.RF1LL.value}\n` +
           `[${f.RF1FL.name_short.padEnd(5)}] ${f.RF1FL.name_long.padEnd(31)} = ${f.RF1FL.value}\n` +
           `[${f.RF1WL.name_short.padEnd(5)}] ${f.RF1WL.name_long.padEnd(31)} = ${f.RF1WL.value}\n` +
           `[${f.RF1NL.name_short.padEnd(5)}] ${f.RF1NL.name_long.padEnd(31)} = ${f.RF1NL.value}\n` +
           `[${f.RF0LL.name_short.padEnd(5)}] ${f.RF0LL.name_long.padEnd(31)} = ${f.RF0LL.value}\n` +
           `[${f.RF0FL.name_short.padEnd(5)}] ${f.RF0FL.name_long.padEnd(31)} = ${f.RF0FL.value}\n` +
           `[${f.RF0WL.name_short.padEnd(5)}] ${f.RF0WL.name_long.padEnd(31)} = ${f.RF0WL.value}\n` +
           `[${f.RF0NL.name_short.padEnd(5)}] ${f.RF0NL.name_long.padEnd(31)} = ${f.RF0NL.value}`
    });
  } // ILS

  // IR Summary (only enabled IR shown)
  // (each line one IR flag)
  if (reg.IE !== undefined && reg.IR !== undefined) {
    // add IR Summary here: show only enabled IR flags
    const defs = [
      {bit:29, key:'ARA',  longName:'Accept Remote Access'},
      {bit:28, key:'PED',  longName:'Protocol Error Detected'},
      {bit:27, key:'PEA',  longName:'Protocol Error Active'},
      {bit:26, key:'WDI',  longName:'Watchdog Interrupt'},
      {bit:25, key:'BO',   longName:'Bus-Off'},
      {bit:24, key:'EW',   longName:'Error Warning'},
      {bit:23, key:'EP',   longName:'Error Passive'},
      {bit:22, key:'ELO',  longName:'Error Logging Overflow'},
      {bit:21, key:'BEU',  longName:'Bus Error Uncorrectable'},
      {bit:20, key:'BEC',  longName:'Bus Error Correctable'},
      {bit:19, key:'DRX',  longName:'Data Reception Error'},
      {bit:18, key:'TOO',  longName:'Timeout Occurred'},
      {bit:17, key:'MRAF', longName:'Message RAM Access Failure'},
      {bit:16, key:'TSW',  longName:'Timestamp Wraparound'},
      {bit:15, key:'TEFL', longName:'Transmit Error Flow Control'},
      {bit:14, key:'TEFF', longName:'Transmit Error Frame Format'},
      {bit:13, key:'TEFW', longName:'Transmit Error Frame Width'},
      {bit:12, key:'TEFN', longName:'Transmit Error Frame Number'},
      {bit:11, key:'TFE',  longName:'Transmit Frame Error'},
      {bit:10, key:'TCF',  longName:'Transmit Collision Failure'},
      {bit: 9, key:'TC',   longName:'Transmit Collision'},
      {bit: 8, key:'HPM',  longName:'High Priority Message'},
      {bit: 7, key:'RF1L', longName:'Receive FIFO 1 Level'},
      {bit: 6, key:'RF1F', longName:'Receive FIFO 1 Full'},
      {bit: 5, key:'RF1W', longName:'Receive FIFO 1 Watermark'},
      {bit: 4, key:'RF1N', longName:'Receive FIFO 1 Not Empty'},
      {bit: 3, key:'RF0L', longName:'Receive FIFO 0 Level'},
      {bit: 2, key:'RF0F', longName:'Receive FIFO 0 Full'},
      {bit: 1, key:'RF0W', longName:'Receive FIFO 0 Watermark'},
      {bit: 0, key:'RF0N', longName:'Receive FIFO 0 Not Empty'},
    ];
    
    // Keep only enabled (IE.*E == 1)
    const enabled = defs.filter(d => reg.IE.fields && reg.IE.fields[d.key + 'E'] && reg.IE.fields[d.key + 'E'].value === 1);
    const nameWidth = Math.max(4, ...enabled.map(e => e.key.length));
    let lines;
    if (enabled.length === 0) {
      lines = 'No M_CAN interrupts enabled (all IE bits = 0)';
    } else {
      lines = enabled.map(d => {
        const irV = (reg.IR.fields && reg.IR.fields[d.key] !== undefined) ? reg.IR.fields[d.key].value : '-';
        const ieV = reg.IE.fields[d.key + 'E'].value;
        return `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidth,' ')}  ${String(irV)}  ${String(ieV)}   (${d.longName})`;
      }).join('\n');
    }
    reg.IE.report.push({
      severityLevel: sevC.infoBold,
      msg: `M_CAN Interrupt Summary (only enabled IE bits)\n`+
           `Bit  Name${' '.repeat(nameWidth-4)}  IR IE  (description)\n`+
           `${lines}`
    });
  }

  // === ILE: Interrupt Line Enable Register =============================
  if ('ILE' in reg && reg.ILE.int32 !== undefined) {
    const regValue = reg.ILE.int32;

    // 0. Extend existing register structure
    reg.ILE.fields = {};
    reg.ILE.report = [];

    // 1. Decode all individual bits of ILE register (M_CAN User Manual v3.3.1, page 26)
    defineField(reg.ILE, regValue, 'EINT1', 1, 1, 'Enable Interrupt Line 1');
    defineField(reg.ILE, regValue, 'EINT0', 0, 0, 'Enable Interrupt Line 0');

    const f = reg.ILE.fields;

    // 2. Generate human-readable register report
    reg.ILE.report.push({
      severityLevel: sevC.info,
  msg: `ILE: ${reg.ILE.name_long} (0x${reg.ILE.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.EINT0.name_short.padEnd(5)}] ${f.EINT0.name_long.padEnd(23)} = ${f.EINT0.value}\n` +
           `[${f.EINT1.name_short.padEnd(5)}] ${f.EINT1.name_long.padEnd(23)} = ${f.EINT1.value}`
    });
  } // ILE

  // === GFC: Global Filter Configuration Register =======================
  if ('GFC' in reg && reg.GFC.int32 !== undefined) {
    const regValue = reg.GFC.int32;

    // 0. Extend existing register structure
    reg.GFC.fields = {};
    reg.GFC.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 27)
    defineField(reg.GFC, regValue, 'ANFS', 5, 4, 'Accept Non-matching Frames Standard');
    defineField(reg.GFC, regValue, 'ANFE', 3, 2, 'Accept Non-matching Frames Extended');
    defineField(reg.GFC, regValue, 'RRFS', 1, 1, 'Reject Remote Frames Standard');
    defineField(reg.GFC, regValue, 'RRFE', 0, 0, 'Reject Remote Frames Extended');

    const decode = (v) => ['Accept in Rx FIFO 0','Accept in Rx FIFO 1','Reject','Reject'][v];
    const f = reg.GFC.fields;

    // 2. Generate human-readable register report
    reg.GFC.report.push({
      severityLevel: sevC.info,
      msg: `GFC: ${reg.GFC.name_long} (0x${reg.GFC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.ANFS.name_short.padEnd(4)}] ${f.ANFS.name_long.padEnd(37)} = ${f.ANFS.value} (${decode(f.ANFS.value)})\n` +
           `[${f.ANFE.name_short.padEnd(4)}] ${f.ANFE.name_long.padEnd(37)} = ${f.ANFE.value} (${decode(f.ANFE.value)})\n` +
           `[${f.RRFS.name_short.padEnd(4)}] ${f.RRFS.name_long.padEnd(37)} = ${f.RRFS.value} (${f.RRFS.value ? 'Reject' : 'Filter remote frames'})\n` +
           `[${f.RRFE.name_short.padEnd(4)}] ${f.RRFE.name_long.padEnd(37)} = ${f.RRFE.value} (${f.RRFE.value ? 'Reject' : 'Filter remote frames'})`
          });
  } // GFC

  // === SIDFC: Standard ID Filter Configuration Register ================
  if ('SIDFC' in reg && reg.SIDFC.int32 !== undefined) {
    const regValue = reg.SIDFC.int32;

    // 0. Extend existing register structure
    reg.SIDFC.fields = {};
    reg.SIDFC.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 28)
    defineField(reg.SIDFC, regValue, 'LSS',   23, 16, 'List Size Standard');
    defineField(reg.SIDFC, regValue, 'FLSSA', 15,  2, 'Filter List Std Start Address');

    const f = reg.SIDFC.fields;

    // 2. Generate human-readable register report
    reg.SIDFC.report.push({
      severityLevel: sevC.info,
      msg: `SIDFC: ${reg.SIDFC.name_long} (0x${reg.SIDFC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.LSS.name_short.padEnd(5)}] ${f.LSS.name_long.padEnd(29)} = ${f.LSS.value}\n` +
           `[${f.FLSSA.name_short.padEnd(5)}] ${f.FLSSA.name_long.padEnd(29)} = 0x${(f.FLSSA.value << 2).toString(16).toUpperCase().padStart(4, '0')} (16 bit byte address, 2LSB=00)`
    });
  } // SIDFC

  // === XIDFC: Extended ID Filter Configuration Register ================
  if ('XIDFC' in reg && reg.XIDFC.int32 !== undefined) {
    const regValue = reg.XIDFC.int32;

    // 0. Extend existing register structure
    reg.XIDFC.fields = {};
    reg.XIDFC.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 28)
    defineField(reg.XIDFC, regValue, 'LSE',   22, 16, 'List Size Extended');
    defineField(reg.XIDFC, regValue, 'FLESA', 15,  2, 'Filter List Ext Start Address');

    const f = reg.XIDFC.fields;

    // 2. Generate human-readable register report
    reg.XIDFC.report.push({
      severityLevel: sevC.info,
      msg: `XIDFC: ${reg.XIDFC.name_long} (0x${reg.XIDFC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.LSE.name_short.padEnd(5)}] ${f.LSE.name_long.padEnd(29)} = ${f.LSE.value}\n` +
           `[${f.FLESA.name_short.padEnd(5)}] ${f.FLESA.name_long.padEnd(29)} = 0x${(f.FLESA.value << 2).toString(16).toUpperCase().padStart(4, '0')} (16 bit byte address, 2LSB=00)`
    });
  } // XIDFC

  // === XIDAM: Extended ID AND Mask Register ============================
  if ('XIDAM' in reg && reg.XIDAM.int32 !== undefined) {
    const regValue = reg.XIDAM.int32;

    // 0. Extend existing register structure
    reg.XIDAM.fields = {};
    reg.XIDAM.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 29)
    defineField(reg.XIDAM, regValue, 'XIDAM', 28, 0, 'Extended ID AND Mask');

    const f = reg.XIDAM.fields;

    // 2. Generate human-readable register report
    reg.XIDAM.report.push({
      severityLevel: sevC.info,
      msg: `XIDAM: ${reg.XIDAM.name_long} (0x${reg.XIDAM.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.XIDAM.name_short.padEnd(5)}] ${f.XIDAM.name_long.padEnd(20)} = 0x${f.XIDAM.value.toString(16).toUpperCase().padStart(8, '0')} (use: message ID AND this mask, 1...1 => no impact)`
    });
  } // XIDAM

  // === HPMS: High Priority Message Status Register ======================
  if ('HPMS' in reg && reg.HPMS.int32 !== undefined) {
    const regValue = reg.HPMS.int32;

    // 0. Extend existing register structure
    reg.HPMS.fields = {};
    reg.HPMS.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 29)
    defineField(reg.HPMS, regValue, 'FLST', 15, 15, 'Filter List');
    defineField(reg.HPMS, regValue, 'FIDX', 14,  8, 'Filter Index');
    defineField(reg.HPMS, regValue, 'MSI',   7,  6, 'Message Storage Indicator');
    defineField(reg.HPMS, regValue, 'BIDX',  5,  0, 'Buffer Index');

    const f = reg.HPMS.fields;

    // 2. Generate human-readable register report
    reg.HPMS.report.push({
      severityLevel: sevC.info,
      msg: `HPMS: ${reg.HPMS.name_long} (0x${reg.HPMS.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.FLST.name_short.padEnd(4)}] ${f.FLST.name_long.padEnd(25)} = ${f.FLST.value} (0: Std, 1: Ext)\n` +
           `[${f.FIDX.name_short.padEnd(4)}] ${f.FIDX.name_long.padEnd(25)} = ${f.FIDX.value}\n` +
           `[${f.MSI.name_short.padEnd(4)}] ${f.MSI.name_long.padEnd(25)} = ${f.MSI.value} (0: no FIFO sel, 1: FIFO msg lost, 2: Msg in FIFO0, 3: Msg in FIFO1)\n` +
           `[${f.BIDX.name_short.padEnd(4)}] ${f.BIDX.name_long.padEnd(25)} = ${f.BIDX.value} (only valid when MSI=2 or 3)`
    });
  } // HPMS

  // === NDAT1: New Data 1 Register =======================================
  if ('NDAT1' in reg && reg.NDAT1.int32 !== undefined) {
    const regValue = reg.NDAT1.int32;

    // 0. Extend existing register structure
    reg.NDAT1.fields = {};
    reg.NDAT1.report = [];

    // 1. Decode all individual bits (M_CAN User Manual v3.3.1, page 30)
    for (let i = 0; i < 32; i++) {
      defineField(reg.NDAT1, regValue, `ND${i}`, i, i, `New Data RX Buffer ${i}`); // New Data flags for RX Buffer 0-31
    }

    // 2. Generate human-readable register report
    // 31 ..                          0
    // 0 0 0 0   1 0 1 0   ...  1 0 0 0
    let ndat1Msg = `NDAT1: ${reg.NDAT1.name_long} (0x${reg.NDAT1.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n`;
    // Binary headline and bitwise value
    let headline = "Bit: 31                  23                  15                  7               0\n";
    let binaryLine = "     " + getBinaryLineData(regValue);
    reg.NDAT1.report.push({
      severityLevel: sevC.info,
      msg: `NDAT1: ${reg.NDAT1.name_long} (0x${reg.NDAT1.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` + headline + binaryLine
    });
  } // NDAT1

  // === NDAT2: New Data 2 Register =======================================
  if ('NDAT2' in reg && reg.NDAT2.int32 !== undefined) {
    const regValue = reg.NDAT2.int32;

    // 0. Extend existing register structure
    reg.NDAT2.fields = {};
    reg.NDAT2.report = [];

    // 1. Decode all individual bits (M_CAN User Manual v3.3.1, page 30)
    for (let i = 0; i < 32; i++) {
      defineField(reg.NDAT2, regValue, `ND${i+32}`, i, i, `New Data RX Buffer ${i+32}`); // New Data flags for RX Buffer 32-63
    }

    // 2. Generate human-readable register report
    let ndat2Msg = `NDAT2: ${reg.NDAT2.name_long} (0x${reg.NDAT2.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n`;
    // Binary headline and bitwise value
    let headline2 = "Bit: 63                  55                  47                  39             32\n";
    let binaryLine2 = "     " + getBinaryLineData(regValue);
    reg.NDAT2.report.push({
      severityLevel: sevC.info,
      msg: `NDAT2: ${reg.NDAT2.name_long} (0x${reg.NDAT2.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` + headline2 + binaryLine2
    });
  } // NDAT2

  // === RXF0C: Rx FIFO 0 Configuration Register =========================
  if ('RXF0C' in reg && reg.RXF0C.int32 !== undefined) {
    const regValue = reg.RXF0C.int32;

    // 0. Extend existing register structure
    reg.RXF0C.fields = {};
    reg.RXF0C.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 31)
    defineField(reg.RXF0C, regValue, 'F0OM', 31, 31, 'RX FIFO 0 Operation Mode');
    defineField(reg.RXF0C, regValue, 'F0WM', 30, 24, 'Rx FIFO 0 Watermark');
    defineField(reg.RXF0C, regValue, 'F0S',  22, 16, 'Rx FIFO 0 Size');
    defineField(reg.RXF0C, regValue, 'F0SA', 15,  2, 'Rx FIFO 0 Start Address');

    const f = reg.RXF0C.fields;

    // 2. Generate human-readable register report
    reg.RXF0C.report.push({
      severityLevel: sevC.info,
      msg: `RXF0C: ${reg.RXF0C.name_long} (0x${reg.RXF0C.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.F0OM.name_short.padEnd(4)}] ${f.F0OM.name_long.padEnd(24)} = ${f.F0OM.value} (0: blocking, 1: overwrite)\n` +
           `[${f.F0WM.name_short.padEnd(4)}] ${f.F0WM.name_long.padEnd(24)} = ${f.F0WM.value} (0: watermard disabled)\n` +
           `[${f.F0S.name_short.padEnd(4)}] ${f.F0S.name_long.padEnd(24)} = ${f.F0S.value}\n` +
           `[${f.F0SA.name_short.padEnd(4)}] ${f.F0SA.name_long.padEnd(24)} = 0x${(f.F0SA.value<<2).toString(16).toUpperCase().padStart(4, '0')} (16 bit byte address, 2LSB=00)`
    });
  } // RXF0C

  // === RXF0S: Rx FIFO 0 Status Register ================================
  if ('RXF0S' in reg && reg.RXF0S.int32 !== undefined) {
    const regValue = reg.RXF0S.int32;

    // 0. Extend existing register structure
    reg.RXF0S.fields = {};
    reg.RXF0S.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 32)
    defineField(reg.RXF0S, regValue, 'RF0L', 25, 25, 'Rx FIFO 0 Message Lost');
    defineField(reg.RXF0S, regValue, 'F0F',  24, 24, 'Rx FIFO 0 Full');
    defineField(reg.RXF0S, regValue, 'F0PI', 21, 16, 'Rx FIFO 0 Put Index');
    defineField(reg.RXF0S, regValue, 'F0GI', 13,  8, 'Rx FIFO 0 Get Index');
    defineField(reg.RXF0S, regValue, 'F0FL',  6,  0, 'Rx FIFO 0 Fill Level');

    const f = reg.RXF0S.fields;

    // 2. Generate human-readable register report
    reg.RXF0S.report.push({
      severityLevel: sevC.info,
      msg: `RXF0S: ${reg.RXF0S.name_long} (0x${reg.RXF0S.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.RF0L.name_short.padEnd(4)}] ${f.RF0L.name_long.padEnd(22)} = ${f.RF0L.value}\n` +
           `[${f.F0F.name_short.padEnd(4)}] ${f.F0F.name_long.padEnd(22)} = ${f.F0F.value}\n` +
           `[${f.F0PI.name_short.padEnd(4)}] ${f.F0PI.name_long.padEnd(22)} = ${f.F0PI.value}\n` +
           `[${f.F0GI.name_short.padEnd(4)}] ${f.F0GI.name_long.padEnd(22)} = ${f.F0GI.value}\n` +
           `[${f.F0FL.name_short.padEnd(4)}] ${f.F0FL.name_long.padEnd(22)} = ${f.F0FL.value}`
    });
  } // RXF0S

  // === RXF0A: Rx FIFO 0 Acknowledge Register ===========================
  if ('RXF0A' in reg && reg.RXF0A.int32 !== undefined) {
    const regValue = reg.RXF0A.int32;

    // 0. Extend existing register structure
    reg.RXF0A.fields = {};
    reg.RXF0A.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 33)
    defineField(reg.RXF0A, regValue, 'F0AI', 5, 0, 'Rx FIFO 0 Acknowledge Index');

    const f = reg.RXF0A.fields;

    // 2. Generate human-readable register report
    reg.RXF0A.report.push({
      severityLevel: sevC.info,
      msg: `RXF0A: ${reg.RXF0A.name_long} (0x${reg.RXF0A.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.F0AI.name_short.padEnd(4)}] ${f.F0AI.name_long.padEnd(27)} = ${f.F0AI.value}`
    });
  } // RXF0A

  // === RXBC: Rx Buffer Configuration Register =========================
  if ('RXBC' in reg && reg.RXBC.int32 !== undefined) {
    const regValue = reg.RXBC.int32;

    // 0. Extend existing register structure
    reg.RXBC.fields = {};
    reg.RXBC.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 33)
    defineField(reg.RXBC, regValue, 'RBSA', 15, 2, 'Rx Buffer Start Address');

    const f = reg.RXBC.fields;

    // 2. Generate human-readable register report
    reg.RXBC.report.push({
      severityLevel: sevC.info,
      msg: `RXBC: ${reg.RXBC.name_long} (0x${reg.RXBC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.RBSA.name_short.padEnd(4)}] ${f.RBSA.name_long.padEnd(23)} = 0x${(f.RBSA.value<<2).toString(16).toUpperCase().padStart(4, '0')} (16 bit byte address, 2LSB=00)`
    });
  } // RXBC

  // === RXF1C: Rx FIFO 1 Configuration Register =========================
  if ('RXF1C' in reg && reg.RXF1C.int32 !== undefined) {
    const regValue = reg.RXF1C.int32;

    // 0. Extend existing register structure
    reg.RXF1C.fields = {};
    reg.RXF1C.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 31)
    defineField(reg.RXF1C, regValue, 'F1OM', 31, 31, 'Rx FIFO 1 Operation Mode');
    defineField(reg.RXF1C, regValue, 'F1WM', 30, 24, 'Rx FIFO 1 Watermark');
    defineField(reg.RXF1C, regValue, 'F1S',  21, 16, 'Rx FIFO 1 Size');
    defineField(reg.RXF1C, regValue, 'F1SA', 15,  2, 'Rx FIFO 1 Start Address');

    const f = reg.RXF1C.fields;

    // 2. Generate human-readable register report
    reg.RXF1C.report.push({
      severityLevel: sevC.info,
      msg: `RXF1C: ${reg.RXF1C.name_long} (0x${reg.RXF1C.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.F1OM.name_short.padEnd(4)}] ${f.F1OM.name_long.padEnd(24)} = ${f.F1OM.value}\n` +
           `[${f.F1WM.name_short.padEnd(4)}] ${f.F1WM.name_long.padEnd(24)} = ${f.F1WM.value}\n` +
           `[${f.F1S.name_short.padEnd(4)}] ${f.F1S.name_long.padEnd(24)} = ${f.F1S.value}\n` +
           `[${f.F1SA.name_short.padEnd(4)}] ${f.F1SA.name_long.padEnd(24)} = 0x${(f.F1SA.value<<2).toString(16).toUpperCase().padStart(4, '0')} (16 bit byte address, 2LSB=00)`
    });
  } // RXF1C

  // === RXF1S: Rx FIFO 1 Status Register ================================
  if ('RXF1S' in reg && reg.RXF1S.int32 !== undefined) {
    const regValue = reg.RXF1S.int32;

    // 0. Extend existing register structure
    reg.RXF1S.fields = {};
    reg.RXF1S.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 32)
    defineField(reg.RXF1S, regValue, 'RF1L', 25, 25, 'Rx FIFO 1 Message Lost');
    defineField(reg.RXF1S, regValue, 'F1F',  24, 24, 'Rx FIFO 1 Full');
    defineField(reg.RXF1S, regValue, 'F1PI', 21, 16, 'Rx FIFO 1 Put Index');
    defineField(reg.RXF1S, regValue, 'F1GI', 13,  8, 'Rx FIFO 1 Get Index');
    defineField(reg.RXF1S, regValue, 'F1FL',  6,  0, 'Rx FIFO 1 Fill Level');

    const f = reg.RXF1S.fields;

    // 2. Generate human-readable register report
    reg.RXF1S.report.push({
      severityLevel: sevC.info,
      msg: `RXF1S: ${reg.RXF1S.name_long} (0x${reg.RXF1S.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.F1FL.name_short.padEnd(4)}] ${f.F1FL.name_long.padEnd(22)} = ${f.F1FL.value}\n` +
           `[${f.F1GI.name_short.padEnd(4)}] ${f.F1GI.name_long.padEnd(22)} = ${f.F1GI.value}\n` +
           `[${f.F1PI.name_short.padEnd(4)}] ${f.F1PI.name_long.padEnd(22)} = ${f.F1PI.value}\n` +
           `[${f.F1F.name_short.padEnd(4)}] ${f.F1F.name_long.padEnd(22)} = ${f.F1F.value}\n` +
           `[${f.RF1L.name_short.padEnd(4)}] ${f.RF1L.name_long.padEnd(22)} = ${f.RF1L.value}`
    });
  } // RXF1S

  // === RXF1A: Rx FIFO 1 Acknowledge Register ===========================
  if ('RXF1A' in reg && reg.RXF1A.int32 !== undefined) {
    const regValue = reg.RXF1A.int32;

    // 0. Extend existing register structure
    reg.RXF1A.fields = {};
    reg.RXF1A.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 33)
    defineField(reg.RXF1A, regValue, 'F1AI', 5, 0, 'Rx FIFO 1 Acknowledge Index');

    const f = reg.RXF1A.fields;

    // 2. Generate human-readable register report
    reg.RXF1A.report.push({
      severityLevel: sevC.info,
      msg: `RXF1A: ${reg.RXF1A.name_long} (0x${reg.RXF1A.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.F1AI.name_short.padEnd(4)}] ${f.F1AI.name_long.padEnd(27)} = ${f.F1AI.value}`
    });
  } // RXF1A

  // === RXESC: Rx Buffer/FIFO Element Size Configuration Register =======
  if ('RXESC' in reg && reg.RXESC.int32 !== undefined) {
    const regValue = reg.RXESC.int32;

    // 0. Extend existing register structure
    reg.RXESC.fields = {};
    reg.RXESC.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 36)
    defineField(reg.RXESC, regValue, 'RBDS', 10, 8, 'Rx Buffer Data Field Size');
    defineField(reg.RXESC, regValue, 'F1DS',  6, 4, 'Rx FIFO 1 Data Field Size');
    defineField(reg.RXESC, regValue, 'F0DS',  3, 0, 'Rx FIFO 0 Data Field Size');

    const f = reg.RXESC.fields;

    // 2. Generate human-readable register report (higher order bits first)
    reg.RXESC.report.push({
      severityLevel: sevC.info,
      msg: `RXESC: ${reg.RXESC.name_long} (0x${reg.RXESC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.RBDS.name_short.padEnd(4)}] ${f.RBDS.name_long.padEnd(25)} = ${f.RBDS.value} (= ${decodeConfiguredDataFieldSizeInByte(f.RBDS.value)} bytes)\n` +
           `[${f.F1DS.name_short.padEnd(4)}] ${f.F1DS.name_long.padEnd(25)} = ${f.F1DS.value} (= ${decodeConfiguredDataFieldSizeInByte(f.F1DS.value)} bytes)\n` +
           `[${f.F0DS.name_short.padEnd(4)}] ${f.F0DS.name_long.padEnd(25)} = ${f.F0DS.value} (= ${decodeConfiguredDataFieldSizeInByte(f.F0DS.value)} bytes)`
    });
  } // RXESC

  // === TXBC: Tx Buffer Configuration Register ==========================
  if ('TXBC' in reg && reg.TXBC.int32 !== undefined) {
    const regValue = reg.TXBC.int32;

    // 0. Extend existing register structure
    reg.TXBC.fields = {};
    reg.TXBC.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 37)
    defineField(reg.TXBC, regValue, 'TFQM', 30, 30, 'Tx FIFO/Queue Mode');
    defineField(reg.TXBC, regValue, 'TFQS', 29, 24, 'Tx FIFO/Queue Size');
    defineField(reg.TXBC, regValue, 'NDTB', 21, 16, 'Number of Dedicated Tx Buffers');
    defineField(reg.TXBC, regValue, 'TBSA', 15,  2, 'Tx Buffers Start Address (byte)');

    const f = reg.TXBC.fields;

    // 2. Generate human-readable register report (higher order bits first)
    reg.TXBC.report.push({
      severityLevel: sevC.info,
      msg: `TXBC: ${reg.TXBC.name_long} (0x${reg.TXBC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TFQM.name_short.padEnd(4)}] ${f.TFQM.name_long.padEnd(33)} = ${f.TFQM.value} (0: FIFO, 1: Queue)\n` +
           `[${f.TFQS.name_short.padEnd(4)}] ${f.TFQS.name_long.padEnd(33)} = ${f.TFQS.value}\n` +
           `[${f.NDTB.name_short.padEnd(4)}] ${f.NDTB.name_long.padEnd(33)} = ${f.NDTB.value}\n` +
           `[${f.TBSA.name_short.padEnd(4)}] ${f.TBSA.name_long.padEnd(33)} = 0x${(f.TBSA.value<<2).toString(16).toUpperCase().padStart(4, '0')} (16 bit byte address, 2LSB=00)`
    });

    // check if sum of Tx FIFO/Queue Size and Number of Dedicated Tx Buffers exceeds maximum
    if ((f.TFQS.value + f.NDTB.value) > 32) {
      reg.TXBC.report.push({
        severityLevel: sevC.error,
        msg: `TXBC: Sum of Tx FIFO/Queue Size (${f.TFQS.value}) and Number of Dedicated Tx Buffers (${f.NDTB.value}) exceeds maximum (32)`
      });
    }
  } // TXBC

  // === TXFQS: Tx FIFO/Queue Status Register ============================
  if ('TXFQS' in reg && reg.TXFQS.int32 !== undefined) {
    const regValue = reg.TXFQS.int32;

    // 0. Extend existing register structure
    reg.TXFQS.fields = {};
    reg.TXFQS.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 38)
    defineField(reg.TXFQS, regValue, 'TFQF',  21, 21, 'Tx FIFO/Queue Full');
    defineField(reg.TXFQS, regValue, 'TFQPI', 20, 16, 'Tx FIFO/Queue Put Index');
    defineField(reg.TXFQS, regValue, 'TFGI',  12,  8, 'Tx FIFO/Queue Get Index');
    defineField(reg.TXFQS, regValue, 'TFFL',   5,  0, 'Tx FIFO/Queue Fill Level');

    const f = reg.TXFQS.fields;

    // 2. Generate human-readable register report (higher order bits first)
    reg.TXFQS.report.push({
      severityLevel: sevC.info,
      msg: `TXFQS: ${reg.TXFQS.name_long} (0x${reg.TXFQS.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TFQF.name_short.padEnd(5)}] ${f.TFQF.name_long.padEnd(25)} = ${f.TFQF.value}\n` +
           `[${f.TFQPI.name_short.padEnd(5)}] ${f.TFQPI.name_long.padEnd(25)} = ${f.TFQPI.value}\n` +
           `[${f.TFGI.name_short.padEnd(5)}] ${f.TFGI.name_long.padEnd(25)} = ${f.TFGI.value}\n` +
           `[${f.TFFL.name_short.padEnd(5)}] ${f.TFFL.name_long.padEnd(25)} = ${f.TFFL.value}`
    });
  } // TXFQS

  // === TXESC: Tx Buffer Element Size Configuration Register ============
  if ('TXESC' in reg && reg.TXESC.int32 !== undefined) {
    const regValue = reg.TXESC.int32;

    // 0. Extend existing register structure
    reg.TXESC.fields = {};
    reg.TXESC.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 39)
    defineField(reg.TXESC, regValue, 'TBDS', 3, 0, 'Tx Buffer Data Field Size');

    const f = reg.TXESC.fields;

    // 2. Generate human-readable register report (higher order bits first)
    reg.TXESC.report.push({
      severityLevel: sevC.info,
      msg: `TXESC: ${reg.TXESC.name_long} (0x${reg.TXESC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TBDS.name_short.padEnd(4)}] ${f.TBDS.name_long.padEnd(25)} = ${decodeConfiguredDataFieldSizeInByte(f.TBDS.value)} bytes`
    });
  } // TXESC

  // === TXBRP: Transmit Buffer Request Pending Register =================
  if ('TXBRP' in reg && reg.TXBRP.int32 !== undefined) {
    const regValue = reg.TXBRP.int32;

    // 0. Extend existing register structure
    reg.TXBRP.fields = {};
    reg.TXBRP.report = [];

    // 1. No bit field decoding required, just show as binary (like NDAT1)
    // but fields must contain value to be recognized as decoded by main function
    defineField(reg.TXBRP, regValue, 'BITS', 31, 0, 'Transmit Buffer Request Pending');

    // 2. Generate human-readable register report (higher order bits first)
    let headline = "Bit: 31                  23                  15                  7               0\n";
    let binaryLine = "     " + getBinaryLineData(regValue);
    reg.TXBRP.report.push({
      severityLevel: sevC.info,
      msg: `TXBRP: ${reg.TXBRP.name_long} (0x${reg.TXBRP.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` + headline + binaryLine
    });
  }

  // === TXBAR: Transmit Buffer Add Request Register =====================
  if ('TXBAR' in reg && reg.TXBAR.int32 !== undefined) {
    const regValue = reg.TXBAR.int32;

    // 0. Extend existing register structure
    reg.TXBAR.fields = {};
    reg.TXBAR.report = [];

    // 1. No bit field decoding required, just show as binary (like NDAT1)
    // but fields must contain value to be recognized as decoded by main function
    defineField(reg.TXBAR, regValue, 'BITS', 31, 0, 'Transmit Buffer Add Request');

    // 2. Generate human-readable register report (higher order bits first)
    let headline = "Bit: 31                  23                  15                  7               0\n";
    let binaryLine = "     " + getBinaryLineData(regValue);
    reg.TXBAR.report.push({
      severityLevel: sevC.info,
      msg: `TXBAR: ${reg.TXBAR.name_long} (0x${reg.TXBAR.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` + headline + binaryLine
    });
  }

  // === TXBCR: Transmit Buffer Cancellation Request Register ============
  if ('TXBCR' in reg && reg.TXBCR.int32 !== undefined) {
    const regValue = reg.TXBCR.int32;

    // 0. Extend existing register structure
    reg.TXBCR.fields = {};
    reg.TXBCR.report = [];

    // 1. No bit field decoding required, just show as binary (like NDAT1)
    // but fields must contain value to be recognized as decoded by main function
    defineField(reg.TXBCR, regValue, 'BITS', 31, 0, 'Transmit Buffer Cancellation Request');

    // 2. Generate human-readable register report (higher order bits first)
    let headline = "Bit: 31                  23                  15                  7               0\n";
    let binaryLine = "     " + getBinaryLineData(regValue);
    reg.TXBCR.report.push({
      severityLevel: sevC.info,
      msg: `TXBCR: ${reg.TXBCR.name_long} (0x${reg.TXBCR.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` + headline + binaryLine
    });
  }

  // === TXBTO: Transmit Buffer Transmission Occurred Register ===========
  if ('TXBTO' in reg && reg.TXBTO.int32 !== undefined) {
    const regValue = reg.TXBTO.int32;

    // 0. Extend existing register structure
    reg.TXBTO.fields = {};
    reg.TXBTO.report = [];

    // 1. No bit field decoding required, just show as binary (like NDAT1)
    // but fields must contain value to be recognized as decoded by main function
    defineField(reg.TXBTO, regValue, 'BITS', 31, 0, 'Transmit Buffer Transmission Occurred');

    // 2. Generate human-readable register report (higher order bits first)
    let headline = "Bit: 31                  23                  15                  7               0\n";
    let binaryLine = "     " + getBinaryLineData(regValue);
    reg.TXBTO.report.push({
      severityLevel: sevC.info,
      msg: `TXBTO: ${reg.TXBTO.name_long} (0x${reg.TXBTO.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` + headline + binaryLine
    });
  }

  // === TXBCF: Transmit Buffer Cancellation Finished Register ===========
  if ('TXBCF' in reg && reg.TXBCF.int32 !== undefined) {
    const regValue = reg.TXBCF.int32;

    // 0. Extend existing register structure
    reg.TXBCF.fields = {};
    reg.TXBCF.report = [];

    // 1. No bit field decoding required, just show as binary (like NDAT1)
    // but fields must contain value to be recognized as decoded by main function
    defineField(reg.TXBCF, regValue, 'BITS', 31, 0, 'Transmit Buffer Cancellation Finished');

    // 2. Generate human-readable register report (higher order bits first)
    let headline = "Bit: 31                  23                  15                  7               0\n";
    let binaryLine = "     " + getBinaryLineData(regValue);
    reg.TXBCF.report.push({
      severityLevel: sevC.info,
      msg: `TXBCF: ${reg.TXBCF.name_long} (0x${reg.TXBCF.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` + headline + binaryLine
    });
  }

  // === TXBTIE: Transmit Buffer Transmission Interrupt Enable Register ===
  if ('TXBTIE' in reg && reg.TXBTIE.int32 !== undefined) {
    const regValue = reg.TXBTIE.int32;

    // 0. Extend existing register structure
    reg.TXBTIE.fields = {};
    reg.TXBTIE.report = [];

    // 1. No bit field decoding required, just show as binary (like NDAT1)
    // but fields must contain value to be recognized as decoded by main function
    defineField(reg.TXBTIE, regValue, 'BITS', 31, 0, 'Transmit Buffer Transmission Interrupt Enable');

    // 2. Generate human-readable register report (higher order bits first)
    let headline = "Bit: 31                  23                  15                  7               0\n";
    let binaryLine = "     " + getBinaryLineData(regValue);
    reg.TXBTIE.report.push({
      severityLevel: sevC.info,
      msg: `TXBTIE: ${reg.TXBTIE.name_long} (0x${reg.TXBTIE.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` + headline + binaryLine
    });
  }

  // === TXBCIE: Transmit Buffer Cancellation Finished Interrupt Enable Register ===
  if ('TXBCIE' in reg && reg.TXBCIE.int32 !== undefined) {
    const regValue = reg.TXBCIE.int32;

    // 0. Extend existing register structure
    reg.TXBCIE.fields = {};
    reg.TXBCIE.report = [];

    // 1. No bit field decoding required, just show as binary (like NDAT1)
    // but fields must contain value to be recognized as decoded by main function
    defineField(reg.TXBCIE, regValue, 'BITS', 31, 0, 'Transmit Buffer Cancellation Finished Interrupt Enable');

    // 2. Generate human-readable register report (higher order bits first)
    let headline = "Bit: 31                  23                  15                  7               0\n";
    let binaryLine = "     " + getBinaryLineData(regValue);
    reg.TXBCIE.report.push({
      severityLevel: sevC.info,
      msg: `TXBCIE: ${reg.TXBCIE.name_long} (0x${reg.TXBCIE.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` + headline + binaryLine
    });
  }
  
  // === M_CAN TX Buffer Summary (TXBRP / TXBTO / TXBAR / TXBCR / TXBCF / TXBTIE / TXBCIE) ===
  // Same style as X_CAN TXPQ summary: one binary line per register, MSB->LSB
  try {
    const lines = [];
    const header = 'Bit:   31                  23                  15                  7               0\n' +
                   '------------------------------------------------------------------------------------';
    lines.push(header);

    // Helper to add a register binary line if present
    const addRegLine = (label, regName) => {
      if (regName in reg && reg[regName].int32 !== undefined) {
        lines.push(label.padEnd(7) + getBinaryLineData(reg[regName].int32));
      }
    };

    // Handle possible user typo: TXBRR vs TXBRP (spec register is TXBRP)
    if ('TXBRR' in reg && !('TXBRP' in reg)) {
      // Mirror TXBRR content under TXBRP alias for summary (read-only usage)
      reg.TXBRP = reg.TXBRR;
    }

    // Order per user request
    addRegLine('TXBRP', 'TXBRP'); // Transmit Buffer Request Pending
    addRegLine('TXBTO', 'TXBTO'); // Transmit Buffer Transmission Occurred
    addRegLine('TXBAR', 'TXBAR'); // Transmit Buffer Add Request
    addRegLine('TXBCR', 'TXBCR'); // Transmit Buffer Cancellation Request
    addRegLine('TXBCF', 'TXBCF'); // Transmit Buffer Cancellation Finished
    addRegLine('TXBTIE','TXBTIE'); // Transmission Interrupt Enable
    addRegLine('TXBCIE','TXBCIE'); // Cancellation Finished Interrupt Enable

    if (lines.length > 1) { // we have at least one data line
      // Append to the last logical register present (prefer TXBCIE -> TXBTIE -> TXBCF -> TXBTO -> TXBCR -> TXBAR -> TXBRP)
      const prefer = ['TXBCIE','TXBTIE','TXBCF','TXBTO','TXBCR','TXBAR','TXBRP'];
      let target = null;
      for (const name of prefer) {
        if (name in reg && reg[name].report && Array.isArray(reg[name].report)) { target = reg[name]; break; }
      }
      if (!target) {
        reg._M_CAN_TXBUF_SUMMARY = reg._M_CAN_TXBUF_SUMMARY || { name_long: 'M_CAN TX Buffer Summary (auto)', report: [] };
        target = reg._M_CAN_TXBUF_SUMMARY;
      }
      target.report.push({
        severityLevel: sevC.infoBold,
        msg: 'M_CAN TX Buffer Summary\n' + lines.join('\n')
      });
    }
  } catch (e) {
    if (!reg._M_CAN_TXBUF_SUMMARY) reg._M_CAN_TXBUF_SUMMARY = { name_long: 'M_CAN TX Buffer Summary (error)', report: [] };
    if (!Array.isArray(reg._M_CAN_TXBUF_SUMMARY.report)) reg._M_CAN_TXBUF_SUMMARY.report = [];
    reg._M_CAN_TXBUF_SUMMARY.report.push({ severityLevel: sevC.warning, msg: 'M_CAN TX Buffer summary generation failed: ' + (e && e.message ? e.message : e) });
  }

  // === TXEFC: Tx Event FIFO Configuration Register =====================
  if ('TXEFC' in reg && reg.TXEFC.int32 !== undefined) {
    const regValue = reg.TXEFC.int32;

    // 0. Extend existing register structure
    reg.TXEFC.fields = {};
    reg.TXEFC.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 44)
    defineField(reg.TXEFC, regValue, 'EFWM', 29, 24, 'Event FIFO Watermark');
    defineField(reg.TXEFC, regValue, 'EFS',  21, 16, 'Event FIFO Size');
    defineField(reg.TXEFC, regValue, 'EFSA', 15,  2, 'Event FIFO Start Address');

    const f = reg.TXEFC.fields;

    // 2. Generate human-readable register report (higher order bits first)
    reg.TXEFC.report.push({
      severityLevel: sevC.info,
      msg: `TXEFC: ${reg.TXEFC.name_long} (0x${reg.TXEFC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.EFWM.name_short.padEnd(4)}] ${f.EFWM.name_long.padEnd(25)} = ${f.EFWM.value}\n` +
           `[${f.EFS.name_short.padEnd(4)}] ${f.EFS.name_long.padEnd(25)} = ${f.EFS.value}\n` +
           `[${f.EFSA.name_short.padEnd(4)}] ${f.EFSA.name_long.padEnd(25)} = 0x${(f.EFSA.value<<2).toString(16).toUpperCase().padStart(4, '0')} (16 bit byte address, 2LSB=00)`
    });
  }

  // === TXEFS: Tx Event FIFO Status Register ============================
  if ('TXEFS' in reg && reg.TXEFS.int32 !== undefined) {
    const regValue = reg.TXEFS.int32;
    reg.TXEFS.fields = {};
    reg.TXEFS.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 45)
    defineField(reg.TXEFS, regValue, 'TEFL', 25, 25, 'Tx Event FIFO Element Lost');
    defineField(reg.TXEFS, regValue, 'EFF',  24, 24, 'Event FIFO Full');
    defineField(reg.TXEFS, regValue, 'EFPI', 20, 16, 'Event FIFO Put Index');
    defineField(reg.TXEFS, regValue, 'EFGI', 12,  8, 'Event FIFO Get Index');
    defineField(reg.TXEFS, regValue, 'EFFL',  5,  0, 'Event FIFO Fill Level');

    const f = reg.TXEFS.fields;

    // 2. Generate human-readable register report (higher order bits first)
    reg.TXEFS.report.push({
      severityLevel: sevC.info,
      msg: `TXEFS: ${reg.TXEFS.name_long} (0x${reg.TXEFS.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.TEFL.name_short.padEnd(4)}] ${f.TEFL.name_long.padEnd(26)} = ${f.TEFL.value}\n` +
           `[${f.EFF.name_short.padEnd(4)}] ${f.EFF.name_long.padEnd(26)} = ${f.EFF.value}\n` +
           `[${f.EFPI.name_short.padEnd(4)}] ${f.EFPI.name_long.padEnd(26)} = ${f.EFPI.value}\n` +
           `[${f.EFGI.name_short.padEnd(4)}] ${f.EFGI.name_long.padEnd(26)} = ${f.EFGI.value}\n` +
           `[${f.EFFL.name_short.padEnd(4)}] ${f.EFFL.name_long.padEnd(26)} = ${f.EFFL.value}`
    });
  }

  // === TXEFA: Tx Event FIFO Acknowledge Register =======================
  if ('TXEFA' in reg && reg.TXEFA.int32 !== undefined) {
    const regValue = reg.TXEFA.int32;
    reg.TXEFA.fields = {};
    reg.TXEFA.report = [];

    // 1. Decode all individual bits/fields (M_CAN User Manual v3.3.1, page 45)
    defineField(reg.TXEFA, regValue, 'EFAI', 4, 0, 'Event FIFO Acknowledge Index');

    const f = reg.TXEFA.fields;

    // 2. Generate human-readable register report
    reg.TXEFA.report.push({
      severityLevel: sevC.info,
      msg: `TXEFA: ${reg.TXEFA.name_long} (0x${reg.TXEFA.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[${f.EFAI.name_short.padEnd(4)}] ${f.EFAI.name_long.padEnd(28)} = ${f.EFAI.value}`
    });
  }
}

// === Memory Map Check for M_CAN Message RAM Structures =========================
// This function creates a memory map of the enabled M_CAN data structures in Message RAM,
// sorts them by start address, and checks for overlaps/collisions.
function checkMcanMessageRamMap(reg) {
  // Helper to add a structure if enabled and address is present
  function addStruct(name, enabled, startAddr, size, elemNum, elemSize) {
    if (enabled) {
      memMapUsedArray.push({
        name,
        startAddr,
        endAddr: startAddr + size - 1,
        size,
        elemNum,
        elemSize
      });
    } else {
      memMapUnUsedArray.push({
        name,
        startAddr,
        endAddr: startAddr + size - 1,
        size,
        elemNum,
        elemSize
      });
    }
  }

  // Collect all structures
  const memMapUsedArray = []; // used structures (like FIFOs)
  const memMapUnUsedArray = []; // unused structures (like FIFOs)
  const RxBufferName="RX Buffer ded.";

  // --- Standard ID Filter List ---
  if (reg.SIDFC && reg.SIDFC.fields) {
    const enabled = (reg.SIDFC.fields.LSS.value > 0);
    const startAddr = reg.SIDFC.fields.FLSSA.value << 2;
    const elemNum = reg.SIDFC.fields.LSS.value;
    const elemSize = 4;
    const size = reg.SIDFC.fields.LSS.value * elemSize;
  addStruct("STD Filter", enabled, startAddr, size, elemNum, elemSize);
  }

  // --- Extended ID Filter List ---
  if (reg.XIDFC && reg.XIDFC.fields) {
    const enabled = (reg.XIDFC.fields.LSE.value > 0);
    const startAddr = reg.XIDFC.fields.FLESA.value << 2;
    const elemNum = reg.XIDFC.fields.LSE.value;
    const elemSize = 8;
    const size = reg.XIDFC.fields.LSE.value * elemSize;
    addStruct("EXT Filter", enabled, startAddr, size, elemNum, elemSize);
  }

  // --- RX FIFO 0 ---
  if (reg.RXF0C && reg.RXF0C.fields) {
    const enabled = (reg.RXF0C.fields.F0S.value > 0);
    const startAddr = reg.RXF0C.fields.F0SA.value << 2;
    const elemNum = reg.RXF0C.fields.F0S.value;
    let elemSize = 4; // default: 2 bytes (header+data)
    if (reg.RXESC && reg.RXESC.fields) {
      elemSize = 8 + decodeConfiguredDataFieldSizeInByte(reg.RXESC.fields.F0DS.value); // 8 bytes header + data
    }
    const size = reg.RXF0C.fields.F0S.value * elemSize;
    addStruct("RX FIFO 0", enabled, startAddr, size, elemNum, elemSize);
  }

  // --- RX FIFO 1 ---
  if (reg.RXF1C && reg.RXF1C.fields) {
    const enabled = (reg.RXF1C.fields.F1S.value > 0);
    const startAddr = reg.RXF1C.fields.F1SA.value << 2;
    const elemNum = reg.RXF1C.fields.F1S.value;
    let elemSize = 4; // default: 2 bytes (header+data)
    if (reg.RXESC && reg.RXESC.fields) {
      elemSize = 8 + decodeConfiguredDataFieldSizeInByte(reg.RXESC.fields.F1DS.value);
    }
    const size = reg.RXF1C.fields.F1S.value * elemSize;
    addStruct("RX FIFO 1", enabled, startAddr, size, elemNum, elemSize);
  }

  // --- RX dedicated Buffer ---
  if (reg.RXBC && reg.RXBC.fields) {
    const enabled = (reg.RXBC.fields.RBSA.value > 0); // HINT: Assume it to be enabled if Address != 0
    const startAddr = reg.RXBC.fields.RBSA.value << 2;
    // Number of RX buffers = sum of NDAT1/2 bits set, but spec: up to 64
    let elemNum = 1; // not configured in M_CAN; this is indirectly configured via the target in the RX filters
    let elemSize = 0; // default: 2 bytes (header+data)
    if (reg.RXESC && reg.RXESC.fields) {
      elemSize = 8 + decodeConfiguredDataFieldSizeInByte(reg.RXESC.fields.RBDS.value);
    }
    const size = elemNum * elemSize;
    addStruct(RxBufferName, enabled, startAddr, size, elemNum, elemSize);
  }

  // --- TX dedicated Buffer ---
  if (reg.TXBC && reg.TXBC.fields) {
    const enabled = (reg.TXBC.fields.NDTB.value > 0);
    const startAddr = reg.TXBC.fields.TBSA.value << 2;
    // Number of TX buffers = NDTB
    const elemNum = reg.TXBC.fields.NDTB.value;
    let elemSize = 0;
    if (reg.TXESC && reg.TXESC.fields) {
      elemSize = 8 + decodeConfiguredDataFieldSizeInByte(reg.TXESC.fields.TBDS.value);
    }
    const size = elemNum * elemSize;
    addStruct("TX Buffer ded.", enabled, startAddr, size, elemNum, elemSize);
  }

  // --- TX FIFO/Queue ---
  if (reg.TXBC && reg.TXBC.fields) {
    const enabled = (reg.TXBC.fields.TFQS.value > 0);
    // Number of TX buffers = TFQS (dedicated + FIFO/Queue)
    const elemNum = reg.TXBC.fields.TFQS.value;
    let elemSize = 0;
    if (reg.TXESC && reg.TXESC.fields) {
      elemSize = 8 + decodeConfiguredDataFieldSizeInByte(reg.TXESC.fields.TBDS.value);
    }
    const startAddr = (reg.TXBC.fields.TBSA.value << 2) + (reg.TXBC.fields.NDTB.value * elemSize); // Start after dedicated buffers

    const size = elemNum * elemSize;
    addStruct("TX FIFO/Queue", enabled, startAddr, size, elemNum, elemSize);
  }

  // --- TX Event FIFO ---
  if (reg.TXEFC && reg.TXEFC.fields) {
    const enabled = (reg.TXEFC.fields.EFS.value > 0);
    const startAddr = reg.TXEFC.fields.EFSA.value << 2;
    const elemNum = reg.TXEFC.fields.EFS.value;
    const elemSize = 8; // Each event is 8 bytes
    const size = elemNum * elemSize;
    addStruct("TX Event FIFO", enabled, startAddr, size, elemNum, elemSize);
  }

  // Sort by start address
  memMapUsedArray.sort((a, b) => a.startAddr - b.startAddr);

  // generate reports
  reg.memmap = {};
  reg.memmap.report = []; // Initialize report array

  // Build & submit memory map report
  let mapReport = "Message RAM Memory Map:";
  for (const s of memMapUsedArray) {
    if (s.name !== RxBufferName){
      mapReport += `\n${(s.name).padEnd(14)}: 0x${s.startAddr.toString(16).toUpperCase().padStart(4, "0")} - 0x${s.endAddr.toString(16).toUpperCase().padStart(4, "0")}` +
                   ` (${s.size.toString().padStart(4, " ")} byte)` +
                   ` elemNum=${s.elemNum.toString().padStart(2, " ")},` +
                   ` elemSize=${s.elemSize.toString().padStart(2, " ")} byte`;
    } else {
      // dedicated RX buffer => number of elements are implicitely configured via RX Filters that point to RX Buffers
      mapReport += `\n${(s.name).padEnd(14)}: 0x${s.startAddr.toString(16).toUpperCase().padStart(4, "0")} - 0x????` +
                   ` ( ??? byte)` +
                   ` elemNum=??,` +
                   ` elemSize=${s.elemSize.toString().padStart(2, " ")} byte`;
    }
  }
  reg.memmap.report.push({
      severityLevel: sevC.calculation,
      msg: mapReport
  });

  // Build & submit report about unused/disabled structures
  let unusedReport = "Message RAM: Unused/Disabled structures";
  for (const s of memMapUnUsedArray) {
    if (s.name !== RxBufferName){
      unusedReport += `\n${s.name.padEnd(14)}: unused         ` +
                      ` (${s.size.toString().padStart(4, " ")} byte)` +
                      ` elemNum=${s.elemNum.toString().padStart(2, " ")},` +
                      ` elemSize=${s.elemSize.toString().padStart(2, " ")} byte`;
    } else {
      // dedicated RX buffer => number of elements are implicitely configured via RX Filters that point to RX Buffers
      unusedReport += `\n${s.name.padEnd(14)}: unused         ` +
                   ` ( ??? byte)` +
                   ` elemNum=??,` +
                   ` elemSize=${s.elemSize.toString().padStart(2, " ")} byte\n` +
                   `                => assumed unused because RBSA=0 (Hint: elemNum unknown because configured indirectly via RX Filters)`;
    }
  }
  reg.memmap.report.push({
      severityLevel: sevC.info,
      msg: unusedReport
  });

  // Check for collisions
  let collisionReport = "";
  for (let i = 0; i < memMapUsedArray.length - 1; i++) {
    const a = memMapUsedArray[i];
    const b = memMapUsedArray[i + 1];
    if (a.endAddr >= b.startAddr) {
      collisionReport += `Collision: ${a.name} [0x${a.startAddr.toString(16).toUpperCase().padStart(6, "0")}-0x${a.endAddr.toString(16).toUpperCase().padStart(6, "0")}] overlaps with ` +
                                    `${b.name} [0x${b.startAddr.toString(16).toUpperCase().padStart(6, "0")}-0x${b.endAddr.toString(16).toUpperCase().padStart(6, "0")}]\n`;
    }
  }
  
  // Build & submit collision report, if existing
  if (collisionReport) {
    reg.memmap.report.push({
      severityLevel: sevC.error,
      msg: 'Message RAM Memory Map: Collisions detected\n' + collisionReport
    });
  } else {
    reg.memmap.report.push({
      severityLevel: sevC.calculation,
      msg: 'Message RAM Memory Map: no collisions detected'
    });
  }
}