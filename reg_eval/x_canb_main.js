// ===================================================================================
// X_CANB - Basic Implementation
// Main script for processing registers.
// ===================================================================================

import * as x_can_prt from './x_can_prt.js';
import { getBits } from './help_functions.js';
import { sevC } from './help_functions.js';
import { getBinaryLineData } from './help_functions.js';

// Strategy: No PREL version dependent PRT register decoding
//           => solved by simple approach: always decode all registers, even if bits not present in older versions

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
  procRegsPrtBitTimingExtraXCanB(reg);

  // c4) Process MRAM Control
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
  const registerString = `# X_CANB V0.8.0 example
# Format to use: 0xADDR 0xVALUE
# 0xADDR is internal module address
#        or global address (e.g. 32bit)
# MRAM CTRL ##########
0xA0000900 0x0501FC04
0xA0000904 0x00000000
0xA0000908 0x00000000
0xA000090C 0x00000000
0xA0000910 0x00000000
0xA0000914 0x00000000
0xA0000918 0x00000000
0xA000091C 0x00000000
0xA0001920 0x0501FC04
0xA0000924 0x00000000
0xA0000928 0x00000000
0xA000092C 0x00000000
0xA0000930 0x00000000
0xA0000934 0x00000000
0xA0000938 0x00000000
0xA000093C 0x00000000
0xA0000940 0x00000000
0xA0000944 0x00000000
0xA0000948 0x00000000
0xA000094C 0x00000000
0xA0000950 0x00000000
0xA0000954 0x00000000
0xA0000958 0x00000000
0xA000095C 0x00000000
0xA0000960 0x00000000
0xA0000964 0x00000000
0xA0000968 0x00000000
0xA000096C 0x00000000
0xA0000970 0x00000000
0xA0000974 0x00000000
0xA0000978 0x00000000
0xA000097C 0x00000000
0xA0000980 0x00000000
0xA0000984 0x00000000
0xA0000988 0x00000000
0xA000098C 0x00000000
0xA0000990 0x00000000
0xA0000994 0x00000000
0xA0000998 0x00000000
0xA000099C 0x00000000
0xA00009A0 0x00000000
0xA00009A4 0x00000000
0xA00009A8 0x00000000
0xA00009AC 0x00000000
0xA00009B0 0x00000000
0xA00009B4 0x00000000
0xA00009B8 0x00000000
0xA00009BC 0x00000000
0xA00009C0 0x00000000
0xA00009C4 0x00000000
0xA00009C8 0x00000000
0xA00009CC 0x00000000
0xA00009D0 0x00000000
0xA00009D4 0x00000000
0xA00009D8 0x00000000
0xA00009DC 0x00000000
0xA00009E0 0x00000000
0xA00009E4 0x00000000
0xA00009E8 0x00000000
0xA00009EC 0x00000000
0xA00009F0 0x00000000
0xA00009F4 0x00000000
0xA00009F8 0x00000000
0xA00009FC 0x00000000
# MH & IRC ###########
0xA0000A00 0x87654321
0xA0000A04 0x00000000
0xA0000A08 0x00000000
0xA0000A10 0x00000001
0xA0000A80 0x00001000
0xA0000A88 0x0000031F
# PRT ################
0xA0000C00 0x87654321
0xA0000C04 0x08050917
0xA0000C08 0x00000C11
0xA0000C20 0x00000100
0xA0000C44 0x00000000
0xA0000C48 0x00000000
0xA0000C4C 0x00000008
0xA0000C60 0x00000007
0xA0000C64 0x00FE3F3F
0xA0000C68 0x100F0E0E
0xA0000C6C 0x0A090808
0xA0000C70 0x00031700`;

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

  { lowerResAddr: 0x924, upperResAddr: 0x9FC }, // MRAM CTRL    (0x900...)

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

// ==================================================================================
// Process Extra Registers of Bit Fields of X_CANB
function procRegsPrtBitTimingExtraXCanB(reg) {

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
    reg.MODE.fields.TXSC = getBits(regValue, 31, 24);  // Transmit Traffic Shaping: Configuration
    reg.MODE.fields.TXSM = getBits(regValue, 23, 22);  // Transmit Traffic Shaping: Operating Mode
    reg.MODE.fields.EVAE = getBits(regValue, 21, 21);  // Transmit Traffic Shaping: Event Enable for Idle Bit
    reg.MODE.fields.EVBE = getBits(regValue, 20, 20);  // Transmit Traffic Shaping: Event Enable for Rx Started
    reg.MODE.fields.EVCE = getBits(regValue, 19, 19);  // Transmit Traffic Shaping: Event Enable for Rx Successful
    reg.MODE.fields.EV1E = getBits(regValue, 18, 18);  // Transmit Traffic Shaping: Event Enable for Tx Started
    reg.MODE.fields.EV2E = getBits(regValue, 17, 17);  // Transmit Traffic Shaping: Event Enable for Tx Error
    reg.MODE.fields.EV3E = getBits(regValue, 16, 16);  // Transmit Traffic Shaping: Event Enable for Tx Successful

    reg.MODE.fields.EAFF = getBits(regValue, 14, 14);  // Enable All Frame Formats
    reg.MODE.fields.TSSE = getBits(regValue, 13, 13);  // Transceiver Sharing Switch Mode Enable
    reg.MODE.fields.LCHB = getBits(regValue, 12, 12);  // CAN FD Light Commander High Bit Rate Mode

    // 2. Store MODE-related bit timing settings in general structure
    //   (no extra settings yet for X_CANB)

    // 3. Generate human-readable register report
    reg.MODE.report.push({
      severityLevel: sevC.info, // info
          msg: `MODE part 2: ${reg.MODE.name_long} (0x${reg.MODE.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')}) - X_CANB V0.8.0 and later\n` +
               `[TXSC] Tx Traffic Shaping Config (TX opportunities pause) = 0x${reg.MODE.fields.TXSC.toString(16).toUpperCase().padStart(2,'0')} (decimal: ${reg.MODE.fields.TXSC})\n` +
               `[TXSM] Tx Traffic Shaping Mode                            = ${reg.MODE.fields.TXSM} (` +
               `${reg.MODE.fields.TXSM === 0 ? 'Beacon Mode not active' :
                  reg.MODE.fields.TXSM === 1 ? 'Beacon is CBFF' :
                  reg.MODE.fields.TXSM === 2 ? 'Beacon is FBFF' :
                  reg.MODE.fields.TXSM === 3 ? 'Beacon is XLFF' : 'reserved'})\n` +
               `[EVAE] Tx Traffic Shaping: Event Enable for Idle Bit      = ${reg.MODE.fields.EVAE}\n` +
               `[EVBE] Tx Traffic Shaping: Event Enable for Rx Started    = ${reg.MODE.fields.EVBE}\n` +
               `[EVCE] Tx Traffic Shaping: Event Enable for Rx Successful = ${reg.MODE.fields.EVCE}\n` +
               `[EV1E] Tx Traffic Shaping: Event Enable for Tx Started    = ${reg.MODE.fields.EV1E}\n` +
               `[EV2E] Tx Traffic Shaping: Event Enable for Tx Error      = ${reg.MODE.fields.EV2E}\n` +
               `[EV3E] Tx Traffic Shaping: Event Enable for Tx Successful = ${reg.MODE.fields.EV3E}\n` +
               `[EAFF] Enable All Frame Formats                           = ${reg.MODE.fields.EAFF}\n` +
               `[TSSE] Transceiver Sharing Switch Enable                  = ${reg.MODE.fields.TSSE}\n` +
               `[LCHB] FD light Commander High Bit Rate mode              = ${reg.MODE.fields.LCHB}`
      });

      // Check: Traffic Shaping meaningful configuration?
      //   In "No Beacon" mode the following events for count-down should be configured
      //   EVAE = 1 (Idle Bit)
      //   EVBE = 1 (Rx Started)
      //   EV2E = 1 (Tx Error)
      //   EV3E = 1 (Tx Successful)
      if (reg.MODE.fields.TXSC > 0 && // TX Shaping active
          reg.MODE.fields.TXSM === 0  // No Beacon mode
          ) {
        if (reg.MODE.fields.EVAE === 1 && // ON  Idle Bit
            reg.MODE.fields.EVBE === 1 && // ON  Rx Started
            reg.MODE.fields.EVCE === 0 && // OFF Rx Successful
            reg.MODE.fields.EV1E === 0 && // OFF Tx Started
            reg.MODE.fields.EV2E === 1 && // ON  Tx Error
            reg.MODE.fields.EV3E === 1    // ON  Tx Successful
        ) {
            // meaningful configuration
        } else {
          // not meaningful configuration
          reg.MODE.report.push({
            severityLevel: sevC.warning, // warning
            msg: `TX Traffic Shaping: Configuration might not be optimal.\n` +
                  `  In "No Beacon" mode the following events are recommended to be enabled:\n` +
                  `    EVAE = 1 (Idle Bit)      [currently it is ${reg.MODE.fields.EVAE}]\n` +
                  `    EVBE = 1 (Rx Started)    [currently it is ${reg.MODE.fields.EVBE}]\n` +
                  `    EVCE = 0 (Rx Successful) [currently it is ${reg.MODE.fields.EVCE}]\n` +
                  `    EV1E = 0 (Tx Started)    [currently it is ${reg.MODE.fields.EV1E}]\n` +
                  `    EV2E = 1 (Tx Error)      [currently it is ${reg.MODE.fields.EV2E}]\n` +
                  `    EV3E = 1 (Tx Successful) [currently it is ${reg.MODE.fields.EV3E}]`
          });
        }
      }
  } // end if MODE

  // === PCFG: Extract the additional parameters from this register ==============
  if ('PCFG' in reg && reg.PCFG.int32 !== undefined && reg.PCFG.fields !== undefined) {
    const regValue = reg.PCFG.int32;

    // 0. Extend existing register structure
    if (reg.PCFG.fields === undefined) {
      reg.PCFG.fields = {}; 
    }
    if (reg.PCFG.report === undefined) {
      reg.PCFG.report = []; // Initialize report array
    }

    // 1. Decode all individual bits of PCFG register
    reg.PCFG.fields.BCID_28_19 = getBits(regValue, 31, 22); // BCID[28:19]
    reg.PCFG.fields.BCID_18    = getBits(regValue, 15, 15); // BCID[18] (LSB in PCFG)
    reg.PCFG.fields.BRRS       = getBits(regValue, 14, 14); // Beacon RRS bit
    reg.PCFG.fields.BCIE       = getBits(regValue, 7, 7);   // Enable BCID incl. RRS-bit
    reg.PCFG.fields.BCRE       = getBits(regValue, 6, 6);   // Any message with RRS=1 is Beacon

    // Helper: top 11 bits of BCID covered in PCFG (bits [28:19] and [18])
    reg.PCFG.fields.BCID_full = (reg.PCFG.fields.BCID_28_19 << 1) | reg.PCFG.fields.BCID_18;

    // 2. Store PWM settings in XL data structure
    reg.general.bt_xldata.set.pwm_offset = reg.PCFG.fields.PWMO;
    reg.general.bt_xldata.set.pwm_long = reg.PCFG.fields.PWML;
    reg.general.bt_xldata.set.pwm_short = reg.PCFG.fields.PWMS;

    // 3. Generate human-readable register report
    reg.PCFG.report.push({
      severityLevel: sevC.info, // info
        msg: `PCFG part 2: ${reg.PCFG.name_long} (0x${reg.PCFG.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')}) - X_CANB V0.8.0 and later\n` +
             `[BCID] Beacon ID [28:18] (11 bit)              = 0x${reg.PCFG.fields.BCID_full.toString(16).toUpperCase().padStart(3,'0')}\n` +
             `[BRRS] Beacon RRS bit                          = ${reg.PCFG.fields.BRRS}\n` +
             `[BCIE] Enable BCID with RRS bit match          = ${reg.PCFG.fields.BCIE} (${reg.PCFG.fields.BCIE ? 'BCID and BRRS must match' : 'only BCID must match CAN ID'})\n` +
             `[BCRE] Enable any message with RRS=1 as Beacon = ${reg.PCFG.fields.BCRE}`
    });

  } // end if PCFG

}

// ===================================================================================
// MRAM CTRL (MRAM Area for FIFO configuration)
function procMramCtrl(reg) {
  // Decode TX FIFO control words TF0..TF7
  // Decode RX FIFO control word  RF0

  // create fifo summary collection
  // Prepare summary collection for TX/RX FIFO queues
  let fifoSummaryRows = [];

  // FIFO decoder function
  function decodeFifo(fifoName) {
    if (!(fifoName in reg) || reg[fifoName].int32 === undefined) return;
    const v = reg[fifoName].int32 >>> 0;

    // 0. Extend structure
    reg[fifoName].fields = {};
    reg[fifoName].report = [];

    // 1. Extract fields (based on assumptions above)
    const RSV = getBits(v, 31, 31); // Reserved
    const EPI = getBits(v, 30, 26); // Element Put Index
    const FS  = getBits(v, 25, 21); // FIFO Size
    const EGI = getBits(v, 20, 16); // Element Get Index
    const DS  = getBits(v, 15, 10); // Data Size (encoded, value+1) in 8-word units
    const SA  = getBits(v,  9,  0); // Start Address (granularity: 16 words)

    reg[fifoName].fields = { SA, DS, EGI, EPI, RSV, FS };

    // 2. Derived metrics
    const byteAddr = SA * 16 * 4; // byte address in MRAM
    const isRx = fifoName.startsWith('RF');

    const payloadBytesPerElem = (DS + 1) * 8 * 4;   // DS is in 8-word granularity
    // TX: (2xHeader + 1xAcceptance + Data) -> words = 3 + (DS+1)*8
    // RX: (2xHeader + 2xTimeStamp + 1xAcceptance + Data) -> words = 5 + (DS+1)*8
    const elemSizeByte = (isRx ? (5*4) : (3*4)) + payloadBytesPerElem;

    const enabled = FS > 0;
    const fifoElements = enabled ? (FS + 1) : 0; // special case: FS=0 => disabled, 0 reserved
    const reservedBytes = fifoElements * elemSizeByte;

    // Fill level (runtime view), protect FS=0
    let fillLevel = 0;
    let statusTxt = enabled ? 'enabled' : 'disabled (FS=0)';
    let isEmpty = false;
    let isFull = false;

    if (enabled) {
      if (EPI === EGI) {
        fillLevel = 0; isEmpty = true;
      } else if (EPI > EGI) {
        fillLevel = EPI - EGI;
      } else /* EPI < EGI */ {
        fillLevel = ((FS + 1) - EGI) + EPI;
      }
      // Full when EPI == (EGI - 1) modulo (FS+1)
      const modulo = fifoElements;
      isFull = ((EPI + 1) % modulo) === EGI; // same as "EPI = EGI - 1" from manual
      if (isEmpty) statusTxt += ', empty';
      if (isFull) statusTxt += ', full';
    }

    // 3. Generate human-readable register report
    const nm = reg[fifoName].name_long;
    const header = `${fifoName}: ${nm} (0x${reg[fifoName].addr !== undefined ? reg[fifoName].addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})`;
    const body = [
      `[SA ] Start Address        = ${SA.toString(10).padEnd(5,' ')} (MRAM byte addr     = SA*16*4 byte)   = 0x${byteAddr.toString(16).toUpperCase().padStart(8,'0')}`,
      `[DS ] Data Size            = ${DS.toString(10).padEnd(5,' ')} (Elem. Payload size = (DS+1)*8*4 byte = ${payloadBytesPerElem} byte)`,
      `[EGI] Element Get Index    = ${EGI.toString(10).padEnd(5,' ')}`,
      `[EPI] Element Put Index    = ${EPI.toString(10).padEnd(5,' ')}`,
      `[FS ] FIFO Size            = ${FS.toString(10).padEnd(5,' ')} (${enabled ? `${fifoElements} elements used, max fill = ${FS})` : 'FIFO disabled, no elements reserved)'}`,
      `- FIFO Element Size [byte] = ${elemSizeByte.toString(10).padEnd(5,' ')} (= (3+(DS+1)*8)*4 byte)`,
      `- FIFO Size [byte]         = ${reservedBytes.toString(10).padEnd(5,' ')}`,
      `- Fill Level               = ${fillLevel}`,
      `- Status [ena/full/empty]  = ${statusTxt}`,
    ].join('\n');

    reg[fifoName].report.push({ severityLevel: sevC.info, msg: `${header}\n${body}` });

    // Basic validations
    const notes = [];
    if (enabled) {
      if (SA < 4) notes.push(`${fifoName} Start Address uses 0..3 which conflict with Control Partition — not allowed`);
      if (EPI > FS) notes.push(`${fifoName} EPI (${EPI}) exceeds FS (${FS})`);
      if (EGI > FS) notes.push(`${fifoName} EGI (${EGI}) exceeds FS (${FS})`);
    }

    for (const n of notes) {
      reg[fifoName].report.push({ severityLevel: sevC.error, msg: `${fifoName}: ${n}` });
    }

    // 4. Collect summary row
    fifoSummaryRows.push({
      name: fifoName,
      saByte: byteAddr,
      enabled: enabled ? 1 : 0,
      sizeElem: enabled ? fifoElements : null,
      maxFill: enabled ? FS : null,
      totalBytes: enabled ? reservedBytes : null,
      elemSizeBytes: enabled ? elemSizeByte : null,
      dsVal: enabled ? DS : null,
      dsBytes: enabled ? payloadBytesPerElem : null,
      epi: enabled ? EPI : null,
      egi: enabled ? EGI : null,
      full: enabled ? (isFull ? 1 : 0) : null,
      empty: enabled ? (isEmpty ? 1 : 0) : null,
      isRx
    });
  };

  // decode TX FIFOs
  for (let i = 0; i < 8; i++) {
    decodeFifo(`TF${i}`);
  }
  // decode RX FIFO
  decodeFifo(`RF0`);

  // Add FIFO summary report (TX and RX combined)
  {
    // helper to format numbers or '-' and hex addresses
    const fmtDash = (v, padBy) => (v === null || v === undefined ? '-'.padStart(padBy,' ') : String(v).padStart(padBy,' '));
    const fmtNum = (v, w) => (v === null || v === undefined ? '-'.padStart(w,' ') : String(v).padStart(w,' '));
    const fmtHex = (v, padBy) => `0x${(v >>> 0).toString(16).toUpperCase().padStart(padBy,'0')}`;

  // Use natural decoding order (no sorting)
  const rows = Array.isArray(fifoSummaryRows) ? fifoSummaryRows : [];

    // Build summary text
    const indent = '      ';
    const header = [
      `TX/RX FIFO Queues Summary`,
      `${indent}FIFO  SA      Ena  Size    Max Fill  Size    Elem Size  DS  DS      EPI  EGI  full  empty`,
      `${indent}      [byte]       [Elem]  [Elem]    [byte]  [byte]         [byte]   `,
      `${indent}----------------------------------------------------------------------------------------------`
    ].join('\n');

    const lines = rows.map(r => {
      const sa = fmtHex(r.saByte, 4);
      const ena = r.enabled ? 1 : 0;
      const sizeElem = fmtDash(r.sizeElem, 2);
      const maxFill = fmtDash(r.maxFill, 2);
      const totalB = fmtDash(r.totalBytes, 5);
      const elemB = fmtDash(r.elemSizeBytes, 4);
      const dsVal = fmtDash(r.dsVal, 2);
      const dsB = fmtDash(r.dsBytes, 4);
      const epi = fmtDash(r.epi, 2);
      const egi = fmtDash(r.egi, 2);
  const full = fmtDash(r.full, 1);
  const empty = fmtDash(r.empty, 1);

      // spacing tuned to resemble provided example
      return `${indent}${r.name.padEnd(4,' ')}  ${sa}  ${String(ena)}    ${String(sizeElem)}       ${String(maxFill)}       ${String(totalB)}   ${String(elemB)}       ${String(dsVal)}  ${String(dsB)}    ${String(epi)}   ${String(egi)}   ${String(full)}     ${String(empty)}`;
    }).join('\n');

    const summaryMsg = `${header}\n${lines}`;

    // Attach summary to the last available FIFO (prefer later entries)
    let attachTo = null;
    for (let i = rows.length - 1; i >= 0; i--) {
      const name = rows[i].name;
      if (reg[name] && Array.isArray(reg[name].report)) { attachTo = name; break; }
    }
    if (attachTo) {
      reg[attachTo].report.push({ severityLevel: sevC.infoHighlighted, msg: summaryMsg });
    }
  }
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