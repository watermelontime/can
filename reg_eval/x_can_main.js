// X_CAN: Main script for processing CAN XL registers and calculating bit timing parameters
import { getBits } from './help_functions.js';
import { sevC } from './help_functions.js';

import * as x_can_prt from './x_can_prt.js';
import * as x_can_mh from './x_can_mh.js';

// ===================================================================================
// X_CAN: Process User Register Values: parse, validate, calculate results, generate report
export function processRegsOfX_CAN(reg, verbose = true) {
  // Map raw addresses to register names
  mapRawRegistersToNames(reg, verbose);
  console.log('[Info] Step 2 - Mapped register values (reg object):', reg);

  // c1) Process Bit Timing registers
  x_can_prt.procRegsPrtBitTiming(reg);
  
  // c2) Process Other PRT registers
  x_can_prt.procRegsPrtOther(reg);

  // c3) Process MH Global registers (VERSION, MH_CTRL, MH_CFG)
  x_can_mh.procRegsMhGlobal(reg);


  // TODO: prepare proper testdata with all registers
  // TODO: test the new function => seems to have some halucinations

  console.log('[Info] Registers with data and reports, reg object:', reg);
}

// ==================================================================================
// Example Register Values for X_CAN PRT
export function loadExampleRegisterValues() {
  const clock = 160;
  const registerString = `# # X_CAN V0.5.6 example
# Format to use: 0xADDR 0xVALUE
# 0xADDR is internal X_CAN address
#        or global address (e.g. 32 bit)
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
0xA0020600 0x00000000
0xA0020604 0x00000000
0xA0020608 0x00000000
0xA002060C 0x00000000
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
0xA0020884 0x00000000
# PRT ################
0xA0020900 0x87654321
0xA0020904 0x05410817
0xA0020908 0x00000C11
0xA0020920 0x00000100
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
0xA0020A20 0x0F000001
0xA0020A24 0x00E00000
0xA0020A28 0x00000008
0xA0020A30 0x00000007
0xA0020A40 0x00000000`;

return {exampleRegisterValues: registerString, clockFrequency: clock};
}

// ===================================================================================
// Map raw register addresses to register names and create named register structure
function mapRawRegistersToNames(reg, verbose = true) {
  // Check if parse_output exists (in reg object)
  if (!reg.parse_output) {
    console.warn('[X_CAN] [Warning, mapRawRegistersToNames()] reg.parse_output not found in reg object. Skipping mapping of <raw registers> to <names>. parseUserRegisterValues(userRegText, reg) must be called before this function.');
    return;
  }
  
  // Address to register name mapping (masked with 0xFFF local X_CAN address)
  const addressMap = {
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
    0x880: { shortName: 'CRC_CTRL', longName: 'CRC Control register write-only 0x0' },
    0x884: { shortName: 'CRC_REG', longName: 'CRC register' },
    // ====== PRT ======
    0x900: { shortName: 'ENDN', longName: 'Endianness Test Register' },
    0x904: { shortName: 'PREL', longName: 'PRT Release Identification Register' },
    0x908: { shortName: 'STAT', longName: 'PRT Status Register' },
    0x920: { shortName: 'EVNT', longName: 'Event Status Flags Register' },
    0x940: { shortName: 'LOCK', longName: 'Unlock Sequence Register' },
    0x944: { shortName: 'CTRL', longName: 'Control Register' },
    0x948: { shortName: 'FIMC', longName: 'Fault Injection Module Control Register' },
    0x94C: { shortName: 'TEST', longName: 'Hardware Test functions Register' },
    0x960: { shortName: 'MODE', longName: 'Operating Mode Register' },
    0x964: { shortName: 'NBTP', longName: 'Arbitration Phase Nominal Bit Timing Register' },
    0x968: { shortName: 'DBTP', longName: 'CAN FD Data Phase Bit Timing Register' },
    0x96C: { shortName: 'XBTP', longName: 'XAN XL Data Phase Bit Timing Register' },
    0x970: { shortName: 'PCFG', longName: 'PWME Configuration Register' },
    // ====== IRC ======
    0xA00: { shortName: 'FUNC_RAW', longName: 'Functional raw event status register' },
    0xA04: { shortName: 'ERR_RAW', longName: 'Error raw event status register' },
    0xA08: { shortName: 'SAFETY_RAW', longName: 'Safety raw event status register' },
    0xA10: { shortName: 'FUNC_CLR', longName: 'Functional raw event clear register write-only 0x0' },
    0xA14: { shortName: 'ERR_CLR', longName: 'Error raw event clear register write-only 0x0' },
    0xA18: { shortName: 'SAFETY_CLR', longName: 'Safety raw event clear register write-only 0x0' },
    0xA20: { shortName: 'FUNC_ENA', longName: 'Functional raw event enable register' },
    0xA24: { shortName: 'ERR_ENA', longName: 'Error raw event enable register' },
    0xA28: { shortName: 'SAFETY_ENA', longName: 'Safety raw event enable register' },
    0xA30: { shortName: 'CAPTURING_MODE', longName: 'IRC configuration register' },
    0xA40: { shortName: 'HDP', longName: 'Hardware Debug Port control register' }
  };
  
  let mappedCount = 0;
  let unmappedCount = 0;
  
  // Process each raw register entry
  const xCanAddMask = 0x00000FFF; // 12 LSBit are the X_CAN local address bits
  for (const rawReg of reg.raw) {
    const mapping = addressMap[rawReg.addr & xCanAddMask];
    
    if (mapping) {
      // Create named register structure
      const regName = mapping.shortName;
      reg[regName] = {
        int32: rawReg.value_int32,
        name_long: mapping.longName,
        addr: rawReg.addr
      };
      
      mappedCount++;
      
      if (verbose === true) {
        reg.parse_output.report.push({
          severityLevel: sevC.Info,
          msg: `Mapped reg. address 0x${rawReg.addr.toString(16).toUpperCase().padStart(3, '0')} to ${regName} (${mapping.longName})`
        });
      }
    } else {
      // Unknown address
      unmappedCount++;
      
      reg.parse_output.report.push({
        severityLevel: sevC.Warn,
        msg: `Unknown register address: 0x${rawReg.addr.toString(16).toUpperCase().padStart(3, '0')} - register will be ignored`
      });
      reg.parse_output.hasWarnings = true;
    }
  }
  
  // Add summary message
  reg.parse_output.report.push({
    severityLevel: sevC.Info, // info
    msg: `Address mapping completed: ${mappedCount} mapped, ${unmappedCount} unknown`
  });
  
  return reg;
} // end mapRawRegistersToNames

// ==================================================================================
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
             `FD Operation is disabled: a) MODE.FDOE=0 OR b) TMS=ON or ES=OFF OR c) MODE register not present`
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
function procRegsPrtOther(reg) {

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
      msg: `PREL: X_CAN PRT V${reg.PREL.fields.REL.toString(16).toUpperCase()}.${reg.PREL.fields.STEP.toString(16).toUpperCase()}.${reg.PREL.fields.SUBSTEP.toString(16).toUpperCase()}, Date ${reg.PREL.fields.DAY.toString(16).toUpperCase().padStart(2, '0')}.${reg.PREL.fields.MON.toString(16).toUpperCase().padStart(2, '0')}.${reg.PREL.fields.YEAR.toString(16).toUpperCase().padStart(2, '0')}`
    });
  }

  // === STAT: PRT Status Register =========================================
  if ('STAT' in reg && reg.STAT.int32 !== undefined) {
    const regValue = reg.STAT.int32;

    // 0. Extend existing register structure
    reg.STAT.fields = {};
    reg.STAT.report = []; // Initialize report array

    // 1. Decode all individual bits of STAT register
    reg.STAT.fields.ACT  = getBits(regValue, 1, 0);   // Activity (00: inactive, 01: idle, 10: receiver, 11: transmitter)
    reg.STAT.fields.INT  = getBits(regValue, 2, 2);   // Integrating (1: integrating into bus communication)
    reg.STAT.fields.STP  = getBits(regValue, 3, 3);   // Stop (1: Waiting for End of current frame TX/RX)
    reg.STAT.fields.CLKA = getBits(regValue, 4, 4);   // CLOCK_ACTIVE (1: active)
    reg.STAT.fields.FIMA = getBits(regValue, 5, 5);   // Fault Injection Mode Active
    reg.STAT.fields.EP   = getBits(regValue, 6, 6);   // Error Passive State
    reg.STAT.fields.BO   = getBits(regValue, 7, 7);   // Bus Off State
    reg.STAT.fields.TDCV = getBits(regValue, 15, 8);  // TDC Value
    reg.STAT.fields.REC  = getBits(regValue, 22, 16); // Receive Error Counter
    reg.STAT.fields.RP   = getBits(regValue, 23, 23); // Receive Error Counter Carry Flag
    reg.STAT.fields.TEC  = getBits(regValue, 31, 24); // Transmit Error Counter

    // 2. Generate human-readable register report
    reg.STAT.report.push({
      severityLevel: sevC.Info, // info
      msg: `STAT: ${reg.STAT.name_long} (0x${reg.STAT.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
           `[ACT ] Activity                     = ${reg.STAT.fields.ACT} (0: inactive, 1: idle, 2: receiver, 3: transmitter))\n` +
           `[INT ] Integrating                  = ${reg.STAT.fields.INT}\n` +
           `[STP ] Stop                         = ${reg.STAT.fields.STP}\n` +
           `[CLKA] Clock Active                 = ${reg.STAT.fields.CLKA}\n` +
           `[FIMA] Fault Injection Mode Active  = ${reg.STAT.fields.FIMA}\n` +
           `[EP  ] Error Passive State          = ${reg.STAT.fields.EP}\n` +
           `[BO  ] Bus Off State                = ${reg.STAT.fields.BO}\n` +
           `[TDCV] Transmitter Delay Comp Value = ${reg.STAT.fields.TDCV} cycles = ${reg.STAT.fields.TDCV * reg.general.clk_period} ns\n` +
           `[REC ] Receive Error Counter        = ${reg.STAT.fields.REC}\n` +
           `[RP  ] RX Error Counter Carry Flag  = ${reg.STAT.fields.RP}\n` +
           `[TEC ] Transmit Error Counter       = ${reg.STAT.fields.TEC}`
    });

    // 3. Add status-specific warnings/errors
    if (reg.STAT.fields.BO === 1) {
      reg.STAT.report.push({
        severityLevel: sevC.Warn, // warning
        msg: `CAN controller is in Bus Off state`
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
        severityLevel: sevC.Warn, // warning
        msg: `Transmit Error Counter > 0. Errors seen recently on CAN bus.`
      });
    }
    if (reg.STAT.fields.REC > 96) {
      reg.STAT.report.push({
        severityLevel: sevC.Warn, // warning
        msg: `Receive Error Counter > 0. Errors seen recently on CAN bus.`
      });
    }
  }
// TODO AB HIER: Check the decoding of the registers. It The code is written by copilot.
  // === EVNT: Event Status Flags Register ================================
  if ('EVNT' in reg && reg.EVNT.int32 !== undefined) {
    const regValue = reg.EVNT.int32;

    // 0. Extend existing register structure
    reg.EVNT.fields = {};
    reg.EVNT.report = []; // Initialize report array

    // 1. Decode all individual bits of EVNT register
    reg.EVNT.fields.RXFI = getBits(regValue, 31, 31); // RX FIFO Interrupt
    reg.EVNT.fields.TXFI = getBits(regValue, 30, 30); // TX FIFO Interrupt
    reg.EVNT.fields.TEFI = getBits(regValue, 29, 29); // TX Event FIFO Interrupt
    reg.EVNT.fields.HPMI = getBits(regValue, 28, 28); // High Priority Message Interrupt
    reg.EVNT.fields.WKUI = getBits(regValue, 27, 27); // Wake Up Interrupt
    reg.EVNT.fields.MRAF = getBits(regValue, 17, 17); // Message RAM Access Failure
    reg.EVNT.fields.TSWE = getBits(regValue, 16, 16); // Timestamp Wraparound Event
    reg.EVNT.fields.ELO = getBits(regValue, 15, 15); // Error Logging Overflow
    reg.EVNT.fields.EP = getBits(regValue, 14, 14); // Error Passive
    reg.EVNT.fields.EW = getBits(regValue, 13, 13); // Error Warning
    reg.EVNT.fields.BO = getBits(regValue, 12, 12); // Bus Off
    reg.EVNT.fields.WDI = getBits(regValue, 11, 11); // Watchdog Interrupt
    reg.EVNT.fields.PEA = getBits(regValue, 10, 10); // Protocol Error in Arbitration Phase
    reg.EVNT.fields.PED = getBits(regValue, 9, 9); // Protocol Error in Data Phase
    reg.EVNT.fields.ARA = getBits(regValue, 8, 8); // Access to Reserved Address

    // 2. Generate human-readable register report
  reg.EVNT.report.push({
        severityLevel: sevC.Info, // info
        msg: `EVNT: ${reg.EVNT.name_long} (0x${reg.EVNT.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[RXFI] RX FIFO Interrupt          = ${reg.EVNT.fields.RXFI}\n` +
             `[TXFI] TX FIFO Interrupt          = ${reg.EVNT.fields.TXFI}\n` +
             `[TEFI] TX Event FIFO Interrupt    = ${reg.EVNT.fields.TEFI}\n` +
             `[HPMI] High Priority Message Int  = ${reg.EVNT.fields.HPMI}\n` +
             `[WKUI] Wake Up Interrupt          = ${reg.EVNT.fields.WKUI}\n` +
             `[MRAF] Message RAM Access Failure = ${reg.EVNT.fields.MRAF}\n` +
             `[TSWE] Timestamp Wraparound Event = ${reg.EVNT.fields.TSWE}\n` +
             `[ELO ] Error Logging Overflow     = ${reg.EVNT.fields.ELO}\n` +
             `[EP  ] Error Passive              = ${reg.EVNT.fields.EP}\n` +
             `[EW  ] Error Warning              = ${reg.EVNT.fields.EW}\n` +
             `[BO  ] Bus Off                    = ${reg.EVNT.fields.BO}\n` +
             `[WDI ] Watchdog Interrupt         = ${reg.EVNT.fields.WDI}\n` +
             `[PEA ] Protocol Error Arbitration = ${reg.EVNT.fields.PEA}\n` +
             `[PED ] Protocol Error Data Phase  = ${reg.EVNT.fields.PED}\n` +
             `[ARA ] Access to Reserved Address = ${reg.EVNT.fields.ARA}`
    });

    // 3. Add event-specific warnings/errors
    if (reg.EVNT.fields.BO === 1) {
      reg.EVNT.report.push({
        severityLevel: sevC.Error, // error
        msg: `Bus Off condition detected - CAN controller is offline`
      });
    }
    if (reg.EVNT.fields.EP === 1) {
      reg.EVNT.report.push({
        severityLevel: sevC.Warn, // warning
        msg: `Error Passive state - high error rate detected`
      });
    }
    if (reg.EVNT.fields.EW === 1) {
      reg.EVNT.report.push({
        severityLevel: sevC.Recom, // recommendation
        msg: `Error Warning state - monitor error counters`
      });
    }
    if (reg.EVNT.fields.MRAF === 1) {
      reg.EVNT.report.push({
        severityLevel: sevC.Error, // error
        msg: `Message RAM Access Failure detected`
      });
    }
  }

  // === LOCK: Unlock Sequence Register ===================================
  if ('LOCK' in reg && reg.LOCK.int32 !== undefined) {
    const regValue = reg.LOCK.int32;

    // 0. Extend existing register structure
    reg.LOCK.fields = {};
    reg.LOCK.report = []; // Initialize report array

    // 1. Decode LOCK register
    reg.LOCK.fields.UNLOCK = regValue; // Unlock Value

    // 2. Generate human-readable register report
  reg.LOCK.report.push({
        severityLevel: sevC.Info, // info
        msg: `LOCK: ${reg.LOCK.name_long} (0x${reg.LOCK.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[UNLOCK] Unlock Value = 0x${regValue.toString(16).toUpperCase().padStart(8, '0')}`
    });
  }

  // === CTRL: Control Register ==========================================
  if ('CTRL' in reg && reg.CTRL.int32 !== undefined) {
    const regValue = reg.CTRL.int32;

    // 0. Extend existing register structure
    reg.CTRL.fields = {};
    reg.CTRL.report = []; // Initialize report array

    // 1. Decode all individual bits of CTRL register
    reg.CTRL.fields.NISO = getBits(regValue, 15, 15); // Non-ISO Operation
    reg.CTRL.fields.TXP = getBits(regValue, 14, 14); // Transmit Pause
    reg.CTRL.fields.EFBI = getBits(regValue, 13, 13); // Edge Filtering during Bus Integration
    reg.CTRL.fields.PXHD = getBits(regValue, 12, 12); // Protocol Exception Handling Disable
    reg.CTRL.fields.WMM = getBits(regValue, 11, 11); // Wide Message Marker
    reg.CTRL.fields.UTSU = getBits(regValue, 10, 10); // Use Timestamping Unit
    reg.CTRL.fields.BRSE = getBits(regValue, 9, 9); // Bit Rate Switch Enable
    reg.CTRL.fields.LOM = getBits(regValue, 8, 8); // Loop Back Mode
    reg.CTRL.fields.DAR = getBits(regValue, 7, 7); // Disable Automatic Retransmission
    reg.CTRL.fields.CCE = getBits(regValue, 6, 6); // Configuration Change Enable
    reg.CTRL.fields.TEST = getBits(regValue, 5, 5); // Test Mode Enable
    reg.CTRL.fields.MON = getBits(regValue, 4, 4); // Bus Monitoring Mode
    reg.CTRL.fields.CSR = getBits(regValue, 3, 3); // Clock Stop Request
    reg.CTRL.fields.CSA = getBits(regValue, 2, 2); // Clock Stop Acknowledge
    reg.CTRL.fields.ASM = getBits(regValue, 1, 1); // Restricted Operation Mode
    reg.CTRL.fields.INIT = getBits(regValue, 0, 0); // Initialization

    // 2. Generate human-readable register report
  reg.CTRL.report.push({
        severityLevel: sevC.Info, // info
        msg: `CTRL: ${reg.CTRL.name_long} (0x${reg.CTRL.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[NISO] Non-ISO Operation              = ${reg.CTRL.fields.NISO}\n` +
             `[TXP ] Transmit Pause                 = ${reg.CTRL.fields.TXP}\n` +
             `[EFBI] Edge Filtering Bus Integration = ${reg.CTRL.fields.EFBI}\n` +
             `[PXHD] Protocol Exception Disable     = ${reg.CTRL.fields.PXHD}\n` +
             `[WMM ] Wide Message Marker            = ${reg.CTRL.fields.WMM}\n` +
             `[UTSU] Use Timestamping Unit          = ${reg.CTRL.fields.UTSU}\n` +
             `[BRSE] Bit Rate Switch Enable         = ${reg.CTRL.fields.BRSE}\n` +
             `[LOM ] Loop Back Mode                 = ${reg.CTRL.fields.LOM}\n` +
             `[DAR ] Disable Auto Retransmission    = ${reg.CTRL.fields.DAR}\n` +
             `[CCE ] Configuration Change Enable    = ${reg.CTRL.fields.CCE}\n` +
             `[TEST] Test Mode Enable               = ${reg.CTRL.fields.TEST}\n` +
             `[MON ] Bus Monitoring Mode            = ${reg.CTRL.fields.MON}\n` +
             `[CSR ] Clock Stop Request             = ${reg.CTRL.fields.CSR}\n` +
             `[CSA ] Clock Stop Acknowledge         = ${reg.CTRL.fields.CSA}\n` +
             `[ASM ] Restricted Operation Mode      = ${reg.CTRL.fields.ASM}\n` +
             `[INIT] Initialization                 = ${reg.CTRL.fields.INIT}`
    });

    // 3. Add control-specific information
    if (reg.CTRL.fields.INIT === 1) {
      reg.CTRL.report.push({
        severityLevel: sevC.Recom, // recommendation
        msg: `Controller is in Initialization mode - switch to Normal mode for operation`
      });
    }
    if (reg.CTRL.fields.MON === 1) {
      reg.CTRL.report.push({
        severityLevel: sevC.Info, // info
        msg: `Bus Monitoring Mode is active - controller will not transmit`
      });
    }
  }

  // === FIMC: Fault Injection Module Control Register ===================
  if ('FIMC' in reg && reg.FIMC.int32 !== undefined) {
    const regValue = reg.FIMC.int32;

    // 0. Extend existing register structure
    reg.FIMC.fields = {};
    reg.FIMC.report = []; // Initialize report array

    // 1. Decode all individual bits of FIMC register
    reg.FIMC.fields.FIME = getBits(regValue, 31, 31); // Fault Injection Module Enable
    reg.FIMC.fields.FIMS = getBits(regValue, 30, 29); // Fault Injection Module Select
    reg.FIMC.fields.FIMF = getBits(regValue, 28, 24); // Fault Injection Module Function
    reg.FIMC.fields.FIMP = getBits(regValue, 23, 16); // Fault Injection Module Parameter
    reg.FIMC.fields.FIMV = getBits(regValue, 15, 0);  // Fault Injection Module Value

    // 2. Generate human-readable register report
  reg.FIMC.report.push({
        severityLevel: sevC.Info, // info
        msg: `FIMC: ${reg.FIMC.name_long} (0x${reg.FIMC.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[FIME] Fault Injection Enable        = ${reg.FIMC.fields.FIME}\n` +
             `[FIMS] Fault Injection Module Select = ${reg.FIMC.fields.FIMS}\n` +
             `[FIMF] Fault Injection Function      = ${reg.FIMC.fields.FIMF}\n` +
             `[FIMP] Fault Injection Parameter     = ${reg.FIMC.fields.FIMP}\n` +
             `[FIMV] Fault Injection Value         = ${reg.FIMC.fields.FIMV}`
    });

    // 3. Add fault injection warnings
    if (reg.FIMC.fields.FIME === 1) {
      reg.FIMC.report.push({
        severityLevel: sevC.Warn, // warning
        msg: `Fault Injection Module is enabled - this should only be used for testing`
      });
    }
  }

  // === TEST: Hardware Test Functions Register ========================
  if ('TEST' in reg && reg.TEST.int32 !== undefined) {
    const regValue = reg.TEST.int32;

    // 0. Extend existing register structure
    reg.TEST.fields = {};
    reg.TEST.report = []; // Initialize report array

    // 1. Decode all individual bits of TEST register
    reg.TEST.fields.SVAL = getBits(regValue, 21, 21); // Start Value
    reg.TEST.fields.TXBNS = getBits(regValue, 20, 16); // TX Buffer Number Select
    reg.TEST.fields.PVAL = getBits(regValue, 15, 15); // Prepend Value
    reg.TEST.fields.TXBNP = getBits(regValue, 14, 10); // TX Buffer Number Prepend
    reg.TEST.fields.RX = getBits(regValue, 7, 7); // Receive Pin
    reg.TEST.fields.TX = getBits(regValue, 6, 5); // TX Pin Control
    reg.TEST.fields.LBCK = getBits(regValue, 4, 4); // Loop Back Mode
    reg.TEST.fields.SILENT = getBits(regValue, 3, 3); // Silent Mode
    reg.TEST.fields.BASIC = getBits(regValue, 2, 2); // Basic Mode

    // 2. Generate human-readable register report
  reg.TEST.report.push({
        severityLevel: sevC.Info, // info
        msg: `TEST: ${reg.TEST.name_long} (0x${reg.TEST.addr.toString(16).toUpperCase().padStart(3, '0')}: 0x${regValue.toString(16).toUpperCase().padStart(8, '0')})\n` +
             `[SVAL ] Start Value              = ${reg.TEST.fields.SVAL}\n` +
             `[TXBNS] TX Buffer Number Select  = ${reg.TEST.fields.TXBNS}\n` +
             `[PVAL ] Prepend Value            = ${reg.TEST.fields.PVAL}\n` +
             `[TXBNP] TX Buffer Number Prepend = ${reg.TEST.fields.TXBNP}\n` +
             `[RX   ] Receive Pin              = ${reg.TEST.fields.RX}\n` +
             `[TX   ] TX Pin Control           = ${reg.TEST.fields.TX}\n` +
             `[LBCK ] Loop Back Mode           = ${reg.TEST.fields.LBCK}\n` +
             `[SILENT] Silent Mode             = ${reg.TEST.fields.SILENT}\n` +
             `[BASIC] Basic Mode               = ${reg.TEST.fields.BASIC}`
    });

    // 3. Add test mode information
    if (reg.TEST.fields.LBCK === 1) {
      reg.TEST.report.push({
        severityLevel: sevC.Recom, // recommendation
        msg: `Loop Back Mode is active - for testing only`
      });
    }
    if (reg.TEST.fields.SILENT === 1) {
      reg.TEST.report.push({
        severityLevel: sevC.Recom, // recommendation
        msg: `Silent Mode is active - controller will not transmit dominant bits`
      });
    }
  }
} // PRT others