// ===================================================================================
// X_CANB - Basic Implementation
// Main script for processing registers.
// ===================================================================================

import * as x_can_prt from './x_can_prt.js';
import { getBits } from './help_functions.js';
import { sevC } from './help_functions.js';
import { getBinaryLineData } from './help_functions.js';

// TODO: add PREL version dependent PRT register decoding

// ===================================================================================
// X_CAN: Process User Register Values: parse, validate, calculate results, generate report
export function processRegs(reg) {

  // HINT: X_CAN & X_CANB use same PRT, so they have the same PRT registers.
  //       But X_CANB got over time some more configuration bits in some registers!

  // c1) Process PRT: Bit Timing registers
  x_can_prt.procRegsPrtBitTiming(reg); // ATTENTION: X_CAN decoding used for X_CANB as well!
    
  // c2) Process PRT: Other registers
  x_can_prt.procRegsPrtOther(reg);

  // c3) Process PRT: additional fields in X_CANB PRT registers
  // TODO: process additional PRT Register Fields for X_CANB

  // c4) Process MRAM Control
  // TODO
  procMramCtrl(reg);

  // c5) Process MH Global registers (VERSION, MH_CTRL, MH_CFG)
  procRegsMh(reg);

  // c6) Process IR registers
  procRegsIrc(reg); 
}

// ==================================================================================
// Example Register Values for X_CAN PRT
export function loadExampleRegisterValues() {
  const clock = 160;
  const registerString = `# X_CANB V0.5.4 example
# Format to use: 0xADDR 0xVALUE
# 0xADDR is internal module address
#        or global address (e.g. 32bit)
# MRAM CTRL ##########
0xA0020900 0x00000000
0xA0020904 0x00000000
0xA0020908 0x00000000
0xA002090C 0x00000000
0xA0020910 0x00000000
0xA0020914 0x00000000
0xA0020918 0x00000000
0xA002091C 0x00000000
0xA0020920 0x00000000
# MH & IRC ###########
0xA0020A00 0x87654321
0xA0020A04 0x00000000
0xA0020A08 0x00000000
0xA0020A0C 0x00000000
0xA0020A10 0x00000000
0xA0020A80 0x00000206
0xA0020A84 0x00000000
0xA0020A88 0x00000777
# PRT ################
0xA0020C00 0x87654321
0xA0020C04 0x05410817
0xA0020C08 0x00000C11
# reserved from here
0xA0020C0C 0x00000000
0xA0020C10 0x00000000
0xA0020C14 0x00000000
0xA0020C18 0x00000000
0xA0020C1C 0x00000000
# reserved up to here
0xA0020C20 0x00000100
# reserved from here
0xA0020C24 0x00000000
0xA0020C28 0x00000000
0xA0020C2C 0x00000000
0xA0020C30 0x00000000
0xA0020C34 0x00000000
0xA0020C38 0x00000000
0xA0020C3C 0x00000000
# reserved up to here
0xA0020C40 0x00000000
0xA0020C44 0x00000000
0xA0020C48 0x00000000
0xA0020C4c 0x00000008
0xA0020C60 0x00000007
0xA0020C64 0x00FE3F3F
0xA0020C68 0x28272626
0xA0020C6c 0x0A090808
0xA0020C70 0x00000C04`;

return {exampleRegisterValues: registerString, clockFrequency: clock};
}

// Address Mask to be able to consider the local address bits
export const regLocalAddrMask = 0x00000FFF; // 12 LSBit are the X_CANB local address bits

// Address to register name mapping (masked with 0xFFF local X_CANB address)
export const regAddrMap = {
  // ====== MRAM CONTROL =======
  0x900: { shortName: 'TF0', longName: 'TX FIFO 0 [in MRAM Control area, No register]' },
  0x904: { shortName: 'TF1', longName: 'TX FIFO 1 [in MRAM Control area, No register]' },
  0x908: { shortName: 'TF2', longName: 'TX FIFO 2 [in MRAM Control area, No register]' },
  0x90C: { shortName: 'TF3', longName: 'TX FIFO 3 [in MRAM Control area, No register]' },
  0x910: { shortName: 'TF4', longName: 'TX FIFO 4 [in MRAM Control area, No register]' },
  0x914: { shortName: 'TF5', longName: 'TX FIFO 5 [in MRAM Control area, No register]' },
  0x918: { shortName: 'TF6', longName: 'TX FIFO 6 [in MRAM Control area, No register]' },
  0x91C: { shortName: 'TF7', longName: 'TX FIFO 7 [in MRAM Control area, No register]' },
  0x920: { shortName: 'RF0', longName: 'RX FIFO 0 [in MRAM Control area, No register]' },
  // ====== MH & IRC =======
  0xA00: { shortName: 'ENDN_MH', longName: 'Endianness Test Register' },
  0xA04: { shortName: 'HDP',     longName: 'Hardware Debug Port Register' },
  0xA08: { shortName: 'STATUS',  longName: 'Message Handler Status Register' },
  0xA0C: { shortName: 'QCR',     longName: 'Queuing Control Register' },
  0xA10: { shortName: 'TCR',     longName: 'Transmission Control Register' },
  0xA80: { shortName: 'IRC_RAW', longName: 'Interrupt Controller Raw Status Register' },
  0xA84: { shortName: 'IRC_CLR', longName: 'Interrupt Controller Raw Status Clear Register' },
  0xA88: { shortName: 'IRC_ENA', longName: 'Interrupt Controller Enable Register' },
  // ====== PRT ======
  0xC00: { shortName: 'ENDN', longName: 'Endianness Test Register' },
  0xC04: { shortName: 'PREL', longName: 'PRT Release Identification Register' },
  0xC08: { shortName: 'STAT', longName: 'PRT Status Register' },
  0xC20: { shortName: 'EVNT', longName: 'Event Status Flags Register' },
  0xC40: { shortName: 'LOCK', longName: 'Unlock Sequence Register' },
  0xC44: { shortName: 'CTRL', longName: 'Control Register' },
  0xC48: { shortName: 'FIMC', longName: 'Fault Injection Module Control Register' },
  0xC4C: { shortName: 'TEST', longName: 'Hardware Test functions Register' },
  0xC60: { shortName: 'MODE', longName: 'Operating Mode Register' },
  0xC64: { shortName: 'NBTP', longName: 'Arbitration Phase Nominal Bit Timing Register' },
  0xC68: { shortName: 'DBTP', longName: 'CAN FD Data Phase Bit Timing Register' },
  0xC6C: { shortName: 'XBTP', longName: 'CAN XL Data Phase Bit Timing Register' },
  0xC70: { shortName: 'PCFG', longName: 'PWME Configuration Register' },
};

// Reserved Address Array: list reserved addresses in M_CAN address range (inclusive, word-aligned step = 4 bytes)
export const resAddrArray = [
  { lowerResAddr: 0x000, upperResAddr: 0x8FC }, // Virtual Buffers (feels like reserved)  (0x000...) 

  { lowerResAddr: 0x924, upperResAddr: 0x97C }, // MRAM CTRL    (0x900...)

  { lowerResAddr: 0xA14, upperResAddr: 0xA7C }, // MH           (0xA00...)
  { lowerResAddr: 0xA8C, upperResAddr: 0xAFC }, // IRC          (0xA80...)

  { lowerResAddr: 0xB00, upperResAddr: 0xBFC }, // reserved     (0xB00...)

  { lowerResAddr: 0xC0C, upperResAddr: 0xC1C }, // PRT Part 1   (0x900...)
  { lowerResAddr: 0xC24, upperResAddr: 0xC3C }, // PRT Part 2   (0x900...)
  { lowerResAddr: 0xC50, upperResAddr: 0xC5C }, // PRT Part 3   (0x900...)
  { lowerResAddr: 0xC74, upperResAddr: 0xCFC }, // PRT Part 4   (0x900...)

  { lowerResAddr: 0xD00, upperResAddr: 0xFFC }  // after PRT up to 2^12 bit
];

// ==== Exported Funktions/Structures up to here =====================================
// ===================================================================================

// ===================================================================================
// MRAM CTRL (MRAM Area for FIFO configuration)
function procMramCtrl(reg) {
  // TODO
}

// ===================================================================================
// MH registers
function procRegsMh(reg) {
  // === ENDN_MH: Endianness Test Register ================================
  if ('ENDN_MH' in reg && reg.ENDN_MH.int32 !== undefined) {
    const regValue = reg.ENDN_MH.int32 >>> 0;
    
    // 0. Extend existing register structure
    reg.ENDN_MH.fields = {};
    reg.ENDN_MH.report = []; // Initialize report array

    // 1. Decode ENDN register (simple 32-bit value)
    reg.ENDN_MH.fields.ETV = regValue;

    // 2. Generate human-readable register report
    if (regValue === 0x87654321) {
      reg.ENDN_MH.report.push({
        severityLevel: sevC.info,
        msg: `ENDN_MH: ${reg.ENDN_MH.name_long} (0x${reg.ENDN_MH.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[ETV] Endianness Test Value = 0x${regValue.toString(16).toUpperCase().padStart(8,'0')} (Correct)`
      });
    } else {
      reg.ENDN_MH.report.push({
        severityLevel: sevC.error,
        msg: `ENDN_MH: ${reg.ENDN_MH.name_long} (0x${reg.ENDN_MH.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[ETV] Endianness Test Value = 0x${regValue.toString(16).toUpperCase().padStart(8,'0')} (Expected: 0x87654321)`
      });
    }
  }

  // === HDP: Hardware Debug Port Register ===============================
  if ('HDP' in reg && reg.HDP.int32 !== undefined) {
    const regValue = reg.HDP.int32 >>> 0;

    // 0. Extend existing register structure
    reg.HDP.fields = {};
    reg.HDP.report = []; // Initialize report array

    // 1. Decode used bits of register
    reg.HDP.fields.HDP_SEL = getBits(regValue, 2, 0);

    // 2. Generate human-readable register report
    const sel = reg.HDP.fields.HDP_SEL;
    const selDesc = (sel === 0)
      ? 'clamp HDP[15:0] to 0'
      : (sel >= 1 && sel <= 3)
        ? `selected signal set ${sel}`
        : 'reserved/implementation-specific';

    reg.HDP.report.push({
      severityLevel: sevC.info,
      msg: `HDP: ${reg.HDP.name_long} (0x${reg.HDP.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[HDP_SEL] Select = ${sel} (= ${selDesc})`
    });
  }

  // === STATUS: Message Handler Status Register =========================
  if ('STATUS' in reg && reg.STATUS.int32 !== undefined) {
    const regValue = reg.STATUS.int32 >>> 0;

    // 0. Extend existing register structure
    reg.STATUS.fields = {};
    reg.STATUS.report = []; // Initialize report array

    // 1. Decode used bits of register
    reg.STATUS.fields.TMH_FIFO = getBits(regValue, 14, 12);
    reg.STATUS.fields.TMH_LEC  = getBits(regValue, 9, 8);
    reg.STATUS.fields.RMH_LEC  = getBits(regValue, 2, 0);

    // 2. Generate human-readable register report
    const tmhLec = reg.STATUS.fields.TMH_LEC;
    const rmhLec = reg.STATUS.fields.RMH_LEC;
    const tmhLecDesc = (
      tmhLec === 0 ? 'TX message successfully transmitted' :
      tmhLec === 1 ? 'TX message discarded due to CAN bus error (only possible if TCR.RET = 0)' :
      tmhLec === 2 ? 'TX message discarded due to IFF (Illegal Frame Format)' :
      tmhLec === 3 ? 'TX message discarded due to unexpected TMH error' :
      'reserved'
    );
    const rmhLecDesc = (
      rmhLec === 0 ? 'RX message successfully attached to RX FIFO' :
      rmhLec === 1 ? 'RX message discarded due to CAN bus error' :
      rmhLec === 2 ? 'RX message discarded due to Data Overrun at RX_MSG interface' :
      rmhLec === 3 ? 'RX message discarded because RX_FIFO is disabled' :
      rmhLec === 4 ? 'RX message discarded because RX_FIFO is full' :
      rmhLec === 5 ? 'RX message discarded because RX_FIFO element size is too small' :
      'reserved'
    );
    reg.STATUS.report.push({
      severityLevel: sevC.info,
      msg: `STATUS: ${reg.STATUS.name_long} (0x${reg.STATUS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TMH_FIFO] TX FIFO number for TMH_LEC = ${reg.STATUS.fields.TMH_FIFO}\n` +
           `[TMH_LEC ] TX Last Error Code         = ${tmhLec} (${tmhLecDesc})\n` +
           `[RMH_LEC ] RX Last Error Code         = ${rmhLec} (${rmhLecDesc})`
    });
  }

  // === QCR: Queuing Control Register ===================================
  if ('QCR' in reg && reg.QCR.int32 !== undefined) {
    const regValue = reg.QCR.int32 >>> 0;

    // 0. Extend existing register structure
    reg.QCR.fields = {};
    reg.QCR.report = []; // Initialize report array

    // 1. Decode used bits of register
    reg.QCR.fields.CMD = getBits(regValue, 1, 0);

    // 2. Generate human-readable register report
    reg.QCR.report.push({
      severityLevel: sevC.info,
      msg: `QCR: ${reg.QCR.name_long} (0x${reg.QCR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[CMD] Queuing Command = ${reg.QCR.fields.CMD} (Note: Register is write-only; readback value may be undefined.)`
    });
  }

  // === TCR: Transmission Control Register ===============================
  if ('TCR' in reg && reg.TCR.int32 !== undefined) {
    const regValue = reg.TCR.int32 >>> 0;

    // 0. Extend existing register structure
    reg.TCR.fields = {};
    reg.TCR.report = []; // Initialize report array

    // 1. Decode used bits of register
    reg.TCR.fields.RET = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.TCR.report.push({
      severityLevel: sevC.info,
      msg: `TCR: ${reg.TCR.name_long} (0x${reg.TCR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[RET] Retransmission = ${reg.TCR.fields.RET} (= ` +
           `${reg.TCR.fields.RET ? 'unlimited times' : 'no retransmission'})`
    });
  }
}

// ===================================================================================
// IRC registers
function procRegsIrc(reg) {
  // Helper for summary formatting
  const defs = [
    {bit:28, key:'IFS_ERR',       desc:'Illegal FIFO Status Error (MH)'},
    {bit:27, key:'IAS_ERR',       desc:'Illegal Addressing Sequence Error (MH)'},
    {bit:26, key:'IRA_ERR',       desc:'Illegal Read Access Error (MH)'},
    {bit:25, key:'IWA_ERR',       desc:'Illegal Write Access Error (MH)'},
    {bit:24, key:'NSA_ERR',       desc:'Not Start Address (MH)'},
    {bit:20, key:'ABORTED',       desc:'TX_MSG Sequence Aborted (PRT)'},
    {bit:19, key:'IFF_RQ',        desc:'Invalid Frame Format Requested (PRT)'},
    {bit:18, key:'USOS',          desc:'Unexpected Start of Sequence (PRT)'},
    {bit:17, key:'TX_DU',         desc:'Data Underrun (PRT)'},
    {bit:16, key:'RX_DO',         desc:'Data Overflow (PRT)'},
    {bit:13, key:'TMH_ERR',       desc:'Transmit Message Handler - Error (MH)'},
    {bit:12, key:'TMH_ACK',       desc:'Transmit Message Handler - Acknowledge (MH)'},
    {bit:11, key:'RMH_ERR',       desc:'Receive Message Handler - Error (MH)'},
    {bit:10, key:'RMH_ACK',       desc:'Receive Message Handler - Acknowledge (MH)'},
    {bit: 9, key:'TX_EVT',        desc:'TX Event (PRT)'},
    {bit: 8, key:'RX_EVT',        desc:'RX Event (PRT)'},
    {bit: 4, key:'BUS_ERR',       desc:'CAN Bus Error (PRT)'},
    {bit: 3, key:'E_ACTIVE',      desc:'Error Active (PRT)'},
    {bit: 2, key:'E_PASSIVE',     desc:'Error Passive (PRT)'},
    {bit: 1, key:'BUS_ON',        desc:'CAN Bus On (PRT)'},
    {bit: 0, key:'BUS_OFF',       desc:'CAN Bus Off (PRT)'}
  ];

  // === IRC_RAW: Raw Status Register ======================================
  if ('IRC_RAW' in reg && reg.IRC_RAW.int32 !== undefined) {
    const regValue = reg.IRC_RAW.int32 >>> 0;

    // 0. Extend structure
    reg.IRC_RAW.fields = {};
    reg.IRC_RAW.report = [];

    // 1. Decode defined bits
    for (const d of defs) {
      reg.IRC_RAW.fields[d.key] = getBits(regValue, d.bit, d.bit);
    }

    // 2. Generate human-readable register report
    reg.IRC_RAW.report.push({
      severityLevel: sevC.info,
      msg: `IRC_RAW: ${reg.IRC_RAW.name_long} (0x${reg.IRC_RAW.addr !== undefined ? reg.IRC_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -        ] Reserved                                    = - \n`+
           `[30 -        ] Reserved                                    = - \n`+
           `[29 -        ] Reserved                                    = - \n`+
           `[28 IFS_ERR  ] ${defs.find(d=>d.key==='IFS_ERR').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.IFS_ERR}\n`+
           `[27 IAS_ERR  ] ${defs.find(d=>d.key==='IAS_ERR').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.IAS_ERR}\n`+
           `[26 IRA_ERR  ] ${defs.find(d=>d.key==='IRA_ERR').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.IRA_ERR}\n`+
           `[25 IWA_ERR  ] ${defs.find(d=>d.key==='IWA_ERR').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.IWA_ERR}\n`+
           `[24 NSA_ERR  ] ${defs.find(d=>d.key==='NSA_ERR').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.NSA_ERR}\n`+
           `[23 -        ] Reserved                                    = - \n`+
           `[22 -        ] Reserved                                    = - \n`+
           `[21 -        ] Reserved                                    = - \n`+
           `[20 ABORTED  ] ${defs.find(d=>d.key==='ABORTED').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.ABORTED}\n`+
           `[19 IFF_RQ   ] ${defs.find(d=>d.key==='IFF_RQ').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.IFF_RQ}\n`+
           `[18 USOS     ] ${defs.find(d=>d.key==='USOS').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.USOS}\n`+
           `[17 TX_DU    ] ${defs.find(d=>d.key==='TX_DU').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.TX_DU}\n`+
           `[16 RX_DO    ] ${defs.find(d=>d.key==='RX_DO').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.RX_DO}\n`+
           `[15 -        ] Reserved                                    = - \n`+
           `[14 -        ] Reserved                                    = - \n`+
           `[13 TMH_ERR  ] ${defs.find(d=>d.key==='TMH_ERR').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.TMH_ERR}\n`+
           `[12 TMH_ACK  ] ${defs.find(d=>d.key==='TMH_ACK').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.TMH_ACK}\n`+
           `[11 RMH_ERR  ] ${defs.find(d=>d.key==='RMH_ERR').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.RMH_ERR}\n`+
           `[10 RMH_ACK  ] ${defs.find(d=>d.key==='RMH_ACK').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.RMH_ACK}\n`+
           `[ 9 TX_EVT   ] ${defs.find(d=>d.key==='TX_EVT').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.TX_EVT}\n`+
           `[ 8 RX_EVT   ] ${defs.find(d=>d.key==='RX_EVT').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.RX_EVT}\n`+
           `[ 7 -        ] Reserved                                    = - \n`+
           `[ 6 -        ] Reserved                                    = - \n`+
           `[ 5 -        ] Reserved                                    = - \n`+
           `[ 4 BUS_ERR  ] ${defs.find(d=>d.key==='BUS_ERR').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.BUS_ERR}\n`+
           `[ 3 E_ACTIVE ] ${defs.find(d=>d.key==='E_ACTIVE').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.E_ACTIVE}\n`+
           `[ 2 E_PASSIVE] ${defs.find(d=>d.key==='E_PASSIVE').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.E_PASSIVE}\n`+
           `[ 1 BUS_ON   ] ${defs.find(d=>d.key==='BUS_ON').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.BUS_ON}\n`+
           `[ 0 BUS_OFF  ] ${defs.find(d=>d.key==='BUS_OFF').desc.padEnd(43,' ')} = ${reg.IRC_RAW.fields.BUS_OFF}`
    });
  }

  // === IRC_CLR: Raw Status Clear Register (write-only) ===================
  if ('IRC_CLR' in reg && reg.IRC_CLR.int32 !== undefined) {
    const v = reg.IRC_CLR.int32 >>> 0;

    // 0. Extend structure
    reg.IRC_CLR.fields = {};
    reg.IRC_CLR.report = [];

    // 1. Decode defined bits
    // decoding makes no sense, because it is a Write-Only register
    reg.IRC_CLR.fields.BITS = v;

    // 2. Generate human-readable register report
    reg.IRC_CLR.report.push({
      severityLevel: sevC.info,
      msg: `IRC_CLR: ${reg.IRC_CLR.name_long} (0x${reg.IRC_CLR.addr !== undefined ? reg.IRC_CLR.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})`
    });

    // 3. Check values
    if (v !== 0) {
      reg.IRC_CLR.report.push({
        severityLevel: sevC.warning,
        msg: `IRC_CLR: read-value (0x${v.toString(16).toUpperCase().padStart(8,'0')}) should be = 0..0!`
      });
    }
  }

  // === IRC_ENA: Interrupt Enable Register ===============================
  if ('IRC_ENA' in reg && reg.IRC_ENA.int32 !== undefined) {
    const v = reg.IRC_ENA.int32 >>> 0;

    // 0. Extend structure
    reg.IRC_ENA.fields = {};
    reg.IRC_ENA.report = []; // Initialize report array

    // 1. Decode bits individually
    for (const d of defs) {
      reg.IRC_ENA.fields[d.key] = getBits(v, d.bit, d.bit);
    }

    // 2. Generate human-readable register report
    reg.IRC_ENA.report.push({
      severityLevel: sevC.info,
      msg: `IRC_ENA: ${reg.IRC_ENA.name_long} (0x${reg.IRC_ENA.addr !== undefined ? reg.IRC_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -        ] Reserved                                    = - \n`+
           `[30 -        ] Reserved                                    = - \n`+
           `[29 -        ] Reserved                                    = - \n`+
           `[28 IFS_ERR  ] ${defs.find(d=>d.key==='IFS_ERR').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.IFS_ERR}\n`+
           `[27 IAS_ERR  ] ${defs.find(d=>d.key==='IAS_ERR').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.IAS_ERR}\n`+
           `[26 IRA_ERR  ] ${defs.find(d=>d.key==='IRA_ERR').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.IRA_ERR}\n`+
           `[25 IWA_ERR  ] ${defs.find(d=>d.key==='IWA_ERR').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.IWA_ERR}\n`+
           `[24 NSA_ERR  ] ${defs.find(d=>d.key==='NSA_ERR').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.NSA_ERR}\n`+
           `[23 -        ] Reserved                                    = - \n`+
           `[22 -        ] Reserved                                    = - \n`+
           `[21 -        ] Reserved                                    = - \n`+
           `[20 ABORTED  ] ${defs.find(d=>d.key==='ABORTED').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.ABORTED}\n`+
           `[19 IFF_RQ   ] ${defs.find(d=>d.key==='IFF_RQ').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.IFF_RQ}\n`+
           `[18 USOS     ] ${defs.find(d=>d.key==='USOS').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.USOS}\n`+
           `[17 TX_DU    ] ${defs.find(d=>d.key==='TX_DU').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.TX_DU}\n`+
           `[16 RX_DO    ] ${defs.find(d=>d.key==='RX_DO').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.RX_DO}\n`+
           `[15 -        ] Reserved                                    = - \n`+
           `[14 -        ] Reserved                                    = - \n`+
           `[13 TMH_ERR  ] ${defs.find(d=>d.key==='TMH_ERR').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.TMH_ERR}\n`+
           `[12 TMH_ACK  ] ${defs.find(d=>d.key==='TMH_ACK').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.TMH_ACK}\n`+
           `[11 RMH_ERR  ] ${defs.find(d=>d.key==='RMH_ERR').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.RMH_ERR}\n`+
           `[10 RMH_ACK  ] ${defs.find(d=>d.key==='RMH_ACK').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.RMH_ACK}\n`+
           `[ 9 TX_EVT   ] ${defs.find(d=>d.key==='TX_EVT').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.TX_EVT}\n`+
           `[ 8 RX_EVT   ] ${defs.find(d=>d.key==='RX_EVT').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.RX_EVT}\n`+
           `[ 7 -        ] Reserved                                    = - \n`+
           `[ 6 -        ] Reserved                                    = - \n`+
           `[ 5 -        ] Reserved                                    = - \n`+
           `[ 4 BUS_ERR  ] ${defs.find(d=>d.key==='BUS_ERR').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.BUS_ERR}\n`+
           `[ 3 E_ACTIVE ] ${defs.find(d=>d.key==='E_ACTIVE').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.E_ACTIVE}\n`+
           `[ 2 E_PASSIVE] ${defs.find(d=>d.key==='E_PASSIVE').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.E_PASSIVE}\n`+
           `[ 1 BUS_ON   ] ${defs.find(d=>d.key==='BUS_ON').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.BUS_ON}\n`+
           `[ 0 BUS_OFF  ] ${defs.find(d=>d.key==='BUS_OFF').desc.padEnd(43,' ')} = ${reg.IRC_ENA.fields.BUS_OFF}`
    });
  }

  // === IRC Interrupt Summary (enabled only) ==============================
  if (reg.IRC_RAW && reg.IRC_RAW.fields && reg.IRC_ENA && reg.IRC_ENA.fields) {
    const enabled = defs.filter(d => reg.IRC_ENA.fields[d.key] === 1);
    const nameWidth = enabled.length ? Math.max(4, ...enabled.map(e => e.key.length)) : 4;
    let lines;
    if (enabled.length === 0) {
      lines = 'No IRC interrupts enabled (all ENA bits = 0)';
    } else {
      lines = enabled.map(d => {
        const rawV = reg.IRC_RAW.fields[d.key];
        const enaV = reg.IRC_ENA.fields[d.key];
        return `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidth,' ')}  ${String(rawV)}   ${String(enaV)}`;
      }).join('\n');
    }
    reg.IRC_ENA.report.push({
      severityLevel: sevC.infoHighlighted,
      msg: `IRC Interrupt Summary (only enabled IRs)\n` +
           `Bit  Name${' '.repeat(nameWidth-4)}  RAW ENA\n` +
           `${lines}`
    });
  }
}