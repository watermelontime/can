// All rights reserved. (c) 2026 //

// X_CAN: MH register decoding
import { getBits } from './help_functions.js';
import { defineField } from './help_functions.js';
import { sevC } from './help_functions.js';
import { getBinaryLineData } from './help_functions.js';

// ===================================================================================
// MH Global registers: VERSION, MH_CTRL, MH_CFG (detailed decoding)
export function procRegsMhGlobal(reg) {
  // === VERSION: Release Identification Register ========================
  if ('VERSION' in reg && reg.VERSION.int32 !== undefined) {
    const regValue = reg.VERSION.int32;

    // 0. Extend existing register structure
    reg.VERSION.fields = {};
    reg.VERSION.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.VERSION, regValue, 'REL', 31, 28, 'Release');
    defineField(reg.VERSION, regValue, 'STEP', 27, 24, 'Step');
    defineField(reg.VERSION, regValue, 'SUBSTEP', 23, 20, 'Substep');
    defineField(reg.VERSION, regValue, 'YEAR', 19, 16, 'Year');
    defineField(reg.VERSION, regValue, 'MON', 15, 8, 'Month');
    defineField(reg.VERSION, regValue, 'DAY', 7, 0, 'Day');
    const f = reg.VERSION.fields;

  // 1. Decode all individual bits of MODE register
  // Bit fields (BCD-coded date fields per spec)
    reg.VERSION.report.push({
      severityLevel: sevC.info,
      msg: `VERSION: ${reg.VERSION.name_long} (0x${reg.VERSION.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.REL.name_short.padEnd(7)}] ${f.REL.name_long.padEnd(8)} = 0x${f.REL.value.toString(16).toUpperCase()}\n` +
           `[${f.STEP.name_short.padEnd(7)}] ${f.STEP.name_long.padEnd(8)} = 0x${f.STEP.value.toString(16).toUpperCase()}\n` +
           `[${f.SUBSTEP.name_short.padEnd(7)}] ${f.SUBSTEP.name_long.padEnd(8)} = 0x${f.SUBSTEP.value.toString(16).toUpperCase()}\n` +
           `[${f.YEAR.name_short.padEnd(7)}] ${f.YEAR.name_long.padEnd(8)} = 0x${f.YEAR.value.toString(16).toUpperCase()}\n` +
           `[${f.MON.name_short.padEnd(7)}] ${f.MON.name_long.padEnd(8)} = 0x${f.MON.value.toString(16).toUpperCase().padStart(2,'0')}\n` +
           `[${f.DAY.name_short.padEnd(7)}] ${f.DAY.name_long.padEnd(8)} = 0x${f.DAY.value.toString(16).toUpperCase().padStart(2,'0')}`
    });

    // 2. Generate human-readable register report
    reg.VERSION.report.push({
      severityLevel: sevC.infoBold,
      msg: `VERSION: X_CAN MH V${f.REL.value.toString(16).toUpperCase()}.${f.STEP.value.toString(16).toUpperCase()}.${f.SUBSTEP.value.toString(16).toUpperCase()}, Date ${f.DAY.value.toString(16).toUpperCase().padStart(2,'0')}.${f.MON.value.toString(16).toUpperCase().padStart(2,'0')}.202${f.YEAR.value.toString(16).toUpperCase()}`
    });
  } // VERSION

  // === MH_CTRL: Message Handler Control register =======================
  if ('MH_CTRL' in reg && reg.MH_CTRL.int32 !== undefined) {
    const regValue = reg.MH_CTRL.int32;

    // 0. Extend existing register structure
    reg.MH_CTRL.fields = {};
    reg.MH_CTRL.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.MH_CTRL, regValue, 'START', 0, 0, 'Start MH');
    const f = reg.MH_CTRL.fields;

    // 2. Generate human-readable register report
    reg.MH_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `MH_CTRL: ${reg.MH_CTRL.name_long} (0x${reg.MH_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.START.name_short.padEnd(5)}] ${f.START.name_long.padEnd(8)} = ${f.START.value} (1: started and MH config. regs. locked)`
    });
  } // MH_CTRL

  // === MH_CFG: Message Handler Configuration register ==================
  if ('MH_CFG' in reg && reg.MH_CFG.int32 !== undefined) {
    const regValue = reg.MH_CFG.int32;

    // 0. Extend existing register structure
    reg.MH_CFG.fields = {};
    reg.MH_CFG.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.MH_CFG, regValue, 'INST_NUM', 18, 16, 'Instance Number (of X_CAN IP)');
    defineField(reg.MH_CFG, regValue, 'MAX_RETRANS', 10, 8, 'Maximum TX re-transmissions');
    defineField(reg.MH_CFG, regValue, 'RX_CONT_DC', 0, 0, 'RX Continuous Data Container mode');
    const f = reg.MH_CFG.fields;

    // 2. Generate human-readable register report
    reg.MH_CFG.report.push({
      severityLevel: sevC.info,
      msg: `MH_CFG: ${reg.MH_CFG.name_long} (0x${reg.MH_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.INST_NUM.name_short.padEnd(11)}] ${f.INST_NUM.name_long.padEnd(33)} = ${f.INST_NUM.value}\n` +
           `[${f.MAX_RETRANS.name_short.padEnd(11)}] ${f.MAX_RETRANS.name_long.padEnd(33)} = ${f.MAX_RETRANS.value} (0: NO, 1-6: 1-6, 7: unlimited)\n` +
           `[${f.RX_CONT_DC.name_short.padEnd(11)}] ${f.RX_CONT_DC.name_long.padEnd(33)} = ${f.RX_CONT_DC.value}`
    });
  } // MH_CFG

  // === MH_STS: Message Handler Status register =======================
  if ('MH_STS' in reg && reg.MH_STS.int32 !== undefined) {
    const regValue = reg.MH_STS.int32;

    // 0. Extend existing register structure
    reg.MH_STS.fields = {};
    reg.MH_STS.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.MH_STS, regValue, 'CLOCK_ACTIVE', 8, 8, 'MH Core Clock Active');
    defineField(reg.MH_STS, regValue, 'ENABLE', 4, 4, 'PRT Enable Signal');
    defineField(reg.MH_STS, regValue, 'BUSY', 0, 0, 'General Busy Flag');
    const f = reg.MH_STS.fields;

    // 2. Generate human-readable register report
    reg.MH_STS.report.push({
      severityLevel: sevC.info,
      msg: `MH_STS: ${reg.MH_STS.name_long} (0x${reg.MH_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.CLOCK_ACTIVE.name_short.padEnd(12)}] ${f.CLOCK_ACTIVE.name_long.padEnd(20)} = ${f.CLOCK_ACTIVE.value} (1: clock active)\n` +
           `[${f.ENABLE.name_short.padEnd(12)}] ${f.ENABLE.name_long.padEnd(20)} = ${f.ENABLE.value} (1: PRT is started)\n` +
           `[${f.BUSY.name_short.padEnd(12)}] ${f.BUSY.name_long.padEnd(20)} = ${f.BUSY.value}`
    });
  }

  // === MH_SFTY_CFG: Safety Configuration =============================
  if ('MH_SFTY_CFG' in reg && reg.MH_SFTY_CFG.int32 !== undefined) {
    const regValue = reg.MH_SFTY_CFG.int32;

    // 0. Extend existing register structure
    reg.MH_SFTY_CFG.fields = {};
    reg.MH_SFTY_CFG.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.MH_SFTY_CFG, regValue, 'PRESCALER', 31, 30, 'Watchdog Tick Prescaler');
    defineField(reg.MH_SFTY_CFG, regValue, 'PRT_TO_VAL', 29, 16, 'PRT/MH IF Timeout Ticks');
    defineField(reg.MH_SFTY_CFG, regValue, 'MEM_TO_VAL', 15, 8, 'MEM AXI Timeout Ticks');
    defineField(reg.MH_SFTY_CFG, regValue, 'DMA_TO_VAL', 7, 0, 'DMA AXI Timeout Ticks');
    const f = reg.MH_SFTY_CFG.fields;

    // 2. Generate human-readable register report
    reg.MH_SFTY_CFG.report.push({
      severityLevel: sevC.info,
      msg: `MH_SFTY_CFG: ${reg.MH_SFTY_CFG.name_long} (0x${reg.MH_SFTY_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.PRESCALER.name_short.padEnd(10)}] ${f.PRESCALER.name_long.padEnd(23)} = ${f.PRESCALER.value} (0: clk/32, 1: clk/64, 2: clk/128, 3: clk/512)\n` +
           `[${f.PRT_TO_VAL.name_short.padEnd(10)}] ${f.PRT_TO_VAL.name_long.padEnd(23)} = ${f.PRT_TO_VAL.value}\n` +
           `[${f.MEM_TO_VAL.name_short.padEnd(10)}] ${f.MEM_TO_VAL.name_long.padEnd(23)} = ${f.MEM_TO_VAL.value}\n` +
           `[${f.DMA_TO_VAL.name_short.padEnd(10)}] ${f.DMA_TO_VAL.name_long.padEnd(23)} = ${f.DMA_TO_VAL.value}`
    });
  }

  // === MH_SFTY_CTRL: Safety Control ==================================
  if ('MH_SFTY_CTRL' in reg && reg.MH_SFTY_CTRL.int32 !== undefined) {
    const regValue = reg.MH_SFTY_CTRL.int32;

    // 0. Extend existing register structure
    reg.MH_SFTY_CTRL.fields = {};
    reg.MH_SFTY_CTRL.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.MH_SFTY_CTRL, regValue, 'PRT_TO_EN', 10, 10, 'PRT IF  Watchdog Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'MEM_TO_EN', 9, 9, 'MEM AXI Watchdog Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'DMA_TO_EN', 8, 8, 'DMA AXI Watchdog Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'DMA_CH_CHK_EN', 7, 7, 'DMA Channel Routing Check Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'RX_AP_PARITY_EN', 6, 6, 'RX Address Path Parity Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'TX_AP_PARITY_EN', 5, 5, 'TX Address Path Parity Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'TX_DP_PARITY_EN', 4, 4, 'TX Data Path Parity Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'RX_DP_PARITY_EN', 3, 3, 'RX Data Path Parity Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'MEM_PROT_EN', 2, 2, 'Memory Protection Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'RX_DESC_CRC_EN', 1, 1, 'RX Descriptor CRC Check Enable');
    defineField(reg.MH_SFTY_CTRL, regValue, 'TX_DESC_CRC_EN', 0, 0, 'TX Descriptor CRC Check Enable');
    const f = reg.MH_SFTY_CTRL.fields;

    // 2. Generate human-readable register report
    reg.MH_SFTY_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `MH_SFTY_CTRL: ${reg.MH_SFTY_CTRL.name_long} (0x${reg.MH_SFTY_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
      `[${f.PRT_TO_EN.name_short.padEnd(15)}] ${f.PRT_TO_EN.name_long.padEnd(32)} = ${f.PRT_TO_EN.value}\n` +
      `[${f.MEM_TO_EN.name_short.padEnd(15)}] ${f.MEM_TO_EN.name_long.padEnd(32)} = ${f.MEM_TO_EN.value}\n` +
      `[${f.DMA_TO_EN.name_short.padEnd(15)}] ${f.DMA_TO_EN.name_long.padEnd(32)} = ${f.DMA_TO_EN.value}\n` +
      `[${f.DMA_CH_CHK_EN.name_short.padEnd(15)}] ${f.DMA_CH_CHK_EN.name_long.padEnd(32)} = ${f.DMA_CH_CHK_EN.value}\n` +
      `[${f.RX_AP_PARITY_EN.name_short.padEnd(15)}] ${f.RX_AP_PARITY_EN.name_long.padEnd(32)} = ${f.RX_AP_PARITY_EN.value}\n` +
      `[${f.TX_AP_PARITY_EN.name_short.padEnd(15)}] ${f.TX_AP_PARITY_EN.name_long.padEnd(32)} = ${f.TX_AP_PARITY_EN.value}\n` +
      `[${f.TX_DP_PARITY_EN.name_short.padEnd(15)}] ${f.TX_DP_PARITY_EN.name_long.padEnd(32)} = ${f.TX_DP_PARITY_EN.value}\n` +
      `[${f.RX_DP_PARITY_EN.name_short.padEnd(15)}] ${f.RX_DP_PARITY_EN.name_long.padEnd(32)} = ${f.RX_DP_PARITY_EN.value}\n` +
      `[${f.MEM_PROT_EN.name_short.padEnd(15)}] ${f.MEM_PROT_EN.name_long.padEnd(32)} = ${f.MEM_PROT_EN.value}\n` +
      `[${f.RX_DESC_CRC_EN.name_short.padEnd(15)}] ${f.RX_DESC_CRC_EN.name_long.padEnd(32)} = ${f.RX_DESC_CRC_EN.value}\n` +
      `[${f.TX_DESC_CRC_EN.name_short.padEnd(15)}] ${f.TX_DESC_CRC_EN.name_long.padEnd(32)} = ${f.TX_DESC_CRC_EN.value}`
    });

    // Cross-checks with MH_SFTY_CTRL enable bits if available
    const sftyEna = reg.MH_SFTY_CTRL.fields;
    const sftyToVal = reg.MH_SFTY_CFG && reg.MH_SFTY_CFG.fields ? reg.MH_SFTY_CFG.fields : null;
    if (sftyToVal) {
      if (sftyEna.DMA_TO_EN.value === 1 && sftyToVal.DMA_TO_VAL.value === 0) {
        reg.MH_SFTY_CTRL.report.push({ severityLevel: sevC.warning, msg: 'MH_STY_CTRL: DMA_TO_VAL is 0 while DMA_TO_EN=1: DMA timeout triggers immediately.'});
      }
      if (sftyEna.MEM_TO_EN.value === 1 && sftyToVal.MEM_TO_VAL.value === 0) {
        reg.MH_SFTY_CTRL.report.push({ severityLevel: sevC.warning, msg: 'MH_STY_CTRL: MEM_TO_VAL is 0 while MEM_TO_EN=1: MEM timeout triggers immediately.'});
      }
      if (sftyEna.PRT_TO_EN.value === 1 && sftyToVal.PRT_TO_VAL.value === 0) {
        reg.MH_SFTY_CTRL.report.push({ severityLevel: sevC.warning, msg: 'MH_STY_CTRL: PRT_TO_VAL is 0 while PRT_TO_EN=1: PRT timeout triggers immediately.'});
      }
    }
  }

  // === RX_FILTER_MEM_ADD: RX Filter Base Address ======================
  if ('RX_FILTER_MEM_ADD' in reg && reg.RX_FILTER_MEM_ADD.int32 !== undefined) {
    const regValue = reg.RX_FILTER_MEM_ADD.int32;

    // 0. Extend existing register structure
    reg.RX_FILTER_MEM_ADD.fields = {};
    reg.RX_FILTER_MEM_ADD.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.RX_FILTER_MEM_ADD, regValue, 'BASE_ADDR', 15, 0, 'RX Filter Base Address (L_MEM)');
    const f = reg.RX_FILTER_MEM_ADD.fields;
    const base = f.BASE_ADDR.value;
    const alignOk = (base & 0x3) === 0;

    // 2. Generate human-readable register report
    reg.RX_FILTER_MEM_ADD.report.push({
      severityLevel: sevC.info,
      msg: `RX_FILTER_MEM_ADD: ${reg.RX_FILTER_MEM_ADD.name_long} (0x${reg.RX_FILTER_MEM_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.BASE_ADDR.name_short.padEnd(9)}] ${f.BASE_ADDR.name_long.padEnd(30)} = 0x${base.toString(16).toUpperCase().padStart(5,'0')} (16 bit, expected bits[1:0]=0)`
    });

    // 3. Check Address Alignment
    if ((f.BASE_ADDR.value & 0x3) !== 0) {
      reg.RX_FILTER_MEM_ADD.report.push({ severityLevel: sevC.warning, msg: 'RX_FILTER_MEM_ADD: RX Filter Base Address not word-aligned (LSBs [1:0] should be 0). LSBs [1:0] are ignored by X_CAN.'});
    }
  }

  // === TX_DESC_MEM_ADD: TX Descriptor Base Address ====================
  if ('TX_DESC_MEM_ADD' in reg && reg.TX_DESC_MEM_ADD.int32 !== undefined) {
    const regValue = reg.TX_DESC_MEM_ADD.int32;

    // 0. Extend existing register structure
    reg.TX_DESC_MEM_ADD.fields = {};
    reg.TX_DESC_MEM_ADD.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.TX_DESC_MEM_ADD, regValue, 'PQ_BASE_ADDR', 31, 16, 'TX Priority Queue Base Address');
    defineField(reg.TX_DESC_MEM_ADD, regValue, 'FQ_BASE_ADDR', 15, 0, 'TX FIFO Queue Base Address');
    const f = reg.TX_DESC_MEM_ADD.fields;
    const alignFqOk = (f.FQ_BASE_ADDR.value & 0x3) === 0;
    const alignPqOk = (f.PQ_BASE_ADDR.value & 0x3) === 0;

    // 2. Generate human-readable register report
    reg.TX_DESC_MEM_ADD.report.push({
      severityLevel: sevC.info,
      msg: `TX_DESC_MEM_ADD: ${reg.TX_DESC_MEM_ADD.name_long} (0x${reg.TX_DESC_MEM_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.PQ_BASE_ADDR.name_short.padEnd(12)}] ${f.PQ_BASE_ADDR.name_long.padEnd(30)} = 0x${f.PQ_BASE_ADDR.value.toString(16).toUpperCase().padStart(4,'0')} (16 bit, expected bits[1:0]=0)\n` +
           `[${f.FQ_BASE_ADDR.name_short.padEnd(12)}] ${f.FQ_BASE_ADDR.name_long.padEnd(30)} = 0x${f.FQ_BASE_ADDR.value.toString(16).toUpperCase().padStart(4,'0')} (16 bit, expected bits[1:0]=0)`
    });
    if (!alignPqOk) {
      reg.TX_DESC_MEM_ADD.report.push({ severityLevel: sevC.warning, msg: 'TX_DESC_MEM_ADD: TX PQ Base Address not word-aligned (LSBs [1:0] should be 0).' });
    }
    if (!alignFqOk) {
      reg.TX_DESC_MEM_ADD.report.push({ severityLevel: sevC.warning, msg: 'TX_DESC_MEM_ADD: TX FQ Base Address not word-aligned (LSBs [1:0] should be 0).' });
    }
  }

  // === AXI_ADD_EXT: AXI address extension =============================
  if ('AXI_ADD_EXT' in reg && reg.AXI_ADD_EXT.int32 !== undefined) {
    const regValue = reg.AXI_ADD_EXT.int32;
    reg.AXI_ADD_EXT.fields = {};
    reg.AXI_ADD_EXT.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.AXI_ADD_EXT, regValue, 'VAL', 31, 0, 'AXI Address Extension', r => r >>> 0);
    const f = reg.AXI_ADD_EXT.fields;

    // 2. Generate human-readable register report
    reg.AXI_ADD_EXT.report.push({
      severityLevel: sevC.info,
      msg: `AXI_ADD_EXT: ${reg.AXI_ADD_EXT.name_long} (0x${reg.AXI_ADD_EXT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(21)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }

  // === AXI_PARAMS: AXI parameter register =============================
  if ('AXI_PARAMS' in reg && reg.AXI_PARAMS.int32 !== undefined) {
    const regValue = reg.AXI_PARAMS.int32;

    // 0. Extend existing register structure
    reg.AXI_PARAMS.fields = {};
    reg.AXI_PARAMS.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.AXI_PARAMS, regValue, 'AW_MAX_PEND', 5, 4, 'Max pending AXI writes');
    defineField(reg.AXI_PARAMS, regValue, 'AR_MAX_PEND', 1, 0, 'Max pending AXI reads');
    const f = reg.AXI_PARAMS.fields;

    // 2. Generate human-readable register report
    const pendMap = (v, kind) => {
      if (v === 0) return 'no ' + kind + ' transfers';
      if (v === 1) return '1 outstanding ' + kind + ' transaction';
      if (v === 2) return '2 outstanding ' + kind + ' transactions';
      if (v === 3) return '3 outstanding ' + kind + ' transactions  ';
      return `${v}`;
    };

    reg.AXI_PARAMS.report.push({
      severityLevel: sevC.info,
      msg: `AXI_PARAMS: ${reg.AXI_PARAMS.name_long} (0x${reg.AXI_PARAMS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.AW_MAX_PEND.name_short.padEnd(11)}] ${f.AW_MAX_PEND.name_long.padEnd(22)} = ${f.AW_MAX_PEND.value} (= ${pendMap(f.AW_MAX_PEND.value,'write')})\n` +
           `[${f.AR_MAX_PEND.name_short.padEnd(11)}] ${f.AR_MAX_PEND.name_long.padEnd(22)} = ${f.AR_MAX_PEND.value} (= ${pendMap(f.AR_MAX_PEND.value,'read ')})`
    });

    // 3. Check AW_MAX_PEND and AR_MAX_PEND values
    if (f.AW_MAX_PEND.value === 0) {
      reg.AXI_PARAMS.report.push({ severityLevel: sevC.error, msg: 'AXI_PARAMS: AW_MAX_PEND is 0: No AXI write transfers possible.'});
    }

    // Check AR_MAX_PEND and AR_MAX_PEND values
    if (f.AR_MAX_PEND.value === 0) {
      reg.AXI_PARAMS.report.push({ severityLevel: sevC.error, msg: 'AXI_PARAMS: AR_MAX_PEND is 0: No AXI read transfers possible.'});
    }

  }

  // === MH_LOCK: Message Handler Lock register =========================
  if ('MH_LOCK' in reg && reg.MH_LOCK.int32 !== undefined) {
    const regValue = reg.MH_LOCK.int32;

    // 0. Extend existing register structure
    reg.MH_LOCK.fields = {};
    reg.MH_LOCK.report = [];

    // 1. Decode all individual bits of MODE register
    defineField(reg.MH_LOCK, regValue, 'TMK', 31, 16, 'Test Mode Key');
    defineField(reg.MH_LOCK, regValue, 'ULK', 15, 0, 'Unlock Key');
    const f = reg.MH_LOCK.fields;

    // 2. Generate human-readable register report
    reg.MH_LOCK.report.push({
      severityLevel: sevC.info,
      msg: `MH_LOCK: ${reg.MH_LOCK.name_long} (0x${reg.MH_LOCK.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.TMK.name_short.padEnd(3)}] ${f.TMK.name_long.padEnd(13)} = 0x${f.TMK.value.toString(16).toUpperCase().padStart(4,'0')}\n` +
           `[${f.ULK.name_short.padEnd(3)}] ${f.ULK.name_long.padEnd(13)} = 0x${f.ULK.value.toString(16).toUpperCase().padStart(4,'0')}`
    });
  }
} // MH Global

// TX FIFO queue
export function procRegsMhTXFQ(reg) {
  // Helper: list set bit indices for 8-bit fields, MSB->LSB
  const listSetIdx8 = (mask) => {
    const ids = [];
    for (let i = 7; i >= 0; i--) {
      if (((mask >>> i) & 0x1) === 1) ids.push(i);
    }
    return ids;
  };

  // === TX_DESC_ADD_PT: TX descriptor current address pointer =========
  if ('TX_DESC_ADD_PT' in reg && reg.TX_DESC_ADD_PT.int32 !== undefined) {
    const regValue = reg.TX_DESC_ADD_PT.int32;

    // 0. Extend existing register structure
    reg.TX_DESC_ADD_PT.fields = {};
    reg.TX_DESC_ADD_PT.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_DESC_ADD_PT, regValue, 'VAL', 31, 0, 'TX Descriptor Address (SMEM) currently used by MH', r => r >>> 0);
    const f = reg.TX_DESC_ADD_PT.fields;

    // 2. Generate human-readable register report
    reg.TX_DESC_ADD_PT.report.push({
      severityLevel: sevC.info,
      msg: `TX_DESC_ADD_PT: ${reg.TX_DESC_ADD_PT.name_long} (0x${reg.TX_DESC_ADD_PT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(49)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }

  // === TX_STATISTICS: TX Message Counter =============================
  if ('TX_STATISTICS' in reg && reg.TX_STATISTICS.int32 !== undefined) {
    const regValue = reg.TX_STATISTICS.int32;

    // 0. Extend existing register structure
    reg.TX_STATISTICS.fields = {};
    reg.TX_STATISTICS.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_STATISTICS, regValue, 'UNSUCC', 27, 16, 'Unsuccessful TX Count');
    defineField(reg.TX_STATISTICS, regValue, 'SUCC', 11, 0, 'Successful   TX Count');
    const f = reg.TX_STATISTICS.fields;

    // 2. Generate human-readable register report
    reg.TX_STATISTICS.report.push({
      severityLevel: sevC.info,
      msg: `TX_STATISTICS: ${reg.TX_STATISTICS.name_long} (0x${reg.TX_STATISTICS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.UNSUCC.name_short.padEnd(6)}] ${f.UNSUCC.name_long.padEnd(21)} = ${f.UNSUCC.value}\n` +
           `[${f.SUCC.name_short.padEnd(6)}] ${f.SUCC.name_long.padEnd(21)} = ${f.SUCC.value}`
    });
  }

  // === TX_FQ_STS0: TX FIFO Queue Status (BUSY/STOP) ==================
  if ('TX_FQ_STS0' in reg && reg.TX_FQ_STS0.int32 !== undefined) {
    const regValue = reg.TX_FQ_STS0.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_STS0.fields = {};
    reg.TX_FQ_STS0.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_FQ_STS0, regValue, 'STOP', 23, 16, 'On Hold Queues');
    defineField(reg.TX_FQ_STS0, regValue, 'BUSY', 7, 0, 'Active  Queues');
    const f = reg.TX_FQ_STS0.fields;

    const stopIdx = listSetIdx8(f.STOP.value);
    const busyIdx = listSetIdx8(f.BUSY.value);

    // 2. Generate human-readable register report
    reg.TX_FQ_STS0.report.push({
      severityLevel: sevC.info,
      msg: `TX_FQ_STS0: ${reg.TX_FQ_STS0.name_long} (0x${reg.TX_FQ_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.STOP.name_short.padEnd(4)}] ${f.STOP.name_long.padEnd(14)} = 0x${f.STOP.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${stopIdx.length?stopIdx.join(', '):'none'}\n` +
           `[${f.BUSY.name_short.padEnd(4)}] ${f.BUSY.name_long.padEnd(14)} = 0x${f.BUSY.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${busyIdx.length?busyIdx.join(', '):'none'}`
    });
  }

  // === TX_FQ_STS1: TX FIFO Queue Status (UNVALID/ERROR) ==============
  if ('TX_FQ_STS1' in reg && reg.TX_FQ_STS1.int32 !== undefined) {
    const regValue = reg.TX_FQ_STS1.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_STS1.fields = {};
    reg.TX_FQ_STS1.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_FQ_STS1, regValue, 'ERROR', 23, 16, 'Descriptor with ERROR   Queues');
    defineField(reg.TX_FQ_STS1, regValue, 'UNVALID', 7, 0, 'Descriptor with VALID=0 Queues');
    const f = reg.TX_FQ_STS1.fields;

    const errIdx = listSetIdx8(f.ERROR.value);
    const invIdx = listSetIdx8(f.UNVALID.value);

    // 2. Generate human-readable register report
    reg.TX_FQ_STS1.report.push({
      severityLevel: sevC.info,
      msg: `TX_FQ_STS1: ${reg.TX_FQ_STS1.name_long} (0x${reg.TX_FQ_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ERROR.name_short.padEnd(7)}] ${f.ERROR.name_long.padEnd(30)} = 0x${f.ERROR.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${errIdx.length?errIdx.join(', '):'none'}\n` +
           `[${f.UNVALID.name_short.padEnd(7)}] ${f.UNVALID.name_long.padEnd(30)} = 0x${f.UNVALID.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${invIdx.length?invIdx.join(', '):'none'}`
    });
  }

  // === TX_FQ_CTRL2: TX FIFO Queue Control 2 (ENABLE) =================
  if ('TX_FQ_CTRL2' in reg && reg.TX_FQ_CTRL2.int32 !== undefined) {
    const regValue = reg.TX_FQ_CTRL2.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_CTRL2.fields = {};
    reg.TX_FQ_CTRL2.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_FQ_CTRL2, regValue, 'ENABLE', 7, 0, 'Enabled Queues');
    const f = reg.TX_FQ_CTRL2.fields;
    const enaIdx = listSetIdx8(f.ENABLE.value);

    // 2. Generate human-readable register report
    reg.TX_FQ_CTRL2.report.push({
      severityLevel: sevC.info,
      msg: `TX_FQ_CTRL2: ${reg.TX_FQ_CTRL2.name_long} (0x${reg.TX_FQ_CTRL2.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ENABLE.name_short.padEnd(6)}] ${f.ENABLE.name_long.padEnd(14)} = 0x${f.ENABLE.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${enaIdx.length?enaIdx.join(', '):'none'}`
    });
  }

  // === TX_FQ_CTRL1: TX FIFO Queue Control 1 (ABORT) ==================
  if ('TX_FQ_CTRL1' in reg && reg.TX_FQ_CTRL1.int32 !== undefined) {
    const regValue = reg.TX_FQ_CTRL1.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_CTRL1.fields = {};
    reg.TX_FQ_CTRL1.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_FQ_CTRL1, regValue, 'ABORT', 7, 0, 'Aborted Queues');
    const f = reg.TX_FQ_CTRL1.fields;
    const abortIdx = listSetIdx8(f.ABORT.value);

    // 2. Generate human-readable register report
    reg.TX_FQ_CTRL1.report.push({
      severityLevel: sevC.info,
      msg: `TX_FQ_CTRL1: ${reg.TX_FQ_CTRL1.name_long} (0x${reg.TX_FQ_CTRL1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ABORT.name_short.padEnd(5)}] ${f.ABORT.name_long.padEnd(14)} = 0x${f.ABORT.value.toString(16).toUpperCase().padStart(2,'0')}  => FIFOs: ${abortIdx.length?abortIdx.join(', '):'none'}`
    });
  }

  // === TX_FQ_CTRL0: TX FIFO Queue Control 0 (START) ==================
  if ('TX_FQ_CTRL0' in reg && reg.TX_FQ_CTRL0.int32 !== undefined) {
    const regValue = reg.TX_FQ_CTRL0.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_CTRL0.fields = {};
    reg.TX_FQ_CTRL0.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_FQ_CTRL0, regValue, 'START', 7, 0, 'Started Queues');
    const f = reg.TX_FQ_CTRL0.fields;
    const startIdx = listSetIdx8(f.START.value);

    // 2. Generate human-readable register report
    reg.TX_FQ_CTRL0.report.push({
      severityLevel: sevC.info,
      msg: `TX_FQ_CTRL0: ${reg.TX_FQ_CTRL0.name_long} (0x${reg.TX_FQ_CTRL0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.START.name_short.padEnd(5)}] ${f.START.name_long.padEnd(14)} = 0x${f.START.value.toString(16).toUpperCase().padStart(2,'0')}) => FIFOs: ${startIdx.length?startIdx.join(', '):'none'}`
    });

    // Checks: require CTRL2.ENABLE[n] and PRT ENABLE high // Arthur: probably unnecessary, because not allowed by HW
    const enaMask = (reg.TX_FQ_CTRL2 && reg.TX_FQ_CTRL2.int32 !== undefined) ? getBits(reg.TX_FQ_CTRL2.int32, 7, 0) : undefined;
    const prtEnable = (reg.MH_STS && reg.MH_STS.int32 !== undefined) ? getBits(reg.MH_STS.int32, 4, 4) : undefined;
    if (startIdx.length && enaMask !== undefined) {
      const notEnabled = [];
      for (const q of startIdx) {
        if (((enaMask >>> q) & 1) === 0) notEnabled.push(q);
      }
      if (notEnabled.length) {
        reg.TX_FQ_CTRL0.report.push({ severityLevel: sevC.warning, msg: `TX_FQ_CTRL0: START requested for disabled queues: ${notEnabled.join(', ')}` });
      }
    }
    if (startIdx.length && prtEnable === 0) {
      reg.TX_FQ_CTRL0.report.push({ severityLevel: sevC.warning, msg: 'TX_FQ_CTRL0: START requested while PRT ENABLE=0 (MH_STS.ENABLE=0).' });
    }
  }

  // === TX FIFO Queues 1..7 (replicated pattern) ======================
  for (let q = 0; q <= 7; q++) {
    const addPtName   = `TX_FQ_ADD_PT${q}`;
    const startAddName= `TX_FQ_START_ADD${q}`;
    const sizeName    = `TX_FQ_SIZE${q}`;

    // --- Current Address Pointer (Queue q) ---------------------------
    if (addPtName in reg && reg[addPtName].int32 !== undefined) {
      const regValue = reg[addPtName].int32;
      reg[addPtName].fields = {};
      reg[addPtName].report = [];
      defineField(reg[addPtName], regValue, 'VAL', 31, 0, `TXFQ${q} Head Descriptor Address (SMEM)`, r => r >>> 0);
      const f = reg[addPtName].fields;
      reg[addPtName].report.push({
        severityLevel: sevC.info,
        msg: `${addPtName}: ${reg[addPtName].name_long} (0x${reg[addPtName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(36)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
      });
    }

    // --- Start Address (Queue q) -------------------------------------
    if (startAddName in reg && reg[startAddName].int32 !== undefined) {
      const regValue = reg[startAddName].int32;
      reg[startAddName].fields = {};
      reg[startAddName].report = [];
      defineField(reg[startAddName], regValue, 'VAL', 31, 0, `TXFQ${q} Start Address (SMEM)`, r => r >>> 0);
      const f = reg[startAddName].fields;
      const alignOk = (regValue & 0x3) === 0;
      reg[startAddName].report.push({
        severityLevel: sevC.info,
        msg: `${startAddName}: ${reg[startAddName].name_long} (0x${reg[startAddName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(36)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
      });
      if (!alignOk) {
        reg[startAddName].report.push({ severityLevel: sevC.warning, msg: `${startAddName}: Address not word-aligned (LSBs [1:0] should be 0).` });
      }
    }

    // --- Size Register (Queue q) ------------------------------------
    if (sizeName in reg && reg[sizeName].int32 !== undefined) {
      const regValue = reg[sizeName].int32;
      reg[sizeName].fields = {};
      reg[sizeName].report = [];
      defineField(reg[sizeName], regValue, 'MAX_DESC', 9, 0, `TXFQ${q} Max Descriptors`);
      const f = reg[sizeName].fields;
      const maxDesc = f.MAX_DESC.value;
      const memBytes = maxDesc > 0 ? (maxDesc * 32) >>> 0 : 0;
      reg[sizeName].report.push({
        severityLevel: sevC.info,
        msg: `${sizeName}: ${reg[sizeName].name_long} (0x${reg[sizeName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[${f.MAX_DESC.name_short.padEnd(8)}] ${f.MAX_DESC.name_long.padEnd(21)} = ${maxDesc}${maxDesc>0?` (allocates ${memBytes} bytes in S_MEM)`:''}`
      });
    }
  }

  // === Summary Table for all TX FIFO Queues (appended to last queue) ===
  try {
    const header    = 'Queue  START_ADD   ADD_PT      SIZE  Enabled  Start  Abort  Stop  Busy  Error  Unvalid';
    const separator = '--------------------------------------------------------------------------------------';
    const lines = [header, separator];

    // Pre-fetch masks if registers available
    const enaMask   = ('TX_FQ_CTRL2' in reg && reg.TX_FQ_CTRL2.int32 !== undefined) ? getBits(reg.TX_FQ_CTRL2.int32, 7, 0) : undefined;
    const startMask = ('TX_FQ_CTRL0' in reg && reg.TX_FQ_CTRL0.int32 !== undefined) ? getBits(reg.TX_FQ_CTRL0.int32, 7, 0) : undefined;
    const abortMask = ('TX_FQ_CTRL1' in reg && reg.TX_FQ_CTRL1.int32 !== undefined) ? getBits(reg.TX_FQ_CTRL1.int32, 7, 0) : undefined;
    const stopMask  = ('TX_FQ_STS0'  in reg && reg.TX_FQ_STS0.int32  !== undefined) ? getBits(reg.TX_FQ_STS0.int32, 23,16) : undefined;
    const busyMask  = ('TX_FQ_STS0'  in reg && reg.TX_FQ_STS0.int32  !== undefined) ? getBits(reg.TX_FQ_STS0.int32, 7, 0)  : undefined;
    const errMask   = ('TX_FQ_STS1'  in reg && reg.TX_FQ_STS1.int32  !== undefined) ? getBits(reg.TX_FQ_STS1.int32, 23,16) : undefined;
    const invMask   = ('TX_FQ_STS1'  in reg && reg.TX_FQ_STS1.int32  !== undefined) ? getBits(reg.TX_FQ_STS1.int32, 7, 0)  : undefined;

    for (let q = 0; q <= 7; q++) {
      const startAddName= `TX_FQ_START_ADD${q}`;
      const addPtName   = `TX_FQ_ADD_PT${q}`;
      const sizeName    = `TX_FQ_SIZE${q}`;

      const startRegVal = (startAddName in reg && reg[startAddName].fields && 'VAL' in reg[startAddName].fields) ? ('0x'+reg[startAddName].fields.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')) : '-';
      const addPtRegVal = (addPtName in reg && reg[addPtName].fields && 'VAL' in reg[addPtName].fields) ? ('0x'+reg[addPtName].fields.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')) : '-';
      const sizeVal     = (sizeName in reg && reg[sizeName].fields && 'MAX_DESC' in reg[sizeName].fields) ? (''+reg[sizeName].fields.MAX_DESC.value) : '-';

      const enaBit   = (enaMask   !== undefined) ? ((enaMask   >>> q) & 1).toString() : '-';
      const stBit    = (startMask !== undefined) ? ((startMask >>> q) & 1).toString() : '-';
      const abBit    = (abortMask !== undefined) ? ((abortMask >>> q) & 1).toString() : '-';
      const stopBit  = (stopMask  !== undefined) ? ((stopMask  >>> q) & 1).toString() : '-';
      const busyBit  = (busyMask  !== undefined) ? ((busyMask  >>> q) & 1).toString() : '-';
      const errBit   = (errMask   !== undefined) ? ((errMask   >>> q) & 1).toString() : '-';
      const invBit   = (invMask   !== undefined) ? ((invMask   >>> q) & 1).toString() : '-';

      const row = `TXFQ${q}  ${startRegVal.padEnd(10)}  ${addPtRegVal.padEnd(10)}  ${sizeVal.padEnd(4)}  ${enaBit.padEnd(7)}  ${stBit.padEnd(5)}  ${abBit.padEnd(5)}  ${stopBit.padEnd(4)}  ${busyBit.padEnd(4)}  ${errBit.padEnd(5)}  ${invBit}`;
      lines.push(row);
    }

    // Determine the last queue register to append summary (prefer SIZE7 -> ADD_PT7 -> START_ADD7 ... -> SIZE0)
    const preferList = [];
    for (let q = 7; q >= 0; q--) {
      preferList.push(`TX_FQ_SIZE${q}`);
      preferList.push(`TX_FQ_START_ADD${q}`);
      preferList.push(`TX_FQ_ADD_PT${q}`);
    }
    let target = null;
    for (const name of preferList) {
      if (name in reg && reg[name].report && Array.isArray(reg[name].report)) { target = reg[name]; break; }
    }
    if (!target) {
      // fallback: create a dummy holder (unlikely)
      reg.TX_FQ_SIZE0 = reg.TX_FQ_SIZE0 || { name_long: 'TX_FQ_SIZE0 (auto)', report: [] };
      target = reg.TX_FQ_SIZE0;
    }
    target.report.push({
      severityLevel: sevC.infoBold,
      msg: 'TX FIFO Queues Summary\n' + lines.join('\n')
    });
  } catch (e) {
    // On error create a dedicated synthetic register entry so the issue is clearly shown.
    const msg = 'TX FIFO summary generation failed: ' + (e && e.message ? e.message : e);
    if (!reg._TX_FIFO_SUMMARY) {
      reg._TX_FIFO_SUMMARY = { name_long: 'TX FIFO Summary (error)', report: [] };
    }
    if (!Array.isArray(reg._TX_FQ_SUMMARY.report)) reg._TX_FQ_SUMMARY.report = [];
    reg._TX_FQ_SUMMARY.report.push({ severityLevel: sevC.warning, msg });
  }
}

// TX Priority Queue
export function procRegsMhTXPQ(reg) {
  // Helper: list set bit indices for 32-bit slot masks, MSB->LSB
  const listSetIdx32 = (mask) => {
    const ids = [];
    for (let i = 31; i >= 0; i--) {
      if (((mask >>> i) & 0x1) === 1) ids.push(i);
    }
    return ids;
  };

  // === TX_PQ_STS0: Priority Queue Status (BUSY) =====================
  if ('TX_PQ_STS0' in reg && reg.TX_PQ_STS0.int32 !== undefined) {
    const regValue = reg.TX_PQ_STS0.int32;

    // 0. Extend existing register structure
    reg.TX_PQ_STS0.fields = {};
    reg.TX_PQ_STS0.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_PQ_STS0, regValue, 'BUSY', 31, 0, 'Active Slots (TX Pending)', r => r >>> 0);
    const f = reg.TX_PQ_STS0.fields;

    // 2. Generate human-readable register report
    const busyIdx = listSetIdx32(f.BUSY.decoded);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);

    reg.TX_PQ_STS0.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_STS0: ${reg.TX_PQ_STS0.name_long} (0x${reg.TX_PQ_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.BUSY.name_short.padEnd(4)}] ${f.BUSY.name_long.padEnd(25)} = 0x${f.BUSY.decoded.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${busyIdx.length?busyIdx.join(', '):'none'}\n` +
           binLineHead +
           binLineData
    });

  }

  // === TX_PQ_STS1: Priority Queue Status (SENT) =====================
  if ('TX_PQ_STS1' in reg && reg.TX_PQ_STS1.int32 !== undefined) {
    const regValue = reg.TX_PQ_STS1.int32;

    // 0. Extend existing register structure
    reg.TX_PQ_STS1.fields = {};
    reg.TX_PQ_STS1.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_PQ_STS1, regValue, 'SENT', 31, 0, 'Sent (TX Desc. SMEM update)', r => r >>> 0);
    const f = reg.TX_PQ_STS1.fields;

    // 2. Generate human-readable register report
    const sentIdx = listSetIdx32(f.SENT.decoded);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);
    reg.TX_PQ_STS1.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_STS1: ${reg.TX_PQ_STS1.name_long} (0x${reg.TX_PQ_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.SENT.name_short.padEnd(4)}] ${f.SENT.name_long.padEnd(27)} = 0x${f.SENT.decoded.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${sentIdx.length?sentIdx.join(', '):'none'}\n` +
           binLineHead +
           binLineData
    });
  }

  // === TX_PQ_CTRL0: Priority Queue Control 0 (START) ================
  if ('TX_PQ_CTRL0' in reg && reg.TX_PQ_CTRL0.int32 !== undefined) {
    const regValue = reg.TX_PQ_CTRL0.int32;
    // 0. Extend existing register structure
    reg.TX_PQ_CTRL0.fields = {};
    reg.TX_PQ_CTRL0.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_PQ_CTRL0, regValue, 'START', 31, 0, 'Started Slots', r => r >>> 0);
    const f = reg.TX_PQ_CTRL0.fields;

    // 2. Generate human-readable register report
    const startIdx = listSetIdx32(f.START.decoded);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);    
    reg.TX_PQ_CTRL0.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_CTRL0: ${reg.TX_PQ_CTRL0.name_long} (0x${reg.TX_PQ_CTRL0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.START.name_short.padEnd(5)}] ${f.START.name_long.padEnd(26)} = 0x${f.START.decoded.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${startIdx.length?startIdx.join(', '):'none'}\n` +
           binLineHead +
           binLineData
    });
  }
 
  // === TX_PQ_CTRL1: Priority Queue Control 1 (ABORT) ================
  if ('TX_PQ_CTRL1' in reg && reg.TX_PQ_CTRL1.int32 !== undefined) {
    const regValue = reg.TX_PQ_CTRL1.int32;

    // 0. Extend existing register structure
    reg.TX_PQ_CTRL1.fields = {};
    reg.TX_PQ_CTRL1.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_PQ_CTRL1, regValue, 'ABORT', 31, 0, 'Aborted Slots (requested)', r => r >>> 0);
    const f = reg.TX_PQ_CTRL1.fields;

    // 2. Generate human-readable register report
    const abortIdx = listSetIdx32(f.ABORT.decoded);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);    
    reg.TX_PQ_CTRL1.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_CTRL1: ${reg.TX_PQ_CTRL1.name_long} (0x${reg.TX_PQ_CTRL1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ABORT.name_short.padEnd(5)}] ${f.ABORT.name_long.padEnd(26)} = 0x${f.ABORT.decoded.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${abortIdx.length?abortIdx.join(', '):'none'}\n` +
           binLineHead +
           binLineData
    });
  }

  // === TX_PQ_CTRL2: Priority Queue Control 2 (ENABLE) ===============
  if ('TX_PQ_CTRL2' in reg && reg.TX_PQ_CTRL2.int32 !== undefined) {
    const regValue = reg.TX_PQ_CTRL2.int32;

    // 0. Extend existing register structure
    reg.TX_PQ_CTRL2.fields = {};
    reg.TX_PQ_CTRL2.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_PQ_CTRL2, regValue, 'ENABLE', 31, 0, 'Enabled Slots', r => r >>> 0);
    const f = reg.TX_PQ_CTRL2.fields;

    // 2. Generate human-readable register report
    const enaIdx = listSetIdx32(f.ENABLE.decoded);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);    
    reg.TX_PQ_CTRL2.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_CTRL2: ${reg.TX_PQ_CTRL2.name_long} (0x${reg.TX_PQ_CTRL2.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ENABLE.name_short.padEnd(6)}] ${f.ENABLE.name_long.padEnd(25)} = 0x${f.ENABLE.decoded.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${enaIdx.length?enaIdx.join(', '):'none'}\n` +
           binLineHead +
           binLineData
    });
  }

  // === TX_PQ_START_ADD: Priority Queue Start Address ================
  if ('TX_PQ_START_ADD' in reg && reg.TX_PQ_START_ADD.int32 !== undefined) {
    const regValue = reg.TX_PQ_START_ADD.int32;
    // 0. Extend existing register structure
    reg.TX_PQ_START_ADD.fields = {};
    reg.TX_PQ_START_ADD.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.TX_PQ_START_ADD, regValue, 'VAL', 31, 0, 'TXPQ Start Address (SMEM)', r => r >>> 0);
    const f = reg.TX_PQ_START_ADD.fields;
    const alignOk = (regValue & 0x3) === 0;

    // 2. Generate human-readable register report
    reg.TX_PQ_START_ADD.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_START_ADD: ${reg.TX_PQ_START_ADD.name_long} (0x${reg.TX_PQ_START_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(25)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
    });
    if (!alignOk) {
      reg.TX_PQ_START_ADD.report.push({ severityLevel: sevC.warning, msg: 'TX_PQ_START_ADD: Address not word-aligned (LSBs [1:0] should be 0).' });
    }
  }

  // TXPQ summary view
  // 0. (Summary) Collect slot-wise masks for a consolidated binary view
  try {
    const lines = [];
    const header = 'Bit:   31                  23                  15                  7               0\n' +
                   '------------------------------------------------------------------------------------';
    lines.push(header);

    const getVal = (r, f) => (r in reg && reg[r].fields && f in reg[r].fields) ? reg[r].fields[f].decoded : null;
    const addRegLine = (label, r, f) => {
      const v = getVal(r, f);
      if (v !== null) {
        lines.push(label.padEnd(7) + getBinaryLineData(v));
      }
    };

    // 1. Build lines (order as requested: Busy, Sent, Start, Abort, Enable)
    addRegLine('Busy',   'TX_PQ_STS0',  'BUSY');
    addRegLine('Sent',   'TX_PQ_STS1',  'SENT');
    addRegLine('Start',  'TX_PQ_CTRL0', 'START');
    addRegLine('Abort',  'TX_PQ_CTRL1', 'ABORT');
    addRegLine('Enable', 'TX_PQ_CTRL2', 'ENABLE');

    // Append report to the last TXPQ Register
    // Only append if we have at least one data line beyond header
    if (lines.length > 1) {
      // 2. Append summary to the most relevant existing PQ register (prefer CTRL2 -> CTRL0 -> STS1 -> STS0 -> START_ADD)
      const prefer = ['TX_PQ_CTRL2','TX_PQ_CTRL0','TX_PQ_CTRL1','TX_PQ_STS1','TX_PQ_STS0','TX_PQ_START_ADD'];
      let target = null;
      for (const name of prefer) {
        if (name in reg && reg[name].report && Array.isArray(reg[name].report)) { target = reg[name]; break; }
      }
      if (!target) {
        reg._TX_PQ_SUMMARY = reg._TX_PQ_SUMMARY || { name_long: 'TX Priority Queue Summary (auto)', report: [] };
        target = reg._TX_PQ_SUMMARY;
      }
      target.report.push({
        severityLevel: sevC.infoBold,
        msg: 'TX Priority Queue Slot Summary\n' + lines.join('\n')
      });
    }
  } catch (e) {
    // On error create synthetic summary register with warning
    if (!reg._TX_PQ_SUMMARY) reg._TX_PQ_SUMMARY = { name_long: 'TX PQ Summary (error)', report: [] };
    if (!Array.isArray(reg._TX_PQ_SUMMARY.report)) reg._TX_PQ_SUMMARY.report = [];
    reg._TX_PQ_SUMMARY.report.push({ severityLevel: sevC.warning, msg: 'TX PQ summary generation failed: ' + (e && e.message ? e.message : e) });
  }
} // TX Priority Queue

export function procRegsMhRXFQ(reg) {
  // Helper: list set bit indices for 8-bit fields, MSB->LSB
  const listSetIdx8 = (mask) => {
    const ids = [];
    for (let i = 7; i >= 0; i--) {
      if (((mask >>> i) & 0x1) === 1) ids.push(i);
    }
    return ids;
  };

  // === RX_DESC_ADD_PT: RX descriptor current address pointer =========
  if ('RX_DESC_ADD_PT' in reg && reg.RX_DESC_ADD_PT.int32 !== undefined) {
    const regValue = reg.RX_DESC_ADD_PT.int32;

    // 0. Extend existing register structure
    reg.RX_DESC_ADD_PT.fields = {};
    reg.RX_DESC_ADD_PT.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.RX_DESC_ADD_PT, regValue, 'VAL', 31, 0, 'RX Descriptor Address (SMEM) currently used by MH', r => r >>> 0);
    const f = reg.RX_DESC_ADD_PT.fields;

    // 2. Generate human-readable register report
    reg.RX_DESC_ADD_PT.report.push({
      severityLevel: sevC.info,
      msg: `RX_DESC_ADD_PT: ${reg.RX_DESC_ADD_PT.name_long} (0x${reg.RX_DESC_ADD_PT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(49)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }

  // === RX_STATISTICS: RX Message Counter =============================
  if ('RX_STATISTICS' in reg && reg.RX_STATISTICS.int32 !== undefined) {
    const regValue = reg.RX_STATISTICS.int32;

    // 0. Extend existing register structure
    reg.RX_STATISTICS.fields = {};
    reg.RX_STATISTICS.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.RX_STATISTICS, regValue, 'UNSUCC', 27, 16, 'Unsuccessful RX Count'); // unsuccessful receptions
    defineField(reg.RX_STATISTICS, regValue, 'SUCC', 11, 0, 'Successful   RX Count');  // successful receptions
    const f = reg.RX_STATISTICS.fields;

    // 2. Generate human-readable register report
    reg.RX_STATISTICS.report.push({
      severityLevel: sevC.info,
      msg: `RX_STATISTICS: ${reg.RX_STATISTICS.name_long} (0x${reg.RX_STATISTICS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.UNSUCC.name_short.padEnd(6)}] ${f.UNSUCC.name_long.padEnd(21)} = ${f.UNSUCC.value}\n` +
           `[${f.SUCC.name_short.padEnd(6)}] ${f.SUCC.name_long.padEnd(21)} = ${f.SUCC.value}`
    });
  }

  // === RX_FQ_STS0: RX FIFO Queue Status (BUSY/STOP) ==================
  if ('RX_FQ_STS0' in reg && reg.RX_FQ_STS0.int32 !== undefined) {
    const regValue = reg.RX_FQ_STS0.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_STS0.fields = {};
    reg.RX_FQ_STS0.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.RX_FQ_STS0, regValue, 'STOP', 23, 16, 'On Hold Queues');
    defineField(reg.RX_FQ_STS0, regValue, 'BUSY', 7, 0, 'Active  Queues');
    const f = reg.RX_FQ_STS0.fields;

    const stopIdx = listSetIdx8(f.STOP.value);
    const busyIdx = listSetIdx8(f.BUSY.value);

    // 2. Generate human-readable register report
    reg.RX_FQ_STS0.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_STS0: ${reg.RX_FQ_STS0.name_long} (0x${reg.RX_FQ_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.STOP.name_short.padEnd(4)}] ${f.STOP.name_long.padEnd(14)} = 0x${f.STOP.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${stopIdx.length?stopIdx.join(', '):'none'}\n` +
           `[${f.BUSY.name_short.padEnd(4)}] ${f.BUSY.name_long.padEnd(14)} = 0x${f.BUSY.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${busyIdx.length?busyIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_STS1: RX FIFO Queue Status (UNVALID/ERROR) ==============
  if ('RX_FQ_STS1' in reg && reg.RX_FQ_STS1.int32 !== undefined) {
    const regValue = reg.RX_FQ_STS1.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_STS1.fields = {};
    reg.RX_FQ_STS1.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    defineField(reg.RX_FQ_STS1, regValue, 'ERROR', 23, 16, 'Descriptor with ERROR   Queues');
    defineField(reg.RX_FQ_STS1, regValue, 'UNVALID', 7, 0, 'Descriptor with VALID=0 Queues');
    const f = reg.RX_FQ_STS1.fields;

    const errIdx = listSetIdx8(f.ERROR.value);
    const invIdx = listSetIdx8(f.UNVALID.value);

    // 2. Generate human-readable register report
    reg.RX_FQ_STS1.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_STS1: ${reg.RX_FQ_STS1.name_long} (0x${reg.RX_FQ_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ERROR.name_short.padEnd(7)}] ${f.ERROR.name_long.padEnd(30)} = 0x${f.ERROR.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${errIdx.length?errIdx.join(', '):'none'}\n` +
           `[${f.UNVALID.name_short.padEnd(7)}] ${f.UNVALID.name_long.padEnd(30)} = 0x${f.UNVALID.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${invIdx.length?invIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_STS2: RX FIFO Queue Status (DC_FULL) ===================
  if ('RX_FQ_STS2' in reg && reg.RX_FQ_STS2.int32 !== undefined) {
    const regValue = reg.RX_FQ_STS2.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_STS2.fields = {};
    reg.RX_FQ_STS2.report = [];

    // 1. Decode bits (MSB -> LSB) only DC_FULL[7:0]
    defineField(reg.RX_FQ_STS2, regValue, 'DC_FULL', 7, 0, 'Data Container Full for Queues');
    const f = reg.RX_FQ_STS2.fields;
    const fullIdx = listSetIdx8(f.DC_FULL.value);

    // 2. Generate report
    reg.RX_FQ_STS2.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_STS2: ${reg.RX_FQ_STS2.name_long} (0x${reg.RX_FQ_STS2.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.DC_FULL.name_short.padEnd(7)}] ${f.DC_FULL.name_long.padEnd(30)} = 0x${f.DC_FULL.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${fullIdx.length?fullIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_CTRL0: RX FIFO Queue Control 0 (START) ==================
  if ('RX_FQ_CTRL0' in reg && reg.RX_FQ_CTRL0.int32 !== undefined) {
    const regValue = reg.RX_FQ_CTRL0.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_CTRL0.fields = {};
    reg.RX_FQ_CTRL0.report = [];

    // 1. Decode
    defineField(reg.RX_FQ_CTRL0, regValue, 'START', 7, 0, 'Started Queues');
    const f = reg.RX_FQ_CTRL0.fields;
    const startIdx = listSetIdx8(f.START.value);

    // 2. Report
    reg.RX_FQ_CTRL0.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_CTRL0: ${reg.RX_FQ_CTRL0.name_long} (0x${reg.RX_FQ_CTRL0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.START.name_short.padEnd(5)}] ${f.START.name_long.padEnd(14)} = 0x${f.START.value.toString(16).toUpperCase().padStart(2,'0')}) => FIFOs: ${startIdx.length?startIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_CTRL1: RX FIFO Queue Control 1 (ABORT) ==================
  if ('RX_FQ_CTRL1' in reg && reg.RX_FQ_CTRL1.int32 !== undefined) {
    const regValue = reg.RX_FQ_CTRL1.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_CTRL1.fields = {};
    reg.RX_FQ_CTRL1.report = [];

    // 1. Decode
    defineField(reg.RX_FQ_CTRL1, regValue, 'ABORT', 7, 0, 'Aborted Queues');
    const f = reg.RX_FQ_CTRL1.fields;
    const abortIdx = listSetIdx8(f.ABORT.value);

    // 2. Report
    reg.RX_FQ_CTRL1.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_CTRL1: ${reg.RX_FQ_CTRL1.name_long} (0x${reg.RX_FQ_CTRL1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ABORT.name_short.padEnd(5)}] ${f.ABORT.name_long.padEnd(14)} = 0x${f.ABORT.value.toString(16).toUpperCase().padStart(2,'0')}  => FIFOs: ${abortIdx.length?abortIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_CTRL2: RX FIFO Queue Control 2 (ENABLE) =================
  if ('RX_FQ_CTRL2' in reg && reg.RX_FQ_CTRL2.int32 !== undefined) {
    const regValue = reg.RX_FQ_CTRL2.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_CTRL2.fields = {};
    reg.RX_FQ_CTRL2.report = [];

    // 1. Decode
    defineField(reg.RX_FQ_CTRL2, regValue, 'ENABLE', 7, 0, 'Enabled Queues');
    const f = reg.RX_FQ_CTRL2.fields;
    const enaIdx = listSetIdx8(f.ENABLE.value);

    // 2. Report
    reg.RX_FQ_CTRL2.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_CTRL2: ${reg.RX_FQ_CTRL2.name_long} (0x${reg.RX_FQ_CTRL2.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ENABLE.name_short.padEnd(6)}] ${f.ENABLE.name_long.padEnd(14)} = 0x${f.ENABLE.value.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${enaIdx.length?enaIdx.join(', '):'none'}`
    });
  }

  // === RX FIFO Queues 0..7 (replicated pattern, incl. DC + RD pointers) ===
  for (let q = 0; q <= 7; q++) {
    const addPtName      = `RX_FQ_ADD_PT${q}`;       // current descriptor address pointer
    const startAddName   = `RX_FQ_START_ADD${q}`;    // link list start address
    const sizeName       = `RX_FQ_SIZE${q}`;         // descriptors + data container size
    const dcStartAddName = `RX_FQ_DC_START_ADD${q}`; // data container start (continuous mode)
    const rdAddPtName    = `RX_FQ_RD_ADD_PT${q}`;    // read pointer (continuous mode)

    // --- Current Address Pointer (Queue q) ---------------------------
    if (addPtName in reg && reg[addPtName].int32 !== undefined) {
      const regValue = reg[addPtName].int32;
      reg[addPtName].fields = {};
      reg[addPtName].report = [];
      defineField(reg[addPtName], regValue, 'VAL', 31, 0, `RXFQ${q} Current Descriptor Address (SMEM)`, r => r >>> 0);
      const f = reg[addPtName].fields;
      reg[addPtName].report.push({
        severityLevel: sevC.info,
        msg: `${addPtName}: ${reg[addPtName].name_long} (0x${reg[addPtName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(39)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
      });
    }

    // --- Start Address (Queue q) -------------------------------------
    if (startAddName in reg && reg[startAddName].int32 !== undefined) {
      const regValue = reg[startAddName].int32;
      reg[startAddName].fields = {};
      reg[startAddName].report = [];
      defineField(reg[startAddName], regValue, 'VAL', 31, 0, `RXFQ${q} Start Address (SMEM)`, r => r >>> 0);
      const f = reg[startAddName].fields;
      const alignOk = (regValue & 0x3) === 0;
      reg[startAddName].report.push({
        severityLevel: sevC.info,
        msg: `${startAddName}: ${reg[startAddName].name_long} (0x${reg[startAddName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(41)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
      });
      if (!alignOk) {
        reg[startAddName].report.push({ severityLevel: sevC.warning, msg: `${startAddName}: Address not word-aligned (LSBs [1:0] should be 0).` });
      }
    }

    // --- Size Register (Queue q) ------------------------------------
    if (sizeName in reg && reg[sizeName].int32 !== undefined) {
      const regValue = reg[sizeName].int32;
      reg[sizeName].fields = {};
      reg[sizeName].report = [];
      defineField(reg[sizeName], regValue, 'DC_SIZE', 27, 16, `RXFQ${q} Data Container Size`); // data container size units
      defineField(reg[sizeName], regValue, 'MAX_DESC', 9, 0, `RXFQ${q} Size`); // link list descriptors
      const f = reg[sizeName].fields;
      const maxDesc = f.MAX_DESC.value;
      const dcSize = f.DC_SIZE.value; // units of 32 bytes (normal: per desc; continuous: whole container)
      const descBytes = maxDesc > 0 ? (maxDesc * 16) >>> 0 : 0; // RX descriptors 16 bytes each
      let dcInfo = '';
      if (dcSize > 0) dcInfo = ` (in Normal Mode = ${getBits(dcSize, 6, 0)* 32} byte; in Continuous Mode = ${dcSize * 32} byte)`;
      reg[sizeName].report.push({
        severityLevel: sevC.info,
        msg: `${sizeName}: ${reg[sizeName].name_long} (0x${reg[sizeName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[${f.DC_SIZE.name_short.padEnd(8)}] ${f.DC_SIZE.name_long.padEnd(25)} = ${dcSize}${dcInfo}\n` +
             `[${f.MAX_DESC.name_short.padEnd(8)}] ${f.MAX_DESC.name_long.padEnd(25)} = ${maxDesc}${maxDesc>0?` (Descriptors allocate ${descBytes} byte in S_MEM)`:''}`
      });
    }

    // --- Data Container Start Address (Continuous Mode) -------------
    if (dcStartAddName in reg && reg[dcStartAddName].int32 !== undefined) {
      const regValue = reg[dcStartAddName].int32;
      reg[dcStartAddName].fields = {};
      reg[dcStartAddName].report = [];
      defineField(reg[dcStartAddName], regValue, 'VAL', 31, 0, `RXFQ${q} Data Container Start Address (SMEM)`, r => r >>> 0);
      const f = reg[dcStartAddName].fields;
      const alignOk = (regValue & 0x3) === 0;
      reg[dcStartAddName].report.push({
        severityLevel: sevC.info,
        msg: `${dcStartAddName}: ${reg[dcStartAddName].name_long} (0x${reg[dcStartAddName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(41)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
      });
      if (!alignOk) {
        reg[dcStartAddName].report.push({ severityLevel: sevC.warning, msg: `${dcStartAddName}: Address not word-aligned (LSBs [1:0] should be 0).` });
      }
    }

    // --- Read Address Pointer (Continuous Mode) ---------------------
    if (rdAddPtName in reg && reg[rdAddPtName].int32 !== undefined) {
      const regValue = reg[rdAddPtName].int32;
      reg[rdAddPtName].fields = {};
      reg[rdAddPtName].report = [];
      defineField(reg[rdAddPtName], regValue, 'VAL', 31, 0, `RXFQ${q} Data Container Read Address (SMEM)`, r => r >>> 0);
      const f = reg[rdAddPtName].fields;
      const initialSpecial = (regValue & 0x3) === 0x3; // initial required 0b11 for start according to manual
      const alignedLater   = (regValue & 0x3) === 0x0; // after initial should be aligned
      reg[rdAddPtName].report.push({
        severityLevel: sevC.info,
        msg: `${rdAddPtName}: ${reg[rdAddPtName].name_long} (0x${reg[rdAddPtName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[${f.VAL.name_short.padEnd(3)}] ${f.VAL.name_long.padEnd(41)} = 0x${f.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')}`
      });
      if (!initialSpecial && !alignedLater) {
        reg[rdAddPtName].report.push({ severityLevel: sevC.warning, msg: `${rdAddPtName}: LSBs [1:0] must be =0. Exception: initial value can be 0b11.` });
      }
    }
  }

  // === Summary Table for all RX FIFO Queues (appended to last queue) ===
  try {
    const header    = 'Queue  START_ADD   ADD_PT      SIZE  DC_SIZE  Enabled  Start  Abort  Stop  Busy  Error  Unvalid  DC_FULL';
    const separator = '--------------------------------------------------------------------------------------------------------';
    const lines = [header, separator];

    const enaMask     = ('RX_FQ_CTRL2' in reg && reg.RX_FQ_CTRL2.int32 !== undefined) ? getBits(reg.RX_FQ_CTRL2.int32, 7, 0) : undefined;
    const startMask   = ('RX_FQ_CTRL0' in reg && reg.RX_FQ_CTRL0.int32 !== undefined) ? getBits(reg.RX_FQ_CTRL0.int32, 7, 0) : undefined;
    const abortMask   = ('RX_FQ_CTRL1' in reg && reg.RX_FQ_CTRL1.int32 !== undefined) ? getBits(reg.RX_FQ_CTRL1.int32, 7, 0) : undefined;
    const stopMask    = ('RX_FQ_STS0'  in reg && reg.RX_FQ_STS0.int32  !== undefined) ? getBits(reg.RX_FQ_STS0.int32, 23,16) : undefined;
    const busyMask    = ('RX_FQ_STS0'  in reg && reg.RX_FQ_STS0.int32  !== undefined) ? getBits(reg.RX_FQ_STS0.int32, 7, 0)  : undefined;
    const errMask     = ('RX_FQ_STS1'  in reg && reg.RX_FQ_STS1.int32  !== undefined) ? getBits(reg.RX_FQ_STS1.int32, 23,16) : undefined;
    const unvMask     = ('RX_FQ_STS1'  in reg && reg.RX_FQ_STS1.int32  !== undefined) ? getBits(reg.RX_FQ_STS1.int32, 7, 0)  : undefined;
    const dcFullMask  = ('RX_FQ_STS2'  in reg && reg.RX_FQ_STS2.int32  !== undefined) ? getBits(reg.RX_FQ_STS2.int32, 7, 0)  : undefined;

    for (let q = 0; q <= 7; q++) {
      const startAddName= `RX_FQ_START_ADD${q}`;
      const addPtName   = `RX_FQ_ADD_PT${q}`;
      const sizeName    = `RX_FQ_SIZE${q}`;

      const startRegVal = (startAddName in reg && reg[startAddName].fields && 'VAL' in reg[startAddName].fields) ? ('0x'+reg[startAddName].fields.VAL.decoded.toString(16).toUpperCase().padStart(8,'0')) : '-';
      const addPtRegVal = (addPtName   in reg && reg[addPtName].fields   && 'VAL' in reg[addPtName].fields)   ? ('0x'+reg[addPtName].fields.VAL.decoded.toString(16).toUpperCase().padStart(8,'0'))   : '-';
      const sizeVal     = (sizeName    in reg && reg[sizeName].fields    && 'MAX_DESC' in reg[sizeName].fields)? (''+reg[sizeName].fields.MAX_DESC.value) : '-';
      const dcSizeVal   = (sizeName    in reg && reg[sizeName].fields    && 'DC_SIZE'  in reg[sizeName].fields)? (''+reg[sizeName].fields.DC_SIZE.value)  : '-';

      const enaBit    = (enaMask    !== undefined) ? ((enaMask    >>> q) & 1).toString() : '-';
      const stBit     = (startMask  !== undefined) ? ((startMask  >>> q) & 1).toString() : '-';
      const abBit     = (abortMask  !== undefined) ? ((abortMask  >>> q) & 1).toString() : '-';
      const stopBit   = (stopMask   !== undefined) ? ((stopMask   >>> q) & 1).toString() : '-';
      const busyBit   = (busyMask   !== undefined) ? ((busyMask   >>> q) & 1).toString() : '-';
      const errBit    = (errMask    !== undefined) ? ((errMask    >>> q) & 1).toString() : '-';
      const unvBit    = (unvMask    !== undefined) ? ((unvMask    >>> q) & 1).toString() : '-';
      const dcFullBit = (dcFullMask !== undefined) ? ((dcFullMask >>> q) & 1).toString() : '-';

      const row = `RXFQ${q}  ${startRegVal.padEnd(10)}  ${addPtRegVal.padEnd(10)}  ${sizeVal.padEnd(4)}  ${dcSizeVal.padEnd(7)}  ${enaBit.padEnd(7)}  ${stBit.padEnd(5)}  ${abBit.padEnd(5)}  ${stopBit.padEnd(4)}  ${busyBit.padEnd(4)}  ${errBit.padEnd(5)}  ${unvBit.padEnd(7)}  ${dcFullBit}`;
      lines.push(row);
    }

    // Determine target register to append summary (prefer SIZE7 -> START_ADD7 -> ADD_PT7 ... -> SIZE0)
    const preferList = [];
    for (let q = 7; q >= 0; q--) {
      preferList.push(`RX_FQ_RD_ADD_PT${q}`);
      preferList.push(`RX_FQ_DC_START_ADD${q}`);
      preferList.push(`RX_FQ_SIZE${q}`);
      preferList.push(`RX_FQ_START_ADD${q}`);
      preferList.push(`RX_FQ_ADD_PT${q}`);
    }
    let target = null;
    for (const name of preferList) {
      if (name in reg && reg[name].report && Array.isArray(reg[name].report)) { target = reg[name]; break; }
    }
    if (!target) {
      reg._RX_FQ_SUMMARY = reg._RX_FQ_SUMMARY || { name_long: 'RX FIFO Summary (auto)', report: [] };
      target = reg._RX_FQ_SUMMARY;
    }
    target.report.push({
      severityLevel: sevC.infoBold,
      msg: 'RX FIFO Queues Summary\n' + lines.join('\n')
    });
  } catch (e) {
    const msg = 'RX FIFO summary generation failed: ' + (e && e.message ? e.message : e);
    if (!reg._RX_FQ_SUMMARY) reg._RX_FQ_SUMMARY = { name_long: 'RX FIFO Summary (error)', report: [] };
    if (!Array.isArray(reg._RX_FQ_SUMMARY.report)) reg._RX_FQ_SUMMARY.report = [];
    reg._RX_FQ_SUMMARY.report.push({ severityLevel: sevC.warning, msg });
  }
} // RX FIFO Queue

export function procRegsMhRXTXFilter(reg) {
  // Helper(s)
  const listSetIdx8  = (mask) => { const ids=[]; for(let i=7;i>=0;i--) { if(((mask>>>i)&1)===1) ids.push(i);} return ids; };
  const listSetIdx16 = (mask) => { const ids=[]; for(let i=15;i>=0;i--){ if(((mask>>>i)&1)===1) ids.push(i);} return ids; };

  // === TX_FILTER_CTRL0 =============================================
  if ('TX_FILTER_CTRL0' in reg && reg.TX_FILTER_CTRL0.int32 !== undefined) {
    const regValue = reg.TX_FILTER_CTRL0.int32;
    // 0. Extend structure
    reg.TX_FILTER_CTRL0.fields = {};
    reg.TX_FILTER_CTRL0.report = [];
    // 1. Decode
    defineField(reg.TX_FILTER_CTRL0, regValue, 'IRQ_EN', 20, 20, 'Interrupt on Rejection Enabled');
    defineField(reg.TX_FILTER_CTRL0, regValue, 'EN', 19, 19, 'TX Filter Global Enable');
    defineField(reg.TX_FILTER_CTRL0, regValue, 'CC_CAN', 18, 18, 'CAN CC frame Reject(1)');
    defineField(reg.TX_FILTER_CTRL0, regValue, 'CAN_FD', 17, 17, 'CAN FD frame Reject(1)');
    defineField(reg.TX_FILTER_CTRL0, regValue, 'MODE', 16, 16, 'Mode: Accept (1) or Reject (0)'); // 1=accept on match else reject on match
    defineField(reg.TX_FILTER_CTRL0, regValue, 'MASK', 15, 8, 'Use Value/Mask pairs');
    defineField(reg.TX_FILTER_CTRL0, regValue, 'COMB', 7, 0, 'Use REF_VAL pairs (0+1, 2+3, )');
    const f = reg.TX_FILTER_CTRL0.fields;
    // for each element of maskIdx => create strings 0/1, 2/3, ...
    const maskIdx = listSetIdx8(f.MASK.value);
    const combIdx = listSetIdx8(f.COMB.value);
    let maskIdxPairsString = maskIdx.map((v, i) => `${2*v+1}/${2*v}`).join(', ');
    let combIdxPairsString = combIdx.map((v, i) => `${2*v+1}/${2*v}`).join(', ');
    // 2. Report
    reg.TX_FILTER_CTRL0.report.push({
      severityLevel: sevC.info,
      msg: `TX_FILTER_CTRL0: ${reg.TX_FILTER_CTRL0.name_long} (0x${reg.TX_FILTER_CTRL0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.IRQ_EN.name_short.padEnd(6)}] ${f.IRQ_EN.name_long.padEnd(30)} = ${f.IRQ_EN.value}\n` +
           `[${f.EN.name_short.padEnd(6)}] ${f.EN.name_long.padEnd(30)} = ${f.EN.value}\n`+
           `[${f.CC_CAN.name_short.padEnd(6)}] ${f.CC_CAN.name_long.padEnd(30)} = ${f.CC_CAN.value} ${f.CC_CAN.value? '(=Reject)':'(=Accept)'}\n`+
           `[${f.CAN_FD.name_short.padEnd(6)}] ${f.CAN_FD.name_long.padEnd(30)} = ${f.CAN_FD.value} ${f.CAN_FD.value? '(=Reject)':'(=Accept)'}\n`+
           `[${f.MODE.name_short.padEnd(6)}] ${f.MODE.name_long.padEnd(30)} = ${f.MODE.value} ${f.MODE.value? '(=Accept)':'(=Reject)'} on match)\n`+
           `[${f.MASK.name_short.padEnd(6)}] ${f.MASK.name_long.padEnd(30)} = 0x${f.MASK.value.toString(16).toUpperCase().padStart(2,'0')} => Mask/Value Pairs: ${maskIdxPairsString? maskIdxPairsString : 'none'}\n`+
           `[${f.COMB.name_short.padEnd(6)}] ${f.COMB.name_long.padEnd(30)} = 0x${f.COMB.value.toString(16).toUpperCase().padStart(2,'0')} => Filter     Pairs: ${combIdxPairsString? combIdxPairsString : 'none'}`
    });
  }

  // === TX_FILTER_CTRL1 =============================================
  if ('TX_FILTER_CTRL1' in reg && reg.TX_FILTER_CTRL1.int32 !== undefined) {
    const regValue = reg.TX_FILTER_CTRL1.int32;
    // 0. Extend structure
    reg.TX_FILTER_CTRL1.fields = {};
    reg.TX_FILTER_CTRL1.report = [];
    // 1. Decode
    defineField(reg.TX_FILTER_CTRL1, regValue, 'FIELD', 31, 16, 'Compared field: SDT(1) or VCID(0)'); // 1 = SDT, 0 = VCID
    defineField(reg.TX_FILTER_CTRL1, regValue, 'VALID', 15, 0, 'Active Ref Value Indexes: REF_VALx');
    const f = reg.TX_FILTER_CTRL1.fields;
    // 2. Report
    const fieldIdx = listSetIdx16(f.FIELD.value);
    const validIdx = listSetIdx16(f.VALID.value);
    reg.TX_FILTER_CTRL1.report.push({
      severityLevel: sevC.info,
      msg: `TX_FILTER_CTRL1: ${reg.TX_FILTER_CTRL1.name_long} (0x${reg.TX_FILTER_CTRL1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.VALID.name_short.padEnd(5)}] ${f.VALID.name_long.padEnd(34)} = 0x${f.VALID.value.toString(16).toUpperCase().padStart(4,'0')} => ${validIdx.length?validIdx.join(', '):'none'}\n`+
           `[${f.FIELD.name_short.padEnd(5)}] ${f.FIELD.name_long.padEnd(34)} = 0x${f.FIELD.value.toString(16).toUpperCase().padStart(4,'0')} => binary (15:0)  ${getBinaryLineData(f.FIELD.value, 16)}`
    });
  }

  // === TX_FILTER_REFVAL0/1/2/3 =====================================
  // Helper to decode TX_FILTER_REFVALx
  const decodeRefVal = (name, index) => {
    if (name in reg && reg[name].int32 !== undefined) {
      const regValue = reg[name].int32;
      reg[name].fields = {};
      reg[name].report = [];
      defineField(reg[name], regValue, 'REF_VAL0', 7, 0, `global REF_VAL${(index*4+0).toString().padEnd(2,' ')}`);
      defineField(reg[name], regValue, 'REF_VAL1', 15, 8, `global REF_VAL${(index*4+1).toString().padEnd(2,' ')}`);
      defineField(reg[name], regValue, 'REF_VAL2', 23, 16, `global REF_VAL${(index*4+2).toString().padEnd(2,' ')}`);
      defineField(reg[name], regValue, 'REF_VAL3', 31, 24, `global REF_VAL${(index*4+3).toString().padEnd(2,' ')}`);
      const f = reg[name].fields;
      reg[name].report.push({
        severityLevel: sevC.info,
        msg: `${name}: ${reg[name].name_long} (0x${reg[name].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
             `[${f.REF_VAL3.name_short.padEnd(8)}] ${f.REF_VAL3.name_long.padEnd(16)} = 0x${f.REF_VAL3.value.toString(16).toUpperCase().padStart(2,'0')}\n`+
             `[${f.REF_VAL2.name_short.padEnd(8)}] ${f.REF_VAL2.name_long.padEnd(16)} = 0x${f.REF_VAL2.value.toString(16).toUpperCase().padStart(2,'0')}\n`+
             `[${f.REF_VAL1.name_short.padEnd(8)}] ${f.REF_VAL1.name_long.padEnd(16)} = 0x${f.REF_VAL1.value.toString(16).toUpperCase().padStart(2,'0')}\n`+
             `[${f.REF_VAL0.name_short.padEnd(8)}] ${f.REF_VAL0.name_long.padEnd(16)} = 0x${f.REF_VAL0.value.toString(16).toUpperCase().padStart(2,'0')}`
      });
    }
  };
  decodeRefVal('TX_FILTER_REFVAL0', 0);
  decodeRefVal('TX_FILTER_REFVAL1', 1);
  decodeRefVal('TX_FILTER_REFVAL2', 2);
  decodeRefVal('TX_FILTER_REFVAL3', 3);

  // === TX_FILTER Summary =====================================
  if (reg.TX_FILTER_CTRL0 && reg.TX_FILTER_CTRL0.fields &&
      reg.TX_FILTER_CTRL1 && reg.TX_FILTER_CTRL1.fields) {
    const enGlobal = reg.TX_FILTER_CTRL0.fields.EN.value === 1;
    const validMask = reg.TX_FILTER_CTRL1.fields.VALID.value; // 16 bits -> REF_VAL00..15
    const fieldMask = reg.TX_FILTER_CTRL1.fields.FIELD.value; // 1 = SDT, 0 = VCID
    const maskPairs = reg.TX_FILTER_CTRL0.fields.MASK.value;  // bit i => use REF_VAL(2*i+1)/(2*i)
    const combPairs = reg.TX_FILTER_CTRL0.fields.COMB.value;  // bit i => combine pair (2*i,2*i+1)

    // Helper to fetch a global REF_VALx (0..15) value
    const getRefVal = (idx) => {
      const regIdx = Math.floor(idx/4); // 0..3
      const pos = idx % 4; // 0..3
      const map = {
        0: reg.TX_FILTER_REFVAL0,
        1: reg.TX_FILTER_REFVAL1,
        2: reg.TX_FILTER_REFVAL2,
        3: reg.TX_FILTER_REFVAL3
      };
      const entry = map[regIdx];
      if (!entry || !entry.fields) return undefined;
      return entry.fields[`REF_VAL${pos}`].value;
    };

    const lines = [];
  lines.push('TX Filtering Summary');
  lines.push('REF_VAL                      VALID TYPE COMB VALUE');
  lines.push('--------------------------------------------------');

    for (let i = 0; i < 16; i++) {
      const regIdxName = 'TX_FILTER_REFVAL' + Math.floor(i/4);
      const refName = `${regIdxName}.REF_VAL${i.toString().padStart(2,'0')}`;
      const valid = ((validMask >> i) & 1) === 1 ? 1 : 0;
      let fieldStr = '-';
      let combMarker = ' ';
      let valStr = '-';

      if (valid === 1 && enGlobal) {
        const fieldSel = ((fieldMask >> i) & 1) === 1 ? 'SDT' : 'VCID';
        fieldStr = fieldSel;
        const byteVal = getRefVal(i);
        if (byteVal !== undefined) {
          valStr = '0x' + byteVal.toString(16).toUpperCase().padStart(2,'0');
        }
        // Check if part of mask/comb pair
        const pairIdx = Math.floor(i/2); // 0..7
        const isMaskPair = ((maskPairs >> pairIdx) & 1) === 1;
        const isCombPair = ((combPairs >> pairIdx) & 1) === 1;
        if (isMaskPair || isCombPair) {
          // top element (odd index) gets "┐", lower (even) gets "┘" when showing a combination
            combMarker = (i % 2 === 0) ? '┐' : '┘';
          if (isMaskPair && !isCombPair) {
            // Only mask/value pair -> indicate MASK on odd or even depending? Choose naming for odd partner
            if (i % 2 === 1) fieldStr = 'MASK';
          } else if (!isMaskPair && isCombPair) {
            // Only combination pair -> keep fieldStr as is
          } else if (isMaskPair && isCombPair) {
            // Both set; prefer showing MASK on odd index
            if (i % 2 === 1) fieldStr = 'MASK';
          }
        }
      }

      lines.push(`${refName.padEnd(26,' ')}  ${valid}     ${fieldStr.padEnd(5,' ')} ${combMarker}   ${valStr}`);
    }

    const txFilterSummary = lines.join('\n');
    // Attach summary to CTRL1 (arbitrary choice) report list
    reg.TX_FILTER_CTRL1.report.push({
      severityLevel: sevC.infoBold,
      msg: txFilterSummary
    });
  }
  
  
  // === RX_FILTER_CTRL ==============================================
  if ('RX_FILTER_CTRL' in reg && reg.RX_FILTER_CTRL.int32 !== undefined) {
    const regValue = reg.RX_FILTER_CTRL.int32;
    // 0.
    reg.RX_FILTER_CTRL.fields = {};
    reg.RX_FILTER_CTRL.report = [];
    // 1.
    defineField(reg.RX_FILTER_CTRL, regValue, 'ANFF', 21, 21, 'Threshold for RX DMA FIFO (=cache)');
    defineField(reg.RX_FILTER_CTRL, regValue, 'ANMF', 20, 20, 'Accept Non-Matching Frames');
    defineField(reg.RX_FILTER_CTRL, regValue, 'ANMF_FQ', 18, 16, 'Default RX FIFO Queue (ANMF/ANFF)');
    defineField(reg.RX_FILTER_CTRL, regValue, 'THRESHOLD', 12, 8, 'Threshold (words, if ANFF=1)');
    defineField(reg.RX_FILTER_CTRL, regValue, 'NB_FE', 7, 0, 'Number of RX Filter Elements');
    const f = reg.RX_FILTER_CTRL.fields;
    // 2.
    reg.RX_FILTER_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `RX_FILTER_CTRL: ${reg.RX_FILTER_CTRL.name_long} (0x${reg.RX_FILTER_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.ANFF.name_short.padEnd(9)}] ${f.ANFF.name_long.padEnd(34)} = ${f.ANFF.value}\n`+
           `[${f.ANMF.name_short.padEnd(9)}] ${f.ANMF.name_long.padEnd(34)} = ${f.ANMF.value}\n`+
           `[${f.ANMF_FQ.name_short.padEnd(9)}] ${f.ANMF_FQ.name_long.padEnd(34)} = ${f.ANMF_FQ.value}\n`+
           `[${f.THRESHOLD.name_short.padEnd(9)}] ${f.THRESHOLD.name_long.padEnd(34)} = ${f.THRESHOLD.value}\n`+
           `[${f.NB_FE.name_short.padEnd(9)}] ${f.NB_FE.name_long.padEnd(34)} = ${f.NB_FE.value}`
    });
  }
}

export function procRegsMhIRCtrlStat(reg) {
  // TODO: move generic (see 2 lines below) listSetIdx function to help_functions.js, high-bit is a parameter
  // Helper: list set indices (MSB->LSB)
  const listSet = (mask, highBit) => { const a=[]; for (let i=highBit;i>=0;i--){ if(((mask>>>i)&1)===1) a.push(i);} return a; };

  // === TX_FQ_INT_STS: TX FIFO Queue Interrupt Status ===============
  if ('TX_FQ_INT_STS' in reg && reg.TX_FQ_INT_STS.int32 !== undefined) {
    const regValue = reg.TX_FQ_INT_STS.int32;
    // 0. Extend structure
    reg.TX_FQ_INT_STS.fields = {};
    reg.TX_FQ_INT_STS.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.TX_FQ_INT_STS, regValue, 'UNVALID', 23, 16, 'TXFQ Descriptor VALID=0 IR'); // invalid descriptor
    defineField(reg.TX_FQ_INT_STS, regValue, 'SENT', 7, 0, 'TXFQ Message Dequeued   IR');   // sent msg
    const f = reg.TX_FQ_INT_STS.fields;
    const unvIdx = listSet(f.UNVALID.value,7);
    const sentIdx= listSet(f.SENT.value,7);
    // 2. Report
    reg.TX_FQ_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `TX_FQ_INT_STS: ${reg.TX_FQ_INT_STS.name_long} (0x${reg.TX_FQ_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.UNVALID.name_short.padEnd(8)}] ${f.UNVALID.name_long.padEnd(26)} = 0x${f.UNVALID.value.toString(16).toUpperCase().padStart(2,'0')} => Queues: ${unvIdx.length?unvIdx.join(', '):'none'}\n`+
           `[${f.SENT.name_short.padEnd(8)}] ${f.SENT.name_long.padEnd(26)} = 0x${f.SENT.value.toString(16).toUpperCase().padStart(2,'0')} => Queues: ${sentIdx.length?sentIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_INT_STS: RX FIFO Queue Interrupt Status ===============
  if ('RX_FQ_INT_STS' in reg && reg.RX_FQ_INT_STS.int32 !== undefined) {
    const regValue = reg.RX_FQ_INT_STS.int32;
    // 0. Extend structure
    reg.RX_FQ_INT_STS.fields = {};
    reg.RX_FQ_INT_STS.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.RX_FQ_INT_STS, regValue, 'UNVALID', 23, 16, 'RXFQ Descriptor VALID=0 IR');
    defineField(reg.RX_FQ_INT_STS, regValue, 'RECEIVED', 7, 0, 'RXFQ Message Enqueued   IR');
    const f = reg.RX_FQ_INT_STS.fields;
    // 2. Report
    const unvIdx = listSet(f.UNVALID.value,7);
    const rcvIdx = listSet(f.RECEIVED.value,7);
    reg.RX_FQ_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_INT_STS: ${reg.RX_FQ_INT_STS.name_long} (0x${reg.RX_FQ_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.UNVALID.name_short.padEnd(8)}] ${f.UNVALID.name_long.padEnd(26)} = 0x${f.UNVALID.value.toString(16).toUpperCase().padStart(2,'0')} => Queues: ${unvIdx.length?unvIdx.join(', '):'none'}\n`+
           `[${f.RECEIVED.name_short.padEnd(8)}] ${f.RECEIVED.name_long.padEnd(26)} = 0x${f.RECEIVED.value.toString(16).toUpperCase().padStart(2,'0')} => Queues: ${rcvIdx.length?rcvIdx.join(', '):'none'}`
    });
  }

  // === TX_PQ_INT_STS0: TX Priority Queue Sent ======================
  if ('TX_PQ_INT_STS0' in reg && reg.TX_PQ_INT_STS0.int32 !== undefined) {
    const regValue = reg.TX_PQ_INT_STS0.int32;
    // 0. Extend structure
    reg.TX_PQ_INT_STS0.fields = {};
    reg.TX_PQ_INT_STS0.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.TX_PQ_INT_STS0, regValue, 'SENT', 31, 0, 'TXPQ Messages Dequeued IR');
    const f = reg.TX_PQ_INT_STS0.fields;
    // 2. Report
    const sentIdx = listSet(f.SENT.value,31);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);
    reg.TX_PQ_INT_STS0.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_INT_STS0: ${reg.TX_PQ_INT_STS0.name_long} (0x${reg.TX_PQ_INT_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.SENT.name_short.padEnd(4)}] ${f.SENT.name_long.padEnd(30)} = 0x${f.SENT.value.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${sentIdx.length?sentIdx.join(', '):'none'}\n` +
           binLineHead +
           binLineData
    });
  }

  // === TX_PQ_INT_STS1: TX Priority Queue UNVALID ===================
  if ('TX_PQ_INT_STS1' in reg && reg.TX_PQ_INT_STS1.int32 !== undefined) {
    const regValue = reg.TX_PQ_INT_STS1.int32;
    // 0. Extend structure
    reg.TX_PQ_INT_STS1.fields = {};
    reg.TX_PQ_INT_STS1.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.TX_PQ_INT_STS1, regValue, 'UNVALID', 31, 0, 'TXPQ Descriptor VALID=0 IR');
    const f = reg.TX_PQ_INT_STS1.fields;
    // 2. Report
    const unvIdx = listSet(f.UNVALID.value,31);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);
    reg.TX_PQ_INT_STS1.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_INT_STS1: ${reg.TX_PQ_INT_STS1.name_long} (0x${reg.TX_PQ_INT_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.UNVALID.name_short.padEnd(7)}] ${f.UNVALID.name_long.padEnd(27)} = 0x${f.UNVALID.value.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${unvIdx.length?unvIdx.join(', '):'none'}\n` +
           binLineHead +
           binLineData
    });
  }

  // === STATS_INT_STS: Statistics Interrupt Status ==================
  if ('STATS_INT_STS' in reg && reg.STATS_INT_STS.int32 !== undefined) {
    const regValue = reg.STATS_INT_STS.int32;
    // 0. Extend structure
    reg.STATS_INT_STS.fields = {};
    reg.STATS_INT_STS.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.STATS_INT_STS, regValue, 'RX_UNSUCC', 3, 3, 'RX unsuccessful counter');
    defineField(reg.STATS_INT_STS, regValue, 'RX_SUCC', 2, 2, 'RX successful counter');
    defineField(reg.STATS_INT_STS, regValue, 'TX_UNSUCC', 1, 1, 'TX unsuccessful counter');
    defineField(reg.STATS_INT_STS, regValue, 'TX_SUCC', 0, 0, 'TX successful counter');
    const f = reg.STATS_INT_STS.fields;
    // 2. Report
    reg.STATS_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `STATS_INT_STS: ${reg.STATS_INT_STS.name_long} (0x${reg.STATS_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.RX_UNSUCC.name_short.padEnd(9)}] ${f.RX_UNSUCC.name_long.padEnd(23)} = ${f.RX_UNSUCC.value}\n`+
           `[${f.RX_SUCC.name_short.padEnd(9)}] ${f.RX_SUCC.name_long.padEnd(23)} = ${f.RX_SUCC.value}\n`+
           `[${f.TX_UNSUCC.name_short.padEnd(9)}] ${f.TX_UNSUCC.name_long.padEnd(23)} = ${f.TX_UNSUCC.value}\n`+
           `[${f.TX_SUCC.name_short.padEnd(9)}] ${f.TX_SUCC.name_long.padEnd(23)} = ${f.TX_SUCC.value}`
    });
  }

  // === ERR_INT_STS: Error Interrupt Status =========================
  if ('ERR_INT_STS' in reg && reg.ERR_INT_STS.int32 !== undefined) {
    const regValue = reg.ERR_INT_STS.int32;
    // 0. Extend structure
    reg.ERR_INT_STS.fields = {};
    reg.ERR_INT_STS.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.ERR_INT_STS, regValue, 'DP_RX_SEQ_ERR', 4, 4, 'Data Path RX sequence error');
    defineField(reg.ERR_INT_STS, regValue, 'DP_TX_SEQ_ERR', 3, 3, 'Data Path TX sequence error');
    defineField(reg.ERR_INT_STS, regValue, 'DP_RX_ACK_DO_ERR', 2, 2, 'Data Path RX acknowledge data overflow');
    defineField(reg.ERR_INT_STS, regValue, 'DP_RX_FIFO_DO_ERR', 1, 1, 'Data Path RX DMA FIFO overflow');
    defineField(reg.ERR_INT_STS, regValue, 'DP_TX_ACK_DO_ERR', 0, 0, 'Data Path TX acknowledge data overflow');
    const f = reg.ERR_INT_STS.fields;
    // 2. Report
    reg.ERR_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `ERR_INT_STS: ${reg.ERR_INT_STS.name_long} (0x${reg.ERR_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.DP_RX_SEQ_ERR.name_short.padEnd(17)}] ${f.DP_RX_SEQ_ERR.name_long.padEnd(38)} = ${f.DP_RX_SEQ_ERR.value}\n`+
           `[${f.DP_TX_SEQ_ERR.name_short.padEnd(17)}] ${f.DP_TX_SEQ_ERR.name_long.padEnd(38)} = ${f.DP_TX_SEQ_ERR.value}\n`+
           `[${f.DP_RX_ACK_DO_ERR.name_short.padEnd(17)}] ${f.DP_RX_ACK_DO_ERR.name_long.padEnd(38)} = ${f.DP_RX_ACK_DO_ERR.value}\n`+
           `[${f.DP_RX_FIFO_DO_ERR.name_short.padEnd(17)}] ${f.DP_RX_FIFO_DO_ERR.name_long.padEnd(38)} = ${f.DP_RX_FIFO_DO_ERR.value}\n`+
           `[${f.DP_TX_ACK_DO_ERR.name_short.padEnd(17)}] ${f.DP_TX_ACK_DO_ERR.name_long.padEnd(38)} = ${f.DP_TX_ACK_DO_ERR.value}`
    });
  }

  // === SFTY_INT_STS: Safety Interrupt Status =======================
  if ('SFTY_INT_STS' in reg && reg.SFTY_INT_STS.int32 !== undefined) {
    const regValue = reg.SFTY_INT_STS.int32;
    // 0. Extend structure
    reg.SFTY_INT_STS.fields = {};
    reg.SFTY_INT_STS.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.SFTY_INT_STS, regValue, 'ACK_RX_PARITY_ERR', 17, 17, 'RX Ack Data Parity Issue');
    defineField(reg.SFTY_INT_STS, regValue, 'ACK_TX_PARITY_ERR', 16, 16, 'TX Ack Data Parity Issue');
    defineField(reg.SFTY_INT_STS, regValue, 'MEM_SFTY_CE', 15, 15, 'LMEM Correctable   Error');
    defineField(reg.SFTY_INT_STS, regValue, 'MEM_SFTY_UE', 14, 14, 'LMEM Uncorrectable Error');
    defineField(reg.SFTY_INT_STS, regValue, 'RX_DESC_CRC_ERR', 13, 13, 'RX Descriptor CRC Error');
    defineField(reg.SFTY_INT_STS, regValue, 'RX_DESC_REQ_ERR', 12, 12, 'RX Descriptor Fetched Wrong');
    defineField(reg.SFTY_INT_STS, regValue, 'TX_DESC_CRC_ERR', 11, 11, 'TX Descriptor Wrong CRC');
    defineField(reg.SFTY_INT_STS, regValue, 'TX_DESC_REQ_ERR', 10, 10, 'TX Descriptor Fetched Wrong');
    defineField(reg.SFTY_INT_STS, regValue, 'AP_RX_PARITY_ERR', 9, 9, 'RX Address Pointer Parity Error');
    defineField(reg.SFTY_INT_STS, regValue, 'AP_TX_PARITY_ERR', 8, 8, 'TX Address Pointer Parity Error');
    defineField(reg.SFTY_INT_STS, regValue, 'DP_RX_PARITY_ERR', 7, 7, 'RX Data Parity Error');
    defineField(reg.SFTY_INT_STS, regValue, 'DP_TX_PARITY_ERR', 6, 6, 'TX Data Parity Error');
    defineField(reg.SFTY_INT_STS, regValue, 'MEM_AXI_RD_TO_ERR', 5, 5, 'MEM AXI Read Timeout');
    defineField(reg.SFTY_INT_STS, regValue, 'MEM_AXI_WR_TO_ERR', 4, 4, 'MEM AXI Write Timeout');
    defineField(reg.SFTY_INT_STS, regValue, 'DP_PRT_RX_TO_ERR', 3, 3, '(PRT=>MH) RX_MSG IF Timeout');
    defineField(reg.SFTY_INT_STS, regValue, 'DP_PRT_TX_TO_ERR', 2, 2, '(MH=>PRT) TX_MSG IF Timeout');
    defineField(reg.SFTY_INT_STS, regValue, 'DMA_AXI_RD_TO_ERR', 1, 1, 'DMA AXI Read  Timeout');
    defineField(reg.SFTY_INT_STS, regValue, 'DMA_AXI_WR_TO_ERR', 0, 0, 'DMA AXI Write Timeout');
    const f = reg.SFTY_INT_STS.fields;
    // 2. Report
    reg.SFTY_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `SFTY_INT_STS: ${reg.SFTY_INT_STS.name_long} (0x${reg.SFTY_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.ACK_RX_PARITY_ERR.name_short.padEnd(17)}] ${f.ACK_RX_PARITY_ERR.name_long.padEnd(31)} = ${f.ACK_RX_PARITY_ERR.value}\n`+
           `[${f.ACK_TX_PARITY_ERR.name_short.padEnd(17)}] ${f.ACK_TX_PARITY_ERR.name_long.padEnd(31)} = ${f.ACK_TX_PARITY_ERR.value}\n`+
           `[${f.MEM_SFTY_CE.name_short.padEnd(17)}] ${f.MEM_SFTY_CE.name_long.padEnd(31)} = ${f.MEM_SFTY_CE.value}\n`+
           `[${f.MEM_SFTY_UE.name_short.padEnd(17)}] ${f.MEM_SFTY_UE.name_long.padEnd(31)} = ${f.MEM_SFTY_UE.value}\n`+
           `[${f.RX_DESC_CRC_ERR.name_short.padEnd(17)}] ${f.RX_DESC_CRC_ERR.name_long.padEnd(31)} = ${f.RX_DESC_CRC_ERR.value}\n`+
           `[${f.RX_DESC_REQ_ERR.name_short.padEnd(17)}] ${f.RX_DESC_REQ_ERR.name_long.padEnd(31)} = ${f.RX_DESC_REQ_ERR.value}\n`+
           `[${f.TX_DESC_CRC_ERR.name_short.padEnd(17)}] ${f.TX_DESC_CRC_ERR.name_long.padEnd(31)} = ${f.TX_DESC_CRC_ERR.value}\n`+
           `[${f.TX_DESC_REQ_ERR.name_short.padEnd(17)}] ${f.TX_DESC_REQ_ERR.name_long.padEnd(31)} = ${f.TX_DESC_REQ_ERR.value}\n`+
           `[${f.AP_RX_PARITY_ERR.name_short.padEnd(17)}] ${f.AP_RX_PARITY_ERR.name_long.padEnd(31)} = ${f.AP_RX_PARITY_ERR.value}\n`+
           `[${f.AP_TX_PARITY_ERR.name_short.padEnd(17)}] ${f.AP_TX_PARITY_ERR.name_long.padEnd(31)} = ${f.AP_TX_PARITY_ERR.value}\n`+
           `[${f.DP_RX_PARITY_ERR.name_short.padEnd(17)}] ${f.DP_RX_PARITY_ERR.name_long.padEnd(31)} = ${f.DP_RX_PARITY_ERR.value}\n`+
           `[${f.DP_TX_PARITY_ERR.name_short.padEnd(17)}] ${f.DP_TX_PARITY_ERR.name_long.padEnd(31)} = ${f.DP_TX_PARITY_ERR.value}\n`+
           `[${f.MEM_AXI_RD_TO_ERR.name_short.padEnd(17)}] ${f.MEM_AXI_RD_TO_ERR.name_long.padEnd(31)} = ${f.MEM_AXI_RD_TO_ERR.value}\n`+
           `[${f.MEM_AXI_WR_TO_ERR.name_short.padEnd(17)}] ${f.MEM_AXI_WR_TO_ERR.name_long.padEnd(31)} = ${f.MEM_AXI_WR_TO_ERR.value}\n`+
           `[${f.DP_PRT_RX_TO_ERR.name_short.padEnd(17)}] ${f.DP_PRT_RX_TO_ERR.name_long.padEnd(31)} = ${f.DP_PRT_RX_TO_ERR.value}\n`+
           `[${f.DP_PRT_TX_TO_ERR.name_short.padEnd(17)}] ${f.DP_PRT_TX_TO_ERR.name_long.padEnd(31)} = ${f.DP_PRT_TX_TO_ERR.value}\n`+
           `[${f.DMA_AXI_RD_TO_ERR.name_short.padEnd(17)}] ${f.DMA_AXI_RD_TO_ERR.name_long.padEnd(31)} = ${f.DMA_AXI_RD_TO_ERR.value}\n`+
           `[${f.DMA_AXI_WR_TO_ERR.name_short.padEnd(17)}] ${f.DMA_AXI_WR_TO_ERR.name_long.padEnd(31)} = ${f.DMA_AXI_WR_TO_ERR.value}`
    });
  }

  // === AXI_ERR_INFO: AXI Error Information =========================
  if ('AXI_ERR_INFO' in reg && reg.AXI_ERR_INFO.int32 !== undefined) {
    const regValue = reg.AXI_ERR_INFO.int32;
    // 0. Extend structure
    reg.AXI_ERR_INFO.fields = {};
    reg.AXI_ERR_INFO.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.AXI_ERR_INFO, regValue, 'MEM_RESP', 7, 6, 'MEM AXI Response');
    defineField(reg.AXI_ERR_INFO, regValue, 'MEM_ID', 5, 4, 'MEM AXI ID (in case of RD or WR Error Response)');
    defineField(reg.AXI_ERR_INFO, regValue, 'DMA_RESP', 3, 2, 'DMA AXI Response');
    defineField(reg.AXI_ERR_INFO, regValue, 'DMA_ID', 1, 0, 'DMA AXI ID (in case of RD or WR Error Response)');
    const f = reg.AXI_ERR_INFO.fields;
    // 2. Report
    reg.AXI_ERR_INFO.report.push({
      severityLevel: sevC.info,
      msg: `AXI_ERR_INFO: ${reg.AXI_ERR_INFO.name_long} (0x${reg.AXI_ERR_INFO.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.MEM_RESP.name_short.padEnd(8)}] ${f.MEM_RESP.name_long.padEnd(47)} = ${f.MEM_RESP.value} (0: Okay, 1: res, 2: SLVERR, 3: DECERR)\n`+
           `[${f.MEM_ID.name_short.padEnd(8)}] ${f.MEM_ID.name_long.padEnd(47)} = ${f.MEM_ID.value}\n`+
           `[${f.DMA_RESP.name_short.padEnd(8)}] ${f.DMA_RESP.name_long.padEnd(47)} = ${f.DMA_RESP.value} (0: Okay, 1: res, 2: SLVERR, 3: DECERR)\n`+
           `[${f.DMA_ID.name_short.padEnd(8)}] ${f.DMA_ID.name_long.padEnd(47)} = ${f.DMA_ID.value}`
    });
  }

  // === DESC_ERR_INFO0: Descriptor Error Address ====================
  if ('DESC_ERR_INFO0' in reg && reg.DESC_ERR_INFO0.int32 !== undefined) {
    const regValue = reg.DESC_ERR_INFO0.int32;
    // 0. Extend structure
    reg.DESC_ERR_INFO0.fields = {};
    reg.DESC_ERR_INFO0.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.DESC_ERR_INFO0, regValue, 'ADD', 31, 0, 'Descriptor Address');
    const f = reg.DESC_ERR_INFO0.fields;
    // 2. Report
    reg.DESC_ERR_INFO0.report.push({
      severityLevel: sevC.info,
      msg: `DESC_ERR_INFO0: ${reg.DESC_ERR_INFO0.name_long} (0x${reg.DESC_ERR_INFO0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.ADD.name_short.padEnd(3)}] ${f.ADD.name_long.padEnd(18)} = 0x${f.ADD.value.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }

  // === DESC_ERR_INFO1: Descriptor Error Details ====================
  if ('DESC_ERR_INFO1' in reg && reg.DESC_ERR_INFO1.int32 !== undefined) {
    const regValue = reg.DESC_ERR_INFO1.int32;
    // 0. Extend structure
    reg.DESC_ERR_INFO1.fields = {};
    reg.DESC_ERR_INFO1.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.DESC_ERR_INFO1, regValue, 'CRC', 24, 16, 'Descriptor CRC Value');
    defineField(reg.DESC_ERR_INFO1, regValue, 'RX_TX', 15, 15, 'RX(1) or TX(0) Descriptor');
    defineField(reg.DESC_ERR_INFO1, regValue, 'RC', 13, 9, 'Rolling Counter');
    defineField(reg.DESC_ERR_INFO1, regValue, 'PQ', 8, 8, 'TX Queue type: PQ(1), FQ(0)');
    defineField(reg.DESC_ERR_INFO1, regValue, 'INSTANCE', 7, 5, 'Instance Number');
    defineField(reg.DESC_ERR_INFO1, regValue, 'FQN_PQSN', 4, 0, 'Queue/Slot Number');
    const f = reg.DESC_ERR_INFO1.fields;
    // 2. Report
    reg.DESC_ERR_INFO1.report.push({
      severityLevel: sevC.info,
      msg: `DESC_ERR_INFO1: ${reg.DESC_ERR_INFO1.name_long} (0x${reg.DESC_ERR_INFO1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.CRC.name_short.padEnd(8)}] ${f.CRC.name_long.padEnd(27)} = 0x${f.CRC.value.toString(16).toUpperCase().padStart(2,'0')}\n`+
           `[${f.RX_TX.name_short.padEnd(8)}] ${f.RX_TX.name_long.padEnd(27)} = ${f.RX_TX.value}\n`+
           `[${f.RC.name_short.padEnd(8)}] ${f.RC.name_long.padEnd(27)} = ${f.RC.value}\n`+
           `[${f.PQ.name_short.padEnd(8)}] ${f.PQ.name_long.padEnd(27)} = ${f.PQ.value}\n`+
           `[${f.INSTANCE.name_short.padEnd(8)}] ${f.INSTANCE.name_long.padEnd(27)} = ${f.INSTANCE.value}\n`+
           `[${f.FQN_PQSN.name_short.padEnd(8)}] ${f.FQN_PQSN.name_long.padEnd(27)} = ${f.FQN_PQSN.value}`
    });
  }

  // === TX_FILTER_ERR_INFO: TX Filter Error Info ====================
  if ('TX_FILTER_ERR_INFO' in reg && reg.TX_FILTER_ERR_INFO.int32 !== undefined) {
    const regValue = reg.TX_FILTER_ERR_INFO.int32;
    // 0. Extend structure
    reg.TX_FILTER_ERR_INFO.fields = {};
    reg.TX_FILTER_ERR_INFO.report = [];
    // 1. Decode (MSB -> LSB)
    defineField(reg.TX_FILTER_ERR_INFO, regValue, 'FQN_PQS', 5, 1, 'FIFO Queue/Slot Number');
    defineField(reg.TX_FILTER_ERR_INFO, regValue, 'FQ', 0, 0, 'TX Queue type FQ(1), PQ(0)'); // 1=TX FIFO Queue, 0=TX PQ slot
    const f = reg.TX_FILTER_ERR_INFO.fields;
    // 2. Report
    reg.TX_FILTER_ERR_INFO.report.push({
      severityLevel: sevC.info,
      msg: `TX_FILTER_ERR_INFO: ${reg.TX_FILTER_ERR_INFO.name_long} (0x${reg.TX_FILTER_ERR_INFO.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.FQN_PQS.name_short.padEnd(7)}] ${f.FQN_PQS.name_long.padEnd(26)} = ${f.FQN_PQS.value}\n` +
           `[${f.FQ.name_short.padEnd(7)}] ${f.FQ.name_long.padEnd(26)} = ${f.FQ.value}`
    });
  }
}

export function procRegsMhDebugCtrlStat(reg) {
  // Helper(s)
  const listSet = (mask, highBit) => { const a=[]; for(let i=highBit;i>=0;i--){ if(((mask>>>i)&1)===1) a.push(i);} return a; };

  // === DEBUG_TEST_CTRL =============================================
  if ('DEBUG_TEST_CTRL' in reg && reg.DEBUG_TEST_CTRL.int32 !== undefined) {
    const regValue = reg.DEBUG_TEST_CTRL.int32;
    // 0. Extend structure
    reg.DEBUG_TEST_CTRL.fields = {};
    reg.DEBUG_TEST_CTRL.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.DEBUG_TEST_CTRL, regValue, 'HDP_SEL', 10, 8, 'HDP Signal Set');
    defineField(reg.DEBUG_TEST_CTRL, regValue, 'HDP_EN', 1, 1, 'HDP Port Enable');
    defineField(reg.DEBUG_TEST_CTRL, regValue, 'TEST_IRQ_EN', 0, 0, 'Test Interrupt Enable');
    const f = reg.DEBUG_TEST_CTRL.fields;
    // 2. Report
    reg.DEBUG_TEST_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `DEBUG_TEST_CTRL: ${reg.DEBUG_TEST_CTRL.name_long} (0x${reg.DEBUG_TEST_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.HDP_SEL.name_short.padEnd(11)}] ${f.HDP_SEL.name_long.padEnd(21)} = ${f.HDP_SEL.value}\n`+
           `[${f.HDP_EN.name_short.padEnd(11)}] ${f.HDP_EN.name_long.padEnd(21)} = ${f.HDP_EN.value}\n`+
           `[${f.TEST_IRQ_EN.name_short.padEnd(11)}] ${f.TEST_IRQ_EN.name_long.padEnd(21)} = ${f.TEST_IRQ_EN.value}`
    });
  }

  // === INT_TEST0 ===================================================
  if ('INT_TEST0' in reg && reg.INT_TEST0.int32 !== undefined) {
    const regValue = reg.INT_TEST0.int32;
    // 0. Extend structure
    reg.INT_TEST0.fields = {};
    reg.INT_TEST0.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.INT_TEST0, regValue, 'RX_FQ_IRQ', 23, 16, 'Trigger RX_FQ IRQs');
    defineField(reg.INT_TEST0, regValue, 'TX_FQ_IRQ', 7, 0, 'Trigger TX_FQ IRQs');
    const f = reg.INT_TEST0.fields;
    // 2. Report
    reg.INT_TEST0.report.push({
      severityLevel: sevC.info,
      msg: `INT_TEST0: ${reg.INT_TEST0.name_long} (0x${reg.INT_TEST0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.RX_FQ_IRQ.name_short.padEnd(9)}] ${f.RX_FQ_IRQ.name_long.padEnd(18)} = 0x${f.RX_FQ_IRQ.value.toString(16).toUpperCase().padStart(2,'0')}\n`+
           `[${f.TX_FQ_IRQ.name_short.padEnd(9)}] ${f.TX_FQ_IRQ.name_long.padEnd(18)} = 0x${f.TX_FQ_IRQ.value.toString(16).toUpperCase().padStart(2,'0')}`
    });
  }

  // === INT_TEST1 ===================================================
  if ('INT_TEST1' in reg && reg.INT_TEST1.int32 !== undefined) {
    const regValue = reg.INT_TEST1.int32;
    // 0. Extend structure
    reg.INT_TEST1.fields = {};
    reg.INT_TEST1.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.INT_TEST1, regValue, 'TX_PQ_IRQ', 20, 20, 'Trigger TX Priority Queue IRQ');
    defineField(reg.INT_TEST1, regValue, 'STATS_IRQ', 19, 19, 'Trigger Statistics IRQ');
    defineField(reg.INT_TEST1, regValue, 'STOP_IRQ', 18, 18, 'Trigger STOP IRQ');
    defineField(reg.INT_TEST1, regValue, 'RX_FILTER_IRQ', 17, 17, 'Trigger RX Filter IRQ');
    defineField(reg.INT_TEST1, regValue, 'TX_FILTER_IRQ', 16, 16, 'Trigger TX Filter IRQ');
    defineField(reg.INT_TEST1, regValue, 'TX_ABORT_IRQ', 15, 15, 'Trigger TX Abort IRQ');
    defineField(reg.INT_TEST1, regValue, 'RX_ABORT_IRQ', 14, 14, 'Trigger RX Abort IRQ');
    defineField(reg.INT_TEST1, regValue, 'RX_FILTER_ERR', 13, 13, 'Trigger RX Filter Error IRQ');
    defineField(reg.INT_TEST1, regValue, 'MEM_TO_ERR', 12, 12, 'Trigger MEM AXI Timeout IRQ');
    defineField(reg.INT_TEST1, regValue, 'MEM_SFTY_ERR', 11, 11, 'Trigger MEM Safety Error IRQ');
    defineField(reg.INT_TEST1, regValue, 'REG_CRC_ERR', 10, 10, 'Trigger Register CRC Error IRQ');
    defineField(reg.INT_TEST1, regValue, 'DESC_ERR', 9, 9, 'Trigger Descriptor Error IRQ');
    defineField(reg.INT_TEST1, regValue, 'AP_PARITY_ERR', 8, 8, 'Trigger Address Pointer Parity IRQ');
    defineField(reg.INT_TEST1, regValue, 'DP_PARITY_ERR', 7, 7, 'Trigger Data Path Parity IRQ');
    defineField(reg.INT_TEST1, regValue, 'DP_SEQ_ERR', 6, 6, 'Trigger Data Path Sequence IRQ');
    defineField(reg.INT_TEST1, regValue, 'DP_DO_ERR', 5, 5, 'Trigger Data Path Overflow IRQ');
    defineField(reg.INT_TEST1, regValue, 'DP_TO_ERR', 4, 4, 'Trigger Data Path Timeout IRQ');
    defineField(reg.INT_TEST1, regValue, 'DMA_CH_ERR', 3, 3, 'Trigger DMA Channel Error IRQ');
    defineField(reg.INT_TEST1, regValue, 'DMA_TO_ERR', 2, 2, 'Trigger DMA Timeout IRQ');
    defineField(reg.INT_TEST1, regValue, 'RESP_ERR', 1, 0, 'Trigger AXI Response Error IRQs');
    const f = reg.INT_TEST1.fields;
    // 2. Report
    reg.INT_TEST1.report.push({
      severityLevel: sevC.info,
      msg: `INT_TEST1: ${reg.INT_TEST1.name_long} (0x${reg.INT_TEST1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.TX_PQ_IRQ.name_short.padEnd(13)}] ${f.TX_PQ_IRQ.name_long.padEnd(34)} = ${f.TX_PQ_IRQ.value}\n`+
           `[${f.STATS_IRQ.name_short.padEnd(13)}] ${f.STATS_IRQ.name_long.padEnd(34)} = ${f.STATS_IRQ.value}\n`+
           `[${f.STOP_IRQ.name_short.padEnd(13)}] ${f.STOP_IRQ.name_long.padEnd(34)} = ${f.STOP_IRQ.value}\n`+
           `[${f.RX_FILTER_IRQ.name_short.padEnd(13)}] ${f.RX_FILTER_IRQ.name_long.padEnd(34)} = ${f.RX_FILTER_IRQ.value}\n`+
           `[${f.TX_FILTER_IRQ.name_short.padEnd(13)}] ${f.TX_FILTER_IRQ.name_long.padEnd(34)} = ${f.TX_FILTER_IRQ.value}\n`+
           `[${f.TX_ABORT_IRQ.name_short.padEnd(13)}] ${f.TX_ABORT_IRQ.name_long.padEnd(34)} = ${f.TX_ABORT_IRQ.value}\n`+
           `[${f.RX_ABORT_IRQ.name_short.padEnd(13)}] ${f.RX_ABORT_IRQ.name_long.padEnd(34)} = ${f.RX_ABORT_IRQ.value}\n`+
           `[${f.RX_FILTER_ERR.name_short.padEnd(13)}] ${f.RX_FILTER_ERR.name_long.padEnd(34)} = ${f.RX_FILTER_ERR.value}\n`+
           `[${f.MEM_TO_ERR.name_short.padEnd(13)}] ${f.MEM_TO_ERR.name_long.padEnd(34)} = ${f.MEM_TO_ERR.value}\n`+
           `[${f.MEM_SFTY_ERR.name_short.padEnd(13)}] ${f.MEM_SFTY_ERR.name_long.padEnd(34)} = ${f.MEM_SFTY_ERR.value}\n`+
           `[${f.REG_CRC_ERR.name_short.padEnd(13)}] ${f.REG_CRC_ERR.name_long.padEnd(34)} = ${f.REG_CRC_ERR.value}\n`+
           `[${f.DESC_ERR.name_short.padEnd(13)}] ${f.DESC_ERR.name_long.padEnd(34)} = ${f.DESC_ERR.value}\n`+
           `[${f.AP_PARITY_ERR.name_short.padEnd(13)}] ${f.AP_PARITY_ERR.name_long.padEnd(34)} = ${f.AP_PARITY_ERR.value}\n`+
           `[${f.DP_PARITY_ERR.name_short.padEnd(13)}] ${f.DP_PARITY_ERR.name_long.padEnd(34)} = ${f.DP_PARITY_ERR.value}\n`+
           `[${f.DP_SEQ_ERR.name_short.padEnd(13)}] ${f.DP_SEQ_ERR.name_long.padEnd(34)} = ${f.DP_SEQ_ERR.value}\n`+
           `[${f.DP_DO_ERR.name_short.padEnd(13)}] ${f.DP_DO_ERR.name_long.padEnd(34)} = ${f.DP_DO_ERR.value}\n`+
           `[${f.DP_TO_ERR.name_short.padEnd(13)}] ${f.DP_TO_ERR.name_long.padEnd(34)} = ${f.DP_TO_ERR.value}\n`+
           `[${f.DMA_CH_ERR.name_short.padEnd(13)}] ${f.DMA_CH_ERR.name_long.padEnd(34)} = ${f.DMA_CH_ERR.value}\n`+
           `[${f.DMA_TO_ERR.name_short.padEnd(13)}] ${f.DMA_TO_ERR.name_long.padEnd(34)} = ${f.DMA_TO_ERR.value}\n`+
           `[${f.RESP_ERR.name_short.padEnd(13)}] ${f.RESP_ERR.name_long.padEnd(34)} = 0b${f.RESP_ERR.value.toString(2).padStart(2,'0')}`
    });
  }

  // === TX_SCAN_FC ==================================================
  if ('TX_SCAN_FC' in reg && reg.TX_SCAN_FC.int32 !== undefined) {
    const regValue = reg.TX_SCAN_FC.int32;
    // 0. Extend structure
    reg.TX_SCAN_FC.fields = {};
    reg.TX_SCAN_FC.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.TX_SCAN_FC, regValue, 'FQN_PQSN3', 29, 25, '4th cand. Queue/Slot');
    defineField(reg.TX_SCAN_FC, regValue, 'FQ_PQ3', 24, 24, 'TX Queue type FQ(0), PQ(1)');
    defineField(reg.TX_SCAN_FC, regValue, 'FQN_PQSN2', 21, 17, '3rd  cand. Queue/Slot');
    defineField(reg.TX_SCAN_FC, regValue, 'FQ_PQ2', 16, 16, 'TX Queue type FQ(0), PQ(1)');
    defineField(reg.TX_SCAN_FC, regValue, 'FQN_PQSN1', 13, 9, '2nd cand. Queue/Slot');
    defineField(reg.TX_SCAN_FC, regValue, 'FQ_PQ1', 8, 8, 'TX Queue type FQ(0), PQ(1)');
    defineField(reg.TX_SCAN_FC, regValue, 'FQN_PQSN0', 5, 1, '1st  cand. Queue/Slot');
    defineField(reg.TX_SCAN_FC, regValue, 'FQ_PQ0', 0, 0, 'TX Queue type FQ(0), PQ(1)');
    const f = reg.TX_SCAN_FC.fields;
    // 2. Report
    reg.TX_SCAN_FC.report.push({
      severityLevel: sevC.info,
      msg: `TX_SCAN_FC: ${reg.TX_SCAN_FC.name_long} (0x${reg.TX_SCAN_FC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.FQN_PQSN3.name_short.padEnd(9)}] ${f.FQN_PQSN3.name_long.padEnd(23)} = ${f.FQN_PQSN3.value}\n`+
           `[${f.FQ_PQ3.name_short.padEnd(9)}] ${f.FQ_PQ3.name_long.padEnd(26)} = ${f.FQ_PQ3.value}\n`+
           `[${f.FQN_PQSN2.name_short.padEnd(9)}] ${f.FQN_PQSN2.name_long.padEnd(24)} = ${f.FQN_PQSN2.value}\n`+
           `[${f.FQ_PQ2.name_short.padEnd(9)}] ${f.FQ_PQ2.name_long.padEnd(26)} = ${f.FQ_PQ2.value}\n`+
           `[${f.FQN_PQSN1.name_short.padEnd(9)}] ${f.FQN_PQSN1.name_long.padEnd(23)} = ${f.FQN_PQSN1.value}\n`+
           `[${f.FQ_PQ1.name_short.padEnd(9)}] ${f.FQ_PQ1.name_long.padEnd(26)} = ${f.FQ_PQ1.value}\n`+
           `[${f.FQN_PQSN0.name_short.padEnd(9)}] ${f.FQN_PQSN0.name_long.padEnd(24)} = ${f.FQN_PQSN0.value}\n`+
           `[${f.FQ_PQ0.name_short.padEnd(9)}] ${f.FQ_PQ0.name_long.padEnd(26)} = ${f.FQ_PQ0.value}`
    });
  }

  // === TX_SCAN_BC ==================================================
  if ('TX_SCAN_BC' in reg && reg.TX_SCAN_BC.int32 !== undefined) {
    const regValue = reg.TX_SCAN_BC.int32;
    // 0. Extend structure
    reg.TX_SCAN_BC.fields = {};
    reg.TX_SCAN_BC.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.TX_SCAN_BC, regValue, 'SH_OFFSET', 31, 22, '2nd cand. Offset (32byte/Desc)');
    defineField(reg.TX_SCAN_BC, regValue, 'SH_FQN_PQSN', 21, 17, '2nd cand. FIFO Queue/Slot Number');
    defineField(reg.TX_SCAN_BC, regValue, 'SH_PQ', 16, 16, '2nd cand. TX Queue type FQ(0), PQ(1)');
    defineField(reg.TX_SCAN_BC, regValue, 'FH_OFFSET', 15, 6, '1st cand. Offset (32byte/Desc)');
    defineField(reg.TX_SCAN_BC, regValue, 'FH_FQN_PQSN', 5, 1, '1st cand. FIFO Queue/Slot Number');
    defineField(reg.TX_SCAN_BC, regValue, 'FH_PQ', 0, 0, '1st cand. TX Queue type FQ(0), PQ(1)');
    const f = reg.TX_SCAN_BC.fields;
    // 2. Report
    reg.TX_SCAN_BC.report.push({
      severityLevel: sevC.info,
      msg: `TX_SCAN_BC: ${reg.TX_SCAN_BC.name_long} (0x${reg.TX_SCAN_BC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.SH_OFFSET.name_short.padEnd(11)}] ${f.SH_OFFSET.name_long.padEnd(36)} = ${f.SH_OFFSET.value} (valid if SH_PQ=0, Offset = ${f.SH_OFFSET.value}*32byte = ${f.SH_OFFSET.value * 32} byte)\n`+
           `[${f.SH_FQN_PQSN.name_short.padEnd(11)}] ${f.SH_FQN_PQSN.name_long.padEnd(36)} = ${f.SH_FQN_PQSN.value}\n`+
           `[${f.SH_PQ.name_short.padEnd(11)}] ${f.SH_PQ.name_long.padEnd(36)} = ${f.SH_PQ.value}\n`+
           `[${f.FH_OFFSET.name_short.padEnd(11)}] ${f.FH_OFFSET.name_long.padEnd(36)} = ${f.FH_OFFSET.value} (valid if FH_PQ=0, Offset = ${f.FH_OFFSET.value}*32byte = ${f.FH_OFFSET.value * 32} byte)\n`+
           `[${f.FH_FQN_PQSN.name_short.padEnd(11)}] ${f.FH_FQN_PQSN.name_long.padEnd(36)} = ${f.FH_FQN_PQSN.value}\n`+
           `[${f.FH_PQ.name_short.padEnd(11)}] ${f.FH_PQ.name_long.padEnd(36)} = ${f.SH_PQ.value}`
    });
  }

  // === TX_FQ_DESC_VALID ============================================
  if ('TX_FQ_DESC_VALID' in reg && reg.TX_FQ_DESC_VALID.int32 !== undefined) {
    const regValue = reg.TX_FQ_DESC_VALID.int32;
    // 0. Extend structure
    reg.TX_FQ_DESC_VALID.fields = {};
    reg.TX_FQ_DESC_VALID.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.TX_FQ_DESC_VALID, regValue, 'DESC_NC_VALID', 23, 16, 'Next/Current Descriptors is in L_MEM'); // next/current
    defineField(reg.TX_FQ_DESC_VALID, regValue, 'DESC_CN_VALID', 7, 0, 'Current/Next Descriptors is in L_MEM');   // current/next
    const f = reg.TX_FQ_DESC_VALID.fields;
    const ncIdx = listSet(f.DESC_NC_VALID.value,7);
    const cnIdx = listSet(f.DESC_CN_VALID.value,7);
    // 2. Report
    reg.TX_FQ_DESC_VALID.report.push({
      severityLevel: sevC.info,
      msg: `TX_FQ_DESC_VALID: ${reg.TX_FQ_DESC_VALID.name_long} (0x${reg.TX_FQ_DESC_VALID.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.DESC_NC_VALID.name_short.padEnd(13)}] ${f.DESC_NC_VALID.name_long.padEnd(36)} = 0x${f.DESC_NC_VALID.value.toString(16).toUpperCase().padStart(2,'0')} => TX FIFO Queues: ${ncIdx.length?ncIdx.join(', '):'none'}\n`+
           `[${f.DESC_CN_VALID.name_short.padEnd(13)}] ${f.DESC_CN_VALID.name_long.padEnd(36)} = 0x${f.DESC_CN_VALID.value.toString(16).toUpperCase().padStart(2,'0')} => TX FIFO Queues: ${cnIdx.length?cnIdx.join(', '):'none'}`
    });
  }

  // === TX_PQ_DESC_VALID ============================================
  if ('TX_PQ_DESC_VALID' in reg && reg.TX_PQ_DESC_VALID.int32 !== undefined) {
    const regValue = reg.TX_PQ_DESC_VALID.int32;
    // 0. Extend structure
    reg.TX_PQ_DESC_VALID.fields = {};
    reg.TX_PQ_DESC_VALID.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.TX_PQ_DESC_VALID, regValue, 'DESC_VALID', 31, 0, 'PQ Slot Descriptors is in LMEM', r => r >>> 0); // full mask
    const f = reg.TX_PQ_DESC_VALID.fields;
    // 2. Report
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);
    reg.TX_PQ_DESC_VALID.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_DESC_VALID: ${reg.TX_PQ_DESC_VALID.name_long} (0x${reg.TX_PQ_DESC_VALID.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.DESC_VALID.name_short.padEnd(10)}] ${f.DESC_VALID.name_long.padEnd(30)} = 0x${f.DESC_VALID.decoded.toString(16).toUpperCase().padStart(8,'0')}\n`+
           binLineHead +
           binLineData
    });
  }

  // === CRC_CTRL ====================================================
  if ('CRC_CTRL' in reg && reg.CRC_CTRL.int32 !== undefined) {
    const regValue = reg.CRC_CTRL.int32;
    // 0. Extend structure
    reg.CRC_CTRL.fields = {};
    reg.CRC_CTRL.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.CRC_CTRL, regValue, 'START', 0, 0, 'Start');
    // 2. Report
    reg.CRC_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `CRC_CTRL: ${reg.CRC_CTRL.name_long} (write-only) (0x${reg.CRC_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})`
    });

    // 3. Check values
    if (reg.CRC_CTRL.int32 !== 0) {
      reg.CRC_CTRL.report.push({
        severityLevel: sevC.warning,
        msg: `CRC_CTRL: read-value (0x${regValue.toString(16).toUpperCase().padStart(8,'0')}) should be = 0..0! (write-only register)`
      });
    }
  }

  // === CRC_REG =====================================================
  if ('CRC_REG' in reg && reg.CRC_REG.int32 !== undefined) {
    const regValue = reg.CRC_REG.int32;
    // 0. Extend structure
    reg.CRC_REG.fields = {};
    reg.CRC_REG.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.CRC_REG, regValue, 'CRC', 31, 0, 'Register Bank CRC Value', r => r >>> 0);
    const f = reg.CRC_REG.fields;
    // 2. Report
    reg.CRC_REG.report.push({
      severityLevel: sevC.info,
      msg: `CRC_REG: ${reg.CRC_REG.name_long} (0x${reg.CRC_REG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.CRC.name_short.padEnd(3)}] ${f.CRC.name_long.padEnd(23)} = 0x${f.CRC.decoded.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }
}

// ==================================================================================
// LMEM Memory Map (X_CAN): TXPQ Descriptors, TXFQ Descriptors, Filters
// - Only LMEM map is meaningful for X_CAN here
// - All three areas have configurable start addresses
// - If a resource is not enabled, its LMEM area is not needed
export function buildLMEMMemoryMap(reg) {
  const dash = '-';
  const hex8 = (v) => `0x${((v >>> 0) & 0xFFFFFFFF).toString(16).toUpperCase().padStart(8,'0')}`;
  const hex5 = (v) => `0x${(((v >>> 0) & 0xFFFFF)).toString(16).toUpperCase().padStart(5,'0')}`;
  const fmt = (v) => (v === undefined || v === null ? dash : v);

  // Columns and row builders (LMEM uses 20-bit address space formatting similar to XS_CAN)
  const mapCols = { name: 12, sa: 12, ea: 12, size: 12 };
  const memMapHeader = () => [
    'LMEM Memory Map\n' +
    'Name'.padEnd(mapCols.name) +
    'START byte'.padEnd(mapCols.sa) +
    'END byte'.padEnd(mapCols.ea) +
    'SIZE'.padEnd(mapCols.size) + '\n' +
    ''.padEnd(mapCols.name + mapCols.sa + mapCols.ea + mapCols.size, '-')
  ];
  const entryLineLmem = (n, s, e, sz) => (
    n.padEnd(mapCols.name) +
    (s !== undefined ? hex5(s) : dash).padEnd(mapCols.sa) +
    (e !== undefined ? hex5(e) : dash).padEnd(mapCols.ea) +
    (sz !== undefined ? `${sz.toString(10).padStart(6)} byte` : dash).padEnd(mapCols.size)
  );

  const rows = [];
  const entries = [];

  // Helpers to read register raw values and decoded fields
  const rb = (name) => (name in reg && reg[name].int32 !== undefined) ? reg[name].int32 >>> 0 : undefined;
  const hasFields = (name) => (name in reg && reg[name].fields !== undefined);
  const bits = (val, msb, lsb) => (val === undefined ? undefined : getBits(val, msb, lsb));

  // 1) Filters (RX Filter Memory in LMEM)
  // Start address: RX_FILTER_MEM_ADD.BASE_ADDR (16-bit byte address)
  const rxFiltAdd = rb('RX_FILTER_MEM_ADD');
  const rxFiltBase = bits(rxFiltAdd, 15, 0);
  const rxFiltSA = rxFiltBase !== undefined ? (rxFiltBase) : undefined; // byte address
  // Elements enabled: RX_FILTER_CTRL.NB_FE > 0
  const rxFiltCtrl = rb('RX_FILTER_CTRL');
  const rxFiltNum = bits(rxFiltCtrl, 7, 0); // NB_FE
  if (rxFiltSA !== undefined && rxFiltNum !== undefined && rxFiltNum > 0) {
    // Size estimate (similar to XS_CAN): header/alignment + per-element bytes
    const bytesFilterElement = rxFiltNum * 4; // alignment/administration (bytes)
    const bytesMin = bytesFilterElement + (rxFiltNum * 8);   // min with 1 comparison/filter
    const bytesMax = bytesFilterElement + (rxFiltNum * 16);  // max with 2 comparisons/filter
    const rxFiltEA_min = rxFiltSA + bytesMin - 1; // last byte (min)
    const rxFiltEA_max = rxFiltSA + bytesMax - 1; // last byte (max)
    const rxFiltSizeMin = rxFiltEA_min - rxFiltSA + 1;
    entries.push({ name: 'Filters', sa: rxFiltSA, ea: rxFiltEA_min, size: rxFiltSizeMin, _filtersMaxEa: rxFiltEA_max });
  }

  // 2) TXFQ Descriptors in LMEM
  // Base: TX_DESC_MEM_ADD.FQ_BASE_ADDR (16-bit byte address)
  const txDescAdd = rb('TX_DESC_MEM_ADD');
  const txFqBase = bits(txDescAdd, 15, 0);
  const txFqSA = txFqBase !== undefined ? (txFqBase) : undefined;
  // Enabled mask: TX_FQ_CTRL2.ENABLE (any bit set means TXFQ used)
  const txFqCtrl2 = rb('TX_FQ_CTRL2');
  const txFqEnableMask = bits(txFqCtrl2, 7, 0);
  // Number of FIFOs considered: highest enabled index + 1; one FIFO requires 2 descriptors
  const highestBitIndex8 = (mask) => {
    if (mask === undefined) return -1;
    let m = (mask & 0xFF) >>> 0;
    if (m === 0) return -1;
    let idx = 7;
    while (idx >= 0 && ((m & (1 << idx)) === 0)) idx--;
    return idx;
  };
  const txFqCount = (txFqEnableMask >= 0) ? (highestBitIndex8(txFqEnableMask) + 1) : 0;
  const txFqBytes = txFqCount > 0 ? (txFqCount * 2 * 32) >>> 0 : 0; // 2 descriptors/FIFO, 32 bytes/descriptor
  if (txFqSA !== undefined && txFqBytes > 0 && txFqEnableMask !== undefined && txFqEnableMask !== 0) {
    const txFqEA = txFqSA + txFqBytes - 1;
    entries.push({ name: 'TXFQ', sa: txFqSA, ea: txFqEA, size: txFqBytes });
  }

  // 3) TXPQ Descriptors in LMEM
  // Base: TX_DESC_MEM_ADD.PQ_BASE_ADDR (16-bit word address => bytes = <<2)
  const txPqBase = bits(txDescAdd, 31, 16);
  const txPqSA = txPqBase !== undefined ? (txPqBase) : undefined;
  // Slots that place descriptors in LMEM: TX_PQ_CTRL2.ENABLE mask: The highest enabledbit index defines the neede memory space
  const txPqCtrl2 = rb('TX_PQ_CTRL2');
  const txPqEnableMask = bits(txPqCtrl2, 31, 0) >>> 0; // convert to unsigned via >>> 0, to prevent negative numbers in printout
  const highestBitIndex = (mask) => {
    if (mask === undefined) return -1;
    let m = mask >>> 0;
    if (m === 0) return -1;
    // Find most significant set bit (0-based index)
    let idx = 31;
    while (idx >= 0 && ((m & (1 << idx)) === 0)) idx--;
    return idx;
  };
  const msbIdx = highestBitIndex(txPqEnableMask);
  const txPqDescriptors = msbIdx >= 0 ? (msbIdx + 1) : 0; // highest bit number + 1 defines needed descriptors
  const txPqBytes = ((txPqDescriptors > 0) && (txPqEnableMask !== undefined && txPqEnableMask !== 0)) ? (txPqDescriptors * 32) >>> 0 : 0; // assume 32 bytes/descriptor region
  if (txPqSA !== undefined && txPqBytes > 0 && (txPqEnableMask !== undefined && txPqEnableMask !== 0)) {
    const txPqEA = txPqSA + txPqBytes - 1;
    entries.push({ name: 'TXPQ', sa: txPqSA, ea: txPqEA, size: txPqBytes });
  }

  // Sort entries by start address and detect overlaps
  entries.sort((a, b) => (a.sa ?? 0) - (b.sa ?? 0));
  const overlapErrors = [];
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const cur  = entries[i];
    if (prev && cur && prev.ea !== undefined && cur.sa !== undefined && cur.ea !== undefined) {
      if (cur.sa <= prev.ea) {
        overlapErrors.push(
          `LMEM overlap detected: ${prev.name} [${hex5(prev.sa)} - ${hex5(prev.ea)}] overlaps with ${cur.name} [${hex5(cur.sa)} - ${hex5(cur.ea)}]`
        );
      }
    }
  }

  // Build map text with gaps
  const header = memMapHeader();
  const lines = [...header];
  let prevEnd;
  for (const it of entries) {
    if (prevEnd !== undefined && it.sa !== undefined && it.sa > (prevEnd + 1)) {
      lines.push(entryLineLmem('- GAP -', prevEnd + 1, it.sa, (it.sa - (prevEnd + 1))));
    }
    lines.push(entryLineLmem(it.name, it.sa, it.ea, it.size));
    if (it.name === 'Filters' && it._filtersMaxEa !== undefined) {
      lines[lines.length - 1] += ` (max. End byte ${hex5(it._filtersMaxEa)} if 2 Comparisons/Filter)`;
    }
    prevEnd = (it.ea !== undefined ? it.ea : prevEnd);
  }

  const msg_lmemMap = lines.join('\n');

  // Append to a suitable register report list
  const targets = [
    'RX_FILTER_CTRL',
    'TX_PQ_CTRL2',
    'TX_FQ_CTRL2',
    'TX_DESC_MEM_ADD',
    'RX_FILTER_MEM_ADD'
  ];
  let appended = false;
  for (const name of targets) {
    if (name in reg && reg[name] && Array.isArray(reg[name].report)) {
      reg[name].report.push({ severityLevel: sevC.infoBold, msg: msg_lmemMap });
      if (overlapErrors.length) {
        for (const emsg of overlapErrors) reg[name].report.push({ severityLevel: sevC.error, msg: emsg });
      } else {
        reg[name].report.push({ severityLevel: sevC.calculation, msg: 'LMEM: no range overlap detected' });
      }
      appended = true;
      break;
    }
  }
  if (!appended) {
    console.log('LMEM/SMEM Memory Map: no appropriate register found to append report; not printed.');
  }
}
