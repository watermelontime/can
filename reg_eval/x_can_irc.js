// X_CAN: MH register decoding
import { getBits } from './help_functions.js';
import { sevC } from './help_functions.js';
import { getBinaryLineData } from './help_functions.js';

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
    reg.FUNC_RAW.fields.PRT_RX_EVT       = getBits(v,27,27);
    reg.FUNC_RAW.fields.PRT_TX_EVT       = getBits(v,26,26);
    reg.FUNC_RAW.fields.PRT_BUS_ON       = getBits(v,25,25);
    reg.FUNC_RAW.fields.PRT_E_ACTIVE     = getBits(v,24,24);

    reg.FUNC_RAW.fields.MH_STATS_IRQ     = getBits(v,22,22);
    reg.FUNC_RAW.fields.MH_RX_ABORT_IRQ  = getBits(v,21,21);
    reg.FUNC_RAW.fields.MH_TX_ABORT_IRQ  = getBits(v,20,20);
    reg.FUNC_RAW.fields.MH_TX_FILTER_IRQ = getBits(v,19,19);
    reg.FUNC_RAW.fields.MH_RX_FILTER_IRQ = getBits(v,18,18);
    reg.FUNC_RAW.fields.MH_STOP_IRQ      = getBits(v,17,17);
    reg.FUNC_RAW.fields.MH_TX_PQ_IRQ     = getBits(v,16,16);
    // RX FIFO Queue IRQs 15..8
    reg.FUNC_RAW.fields.MH_RX_FQ7_IRQ    = getBits(v,15,15);
    reg.FUNC_RAW.fields.MH_RX_FQ6_IRQ    = getBits(v,14,14);
    reg.FUNC_RAW.fields.MH_RX_FQ5_IRQ    = getBits(v,13,13);
    reg.FUNC_RAW.fields.MH_RX_FQ4_IRQ    = getBits(v,12,12);
    reg.FUNC_RAW.fields.MH_RX_FQ3_IRQ    = getBits(v,11,11);
    reg.FUNC_RAW.fields.MH_RX_FQ2_IRQ    = getBits(v,10,10);
    reg.FUNC_RAW.fields.MH_RX_FQ1_IRQ    = getBits(v,9,9);
    reg.FUNC_RAW.fields.MH_RX_FQ0_IRQ    = getBits(v,8,8);
    // TX FIFO Queue IRQs 7..0
    reg.FUNC_RAW.fields.MH_TX_FQ7_IRQ    = getBits(v,7,7);
    reg.FUNC_RAW.fields.MH_TX_FQ6_IRQ    = getBits(v,6,6);
    reg.FUNC_RAW.fields.MH_TX_FQ5_IRQ    = getBits(v,5,5);
    reg.FUNC_RAW.fields.MH_TX_FQ4_IRQ    = getBits(v,4,4);
    reg.FUNC_RAW.fields.MH_TX_FQ3_IRQ    = getBits(v,3,3);
    reg.FUNC_RAW.fields.MH_TX_FQ2_IRQ    = getBits(v,2,2);
    reg.FUNC_RAW.fields.MH_TX_FQ1_IRQ    = getBits(v,1,1);
    reg.FUNC_RAW.fields.MH_TX_FQ0_IRQ    = getBits(v,0,0);
    // 2. Report
    reg.FUNC_RAW.report.push({
      severityLevel: sevC.info,
      msg: `FUNC_RAW: ${reg.FUNC_RAW.name_long} (0x${reg.FUNC_RAW.addr !== undefined ? reg.FUNC_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `[28 -               ] Reserved                   = - \n`+
           `[27 PRT_RX_EVT      ] PRT RX CAN Message         = ${reg.FUNC_RAW.fields.PRT_RX_EVT}\n`+
           `[26 PRT_TX_EVT      ] PRT TX CAN Message         = ${reg.FUNC_RAW.fields.PRT_TX_EVT}\n`+
           `[25 PRT_BUS_ON      ] PRT Bus-On Event           = ${reg.FUNC_RAW.fields.PRT_BUS_ON}\n`+
           `[24 PRT_E_ACTIVE    ] PRT Error-Active Event     = ${reg.FUNC_RAW.fields.PRT_E_ACTIVE}\n`+
           `[23 -               ] Reserved                   = - \n`+
           `[22 MH_STATS_IRQ    ] MH Statistics Counter Wrap = ${reg.FUNC_RAW.fields.MH_STATS_IRQ}\n`+
           `[21 MH_RX_ABORT_IRQ ] MH RX Abort (PRT/MH IF)    = ${reg.FUNC_RAW.fields.MH_RX_ABORT_IRQ}\n`+
           `[20 MH_TX_ABORT_IRQ ] MH TX Abort (PRT/MH IF)    = ${reg.FUNC_RAW.fields.MH_TX_ABORT_IRQ}\n`+
           `[19 MH_TX_FILTER_IRQ] MH TX Filter Reject        = ${reg.FUNC_RAW.fields.MH_TX_FILTER_IRQ}\n`+
           `[18 MH_RX_FILTER_IRQ] MH RX Filter Match         = ${reg.FUNC_RAW.fields.MH_RX_FILTER_IRQ}\n`+
           `[17 MH_STOP_IRQ     ] MH Stop Event              = ${reg.FUNC_RAW.fields.MH_STOP_IRQ}\n`+
           `[16 MH_TX_PQ_IRQ    ] MH TX Prio Queue Event     = ${reg.FUNC_RAW.fields.MH_TX_PQ_IRQ}\n`+
           `[15 MH_RX_FQ7_IRQ   ] MH RX FIFO Queue 7 IRQ     = ${reg.FUNC_RAW.fields.MH_RX_FQ7_IRQ}\n`+
           `[14 MH_RX_FQ6_IRQ   ] MH RX FIFO Queue 6 IRQ     = ${reg.FUNC_RAW.fields.MH_RX_FQ6_IRQ}\n`+
           `[13 MH_RX_FQ5_IRQ   ] MH RX FIFO Queue 5 IRQ     = ${reg.FUNC_RAW.fields.MH_RX_FQ5_IRQ}\n`+
           `[12 MH_RX_FQ4_IRQ   ] MH RX FIFO Queue 4 IRQ     = ${reg.FUNC_RAW.fields.MH_RX_FQ4_IRQ}\n`+
           `[11 MH_RX_FQ3_IRQ   ] MH RX FIFO Queue 3 IRQ     = ${reg.FUNC_RAW.fields.MH_RX_FQ3_IRQ}\n`+
           `[10 MH_RX_FQ2_IRQ   ] MH RX FIFO Queue 2 IRQ     = ${reg.FUNC_RAW.fields.MH_RX_FQ2_IRQ}\n`+
           `[ 9 MH_RX_FQ1_IRQ   ] MH RX FIFO Queue 1 IRQ     = ${reg.FUNC_RAW.fields.MH_RX_FQ1_IRQ}\n`+
           `[ 8 MH_RX_FQ0_IRQ   ] MH RX FIFO Queue 0 IRQ     = ${reg.FUNC_RAW.fields.MH_RX_FQ0_IRQ}\n`+
           `[ 7 MH_TX_FQx_IRQ   ] MH TX FIFO Queue 7 IRQ     = ${reg.FUNC_RAW.fields.MH_TX_FQ7_IRQ}\n`+
           `[ 6 MH_TX_FQ6_IRQ   ] MH TX FIFO Queue 6 IRQ     = ${reg.FUNC_RAW.fields.MH_TX_FQ6_IRQ}\n`+
           `[ 5 MH_TX_FQ5_IRQ   ] MH TX FIFO Queue 5 IRQ     = ${reg.FUNC_RAW.fields.MH_TX_FQ5_IRQ}\n`+
           `[ 4 MH_TX_FQ4_IRQ   ] MH TX FIFO Queue 4 IRQ     = ${reg.FUNC_RAW.fields.MH_TX_FQ4_IRQ}\n`+
           `[ 3 MH_TX_FQ3_IRQ   ] MH TX FIFO Queue 3 IRQ     = ${reg.FUNC_RAW.fields.MH_TX_FQ3_IRQ}\n`+
           `[ 2 MH_TX_FQ2_IRQ   ] MH TX FIFO Queue 2 IRQ     = ${reg.FUNC_RAW.fields.MH_TX_FQ2_IRQ}\n`+
           `[ 1 MH_TX_FQ1_IRQ   ] MH TX FIFO Queue 1 IRQ     = ${reg.FUNC_RAW.fields.MH_TX_FQ1_IRQ}\n`+
           `[ 0 MH_TX_FQ0_IRQ   ] MH TX FIFO Queue 0 IRQ     = ${reg.FUNC_RAW.fields.MH_TX_FQ0_IRQ}`
    });
  }

  // === ERR_RAW: Error Raw Event Status ============================
  if ('ERR_RAW' in reg && reg.ERR_RAW.int32 !== undefined) {
    const v = reg.ERR_RAW.int32;
    // 0. Extend structure
    reg.ERR_RAW.fields = {};
    reg.ERR_RAW.report = [];
    // 1. Decode (MSB->LSB) (31..0) per updated specification
    reg.ERR_RAW.fields.TOP_MUX_TO_ERR   = getBits(v,28,28);

    reg.ERR_RAW.fields.PRT_BUS_OFF      = getBits(v,23,23);
    reg.ERR_RAW.fields.PRT_E_PASSIVE    = getBits(v,22,22);
    reg.ERR_RAW.fields.PRT_BUS_ERR      = getBits(v,21,21);
    reg.ERR_RAW.fields.PRT_IFF_RQ       = getBits(v,20,20);
    reg.ERR_RAW.fields.PRT_RX_DO        = getBits(v,19,19);
    reg.ERR_RAW.fields.PRT_TX_DU        = getBits(v,18,18);
    reg.ERR_RAW.fields.PRT_USOS         = getBits(v,17,17);
    reg.ERR_RAW.fields.PRT_ABORTED      = getBits(v,16,16);

    reg.ERR_RAW.fields.MH_MEM_TO_ERR    = getBits(v,13,13);
    reg.ERR_RAW.fields.MH_WR_RESP_ERR   = getBits(v,12,12);
    reg.ERR_RAW.fields.MH_RD_RESP_ERR   = getBits(v,11,11);
    reg.ERR_RAW.fields.MH_DMA_CH_ERR    = getBits(v,10,10);
    reg.ERR_RAW.fields.MH_DMA_TO_ERR    = getBits(v,9,9);
    reg.ERR_RAW.fields.MH_DP_TO_ERR     = getBits(v,8,8);
    reg.ERR_RAW.fields.MH_DP_DO_ERR     = getBits(v,7,7);
    reg.ERR_RAW.fields.MH_DP_SEQ_ERR    = getBits(v,6,6);
    reg.ERR_RAW.fields.MH_DP_PARITY_ERR = getBits(v,5,5);
    reg.ERR_RAW.fields.MH_AP_PARITY_ERR = getBits(v,4,4);
    reg.ERR_RAW.fields.MH_DESC_ERR      = getBits(v,3,3);
    reg.ERR_RAW.fields.MH_REG_CRC_ERR   = getBits(v,2,2);
    reg.ERR_RAW.fields.MH_MEM_SFTY_ERR  = getBits(v,1,1);
    reg.ERR_RAW.fields.MH_RX_FILTER_ERR = getBits(v,0,0);
    // 2. Report
    reg.ERR_RAW.report.push({
      severityLevel: sevC.info,
      msg: `ERR_RAW: ${reg.ERR_RAW.name_long} (0x${reg.ERR_RAW.addr !== undefined ? reg.ERR_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `[28 TOP_MUX_TO_ERR  ] Top-Level Mux Timeout      = ${reg.ERR_RAW.fields.TOP_MUX_TO_ERR}\n`+
           `[27 -               ] Reserved                   = -\n`+
           `[26 -               ] Reserved                   = -\n`+
           `[25 -               ] Reserved                   = -\n`+
           `[24 -               ] Reserved                   = -\n`+
           `[23 PRT_BUS_OFF     ] PRT Bus Off                = ${reg.ERR_RAW.fields.PRT_BUS_OFF}\n`+
           `[22 PRT_E_PASSIVE   ] PRT Error Passive          = ${reg.ERR_RAW.fields.PRT_E_PASSIVE}\n`+
           `[21 PRT_BUS_ERR     ] PRT CAN Bus Error          = ${reg.ERR_RAW.fields.PRT_BUS_ERR}\n`+
           `[20 PRT_IFF_RQ      ] PRT Invalid Frame Format   = ${reg.ERR_RAW.fields.PRT_IFF_RQ}\n`+
           `[19 PRT_RX_DO       ] PRT RX Overflow            = ${reg.ERR_RAW.fields.PRT_RX_DO}\n`+
           `[18 PRT_TX_DU       ] PRT TX Underrun            = ${reg.ERR_RAW.fields.PRT_TX_DU}\n`+
           `[17 PRT_USOS        ] PRT Unexp. Start Of Seq    = ${reg.ERR_RAW.fields.PRT_USOS}\n`+
           `[16 PRT_ABORTED     ] PRT TX Sequence Aborted    = ${reg.ERR_RAW.fields.PRT_ABORTED}\n`+
           `[15 -               ] Reserved                   = -\n`+
           `[14 -               ] Reserved                   = -\n`+
           `[13 MH_MEM_TO_ERR   ] LMEM Timeout               = ${reg.ERR_RAW.fields.MH_MEM_TO_ERR}\n`+
           `[12 MH_WR_RESP_ERR  ] Write Response Bus Error   = ${reg.ERR_RAW.fields.MH_WR_RESP_ERR}\n`+
           `[11 MH_RD_RESP_ERR  ] Read Response Bus Error    = ${reg.ERR_RAW.fields.MH_RD_RESP_ERR}\n`+
           `[10 MH_DMA_CH_ERR   ] DMA Channel Routing Error  = ${reg.ERR_RAW.fields.MH_DMA_CH_ERR}\n`+
           `[ 9 MH_DMA_TO_ERR   ] DMA Timeout                = ${reg.ERR_RAW.fields.MH_DMA_TO_ERR}\n`+
           `[ 8 MH_DP_TO_ERR    ] Data Path Timeout          = ${reg.ERR_RAW.fields.MH_DP_TO_ERR}\n`+
           `[ 7 MH_DP_DO_ERR    ] Data Path Overflow         = ${reg.ERR_RAW.fields.MH_DP_DO_ERR}\n`+
           `[ 6 MH_DP_SEQ_ERR   ] Data Path Sequence Error   = ${reg.ERR_RAW.fields.MH_DP_SEQ_ERR}\n`+
           `[ 5 MH_DP_PARITY_ERR] Data Path Parity Error     = ${reg.ERR_RAW.fields.MH_DP_PARITY_ERR}\n`+
           `[ 4 MH_AP_PARITY_ERR] Address Pointer Parity Err = ${reg.ERR_RAW.fields.MH_AP_PARITY_ERR}\n`+
           `[ 3 MH_DESC_ERR     ] Descriptor Error           = ${reg.ERR_RAW.fields.MH_DESC_ERR}\n`+
           `[ 2 MH_REG_CRC_ERR  ] Register Bank CRC Error    = ${reg.ERR_RAW.fields.MH_REG_CRC_ERR}\n`+
           `[ 1 MH_MEM_SFTY_ERR ] Memory Safety Error        = ${reg.ERR_RAW.fields.MH_MEM_SFTY_ERR}\n`+
           `[ 0 MH_RX_FILTER_ERR] RX Filter Timeout/Error    = ${reg.ERR_RAW.fields.MH_RX_FILTER_ERR}`
    });
  }

  // === SAFETY_RAW: Safety Raw Event Status ========================
  if ('SAFETY_RAW' in reg && reg.SAFETY_RAW.int32 !== undefined) {
    const v = reg.SAFETY_RAW.int32;
    // 0. Extend structure
    reg.SAFETY_RAW.fields = {};
    reg.SAFETY_RAW.report = [];
    // 1. Decode (MSB->LSB) 28..0
    reg.SAFETY_RAW.fields.TOP_MUX_TO_ERR = getBits(v,28,28);

    reg.SAFETY_RAW.fields.PRT_BUS_OFF      = getBits(v,23,23);
    reg.SAFETY_RAW.fields.PRT_E_PASSIVE    = getBits(v,22,22);
    reg.SAFETY_RAW.fields.PRT_BUS_ERR      = getBits(v,21,21);
    reg.SAFETY_RAW.fields.PRT_IFF_RQ       = getBits(v,20,20);
    reg.SAFETY_RAW.fields.PRT_RX_DO        = getBits(v,19,19);
    reg.SAFETY_RAW.fields.PRT_TX_DU        = getBits(v,18,18);
    reg.SAFETY_RAW.fields.PRT_USOS         = getBits(v,17,17);
    reg.SAFETY_RAW.fields.PRT_ABORTED      = getBits(v,16,16);
  
    reg.SAFETY_RAW.fields.MH_MEM_TO_ERR    = getBits(v,13,13);
    reg.SAFETY_RAW.fields.MH_WR_RESP_ERR   = getBits(v,12,12);
    reg.SAFETY_RAW.fields.MH_RD_RESP_ERR   = getBits(v,11,11);
    reg.SAFETY_RAW.fields.MH_DMA_CH_ERR    = getBits(v,10,10);
    reg.SAFETY_RAW.fields.MH_DMA_TO_ERR    = getBits(v,9,9);
    reg.SAFETY_RAW.fields.MH_DP_TO_ERR     = getBits(v,8,8);
    reg.SAFETY_RAW.fields.MH_DP_DO_ERR     = getBits(v,7,7);
    reg.SAFETY_RAW.fields.MH_DP_SEQ_ERR    = getBits(v,6,6);
    reg.SAFETY_RAW.fields.MH_DP_PARITY_ERR = getBits(v,5,5);
    reg.SAFETY_RAW.fields.MH_AP_PARITY_ERR = getBits(v,4,4);
    reg.SAFETY_RAW.fields.MH_DESC_ERR      = getBits(v,3,3);
    reg.SAFETY_RAW.fields.MH_REG_CRC_ERR   = getBits(v,2,2);
    reg.SAFETY_RAW.fields.MH_MEM_SFTY_ERR  = getBits(v,1,1);
    reg.SAFETY_RAW.fields.MH_RX_FILTER_ERR = getBits(v,0,0);
    // 2. Report
    reg.SAFETY_RAW.report.push({
      severityLevel: sevC.info,
      msg: `SAFETY_RAW: ${reg.SAFETY_RAW.name_long} (0x${reg.SAFETY_RAW.addr !== undefined ? reg.SAFETY_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `[28 TOP_MUX_TO_ERR  ] Top-Level Mux Timeout      = ${reg.SAFETY_RAW.fields.TOP_MUX_TO_ERR}\n`+
           `[27 -               ] Reserved                   = -\n`+
           `[26 -               ] Reserved                   = -\n`+
           `[25 -               ] Reserved                   = -\n`+
           `[24 -               ] Reserved                   = -\n`+
           `[23 PRT_BUS_OFF     ] PRT Bus Off                = ${reg.SAFETY_RAW.fields.PRT_BUS_OFF}\n`+
           `[22 PRT_E_PASSIVE   ] PRT Error Passive          = ${reg.SAFETY_RAW.fields.PRT_E_PASSIVE}\n`+
           `[21 PRT_BUS_ERR     ] PRT CAN Bus Error          = ${reg.SAFETY_RAW.fields.PRT_BUS_ERR}\n`+
           `[20 PRT_IFF_RQ      ] PRT Invalid Frame Format   = ${reg.SAFETY_RAW.fields.PRT_IFF_RQ}\n`+
           `[19 PRT_RX_DO       ] PRT RX Overflow            = ${reg.SAFETY_RAW.fields.PRT_RX_DO}\n`+
           `[18 PRT_TX_DU       ] PRT TX Underrun            = ${reg.SAFETY_RAW.fields.PRT_TX_DU}\n`+
           `[17 PRT_USOS        ] PRT Unexpect. Start Of Seq = ${reg.SAFETY_RAW.fields.PRT_USOS}\n`+
           `[16 PRT_ABORTED     ] PRT TX Sequence Aborted    = ${reg.SAFETY_RAW.fields.PRT_ABORTED}\n`+
           `[15 -               ] Reserved                   = -\n`+
           `[14 -               ] Reserved                   = -\n`+
           `[13 MH_MEM_TO_ERR   ] Local Memory Timeout       = ${reg.SAFETY_RAW.fields.MH_MEM_TO_ERR}\n`+
           `[12 MH_WR_RESP_ERR  ] Write Response Bus Error   = ${reg.SAFETY_RAW.fields.MH_WR_RESP_ERR}\n`+
           `[11 MH_RD_RESP_ERR  ] Read Response Bus Error    = ${reg.SAFETY_RAW.fields.MH_RD_RESP_ERR}\n`+
           `[10 MH_DMA_CH_ERR   ] DMA Channel Routing Error  = ${reg.SAFETY_RAW.fields.MH_DMA_CH_ERR}\n`+
           `[ 9 MH_DMA_TO_ERR   ] DMA Timeout                = ${reg.SAFETY_RAW.fields.MH_DMA_TO_ERR}\n`+
           `[ 8 MH_DP_TO_ERR    ] Data Path Timeout          = ${reg.SAFETY_RAW.fields.MH_DP_TO_ERR}\n`+
           `[ 7 MH_DP_DO_ERR    ] Data Path Overflow         = ${reg.SAFETY_RAW.fields.MH_DP_DO_ERR}\n`+
           `[ 6 MH_DP_SEQ_ERR   ] Data Path Sequence Error   = ${reg.SAFETY_RAW.fields.MH_DP_SEQ_ERR}\n`+
           `[ 5 MH_DP_PARITY_ERR] Data Path Parity Error     = ${reg.SAFETY_RAW.fields.MH_DP_PARITY_ERR}\n`+
           `[ 4 MH_AP_PARITY_ERR] Address Pointer Parity Err = ${reg.SAFETY_RAW.fields.MH_AP_PARITY_ERR}\n`+
           `[ 3 MH_DESC_ERR     ] Descriptor Error           = ${reg.SAFETY_RAW.fields.MH_DESC_ERR}\n`+
           `[ 2 MH_REG_CRC_ERR  ] Register Bank CRC Error    = ${reg.SAFETY_RAW.fields.MH_REG_CRC_ERR}\n`+
           `[ 1 MH_MEM_SFTY_ERR ] Memory Safety Error        = ${reg.SAFETY_RAW.fields.MH_MEM_SFTY_ERR}\n`+
           `[ 0 MH_RX_FILTER_ERR] RX Filter Timeout/Error    = ${reg.SAFETY_RAW.fields.MH_RX_FILTER_ERR}`
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
    reg.FUNC_CLR.fields.BITS = v;
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
    reg.ERR_CLR.fields.BITS = v;
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
    reg.SAFETY_CLR.fields.BITS = v;
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
    reg.FUNC_ENA.fields.PRT_RX_EVT       = getBits(v,27,27);
    reg.FUNC_ENA.fields.PRT_TX_EVT       = getBits(v,26,26);
    reg.FUNC_ENA.fields.PRT_BUS_ON       = getBits(v,25,25);
    reg.FUNC_ENA.fields.PRT_E_ACTIVE     = getBits(v,24,24);
    reg.FUNC_ENA.fields.MH_STATS_IRQ     = getBits(v,22,22);
    reg.FUNC_ENA.fields.MH_RX_ABORT_IRQ  = getBits(v,21,21);
    reg.FUNC_ENA.fields.MH_TX_ABORT_IRQ  = getBits(v,20,20);
    reg.FUNC_ENA.fields.MH_TX_FILTER_IRQ = getBits(v,19,19);
    reg.FUNC_ENA.fields.MH_RX_FILTER_IRQ = getBits(v,18,18);
    reg.FUNC_ENA.fields.MH_STOP_IRQ      = getBits(v,17,17);
    reg.FUNC_ENA.fields.MH_TX_PQ_IRQ     = getBits(v,16,16);
    reg.FUNC_ENA.fields.MH_RX_FQ7_IRQ    = getBits(v,15,15);
    reg.FUNC_ENA.fields.MH_RX_FQ6_IRQ    = getBits(v,14,14);
    reg.FUNC_ENA.fields.MH_RX_FQ5_IRQ    = getBits(v,13,13);
    reg.FUNC_ENA.fields.MH_RX_FQ4_IRQ    = getBits(v,12,12);
    reg.FUNC_ENA.fields.MH_RX_FQ3_IRQ    = getBits(v,11,11);
    reg.FUNC_ENA.fields.MH_RX_FQ2_IRQ    = getBits(v,10,10);
    reg.FUNC_ENA.fields.MH_RX_FQ1_IRQ    = getBits(v,9,9);
    reg.FUNC_ENA.fields.MH_RX_FQ0_IRQ    = getBits(v,8,8);
    reg.FUNC_ENA.fields.MH_TX_FQ7_IRQ    = getBits(v,7,7);
    reg.FUNC_ENA.fields.MH_TX_FQ6_IRQ    = getBits(v,6,6);
    reg.FUNC_ENA.fields.MH_TX_FQ5_IRQ    = getBits(v,5,5);
    reg.FUNC_ENA.fields.MH_TX_FQ4_IRQ    = getBits(v,4,4);
    reg.FUNC_ENA.fields.MH_TX_FQ3_IRQ    = getBits(v,3,3);
    reg.FUNC_ENA.fields.MH_TX_FQ2_IRQ    = getBits(v,2,2);
    reg.FUNC_ENA.fields.MH_TX_FQ1_IRQ    = getBits(v,1,1);
    reg.FUNC_ENA.fields.MH_TX_FQ0_IRQ    = getBits(v,0,0);
    // 2. Report
    reg.FUNC_ENA.report.push({
      severityLevel: sevC.info,
      msg: `FUNC_ENA: ${reg.FUNC_ENA.name_long} (0x${reg.FUNC_ENA.addr !== undefined ? reg.FUNC_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `[28 -               ] Reserved                   = - \n`+
           `[27 PRT_RX_EVT      ] PRT RX CAN Message         = ${reg.FUNC_ENA.fields.PRT_RX_EVT}\n`+
           `[26 PRT_TX_EVT      ] PRT TX CAN Message         = ${reg.FUNC_ENA.fields.PRT_TX_EVT}\n`+
           `[25 PRT_BUS_ON      ] PRT Bus-On Event           = ${reg.FUNC_ENA.fields.PRT_BUS_ON}\n`+
           `[24 PRT_E_ACTIVE    ] PRT Error-Active Event     = ${reg.FUNC_ENA.fields.PRT_E_ACTIVE}\n`+
           `[23 -               ] Reserved                   = - \n`+
           `[22 MH_STATS_IRQ    ] MH Statistics Counter Wrap = ${reg.FUNC_ENA.fields.MH_STATS_IRQ}\n`+
           `[21 MH_RX_ABORT_IRQ ] MH RX Abort (PRT/MH IF)    = ${reg.FUNC_ENA.fields.MH_RX_ABORT_IRQ}\n`+
           `[20 MH_TX_ABORT_IRQ ] MH TX Abort (PRT/MH IF)    = ${reg.FUNC_ENA.fields.MH_TX_ABORT_IRQ}\n`+
           `[19 MH_TX_FILTER_IRQ] MH TX Filter Reject        = ${reg.FUNC_ENA.fields.MH_TX_FILTER_IRQ}\n`+
           `[18 MH_RX_FILTER_IRQ] MH RX Filter Match         = ${reg.FUNC_ENA.fields.MH_RX_FILTER_IRQ}\n`+
           `[17 MH_STOP_IRQ     ] MH Stop Event              = ${reg.FUNC_ENA.fields.MH_STOP_IRQ}\n`+
           `[16 MH_TX_PQ_IRQ    ] MH TX Prio Queue Event     = ${reg.FUNC_ENA.fields.MH_TX_PQ_IRQ}\n`+
           `[15 MH_RX_FQ7_IRQ   ] MH RX FIFO Queue 7 IRQ     = ${reg.FUNC_ENA.fields.MH_RX_FQ7_IRQ}\n`+
           `[14 MH_RX_FQ6_IRQ   ] MH RX FIFO Queue 6 IRQ     = ${reg.FUNC_ENA.fields.MH_RX_FQ6_IRQ}\n`+
           `[13 MH_RX_FQ5_IRQ   ] MH RX FIFO Queue 5 IRQ     = ${reg.FUNC_ENA.fields.MH_RX_FQ5_IRQ}\n`+
           `[12 MH_RX_FQ4_IRQ   ] MH RX FIFO Queue 4 IRQ     = ${reg.FUNC_ENA.fields.MH_RX_FQ4_IRQ}\n`+
           `[11 MH_RX_FQ3_IRQ   ] MH RX FIFO Queue 3 IRQ     = ${reg.FUNC_ENA.fields.MH_RX_FQ3_IRQ}\n`+
           `[10 MH_RX_FQ2_IRQ   ] MH RX FIFO Queue 2 IRQ     = ${reg.FUNC_ENA.fields.MH_RX_FQ2_IRQ}\n`+
           `[ 9 MH_RX_FQ1_IRQ   ] MH RX FIFO Queue 1 IRQ     = ${reg.FUNC_ENA.fields.MH_RX_FQ1_IRQ}\n`+
           `[ 8 MH_RX_FQ0_IRQ   ] MH RX FIFO Queue 0 IRQ     = ${reg.FUNC_ENA.fields.MH_RX_FQ0_IRQ}\n`+
           `[ 7 MH_TX_FQ7_IRQ   ] MH TX FIFO Queue 7 IRQ     = ${reg.FUNC_ENA.fields.MH_TX_FQ7_IRQ}\n`+
           `[ 6 MH_TX_FQ6_IRQ   ] MH TX FIFO Queue 6 IRQ     = ${reg.FUNC_ENA.fields.MH_TX_FQ6_IRQ}\n`+
           `[ 5 MH_TX_FQ5_IRQ   ] MH TX FIFO Queue 5 IRQ     = ${reg.FUNC_ENA.fields.MH_TX_FQ5_IRQ}\n`+
           `[ 4 MH_TX_FQ4_IRQ   ] MH TX FIFO Queue 4 IRQ     = ${reg.FUNC_ENA.fields.MH_TX_FQ4_IRQ}\n`+
           `[ 3 MH_TX_FQ3_IRQ   ] MH TX FIFO Queue 3 IRQ     = ${reg.FUNC_ENA.fields.MH_TX_FQ3_IRQ}\n`+
           `[ 2 MH_TX_FQ2_IRQ   ] MH TX FIFO Queue 2 IRQ     = ${reg.FUNC_ENA.fields.MH_TX_FQ2_IRQ}\n`+
           `[ 1 MH_TX_FQ1_IRQ   ] MH TX FIFO Queue 1 IRQ     = ${reg.FUNC_ENA.fields.MH_TX_FQ1_IRQ}\n`+
           `[ 0 MH_TX_FQ0_IRQ   ] MH TX FIFO Queue 0 IRQ     = ${reg.FUNC_ENA.fields.MH_TX_FQ0_IRQ}`
    });
  }

  // === ERR_ENA: Error Raw Event Enable ===========================
  if ('ERR_ENA' in reg && reg.ERR_ENA.int32 !== undefined) {
    const v = reg.ERR_ENA.int32;
    // 0. Extend structure
    reg.ERR_ENA.fields = {};
    reg.ERR_ENA.report = [];
    // 1. Decode (MSB->LSB) bits
    reg.ERR_ENA.fields.TOP_MUX_TO_ERR   = getBits(v,28,28);
    reg.ERR_ENA.fields.PRT_BUS_OFF      = getBits(v,23,23);
    reg.ERR_ENA.fields.PRT_E_PASSIVE    = getBits(v,22,22);
    reg.ERR_ENA.fields.PRT_BUS_ERR      = getBits(v,21,21);
    reg.ERR_ENA.fields.PRT_IFF_RQ       = getBits(v,20,20);
    reg.ERR_ENA.fields.PRT_RX_DO        = getBits(v,19,19);
    reg.ERR_ENA.fields.PRT_TX_DU        = getBits(v,18,18);
    reg.ERR_ENA.fields.PRT_USOS         = getBits(v,17,17);
    reg.ERR_ENA.fields.PRT_ABORTED      = getBits(v,16,16);
    reg.ERR_ENA.fields.MH_MEM_TO_ERR    = getBits(v,13,13);
    reg.ERR_ENA.fields.MH_WR_RESP_ERR   = getBits(v,12,12);
    reg.ERR_ENA.fields.MH_RD_RESP_ERR   = getBits(v,11,11);
    reg.ERR_ENA.fields.MH_DMA_CH_ERR    = getBits(v,10,10);
    reg.ERR_ENA.fields.MH_DMA_TO_ERR    = getBits(v,9,9);
    reg.ERR_ENA.fields.MH_DP_TO_ERR     = getBits(v,8,8);
    reg.ERR_ENA.fields.MH_DP_DO_ERR     = getBits(v,7,7);
    reg.ERR_ENA.fields.MH_DP_SEQ_ERR    = getBits(v,6,6);
    reg.ERR_ENA.fields.MH_DP_PARITY_ERR = getBits(v,5,5);
    reg.ERR_ENA.fields.MH_AP_PARITY_ERR = getBits(v,4,4);
    reg.ERR_ENA.fields.MH_DESC_ERR      = getBits(v,3,3);
    reg.ERR_ENA.fields.MH_REG_CRC_ERR   = getBits(v,2,2);
    reg.ERR_ENA.fields.MH_MEM_SFTY_ERR  = getBits(v,1,1);
    reg.ERR_ENA.fields.MH_RX_FILTER_ERR = getBits(v,0,0);
    // 2. Report
    reg.ERR_ENA.report.push({
      severityLevel: sevC.info,
      msg: `ERR_ENA: ${reg.ERR_ENA.name_long} (0x${reg.ERR_ENA.addr !== undefined ? reg.ERR_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = - \n`+
           `[30 -               ] Reserved                   = - \n`+
           `[29 -               ] Reserved                   = - \n`+
           `[28 TOP_MUX_TO_ERR  ] Top-Level Mux Timeout      = ${reg.ERR_ENA.fields.TOP_MUX_TO_ERR}\n`+
           `[27 -               ] Reserved                   = -\n`+
           `[26 -               ] Reserved                   = -\n`+
           `[25 -               ] Reserved                   = -\n`+
           `[24 -               ] Reserved                   = -\n`+
           `[23 PRT_BUS_OFF     ] PRT Bus Off                = ${reg.ERR_ENA.fields.PRT_BUS_OFF}\n`+
           `[22 PRT_E_PASSIVE   ] PRT Error Passive          = ${reg.ERR_ENA.fields.PRT_E_PASSIVE}\n`+
           `[21 PRT_BUS_ERR     ] PRT CAN Bus Error          = ${reg.ERR_ENA.fields.PRT_BUS_ERR}\n`+
           `[20 PRT_IFF_RQ      ] PRT Invalid Frame Format   = ${reg.ERR_ENA.fields.PRT_IFF_RQ}\n`+
           `[19 PRT_RX_DO       ] PRT RX Overflow            = ${reg.ERR_ENA.fields.PRT_RX_DO}\n`+
           `[18 PRT_TX_DU       ] PRT TX Underrun            = ${reg.ERR_ENA.fields.PRT_TX_DU}\n`+
           `[17 PRT_USOS        ] PRT Unexp. Start Of Seq    = ${reg.ERR_ENA.fields.PRT_USOS}\n`+
           `[16 PRT_ABORTED     ] PRT TX Sequence Aborted    = ${reg.ERR_ENA.fields.PRT_ABORTED}\n`+
           `[15 -               ] Reserved                   = -\n`+
           `[14 -               ] Reserved                   = -\n`+
           `[13 MH_MEM_TO_ERR   ] LMEM Timeout               = ${reg.ERR_ENA.fields.MH_MEM_TO_ERR}\n`+
           `[12 MH_WR_RESP_ERR  ] Write Response Bus Error   = ${reg.ERR_ENA.fields.MH_WR_RESP_ERR}\n`+
           `[11 MH_RD_RESP_ERR  ] Read Response Bus Error    = ${reg.ERR_ENA.fields.MH_RD_RESP_ERR}\n`+
           `[10 MH_DMA_CH_ERR   ] DMA Channel Routing Error  = ${reg.ERR_ENA.fields.MH_DMA_CH_ERR}\n`+
           `[ 9 MH_DMA_TO_ERR   ] DMA Timeout                = ${reg.ERR_ENA.fields.MH_DMA_TO_ERR}\n`+
           `[ 8 MH_DP_TO_ERR    ] Data Path Timeout          = ${reg.ERR_ENA.fields.MH_DP_TO_ERR}\n`+
           `[ 7 MH_DP_DO_ERR    ] Data Path Overflow         = ${reg.ERR_ENA.fields.MH_DP_DO_ERR}\n`+
           `[ 6 MH_DP_SEQ_ERR   ] Data Path Sequence Error   = ${reg.ERR_ENA.fields.MH_DP_SEQ_ERR}\n`+
           `[ 5 MH_DP_PARITY_ERR] Data Path Parity Error     = ${reg.ERR_ENA.fields.MH_DP_PARITY_ERR}\n`+
           `[ 4 MH_AP_PARITY_ERR] Address Pointer Parity Err = ${reg.ERR_ENA.fields.MH_AP_PARITY_ERR}\n`+
           `[ 3 MH_DESC_ERR     ] Descriptor Error           = ${reg.ERR_ENA.fields.MH_DESC_ERR}\n`+
           `[ 2 MH_REG_CRC_ERR  ] Register Bank CRC Error    = ${reg.ERR_ENA.fields.MH_REG_CRC_ERR}\n`+
           `[ 1 MH_MEM_SFTY_ERR ] Memory Safety Error        = ${reg.ERR_ENA.fields.MH_MEM_SFTY_ERR}\n`+
           `[ 0 MH_RX_FILTER_ERR] RX Filter Timeout/Error    = ${reg.ERR_ENA.fields.MH_RX_FILTER_ERR}`
    });
  }

  // === SAFETY_ENA: Safety Raw Event Enable =======================
  if ('SAFETY_ENA' in reg && reg.SAFETY_ENA.int32 !== undefined) {
    const v = reg.SAFETY_ENA.int32;
    // 0. Extend structure
    reg.SAFETY_ENA.fields = {};
    reg.SAFETY_ENA.report = [];
    // 1. Decode (MSB->LSB) bits
    reg.SAFETY_ENA.fields.TOP_MUX_TO_ERR = getBits(v,28,28);
    reg.SAFETY_ENA.fields.PRT_BUS_OFF      = getBits(v,23,23);
    reg.SAFETY_ENA.fields.PRT_E_PASSIVE    = getBits(v,22,22);
    reg.SAFETY_ENA.fields.PRT_BUS_ERR      = getBits(v,21,21);
    reg.SAFETY_ENA.fields.PRT_IFF_RQ       = getBits(v,20,20);
    reg.SAFETY_ENA.fields.PRT_RX_DO        = getBits(v,19,19);
    reg.SAFETY_ENA.fields.PRT_TX_DU        = getBits(v,18,18);
    reg.SAFETY_ENA.fields.PRT_USOS         = getBits(v,17,17);
    reg.SAFETY_ENA.fields.PRT_ABORTED      = getBits(v,16,16);
    reg.SAFETY_ENA.fields.MH_MEM_TO_ERR    = getBits(v,13,13);
    reg.SAFETY_ENA.fields.MH_WR_RESP_ERR   = getBits(v,12,12);
    reg.SAFETY_ENA.fields.MH_RD_RESP_ERR   = getBits(v,11,11);
    reg.SAFETY_ENA.fields.MH_DMA_CH_ERR    = getBits(v,10,10);
    reg.SAFETY_ENA.fields.MH_DMA_TO_ERR    = getBits(v,9,9);
    reg.SAFETY_ENA.fields.MH_DP_TO_ERR     = getBits(v,8,8);
    reg.SAFETY_ENA.fields.MH_DP_DO_ERR     = getBits(v,7,7);
    reg.SAFETY_ENA.fields.MH_DP_SEQ_ERR    = getBits(v,6,6);
    reg.SAFETY_ENA.fields.MH_DP_PARITY_ERR = getBits(v,5,5);
    reg.SAFETY_ENA.fields.MH_AP_PARITY_ERR = getBits(v,4,4);
    reg.SAFETY_ENA.fields.MH_DESC_ERR      = getBits(v,3,3);
    reg.SAFETY_ENA.fields.MH_REG_CRC_ERR   = getBits(v,2,2);
    reg.SAFETY_ENA.fields.MH_MEM_SFTY_ERR  = getBits(v,1,1);
    reg.SAFETY_ENA.fields.MH_RX_FILTER_ERR = getBits(v,0,0);
    // 2. Report
    reg.SAFETY_ENA.report.push({
      severityLevel: sevC.info,
      msg: `SAFETY_ENA: ${reg.SAFETY_ENA.name_long} (0x${reg.SAFETY_ENA.addr !== undefined ? reg.SAFETY_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[31 -               ] Reserved                   = -\n`+
           `[30 -               ] Reserved                   = -\n`+
           `[29 -               ] Reserved                   = -\n`+
           `[28 TOP_MUX_TO_ERR  ] Top-Level Mux Timeout      = ${reg.SAFETY_ENA.fields.TOP_MUX_TO_ERR}\n`+
           `[27 -               ] Reserved                   = -\n`+
           `[26 -               ] Reserved                   = -\n`+
           `[25 -               ] Reserved                   = -\n`+
           `[24 -               ] Reserved                   = -\n`+
           `[23 PRT_BUS_OFF     ] PRT Bus Off                = ${reg.SAFETY_ENA.fields.PRT_BUS_OFF}\n`+
           `[22 PRT_E_PASSIVE   ] PRT Error Passive          = ${reg.SAFETY_ENA.fields.PRT_E_PASSIVE}\n`+
           `[21 PRT_BUS_ERR     ] PRT CAN Bus Error          = ${reg.SAFETY_ENA.fields.PRT_BUS_ERR}\n`+
           `[20 PRT_IFF_RQ      ] PRT Invalid Frame Format   = ${reg.SAFETY_ENA.fields.PRT_IFF_RQ}\n`+
           `[19 PRT_RX_DO       ] PRT RX Overflow            = ${reg.SAFETY_ENA.fields.PRT_RX_DO}\n`+
           `[18 PRT_TX_DU       ] PRT TX Underrun            = ${reg.SAFETY_ENA.fields.PRT_TX_DU}\n`+
           `[17 PRT_USOS        ] PRT Unexpect. Start Of Seq = ${reg.SAFETY_ENA.fields.PRT_USOS}\n`+
           `[16 PRT_ABORTED     ] PRT TX Sequence Aborted    = ${reg.SAFETY_ENA.fields.PRT_ABORTED}\n`+
           `[15 -               ] Reserved                   = -\n`+
           `[14 -               ] Reserved                   = -\n`+
           `[13 MH_MEM_TO_ERR   ] Local Memory Timeout       = ${reg.SAFETY_ENA.fields.MH_MEM_TO_ERR}\n`+
           `[12 MH_WR_RESP_ERR  ] Write Response Bus Error   = ${reg.SAFETY_ENA.fields.MH_WR_RESP_ERR}\n`+
           `[11 MH_RD_RESP_ERR  ] Read Response Bus Error    = ${reg.SAFETY_ENA.fields.MH_RD_RESP_ERR}\n`+
           `[10 MH_DMA_CH_ERR   ] DMA Channel Routing Error  = ${reg.SAFETY_ENA.fields.MH_DMA_CH_ERR}\n`+
           `[ 9 MH_DMA_TO_ERR   ] DMA Timeout                = ${reg.SAFETY_ENA.fields.MH_DMA_TO_ERR}\n`+
           `[ 8 MH_DP_TO_ERR    ] Data Path Timeout          = ${reg.SAFETY_ENA.fields.MH_DP_TO_ERR}\n`+
           `[ 7 MH_DP_DO_ERR    ] Data Path Overflow         = ${reg.SAFETY_ENA.fields.MH_DP_DO_ERR}\n`+
           `[ 6 MH_DP_SEQ_ERR   ] Data Path Sequence Error   = ${reg.SAFETY_ENA.fields.MH_DP_SEQ_ERR}\n`+
           `[ 5 MH_DP_PARITY_ERR] Data Path Parity Error     = ${reg.SAFETY_ENA.fields.MH_DP_PARITY_ERR}\n`+
           `[ 4 MH_AP_PARITY_ERR] Address Pointer Parity Err = ${reg.SAFETY_ENA.fields.MH_AP_PARITY_ERR}\n`+
           `[ 3 MH_DESC_ERR     ] Descriptor Error           = ${reg.SAFETY_ENA.fields.MH_DESC_ERR}\n`+
           `[ 2 MH_REG_CRC_ERR  ] Register Bank CRC Error    = ${reg.SAFETY_ENA.fields.MH_REG_CRC_ERR}\n`+
           `[ 1 MH_MEM_SFTY_ERR ] Memory Safety Error        = ${reg.SAFETY_ENA.fields.MH_MEM_SFTY_ERR}\n`+
           `[ 0 MH_RX_FILTER_ERR] RX Filter Timeout/Error    = ${reg.SAFETY_ENA.fields.MH_RX_FILTER_ERR}`
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
    const enabled = defs.filter(d => reg.FUNC_ENA.fields[d.key] === 1);
    const nameWidth = Math.max(4, ...enabled.map(e => e.key.length));
    let lines = '';
    if (enabled.length === 0) {
      lines = 'No FUNC interrupts enabled (all ENA bits = 0)';
    } else {
      lines = enabled.map(d => {
        const rawV = reg.FUNC_RAW.fields[d.key];
        const enaV = reg.FUNC_ENA.fields[d.key];
        return `${d.bit.toString().padStart(2, ' ')}   ${d.key.padEnd(nameWidth,' ')}  ${String(rawV).padStart(1,' ')}   ${String(enaV).padStart(1,' ')}`;
      }).join('\n');
    }
    reg.FUNC_ENA = reg.FUNC_ENA || { report: [] };
    reg.FUNC_ENA.report.push({
      severityLevel: sevC.infoHighlighted,
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
    const enabledErr = defsErr.filter(d => reg.ERR_ENA.fields[d.key] === 1);
    const nameWidthErr = Math.max(4, ...enabledErr.map(e => e.key.length));
    let linesErr;
    if (enabledErr.length === 0) {
      linesErr = 'No ERR interrupts enabled (all ENA bits = 0)';
    } else {
      linesErr = enabledErr.map(d => {
        const rawV = reg.ERR_RAW.fields[d.key];
        const enaV = reg.ERR_ENA.fields[d.key];
        return `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthErr,' ')}  ${String(rawV)}   ${String(enaV)}`;
      }).join('\n');
    }
    reg.ERR_ENA.report.push({
      severityLevel: sevC.infoHighlighted,
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
    const enabledSaf = defsSafety.filter(d => reg.SAFETY_ENA.fields[d.key] === 1);
    const nameWidthSaf = Math.max(4, ...enabledSaf.map(e => e.key.length));
    let linesSaf;
    if (enabledSaf.length === 0) {
      linesSaf = 'No SAFETY interrupts enabled (all ENA bits = 0)';
    } else {
      linesSaf = enabledSaf.map(d => {
        const rawV = reg.SAFETY_RAW.fields[d.key];
        const enaV = reg.SAFETY_ENA.fields[d.key];
        return `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthSaf,' ')}  ${String(rawV)}   ${String(enaV)}`;
      }).join('\n');
    }
    reg.SAFETY_ENA.report.push({
      severityLevel: sevC.infoHighlighted,
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
    reg.CAPTURING_MODE.fields.SAFETY = getBits(v,2,2);
    reg.CAPTURING_MODE.fields.ERR    = getBits(v,1,1);
    reg.CAPTURING_MODE.fields.FUNC   = getBits(v,0,0);
    const modeStr = (b)=> b? 'Edge' : 'Level';
    const expected = 0x7;
    // 2. Report
    reg.CAPTURING_MODE.report.push({
      severityLevel: sevC.info,
      msg: `CAPTURING_MODE: ${reg.CAPTURING_MODE.name_long} (0x${reg.CAPTURING_MODE.addr !== undefined ? reg.CAPTURING_MODE.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `Expected fixed value: 0x${expected.toString(16).toUpperCase()} (all Edge).${v!==expected? ' (NOTE: Value differs from expected !)':''}\n`+
           `[SAFETY ] SAFETY RAW input flag Capturing Mode = ${reg.CAPTURING_MODE.fields.SAFETY} (${modeStr(reg.CAPTURING_MODE.fields.SAFETY)})\n`+
           `[ERR    ] ERR    RAW input flag Capturing Mode = ${reg.CAPTURING_MODE.fields.ERR} (${modeStr(reg.CAPTURING_MODE.fields.ERR)})\n`+
           `[FUNC   ] FUNC   RAW input flag Capturing Mode = ${reg.CAPTURING_MODE.fields.FUNC} (${modeStr(reg.CAPTURING_MODE.fields.FUNC)})`
    });
  }

  // === HDP: Hardware Debug Port Control =========================
  if ('HDP' in reg && reg.HDP.int32 !== undefined) {
    const v = reg.HDP.int32;
    // 0. Extend structure
    reg.HDP.fields = {};
    reg.HDP.report = [];
    // 1. Decode (only bit 0 used)
    reg.HDP.fields.HDP_SEL = getBits(v,0,0); // 0 = Message Handler, 1 = Protocol Controller
    // 2. Report
    reg.HDP.report.push({
      severityLevel: sevC.info,
      msg: `HDP: ${reg.HDP.name_long} (0x${reg.HDP.addr !== undefined ? reg.HDP.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[HDP_SEL] HDP Select (0=MH, 1=PRT) = ${reg.HDP.fields.HDP_SEL} (${reg.HDP.fields.HDP_SEL? 'PRT selected':'MH selected'})`
    });
  }

} // IRC