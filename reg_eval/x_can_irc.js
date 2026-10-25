// All rights reserved. (c) 2026 //

// X_CAN: MH register decoding
import { getBits } from './help_functions.js';
import { defineField } from './help_functions.js';
import { sevC } from './help_functions.js';
import { getBinaryLineData } from './help_functions.js';

// Render a single 32-bit table row from a decoded field (single source of truth).
// Produces: `[<bit> <NAME_SHORT padded>] <name_long padded> = <value>`
const ircRow = (fld) => `[${String(fld.msb).padStart(2)} ${fld.name_short.padEnd(16)}] ${fld.name_long.padEnd(26)} = ${fld.value}`;

// ===================================================================================
// IRC registers decoding
export function procRegsIRC(reg) {
  // Helper(s)
  const listSet = (mask, highBit, lowBit=0) => { const a=[]; for(let i=highBit;i>=lowBit;i--){ if(((mask>>>i)&1)===1) a.push(i-lowBit); } return a; };

  // === FUNC_RAW: Functional Raw Event Status ======================
  if ('FUNC_RAW' in reg && reg.FUNC_RAW.int32 !== undefined) {
    const v = reg.FUNC_RAW.int32;
    // 0. Extend structure
    reg.FUNC_RAW.fields = {};
    reg.FUNC_RAW.report = [];
    // 1. Decode (MSB->LSB)
    defineField(reg.FUNC_RAW, v, 'PRT_RX_EVT', 27, 27, 'PRT RX CAN Message');
    defineField(reg.FUNC_RAW, v, 'PRT_TX_EVT', 26, 26, 'PRT TX CAN Message');
    defineField(reg.FUNC_RAW, v, 'PRT_BUS_ON', 25, 25, 'PRT Bus-On Event');
    defineField(reg.FUNC_RAW, v, 'PRT_E_ACTIVE', 24, 24, 'PRT Error-Active Event');
    defineField(reg.FUNC_RAW, v, 'MH_STATS_IRQ', 22, 22, 'MH Statistics Counter Wrap');
    defineField(reg.FUNC_RAW, v, 'MH_RX_ABORT_IRQ', 21, 21, 'MH RX Abort (PRT/MH IF)');
    defineField(reg.FUNC_RAW, v, 'MH_TX_ABORT_IRQ', 20, 20, 'MH TX Abort (PRT/MH IF)');
    defineField(reg.FUNC_RAW, v, 'MH_TX_FILTER_IRQ', 19, 19, 'MH TX Filter Reject');
    defineField(reg.FUNC_RAW, v, 'MH_RX_FILTER_IRQ', 18, 18, 'MH RX Filter Match');
    defineField(reg.FUNC_RAW, v, 'MH_STOP_IRQ', 17, 17, 'MH Stop Event');
    defineField(reg.FUNC_RAW, v, 'MH_TX_PQ_IRQ', 16, 16, 'MH TX Prio Queue Event');
    // RX FIFO Queue IRQs 15..8
    defineField(reg.FUNC_RAW, v, 'MH_RX_FQ7_IRQ', 15, 15, 'MH RX FIFO Queue 7 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_RX_FQ6_IRQ', 14, 14, 'MH RX FIFO Queue 6 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_RX_FQ5_IRQ', 13, 13, 'MH RX FIFO Queue 5 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_RX_FQ4_IRQ', 12, 12, 'MH RX FIFO Queue 4 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_RX_FQ3_IRQ', 11, 11, 'MH RX FIFO Queue 3 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_RX_FQ2_IRQ', 10, 10, 'MH RX FIFO Queue 2 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_RX_FQ1_IRQ', 9, 9, 'MH RX FIFO Queue 1 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_RX_FQ0_IRQ', 8, 8, 'MH RX FIFO Queue 0 IRQ');
    // TX FIFO Queue IRQs 7..0
    defineField(reg.FUNC_RAW, v, 'MH_TX_FQ7_IRQ', 7, 7, 'MH TX FIFO Queue 7 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_TX_FQ6_IRQ', 6, 6, 'MH TX FIFO Queue 6 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_TX_FQ5_IRQ', 5, 5, 'MH TX FIFO Queue 5 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_TX_FQ4_IRQ', 4, 4, 'MH TX FIFO Queue 4 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_TX_FQ3_IRQ', 3, 3, 'MH TX FIFO Queue 3 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_TX_FQ2_IRQ', 2, 2, 'MH TX FIFO Queue 2 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_TX_FQ1_IRQ', 1, 1, 'MH TX FIFO Queue 1 IRQ');
    defineField(reg.FUNC_RAW, v, 'MH_TX_FQ0_IRQ', 0, 0, 'MH TX FIFO Queue 0 IRQ');
    const f = reg.FUNC_RAW.fields;
    // 2. Report
    reg.FUNC_RAW.report.push({
      severityLevel: sevC.info,
      msg: `FUNC_RAW: ${reg.FUNC_RAW.name_long} (0x${reg.FUNC_RAW.addr !== undefined ? reg.FUNC_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `[28 -               ] Reserved                   = - \n`+
           `${ircRow(f.PRT_RX_EVT)}\n`+
           `${ircRow(f.PRT_TX_EVT)}\n`+
           `${ircRow(f.PRT_BUS_ON)}\n`+
           `${ircRow(f.PRT_E_ACTIVE)}\n`+
           `[23 -               ] Reserved                   = - \n`+
           `${ircRow(f.MH_STATS_IRQ)}\n`+
           `${ircRow(f.MH_RX_ABORT_IRQ)}\n`+
           `${ircRow(f.MH_TX_ABORT_IRQ)}\n`+
           `${ircRow(f.MH_TX_FILTER_IRQ)}\n`+
           `${ircRow(f.MH_RX_FILTER_IRQ)}\n`+
           `${ircRow(f.MH_STOP_IRQ)}\n`+
           `${ircRow(f.MH_TX_PQ_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ7_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ6_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ5_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ4_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ3_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ2_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ1_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ0_IRQ)}\n`+
           `[ 7 MH_TX_FQx_IRQ   ] MH TX FIFO Queue 7 IRQ     = ${f.MH_TX_FQ7_IRQ.value}\n`+
           `${ircRow(f.MH_TX_FQ6_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ5_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ4_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ3_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ2_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ1_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ0_IRQ)}`
    });
  }

  // === ERR_RAW: Error Raw Event Status ============================
  if ('ERR_RAW' in reg && reg.ERR_RAW.int32 !== undefined) {
    const v = reg.ERR_RAW.int32;
    // 0. Extend structure
    reg.ERR_RAW.fields = {};
    reg.ERR_RAW.report = [];
    // 1. Decode (MSB->LSB) (31..0) per updated specification
    defineField(reg.ERR_RAW, v, 'TOP_MUX_TO_ERR', 28, 28, 'Top-Level Mux Timeout');
    defineField(reg.ERR_RAW, v, 'PRT_BUS_OFF', 23, 23, 'PRT Bus Off');
    defineField(reg.ERR_RAW, v, 'PRT_E_PASSIVE', 22, 22, 'PRT Error Passive');
    defineField(reg.ERR_RAW, v, 'PRT_BUS_ERR', 21, 21, 'PRT CAN Bus Error');
    defineField(reg.ERR_RAW, v, 'PRT_IFF_RQ', 20, 20, 'PRT Invalid Frame Format');
    defineField(reg.ERR_RAW, v, 'PRT_RX_DO', 19, 19, 'PRT RX Overflow');
    defineField(reg.ERR_RAW, v, 'PRT_TX_DU', 18, 18, 'PRT TX Underrun');
    defineField(reg.ERR_RAW, v, 'PRT_USOS', 17, 17, 'PRT Unexp. Start Of Seq');
    defineField(reg.ERR_RAW, v, 'PRT_ABORTED', 16, 16, 'PRT TX Sequence Aborted');
    defineField(reg.ERR_RAW, v, 'MH_MEM_TO_ERR', 13, 13, 'LMEM Timeout');
    defineField(reg.ERR_RAW, v, 'MH_WR_RESP_ERR', 12, 12, 'Write Response Bus Error');
    defineField(reg.ERR_RAW, v, 'MH_RD_RESP_ERR', 11, 11, 'Read Response Bus Error');
    defineField(reg.ERR_RAW, v, 'MH_DMA_CH_ERR', 10, 10, 'DMA Channel Routing Error');
    defineField(reg.ERR_RAW, v, 'MH_DMA_TO_ERR', 9, 9, 'DMA Timeout');
    defineField(reg.ERR_RAW, v, 'MH_DP_TO_ERR', 8, 8, 'Data Path Timeout');
    defineField(reg.ERR_RAW, v, 'MH_DP_DO_ERR', 7, 7, 'Data Path Overflow');
    defineField(reg.ERR_RAW, v, 'MH_DP_SEQ_ERR', 6, 6, 'Data Path Sequence Error');
    defineField(reg.ERR_RAW, v, 'MH_DP_PARITY_ERR', 5, 5, 'Data Path Parity Error');
    defineField(reg.ERR_RAW, v, 'MH_AP_PARITY_ERR', 4, 4, 'Address Pointer Parity Err');
    defineField(reg.ERR_RAW, v, 'MH_DESC_ERR', 3, 3, 'Descriptor Error');
    defineField(reg.ERR_RAW, v, 'MH_REG_CRC_ERR', 2, 2, 'Register Bank CRC Error');
    defineField(reg.ERR_RAW, v, 'MH_MEM_SFTY_ERR', 1, 1, 'Memory Safety Error');
    defineField(reg.ERR_RAW, v, 'MH_RX_FILTER_ERR', 0, 0, 'RX Filter Timeout/Error');
    const f = reg.ERR_RAW.fields;
    // 2. Report
    reg.ERR_RAW.report.push({
      severityLevel: sevC.info,
      msg: `ERR_RAW: ${reg.ERR_RAW.name_long} (0x${reg.ERR_RAW.addr !== undefined ? reg.ERR_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `${ircRow(f.TOP_MUX_TO_ERR)}\n`+
           `[27 -               ] Reserved                   = -\n`+
           `[26 -               ] Reserved                   = -\n`+
           `[25 -               ] Reserved                   = -\n`+
           `[24 -               ] Reserved                   = -\n`+
           `${ircRow(f.PRT_BUS_OFF)}\n`+
           `${ircRow(f.PRT_E_PASSIVE)}\n`+
           `${ircRow(f.PRT_BUS_ERR)}\n`+
           `${ircRow(f.PRT_IFF_RQ)}\n`+
           `${ircRow(f.PRT_RX_DO)}\n`+
           `${ircRow(f.PRT_TX_DU)}\n`+
           `${ircRow(f.PRT_USOS)}\n`+
           `${ircRow(f.PRT_ABORTED)}\n`+
           `[15 -               ] Reserved                   = -\n`+
           `[14 -               ] Reserved                   = -\n`+
           `${ircRow(f.MH_MEM_TO_ERR)}\n`+
           `${ircRow(f.MH_WR_RESP_ERR)}\n`+
           `${ircRow(f.MH_RD_RESP_ERR)}\n`+
           `${ircRow(f.MH_DMA_CH_ERR)}\n`+
           `${ircRow(f.MH_DMA_TO_ERR)}\n`+
           `${ircRow(f.MH_DP_TO_ERR)}\n`+
           `${ircRow(f.MH_DP_DO_ERR)}\n`+
           `${ircRow(f.MH_DP_SEQ_ERR)}\n`+
           `${ircRow(f.MH_DP_PARITY_ERR)}\n`+
           `${ircRow(f.MH_AP_PARITY_ERR)}\n`+
           `${ircRow(f.MH_DESC_ERR)}\n`+
           `${ircRow(f.MH_REG_CRC_ERR)}\n`+
           `${ircRow(f.MH_MEM_SFTY_ERR)}\n`+
           `${ircRow(f.MH_RX_FILTER_ERR)}`
    });
  }

  // === SAFETY_RAW: Safety Raw Event Status ========================
  if ('SAFETY_RAW' in reg && reg.SAFETY_RAW.int32 !== undefined) {
    const v = reg.SAFETY_RAW.int32;
    // 0. Extend structure
    reg.SAFETY_RAW.fields = {};
    reg.SAFETY_RAW.report = [];
    // 1. Decode (MSB->LSB) 28..0
    defineField(reg.SAFETY_RAW, v, 'TOP_MUX_TO_ERR', 28, 28, 'Top-Level Mux Timeout');
    defineField(reg.SAFETY_RAW, v, 'PRT_BUS_OFF', 23, 23, 'PRT Bus Off');
    defineField(reg.SAFETY_RAW, v, 'PRT_E_PASSIVE', 22, 22, 'PRT Error Passive');
    defineField(reg.SAFETY_RAW, v, 'PRT_BUS_ERR', 21, 21, 'PRT CAN Bus Error');
    defineField(reg.SAFETY_RAW, v, 'PRT_IFF_RQ', 20, 20, 'PRT Invalid Frame Format');
    defineField(reg.SAFETY_RAW, v, 'PRT_RX_DO', 19, 19, 'PRT RX Overflow');
    defineField(reg.SAFETY_RAW, v, 'PRT_TX_DU', 18, 18, 'PRT TX Underrun');
    defineField(reg.SAFETY_RAW, v, 'PRT_USOS', 17, 17, 'PRT Unexpect. Start Of Seq');
    defineField(reg.SAFETY_RAW, v, 'PRT_ABORTED', 16, 16, 'PRT TX Sequence Aborted');
    defineField(reg.SAFETY_RAW, v, 'MH_MEM_TO_ERR', 13, 13, 'Local Memory Timeout');
    defineField(reg.SAFETY_RAW, v, 'MH_WR_RESP_ERR', 12, 12, 'Write Response Bus Error');
    defineField(reg.SAFETY_RAW, v, 'MH_RD_RESP_ERR', 11, 11, 'Read Response Bus Error');
    defineField(reg.SAFETY_RAW, v, 'MH_DMA_CH_ERR', 10, 10, 'DMA Channel Routing Error');
    defineField(reg.SAFETY_RAW, v, 'MH_DMA_TO_ERR', 9, 9, 'DMA Timeout');
    defineField(reg.SAFETY_RAW, v, 'MH_DP_TO_ERR', 8, 8, 'Data Path Timeout');
    defineField(reg.SAFETY_RAW, v, 'MH_DP_DO_ERR', 7, 7, 'Data Path Overflow');
    defineField(reg.SAFETY_RAW, v, 'MH_DP_SEQ_ERR', 6, 6, 'Data Path Sequence Error');
    defineField(reg.SAFETY_RAW, v, 'MH_DP_PARITY_ERR', 5, 5, 'Data Path Parity Error');
    defineField(reg.SAFETY_RAW, v, 'MH_AP_PARITY_ERR', 4, 4, 'Address Pointer Parity Err');
    defineField(reg.SAFETY_RAW, v, 'MH_DESC_ERR', 3, 3, 'Descriptor Error');
    defineField(reg.SAFETY_RAW, v, 'MH_REG_CRC_ERR', 2, 2, 'Register Bank CRC Error');
    defineField(reg.SAFETY_RAW, v, 'MH_MEM_SFTY_ERR', 1, 1, 'Memory Safety Error');
    defineField(reg.SAFETY_RAW, v, 'MH_RX_FILTER_ERR', 0, 0, 'RX Filter Timeout/Error');
    const f = reg.SAFETY_RAW.fields;
    // 2. Report
    reg.SAFETY_RAW.report.push({
      severityLevel: sevC.info,
      msg: `SAFETY_RAW: ${reg.SAFETY_RAW.name_long} (0x${reg.SAFETY_RAW.addr !== undefined ? reg.SAFETY_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `${ircRow(f.TOP_MUX_TO_ERR)}\n`+
           `[27 -               ] Reserved                   = -\n`+
           `[26 -               ] Reserved                   = -\n`+
           `[25 -               ] Reserved                   = -\n`+
           `[24 -               ] Reserved                   = -\n`+
           `${ircRow(f.PRT_BUS_OFF)}\n`+
           `${ircRow(f.PRT_E_PASSIVE)}\n`+
           `${ircRow(f.PRT_BUS_ERR)}\n`+
           `${ircRow(f.PRT_IFF_RQ)}\n`+
           `${ircRow(f.PRT_RX_DO)}\n`+
           `${ircRow(f.PRT_TX_DU)}\n`+
           `${ircRow(f.PRT_USOS)}\n`+
           `${ircRow(f.PRT_ABORTED)}\n`+
           `[15 -               ] Reserved                   = -\n`+
           `[14 -               ] Reserved                   = -\n`+
           `${ircRow(f.MH_MEM_TO_ERR)}\n`+
           `${ircRow(f.MH_WR_RESP_ERR)}\n`+
           `${ircRow(f.MH_RD_RESP_ERR)}\n`+
           `${ircRow(f.MH_DMA_CH_ERR)}\n`+
           `${ircRow(f.MH_DMA_TO_ERR)}\n`+
           `${ircRow(f.MH_DP_TO_ERR)}\n`+
           `${ircRow(f.MH_DP_DO_ERR)}\n`+
           `${ircRow(f.MH_DP_SEQ_ERR)}\n`+
           `${ircRow(f.MH_DP_PARITY_ERR)}\n`+
           `${ircRow(f.MH_AP_PARITY_ERR)}\n`+
           `${ircRow(f.MH_DESC_ERR)}\n`+
           `${ircRow(f.MH_REG_CRC_ERR)}\n`+
           `${ircRow(f.MH_MEM_SFTY_ERR)}\n`+
           `${ircRow(f.MH_RX_FILTER_ERR)}`
    });
  }

  // === FUNC_CLR: Functional Raw Event Clear ======================
  if ('FUNC_CLR' in reg && reg.FUNC_CLR.int32 !== undefined) {
    const v = reg.FUNC_CLR.int32;
    // 0. Extend structure
    reg.FUNC_CLR.fields = {};
    reg.FUNC_CLR.report = [];
    // 1. Decode (MSB->LSB) bits
    // decoding makes no sense, because it is a Write-Only register
    defineField(reg.FUNC_CLR, v, 'BITS', 31, 0, 'Functional Raw Event Clear bits');
    // 2. Report
    reg.FUNC_CLR.report.push({
      severityLevel: sevC.info,
      msg: `FUNC_CLR:   ${reg.FUNC_CLR.name_long} (write-only) (0x${reg.FUNC_CLR.addr !== undefined ? reg.FUNC_CLR.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})`
    });

    // 3. Check values
    if (reg.FUNC_CLR.int32 !== 0) {
      reg.FUNC_CLR.report.push({
        severityLevel: sevC.warning,
        msg: `FUNC_CLR: read-value (0x${v.toString(16).toUpperCase().padStart(8,'0')}) should be = 0..0! (write-only register)`
      });
    }
    }

  // === ERR_CLR: Error Raw Event Clear ============================
  if ('ERR_CLR' in reg && reg.ERR_CLR.int32 !== undefined) {
    const v = reg.ERR_CLR.int32;
    // 0. Extend structure
    reg.ERR_CLR.fields = {};
    reg.ERR_CLR.report = [];
    // 1. Decode (MSB->LSB) bits
    // decoding makes no sense, because it is a Write-Only register
    defineField(reg.ERR_CLR, v, 'BITS', 31, 0, 'Error Raw Event Clear bits');
    // 2. Report
    reg.ERR_CLR.report.push({
      severityLevel: sevC.info,
      msg: `ERR_CLR:    ${reg.ERR_CLR.name_long}      (write-only) (0x${reg.ERR_CLR.addr !== undefined ? reg.ERR_CLR.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})`
    });
    
    // 3. Check values
    if (reg.ERR_CLR.int32 !== 0) {
      reg.ERR_CLR.report.push({
        severityLevel: sevC.warning,
        msg: `ERR_CLR: read-value (0x${v.toString(16).toUpperCase().padStart(8,'0')}) should be = 0..0! (write-only register)`
      });
    }
  }

  // === SAFETY_CLR: Safety Raw Event Clear ========================
  if ('SAFETY_CLR' in reg && reg.SAFETY_CLR.int32 !== undefined) {
    const v = reg.SAFETY_CLR.int32;
    // 0. Extend structure
    reg.SAFETY_CLR.fields = {};
    reg.SAFETY_CLR.report = [];
    // 1. Decode (MSB->LSB) bits
    // decoding makes no sense, because it is a Write-Only register
    defineField(reg.SAFETY_CLR, v, 'BITS', 31, 0, 'Safety Raw Event Clear bits');
    // 2. Report
    reg.SAFETY_CLR.report.push({
      severityLevel: sevC.info,
      msg: `SAFETY_CLR: ${reg.SAFETY_CLR.name_long}     (write-only) (0x${reg.SAFETY_CLR.addr !== undefined ? reg.SAFETY_CLR.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})`
    });
    
    // 3. Check values
    if (reg.SAFETY_CLR.int32 !== 0) {
      reg.SAFETY_CLR.report.push({
      severityLevel: sevC.warning,
      msg: `SAFETY_CLR: read-value (0x${v.toString(16).toUpperCase().padStart(8,'0')}) should be = 0..0! (write-only register)`
    });
    }
  }

  // === FUNC_ENA: Functional Raw Event Enable =====================
  if ('FUNC_ENA' in reg && reg.FUNC_ENA.int32 !== undefined) {
    const v = reg.FUNC_ENA.int32;
    // 0. Extend structure
    reg.FUNC_ENA.fields = {};
    reg.FUNC_ENA.report = [];
    // 1. Decode (MSB->LSB) bits
    defineField(reg.FUNC_ENA, v, 'PRT_RX_EVT', 27, 27, 'PRT RX CAN Message');
    defineField(reg.FUNC_ENA, v, 'PRT_TX_EVT', 26, 26, 'PRT TX CAN Message');
    defineField(reg.FUNC_ENA, v, 'PRT_BUS_ON', 25, 25, 'PRT Bus-On Event');
    defineField(reg.FUNC_ENA, v, 'PRT_E_ACTIVE', 24, 24, 'PRT Error-Active Event');
    defineField(reg.FUNC_ENA, v, 'MH_STATS_IRQ', 22, 22, 'MH Statistics Counter Wrap');
    defineField(reg.FUNC_ENA, v, 'MH_RX_ABORT_IRQ', 21, 21, 'MH RX Abort (PRT/MH IF)');
    defineField(reg.FUNC_ENA, v, 'MH_TX_ABORT_IRQ', 20, 20, 'MH TX Abort (PRT/MH IF)');
    defineField(reg.FUNC_ENA, v, 'MH_TX_FILTER_IRQ', 19, 19, 'MH TX Filter Reject');
    defineField(reg.FUNC_ENA, v, 'MH_RX_FILTER_IRQ', 18, 18, 'MH RX Filter Match');
    defineField(reg.FUNC_ENA, v, 'MH_STOP_IRQ', 17, 17, 'MH Stop Event');
    defineField(reg.FUNC_ENA, v, 'MH_TX_PQ_IRQ', 16, 16, 'MH TX Prio Queue Event');
    defineField(reg.FUNC_ENA, v, 'MH_RX_FQ7_IRQ', 15, 15, 'MH RX FIFO Queue 7 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_RX_FQ6_IRQ', 14, 14, 'MH RX FIFO Queue 6 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_RX_FQ5_IRQ', 13, 13, 'MH RX FIFO Queue 5 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_RX_FQ4_IRQ', 12, 12, 'MH RX FIFO Queue 4 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_RX_FQ3_IRQ', 11, 11, 'MH RX FIFO Queue 3 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_RX_FQ2_IRQ', 10, 10, 'MH RX FIFO Queue 2 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_RX_FQ1_IRQ', 9, 9, 'MH RX FIFO Queue 1 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_RX_FQ0_IRQ', 8, 8, 'MH RX FIFO Queue 0 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_TX_FQ7_IRQ', 7, 7, 'MH TX FIFO Queue 7 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_TX_FQ6_IRQ', 6, 6, 'MH TX FIFO Queue 6 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_TX_FQ5_IRQ', 5, 5, 'MH TX FIFO Queue 5 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_TX_FQ4_IRQ', 4, 4, 'MH TX FIFO Queue 4 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_TX_FQ3_IRQ', 3, 3, 'MH TX FIFO Queue 3 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_TX_FQ2_IRQ', 2, 2, 'MH TX FIFO Queue 2 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_TX_FQ1_IRQ', 1, 1, 'MH TX FIFO Queue 1 IRQ');
    defineField(reg.FUNC_ENA, v, 'MH_TX_FQ0_IRQ', 0, 0, 'MH TX FIFO Queue 0 IRQ');
    const f = reg.FUNC_ENA.fields;
    // 2. Report
    reg.FUNC_ENA.report.push({
      severityLevel: sevC.info,
      msg: `FUNC_ENA: ${reg.FUNC_ENA.name_long} (0x${reg.FUNC_ENA.addr !== undefined ? reg.FUNC_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `[28 -               ] Reserved                   = - \n`+
           `${ircRow(f.PRT_RX_EVT)}\n`+
           `${ircRow(f.PRT_TX_EVT)}\n`+
           `${ircRow(f.PRT_BUS_ON)}\n`+
           `${ircRow(f.PRT_E_ACTIVE)}\n`+
           `[23 -               ] Reserved                   = - \n`+
           `${ircRow(f.MH_STATS_IRQ)}\n`+
           `${ircRow(f.MH_RX_ABORT_IRQ)}\n`+
           `${ircRow(f.MH_TX_ABORT_IRQ)}\n`+
           `${ircRow(f.MH_TX_FILTER_IRQ)}\n`+
           `${ircRow(f.MH_RX_FILTER_IRQ)}\n`+
           `${ircRow(f.MH_STOP_IRQ)}\n`+
           `${ircRow(f.MH_TX_PQ_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ7_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ6_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ5_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ4_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ3_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ2_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ1_IRQ)}\n`+
           `${ircRow(f.MH_RX_FQ0_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ7_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ6_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ5_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ4_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ3_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ2_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ1_IRQ)}\n`+
           `${ircRow(f.MH_TX_FQ0_IRQ)}`
    });
  }

  // === ERR_ENA: Error Raw Event Enable ===========================
  if ('ERR_ENA' in reg && reg.ERR_ENA.int32 !== undefined) {
    const v = reg.ERR_ENA.int32;
    // 0. Extend structure
    reg.ERR_ENA.fields = {};
    reg.ERR_ENA.report = [];
    // 1. Decode (MSB->LSB) bits
    defineField(reg.ERR_ENA, v, 'TOP_MUX_TO_ERR', 28, 28, 'Top-Level Mux Timeout');
    defineField(reg.ERR_ENA, v, 'PRT_BUS_OFF', 23, 23, 'PRT Bus Off');
    defineField(reg.ERR_ENA, v, 'PRT_E_PASSIVE', 22, 22, 'PRT Error Passive');
    defineField(reg.ERR_ENA, v, 'PRT_BUS_ERR', 21, 21, 'PRT CAN Bus Error');
    defineField(reg.ERR_ENA, v, 'PRT_IFF_RQ', 20, 20, 'PRT Invalid Frame Format');
    defineField(reg.ERR_ENA, v, 'PRT_RX_DO', 19, 19, 'PRT RX Overflow');
    defineField(reg.ERR_ENA, v, 'PRT_TX_DU', 18, 18, 'PRT TX Underrun');
    defineField(reg.ERR_ENA, v, 'PRT_USOS', 17, 17, 'PRT Unexp. Start Of Seq');
    defineField(reg.ERR_ENA, v, 'PRT_ABORTED', 16, 16, 'PRT TX Sequence Aborted');
    defineField(reg.ERR_ENA, v, 'MH_MEM_TO_ERR', 13, 13, 'LMEM Timeout');
    defineField(reg.ERR_ENA, v, 'MH_WR_RESP_ERR', 12, 12, 'Write Response Bus Error');
    defineField(reg.ERR_ENA, v, 'MH_RD_RESP_ERR', 11, 11, 'Read Response Bus Error');
    defineField(reg.ERR_ENA, v, 'MH_DMA_CH_ERR', 10, 10, 'DMA Channel Routing Error');
    defineField(reg.ERR_ENA, v, 'MH_DMA_TO_ERR', 9, 9, 'DMA Timeout');
    defineField(reg.ERR_ENA, v, 'MH_DP_TO_ERR', 8, 8, 'Data Path Timeout');
    defineField(reg.ERR_ENA, v, 'MH_DP_DO_ERR', 7, 7, 'Data Path Overflow');
    defineField(reg.ERR_ENA, v, 'MH_DP_SEQ_ERR', 6, 6, 'Data Path Sequence Error');
    defineField(reg.ERR_ENA, v, 'MH_DP_PARITY_ERR', 5, 5, 'Data Path Parity Error');
    defineField(reg.ERR_ENA, v, 'MH_AP_PARITY_ERR', 4, 4, 'Address Pointer Parity Err');
    defineField(reg.ERR_ENA, v, 'MH_DESC_ERR', 3, 3, 'Descriptor Error');
    defineField(reg.ERR_ENA, v, 'MH_REG_CRC_ERR', 2, 2, 'Register Bank CRC Error');
    defineField(reg.ERR_ENA, v, 'MH_MEM_SFTY_ERR', 1, 1, 'Memory Safety Error');
    defineField(reg.ERR_ENA, v, 'MH_RX_FILTER_ERR', 0, 0, 'RX Filter Timeout/Error');
    const f = reg.ERR_ENA.fields;
    // 2. Report
    reg.ERR_ENA.report.push({
      severityLevel: sevC.info,
      msg: `ERR_ENA: ${reg.ERR_ENA.name_long} (0x${reg.ERR_ENA.addr !== undefined ? reg.ERR_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `${ircRow(f.TOP_MUX_TO_ERR)}\n`+
           `[27 -               ] Reserved                   = -\n`+
           `[26 -               ] Reserved                   = -\n`+
           `[25 -               ] Reserved                   = -\n`+
           `[24 -               ] Reserved                   = -\n`+
           `${ircRow(f.PRT_BUS_OFF)}\n`+
           `${ircRow(f.PRT_E_PASSIVE)}\n`+
           `${ircRow(f.PRT_BUS_ERR)}\n`+
           `${ircRow(f.PRT_IFF_RQ)}\n`+
           `${ircRow(f.PRT_RX_DO)}\n`+
           `${ircRow(f.PRT_TX_DU)}\n`+
           `${ircRow(f.PRT_USOS)}\n`+
           `${ircRow(f.PRT_ABORTED)}\n`+
           `[15 -               ] Reserved                   = -\n`+
           `[14 -               ] Reserved                   = -\n`+
           `${ircRow(f.MH_MEM_TO_ERR)}\n`+
           `${ircRow(f.MH_WR_RESP_ERR)}\n`+
           `${ircRow(f.MH_RD_RESP_ERR)}\n`+
           `${ircRow(f.MH_DMA_CH_ERR)}\n`+
           `${ircRow(f.MH_DMA_TO_ERR)}\n`+
           `${ircRow(f.MH_DP_TO_ERR)}\n`+
           `${ircRow(f.MH_DP_DO_ERR)}\n`+
           `${ircRow(f.MH_DP_SEQ_ERR)}\n`+
           `${ircRow(f.MH_DP_PARITY_ERR)}\n`+
           `${ircRow(f.MH_AP_PARITY_ERR)}\n`+
           `${ircRow(f.MH_DESC_ERR)}\n`+
           `${ircRow(f.MH_REG_CRC_ERR)}\n`+
           `${ircRow(f.MH_MEM_SFTY_ERR)}\n`+
           `${ircRow(f.MH_RX_FILTER_ERR)}`
    });
  }

  // === SAFETY_ENA: Safety Raw Event Enable =======================
  if ('SAFETY_ENA' in reg && reg.SAFETY_ENA.int32 !== undefined) {
    const v = reg.SAFETY_ENA.int32;
    // 0. Extend structure
    reg.SAFETY_ENA.fields = {};
    reg.SAFETY_ENA.report = [];
    // 1. Decode (MSB->LSB) bits
    defineField(reg.SAFETY_ENA, v, 'TOP_MUX_TO_ERR', 28, 28, 'Top-Level Mux Timeout');
    defineField(reg.SAFETY_ENA, v, 'PRT_BUS_OFF', 23, 23, 'PRT Bus Off');
    defineField(reg.SAFETY_ENA, v, 'PRT_E_PASSIVE', 22, 22, 'PRT Error Passive');
    defineField(reg.SAFETY_ENA, v, 'PRT_BUS_ERR', 21, 21, 'PRT CAN Bus Error');
    defineField(reg.SAFETY_ENA, v, 'PRT_IFF_RQ', 20, 20, 'PRT Invalid Frame Format');
    defineField(reg.SAFETY_ENA, v, 'PRT_RX_DO', 19, 19, 'PRT RX Overflow');
    defineField(reg.SAFETY_ENA, v, 'PRT_TX_DU', 18, 18, 'PRT TX Underrun');
    defineField(reg.SAFETY_ENA, v, 'PRT_USOS', 17, 17, 'PRT Unexpect. Start Of Seq');
    defineField(reg.SAFETY_ENA, v, 'PRT_ABORTED', 16, 16, 'PRT TX Sequence Aborted');
    defineField(reg.SAFETY_ENA, v, 'MH_MEM_TO_ERR', 13, 13, 'Local Memory Timeout');
    defineField(reg.SAFETY_ENA, v, 'MH_WR_RESP_ERR', 12, 12, 'Write Response Bus Error');
    defineField(reg.SAFETY_ENA, v, 'MH_RD_RESP_ERR', 11, 11, 'Read Response Bus Error');
    defineField(reg.SAFETY_ENA, v, 'MH_DMA_CH_ERR', 10, 10, 'DMA Channel Routing Error');
    defineField(reg.SAFETY_ENA, v, 'MH_DMA_TO_ERR', 9, 9, 'DMA Timeout');
    defineField(reg.SAFETY_ENA, v, 'MH_DP_TO_ERR', 8, 8, 'Data Path Timeout');
    defineField(reg.SAFETY_ENA, v, 'MH_DP_DO_ERR', 7, 7, 'Data Path Overflow');
    defineField(reg.SAFETY_ENA, v, 'MH_DP_SEQ_ERR', 6, 6, 'Data Path Sequence Error');
    defineField(reg.SAFETY_ENA, v, 'MH_DP_PARITY_ERR', 5, 5, 'Data Path Parity Error');
    defineField(reg.SAFETY_ENA, v, 'MH_AP_PARITY_ERR', 4, 4, 'Address Pointer Parity Err');
    defineField(reg.SAFETY_ENA, v, 'MH_DESC_ERR', 3, 3, 'Descriptor Error');
    defineField(reg.SAFETY_ENA, v, 'MH_REG_CRC_ERR', 2, 2, 'Register Bank CRC Error');
    defineField(reg.SAFETY_ENA, v, 'MH_MEM_SFTY_ERR', 1, 1, 'Memory Safety Error');
    defineField(reg.SAFETY_ENA, v, 'MH_RX_FILTER_ERR', 0, 0, 'RX Filter Timeout/Error');
    const f = reg.SAFETY_ENA.fields;
    // 2. Report
    reg.SAFETY_ENA.report.push({
      severityLevel: sevC.info,
      msg: `SAFETY_ENA: ${reg.SAFETY_ENA.name_long} (0x${reg.SAFETY_ENA.addr !== undefined ? reg.SAFETY_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = -\n`+
           `[30 -               ] Reserved                   = -\n`+
           `[29 -               ] Reserved                   = -\n`+
           `${ircRow(f.TOP_MUX_TO_ERR)}\n`+
           `[27 -               ] Reserved                   = -\n`+
           `[26 -               ] Reserved                   = -\n`+
           `[25 -               ] Reserved                   = -\n`+
           `[24 -               ] Reserved                   = -\n`+
           `${ircRow(f.PRT_BUS_OFF)}\n`+
           `${ircRow(f.PRT_E_PASSIVE)}\n`+
           `${ircRow(f.PRT_BUS_ERR)}\n`+
           `${ircRow(f.PRT_IFF_RQ)}\n`+
           `${ircRow(f.PRT_RX_DO)}\n`+
           `${ircRow(f.PRT_TX_DU)}\n`+
           `${ircRow(f.PRT_USOS)}\n`+
           `${ircRow(f.PRT_ABORTED)}\n`+
           `[15 -               ] Reserved                   = -\n`+
           `[14 -               ] Reserved                   = -\n`+
           `${ircRow(f.MH_MEM_TO_ERR)}\n`+
           `${ircRow(f.MH_WR_RESP_ERR)}\n`+
           `${ircRow(f.MH_RD_RESP_ERR)}\n`+
           `${ircRow(f.MH_DMA_CH_ERR)}\n`+
           `${ircRow(f.MH_DMA_TO_ERR)}\n`+
           `${ircRow(f.MH_DP_TO_ERR)}\n`+
           `${ircRow(f.MH_DP_DO_ERR)}\n`+
           `${ircRow(f.MH_DP_SEQ_ERR)}\n`+
           `${ircRow(f.MH_DP_PARITY_ERR)}\n`+
           `${ircRow(f.MH_AP_PARITY_ERR)}\n`+
           `${ircRow(f.MH_DESC_ERR)}\n`+
           `${ircRow(f.MH_REG_CRC_ERR)}\n`+
           `${ircRow(f.MH_MEM_SFTY_ERR)}\n`+
           `${ircRow(f.MH_RX_FILTER_ERR)}`
    });
  }

  // Summary for FUNC IR
  // === FUNC_IRQ_SUMMARY: Summary of Functional IRQs (RAW vs ENA) ===
  if (reg.FUNC_RAW && reg.FUNC_RAW.fields && reg.FUNC_ENA && reg.FUNC_ENA.fields) {
    const defs = [
      {bit:27, key:'PRT_RX_EVT'},
      {bit:26, key:'PRT_TX_EVT'},
      {bit:25, key:'PRT_BUS_ON'},
      {bit:24, key:'PRT_E_ACTIVE'},
      {bit:22, key:'MH_STATS_IRQ'},
      {bit:21, key:'MH_RX_ABORT_IRQ'},
      {bit:20, key:'MH_TX_ABORT_IRQ'},
      {bit:19, key:'MH_TX_FILTER_IRQ'},
      {bit:18, key:'MH_RX_FILTER_IRQ'},
      {bit:17, key:'MH_STOP_IRQ'},
      {bit:16, key:'MH_TX_PQ_IRQ'},
      {bit:15, key:'MH_RX_FQ7_IRQ'},
      {bit:14, key:'MH_RX_FQ6_IRQ'},
      {bit:13, key:'MH_RX_FQ5_IRQ'},
      {bit:12, key:'MH_RX_FQ4_IRQ'},
      {bit:11, key:'MH_RX_FQ3_IRQ'},
      {bit:10, key:'MH_RX_FQ2_IRQ'},
      {bit: 9, key:'MH_RX_FQ1_IRQ'},
      {bit: 8, key:'MH_RX_FQ0_IRQ'},
      {bit: 7, key:'MH_TX_FQ7_IRQ'},
      {bit: 6, key:'MH_TX_FQ6_IRQ'},
      {bit: 5, key:'MH_TX_FQ5_IRQ'},
      {bit: 4, key:'MH_TX_FQ4_IRQ'},
      {bit: 3, key:'MH_TX_FQ3_IRQ'},
      {bit: 2, key:'MH_TX_FQ2_IRQ'},
      {bit: 1, key:'MH_TX_FQ1_IRQ'},
      {bit: 0, key:'MH_TX_FQ0_IRQ'},
    ];
    const enabled = defs.filter(d => reg.FUNC_ENA.fields[d.key].value === 1);
    const nameWidth = Math.max(4, ...enabled.map(e => e.key.length));
    let lines = '';
    if (enabled.length === 0) {
      lines = 'No FUNC interrupts enabled (all ENA bits = 0)';
    } else {
      lines = enabled.map(d => {
        const rawV = reg.FUNC_RAW.fields[d.key].value;
        const enaV = reg.FUNC_ENA.fields[d.key].value;
        return `${d.bit.toString().padStart(2, ' ')}   ${d.key.padEnd(nameWidth,' ')}  ${String(rawV).padStart(1,' ')}   ${String(enaV).padStart(1,' ')}`;
      }).join('\n');
    }
    reg.FUNC_ENA = reg.FUNC_ENA || { report: [] };
    reg.FUNC_ENA.report.push({
      severityLevel: sevC.infoBold,
      msg: `FUNC Interrupt Summary (only enabled IRs)\n`+
           `Bit  Name${' '.repeat(nameWidth-4)}  RAW ENA\n`+
           `${lines}`
    });
  }

  // Summary for ERR IR
  if (reg.ERR_RAW && reg.ERR_RAW.fields && reg.ERR_ENA && reg.ERR_ENA.fields) {
    const defsErr = [
      {bit:28,key:'TOP_MUX_TO_ERR'},
      {bit:23,key:'PRT_BUS_OFF'},
      {bit:22,key:'PRT_E_PASSIVE'},
      {bit:21,key:'PRT_BUS_ERR'},
      {bit:20,key:'PRT_IFF_RQ'},
      {bit:19,key:'PRT_RX_DO'},
      {bit:18,key:'PRT_TX_DU'},
      {bit:17,key:'PRT_USOS'},
      {bit:16,key:'PRT_ABORTED'},
      {bit:13,key:'MH_MEM_TO_ERR'},
      {bit:12,key:'MH_WR_RESP_ERR'},
      {bit:11,key:'MH_RD_RESP_ERR'},
      {bit:10,key:'MH_DMA_CH_ERR'},
      {bit: 9,key:'MH_DMA_TO_ERR'},
      {bit: 8,key:'MH_DP_TO_ERR'},
      {bit: 7,key:'MH_DP_DO_ERR'},
      {bit: 6,key:'MH_DP_SEQ_ERR'},
      {bit: 5,key:'MH_DP_PARITY_ERR'},
      {bit: 4,key:'MH_AP_PARITY_ERR'},
      {bit: 3,key:'MH_DESC_ERR'},
      {bit: 2,key:'MH_REG_CRC_ERR'},
      {bit: 1,key:'MH_MEM_SFTY_ERR'},
      {bit: 0,key:'MH_RX_FILTER_ERR'},
    ];
    const enabledErr = defsErr.filter(d => reg.ERR_ENA.fields[d.key].value === 1);
    const nameWidthErr = Math.max(4, ...enabledErr.map(e => e.key.length));
    let linesErr;
    if (enabledErr.length === 0) {
      linesErr = 'No ERR interrupts enabled (all ENA bits = 0)';
    } else {
      linesErr = enabledErr.map(d => {
        const rawV = reg.ERR_RAW.fields[d.key].value;
        const enaV = reg.ERR_ENA.fields[d.key].value;
        return `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthErr,' ')}  ${String(rawV)}   ${String(enaV)}`;
      }).join('\n');
    }
    reg.ERR_ENA.report.push({
      severityLevel: sevC.infoBold,
      msg: `ERR Interrupt Summary (only enabled IRs)\n`+
           `Bit  Name${' '.repeat(nameWidthErr-4)}  RAW ENA\n`+
           `${linesErr}`
    });
  }

  // Summary for SAFETY IR
  if (reg.SAFETY_RAW && reg.SAFETY_RAW.fields && reg.SAFETY_ENA && reg.SAFETY_ENA.fields) {
    const defsSafety = [
      {bit:28,key:'TOP_MUX_TO_ERR'},
      {bit:23,key:'PRT_BUS_OFF'},
      {bit:22,key:'PRT_E_PASSIVE'},
      {bit:21,key:'PRT_BUS_ERR'},
      {bit:20,key:'PRT_IFF_RQ'},
      {bit:19,key:'PRT_RX_DO'},
      {bit:18,key:'PRT_TX_DU'},
      {bit:17,key:'PRT_USOS'},
      {bit:16,key:'PRT_ABORTED'},
      {bit:13,key:'MH_MEM_TO_ERR'},
      {bit:12,key:'MH_WR_RESP_ERR'},
      {bit:11,key:'MH_RD_RESP_ERR'},
      {bit:10,key:'MH_DMA_CH_ERR'},
      {bit: 9,key:'MH_DMA_TO_ERR'},
      {bit: 8,key:'MH_DP_TO_ERR'},
      {bit: 7,key:'MH_DP_DO_ERR'},
      {bit: 6,key:'MH_DP_SEQ_ERR'},
      {bit: 5,key:'MH_DP_PARITY_ERR'},
      {bit: 4,key:'MH_AP_PARITY_ERR'},
      {bit: 3,key:'MH_DESC_ERR'},
      {bit: 2,key:'MH_REG_CRC_ERR'},
      {bit: 1,key:'MH_MEM_SFTY_ERR'},
      {bit: 0,key:'MH_RX_FILTER_ERR'},
    ];
    const enabledSaf = defsSafety.filter(d => reg.SAFETY_ENA.fields[d.key].value === 1);
    const nameWidthSaf = Math.max(4, ...enabledSaf.map(e => e.key.length));
    let linesSaf;
    if (enabledSaf.length === 0) {
      linesSaf = 'No SAFETY interrupts enabled (all ENA bits = 0)';
    } else {
      linesSaf = enabledSaf.map(d => {
        const rawV = reg.SAFETY_RAW.fields[d.key].value;
        const enaV = reg.SAFETY_ENA.fields[d.key].value;
        return `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthSaf,' ')}  ${String(rawV)}   ${String(enaV)}`;
      }).join('\n');
    }
    reg.SAFETY_ENA.report.push({
      severityLevel: sevC.infoBold,
      msg: `SAFETY Interrupt Summary (only enabled IRs)\n`+
           `Bit  Name${' '.repeat(nameWidthSaf-4)}  RAW ENA\n`+
           `${linesSaf}`
    });
  }

  // add new registers here

  // === CAPTURING_MODE: IRC Capturing Mode Configuration =========
  if ('CAPTURING_MODE' in reg && reg.CAPTURING_MODE.int32 !== undefined) {
    const v = reg.CAPTURING_MODE.int32;
    // 0. Extend structure
    reg.CAPTURING_MODE.fields = {};
    reg.CAPTURING_MODE.report = [];
    // 1. Decode (MSB->LSB) Bits 2..0
    defineField(reg.CAPTURING_MODE, v, 'SAFETY', 2, 2, 'SAFETY RAW input flag Capturing Mode');
    defineField(reg.CAPTURING_MODE, v, 'ERR', 1, 1, 'ERR    RAW input flag Capturing Mode');
    defineField(reg.CAPTURING_MODE, v, 'FUNC', 0, 0, 'FUNC   RAW input flag Capturing Mode');
    const f = reg.CAPTURING_MODE.fields;
    const modeStr = (b)=> b? 'Edge' : 'Level';
    const expected = 0x7;
    // 2. Report
    reg.CAPTURING_MODE.report.push({
      severityLevel: sevC.info,
      msg: `CAPTURING_MODE: ${reg.CAPTURING_MODE.name_long} (0x${reg.CAPTURING_MODE.addr !== undefined ? reg.CAPTURING_MODE.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `Expected fixed value: 0x${expected.toString(16).toUpperCase()} (all Edge).${v!==expected? ' (NOTE: Value differs from expected !)':''}\n`+
           `[${f.SAFETY.name_short.padEnd(7)}] ${f.SAFETY.name_long} = ${f.SAFETY.value} (${modeStr(f.SAFETY.value)})\n`+
           `[${f.ERR.name_short.padEnd(7)}] ${f.ERR.name_long} = ${f.ERR.value} (${modeStr(f.ERR.value)})\n`+
           `[${f.FUNC.name_short.padEnd(7)}] ${f.FUNC.name_long} = ${f.FUNC.value} (${modeStr(f.FUNC.value)})`
    });
  }

  // === HDP: Hardware Debug Port Control =========================
  if ('HDP' in reg && reg.HDP.int32 !== undefined) {
    const v = reg.HDP.int32;
    // 0. Extend structure
    reg.HDP.fields = {};
    reg.HDP.report = [];
    // 1. Decode (only bit 0 used)
    defineField(reg.HDP, v, 'HDP_SEL', 0, 0, 'HDP Select (0=MH, 1=PRT)'); // 0 = Message Handler, 1 = Protocol Controller
    const f = reg.HDP.fields;
    // 2. Report
    reg.HDP.report.push({
      severityLevel: sevC.info,
      msg: `HDP: ${reg.HDP.name_long} (0x${reg.HDP.addr !== undefined ? reg.HDP.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[${f.HDP_SEL.name_short.padEnd(7)}] ${f.HDP_SEL.name_long} = ${f.HDP_SEL.value} (${f.HDP_SEL.value? 'PRT selected':'MH selected'})`
    });
  }

} // IRC