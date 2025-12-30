// ===================================================================================
// X_CAN
// Main script for processing registers.
// ===================================================================================

import * as x_can_prt from './x_can_prt.js';
import * as x_can_mh  from './x_can_mh.js';
import * as x_can_irc from './x_can_irc.js';

// ===================================================================================
// X_CAN: Process User Register Values: parse, validate, calculate results, generate report
export function processRegs(reg) {

  // c1) Process Bit Timing registers
  x_can_prt.procRegsPrtBitTiming(reg);
  
  // c2) Process Other PRT registers
  x_can_prt.procRegsPrtOther(reg);

  // c3) Process MH Global registers (VERSION, MH_CTRL, MH_CFG)
  x_can_mh.procRegsMhGlobal(reg);

  // c4) Process MH TX FIFO Queue registers
  x_can_mh.procRegsMhTXFQ(reg);

  // c5) Process MH TX Priority Queue registers
  x_can_mh.procRegsMhTXPQ(reg);

  // c6) Process MH RX FIFO Queue registers
  x_can_mh.procRegsMhRXFQ(reg);

  // c7) Process TX and RX Filter registers
  x_can_mh.procRegsMhRXTXFilter(reg);

  // c8) Process IR CTRL and Status registers
  x_can_mh.procRegsMhIRCtrlStat(reg); 

  // c9) Process Debug CTRL and Status registers
  x_can_mh.procRegsMhDebugCtrlStat(reg);

  // c10) Process IRC registers
  x_can_irc.procRegsIRC(reg);
}

// ==================================================================================
// Example Register Values for X_CAN PRT
export function loadExampleRegisterValues() {
  const clock = 160;
  const registerString = `# X_CAN V0.5.6 example
# Format to use: 0xADDR 0xVALUE
# 0xADDR is internal module address
#        or global address (e.g. 32bit)
# Example contains intentional errors
# MH ####################
0xA0020000 0x05610817
0xA0020004 0x00000001
0xA0020008 0x00000700
0xA002000C 0x00000111
0xA0020010 0x00000000
0xA0020014 0x00000000
0xA0020018 0x00000600
0xA002001C 0x02000000
0xA0020020 0x00000000
0xA0020024 0x00000011
0xA0020028 0x00000000
0xA0020100 0x0003F7C0
0xA0020104 0x0000000F
0xA0020108 0x00010001
0xA002010C 0x00000001
0xA0020110 0x00000000
0xA0020114 0x00000000
0xA0020118 0x00000001
0xA0020120 0x0003F7C0
0xA0020124 0x0003F6E0
0xA0020128 0x00000008
0xA0020130 0x00000000
0xA0020134 0x00000000
0xA0020138 0x00000000
0xA0020140 0x00000000
0xA0020144 0x00000000
0xA0020148 0x00000000
0xA0020150 0x00000000
0xA0020154 0x00000000
0xA0020158 0x00000000
0xA0020160 0x00000000
0xA0020164 0x00000000
0xA0020168 0x00000000
0xA0020170 0x00000000
0xA0020174 0x00000000
0xA0020178 0x00000000
0xA0020180 0x00000000
0xA0020184 0x00000000
0xA0020188 0x00000000
0xA0020190 0x00000000
0xA0020194 0x00000000
0xA0020198 0x00000000
0xA0020300 0x00000000
0xA0020304 0x00000000
0xA002030C 0x00000000
0xA0020310 0x00000000
0xA0020314 0x00000000
0xA0020318 0x00000000
0xA0020400 0x00000000
0xA0020404 0x00000000
0xA0020408 0x00000001
0xA002040C 0x00000000
0xA0020410 0x00000000
0xA0020414 0x00000000
0xA0020418 0x00000000
0xA002041C 0x00000001
0xA0020420 0x00043800
0xA0020424 0x00043800
0xA0020428 0x00410008
0xA002042C 0x00000000
0xA0020430 0x00000000
0xA0020438 0x00000000
0xA002043C 0x00000000
0xA0020440 0x00000000
0xA0020444 0x00000000
0xA0020448 0x00000000
0xA0020450 0x00000000
0xA0020454 0x00000000
0xA0020458 0x00000000
0xA002045C 0x00000000
0xA0020460 0x00000000
0xA0020468 0x00000000
0xA002046C 0x00000000
0xA0020470 0x00000000
0xA0020474 0x00000000
0xA0020478 0x00000000
0xA0020480 0x00000000
0xA0020484 0x00000000
0xA0020488 0x00000000
0xA002048C 0x00000000
0xA0020490 0x00000000
0xA0020498 0x00000000
0xA002049C 0x00000000
0xA00204A0 0x00000000
0xA00204A4 0x00000000
0xA00204A8 0x00000000
0xA00204B0 0x00000000
0xA00204B4 0x00000000
0xA00204B8 0x00000000
0xA00204BC 0x00000000
0xA00204C0 0x00000000
0xA00204C8 0x00000000
0xA00204CC 0x00000000
0xA00204D0 0x00000000
0xA00204D4 0x00000000
0xA00204D8 0x00000000
0xA0020600 0x001D0C0E
0xA0020604 0x004A00FF
0xA0020608 0x05420410
0xA002060C 0xF0108080
0xA0020610 0x00000000
0xA0020614 0x00000000
0xA0020680 0x00100000
0xA0020700 0x00000000
0xA0020704 0x00000000
0xA0020708 0x00000000
0xA002070C 0x00000000
0xA0020710 0x00000000
0xA0020714 0x00000000
0xA0020718 0x00000000
0xA002071C 0x00000000
0xA0020720 0x00000000
0xA0020724 0x00000000
0xA0020728 0x00000000
0xA0020800 0x00000000
0xA0020804 0x00000000
0xA0020808 0x00000000
0xA0020810 0x00000000
0xA0020814 0x000001C0
0xA0020818 0x00000000
0xA002081C 0x00000000
0xA0020880 0x00000000
0xA0020884 0x00000000
# PRT ################
0xA0020900 0x87654321
0xA0020904 0x05410817
0xA0020908 0x00000C11
# reserved from here
0xA002090C 0x00000000
0xA0020910 0x00000000
0xA0020914 0x00000000
0xA0020918 0x00000000
0xA002091C 0x00000000
# reserved up to here
0xA0020920 0x00000100
# reserved from here
0xA0020924 0x00000000
0xA0020928 0x00000000
0xA002092C 0x00000000
0xA0020930 0x00000000
0xA0020934 0x00000000
0xA0020938 0x00000000
0xA002093C 0x00000000
# reserved up to here
0xA0020940 0x00000000
0xA0020944 0x00000000
0xA0020948 0x00000000
0xA002094c 0x00000008
0xA0020960 0x00000607
0xA0020964 0x00fe3f3f
0xA0020968 0x100f0e0e
0xA002096c 0x0a090808
0xA0020970 0x00000C04
# IRC ################
0xA0020A00 0x00000000
0xA0020A04 0x00000000
0xA0020A08 0x00000000
0xA0020A10 0x00000000
0xA0020A14 0x00000000
0xA0020A18 0x00000000
0xA0020A20 0x0F000001
0xA0020A24 0x00E00000
0xA0020A28 0x00000008
0xA0020A30 0x00000007
0xA0020A40 0x00000000`;

return {exampleRegisterValues: registerString, clockFrequency: clock};
}

// Address Mask to be able to consider the local address bits
export const regLocalAddrMask = 0x00000FFF; // 12 LSBit are the X_CAN local address bits

// Address to register name mapping (masked with 0xFFF local X_CAN address)
export const regAddrMap = {
  // ====== MH: Global ======
  0x000: { shortName: 'VERSION', longName: 'Release Identification Register' },
  0x004: { shortName: 'MH_CTRL', longName: 'Message Handler Control register' },
  0x008: { shortName: 'MH_CFG', longName: 'Message Handler Configuration register' },
  0x00C: { shortName: 'MH_STS', longName: 'Message Handler Status register' },
  0x010: { shortName: 'MH_SFTY_CFG', longName: 'Message Handler Safety Configuration register' },
  0x014: { shortName: 'MH_SFTY_CTRL', longName: 'Message Handler Safety Control register' },
  0x018: { shortName: 'RX_FILTER_MEM_ADD', longName: 'RX Filter Base Address register' },
  0x01C: { shortName: 'TX_DESC_MEM_ADD', longName: 'TX Descriptor Base Address register' },
  0x020: { shortName: 'AXI_ADD_EXT', longName: 'AXI address extension register' },
  0x024: { shortName: 'AXI_PARAMS', longName: 'AXI parameter register' },
  0x028: { shortName: 'MH_LOCK', longName: 'Message Handler Lock register' },
  // ====== MH: TX FIFOs ======
  0x100: { shortName: 'TX_DESC_ADD_PT', longName: 'TX descriptor current address pointer register' },
  0x104: { shortName: 'TX_STATISTICS', longName: 'Unsuccessful and Successful message counter registers' },
  0x108: { shortName: 'TX_FQ_STS0', longName: 'TX FIFO Queue Status register' },
  0x10C: { shortName: 'TX_FQ_STS1', longName: 'TX FIFO Queue Status register' },
  0x110: { shortName: 'TX_FQ_CTRL0', longName: 'TX FIFO Queue Control register 0' },
  0x114: { shortName: 'TX_FQ_CTRL1', longName: 'TX FIFO Queue Control register 1' },
  0x118: { shortName: 'TX_FQ_CTRL2', longName: 'TX FIFO Queue Control register 2' },
  0x120: { shortName: 'TX_FQ_ADD_PT0', longName: 'TX FIFO Queue 0 Current Address Pointer register' },
  0x124: { shortName: 'TX_FQ_START_ADD0', longName: 'TX FIFO Queue 0 Start Address register' },
  0x128: { shortName: 'TX_FQ_SIZE0', longName: 'TX FIFO Queue 0 Size register' },
  0x130: { shortName: 'TX_FQ_ADD_PT1', longName: 'TX FIFO Queue 1 Current Address Pointer register' },
  0x134: { shortName: 'TX_FQ_START_ADD1', longName: 'TX FIFO Queue 1 Start Address register' },
  0x138: { shortName: 'TX_FQ_SIZE1', longName: 'TX FIFO Queue 1 Size register' },
  0x140: { shortName: 'TX_FQ_ADD_PT2', longName: 'TX FIFO Queue 2 Current Address Pointer register' },
  0x144: { shortName: 'TX_FQ_START_ADD2', longName: 'TX FIFO Queue 2 Start Address register' },
  0x148: { shortName: 'TX_FQ_SIZE2', longName: 'TX FIFO Queue 2 Size register' },
  0x150: { shortName: 'TX_FQ_ADD_PT3', longName: 'TX FIFO Queue 3 Current Address Pointer register' },
  0x154: { shortName: 'TX_FQ_START_ADD3', longName: 'TX FIFO Queue 3 Start Address register' },
  0x158: { shortName: 'TX_FQ_SIZE3', longName: 'TX FIFO Queue 3 Size register' },
  0x160: { shortName: 'TX_FQ_ADD_PT4', longName: 'TX FIFO Queue 4 Current Address Pointer register' },
  0x164: { shortName: 'TX_FQ_START_ADD4', longName: 'TX FIFO Queue 4 Start Address register' },
  0x168: { shortName: 'TX_FQ_SIZE4', longName: 'TX FIFO Queue 4 Size register' },
  0x170: { shortName: 'TX_FQ_ADD_PT5', longName: 'TX FIFO Queue 5 Current Address Pointer register' },
  0x174: { shortName: 'TX_FQ_START_ADD5', longName: 'TX FIFO Queue 5 Start Address register' },
  0x178: { shortName: 'TX_FQ_SIZE5', longName: 'TX FIFO Queue 5 Size register' },
  0x180: { shortName: 'TX_FQ_ADD_PT6', longName: 'TX FIFO Queue 6 Current Address Pointer register' },
  0x184: { shortName: 'TX_FQ_START_ADD6', longName: 'TX FIFO Queue 6 Start Address register' },
  0x188: { shortName: 'TX_FQ_SIZE6', longName: 'TX FIFO Queue 6 Size register' },
  0x190: { shortName: 'TX_FQ_ADD_PT7', longName: 'TX FIFO Queue 7 Current Address Pointer register' },
  0x194: { shortName: 'TX_FQ_START_ADD7', longName: 'TX FIFO Queue 7 Start Address register' },
  0x198: { shortName: 'TX_FQ_SIZE7', longName: 'TX FIFO Queue 7 Size register' },
  // ====== MH: TX Priority Queue control/status ======
  0x300: { shortName: 'TX_PQ_STS0', longName: 'TX Priority Queue Status register' },
  0x304: { shortName: 'TX_PQ_STS1', longName: 'TX Priority Queue Status register' },
  0x30C: { shortName: 'TX_PQ_CTRL0', longName: 'TX Priority Queue Control register 0' },
  0x310: { shortName: 'TX_PQ_CTRL1', longName: 'TX Priority Queue Control register 1' },
  0x314: { shortName: 'TX_PQ_CTRL2', longName: 'TX Priority Queue Control register 2' },
  0x318: { shortName: 'TX_PQ_START_ADD', longName: 'TX Priority Queue Start Address' },
  // ====== MH: RX FIFO Queues control/status ======
  0x400: { shortName: 'RX_DESC_ADD_PT', longName: 'RX descriptor Current Address Pointer' },
  0x404: { shortName: 'RX_STATISTICS', longName: 'Unsuccessful and Successful Message Received Counter' },
  0x408: { shortName: 'RX_FQ_STS0', longName: 'RX FIFO Queue Status register 0' },
  0x40C: { shortName: 'RX_FQ_STS1', longName: 'RX FIFO Queue Status register 1' },
  0x410: { shortName: 'RX_FQ_STS2', longName: 'RX FIFO Queue Status register 2' },
  0x414: { shortName: 'RX_FQ_CTRL0', longName: 'RX FIFO Queue Control register 0' },
  0x418: { shortName: 'RX_FQ_CTRL1', longName: 'RX FIFO Queue Control register 1' },
  0x41C: { shortName: 'RX_FQ_CTRL2', longName: 'RX FIFO Queue Control register 2' },
  0x420: { shortName: 'RX_FQ_ADD_PT0', longName: 'RX FIFO Queue 0 Current Address Pointer' },
  0x424: { shortName: 'RX_FQ_START_ADD0', longName: 'RX FIFO Queue 0 link list Start Address' },
  0x428: { shortName: 'RX_FQ_SIZE0', longName: 'RX FIFO Queue 0 link list and data container Size' },
  0x42C: { shortName: 'RX_FQ_DC_START_ADD0', longName: 'RX FIFO Queue 0 Data Container Start Address' },
  0x430: { shortName: 'RX_FQ_RD_ADD_PT0', longName: 'RX FIFO Queue 0' },
  0x438: { shortName: 'RX_FQ_ADD_PT1', longName: 'RX FIFO Queue 1 Current Address Pointer' },
  0x43C: { shortName: 'RX_FQ_START_ADD1', longName: 'RX FIFO Queue 1 link list Start Address' },
  0x440: { shortName: 'RX_FQ_SIZE1', longName: 'RX FIFO Queue 1 link list and data container Size' },
  0x444: { shortName: 'RX_FQ_DC_START_ADD1', longName: 'RX FIFO Queue 1 Data Container Start Address' },
  0x448: { shortName: 'RX_FQ_RD_ADD_PT1', longName: 'RX FIFO Queue 1' },
  0x450: { shortName: 'RX_FQ_ADD_PT2', longName: 'RX FIFO Queue 2 Current Address Pointer' },
  0x454: { shortName: 'RX_FQ_START_ADD2', longName: 'RX FIFO Queue 2 link list Start Address' },
  0x458: { shortName: 'RX_FQ_SIZE2', longName: 'RX FIFO Queue 2 link list and data container Size' },
  0x45C: { shortName: 'RX_FQ_DC_START_ADD2', longName: 'RX FIFO Queue 2 Data Container Start Address' },
  0x460: { shortName: 'RX_FQ_RD_ADD_PT2', longName: 'RX FIFO Queue 2' },
  0x468: { shortName: 'RX_FQ_ADD_PT3', longName: 'RX FIFO Queue 3 Current Address Pointer' },
  0x46C: { shortName: 'RX_FQ_START_ADD3', longName: 'RX FIFO Queue 3 link list Start Address' },
  0x470: { shortName: 'RX_FQ_SIZE3', longName: 'RX FIFO Queue 3 link list and data container Size' },
  0x474: { shortName: 'RX_FQ_DC_START_ADD3', longName: 'RX FIFO Queue 3 Data Container Start Address' },
  0x478: { shortName: 'RX_FQ_RD_ADD_PT3', longName: 'RX FIFO Queue 3' },
  0x480: { shortName: 'RX_FQ_ADD_PT4', longName: 'RX FIFO Queue 4 Current Address Pointer' },
  0x484: { shortName: 'RX_FQ_START_ADD4', longName: 'RX FIFO Queue 4 link list Start Address' },
  0x488: { shortName: 'RX_FQ_SIZE4', longName: 'RX FIFO Queue 4 link list and data container Size' },
  0x48C: { shortName: 'RX_FQ_DC_START_ADD4', longName: 'RX FIFO Queue 4 Data Container Start Address' },
  0x490: { shortName: 'RX_FQ_RD_ADD_PT4', longName: 'RX FIFO Queue 4' },
  0x498: { shortName: 'RX_FQ_ADD_PT5', longName: 'RX FIFO Queue 5 Current Address Pointer' },
  0x49C: { shortName: 'RX_FQ_START_ADD5', longName: 'RX FIFO Queue 5 link list Start Address' },
  0x4A0: { shortName: 'RX_FQ_SIZE5', longName: 'RX FIFO Queue 5 link list and data container size' },
  0x4A4: { shortName: 'RX_FQ_DC_START_ADD5', longName: 'RX FIFO Queue 5 Data Container Start Address' },
  0x4A8: { shortName: 'RX_FQ_RD_ADD_PT5', longName: 'RX FIFO Queue 5' },
  0x4B0: { shortName: 'RX_FQ_ADD_PT6', longName: 'RX FIFO Queue 6 Current Address Pointer' },
  0x4B4: { shortName: 'RX_FQ_START_ADD6', longName: 'RX FIFO Queue 6 link list Start Address' },
  0x4B8: { shortName: 'RX_FQ_SIZE6', longName: 'RX FIFO Queue 6 link list and data container Size' },
  0x4BC: { shortName: 'RX_FQ_DC_START_ADD6', longName: 'RX FIFO Queue 6 Data Container Start Address' },
  0x4C0: { shortName: 'RX_FQ_RD_ADD_PT6', longName: 'RX FIFO Queue 6' },
  0x4C8: { shortName: 'RX_FQ_ADD_PT7', longName: 'RX FIFO Queue 7 Current Address Pointer' },
  0x4CC: { shortName: 'RX_FQ_START_ADD7', longName: 'RX FIFO Queue 7 link list Start Address' },
  0x4D0: { shortName: 'RX_FQ_SIZE7', longName: 'RX FIFO Queue 7 link list and data container Size' },
  0x4D4: { shortName: 'RX_FQ_DC_START_ADD7', longName: 'RX FIFO Queue 7 Data Container Start Address' },
  0x4D8: { shortName: 'RX_FQ_RD_ADD_PT7', longName: 'RX FIFO Queue 7' },
  // ====== MH: TX filter control ======
  0x600: { shortName: 'TX_FILTER_CTRL0', longName: 'TX Filter Control register 0' },
  0x604: { shortName: 'TX_FILTER_CTRL1', longName: 'TX Filter Control register 1' },
  0x608: { shortName: 'TX_FILTER_REFVAL0', longName: 'TX Filter Reference Value register 0' },
  0x60C: { shortName: 'TX_FILTER_REFVAL1', longName: 'TX Filter Reference Value register 1' },
  0x610: { shortName: 'TX_FILTER_REFVAL2', longName: 'TX Filter Reference Value register 2' },
  0x614: { shortName: 'TX_FILTER_REFVAL3', longName: 'TX Filter Reference Value register 3' },
  // ====== MH: RX filter control ======
  0x680: { shortName: 'RX_FILTER_CTRL', longName: 'RX Filter Control register' },
  // ====== MH: Interrupts control/status ======
  0x700: { shortName: 'TX_FQ_INT_STS', longName: 'TX FIFO Queue Interrupt Status register' },
  0x704: { shortName: 'RX_FQ_INT_STS', longName: 'RX FIFO Queue Interrupt Status register' },
  0x708: { shortName: 'TX_PQ_INT_STS0', longName: 'TX Priority Queue Interrupt Status register 0' },
  0x70C: { shortName: 'TX_PQ_INT_STS1', longName: 'TX Priority Queue Interrupt Status register 1' },
  0x710: { shortName: 'STATS_INT_STS', longName: 'Statistics Interrupt Status register' },
  0x714: { shortName: 'ERR_INT_STS', longName: 'Error Interrupt Status register' },
  0x718: { shortName: 'SFTY_INT_STS', longName: 'Safety Interrupt Status register' },
  0x71C: { shortName: 'AXI_ERR_INFO', longName: 'AXI Error Information' },
  0x720: { shortName: 'DESC_ERR_INFO0', longName: 'Descriptor Error Information 0' },
  0x724: { shortName: 'DESC_ERR_INFO1', longName: 'Descriptor Error Information 1' },
  0x728: { shortName: 'TX_FILTER_ERR_INFO', longName: 'TX Filter Error Information' },
  // ====== MH: Integration/Debug control/status ======
  0x800: { shortName: 'DEBUG_TEST_CTRL', longName: 'Debug Control register' },
  0x804: { shortName: 'INT_TEST0', longName: 'Interrupt Test register 0' },
  0x808: { shortName: 'INT_TEST1', longName: 'Interrupt Test register 1' },
  0x810: { shortName: 'TX_SCAN_FC', longName: 'TX-SCAN first candidates register' },
  0x814: { shortName: 'TX_SCAN_BC', longName: 'TX-SCAN best candidates register' },
  0x818: { shortName: 'TX_FQ_DESC_VALID', longName: 'Valid TX FIFO Queue descriptors in local memory' },
  0x81C: { shortName: 'TX_PQ_DESC_VALID', longName: 'Valid TX Priority Queue descriptors in local memory' },
  // ====== MH: CRC control ======
  0x880: { shortName: 'CRC_CTRL', longName: 'CRC Control register' },
  0x884: { shortName: 'CRC_REG', longName: 'CRC register' },
  // ====== PRT ======
  0x900: { shortName: 'ENDN', longName: 'Endianness Test Register' },
  0x904: { shortName: 'PREL', longName: 'PRT Release Identification Register' },
  0x908: { shortName: 'STAT', longName: 'PRT Status Register' },
  0x920: { shortName: 'EVNT', longName: 'Event Status Flags Register' },
  0x940: { shortName: 'LOCK', longName: 'Unlock Sequence Register (write-only)' },
  0x944: { shortName: 'CTRL', longName: 'Control Register (write-only)' },
  0x948: { shortName: 'FIMC', longName: 'Fault Injection Module Control Register' },
  0x94C: { shortName: 'TEST', longName: 'Hardware Test functions Register' },
  0x960: { shortName: 'MODE', longName: 'Operating Mode Register' },
  0x964: { shortName: 'NBTP', longName: 'Arbitration Phase Nominal Bit Timing Register' },
  0x968: { shortName: 'DBTP', longName: 'CAN FD Data Phase Bit Timing Register' },
  0x96C: { shortName: 'XBTP', longName: 'CAN XL Data Phase Bit Timing Register' },
  0x970: { shortName: 'PCFG', longName: 'PWME Configuration Register' },
  // ====== IRC ======
  0xA00: { shortName: 'FUNC_RAW', longName: 'Functional raw event status register' },
  0xA04: { shortName: 'ERR_RAW', longName: 'Error raw event status register' },
  0xA08: { shortName: 'SAFETY_RAW', longName: 'Safety raw event status register' },
  0xA10: { shortName: 'FUNC_CLR', longName: 'Functional raw event clear register (write-only)' },
  0xA14: { shortName: 'ERR_CLR', longName: 'Error raw event clear register (write-only)' },
  0xA18: { shortName: 'SAFETY_CLR', longName: 'Safety raw event clear register (write-only)' },
  0xA20: { shortName: 'FUNC_ENA', longName: 'Functional raw event enable register' },
  0xA24: { shortName: 'ERR_ENA', longName: 'Error raw event enable register' },
  0xA28: { shortName: 'SAFETY_ENA', longName: 'Safety raw event enable register' },
  0xA30: { shortName: 'CAPTURING_MODE', longName: 'IRC configuration register' },
  0xA40: { shortName: 'HDP', longName: 'Hardware Debug Port control register' }
};

// TODO: add correct reserved ranges to array
// Reserved Address Array: list reserved addresses in M_CAN address range (inclusive, word-aligned step = 4 bytes)
export const resAddrArray = [
  { lowerResAddr: 0x02C, upperResAddr: 0x0FC }, // MH global    (0x000...) 
  { lowerResAddr: 0x19C, upperResAddr: 0x2FC }, // MH TX FQ     (0x100...)
  { lowerResAddr: 0x308, upperResAddr: 0x308 }, // MH TX PQ     (0x300...)
  { lowerResAddr: 0x31C, upperResAddr: 0x3FC }, // MH TX PQ     (0x300...)
  { lowerResAddr: 0x4DC, upperResAddr: 0x5FC }, // MH RX FQ     (0x400...)
  { lowerResAddr: 0x618, upperResAddr: 0x67C }, // MH TX Filter (0x600...)
  { lowerResAddr: 0x684, upperResAddr: 0x6FC }, // MH RX Filter (0x600...)
  { lowerResAddr: 0x72C, upperResAddr: 0x7FC }, // MH IR        (0x600...)
  { lowerResAddr: 0x820, upperResAddr: 0x87C }, // MH Debug     (0x600...)
  { lowerResAddr: 0x888, upperResAddr: 0x8FC }, // MH CRC CRTL  (0x600...)

  { lowerResAddr: 0x90C, upperResAddr: 0x91C }, // PRT Part 1   (0x900...)
  { lowerResAddr: 0x924, upperResAddr: 0x93C }, // PRT Part 2   (0x900...)
  { lowerResAddr: 0x950, upperResAddr: 0x95C }, // PRT Part 3   (0x900...)
  { lowerResAddr: 0x974, upperResAddr: 0x9FC }, // PRT Part 4   (0x900...)

  { lowerResAddr: 0xA0C, upperResAddr: 0xA0C }, // IRC Part 1   (0xA00...)
  { lowerResAddr: 0xA2C, upperResAddr: 0xA2C }, // IRC Part 2   (0xA00...)
  { lowerResAddr: 0xA34, upperResAddr: 0xA3C }, // IRC Part 3   (0xA00...)
  { lowerResAddr: 0xA44, upperResAddr: 0xAFC }, // IRC Part 4   (0xA00...)

  { lowerResAddr: 0xB00, upperResAddr: 0xFFC }  // after IRC up to 2^12 bit
];

// ==== Exported Funktions/Structures up to here =====================================
// ===================================================================================