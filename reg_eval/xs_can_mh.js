// All rights reserved. (c) 2026 //

// XS_CAN: MH register decoding
import { getBits, defineField } from './help_functions.js';
import { sevC } from './help_functions.js';

// ===================================================================================
// MH Global registers: VERSION, MH_CTRL, MH_CFG (detailed decoding)
export function procRegsMhGlobal(reg) {
  // === VERSION: Release Identification Register ========================
  if ('XSCAN_VERSION' in reg && reg.XSCAN_VERSION.int32 !== undefined) {
    const regValue = reg.XSCAN_VERSION.int32;

    // 0. Extend existing register structure
    reg.XSCAN_VERSION.fields = {};
    reg.XSCAN_VERSION.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.XSCAN_VERSION, regValue, 'MAJOR', 11, 8, 'Major');
    defineField(reg.XSCAN_VERSION, regValue, 'MINOR', 7, 4, 'Minor');
    defineField(reg.XSCAN_VERSION, regValue, 'PATCH', 3, 0, 'Patch');
    const f = reg.XSCAN_VERSION.fields;

    // 1. Decode all individual bits of register
    reg.XSCAN_VERSION.report.push({
      severityLevel: sevC.info,
      msg: `XSCAN_VERSION: ${reg.XSCAN_VERSION.name_long} (0x${reg.XSCAN_VERSION.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
         `[${f.MAJOR.name_short.padEnd(7)}] ${f.MAJOR.name_long.padEnd(5)} = 0x${f.MAJOR.value.toString(16).toUpperCase()}\n` +
         `[${f.MINOR.name_short.padEnd(7)}] ${f.MINOR.name_long.padEnd(5)} = 0x${f.MINOR.value.toString(16).toUpperCase()}\n` +
         `[${f.PATCH.name_short.padEnd(7)}] ${f.PATCH.name_long.padEnd(5)} = 0x${f.PATCH.value.toString(16).toUpperCase()}`
    });

    // 2. Generate human-readable register report
    reg.XSCAN_VERSION.report.push({
      severityLevel: sevC.infoBold,
      msg: `Version: XS_CAN ${f.MAJOR.value.toString(16).toUpperCase()}.${f.MINOR.value.toString(16).toUpperCase()}.${f.PATCH.value.toString(16).toUpperCase()}`
    });
  } // XSCAN_VERSION

  // === MH_CTRL: Message Handler Control register =======================
  if ('MH_CTRL' in reg && reg.MH_CTRL.int32 !== undefined) {
    const regValue = reg.MH_CTRL.int32;

    // 0. Extend existing register structure
    reg.MH_CTRL.fields = {};
    reg.MH_CTRL.report = [];

    // 1. Decode all individual bits of MH_CTRL register
    defineField(reg.MH_CTRL, regValue, 'MH_ENABLE', 0, 0, 'Message Handler Enable');
    const f = reg.MH_CTRL.fields;

    // 2. Generate human-readable register report
    reg.MH_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `MH_CTRL: ${reg.MH_CTRL.name_long} (0x${reg.MH_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.MH_ENABLE.name_short.padEnd(9)}] ${f.MH_ENABLE.name_long.padEnd(22)} = ${f.MH_ENABLE.value} (0: disabled, 1: enabled)`
    });
  } // MH_CTRL

  // === MH_CFG: Message Handler Configuration register ==================
  if ('MH_CFG' in reg && reg.MH_CFG.int32 !== undefined) {
    const regValue = reg.MH_CFG.int32;

    // 0. Extend existing register structure
    reg.MH_CFG.fields = {};
    reg.MH_CFG.report = [];

    // 1. Decode all individual bits of MH_CFG register
    defineField(reg.MH_CFG, regValue, 'MAX_RETRANS', 18, 16, 'Maximum TX re-transmissions');
    defineField(reg.MH_CFG, regValue, 'CTME', 8, 8, 'Cut-Through Mode Enable');
    defineField(reg.MH_CFG, regValue, 'RXFQ1E', 4, 4, 'RXFQ1 Enable');
    defineField(reg.MH_CFG, regValue, 'RXFQ0E', 3, 3, 'RXFQ0 Enable');
    defineField(reg.MH_CFG, regValue, 'TEFQE', 2, 2, 'TX Event FIFO Enable');
    defineField(reg.MH_CFG, regValue, 'TXPQE', 1, 1, 'TX Priority Queue Enable');
    defineField(reg.MH_CFG, regValue, 'TXFQE', 0, 0, 'TX FIFO Queue Enable');
    const f = reg.MH_CFG.fields;

    // 2. Generate human-readable register report
    reg.MH_CFG.report.push({
      severityLevel: sevC.info,
      msg: `MH_CFG: ${reg.MH_CFG.name_long} (0x${reg.MH_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.MAX_RETRANS.name_short.padEnd(11)}] ${f.MAX_RETRANS.name_long.padEnd(27)} = ${f.MAX_RETRANS.value} (0: none, 1-6: 1-6, 7: unlimited)\n` +
           `[${f.CTME.name_short.padEnd(11)}] ${f.CTME.name_long.padEnd(27)} = ${f.CTME.value} (0: FMM, 1: CTM)\n` +
           `[${f.RXFQ1E.name_short.padEnd(11)}] ${f.RXFQ1E.name_long.padEnd(27)} = ${f.RXFQ1E.value}\n` +
           `[${f.RXFQ0E.name_short.padEnd(11)}] ${f.RXFQ0E.name_long.padEnd(27)} = ${f.RXFQ0E.value}\n` +
           `[${f.TEFQE.name_short.padEnd(11)}] ${f.TEFQE.name_long.padEnd(27)} = ${f.TEFQE.value}\n` +
           `[${f.TXPQE.name_short.padEnd(11)}] ${f.TXPQE.name_long.padEnd(27)} = ${f.TXPQE.value}\n` +
           `[${f.TXFQE.name_short.padEnd(11)}] ${f.TXFQE.name_long.padEnd(27)} = ${f.TXFQE.value}`
    });
  } // MH_CFG

  // === MH_STS0: Message Handler Status register ======================
  if ('MH_STS0' in reg && reg.MH_STS0.int32 !== undefined) {
    const regValue = reg.MH_STS0.int32;

    // 0. Extend existing register structure
    reg.MH_STS0.fields = {};
    reg.MH_STS0.report = [];

    // 1. Decode all individual bits of MH_STS0 register
    defineField(reg.MH_STS0, regValue, 'TXFQ_ELEM_TOO_BIG', 30, 30, 'TXFQ element too big');
    defineField(reg.MH_STS0, regValue, 'TXPQ_ELEM_TOO_BIG', 29, 29, 'TXPQ element too big');
    defineField(reg.MH_STS0, regValue, 'TXFQ_FULL_WR', 28, 28, 'Write to full TXFQ');
    defineField(reg.MH_STS0, regValue, 'TXPQ_FULL_WR', 27, 27, 'Write to full TXPQ');
    defineField(reg.MH_STS0, regValue, 'TEFQ_EMPTY_RD', 26, 26, 'Read from empty TEFQ');
    defineField(reg.MH_STS0, regValue, 'RXFQ0_EMPTY_RD', 25, 25, 'Read from empty RXFQ0');
    defineField(reg.MH_STS0, regValue, 'RXFQ1_EMPTY_RD', 24, 24, 'Read from empty RXFQ1');
    defineField(reg.MH_STS0, regValue, 'CTB_RD_WO_REQ', 23, 23, 'CTB read without request');
    defineField(reg.MH_STS0, regValue, 'CTB_WR_WO_REQ', 22, 22, 'CTB write without request');
    defineField(reg.MH_STS0, regValue, 'TXFQ_VB_NO_SA', 21, 21, 'TXFQ VB wrong addr');
    defineField(reg.MH_STS0, regValue, 'TXPQ_VB_NO_SA', 20, 20, 'TXPQ VB wrong addr');
    defineField(reg.MH_STS0, regValue, 'TEFQ_VB_NO_SA', 19, 19, 'TEFQ VB wrong addr');
    defineField(reg.MH_STS0, regValue, 'RXFQ0_VB_NO_SA', 18, 18, 'RXFQ0 VB wrong addr');
    defineField(reg.MH_STS0, regValue, 'RXFQ1_VB_NO_SA', 17, 17, 'RXFQ1 VB wrong addr');
    defineField(reg.MH_STS0, regValue, 'CTB_VB_NO_SA', 16, 16, 'CTB VB wrong addr');
    defineField(reg.MH_STS0, regValue, 'CLOCK_ACTIVE', 1, 1, 'HOST_CLK active');
    defineField(reg.MH_STS0, regValue, 'PRT_ENABLE', 0, 0, 'PRT enable signal');
    const f = reg.MH_STS0.fields;

    // 2. Generate human-readable register report
    reg.MH_STS0.report.push({
      severityLevel: sevC.info,
      msg: `MH_STS0: ${reg.MH_STS0.name_long} (0x${reg.MH_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.TXFQ_ELEM_TOO_BIG.name_short.padEnd(17)}] ${f.TXFQ_ELEM_TOO_BIG.name_long.padEnd(28)} = ${f.TXFQ_ELEM_TOO_BIG.value}\n` +
           `[${f.TXPQ_ELEM_TOO_BIG.name_short.padEnd(17)}] ${f.TXPQ_ELEM_TOO_BIG.name_long.padEnd(28)} = ${f.TXPQ_ELEM_TOO_BIG.value}\n` +
           `[${f.TXFQ_FULL_WR.name_short.padEnd(17)}] ${f.TXFQ_FULL_WR.name_long.padEnd(28)} = ${f.TXFQ_FULL_WR.value}\n` +
           `[${f.TXPQ_FULL_WR.name_short.padEnd(17)}] ${f.TXPQ_FULL_WR.name_long.padEnd(28)} = ${f.TXPQ_FULL_WR.value}\n` +
           `[${f.TEFQ_EMPTY_RD.name_short.padEnd(17)}] ${f.TEFQ_EMPTY_RD.name_long.padEnd(28)} = ${f.TEFQ_EMPTY_RD.value}\n` +
           `[${f.RXFQ0_EMPTY_RD.name_short.padEnd(17)}] ${f.RXFQ0_EMPTY_RD.name_long.padEnd(28)} = ${f.RXFQ0_EMPTY_RD.value}\n` +
           `[${f.RXFQ1_EMPTY_RD.name_short.padEnd(17)}] ${f.RXFQ1_EMPTY_RD.name_long.padEnd(28)} = ${f.RXFQ1_EMPTY_RD.value}\n` +
           `[${f.CTB_RD_WO_REQ.name_short.padEnd(17)}] ${f.CTB_RD_WO_REQ.name_long.padEnd(28)} = ${f.CTB_RD_WO_REQ.value} (N/A in FMM)\n` +
           `[${f.CTB_WR_WO_REQ.name_short.padEnd(17)}] ${f.CTB_WR_WO_REQ.name_long.padEnd(28)} = ${f.CTB_WR_WO_REQ.value} (N/A in FMM)\n` +
           `[${f.TXFQ_VB_NO_SA.name_short.padEnd(17)}] ${f.TXFQ_VB_NO_SA.name_long.padEnd(28)} = ${f.TXFQ_VB_NO_SA.value}\n` +
           `[${f.TXPQ_VB_NO_SA.name_short.padEnd(17)}] ${f.TXPQ_VB_NO_SA.name_long.padEnd(28)} = ${f.TXPQ_VB_NO_SA.value}\n` +
           `[${f.TEFQ_VB_NO_SA.name_short.padEnd(17)}] ${f.TEFQ_VB_NO_SA.name_long.padEnd(28)} = ${f.TEFQ_VB_NO_SA.value}\n` +
           `[${f.RXFQ0_VB_NO_SA.name_short.padEnd(17)}] ${f.RXFQ0_VB_NO_SA.name_long.padEnd(28)} = ${f.RXFQ0_VB_NO_SA.value}\n` +
           `[${f.RXFQ1_VB_NO_SA.name_short.padEnd(17)}] ${f.RXFQ1_VB_NO_SA.name_long.padEnd(28)} = ${f.RXFQ1_VB_NO_SA.value}\n` +
           `[${f.CTB_VB_NO_SA.name_short.padEnd(17)}] ${f.CTB_VB_NO_SA.name_long.padEnd(28)} = ${f.CTB_VB_NO_SA.value} (N/A in FMM)\n` +
           `[${f.CLOCK_ACTIVE.name_short.padEnd(17)}] ${f.CLOCK_ACTIVE.name_long.padEnd(28)} = ${f.CLOCK_ACTIVE.value}\n` +
           `[${f.PRT_ENABLE.name_short.padEnd(17)}] ${f.PRT_ENABLE.name_long.padEnd(28)} = ${f.PRT_ENABLE.value}`
    });
  } // MH_STS0

  // === MH_STS1: Message Handler Status register ======================
  if ('MH_STS1' in reg && reg.MH_STS1.int32 !== undefined) {
    const regValue = reg.MH_STS1.int32;

    // 0. Extend existing register structure
    reg.MH_STS1.fields = {};
    reg.MH_STS1.report = [];

    // 1. Decode all individual bits of MH_STS1 register
    defineField(reg.MH_STS1, regValue, 'TXFQ_VB_NONLIN_ACC', 17, 17, 'TXFQ VB non-linear access');
    defineField(reg.MH_STS1, regValue, 'TXPQ_VB_NONLIN_ACC', 16, 16, 'TXPQ VB non-linear access');
    defineField(reg.MH_STS1, regValue, 'TEFQ_VB_NONLIN_ACC', 15, 15, 'TEFQ VB non-linear access');
    defineField(reg.MH_STS1, regValue, 'RXFQ0_VB_NONLIN_ACC', 14, 14, 'RXFQ0 VB non-linear access');
    defineField(reg.MH_STS1, regValue, 'RXFQ1_VB_NONLIN_ACC', 13, 13, 'RXFQ1 VB non-linear access');
    defineField(reg.MH_STS1, regValue, 'CTB_VB_NONLIN_ACC', 12, 12, 'CTB VB non-linear access');
    defineField(reg.MH_STS1, regValue, 'TXFQ_VB_RD', 11, 11, 'Read from TXFQ VB');
    defineField(reg.MH_STS1, regValue, 'TXPQ_VB_RD', 10, 10, 'Read from TXPQ VB');
    defineField(reg.MH_STS1, regValue, 'TEFQ_VB_WR', 9, 9, 'Write to TEFQ VB');
    defineField(reg.MH_STS1, regValue, 'RXFQ0_VB_WR', 8, 8, 'Write to RXFQ0 VB');
    defineField(reg.MH_STS1, regValue, 'RXFQ1_VB_WR', 7, 7, 'Write to RXFQ1 VB');
    defineField(reg.MH_STS1, regValue, 'CTB_VB_TX_RD', 6, 6, 'Read TX from CTB VB');
    defineField(reg.MH_STS1, regValue, 'CTB_VB_RX_WR', 5, 5, 'Write RX to CTB VB');
    defineField(reg.MH_STS1, regValue, 'TX_DP_SEQ_ERR', 4, 4, 'TX datapath sequence error');
    defineField(reg.MH_STS1, regValue, 'RX_DP_SEQ_ERR', 3, 3, 'RX datapath sequence error');
    defineField(reg.MH_STS1, regValue, 'TX_DP_PARITY_ERR', 2, 2, 'TX datapath parity error');
    defineField(reg.MH_STS1, regValue, 'RX_DP_PARITY_ERR', 1, 1, 'RX datapath parity error');
    defineField(reg.MH_STS1, regValue, 'TS_PARITY_ERR', 0, 0, 'Timestamp parity error');
    const f = reg.MH_STS1.fields;

    // 2. Generate human-readable register report
    reg.MH_STS1.report.push({
      severityLevel: sevC.info,
      msg: `MH_STS1: ${reg.MH_STS1.name_long} (0x${reg.MH_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.TXFQ_VB_NONLIN_ACC.name_short.padEnd(19)}] ${f.TXFQ_VB_NONLIN_ACC.name_long.padEnd(26)} = ${f.TXFQ_VB_NONLIN_ACC.value}\n` +
           `[${f.TXPQ_VB_NONLIN_ACC.name_short.padEnd(19)}] ${f.TXPQ_VB_NONLIN_ACC.name_long.padEnd(26)} = ${f.TXPQ_VB_NONLIN_ACC.value}\n` +
           `[${f.TEFQ_VB_NONLIN_ACC.name_short.padEnd(19)}] ${f.TEFQ_VB_NONLIN_ACC.name_long.padEnd(26)} = ${f.TEFQ_VB_NONLIN_ACC.value}\n` +
           `[${f.RXFQ0_VB_NONLIN_ACC.name_short.padEnd(19)}] ${f.RXFQ0_VB_NONLIN_ACC.name_long.padEnd(26)} = ${f.RXFQ0_VB_NONLIN_ACC.value}\n` +
           `[${f.RXFQ1_VB_NONLIN_ACC.name_short.padEnd(19)}] ${f.RXFQ1_VB_NONLIN_ACC.name_long.padEnd(26)} = ${f.RXFQ1_VB_NONLIN_ACC.value}\n` +
           `[${f.CTB_VB_NONLIN_ACC.name_short.padEnd(19)}] ${f.CTB_VB_NONLIN_ACC.name_long.padEnd(26)} = ${f.CTB_VB_NONLIN_ACC.value} (N/A in FMM)\n` +
           `[${f.TXFQ_VB_RD.name_short.padEnd(19)}] ${f.TXFQ_VB_RD.name_long.padEnd(26)} = ${f.TXFQ_VB_RD.value}\n` +
           `[${f.TXPQ_VB_RD.name_short.padEnd(19)}] ${f.TXPQ_VB_RD.name_long.padEnd(26)} = ${f.TXPQ_VB_RD.value}\n` +
           `[${f.TEFQ_VB_WR.name_short.padEnd(19)}] ${f.TEFQ_VB_WR.name_long.padEnd(26)} = ${f.TEFQ_VB_WR.value}\n` +
           `[${f.RXFQ0_VB_WR.name_short.padEnd(19)}] ${f.RXFQ0_VB_WR.name_long.padEnd(26)} = ${f.RXFQ0_VB_WR.value}\n` +
           `[${f.RXFQ1_VB_WR.name_short.padEnd(19)}] ${f.RXFQ1_VB_WR.name_long.padEnd(26)} = ${f.RXFQ1_VB_WR.value}\n` +
           `[${f.CTB_VB_TX_RD.name_short.padEnd(19)}] ${f.CTB_VB_TX_RD.name_long.padEnd(26)} = ${f.CTB_VB_TX_RD.value} (N/A in FMM)\n` +
           `[${f.CTB_VB_RX_WR.name_short.padEnd(19)}] ${f.CTB_VB_RX_WR.name_long.padEnd(26)} = ${f.CTB_VB_RX_WR.value} (N/A in FMM)\n` +
           `[${f.TX_DP_SEQ_ERR.name_short.padEnd(19)}] ${f.TX_DP_SEQ_ERR.name_long.padEnd(26)} = ${f.TX_DP_SEQ_ERR.value}\n` +
           `[${f.RX_DP_SEQ_ERR.name_short.padEnd(19)}] ${f.RX_DP_SEQ_ERR.name_long.padEnd(26)} = ${f.RX_DP_SEQ_ERR.value}\n` +
           `[${f.TX_DP_PARITY_ERR.name_short.padEnd(19)}] ${f.TX_DP_PARITY_ERR.name_long.padEnd(26)} = ${f.TX_DP_PARITY_ERR.value}\n` +
           `[${f.RX_DP_PARITY_ERR.name_short.padEnd(19)}] ${f.RX_DP_PARITY_ERR.name_long.padEnd(26)} = ${f.RX_DP_PARITY_ERR.value}\n` +
           `[${f.TS_PARITY_ERR.name_short.padEnd(19)}] ${f.TS_PARITY_ERR.name_long.padEnd(26)} = ${f.TS_PARITY_ERR.value} (PRT stops when set)`
    });
  } // MH_STS1

  // === MH_SFTY_CFG: Safety Configuration register ====================
  if ('MH_SFTY_CFG' in reg && reg.MH_SFTY_CFG.int32 !== undefined) {
    const regValue = reg.MH_SFTY_CFG.int32;

    // 0. Extend existing register structure
    reg.MH_SFTY_CFG.fields = {};
    reg.MH_SFTY_CFG.report = [];

    // 1. Decode all individual bits of MH_SFTY_CFG register
    defineField(reg.MH_SFTY_CFG, regValue, 'LMEM_TIMEOUT_VAL', 15, 8, 'LMEM watchdog timeout (ticks)');
    defineField(reg.MH_SFTY_CFG, regValue, 'PRESCALER', 2, 1, 'Watchdog prescaler');
    defineField(reg.MH_SFTY_CFG, regValue, 'LMEM_TO_EN', 0, 0, 'Enable LMEM watchdog');
    const f = reg.MH_SFTY_CFG.fields;

    // Derive human-readable clock division from PRESCALER
    const presVal = f.PRESCALER.value;
    const presDiv = (presVal >= 0 && presVal <= 3) ? (32 << presVal) : undefined;

    // 2. Generate human-readable register report
    reg.MH_SFTY_CFG.report.push({
      severityLevel: sevC.info,
      msg: `MH_SFTY_CFG: ${reg.MH_SFTY_CFG.name_long} (0x${reg.MH_SFTY_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.LMEM_TIMEOUT_VAL.name_short.padEnd(16)}] ${f.LMEM_TIMEOUT_VAL.name_long.padEnd(29)} = ${f.LMEM_TIMEOUT_VAL.value}\n` +
           `[${f.PRESCALER.name_short.padEnd(16)}] ${f.PRESCALER.name_long.padEnd(29)} = ${f.PRESCALER.value} (${presDiv !== undefined ? `clk divided by ${presDiv}` : 'Reserved/invalid'})\n` +
           `[${f.LMEM_TO_EN.name_short.padEnd(16)}] ${f.LMEM_TO_EN.name_long.padEnd(29)} = ${f.LMEM_TO_EN.value}`
    });
  } // MH_SFTY_CFG

  // === LMEM_PROT: LMEM Protection Address register ===================
  if ('LMEM_PROT' in reg && reg.LMEM_PROT.int32 !== undefined) {
    const regValue = reg.LMEM_PROT.int32;

    // 0. Extend existing register structure
    reg.LMEM_PROT.fields = {};
    reg.LMEM_PROT.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.LMEM_PROT, regValue, 'EA', 31, 16, 'LMEM End   Address (of accessible space)');
    defineField(reg.LMEM_PROT, regValue, 'SA', 15, 0, 'LMEM Start Address (of accessible space)');
    const f = reg.LMEM_PROT.fields;

    // 2. Generate human-readable register report
    reg.LMEM_PROT.report.push({
      severityLevel: sevC.info,
      msg: `LMEM_PROT: ${reg.LMEM_PROT.name_long} (0x${reg.LMEM_PROT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.EA.name_short.padEnd(2)}] ${f.EA.name_long.padEnd(40)} = 0x${(f.EA.value).toString(16).toUpperCase().padStart(4,'0')} word addr = 0x${(f.EA.value << 2).toString(16).toUpperCase().padStart(5,'0')} (dec: ${(f.EA.value << 2).toString(10).padStart(5,' ')}) byte addr\n` +
           `[${f.SA.name_short.padEnd(2)}] ${f.SA.name_long.padEnd(40)} = 0x${(f.SA.value).toString(16).toUpperCase().padStart(4,'0')} word addr = 0x${(f.SA.value << 2).toString(16).toUpperCase().padStart(5,'0')} (dec: ${(f.SA.value << 2).toString(10).padStart(5,' ')}) byte addr`
    });

    // Check if Protected area is maximum size
    if (f.SA.value === 0x0000 && f.EA.value === 0xFFFF) {
      reg.LMEM_PROT.report.push({
        severityLevel: sevC.infoBold,
        msg: `LMEM_PROT: Entire LMEM address space (18 bit = 256 KB) is accessible by XS_CAN (no protection applied)!`
      });
    }
  } // LMEM_PROT

  // === RX_FILTER_CFG: Global RX Filter configuration register =========
  if ('RX_FILTER_CFG' in reg && reg.RX_FILTER_CFG.int32 !== undefined) {
    const regValue = reg.RX_FILTER_CFG.int32;

    // 0. Extend existing register structure
    reg.RX_FILTER_CFG.fields = {};
    reg.RX_FILTER_CFG.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RX_FILTER_CFG, regValue, 'DEFAULT_FIFO', 9, 9, 'Default RX FIFO');
    defineField(reg.RX_FILTER_CFG, regValue, 'AFAB', 8, 8, 'Accept Filter Abort Frames');
    defineField(reg.RX_FILTER_CFG, regValue, 'ANMF', 7, 7, 'Accept Non-Matching Frames');
    defineField(reg.RX_FILTER_CFG, regValue, 'FE_NUM', 6, 0, 'RX Filter elements #');
    const f = reg.RX_FILTER_CFG.fields;

    const defFifoName = f.DEFAULT_FIFO.value ? 'RXFQ1' : 'RXFQ0';

    // 2. Generate human-readable register report
    reg.RX_FILTER_CFG.report.push({
      severityLevel: sevC.info,
      msg: `RX_FILTER_CFG: ${reg.RX_FILTER_CFG.name_long} (0x${reg.RX_FILTER_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.DEFAULT_FIFO.name_short.padEnd(12)}] ${f.DEFAULT_FIFO.name_long.padEnd(26)} = ${f.DEFAULT_FIFO.value} (${defFifoName}, destination for Frames for AFAB and ANMF)\n` +
           `[${f.AFAB.name_short.padEnd(12)}] ${f.AFAB.name_long.padEnd(26)} = ${f.AFAB.value} (store Frame if Filtering not finished in time)\n` +
           `[${f.ANMF.name_short.padEnd(12)}] ${f.ANMF.name_long.padEnd(26)} = ${f.ANMF.value} (store Frame if no Filter matches)\n` +
           `[${f.FE_NUM.name_short.padEnd(12)}] ${f.FE_NUM.name_long.padEnd(26)} = ${f.FE_NUM.value} (0-127 allowed, 0: disabled)`
    });
  } // RX_FILTER_CFG

  // === RX_FILTER_LMEM: RX Filter Start Address register ===============
  if ('RX_FILTER_LMEM' in reg && reg.RX_FILTER_LMEM.int32 !== undefined) {
    const regValue = reg.RX_FILTER_LMEM.int32;

    // 0. Extend existing register structure
    reg.RX_FILTER_LMEM.fields = {};
    reg.RX_FILTER_LMEM.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RX_FILTER_LMEM, regValue, 'SA', 17, 6, 'Start address (LMEM, 64 byte aligned)');
    const f = reg.RX_FILTER_LMEM.fields;
    const startAddrByte = f.SA.value << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RX_FILTER_LMEM.report.push({
      severityLevel: sevC.info,
      msg: `RX_FILTER_LMEM: ${reg.RX_FILTER_LMEM.name_long} (0x${reg.RX_FILTER_LMEM.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.SA.name_short.padEnd(2)}] ${f.SA.name_long.padEnd(37)} = 0x${(startAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // RX_FILTER_LMEM
}

export function procRegsMhTXFQ(reg) {
  // === TXFQ_LMEM_SA: TXFQ Start Address register =====================
  if ('TXFQ_LMEM_SA' in reg && reg.TXFQ_LMEM_SA.int32 !== undefined) {
    const regValue = reg.TXFQ_LMEM_SA.int32;

    // 0. Extend existing register structure
    reg.TXFQ_LMEM_SA.fields = {};
    reg.TXFQ_LMEM_SA.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXFQ_LMEM_SA, regValue, 'ADD', 17, 6, 'TXFQ Start Address (LMEM, 64 byte aligned)');
    const f = reg.TXFQ_LMEM_SA.fields;
    const startAddrByte = f.ADD.value << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.TXFQ_LMEM_SA.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_LMEM_SA: ${reg.TXFQ_LMEM_SA.name_long} (0x${reg.TXFQ_LMEM_SA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long} = 0x${(startAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // TXFQ_LMEM_SA

  // === TXFQ_LMEM_EA: TXFQ End Address register =======================
  if ('TXFQ_LMEM_EA' in reg && reg.TXFQ_LMEM_EA.int32 !== undefined) {
    const regValue = reg.TXFQ_LMEM_EA.int32;

    // 0. Extend existing register structure
    reg.TXFQ_LMEM_EA.fields = {};
    reg.TXFQ_LMEM_EA.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXFQ_LMEM_EA, regValue, 'ADD', 17, 6, 'TXFQ End   Address (LMEM, 64 byte aligned)');
    const f = reg.TXFQ_LMEM_EA.fields;
    const endAddrByte = f.ADD.value << 6;

    // 2. Generate human-readable register report
    reg.TXFQ_LMEM_EA.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_LMEM_EA: ${reg.TXFQ_LMEM_EA.name_long} (0x${reg.TXFQ_LMEM_EA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long} = 0x${(endAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${endAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  }

  // === TXFQ_STS: TX FIFO Queue Status register =======================
  if ('TXFQ_STS' in reg && reg.TXFQ_STS.int32 !== undefined) {
    const regValue = reg.TXFQ_STS.int32;

    // 0. Extend existing register structure
    reg.TXFQ_STS.fields = {};
    reg.TXFQ_STS.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXFQ_STS, regValue, 'FIFO_FULL', 8, 8, 'TXFQ full flag');
    defineField(reg.TXFQ_STS, regValue, 'FILL_LEVEL', 7, 0, 'Elements in TXFQ');
    const f = reg.TXFQ_STS.fields;

    // 2. Generate human-readable register report
    reg.TXFQ_STS.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_STS: ${reg.TXFQ_STS.name_long} (0x${reg.TXFQ_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.FIFO_FULL.name_short.padEnd(10)}] ${f.FIFO_FULL.name_long.padEnd(16)} = ${f.FIFO_FULL.value}\n` +
           `[${f.FILL_LEVEL.name_short.padEnd(10)}] ${f.FILL_LEVEL.name_long.padEnd(16)} = ${f.FILL_LEVEL.value}`
    });
  }

  // === TXFQ_CFG: TX FIFO Configuration register ======================
  if ('TXFQ_CFG' in reg && reg.TXFQ_CFG.int32 !== undefined) {
    const regValue = reg.TXFQ_CFG.int32;

    // 0. Extend existing register structure
    reg.TXFQ_CFG.fields = {};
    reg.TXFQ_CFG.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXFQ_CFG, regValue, 'MAX_ELEM_SIZE', 5, 0, 'Max TX Element size');
    const f = reg.TXFQ_CFG.fields;
    const maxElemBytes = f.MAX_ELEM_SIZE.value << 6; // in bytes: * 64

    // calculate maximum CAN message payload sizes in FMM mode
    // CAN FD: 2 header words (8 bytes)
    let fmmFdMaxPayload = Math.max(0, maxElemBytes - 8);
        fmmFdMaxPayload = (fmmFdMaxPayload>64) ? 64 : fmmFdMaxPayload; // limit to 64 bytes max payload
    // CAN XL: 3 header words (12 bytes)
    let fmmXlMaxPayload = Math.max(0, maxElemBytes - 12);
        fmmXlMaxPayload = (fmmXlMaxPayload>2048) ? 2048 : fmmXlMaxPayload; // limit to 2048 bytes max payload
 
    // 2. Generate human-readable register report
    reg.TXFQ_CFG.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_CFG: ${reg.TXFQ_CFG.name_long} (0x${reg.TXFQ_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.MAX_ELEM_SIZE.name_short}] ${f.MAX_ELEM_SIZE.name_long} = ${f.MAX_ELEM_SIZE.value} x 64 byte (${maxElemBytes} bytes) (In FMM enough for: FD with ${fmmFdMaxPayload} bytes payload, or XL with ${fmmXlMaxPayload} bytes payload)`
    });

    // Check if CTM is enabled and max Elements size is > 2
    if (('MH_CFG' in reg) && (reg.MH_CFG.fields !== undefined)) {
      const ctmEnabled = reg.MH_CFG.fields.CTME.value === 1;
      if (ctmEnabled && (f.MAX_ELEM_SIZE.value > 2)) {
        reg.TXFQ_CFG.report.push({
          severityLevel: sevC.warn,
          msg: `TXFQ_CFG: In Cut-Through Mode (CTM) the TXFQ maximum element size should be set to 2 (128 bytes) to have space for header and 64 bytes of payload (larger values are also functional, but waste LMEM).`
        });
      }
    } 
  } // TXFQ_CFG

  // === TXFQ_WPTR: TXFQ Write Pointer register ========================
  if ('TXFQ_WPTR' in reg && reg.TXFQ_WPTR.int32 !== undefined) {
    const regValue = reg.TXFQ_WPTR.int32;

    // 0. Extend existing register structure
    reg.TXFQ_WPTR.fields = {};
    reg.TXFQ_WPTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXFQ_WPTR, regValue, 'WPTR_ADD', 17, 2, 'TXFQ Write Pointer (LMEM)');
    const f = reg.TXFQ_WPTR.fields;
    const wptrAddrByte = f.WPTR_ADD.value << 2;

    // 2. Generate human-readable register report
    reg.TXFQ_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_WPTR: ${reg.TXFQ_WPTR.name_long} (0x${reg.TXFQ_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.WPTR_ADD.name_short}] ${f.WPTR_ADD.name_long} = 0x${(wptrAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // TXFQ_WPTR

  // === TXFQ_RPTR: TXFQ Read Pointer register =========================
  if ('TXFQ_RPTR' in reg && reg.TXFQ_RPTR.int32 !== undefined) {
    const regValue = reg.TXFQ_RPTR.int32;

    // 0. Extend existing register structure
    reg.TXFQ_RPTR.fields = {};
    reg.TXFQ_RPTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXFQ_RPTR, regValue, 'RPTR_ADD', 17, 2, 'TXFQ Read Pointer (LMEM) ');
    const f = reg.TXFQ_RPTR.fields;
    const rptrAddrByte = f.RPTR_ADD.value << 2;

    // 2. Generate human-readable register report
    reg.TXFQ_RPTR.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_RPTR: ${reg.TXFQ_RPTR.name_long} (0x${reg.TXFQ_RPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.RPTR_ADD.name_short}] ${f.RPTR_ADD.name_long} = 0x${(rptrAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${rptrAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // TXFQ_RPTR
}

export function procRegsMhTXPQ(reg) {
  // === TXPQ_CFG: TX Priority Queue configuration register ===========
  if ('TXPQ_CFG' in reg && reg.TXPQ_CFG.int32 !== undefined) {
    const regValue = reg.TXPQ_CFG.int32;

    // 0. Extend existing register structure
    reg.TXPQ_CFG.fields = {};
    reg.TXPQ_CFG.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXPQ_CFG, regValue, 'SLOT_SIZE', 17, 8, 'Slot size');
    defineField(reg.TXPQ_CFG, regValue, 'TX_MSG_SEQE', 7, 7, 'TX Messages with same ID in sequence');
    defineField(reg.TXPQ_CFG, regValue, 'SLOT_NUM', 5, 0, 'Number of PQ slots');
    const f = reg.TXPQ_CFG.fields;

    const slotSizeWords = f.SLOT_SIZE.value;
    const slotSizeBytes = slotSizeWords << 2; // words -> bytes (*4)

    // calculate maximum CAN message payload sizes in FMM mode
    // CAN FD: 2 header words (8 bytes)
    let fmmFdMaxPayload = Math.max(0, slotSizeBytes - 8);
        fmmFdMaxPayload = (fmmFdMaxPayload>64) ? 64 : fmmFdMaxPayload; // limit to 64 bytes max payload
    // CAN XL: 3 header words (12 bytes)
    let fmmXlMaxPayload = Math.max(0, slotSizeBytes - 12);
        fmmXlMaxPayload = (fmmXlMaxPayload>2048) ? 2048 : fmmXlMaxPayload; // limit to 2048 bytes max payload

    // 2. Generate human-readable register report
    reg.TXPQ_CFG.report.push({
      severityLevel: sevC.info,
      msg: `TXPQ_CFG: ${reg.TXPQ_CFG.name_long} (0x${reg.TXPQ_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.SLOT_SIZE.name_short.padEnd(11)}] ${f.SLOT_SIZE.name_long.padEnd(36)} = ${slotSizeWords} words (${slotSizeBytes} bytes) (In FMM enough for: FD with ${fmmFdMaxPayload} bytes payload, or XL with ${fmmXlMaxPayload} bytes payload)\n` +
           `[${f.TX_MSG_SEQE.name_short.padEnd(11)}] ${f.TX_MSG_SEQE.name_long.padEnd(36)} = ${f.TX_MSG_SEQE.value}\n` +
           `[${f.SLOT_NUM.name_short.padEnd(11)}] ${f.SLOT_NUM.name_long.padEnd(36)} = ${f.SLOT_NUM.value} (0 disables TXPQ, >32 is capped to 32)`
    });

    // Check if CTM is enabled and max Elements size is > 2
    if (('MH_CFG' in reg) && (reg.MH_CFG.fields !== undefined)) {
      const ctmEnabled = reg.MH_CFG.fields.CTME.value === 1;
      if (ctmEnabled && (slotSizeBytes > 80)) { // 80 bytes = 3 words header + 1 word pointer + 64 bytes payload
        reg.TXFQ_CFG.report.push({
          severityLevel: sevC.warn,
          msg: `TXFQ_CFG: In Cut-Through Mode (CTM) the TXPQ slot size should be set to max 20 words (80 bytes). Larger values are also functional, but waste LMEM.\n` +
               `          (80 byte = 3 words XL header + 1 word pointer + 64 bytes payload)`
        });
      }
    } 
  } // TXPQ_CFG

  // === TXPQ_STS0: TX Priority Queue Status 0 register ===============
  if ('TXPQ_STS0' in reg && reg.TXPQ_STS0.int32 !== undefined) {
    const regValue = reg.TXPQ_STS0.int32;

    // 0. Extend existing register structure
    reg.TXPQ_STS0.fields = {};
    reg.TXPQ_STS0.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXPQ_STS0, regValue, 'SLOT_OCC', 31, 0, 'Slot occupancy mask');
    const f = reg.TXPQ_STS0.fields;
    const occ = f.SLOT_OCC.value >>> 0;
    // Count busy slots
    let busyCount = 0; {
      let v = occ; while (v) { v &= (v - 1); busyCount++; } // uses Brian Kernighan’s algorithm
    }

    // 2. Generate human-readable register report
    reg.TXPQ_STS0.report.push({
      severityLevel: sevC.info,
      msg: `TXPQ_STS0: ${reg.TXPQ_STS0.name_long} (0x${reg.TXPQ_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.SLOT_OCC.name_short}] ${f.SLOT_OCC.name_long} = 0x${occ.toString(16).toUpperCase().padStart(8,'0')} (busy slots: ${busyCount})`
    });
  } // TXPQ_STS0

  // === TXPQ_STS1: TX Priority Queue Status 1 register ===============
  if ('TXPQ_STS1' in reg && reg.TXPQ_STS1.int32 !== undefined) {
    const regValue = reg.TXPQ_STS1.int32;

    // 0. Extend existing register structure
    reg.TXPQ_STS1.fields = {};
    reg.TXPQ_STS1.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXPQ_STS1, regValue, 'TXPQ_FULL', 8, 8, 'TXPQ full flag');
    defineField(reg.TXPQ_STS1, regValue, 'FILL_LEVEL', 5, 0, 'Pending PQ elements');
    const f = reg.TXPQ_STS1.fields;

    // 2. Generate human-readable register report
    reg.TXPQ_STS1.report.push({
      severityLevel: sevC.info,
      msg: `TXPQ_STS1: ${reg.TXPQ_STS1.name_long} (0x${reg.TXPQ_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.TXPQ_FULL.name_short.padEnd(10)}] ${f.TXPQ_FULL.name_long.padEnd(20)} = ${f.TXPQ_FULL.value}\n` +
           `[${f.FILL_LEVEL.name_short.padEnd(10)}] ${f.FILL_LEVEL.name_long.padEnd(20)} = ${f.FILL_LEVEL.value}`
    });
  } // TXPQ_STS1

  // === TXPQ_LMEM: TX Priority Queue LMEM Address register ===========
  if ('TXPQ_LMEM' in reg && reg.TXPQ_LMEM.int32 !== undefined) {
    const regValue = reg.TXPQ_LMEM.int32;

    // 0. Extend existing register structure
    reg.TXPQ_LMEM.fields = {};
    reg.TXPQ_LMEM.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXPQ_LMEM, regValue, 'SA', 17, 6, 'Start address (LMEM, 64 byte aligned)');
    const f = reg.TXPQ_LMEM.fields;
    const startAddrByte = f.SA.value << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.TXPQ_LMEM.report.push({
      severityLevel: sevC.info,
      msg: `TXPQ_LMEM: ${reg.TXPQ_LMEM.name_long}  (0x${reg.TXPQ_LMEM.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.SA.name_short}] ${f.SA.name_long} = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // TXPQ_LMEM

  // === TXPQ_WPTR: TX Priority Queue Write Pointer register ==========
  if ('TXPQ_WPTR' in reg && reg.TXPQ_WPTR.int32 !== undefined) {
    const regValue = reg.TXPQ_WPTR.int32;

    // 0. Extend existing register structure
    reg.TXPQ_WPTR.fields = {};
    reg.TXPQ_WPTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TXPQ_WPTR, regValue, 'WPTR_ADD', 17, 2, 'TXPQ Write Pointer (LMEM)');
    const f = reg.TXPQ_WPTR.fields;
    const wptrAddrByte = f.WPTR_ADD.value << 2; // word aligned

    // 2. Generate human-readable register report
    reg.TXPQ_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `TXPQ_WPTR: ${reg.TXPQ_WPTR.name_long} (0x${reg.TXPQ_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.WPTR_ADD.name_short}] ${f.WPTR_ADD.name_long.padEnd(31)} = 0x${wptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // TXPQ_WPTR
}

export function procRegsMhTEFQ(reg) {
  // === TEFQ_LMEM: TX Event FIFO LMEM Start Address register =========
  if ('TEFQ_LMEM' in reg && reg.TEFQ_LMEM.int32 !== undefined) {
    const regValue = reg.TEFQ_LMEM.int32;

    // 0. Extend existing register structure
    reg.TEFQ_LMEM.fields = {};
    reg.TEFQ_LMEM.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TEFQ_LMEM, regValue, 'SA', 17, 6, 'Start address (LMEM, 64 byte aligned)');
    const f = reg.TEFQ_LMEM.fields;
    const startAddrByte = f.SA.value << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.TEFQ_LMEM.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_LMEM: ${reg.TEFQ_LMEM.name_long} (0x${reg.TEFQ_LMEM.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.SA.name_short}] ${f.SA.name_long} = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // TEFQ_LMEM

  // === TEFQ_CFG: TX Event FIFO Configuration register ===============
  if ('TEFQ_CFG' in reg && reg.TEFQ_CFG.int32 !== undefined) {
    const regValue = reg.TEFQ_CFG.int32;

    // 0. Extend existing register structure
    reg.TEFQ_CFG.fields = {};
    reg.TEFQ_CFG.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TEFQ_CFG, regValue, 'TEQE_LARGE', 8, 8, 'TEFQ large element size enable');
    defineField(reg.TEFQ_CFG, regValue, 'TEQE_NUM', 5, 0, 'Number of TEFQ elements');
    const f = reg.TEFQ_CFG.fields;

    const teqeSizeWords = 4 + (f.TEQE_LARGE.value ? 1 : 0);
    const teqeSizeBytes = teqeSizeWords << 2; // words -> bytes (*4)

    // 2. Generate human-readable register report
    reg.TEFQ_CFG.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_CFG: ${reg.TEFQ_CFG.name_long} (0x${reg.TEFQ_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.TEQE_LARGE.name_short.padEnd(10)}] ${f.TEQE_LARGE.name_long.padEnd(30)} = ${f.TEQE_LARGE.value} (resulting TEQE size: ${teqeSizeWords} words, ${teqeSizeBytes} bytes)\n` +
           `[${f.TEQE_NUM.name_short.padEnd(10)}] ${f.TEQE_NUM.name_long.padEnd(30)} = ${f.TEQE_NUM.value} (0 disables TEFQ, max. 63)`
    });
  } // TEFQ_CFG

  // === TEFQ_STS: TX Event FIFO Status register ======================
  if ('TEFQ_STS' in reg && reg.TEFQ_STS.int32 !== undefined) {
    const regValue = reg.TEFQ_STS.int32;

    // 0. Extend existing register structure
    reg.TEFQ_STS.fields = {};
    reg.TEFQ_STS.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TEFQ_STS, regValue, 'TEFQ_FULL', 8, 8, 'TEFQ full flag');
    defineField(reg.TEFQ_STS, regValue, 'FILL_LEVEL', 5, 0, 'TEFQ fill level');
    const f = reg.TEFQ_STS.fields;

    // 2. Generate human-readable register report
    reg.TEFQ_STS.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_STS: ${reg.TEFQ_STS.name_long} (0x${reg.TEFQ_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.TEFQ_FULL.name_short.padEnd(10)}] ${f.TEFQ_FULL.name_long.padEnd(15)} = ${f.TEFQ_FULL.value}\n` +
           `[${f.FILL_LEVEL.name_short.padEnd(10)}] ${f.FILL_LEVEL.name_long.padEnd(15)} = ${f.FILL_LEVEL.value} TEQEs (0: empty)`
    });
  } // TEFQ_STS

  // === TEFQ_WPTR: TX Event FIFO Write Pointer register ==============
  if ('TEFQ_WPTR' in reg && reg.TEFQ_WPTR.int32 !== undefined) {
    const regValue = reg.TEFQ_WPTR.int32;

    // 0. Extend existing register structure
    reg.TEFQ_WPTR.fields = {};
    reg.TEFQ_WPTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TEFQ_WPTR, regValue, 'WPTR_ADD', 17, 2, 'TEFQ Write Pointer (LMEM)');
    const f = reg.TEFQ_WPTR.fields;
    const wptrAddrByte = f.WPTR_ADD.value << 2; // word aligned

    // 2. Generate human-readable register report
    reg.TEFQ_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_WPTR: ${reg.TEFQ_WPTR.name_long} (0x${reg.TEFQ_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.WPTR_ADD.name_short}] ${f.WPTR_ADD.name_long} = 0x${wptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // TEFQ_WPTR

  // === TEFQ_RPTR: TX Event FIFO Read Pointer register ===============
  if ('TEFQ_RPTR' in reg && reg.TEFQ_RPTR.int32 !== undefined) {
    const regValue = reg.TEFQ_RPTR.int32;

    // 0. Extend existing register structure
    reg.TEFQ_RPTR.fields = {};
    reg.TEFQ_RPTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TEFQ_RPTR, regValue, 'RPTR_ADD', 17, 2, 'TEFQ Read Pointer (LMEM)');
    const f = reg.TEFQ_RPTR.fields;
    const rptrAddrByte = f.RPTR_ADD.value << 2; // word aligned

    // 2. Generate human-readable register report
    reg.TEFQ_RPTR.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_RPTR: ${reg.TEFQ_RPTR.name_long} (0x${reg.TEFQ_RPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.RPTR_ADD.name_short}] ${f.RPTR_ADD.name_long.padEnd(25)} = 0x${rptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${rptrAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // TEFQ_RPTR
}

export function procRegsMhCTM(reg) {
 // === CTB_LMEM: Cut-Through Buffer start Address in LMEM Register ===
  if ('CTB_LMEM' in reg && reg.CTB_LMEM.int32 !== undefined) {
    const regValue = reg.CTB_LMEM.int32;

    // 0. Extend existing register structure
    reg.CTB_LMEM.fields = {};
    reg.CTB_LMEM.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.CTB_LMEM, regValue, 'SA', 17, 6, 'Start address (LMEM, 64 byte aligned)');
    const f = reg.CTB_LMEM.fields;
    const startAddrByte = f.SA.value << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.CTB_LMEM.report.push({
      severityLevel: sevC.info,
      msg: `CTB_LMEM: ${reg.CTB_LMEM.name_long} (0x${reg.CTB_LMEM.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.SA.name_short}] ${f.SA.name_long} = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(5,' ')}) byte addr (only applicable in CTM)`
    });
  } // CTB_LMEM

  // === CTM_DESC_SRC: Cut-Through Mode Source Address Register ======
  if ('CTM_DESC_SRC' in reg && reg.CTM_DESC_SRC.int32 !== undefined) {
    const regValue = reg.CTM_DESC_SRC.int32;

    // 0. Extend existing register structure
    reg.CTM_DESC_SRC.fields = {};
    reg.CTM_DESC_SRC.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.CTM_DESC_SRC, regValue, 'ADD', 31, 0, 'CTM source address for 64 byte block copy');
    const f = reg.CTM_DESC_SRC.fields;
    f.ADD.value = f.ADD.value >>> 0; // convert to unsigned, to prevent negative numbers in printout

    // 2. Generate human-readable register report
    reg.CTM_DESC_SRC.report.push({
      severityLevel: sevC.info,
      msg: `CTM_DESC_SRC: ${reg.CTM_DESC_SRC.name_long} (0x${reg.CTM_DESC_SRC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long.padEnd(46)} = 0x${f.ADD.value.toString(16).toUpperCase().padStart(8,'0')} (dec: ${f.ADD.value >>> 0}) (only applicable in CTM)`
    });
  } // CTM_DESC_SRC

  // === CTM_DESC_DEST: Cut-Through Mode Destination Address Register ==
  if ('CTM_DESC_DEST' in reg && reg.CTM_DESC_DEST.int32 !== undefined) {
    const regValue = reg.CTM_DESC_DEST.int32;

    // 0. Extend existing register structure
    reg.CTM_DESC_DEST.fields = {};
    reg.CTM_DESC_DEST.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.CTM_DESC_DEST, regValue, 'ADD', 31, 0, 'CTM destination address for 64 byte block copy');
    const f = reg.CTM_DESC_DEST.fields;
    f.ADD.value = f.ADD.value >>> 0; // convert to unsigned, to prevent negative numbers in printout

    // 2. Generate human-readable register report
    reg.CTM_DESC_DEST.report.push({
      severityLevel: sevC.info,
      msg: `CTM_DESC_DEST: ${reg.CTM_DESC_DEST.name_long} (0x${reg.CTM_DESC_DEST.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long.padEnd(46)} = 0x${f.ADD.value.toString(16).toUpperCase().padStart(8,'0')} (dec: ${f.ADD.value >>> 0}) (only applicable in CTM)`
    });
  } // CTM_DESC_DEST

  // === CTM_EVENT: Cut-Through Mode Event Register ==================
  if ('CTM_EVENT' in reg && reg.CTM_EVENT.int32 !== undefined) {
    const regValue = reg.CTM_EVENT.int32;

    // 0. Extend existing register structure
    reg.CTM_EVENT.fields = {};
    reg.CTM_EVENT.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.CTM_EVENT, regValue, 'RX_BLOCK_COPY_REQ', 1, 1, 'RX block copy request');
    defineField(reg.CTM_EVENT, regValue, 'TX_BLOCK_COPY_REQ', 0, 0, 'TX block copy request');
    const f = reg.CTM_EVENT.fields;

    // 2. Generate human-readable register report
    reg.CTM_EVENT.report.push({
      severityLevel: sevC.info,
      msg: `CTM_EVENT: ${reg.CTM_EVENT.name_long} (0x${reg.CTM_EVENT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.RX_BLOCK_COPY_REQ.name_short}] ${f.RX_BLOCK_COPY_REQ.name_long} = ${f.RX_BLOCK_COPY_REQ.value} (only applicable in CTM)\n` +
           `[${f.TX_BLOCK_COPY_REQ.name_short}] ${f.TX_BLOCK_COPY_REQ.name_long} = ${f.TX_BLOCK_COPY_REQ.value} (only applicable in CTM)`
    });
  } // CTM_EVENT
}

export function procRegsMhRXFQ(reg) {
  // === RXFQ0_SA: RX FIFO Queue 0 Start Address register ============
  if ('RXFQ0_SA' in reg && reg.RXFQ0_SA.int32 !== undefined) {
    const regValue = reg.RXFQ0_SA.int32;

    // 0. Extend existing register structure
    reg.RXFQ0_SA.fields = {};
    reg.RXFQ0_SA.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ0_SA, regValue, 'ADD', 31, 6, 'RXFQ0 Start Address (FMM: LMEM, CTM: SMEM, 64 byte aligned)');
    const f = reg.RXFQ0_SA.fields;
    const startAddrByte = f.ADD.value << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RXFQ0_SA.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_SA: ${reg.RXFQ0_SA.name_long} (0x${reg.RXFQ0_SA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long} = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // RXFQ0_SA

  // === RXFQ0_EA: RX FIFO Queue 0 End Address register ==============
  if ('RXFQ0_EA' in reg && reg.RXFQ0_EA.int32 !== undefined) {
    const regValue = reg.RXFQ0_EA.int32;

    // 0. Extend existing register structure
    reg.RXFQ0_EA.fields = {};
    reg.RXFQ0_EA.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ0_EA, regValue, 'ADD', 31, 6, 'RXFQ0 End   Address (FMM: LMEM, CTM: SMEM, 64 byte aligned)');
    const f = reg.RXFQ0_EA.fields;
    const endAddrByte = f.ADD.value << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RXFQ0_EA.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_EA: ${reg.RXFQ0_EA.name_long} (0x${reg.RXFQ0_EA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long} = 0x${endAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${endAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // RXFQ0_EA

  // === RXFQ0_RPTR: RX FIFO Queue 0 Read Pointer register ===========
  if ('RXFQ0_RPTR' in reg && reg.RXFQ0_RPTR.int32 !== undefined) {
    const regValue = reg.RXFQ0_RPTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ0_RPTR.fields = {};
    reg.RXFQ0_RPTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ0_RPTR, regValue, 'ADD', 31, 2, 'RXFQ0 Read Pointer (FMM: LMEM, CTM: SMEM)');
    const f = reg.RXFQ0_RPTR.fields;
    const rptrAddrByte = f.ADD.value << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ0_RPTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_RPTR: ${reg.RXFQ0_RPTR.name_long} (0x${reg.RXFQ0_RPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long} = 0x${rptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${rptrAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // RXFQ0_RPTR

  // === RXFQ0_WPTR: RX FIFO Queue 0 Write Pointer register ==========
  if ('RXFQ0_WPTR' in reg && reg.RXFQ0_WPTR.int32 !== undefined) {
    const regValue = reg.RXFQ0_WPTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ0_WPTR.fields = {};
    reg.RXFQ0_WPTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ0_WPTR, regValue, 'ADD', 31, 2, 'RXFQ0 Write Pointer (FMM: LMEM, CTM: SMEM)');
    const f = reg.RXFQ0_WPTR.fields;
    const wptrAddrByte = f.ADD.value << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ0_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_WPTR: ${reg.RXFQ0_WPTR.name_long} (0x${reg.RXFQ0_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long} = 0x${wptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // RXFQ0_WPTR

  // === RXFQ0_WRAP_PTR: RX FIFO Queue 0 Wrap Pointer in SMEM Register ===
  if ('RXFQ0_WRAP_PTR' in reg && reg.RXFQ0_WRAP_PTR.int32 !== undefined) {
    const regValue = reg.RXFQ0_WRAP_PTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ0_WRAP_PTR.fields = {};
    reg.RXFQ0_WRAP_PTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ0_WRAP_PTR, regValue, 'SMEM_ADD', 31, 2, 'RXFQ0 Wrap Pointer (SMEM)');
    const f = reg.RXFQ0_WRAP_PTR.fields;
    const smemAddrByte = f.SMEM_ADD.value << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ0_WRAP_PTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_WRAP_PTR: ${reg.RXFQ0_WRAP_PTR.name_long} (0x${reg.RXFQ0_WRAP_PTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.SMEM_ADD.name_short}] ${f.SMEM_ADD.name_long} = 0x${smemAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${smemAddrByte.toString(10).padStart(5,' ')}) byte addr (only applicable in CTM)`
    });
  } // RXFQ0_WRAP_PTR

  // === RXFQ1_SA: RX FIFO Queue 1 Start Address register ============
  if ('RXFQ1_SA' in reg && reg.RXFQ1_SA.int32 !== undefined) {
    const regValue = reg.RXFQ1_SA.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_SA.fields = {};
    reg.RXFQ1_SA.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ1_SA, regValue, 'ADD', 31, 6, 'RXFQ1 Start Address (FMM: LMEM, CTM: SMEM, 64 byte aligned)');
    const f = reg.RXFQ1_SA.fields;
    const startAddrByte = f.ADD.value << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RXFQ1_SA.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_SA: ${reg.RXFQ1_SA.name_long} (0x${reg.RXFQ1_SA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long} = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // RXFQ1_SA

  // === RXFQ1_EA: RX FIFO Queue 1 End Address register ==============
  if ('RXFQ1_EA' in reg && reg.RXFQ1_EA.int32 !== undefined) {
    const regValue = reg.RXFQ1_EA.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_EA.fields = {};
    reg.RXFQ1_EA.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ1_EA, regValue, 'ADD', 31, 6, 'RXFQ1 End   Address (FMM: LMEM, CTM: SMEM, 64 byte aligned)');
    const f = reg.RXFQ1_EA.fields;
    const endAddrByte = f.ADD.value << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RXFQ1_EA.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_EA: ${reg.RXFQ1_EA.name_long} (0x${reg.RXFQ1_EA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long} = 0x${endAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${endAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // RXFQ1_EA

  // === RXFQ1_RPTR: RX FIFO Queue 1 Read Pointer register ===========
  if ('RXFQ1_RPTR' in reg && reg.RXFQ1_RPTR.int32 !== undefined) {
    const regValue = reg.RXFQ1_RPTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_RPTR.fields = {};
    reg.RXFQ1_RPTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ1_RPTR, regValue, 'ADD', 31, 2, 'RXFQ1 Read Pointer (FMM: LMEM, CTM: SMEM)');
    const f = reg.RXFQ1_RPTR.fields;
    const rptrAddrByte = f.ADD.value << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ1_RPTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_RPTR: ${reg.RXFQ1_RPTR.name_long} (0x${reg.RXFQ1_RPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long.padEnd(42)} = 0x${rptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${rptrAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // RXFQ1_RPTR

  // === RXFQ1_WPTR: RX FIFO Queue 1 Write Pointer register ==========
  if ('RXFQ1_WPTR' in reg && reg.RXFQ1_WPTR.int32 !== undefined) {
    const regValue = reg.RXFQ1_WPTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_WPTR.fields = {};
    reg.RXFQ1_WPTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ1_WPTR, regValue, 'ADD', 31, 2, 'RXFQ1 Write Pointer (FMM: LMEM, CTM: SMEM)');
    const f = reg.RXFQ1_WPTR.fields;
    const wptrAddrByte = f.ADD.value << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ1_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_WPTR: ${reg.RXFQ1_WPTR.name_long} (0x${reg.RXFQ1_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.ADD.name_short}] ${f.ADD.name_long} = 0x${wptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(5,' ')}) byte addr`
    });
  } // RXFQ1_WPTR

  // === RXFQ1_WRAP_PTR: RX FIFO Queue 1 Wrap Pointer in SMEM Register ===
  if ('RXFQ1_WRAP_PTR' in reg && reg.RXFQ1_WRAP_PTR.int32 !== undefined) {
    const regValue = reg.RXFQ1_WRAP_PTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_WRAP_PTR.fields = {};
    reg.RXFQ1_WRAP_PTR.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ1_WRAP_PTR, regValue, 'SMEM_ADD', 31, 2, 'RXFQ1 Wrap Pointer (SMEM)');
    const f = reg.RXFQ1_WRAP_PTR.fields;
    const smemAddrByte = f.SMEM_ADD.value << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ1_WRAP_PTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_WRAP_PTR: ${reg.RXFQ1_WRAP_PTR.name_long} (0x${reg.RXFQ1_WRAP_PTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.SMEM_ADD.name_short}] ${f.SMEM_ADD.name_long} = 0x${smemAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${smemAddrByte.toString(10).padStart(5,' ')}) byte addr (only applicable in CTM)`
    });
  } // RXFQ1_WRAP_PTR

  // === RXFQ_STS: RX FIFO Queue Status register =====================
  if ('RXFQ_STS' in reg && reg.RXFQ_STS.int32 !== undefined) {
    const regValue = reg.RXFQ_STS.int32;

    // 0. Extend existing register structure
    reg.RXFQ_STS.fields = {};
    reg.RXFQ_STS.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.RXFQ_STS, regValue, 'RXFQ1_FILL_LEVEL', 15, 8, 'Elements in RXFQ1');
    defineField(reg.RXFQ_STS, regValue, 'RXFQ0_FILL_LEVEL', 7, 0, 'Elements in RXFQ0');
    const f = reg.RXFQ_STS.fields;

    // 2. Generate human-readable register report
    reg.RXFQ_STS.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ_STS: ${reg.RXFQ_STS.name_long} (0x${reg.RXFQ_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.RXFQ1_FILL_LEVEL.name_short}] ${f.RXFQ1_FILL_LEVEL.name_long} = ${f.RXFQ1_FILL_LEVEL.value} (range: 0 to 255) (FMM: real fill level, CTM: only up counter with warp-around)\n` +
           `[${f.RXFQ0_FILL_LEVEL.name_short}] ${f.RXFQ0_FILL_LEVEL.name_long} = ${f.RXFQ0_FILL_LEVEL.value} (range: 0 to 255) (FMM: real fill level, CTM: only up counter with wrap-around)`
    });
  } // RXFQ_STS
}

export function procRegsMhDebug(reg) {
  // === DEBUG_TEST_CTRL: Debug Control register =====================
  if ('DEBUG_TEST_CTRL' in reg && reg.DEBUG_TEST_CTRL.int32 !== undefined) {
    const regValue = reg.DEBUG_TEST_CTRL.int32;

    // 0. Extend existing register structure
    reg.DEBUG_TEST_CTRL.fields = {};
    reg.DEBUG_TEST_CTRL.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.DEBUG_TEST_CTRL, regValue, 'HDP_SEL', 10, 8, 'HDP[15:0] signal set select');
    defineField(reg.DEBUG_TEST_CTRL, regValue, 'HDP_EN', 0, 0, 'Hardware debug port enable');
    const f = reg.DEBUG_TEST_CTRL.fields;

    // 2. Generate human-readable register report
    reg.DEBUG_TEST_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `DEBUG_TEST_CTRL: ${reg.DEBUG_TEST_CTRL.name_long} (0x${reg.DEBUG_TEST_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.HDP_SEL.name_short.padEnd(7)}] ${f.HDP_SEL.name_long.padEnd(27)} = ${f.HDP_SEL.value}\n` +
           `[${f.HDP_EN.name_short.padEnd(7)}] ${f.HDP_EN.name_long.padEnd(27)} = ${f.HDP_EN.value}`
    });
  } // DEBUG_TEST_CTRL

  // === TX_SCAN_WC: TX-SCAN winning candidates register =============
  if ('TX_SCAN_WC' in reg && reg.TX_SCAN_WC.int32 !== undefined) {
    const regValue = reg.TX_SCAN_WC.int32;

    // 0. Extend existing register structure
    reg.TX_SCAN_WC.fields = {};
    reg.TX_SCAN_WC.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TX_SCAN_WC, regValue, 'FQ_PQ_ADD', 31, 16, 'LMEM address pointer (byte)');
    defineField(reg.TX_SCAN_WC, regValue, 'PQSN', 6, 2, 'PQ slot number (if from PQ)');
    defineField(reg.TX_SCAN_WC, regValue, 'FQ_PQ', 1, 1, 'Candidate source (0:TXFQ, 1:TXPQ)');
    defineField(reg.TX_SCAN_WC, regValue, 'VALID', 0, 0, 'Register contents valid');
    const f = reg.TX_SCAN_WC.fields;

    const candType = f.FQ_PQ.value ? 'TXPQ' : 'TXFQ';
    const addrByte = f.FQ_PQ_ADD.value << 2; // LMEM pointer, word -> byte

    // 2. Generate human-readable register report
    reg.TX_SCAN_WC.report.push({
      severityLevel: sevC.info,
      msg: `TX_SCAN_WC: ${reg.TX_SCAN_WC.name_long} (0x${reg.TX_SCAN_WC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.FQ_PQ_ADD.name_short.padEnd(9)}] ${f.FQ_PQ_ADD.name_long.padEnd(33)} = 0x${addrByte.toString(16).toUpperCase().padStart(5,'0')} (dec: ${addrByte.toString(10).padStart(5,' ')})\n` +
           `[${f.PQSN.name_short.padEnd(9)}] ${f.PQSN.name_long.padEnd(33)} = ${f.PQSN.value}\n` +
           `[${f.FQ_PQ.name_short.padEnd(9)}] ${f.FQ_PQ.name_long.padEnd(33)} = ${f.FQ_PQ.value} (${candType})\n` +
           `[${f.VALID.name_short.padEnd(9)}] ${f.VALID.name_long.padEnd(33)} = ${f.VALID.value} (0: invalid, 1: valid)` 
    });
  } // TX_SCAN_WC

  // === TX_SCAN_PC: TX-SCAN prepared candidates register ============
  if ('TX_SCAN_PC' in reg && reg.TX_SCAN_PC.int32 !== undefined) {
    const regValue = reg.TX_SCAN_PC.int32;

    // 0. Extend existing register structure
    reg.TX_SCAN_PC.fields = {};
    reg.TX_SCAN_PC.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.TX_SCAN_PC, regValue, 'FQ_PQ_ADD', 31, 16, 'LMEM address pointer (byte)');
    defineField(reg.TX_SCAN_PC, regValue, 'PQSN', 6, 2, 'PQ slot number (if from PQ)');
    defineField(reg.TX_SCAN_PC, regValue, 'FQ_PQ', 1, 1, 'Candidate source (0:TXFQ, 1:TXPQ)');
    defineField(reg.TX_SCAN_PC, regValue, 'VALID', 0, 0, 'Register contents valid');
    const f = reg.TX_SCAN_PC.fields;

    const candType = f.FQ_PQ.value ? 'TXPQ' : 'TXFQ';
    const addrByte = f.FQ_PQ_ADD.value << 2; // LMEM pointer, word -> byte

    // 2. Generate human-readable register report
    reg.TX_SCAN_PC.report.push({
      severityLevel: sevC.info,
      msg: `TX_SCAN_PC: ${reg.TX_SCAN_PC.name_long} (0x${reg.TX_SCAN_PC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.FQ_PQ_ADD.name_short.padEnd(9)}] ${f.FQ_PQ_ADD.name_long.padEnd(33)} = 0x${addrByte.toString(16).toUpperCase().padStart(5,'0')} (dec: ${addrByte.toString(10).padStart(5,' ')})\n` +
           `[${f.PQSN.name_short.padEnd(9)}] ${f.PQSN.name_long.padEnd(33)} = ${f.PQSN.value}\n` +
           `[${f.FQ_PQ.name_short.padEnd(9)}] ${f.FQ_PQ.name_long.padEnd(33)} = ${f.FQ_PQ.value} (${candType})\n` +
           `[${f.VALID.name_short.padEnd(9)}] ${f.VALID.name_long.padEnd(33)} = ${f.VALID.value} (0: invalid, 1: valid)`
    });
  } // TX_SCAN_PC

  // === VBM_STATUS: VBM Status register ====================================
  if ('VBM_STATUS' in reg && reg.VBM_STATUS.int32 !== undefined) {
    const regValue = reg.VBM_STATUS.int32;

    // 0. Extend existing register structure
    reg.VBM_STATUS.fields = {};
    reg.VBM_STATUS.report = [];

    // 1. Decode all individual bits of register
    defineField(reg.VBM_STATUS, regValue, 'TXFQ_ENQ', 6, 6, 'TXFQ enqueuing in progress');
    defineField(reg.VBM_STATUS, regValue, 'TXPQ_ENQ', 5, 5, 'TXPQ enqueuing in progress');
    defineField(reg.VBM_STATUS, regValue, 'RXFQ0_DEQ', 4, 4, 'RXFQ0 dequeuing in progress');
    defineField(reg.VBM_STATUS, regValue, 'RXFQ1_DEQ', 3, 3, 'RXFQ1 dequeuing in progress');
    defineField(reg.VBM_STATUS, regValue, 'TEFQ_DEQ', 2, 2, 'TEFQ dequeuing in progress');
    defineField(reg.VBM_STATUS, regValue, 'CTB_ENQ', 1, 1, 'CTB enqueuing in progress');
    defineField(reg.VBM_STATUS, regValue, 'CTB_DEQ', 0, 0, 'CTB dequeuing in progress');
    const f = reg.VBM_STATUS.fields;

    // 2. Generate human-readable register report
    reg.VBM_STATUS.report.push({
      severityLevel: sevC.info,
      msg: `VBM_STATUS: ${reg.VBM_STATUS.name_long} (0x${reg.VBM_STATUS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[${f.TXFQ_ENQ.name_short.padEnd(9)}] ${f.TXFQ_ENQ.name_long.padEnd(27)} = ${f.TXFQ_ENQ.value}\n` +
           `[${f.TXPQ_ENQ.name_short.padEnd(9)}] ${f.TXPQ_ENQ.name_long.padEnd(27)} = ${f.TXPQ_ENQ.value}\n` +
           `[${f.RXFQ0_DEQ.name_short.padEnd(9)}] ${f.RXFQ0_DEQ.name_long.padEnd(27)} = ${f.RXFQ0_DEQ.value}\n` +
           `[${f.RXFQ1_DEQ.name_short.padEnd(9)}] ${f.RXFQ1_DEQ.name_long.padEnd(27)} = ${f.RXFQ1_DEQ.value}\n` +
           `[${f.TEFQ_DEQ.name_short.padEnd(9)}] ${f.TEFQ_DEQ.name_long.padEnd(27)} = ${f.TEFQ_DEQ.value}\n` +
           `[${f.CTB_ENQ.name_short.padEnd(9)}] ${f.CTB_ENQ.name_long.padEnd(27)} = ${f.CTB_ENQ.value} (only applicable in CTM)\n` +
           `[${f.CTB_DEQ.name_short.padEnd(9)}] ${f.CTB_DEQ.name_long.padEnd(27)} = ${f.CTB_DEQ.value} (only applicable in CTM)`
    });
  }
}

// ===================================================================================
// Task 1: Queues Summary: Build a formatted overview of TX/RX/Event queues
// Task 2: LMEM and SMEM memory map including overlaps detection
export function buildQueuesSummaryAndMemoryMap(reg) {
  // assumes that all registers are deccoded before this summary is built

  const hex8 = (v) => `0x${((v >>> 0) & 0xFFFFFFFF).toString(16).toUpperCase().padStart(8,'0')}`;
  const hex5 = (v) => `0x${(((v >>> 0) & 0xFFFFF)).toString(16).toUpperCase().padStart(5,'0')}`;
  const dash = '-';
  const fmt = (v) => (v === undefined || v === null ? dash : v);

  const colW = { q: 6, sa: 12, ea: 12, es: 15, num: 10, tot: 12, fill: 12, rptr: 12, wptr: 12, wrap: 12, en: 3 };
  const header = [
    'Queues Summary',
    'Queue'.padEnd(colW.q) +
    'START_ADD'.padEnd(colW.sa) +
    'END_ADD'.padEnd(colW.ea) +
    'ELEM-SIZE'.padEnd(colW.es) +
    'ELEMENTS'.padEnd(colW.num) +
    'TOTAL-SIZE'.padEnd(colW.tot) +
    'FILL-LEVEL'.padEnd(colW.fill) +
    'RPTR'.padEnd(colW.rptr) +
    'WPTR'.padEnd(colW.wptr) +
    'WRAP_PTR'.padEnd(colW.wrap) +
    'Ena'.padEnd(colW.en),
    ''.padEnd(118,'-')
  ];

  const qrows = [];

  // Helpers to extract values from reg
  const rb = (name) => (name in reg && reg[name].int32 !== undefined) ? reg[name].int32 >>> 0 : undefined;
  const bits = (val, msb, lsb) => (val === undefined ? undefined : getBits(val, msb, lsb));

  // MH_CFG enables
  const mhCfg = rb('MH_CFG');
  const enTXFQ = bits(mhCfg, 0, 0);
  const enTXPQ = bits(mhCfg, 1, 1);
  const enTEFQ = bits(mhCfg, 2, 2);
  const enRXFQ0 = bits(mhCfg, 3, 3);
  const enRXFQ1 = bits(mhCfg, 4, 4);
  const ctme = bits(mhCfg, 8, 8) !== undefined ? bits(mhCfg, 8, 8) : 0; // 0=FMM, 1=CTM, if undefined assume FMM

  // ===========================================================================
  // Queue Summary
  // ===========================================================================

  // TXFQ
  const txfq_sa = bits(rb('TXFQ_LMEM_SA'), 17, 6);
  const txfq_ea = bits(rb('TXFQ_LMEM_EA'), 17, 6);
  const txfq_sa_b = txfq_sa !== undefined ? (txfq_sa << 6) : undefined;
  const txfq_ea_b = txfq_ea !== undefined ? (txfq_ea << 6) : undefined;
  const txfq_cfg = rb('TXFQ_CFG');
  const txfq_maxWords64 = bits(txfq_cfg, 5, 0);
  const txfq_elemSizeB = txfq_maxWords64 !== undefined ? (txfq_maxWords64 << 6) : undefined; // bytes
  const txfq_elemSizeStr = txfq_elemSizeB !== undefined ? `${txfq_elemSizeB} byte max` : dash;
  const txfq_totalB = (txfq_sa_b !== undefined && txfq_ea_b !== undefined && txfq_ea_b >= txfq_sa_b) ? (txfq_ea_b - txfq_sa_b + 4) : undefined;
  const txfq_fill = bits(rb('TXFQ_STS'), 7, 0);
  const txfq_rptr = bits(rb('TXFQ_RPTR'), 17, 2);
  const txfq_wptr = bits(rb('TXFQ_WPTR'), 17, 2);
  const txfq_rptr_b = txfq_rptr !== undefined ? (txfq_rptr << 2) : undefined;
  const txfq_wptr_b = txfq_wptr !== undefined ? (txfq_wptr << 2) : undefined;

  qrows.push(
    'TXFQ'.padEnd(colW.q) +
    fmt(hex8(txfq_sa_b ?? 0)).padEnd(colW.sa) +
    fmt(hex8(txfq_ea_b ?? 0)).padEnd(colW.ea) +
    fmt(txfq_elemSizeStr).padEnd(colW.es) +
    fmt(dash).padEnd(colW.num) +
    fmt(txfq_totalB !== undefined ? `${txfq_totalB.toString(10).padStart(5)} byte` : dash).padEnd(colW.tot) +
    fmt(txfq_fill).toString().padEnd(colW.fill) +
    fmt(hex8(txfq_rptr_b ?? 0)).padEnd(colW.rptr) +
    fmt(hex8(txfq_wptr_b ?? 0)).padEnd(colW.wptr) +
    fmt(dash).padEnd(colW.wrap) +
    fmt(enTXFQ).toString().padEnd(colW.en)
  );

  // TXPQ
  const txpq_sa = bits(rb('TXPQ_LMEM'), 17, 6);
  const txpq_sa_b = txpq_sa !== undefined ? (txpq_sa << 6) : undefined;
  const txpq_cfg = rb('TXPQ_CFG');
  const txpq_slotWords = bits(txpq_cfg, 17, 8);
  const txpq_slotBytes = txpq_slotWords !== undefined ? (txpq_slotWords << 2) : undefined;
  const txpq_slotNum = bits(txpq_cfg, 5, 0);
  const txpq_ea_b = (txpq_sa_b !== undefined && txpq_slotBytes !== undefined && txpq_slotNum !== undefined) ? (txpq_sa_b + (txpq_slotBytes * Math.min(txpq_slotNum, 32))) : undefined;
  const txpq_totalB = (txpq_slotBytes !== undefined && txpq_slotNum !== undefined) ? (txpq_slotBytes * Math.min(txpq_slotNum, 32)) : undefined;
  const txpq_fill = bits(rb('TXPQ_STS1'), 5, 0);
  const txpq_wptr = bits(rb('TXPQ_WPTR'), 17, 2);
  const txpq_wptr_b = txpq_wptr !== undefined ? (txpq_wptr << 2) : undefined;

  qrows.push(
    'TXPQ'.padEnd(colW.q) +
    fmt(hex8(txpq_sa_b ?? 0)).padEnd(colW.sa) +
    fmt(txpq_ea_b !== undefined ? hex8(txpq_ea_b) : 'calculated').padEnd(colW.ea) +
    fmt(txpq_slotBytes !== undefined ? `${txpq_slotBytes.toString(10).padStart(4)} byte` : dash).padEnd(colW.es) +
    fmt(txpq_slotNum !== undefined ? Math.min(txpq_slotNum, 32) : dash).toString().padEnd(colW.num) +
    fmt(txpq_totalB !== undefined ? `${txpq_totalB.toString(10).padStart(5)} byte` : dash).padEnd(colW.tot) +
    fmt(txpq_fill).toString().padEnd(colW.fill) +
    fmt(dash).padEnd(colW.rptr) +
    fmt(hex8(txpq_wptr_b ?? 0)).padEnd(colW.wptr) +
    fmt(dash).padEnd(colW.wrap) +
    fmt(enTXPQ).toString().padEnd(colW.en)
  );

  // TEFQ
  const tefq_sa = bits(rb('TEFQ_LMEM'), 17, 6);
  const tefq_sa_b = tefq_sa !== undefined ? (tefq_sa << 6) : undefined;
  const tefq_cfg = rb('TEFQ_CFG');
  const tefq_large = bits(tefq_cfg, 8, 8);
  const tefq_elemB = tefq_large !== undefined ? ((4 + (tefq_large ? 1 : 0)) << 2) : undefined; // 16 or 20 bytes
  const tefq_num = bits(tefq_cfg, 5, 0);
  const tefq_totalB = (tefq_elemB !== undefined && tefq_num !== undefined) ? (tefq_elemB * tefq_num) : undefined;
  const tefq_fill = bits(rb('TEFQ_STS'), 5, 0);
  const tefq_rptr = bits(rb('TEFQ_RPTR'), 17, 2);
  const tefq_wptr = bits(rb('TEFQ_WPTR'), 17, 2);
  const tefq_rptr_b = tefq_rptr !== undefined ? (tefq_rptr << 2) : undefined;
  const tefq_wptr_b = tefq_wptr !== undefined ? (tefq_wptr << 2) : undefined;

  qrows.push(
    'TEFQ'.padEnd(colW.q) +
    fmt(hex8(tefq_sa_b ?? 0)).padEnd(colW.sa) +
    fmt(tefq_totalB !== undefined && tefq_sa_b !== undefined ? hex8(tefq_sa_b + tefq_totalB) : 'calculated').padEnd(colW.ea) +
    fmt(tefq_elemB !== undefined ? `${tefq_elemB.toString(10).padStart(4)} byte` : dash).padEnd(colW.es) +
    fmt(tefq_num).toString().padEnd(colW.num) +
    fmt(tefq_totalB !== undefined ? `${tefq_totalB.toString(10).padStart(5)} byte` : dash).padEnd(colW.tot) +
    fmt(tefq_fill).toString().padEnd(colW.fill) +
    fmt(hex8(tefq_rptr_b ?? 0)).padEnd(colW.rptr) +
    fmt(hex8(tefq_wptr_b ?? 0)).padEnd(colW.wptr) +
    fmt(dash).padEnd(colW.wrap) +
    fmt(enTEFQ).toString().padEnd(colW.en)
  );

  // RXFQ0
  const r0_sa = bits(rb('RXFQ0_SA'), 31, 6);
  const r0_ea = bits(rb('RXFQ0_EA'), 31, 6);
  const r0_sa_b = r0_sa !== undefined ? (r0_sa << 6) : undefined;
  const r0_ea_b = r0_ea !== undefined ? (r0_ea << 6) : undefined;
  const r0_totalB = (r0_sa_b !== undefined && r0_ea_b !== undefined && r0_ea_b >= r0_sa_b) ? (r0_ea_b - r0_sa_b + 4) : undefined;
  const r0_fill = bits(rb('RXFQ_STS'), 7, 0);
  const r0_rptr = bits(rb('RXFQ0_RPTR'), 31, 2);
  const r0_wptr = bits(rb('RXFQ0_WPTR'), 31, 2);
  const r0_wrap = bits(rb('RXFQ0_WRAP_PTR'), 31, 2);
  const r0_rptr_b = r0_rptr !== undefined ? (r0_rptr << 2) : undefined;
  const r0_wptr_b = r0_wptr !== undefined ? (r0_wptr << 2) : undefined;
  const r0_wrap_b = r0_wrap !== undefined ? (r0_wrap << 2) : undefined;

  qrows.push(
    'RXFQ0'.padEnd(colW.q) +
    fmt(hex8(r0_sa_b ?? 0)).padEnd(colW.sa) +
    fmt(hex8(r0_ea_b ?? 0)).padEnd(colW.ea) +
    fmt(dash).padEnd(colW.es) +
    fmt(dash).padEnd(colW.num) +
    fmt(r0_totalB !== undefined ? `${r0_totalB.toString(10).padStart(5)} byte` : dash).padEnd(colW.tot) +
    fmt(r0_fill).toString().padEnd(colW.fill) +
    fmt(hex8(r0_rptr_b ?? 0)).padEnd(colW.rptr) +
    fmt(hex8(r0_wptr_b ?? 0)).padEnd(colW.wptr) +
    fmt(r0_wrap_b !== undefined ? hex8(r0_wrap_b) : dash).padEnd(colW.wrap) +
    fmt(enRXFQ0).toString().padEnd(colW.en)
  );

  // RXFQ1
  const r1_sa = bits(rb('RXFQ1_SA'), 31, 6);
  const r1_ea = bits(rb('RXFQ1_EA'), 31, 6);
  const r1_sa_b = r1_sa !== undefined ? (r1_sa << 6) : undefined;
  const r1_ea_b = r1_ea !== undefined ? (r1_ea << 6) : undefined;
  const r1_totalB = (r1_sa_b !== undefined && r1_ea_b !== undefined && r1_ea_b >= r1_sa_b) ? (r1_ea_b - r1_sa_b + 4) : undefined;
  const r1_fill = bits(rb('RXFQ_STS'), 15, 8);
  const r1_rptr = bits(rb('RXFQ1_RPTR'), 31, 2);
  const r1_wptr = bits(rb('RXFQ1_WPTR'), 31, 2);
  const r1_wrap = bits(rb('RXFQ1_WRAP_PTR'), 31, 2);
  const r1_rptr_b = r1_rptr !== undefined ? (r1_rptr << 2) : undefined;
  const r1_wptr_b = r1_wptr !== undefined ? (r1_wptr << 2) : undefined;
  const r1_wrap_b = r1_wrap !== undefined ? (r1_wrap << 2) : undefined;

  qrows.push(
    'RXFQ1'.padEnd(colW.q) +
    fmt(hex8(r1_sa_b ?? 0)).padEnd(colW.sa) +
    fmt(hex8(r1_ea_b ?? 0)).padEnd(colW.ea) +
    fmt(dash).padEnd(colW.es) +
    fmt(dash).padEnd(colW.num) +
    fmt(r1_totalB !== undefined ? `${r1_totalB.toString(10).padStart(5)} byte` : dash).padEnd(colW.tot) +
    fmt(r1_fill).toString().padEnd(colW.fill) +
    fmt(hex8(r1_rptr_b ?? 0)).padEnd(colW.rptr) +
    fmt(hex8(r1_wptr_b ?? 0)).padEnd(colW.wptr) +
    fmt(r1_wrap_b !== undefined ? hex8(r1_wrap_b) : dash).padEnd(colW.wrap) +
    fmt(enRXFQ1).toString().padEnd(colW.en)
  );

  // the Queue Summary message
  const msg_qsum = header.concat(qrows).join('\n');

  // ==================================================================================
  // Build LMEM/SMEM Memory Maps depending on CTM (MH_CFG.CTME) =======================
  // ==================================================================================

  let lmemRows = []; // LMEM Memory Map entries
  let smemRows = []; // SMEM Memory Map entries (only in CTM)

  // Helpers for memory map building
  const mapCols = { name: 10, sa: 12, ea: 10, size: 11};
  const memMapHeader = (title) => [
    title + ((ctme === 1) ? ' (CTM active)' : ' (FMM active)') + '\n' +
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
  const entryLineSmem = (n, s, e, sz) => (
    n.padEnd(mapCols.name) +
    (s !== undefined ? hex8(s) : dash).padEnd(mapCols.sa) +
    (e !== undefined ? hex8(e) : dash).padEnd(mapCols.ea) +
    (sz !== undefined ? `${sz.toString(10).padStart(6)} byte` : dash).padEnd(mapCols.size)
  );

  // LMEM boundaries (optional gap calculation start/end)
  const lmemProt = rb('LMEM_PROT');
  const lmemSA = lmemProt !== undefined ? (bits(lmemProt, 15,  0) << 2) : (0x0000 << 2); // if undefined assume full LMEM
  const lmemEA = lmemProt !== undefined ? (bits(lmemProt, 31, 16) << 2) : (0xFFFF << 2); // if undefined assume full LMEM

  // Collect LMEM entries
  const lmemEntries = [];
  // Filters (enabled if FE_NUM > 0)
  const rxFiltReg = rb('RX_FILTER_LMEM');
  const rxFiltSAf = bits(rxFiltReg, 17, 6);
  const rxFiltSA = rxFiltSAf !== undefined ? (rxFiltSAf << 6) : undefined;
  const rxFiltCfg = rb('RX_FILTER_CFG');
  const feNum = bits(rxFiltCfg, 6, 0) ?? 0;
  if (rxFiltSA !== undefined && feNum > 0) {
    const roundUp4 = Math.ceil(feNum / 4) * 4; // bytes
    const bytesMin = roundUp4 + (feNum * 8);   // 2 comparisons => min
    const bytesMax = roundUp4 + (feNum * 16);  // 2 comparisons/filter => max
    const rxFiltEA_min = rxFiltSA + bytesMin - 1; // last byte
    const rxFiltEA_max = rxFiltSA + bytesMax - 1; // last byte
    const rxFiltSizeMin = rxFiltEA_min - rxFiltSA + 1;
    lmemEntries.push({ name: 'Filters', sa: rxFiltSA, ea: rxFiltEA_min, size: rxFiltSizeMin, _filtersMaxEa: rxFiltEA_max });
  }
  // TXFQ (enabled via MH_CFG)
  if (enTXFQ === 1 && txfq_sa_b !== undefined) {
    const txfqEaLast = txfq_ea_b !== undefined ? (txfq_ea_b + 3) : undefined; // last byte of EA-word
    lmemEntries.push({ name: 'TXFQ', sa: txfq_sa_b, ea: txfqEaLast, size: txfq_totalB });
  }
  // TXPQ (enabled via MH_CFG)
  if (enTXPQ === 1 && txpq_sa_b !== undefined) {
    const txpqEaLast = txpq_ea_b !== undefined ? (txpq_ea_b - 1) : undefined; // computed end = last byte
    lmemEntries.push({ name: 'TXPQ', sa: txpq_sa_b, ea: txpqEaLast, size: txpq_totalB });
  }
  // TEFQ (enabled via MH_CFG)
  if (enTEFQ === 1 && tefq_sa_b !== undefined) {
    const tefqEaLast = (tefq_totalB !== undefined ? (tefq_sa_b + tefq_totalB - 1) : undefined);
    lmemEntries.push({ name: 'TEFQ', sa: tefq_sa_b, ea: tefqEaLast, size: tefq_totalB });
  }
  // CTB (only meaningful in CTM)
  const ctbReg = rb('CTB_LMEM');
  const ctbSAf = bits(ctbReg, 17, 6);
  const ctbSA = ctbSAf !== undefined ? (ctbSAf << 6) : undefined;
  if (ctme === 1 && ctbSA !== undefined) {
    lmemEntries.push({ name: 'CTB', sa: ctbSA, ea: ctbSA + 127, size: 128 });
  }
  // RXFQ0/1 belong to LMEM only in FMM (and only if enabled)
  if (ctme === 0) {
    if (enRXFQ0 === 1 && r0_sa_b !== undefined) {
      const r0EaLast = r0_ea_b !== undefined ? (r0_ea_b + 3) : undefined; // last byte EA-word
      lmemEntries.push({ name: 'RXFQ0', sa: r0_sa_b, ea: r0EaLast, size: r0_totalB });
    }
    if (enRXFQ1 === 1 && r1_sa_b !== undefined) {
      const r1EaLast = r1_ea_b !== undefined ? (r1_ea_b + 3) : undefined; // last byte EA-word
      lmemEntries.push({ name: 'RXFQ1', sa: r1_sa_b, ea: r1EaLast, size: r1_totalB });
    }
  }

  // Sort by start address
  lmemEntries.sort((a, b) => (a.sa ?? 0) - (b.sa ?? 0));

  // Detect overlaps in LMEM entries (using last-byte semantics)
  const lmemOverlapErrors = [];
  for (let i = 1; i < lmemEntries.length; i++) {
    const prev = lmemEntries[i - 1];
    const cur  = lmemEntries[i];
    if (prev && cur && prev.ea !== undefined && cur.sa !== undefined && cur.ea !== undefined) {
      if (cur.sa <= prev.ea) {
        lmemOverlapErrors.push(
          `LMEM overlap detected: ${prev.name} [${hex5(prev.sa)} - ${hex5(prev.ea)}] overlaps with ${cur.name} [${hex5(cur.sa)} - ${hex5(cur.ea)}]`
        );
      }
    }
  }

  // Build LMEM map text with GAPs
  if (lmemEntries.length) {
    lmemRows.push(memMapHeader('LMEM Memory Map'));
    // Show LMEM_PROT as first row
    const lmemSize   = (lmemSA !== undefined && lmemEA !== undefined) ? (lmemEA - lmemSA + 4) : undefined; // EA itselft is part of the range: +4 bytes
    const lmemEaLast = (lmemEA !== undefined) ? (lmemEA + 3) : undefined; // last byte of EA-word
    lmemRows.push(entryLineLmem('LMEM_PROT', lmemSA, lmemEaLast, lmemSize));
    if (lmemProt === undefined) {
      lmemRows[lmemRows.length - 1] += ' (register undefined: max. LMEM size assumed (256 kbyte))';
    }
    let prevEnd = lmemSA; // start gaps from LMEM start if available
    for (const it of lmemEntries) {
      if (prevEnd !== undefined && it.sa !== undefined && it.sa > (prevEnd + 1)) {
        lmemRows.push(entryLineLmem('- GAP -', prevEnd + 1, it.sa - 1, ((it.sa - 1)-(prevEnd + 1)+1))); // gap starts 1 byte after previoous, and ends 1 byte before current start
      }
      lmemRows.push(entryLineLmem(it.name, it.sa, it.ea, it.size));
      if (it.name === 'Filters' && it._filtersMaxEa !== undefined) {
        lmemRows[lmemRows.length - 1] += ` (max. End byte ${hex5(it._filtersMaxEa)} if 2 Comparisons/Filter)`;
      }
      prevEnd = (it.ea !== undefined ? it.ea : prevEnd);
    }
    if (prevEnd !== undefined && lmemEA !== undefined && lmemEA > (prevEnd + 1)) {
      lmemRows.push(entryLineLmem('- GAP -', prevEnd + 1, lmemEA - 1, (lmemEA - (prevEnd + 1)))); // final gap
    }
  }

  // SMEM map in CTM consists only of RXFQ0/1
  const smemOverlapErrors = [];
  if (ctme === 1) {
    const smemEntries = [];
    if (enRXFQ0 === 1 && r0_sa_b !== undefined) {
      const r0EaLast = r0_ea_b !== undefined ? (r0_ea_b + 3) : undefined; // last byte of EA-word
      const r0Size = (r0_totalB !== undefined ? r0_totalB : (r0EaLast !== undefined && r0_sa_b !== undefined ? (r0EaLast - r0_sa_b + 1) : undefined));
      smemEntries.push({ name: 'RXFQ0', sa: r0_sa_b, ea: r0EaLast, size: r0Size });
    }
    if (enRXFQ1 === 1 && r1_sa_b !== undefined) {
      const r1EaLast = r1_ea_b !== undefined ? (r1_ea_b + 3) : undefined; // last byte of EA-word
      const r1Size = (r1_totalB !== undefined ? r1_totalB : (r1EaLast !== undefined && r1_sa_b !== undefined ? (r1EaLast - r1_sa_b + 1) : undefined));
      smemEntries.push({ name: 'RXFQ1', sa: r1_sa_b, ea: r1EaLast, size: r1Size });
    }
    smemEntries.sort((a, b) => (a.sa ?? 0) - (b.sa ?? 0));

    // Detect overlaps in SMEM entries
    for (let i = 1; i < smemEntries.length; i++) {
      const prev = smemEntries[i - 1];
      const cur  = smemEntries[i];
      if (prev && cur && prev.ea !== undefined && cur.sa !== undefined && cur.ea !== undefined) {
        if (cur.sa <= prev.ea) {
          smemOverlapErrors.push(
            `SMEM overlap detected: ${prev.name} [${hex8(prev.sa)} - ${hex8(prev.ea)}] overlaps with ${cur.name} [${hex8(cur.sa)} - ${hex8(cur.ea)}]`
          );
        }
      }
    }

    // Build SMEM map text with GAPs
    if (smemEntries.length) {
      smemRows.push(memMapHeader('SMEM Memory Map'));
      let prevEndSM;
      for (const it of smemEntries) {
        if (prevEndSM !== undefined && it.sa !== undefined && it.sa > (prevEndSM + 1)) {
          smemRows.push(entryLineSmem('- GAP -', prevEndSM + 1, it.sa, (it.sa - (prevEndSM + 1)))); // gap
        }
        smemRows.push(entryLineSmem(it.name, it.sa, it.ea, it.size));
        prevEndSM = (it.ea !== undefined ? it.ea : prevEndSM);
      }
  }
  }

  // Append memory maps to the summary message
  const msg_lmemMap = lmemRows.join('\n');
  const msg_smemMap = smemRows.join('\n');
  
  // ==================================================================================
  // Push report to the first available queue-related register report array,
  // searching backwards starting from RXFQ_STS up to MH_CFG.
  // ==================================================================================
  const targets = [
    'RXFQ_STS',
    // RXFQ1 family
    'RXFQ1_WPTR','RXFQ1_RPTR','RXFQ1_EA','RXFQ1_SA','RXFQ1_WRAP_PTR',
    // RXFQ0 family
    'RXFQ0_WPTR','RXFQ0_RPTR','RXFQ0_EA','RXFQ0_SA','RXFQ0_WRAP_PTR',
    // TX scan (queue selection info)
    'TX_SCAN_PC','TX_SCAN_WC',
    // TEFQ family
    'TEFQ_RPTR','TEFQ_WPTR','TEFQ_STS','TEFQ_CFG','TEFQ_LMEM',
    // TXPQ family
    'TXPQ_WPTR','TXPQ_STS1','TXPQ_STS0','TXPQ_CFG','TXPQ_LMEM',
    // TXFQ family
    'TXFQ_RPTR','TXFQ_WPTR','TXFQ_STS','TXFQ_CFG','TXFQ_LMEM_EA','TXFQ_LMEM_SA',
    // Configuration baseline
    'MH_CFG'
  ];

  let appended = false;
  for (const name of targets) {
    if (name in reg && reg[name] && Array.isArray(reg[name].report)) {
      reg[name].report.push({ severityLevel: sevC.infoBold, msg: msg_qsum });
      reg[name].report.push({ severityLevel: sevC.infoBold, msg: msg_lmemMap });
      // Push overlap errors as separate error report entries
      if (lmemOverlapErrors.length) {
        for (const emsg of lmemOverlapErrors) {
          reg[name].report.push({ severityLevel: sevC.error, msg: emsg });
        }
      } else {
        // No overlaps detected: add calculation-type confirmation for LMEM
        if (typeof lmemOverlapErrors !== 'undefined') {
          reg[name].report.push({ severityLevel: sevC.calculation, msg: 'LMEM: no range overlap detected' });
        }
      }
      // SMEM map and errors only in CTM
      if (ctme === 1 && smemRows.length) {
        reg[name].report.push({ severityLevel: sevC.infoBold, msg: msg_smemMap });
        // Push overlap errors as separate error report entries
        if (smemOverlapErrors.length) {
          for (const emsg of smemOverlapErrors) {
            reg[name].report.push({ severityLevel: sevC.error, msg: emsg });
          }
        } else {
          // No overlaps detected: add calculation-type confirmation for SMEM
          if (typeof smemOverlapErrors !== 'undefined') {
            reg[name].report.push({ severityLevel: sevC.calculation, msg: 'SMEM: no range overlap detected' });
          }
        }
      }
      appended = true;
      break;
    }
  }

  if (!appended) {
    console.log('Queues Summary & LMEM/SMEM Memory Map: no appropriate register found to append report; not printed.');
  }

} // Queues Summary & Memory Map