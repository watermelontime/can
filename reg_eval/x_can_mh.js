// X_CAN: MH register decoding
import { getBits } from './help_functions.js';
import { sevC } from './help_functions.js';

// ===================================================================================
// MH Global registers: VERSION, MH_CTRL, MH_CFG (detailed decoding)
export function procRegsMhGlobal(reg) {
  // === VERSION: Release Identification Register ========================
  if ('VERSION' in reg && reg.VERSION.int32 !== undefined) {
    const regValue = reg.VERSION.int32 >>> 0;
    reg.VERSION.fields = {};
    reg.VERSION.report = [];

    // Bit fields (BCD-coded date fields per spec)
    reg.VERSION.fields.REL     = getBits(regValue, 31, 28);
    reg.VERSION.fields.STEP    = getBits(regValue, 27, 24);
    reg.VERSION.fields.SUBSTEP = getBits(regValue, 23, 20);
    reg.VERSION.fields.YEAR    = getBits(regValue, 19, 16);
    reg.VERSION.fields.MON     = getBits(regValue, 15,  8);
    reg.VERSION.fields.DAY     = getBits(regValue,  7,  0);

    reg.VERSION.report.push({
      severityLevel: sevC.Info,
      msg: `VERSION: ${reg.VERSION.name_long} (0x${reg.VERSION.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[REL    ] Release  = 0x${reg.VERSION.fields.REL.toString(16).toUpperCase()}\n` +
           `[STEP   ] Step     = 0x${reg.VERSION.fields.STEP.toString(16).toUpperCase()}\n` +
           `[SUBSTEP] Substep  = 0x${reg.VERSION.fields.SUBSTEP.toString(16).toUpperCase()}\n` +
           `[YEAR   ] Year     = 0x${reg.VERSION.fields.YEAR.toString(16).toUpperCase()}\n` +
           `[MON    ] Month    = 0x${reg.VERSION.fields.MON.toString(16).toUpperCase().padStart(2,'0')}\n` +
           `[DAY    ] Day      = 0x${reg.VERSION.fields.DAY.toString(16).toUpperCase().padStart(2,'0')}`
    });

    reg.VERSION.report.push({
      severityLevel: sevC.Info,
      highlight: true,
      msg: `VERSION: X_CAN MH V${reg.VERSION.fields.REL.toString(16).toUpperCase()}.${reg.VERSION.fields.STEP.toString(16).toUpperCase()}.${reg.VERSION.fields.SUBSTEP.toString(16).toUpperCase()}, Date ${reg.VERSION.fields.DAY.toString(16).toUpperCase().padStart(2,'0')}.${reg.VERSION.fields.MON.toString(16).toUpperCase().padStart(2,'0')}.202${reg.VERSION.fields.YEAR.toString(16).toUpperCase()}`
    });
  } // VERSION

  // === MH_CTRL: Message Handler Control register =======================
  if ('MH_CTRL' in reg && reg.MH_CTRL.int32 !== undefined) {
    const regValue = reg.MH_CTRL.int32 >>> 0;
    reg.MH_CTRL.fields = {};
    reg.MH_CTRL.report = [];

    reg.MH_CTRL.fields.START = getBits(regValue, 0, 0);

    reg.MH_CTRL.report.push({
      severityLevel: sevC.Info,
      msg: `MH_CTRL: ${reg.MH_CTRL.name_long} (0x${reg.MH_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[START] Start MH = ${reg.MH_CTRL.fields.START}`
    });
  } // MH_CTRL

  // === MH_CFG: Message Handler Configuration register ==================
  if ('MH_CFG' in reg && reg.MH_CFG.int32 !== undefined) {
    const regValue = reg.MH_CFG.int32 >>> 0;
    reg.MH_CFG.fields = {};
    reg.MH_CFG.report = [];

    reg.MH_CFG.fields.RC_CONT_DC  = getBits(regValue, 0, 0);
    reg.MH_CFG.fields.MAX_RETRANS = getBits(regValue, 10, 8);
    reg.MH_CFG.fields.INS_NUM     = getBits(regValue, 18, 16);

    // Interpret MAX_RETRANS per spec
    let maxRetrStr = '';
    const mr = reg.MH_CFG.fields.MAX_RETRANS;
    if (mr === 0) maxRetrStr = '0 (no re-transmission)';
    else if (mr >= 1 && mr <= 6) maxRetrStr = `${mr} (re-transmissions)`;
    else if (mr === 7) maxRetrStr = '7 (unlimited re-transmissions)';
    else maxRetrStr = `${mr}`;

    reg.MH_CFG.report.push({
      severityLevel: sevC.Info,
      msg: `MH_CFG: ${reg.MH_CFG.name_long} (0x${reg.MH_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[RC_CONT_DC ] RX Continuous Data Container mode = ${reg.MH_CFG.fields.RC_CONT_DC}\n` +
           `[MAX_RETRANS] Maximum TX re-transmissions       = ${reg.MH_CFG.fields.MAX_RETRANS} (0: NO, 1-6: 1-6, 7: unlimited)\n` +
           `[INS_NUM    ] Instance Number                   = ${reg.MH_CFG.fields.INS_NUM}`
    });
  } // MH_CFG

  // === MH_STS: Message Handler Status register =======================
  if ('MH_STS' in reg && reg.MH_STS.int32 !== undefined) {
    const regValue = reg.MH_STS.int32 >>> 0;
    reg.MH_STS.fields = {};
    reg.MH_STS.report = [];

    reg.MH_STS.fields.BUSY          = getBits(regValue, 0, 0);
    reg.MH_STS.fields.ENABLE        = getBits(regValue, 4, 4);
    reg.MH_STS.fields.CLOCK_ACTIVE  = getBits(regValue, 8, 8);

    reg.MH_STS.report.push({
      severityLevel: sevC.Info,
      msg: `MH_STS: ${reg.MH_STS.name_long} (0x${reg.MH_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[BUSY        ] General Busy Flag           = ${reg.MH_STS.fields.BUSY}\n` +
           `[ENABLE      ] PRT Enable Signal           = ${reg.MH_STS.fields.ENABLE}\n` +
           `[CLOCK_ACTIVE] MH Core Clock Active        = ${reg.MH_STS.fields.CLOCK_ACTIVE}`
    });
  }

  // === MH_SFTY_CFG: Safety Configuration =============================
  if ('MH_SFTY_CFG' in reg && reg.MH_SFTY_CFG.int32 !== undefined) {
    const regValue = reg.MH_SFTY_CFG.int32 >>> 0;
    reg.MH_SFTY_CFG.fields = {};
    reg.MH_SFTY_CFG.report = [];

    reg.MH_SFTY_CFG.fields.DMA_TO_VAL = getBits(regValue, 7, 0);
    reg.MH_SFTY_CFG.fields.MEM_TO_VAL = getBits(regValue, 15, 8);
    reg.MH_SFTY_CFG.fields.PRT_TO_VAL = getBits(regValue, 29, 16);
    reg.MH_SFTY_CFG.fields.PRESCALER  = getBits(regValue, 31, 30);

    const prescMap = {0: 'clk/32', 1: 'clk/64', 2: 'clk/128', 3: 'clk/512'};
    const prescStr = prescMap[reg.MH_SFTY_CFG.fields.PRESCALER] || `${reg.MH_SFTY_CFG.fields.PRESCALER}`;

    reg.MH_SFTY_CFG.report.push({
      severityLevel: sevC.Info,
      msg: `MH_SFTY_CFG: ${reg.MH_SFTY_CFG.name_long} (0x${reg.MH_SFTY_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[PRESCALER ] Watchdog Tick Prescaler = ${reg.MH_SFTY_CFG.fields.PRESCALER} (0: clk/32, 1: clk/64, 2: clk/128, 3: clk/512)\n` +
           `[PRT_TO_VAL] PRT IF Timeout Ticks    = ${reg.MH_SFTY_CFG.fields.PRT_TO_VAL}\n` +
           `[MEM_TO_VAL] MEM AXI Timeout Ticks   = ${reg.MH_SFTY_CFG.fields.MEM_TO_VAL}\n` +
           `[DMA_TO_VAL] DMA AXI Timeout Ticks   = ${reg.MH_SFTY_CFG.fields.DMA_TO_VAL}`
    });

    // Cross-checks with MH_SFTY_CTRL enable bits if available
    const sfty = reg.MH_SFTY_CTRL && reg.MH_SFTY_CTRL.fields ? reg.MH_SFTY_CTRL.fields : null;
    if (sfty) {
      if (sfty.DMA_TO_EN === 1 && reg.MH_SFTY_CFG.fields.DMA_TO_VAL === 0) {
        reg.MH_SFTY_CFG.report.push({ severityLevel: sevC.Warn, msg: 'DMA_TO_VAL is 0 while DMA_TO_EN=1: DMA timeout would trigger immediately.' });
      }
      if (sfty.MEM_TO_EN === 1 && reg.MH_SFTY_CFG.fields.MEM_TO_VAL === 0) {
        reg.MH_SFTY_CFG.report.push({ severityLevel: sevC.Warn, msg: 'MEM_TO_VAL is 0 while MEM_TO_EN=1: MEM timeout would trigger immediately.' });
      }
      if (sfty.PRT_TO_EN === 1 && reg.MH_SFTY_CFG.fields.PRT_TO_VAL === 0) {
        reg.MH_SFTY_CFG.report.push({ severityLevel: sevC.Warn, msg: 'PRT_TO_VAL is 0 while PRT_TO_EN=1: PRT timeout would trigger immediately.' });
      }
    }
  }

  // === MH_SFTY_CTRL: Safety Control ==================================
  if ('MH_SFTY_CTRL' in reg && reg.MH_SFTY_CTRL.int32 !== undefined) {
    const regValue = reg.MH_SFTY_CTRL.int32 >>> 0;
    reg.MH_SFTY_CTRL.fields = {};
    reg.MH_SFTY_CTRL.report = [];

    reg.MH_SFTY_CTRL.fields.TX_DESC_CRC_EN = getBits(regValue, 0, 0);
    reg.MH_SFTY_CTRL.fields.RX_DESC_CRC_EN = getBits(regValue, 1, 1);
    reg.MH_SFTY_CTRL.fields.MEM_PROT_EN    = getBits(regValue, 2, 2);
    reg.MH_SFTY_CTRL.fields.RX_DP_PARITY_EN= getBits(regValue, 3, 3);
    reg.MH_SFTY_CTRL.fields.TX_DP_PARITY_EN= getBits(regValue, 4, 4);
    reg.MH_SFTY_CTRL.fields.TX_AP_PARITY_EN= getBits(regValue, 5, 5);
    reg.MH_SFTY_CTRL.fields.RX_AP_PARITY_EN= getBits(regValue, 6, 6);
    reg.MH_SFTY_CTRL.fields.DMA_CH_CHK_EN  = getBits(regValue, 7, 7);
    reg.MH_SFTY_CTRL.fields.DMA_TO_EN      = getBits(regValue, 8, 8);
    reg.MH_SFTY_CTRL.fields.MEM_TO_EN      = getBits(regValue, 9, 9);
    reg.MH_SFTY_CTRL.fields.PRT_TO_EN      = getBits(regValue,10,10);

    reg.MH_SFTY_CTRL.report.push({
      severityLevel: sevC.Info,
      msg: `MH_SFTY_CTRL: ${reg.MH_SFTY_CTRL.name_long} (0x${reg.MH_SFTY_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TX_DESC_CRC_EN ] TX Descriptor CRC Check Enable   = ${reg.MH_SFTY_CTRL.fields.TX_DESC_CRC_EN}\n` +
           `[RX_DESC_CRC_EN ] RX Descriptor CRC Check Enable   = ${reg.MH_SFTY_CTRL.fields.RX_DESC_CRC_EN}\n` +
           `[MEM_PROT_EN    ] Memory Protection Enable         = ${reg.MH_SFTY_CTRL.fields.MEM_PROT_EN}\n` +
           `[RX_DP_PARITY_EN] RX Data Path Parity Enable       = ${reg.MH_SFTY_CTRL.fields.RX_DP_PARITY_EN}\n` +
           `[TX_DP_PARITY_EN] TX Data Path Parity Enable       = ${reg.MH_SFTY_CTRL.fields.TX_DP_PARITY_EN}\n` +
           `[TX_AP_PARITY_EN] TX Address Path Parity Enable    = ${reg.MH_SFTY_CTRL.fields.TX_AP_PARITY_EN}\n` +
           `[RX_AP_PARITY_EN] RX Address Path Parity Enable    = ${reg.MH_SFTY_CTRL.fields.RX_AP_PARITY_EN}\n` +
           `[DMA_CH_CHK_EN  ] DMA Channel Routing Check Enable = ${reg.MH_SFTY_CTRL.fields.DMA_CH_CHK_EN}\n` +
           `[DMA_TO_EN      ] DMA AXI Watchdog Enable          = ${reg.MH_SFTY_CTRL.fields.DMA_TO_EN}\n` +
           `[MEM_TO_EN      ] MEM AXI Watchdog Enable          = ${reg.MH_SFTY_CTRL.fields.MEM_TO_EN}\n` +
           `[PRT_TO_EN      ] PRT IF Watchdog Enable           = ${reg.MH_SFTY_CTRL.fields.PRT_TO_EN}`
    });
  }

  // === RX_FILTER_MEM_ADD: RX Filter Base Address ======================
  if ('RX_FILTER_MEM_ADD' in reg && reg.RX_FILTER_MEM_ADD.int32 !== undefined) {
    const regValue = reg.RX_FILTER_MEM_ADD.int32 >>> 0;
    reg.RX_FILTER_MEM_ADD.fields = {};
    reg.RX_FILTER_MEM_ADD.report = [];

    reg.RX_FILTER_MEM_ADD.fields.BASE_ADDR = getBits(regValue, 15, 0);
    const base = reg.RX_FILTER_MEM_ADD.fields.BASE_ADDR;
    const alignOk = (base & 0x3) === 0;

    reg.RX_FILTER_MEM_ADD.report.push({
      severityLevel: sevC.Info,
      msg: `RX_FILTER_MEM_ADD: ${reg.RX_FILTER_MEM_ADD.name_long} (0x${reg.RX_FILTER_MEM_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[BASE_ADDR] RX Filter Base Address (L_MEM) = 0x${base.toString(16).toUpperCase().padStart(4,'0')} (word-aligned expected)`
    });
    if (!alignOk) {
      reg.RX_FILTER_MEM_ADD.report.push({ severityLevel: sevC.Warn, msg: 'RX Filter Base Address not word-aligned (LSBs [1:0] should be 0).' });
    }
  }

  // === TX_DESC_MEM_ADD: TX Descriptor Base Address ====================
  if ('TX_DESC_MEM_ADD' in reg && reg.TX_DESC_MEM_ADD.int32 !== undefined) {
    const regValue = reg.TX_DESC_MEM_ADD.int32 >>> 0;
    reg.TX_DESC_MEM_ADD.fields = {};
    reg.TX_DESC_MEM_ADD.report = [];

    reg.TX_DESC_MEM_ADD.fields.FQ_BASE_ADDR = getBits(regValue, 15, 0);
    reg.TX_DESC_MEM_ADD.fields.PQ_BASE_ADDR = getBits(regValue, 31, 16);
    const fq = reg.TX_DESC_MEM_ADD.fields.FQ_BASE_ADDR;
    const pq = reg.TX_DESC_MEM_ADD.fields.PQ_BASE_ADDR;
    const alignFqOk = (fq & 0x3) === 0;
    const alignPqOk = (pq & 0x3) === 0;

    reg.TX_DESC_MEM_ADD.report.push({
      severityLevel: sevC.Info,
      msg: `TX_DESC_MEM_ADD: ${reg.TX_DESC_MEM_ADD.name_long} (0x${reg.TX_DESC_MEM_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[PQ_BASE_ADDR] TX Priority Queue Base Address = 0x${pq.toString(16).toUpperCase().padStart(4,'0')} (word-aligned expected)\n` +
           `[FQ_BASE_ADDR] TX FIFO Queue Base Address     = 0x${fq.toString(16).toUpperCase().padStart(4,'0')} (word-aligned expected)`
    });
    if (!alignPqOk) {
      reg.TX_DESC_MEM_ADD.report.push({ severityLevel: sevC.Warn, msg: 'TX PQ Base Address not word-aligned (LSBs [1:0] should be 0).' });
    }
    if (!alignFqOk) {
      reg.TX_DESC_MEM_ADD.report.push({ severityLevel: sevC.Warn, msg: 'TX FQ Base Address not word-aligned (LSBs [1:0] should be 0).' });
    }
  }

  // === AXI_ADD_EXT: AXI address extension =============================
  if ('AXI_ADD_EXT' in reg && reg.AXI_ADD_EXT.int32 !== undefined) {
    const regValue = reg.AXI_ADD_EXT.int32 >>> 0;
    reg.AXI_ADD_EXT.fields = {};
    reg.AXI_ADD_EXT.report = [];

    reg.AXI_ADD_EXT.fields.VAL = regValue;
    reg.AXI_ADD_EXT.report.push({
      severityLevel: sevC.Info,
      msg: `AXI_ADD_EXT: ${reg.AXI_ADD_EXT.name_long} (0x${reg.AXI_ADD_EXT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[VAL] AXI Address Extension = 0x${reg.AXI_ADD_EXT.fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }

  // === AXI_PARAMS: AXI parameter register =============================
  if ('AXI_PARAMS' in reg && reg.AXI_PARAMS.int32 !== undefined) {
    const regValue = reg.AXI_PARAMS.int32 >>> 0;
    reg.AXI_PARAMS.fields = {};
    reg.AXI_PARAMS.report = [];

    reg.AXI_PARAMS.fields.AR_MAX_PEND = getBits(regValue, 1, 0);
    reg.AXI_PARAMS.fields.AW_MAX_PEND = getBits(regValue, 5, 4);

    const pendMap = (v, kind) => {
      if (v === 0) return '0 (no ' + kind + ' transfers)';
      if (v === 1) return '1 (1 outstanding ' + kind + ' transaction)';
      if (v === 2) return '2 (2 outstanding ' + kind + ' transactions)';
      if (v === 3) return '3 (3 outstanding ' + kind + ' transactions)';
      return `${v}`;
    };

    reg.AXI_PARAMS.report.push({
      severityLevel: sevC.Info,
      msg: `AXI_PARAMS: ${reg.AXI_PARAMS.name_long} (0x${reg.AXI_PARAMS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[AW_MAX_PEND] Max pending AXI writes = ${reg.AXI_PARAMS.fields.AW_MAX_PEND} (${pendMap(reg.AXI_PARAMS.fields.AW_MAX_PEND,'write')})\n` +
           `[AR_MAX_PEND] Max pending AXI reads  = ${reg.AXI_PARAMS.fields.AR_MAX_PEND} (${pendMap(reg.AXI_PARAMS.fields.AR_MAX_PEND,'read')})`
    });
  }

  // === MH_LOCK: Message Handler Lock register =========================
  if ('MH_LOCK' in reg && reg.MH_LOCK.int32 !== undefined) {
    const regValue = reg.MH_LOCK.int32 >>> 0;
    reg.MH_LOCK.fields = {};
    reg.MH_LOCK.report = [];

    reg.MH_LOCK.fields.TMK = getBits(regValue, 31, 16);
    reg.MH_LOCK.fields.ULK = getBits(regValue, 15, 0);

    reg.MH_LOCK.report.push({
      severityLevel: sevC.Info,
      msg: `MH_LOCK: ${reg.MH_LOCK.name_long} (0x${reg.MH_LOCK.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TMK] Test Mode Key = 0x${reg.MH_LOCK.fields.TMK.toString(16).toUpperCase().padStart(4,'0')}\n` +
           `[ULK] Unlock Key    = 0x${reg.MH_LOCK.fields.ULK.toString(16).toUpperCase().padStart(4,'0')}`
    });
  }

} // MH Global


