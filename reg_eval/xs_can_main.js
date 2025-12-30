// ===================================================================================
// XS_CAN
// Main script for processing registers.
// ===================================================================================

import * as x_can_prt from './x_can_prt.js';
import * as xs_can_prt from './xs_can_prt.js';
import * as xs_can_mh  from './xs_can_mh.js';
import * as xs_can_irc from './xs_can_irc.js';

// ===================================================================================
// X_CAN: Process User Register Values: parse, validate, calculate results, generate report
export function processRegs(reg) {

  // XS_CAN Part is X_CAN PRT + small additionss
  // Process Bit Timing registers: Part 1: X_CAN PRT
  x_can_prt.procRegsPrtBitTiming(reg);
  
  // Process Other PRT registers
  x_can_prt.procRegsPrtOther(reg);

  // Process Bit Timing registers: Part 1: X_CAN PRT
  xs_can_prt.procRegsPrtExtraXsCan(reg);

  // Process MH Global registers (VERSION, MH_CTRL, MH_CFG)
  xs_can_mh.procRegsMhGlobal(reg);

  // Process MH TX FIFO Queue registers
  xs_can_mh.procRegsMhTXFQ(reg);

  // Process MH TX Priority Queue registers
  xs_can_mh.procRegsMhTXPQ(reg);

  // Process MH TX Event FIFO registers
  xs_can_mh.procRegsMhTEFQ(reg);

  // Process MH CTM registers
  xs_can_mh.procRegsMhCTM(reg);

  // Process MH RX FIFO Queue registers
  xs_can_mh.procRegsMhRXFQ(reg);

  // Process Debug CTRL and Status registers
  xs_can_mh.procRegsMhDebug(reg);

  // Build MH Queue Overview Table
  xs_can_mh.buildQueuesSummary(reg);

  // Process IR CTRL and Status registers
  xs_can_irc.procRegsIRC(reg); 
}

// ==================================================================================
// Example Register Values for X_CAN PRT
export function loadExampleRegisterValues() {
  const clock = 160;
  const registerString = `# XS_CAN V1.0.0 example
# Format to use: 0xADDR 0xVALUE
# 0xADDR is internal module address
#        or global address (e.g. 32bit)
# Example contains intentional errors
# MH ################
0xA0480000 0x00000100
0xA0480004 0x00000001
0xA0480008 0x0007011F
0xA048000c 0x00000003
0xA0480010 0x00000000
0xA0480014 0x00000000
0xA0480018 0x1fff0000
0xA048001c 0x000001A1
0xA0480020 0x00000000
0xA0480100 0x00000240
0xA0480104 0x00002200
0xA0480108 0x00000000
0xA048010c 0x00000021
0xA0480110 0x00000008
0xA0480114 0x00000008
0xA0480200 0x00008011
0xA0480204 0x00000000
0xA0480208 0x00000000
0xA048020c 0x00002280
0xA0480210 0x00000000
0xA0480300 0x00004480
0xA0480304 0x00000010
0xA0480308 0x00000000
0xA048030c 0x00000000
0xA0480310 0x00000000
0xA0480400 0x000045C0
0xA0480404 0x00000000
0xA0480408 0x00000000
0xA048040c 0x00000000
0xA0480500 0x00005240
0xA0480504 0x00006200
0xA0480508 0x00000010
0xA048050c 0x00000010
0xA0480510 0x00005240
0xA0480514 0x00006240
0xA0480518 0x00007200
0xA048051c 0x00000000
0xA0480520 0x00000000
0xA0480524 0x00000000
0xA0480528 0x00000000
0xA0480600 0x00000000
0xA0480604 0x00000000
0xA0480608 0x00000000
0xA048060c 0x00000000
# PRT ###############
0xA0480900 0x87654321
0xA0480904 0x00000011
0xA0480908 0x00000000
0xA048090c 0x00000001
0xA0480920 0x00000100
0xA0480948 0x00000000
0xA048094c 0x00000008
0xA0480960 0x00000007
0xA0480964 0x00fe3f3f
0xA0480968 0x100f0e0e
0xA048096c 0x0a090808
0xA0480970 0x00000000
# IRC ###############
0xA0480A00 0x00000001
0xA0480A04 0x00000000
0xA0480A08 0x00400000
0xA0480A0c 0x00000000
0xA0480A20 0x00010000
0xA0480A24 0x00000000
0xA0480A28 0x00040000
0xA0480A2c 0x00000000
0xA0480A30 0x00000007
0xA0480A40 0x00000000`;

return {exampleRegisterValues: registerString, clockFrequency: clock};
}

// Address Mask to be able to consider the local address bits
export const regLocalAddrMask = 0x00000FFF; // 12 LSBit are the X_CAN local address bits

// Address to register name mapping (masked with 0xFFF local X_CAN address)
export const regAddrMap = {
  // ====== MH: Global ======
  0x000: { shortName: 'XSCAN_VERSION', longName: 'Release Identification Register' },
  0x004: { shortName: 'MH_CTRL', longName: 'Message Handler Control Register' },
  0x008: { shortName: 'MH_CFG', longName: 'Message Handler Configuration Register' },
  0x00C: { shortName: 'MH_STS0', longName: 'Message Handler Status Register' },
  0x010: { shortName: 'MH_STS1', longName: 'Message Handler Status Register' },
  0x014: { shortName: 'MH_SFTY_CFG', longName: 'Message Handler Safety Configuration Register' },
  0x018: { shortName: 'LMEM_PROT', longName: 'LMEM Protection Address Register' },
  0x01C: { shortName: 'RX_FILTER_CFG', longName: 'Global RX Filter Configuration Register' },
  0x020: { shortName: 'RX_FILTER_LMEM', longName: 'RX Filter Start Address Register' },
  // ====== MH: TX FIFO Queue ======
  0x100: { shortName: 'TXFQ_LMEM_SA', longName: 'TXFQ Start Address Register' },
  0x104: { shortName: 'TXFQ_LMEM_EA', longName: 'TXFQ End   Address Register' },
  0x108: { shortName: 'TXFQ_STS', longName: 'TX FIFO Queue Status Register' },
  0x10C: { shortName: 'TXFQ_CFG', longName: 'TX FIFO Configuration Register' },
  0x110: { shortName: 'TXFQ_WPTR', longName: 'TX FIFO Queue Write Pointer Register' },
  0x114: { shortName: 'TXFQ_RPTR', longName: 'TX FIFO Queue Read  Pointer Register' },
  // ====== MH: TX Priority Queue ======
  0x200: { shortName: 'TXPQ_CFG', longName: 'TX Priority Queue Configuration Register' },
  0x204: { shortName: 'TXPQ_STS0', longName: 'TX Priority Queue Status 0 Register' },
  0x208: { shortName: 'TXPQ_STS1', longName: 'TX Priority Queue Status 1 Register' },
  0x20C: { shortName: 'TXPQ_LMEM', longName: 'TX Priority Queue LMEM Address Register' },
  0x210: { shortName: 'TXPQ_WPTR', longName: 'TX Priority Queue Write Pointer Register' },
  // ====== MH: TX Event FIFO ======
  0x300: { shortName: 'TEFQ_LMEM', longName: 'TX Event FIFO LMEM Start Address Register' },
  0x304: { shortName: 'TEFQ_CFG', longName: 'TX Event FIFO LMEM Configuration Register' },
  0x308: { shortName: 'TEFQ_STS', longName: 'TX Event FIFO Status Register' },
  0x30C: { shortName: 'TEFQ_WPTR', longName: 'TX Event FIFO Queue Write Pointer Register' },
  0x310: { shortName: 'TEFQ_RPTR', longName: 'TX Event FIFO Queue Read  Pointer Register' },
  // ====== MH: CTM ======
  0x400: { shortName: 'CTB_LMEM', longName: 'Cut-Through Buffer start Address in LMEM Register' },
  0x404: { shortName: 'CTM_DESC_SRC', longName: 'Cut-Through Mode Source Address Register' },
  0x408: { shortName: 'CTM_DESC_DEST', longName: 'Cut-Through Mode Destination Address Register' },
  0x40C: { shortName: 'CTM_EVENT', longName: 'Cut-Through Mode Event Register' },
  // ====== MH: RX FIFO Queues ======
  0x500: { shortName: 'RXFQ0_SA', longName: 'RX FIFO Queue 0 Start Address Register' },
  0x504: { shortName: 'RXFQ0_EA', longName: 'RX FIFO Queue 0 End   Address Register' },
  0x508: { shortName: 'RXFQ0_RPTR', longName: 'RX FIFO Queue 0 Read  Pointer Register' },
  0x50C: { shortName: 'RXFQ0_WPTR', longName: 'RX FIFO Queue 0 Write Pointer Register' },
  0x510: { shortName: 'RXFQ0_WRAP_PTR', longName: 'RX FIFO Queue 0 Wrap Pointer in SMEM Register' },
  0x514: { shortName: 'RXFQ1_SA', longName: 'RX FIFO Queue 1 Start Address Register' },
  0x518: { shortName: 'RXFQ1_EA', longName: 'RX FIFO Queue 1 End   Address Register' },
  0x51C: { shortName: 'RXFQ1_RPTR', longName: 'RX FIFO Queue 1 Read  Pointer Register' },
  0x520: { shortName: 'RXFQ1_WPTR', longName: 'RX FIFO Queue 1 Write Pointer Register' },
  0x524: { shortName: 'RXFQ1_WRAP_PTR', longName: 'RX FIFO Queue 1 Wrap Pointer in SMEM Register' },
  0x528: { shortName: 'RXFQ_STS', longName: 'RX FIFO Queue Status Register' },
  // ====== MH: Debug ======
  0x600: { shortName: 'DEBUG_TEST_CTRL', longName: 'Debug Control Register' },
  0x604: { shortName: 'TX_SCAN_WC', longName: 'TX-SCAN winning  candidate Register' },
  0x608: { shortName: 'TX_SCAN_PC', longName: 'TX-SCAN prepared candidate Register' },
  0x60C: { shortName: 'VBM_STATUS', longName: 'Virtual Buffer Manager Status Register' },
  // ====== PRT ======
  0x900: { shortName: 'ENDN', longName: 'Endianness Test Register' },
  0x904: { shortName: 'STAT', longName: 'PRT Status 0 Register' }, // intentionally wrong name to be decoded by X_CAN PRT function (correct name in XS_CAN: STAT0) 
  0x908: { shortName: 'STAT1', longName: 'PRT Status 1 Register' },
  0x90C: { shortName: 'STATISTIC_COUNTER', longName: 'PRT Statistic Counter Register' },
  0x920: { shortName: 'EVNT', longName: 'Event Status Flags Register' },
  0x940: { shortName: 'LOCK', longName: 'Unlock Sequence Register (write-only)' },
  0x944: { shortName: 'CTRL', longName: 'Control Register (write-only)' },
  0x948: { shortName: 'FIMC', longName: 'Fault Injection Module Control Register' },
  0x94C: { shortName: 'TEST', longName: 'Hardware Test functions Register' },
  0x960: { shortName: 'MODE', longName: 'Operating Mode Register' },
  0x964: { shortName: 'NBTP', longName: 'Arbitration Phase Nominal Bit Timing Register' },
  0x968: { shortName: 'DBTP', longName: 'CAN FD Data Phase Bit Timing Register' },
  0x96C: { shortName: 'XBTP', longName: 'XAN XL Data Phase Bit Timing Register' },
  0x970: { shortName: 'PCFG', longName: 'PWME Configuration Register' },
  // ====== IRC ======
  0xA00: { shortName: 'TX_FUNC_RAW', longName: 'TX Functional raw event status Register' },
  0xA04: { shortName: 'RX_FUNC_RAW', longName: 'RX Functional raw event status Register' },
  0xA08: { shortName: 'ERR_STS_RAW', longName: 'Error raw event status Register' },
  0xA0C: { shortName: 'SAFETY_RAW',  longName: 'Safety raw event status Register' },
  0xA10: { shortName: 'TX_FUNC_CLR', longName: 'TX Functional raw event clear Register (write-only)' },
  0xA14: { shortName: 'RX_FUNC_CLR', longName: 'RX Functional raw event clear Register (write-only)' },
  0xA18: { shortName: 'ERR_STS_CLR', longName: 'Error raw event clear Register (write-only)' },
  0xA1C: { shortName: 'SAFETY_CLR',  longName: 'Safety raw event clear Register (write-only)' },
  0xA20: { shortName: 'TX_FUNC_ENA', longName: 'TX Functional raw event enable Register' },
  0xA24: { shortName: 'RX_FUNC_ENA', longName: 'RX Functional raw event enable Register' },
  0xA28: { shortName: 'ERR_STS_ENA', longName: 'Error raw event enable Register' },
  0xA2C: { shortName: 'SAFETY_ENA',  longName: 'Safety raw event enable Register' },
  0xA30: { shortName: 'CAPTURING_MODE', longName: 'IRC configuration Register' },
  0xA40: { shortName: 'HDP', longName: 'Hardware Debug Port control Register' }
};

// Reserved Address Array: list reserved addresses in M_CAN address range (inclusive, word-aligned step = 4 bytes)
export const resAddrArray = [
  { lowerResAddr: 0x024, upperResAddr: 0x0FC }, // MH global    (0x000...) 
  { lowerResAddr: 0x118, upperResAddr: 0x1FC }, // MH TX FQ     (0x100...)
  { lowerResAddr: 0x214, upperResAddr: 0x2FC }, // MH TX PQ     (0x200...)
  { lowerResAddr: 0x314, upperResAddr: 0x3FC }, // MH TX EFQ    (0x300...)
  { lowerResAddr: 0x410, upperResAddr: 0x4FC }, // MH CTM       (0x400...)
  { lowerResAddr: 0x52C, upperResAddr: 0x57C }, // MH RX FQ0/1  (0x500...)
  { lowerResAddr: 0x610, upperResAddr: 0x8FC }, // MH Debug     (0x600...)

  { lowerResAddr: 0x910, upperResAddr: 0x91C }, // PRT Part 1   (0x900...)
  { lowerResAddr: 0x924, upperResAddr: 0x93C }, // PRT Part 2   (0x900...)
  { lowerResAddr: 0x950, upperResAddr: 0x95C }, // PRT Part 3   (0x900...)
  { lowerResAddr: 0x974, upperResAddr: 0x9FC }, // PRT Part 4   (0x900...)

  { lowerResAddr: 0xA34, upperResAddr: 0xA3C }, // IRC Part 1   (0xA00...)
  { lowerResAddr: 0xA44, upperResAddr: 0xAFC }, // IRC Part 2   (0xA00...)

  { lowerResAddr: 0xB00, upperResAddr: 0xFFC }  // after IRC up to 2^12 bit
];

// ==== Exported Funktions/Structures up to here =====================================
// ===================================================================================