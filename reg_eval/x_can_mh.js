// X_CAN: MH register decoding
import { getBits } from './help_functions.js';
import { sevC } from './help_functions.js';

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
    reg.VERSION.fields.REL     = getBits(regValue, 31, 28);
    reg.VERSION.fields.STEP    = getBits(regValue, 27, 24);
    reg.VERSION.fields.SUBSTEP = getBits(regValue, 23, 20);
    reg.VERSION.fields.YEAR    = getBits(regValue, 19, 16);
    reg.VERSION.fields.MON     = getBits(regValue, 15,  8);
    reg.VERSION.fields.DAY     = getBits(regValue,  7,  0);

  // 1. Decode all individual bits of MODE register
  // Bit fields (BCD-coded date fields per spec)
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

    // 2. Generate human-readable register report
    reg.VERSION.report.push({
      severityLevel: sevC.Info,
      highlight: true,
      msg: `VERSION: X_CAN MH V${reg.VERSION.fields.REL.toString(16).toUpperCase()}.${reg.VERSION.fields.STEP.toString(16).toUpperCase()}.${reg.VERSION.fields.SUBSTEP.toString(16).toUpperCase()}, Date ${reg.VERSION.fields.DAY.toString(16).toUpperCase().padStart(2,'0')}.${reg.VERSION.fields.MON.toString(16).toUpperCase().padStart(2,'0')}.202${reg.VERSION.fields.YEAR.toString(16).toUpperCase()}`
    });
  } // VERSION

  // === MH_CTRL: Message Handler Control register =======================
  if ('MH_CTRL' in reg && reg.MH_CTRL.int32 !== undefined) {
    const regValue = reg.MH_CTRL.int32;

    // 0. Extend existing register structure
    reg.MH_CTRL.fields = {};
    reg.MH_CTRL.report = [];

    // 1. Decode all individual bits of MODE register
    reg.MH_CTRL.fields.START = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.MH_CTRL.report.push({
      severityLevel: sevC.Info,
      msg: `MH_CTRL: ${reg.MH_CTRL.name_long} (0x${reg.MH_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[START] Start MH = ${reg.MH_CTRL.fields.START} (1: started and MH config. regs. locked)`
    });
  } // MH_CTRL

  // === MH_CFG: Message Handler Configuration register ==================
  if ('MH_CFG' in reg && reg.MH_CFG.int32 !== undefined) {
    const regValue = reg.MH_CFG.int32;

    // 0. Extend existing register structure
    reg.MH_CFG.fields = {};
    reg.MH_CFG.report = [];

    // 1. Decode all individual bits of MODE register
    reg.MH_CFG.fields.INS_NUM     = getBits(regValue, 18, 16);
    reg.MH_CFG.fields.MAX_RETRANS = getBits(regValue, 10, 8);
    reg.MH_CFG.fields.RC_CONT_DC  = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.MH_CFG.report.push({
      severityLevel: sevC.Info,
      msg: `MH_CFG: ${reg.MH_CFG.name_long} (0x${reg.MH_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[INS_NUM    ] Instance Number (of X_CAN IP)     = ${reg.MH_CFG.fields.INS_NUM}\n` +
           `[MAX_RETRANS] Maximum TX re-transmissions       = ${reg.MH_CFG.fields.MAX_RETRANS} (0: NO, 1-6: 1-6, 7: unlimited)\n` +
           `[RC_CONT_DC ] RX Continuous Data Container mode = ${reg.MH_CFG.fields.RC_CONT_DC}`
    });
  } // MH_CFG

  // === MH_STS: Message Handler Status register =======================
  if ('MH_STS' in reg && reg.MH_STS.int32 !== undefined) {
    const regValue = reg.MH_STS.int32;

    // 0. Extend existing register structure
    reg.MH_STS.fields = {};
    reg.MH_STS.report = [];

    // 1. Decode all individual bits of MODE register
    reg.MH_STS.fields.CLOCK_ACTIVE  = getBits(regValue, 8, 8);
    reg.MH_STS.fields.ENABLE        = getBits(regValue, 4, 4);
    reg.MH_STS.fields.BUSY          = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.MH_STS.report.push({
      severityLevel: sevC.Info,
      msg: `MH_STS: ${reg.MH_STS.name_long} (0x${reg.MH_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[CLOCK_ACTIVE] MH Core Clock Active = ${reg.MH_STS.fields.CLOCK_ACTIVE} (1: clock active)\n` +
           `[ENABLE      ] PRT Enable Signal    = ${reg.MH_STS.fields.ENABLE} (1: PRT is started)\n` +
           `[BUSY        ] General Busy Flag    = ${reg.MH_STS.fields.BUSY}`
    });
  }

  // === MH_SFTY_CFG: Safety Configuration =============================
  if ('MH_SFTY_CFG' in reg && reg.MH_SFTY_CFG.int32 !== undefined) {
    const regValue = reg.MH_SFTY_CFG.int32;

    // 0. Extend existing register structure
    reg.MH_SFTY_CFG.fields = {};
    reg.MH_SFTY_CFG.report = [];

    // 1. Decode all individual bits of MODE register
    reg.MH_SFTY_CFG.fields.PRESCALER  = getBits(regValue, 31, 30);
    reg.MH_SFTY_CFG.fields.PRT_TO_VAL = getBits(regValue, 29, 16);
    reg.MH_SFTY_CFG.fields.MEM_TO_VAL = getBits(regValue, 15, 8);
    reg.MH_SFTY_CFG.fields.DMA_TO_VAL = getBits(regValue, 7, 0);

    // 2. Generate human-readable register report
    reg.MH_SFTY_CFG.report.push({
      severityLevel: sevC.Info,
      msg: `MH_SFTY_CFG: ${reg.MH_SFTY_CFG.name_long} (0x${reg.MH_SFTY_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[PRESCALER ] Watchdog Tick Prescaler = ${reg.MH_SFTY_CFG.fields.PRESCALER} (0: clk/32, 1: clk/64, 2: clk/128, 3: clk/512)\n` +
           `[PRT_TO_VAL] PRT/MH IF Timeout Ticks = ${reg.MH_SFTY_CFG.fields.PRT_TO_VAL}\n` +
           `[MEM_TO_VAL] MEM AXI Timeout Ticks   = ${reg.MH_SFTY_CFG.fields.MEM_TO_VAL}\n` +
           `[DMA_TO_VAL] DMA AXI Timeout Ticks   = ${reg.MH_SFTY_CFG.fields.DMA_TO_VAL}`
    });
  }

  // === MH_SFTY_CTRL: Safety Control ==================================
  if ('MH_SFTY_CTRL' in reg && reg.MH_SFTY_CTRL.int32 !== undefined) {
    const regValue = reg.MH_SFTY_CTRL.int32;

    // 0. Extend existing register structure
    reg.MH_SFTY_CTRL.fields = {};
    reg.MH_SFTY_CTRL.report = [];

    // 1. Decode all individual bits of MODE register
    reg.MH_SFTY_CTRL.fields.PRT_TO_EN      = getBits(regValue,10,10);
    reg.MH_SFTY_CTRL.fields.MEM_TO_EN      = getBits(regValue, 9, 9);
    reg.MH_SFTY_CTRL.fields.DMA_TO_EN      = getBits(regValue, 8, 8);
    reg.MH_SFTY_CTRL.fields.DMA_CH_CHK_EN  = getBits(regValue, 7, 7);
    reg.MH_SFTY_CTRL.fields.RX_AP_PARITY_EN= getBits(regValue, 6, 6);
    reg.MH_SFTY_CTRL.fields.TX_AP_PARITY_EN= getBits(regValue, 5, 5);
    reg.MH_SFTY_CTRL.fields.TX_DP_PARITY_EN= getBits(regValue, 4, 4);
    reg.MH_SFTY_CTRL.fields.RX_DP_PARITY_EN= getBits(regValue, 3, 3);
    reg.MH_SFTY_CTRL.fields.MEM_PROT_EN    = getBits(regValue, 2, 2);
    reg.MH_SFTY_CTRL.fields.RX_DESC_CRC_EN = getBits(regValue, 1, 1);
    reg.MH_SFTY_CTRL.fields.TX_DESC_CRC_EN = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.MH_SFTY_CTRL.report.push({
      severityLevel: sevC.Info,
      msg: `MH_SFTY_CTRL: ${reg.MH_SFTY_CTRL.name_long} (0x${reg.MH_SFTY_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
      `[PRT_TO_EN      ] PRT IF Watchdog Enable           = ${reg.MH_SFTY_CTRL.fields.PRT_TO_EN}\n` +
      `[MEM_TO_EN      ] MEM AXI Watchdog Enable          = ${reg.MH_SFTY_CTRL.fields.MEM_TO_EN}\n` +
      `[DMA_TO_EN      ] DMA AXI Watchdog Enable          = ${reg.MH_SFTY_CTRL.fields.DMA_TO_EN}\n` +
      `[DMA_CH_CHK_EN  ] DMA Channel Routing Check Enable = ${reg.MH_SFTY_CTRL.fields.DMA_CH_CHK_EN}\n` +
      `[RX_AP_PARITY_EN] RX Address Path Parity Enable    = ${reg.MH_SFTY_CTRL.fields.RX_AP_PARITY_EN}\n` +
      `[TX_AP_PARITY_EN] TX Address Path Parity Enable    = ${reg.MH_SFTY_CTRL.fields.TX_AP_PARITY_EN}\n` +
      `[TX_DP_PARITY_EN] TX Data Path Parity Enable       = ${reg.MH_SFTY_CTRL.fields.TX_DP_PARITY_EN}\n` +
      `[RX_DP_PARITY_EN] RX Data Path Parity Enable       = ${reg.MH_SFTY_CTRL.fields.RX_DP_PARITY_EN}\n` +
      `[MEM_PROT_EN    ] Memory Protection Enable         = ${reg.MH_SFTY_CTRL.fields.MEM_PROT_EN}\n` +
      `[RX_DESC_CRC_EN ] RX Descriptor CRC Check Enable   = ${reg.MH_SFTY_CTRL.fields.RX_DESC_CRC_EN}\n` +
      `[TX_DESC_CRC_EN ] TX Descriptor CRC Check Enable   = ${reg.MH_SFTY_CTRL.fields.TX_DESC_CRC_EN}`
    });

    // Cross-checks with MH_SFTY_CTRL enable bits if available
    const sftyEna = reg.MH_SFTY_CTRL.fields;
    const sftyToVal = reg.MH_SFTY_CFG && reg.MH_SFTY_CFG.fields ? reg.MH_SFTY_CFG.fields : null;
    if (sftyToVal) {
      if (sftyEna.DMA_TO_EN === 1 && sftyToVal.DMA_TO_VAL === 0) {
        reg.MH_SFTY_CTRL.report.push({ severityLevel: sevC.Warn, msg: 'MH_STY_CTRL: DMA_TO_VAL is 0 while DMA_TO_EN=1: DMA timeout would trigger immediately.' });
      }
      if (sftyEna.MEM_TO_EN === 1 && sftyToVal.MEM_TO_VAL === 0) {
        reg.MH_SFTY_CTRL.report.push({ severityLevel: sevC.Warn, msg: 'MH_STY_CTRL: MEM_TO_VAL is 0 while MEM_TO_EN=1: MEM timeout would trigger immediately.' });
      }
      if (sftyEna.PRT_TO_EN === 1 && sftyToVal.PRT_TO_VAL === 0) {
        reg.MH_SFTY_CTRL.report.push({ severityLevel: sevC.Warn, msg: 'MH_STY_CTRL: PRT_TO_VAL is 0 while PRT_TO_EN=1: PRT timeout would trigger immediately.' });
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
    reg.RX_FILTER_MEM_ADD.fields.BASE_ADDR = getBits(regValue, 15, 0);
    const base = reg.RX_FILTER_MEM_ADD.fields.BASE_ADDR;
    const alignOk = (base & 0x3) === 0;

    // 2. Generate human-readable register report
    reg.RX_FILTER_MEM_ADD.report.push({
      severityLevel: sevC.Info,
      msg: `RX_FILTER_MEM_ADD: ${reg.RX_FILTER_MEM_ADD.name_long} (0x${reg.RX_FILTER_MEM_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[BASE_ADDR] RX Filter Base Address (L_MEM) = 0x${base.toString(16).toUpperCase().padStart(5,'0')} (16 bit, expected bits[1:0]=0)`
    });
    if (!alignOk) {
      reg.RX_FILTER_MEM_ADD.report.push({ severityLevel: sevC.Warn, msg: 'RX_FILTER_MEM_ADD: RX Filter Base Address not word-aligned (LSBs [1:0] should be 0).' });
    }
  }

  // === TX_DESC_MEM_ADD: TX Descriptor Base Address ====================
  if ('TX_DESC_MEM_ADD' in reg && reg.TX_DESC_MEM_ADD.int32 !== undefined) {
    const regValue = reg.TX_DESC_MEM_ADD.int32;

    // 0. Extend existing register structure
    reg.TX_DESC_MEM_ADD.fields = {};
    reg.TX_DESC_MEM_ADD.report = [];

    // 1. Decode all individual bits of MODE register
    reg.TX_DESC_MEM_ADD.fields.PQ_BASE_ADDR = getBits(regValue, 31, 16);
    reg.TX_DESC_MEM_ADD.fields.FQ_BASE_ADDR = getBits(regValue, 15, 0);
    const alignFqOk = (reg.TX_DESC_MEM_ADD.fields.FQ_BASE_ADDR & 0x3) === 0;
    const alignPqOk = (reg.TX_DESC_MEM_ADD.fields.PQ_BASE_ADDR & 0x3) === 0;

    // 2. Generate human-readable register report
    reg.TX_DESC_MEM_ADD.report.push({
      severityLevel: sevC.Info,
      msg: `TX_DESC_MEM_ADD: ${reg.TX_DESC_MEM_ADD.name_long} (0x${reg.TX_DESC_MEM_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[PQ_BASE_ADDR] TX Priority Queue Base Address = 0x${reg.TX_DESC_MEM_ADD.fields.PQ_BASE_ADDR.toString(16).toUpperCase().padStart(4,'0')} (16 bit, expected bits[1:0]=0)\n` +
           `[FQ_BASE_ADDR] TX FIFO Queue Base Address     = 0x${reg.TX_DESC_MEM_ADD.fields.FQ_BASE_ADDR.toString(16).toUpperCase().padStart(4,'0')} (16 bit, expected bits[1:0]=0)`
    });
    if (!alignPqOk) {
      reg.TX_DESC_MEM_ADD.report.push({ severityLevel: sevC.Warn, msg: 'TX_DESC_MEM_ADD: TX PQ Base Address not word-aligned (LSBs [1:0] should be 0).' });
    }
    if (!alignFqOk) {
      reg.TX_DESC_MEM_ADD.report.push({ severityLevel: sevC.Warn, msg: 'TX_DESC_MEM_ADD: TX FQ Base Address not word-aligned (LSBs [1:0] should be 0).' });
    }
  }

  // === AXI_ADD_EXT: AXI address extension =============================
  if ('AXI_ADD_EXT' in reg && reg.AXI_ADD_EXT.int32 !== undefined) {
    const regValue = reg.AXI_ADD_EXT.int32;
    reg.AXI_ADD_EXT.fields = {};
    reg.AXI_ADD_EXT.report = [];

    // 1. Decode all individual bits of MODE register
    reg.AXI_ADD_EXT.fields.VAL = regValue;

    // 2. Generate human-readable register report
    reg.AXI_ADD_EXT.report.push({
      severityLevel: sevC.Info,
      msg: `AXI_ADD_EXT: ${reg.AXI_ADD_EXT.name_long} (0x${reg.AXI_ADD_EXT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[VAL] AXI Address Extension = 0x${reg.AXI_ADD_EXT.fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }

  // === AXI_PARAMS: AXI parameter register =============================
  if ('AXI_PARAMS' in reg && reg.AXI_PARAMS.int32 !== undefined) {
    const regValue = reg.AXI_PARAMS.int32;

    // 0. Extend existing register structure
    reg.AXI_PARAMS.fields = {};
    reg.AXI_PARAMS.report = [];

    // 1. Decode all individual bits of MODE register
    reg.AXI_PARAMS.fields.AW_MAX_PEND = getBits(regValue, 5, 4);
    reg.AXI_PARAMS.fields.AR_MAX_PEND = getBits(regValue, 1, 0);

    // 2. Generate human-readable register report
    const pendMap = (v, kind) => {
      if (v === 0) return 'no ' + kind + ' transfers';
      if (v === 1) return '1 outstanding ' + kind + ' transaction';
      if (v === 2) return '2 outstanding ' + kind + ' transactions';
      if (v === 3) return '3 outstanding ' + kind + ' transactions  ';
      return `${v}`;
    };

    reg.AXI_PARAMS.report.push({
      severityLevel: sevC.Info,
      msg: `AXI_PARAMS: ${reg.AXI_PARAMS.name_long} (0x${reg.AXI_PARAMS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[AW_MAX_PEND] Max pending AXI writes = ${reg.AXI_PARAMS.fields.AW_MAX_PEND} (= ${pendMap(reg.AXI_PARAMS.fields.AW_MAX_PEND,'write')})\n` +
           `[AR_MAX_PEND] Max pending AXI reads  = ${reg.AXI_PARAMS.fields.AR_MAX_PEND} (= ${pendMap(reg.AXI_PARAMS.fields.AR_MAX_PEND,'read ')})`
    });
  }

  // === MH_LOCK: Message Handler Lock register =========================
  if ('MH_LOCK' in reg && reg.MH_LOCK.int32 !== undefined) {
    const regValue = reg.MH_LOCK.int32;

    // 0. Extend existing register structure
    reg.MH_LOCK.fields = {};
    reg.MH_LOCK.report = [];

    // 1. Decode all individual bits of MODE register
    reg.MH_LOCK.fields.TMK = getBits(regValue, 31, 16);
    reg.MH_LOCK.fields.ULK = getBits(regValue, 15, 0);

    // 2. Generate human-readable register report
    reg.MH_LOCK.report.push({
      severityLevel: sevC.Info,
      msg: `MH_LOCK: ${reg.MH_LOCK.name_long} (0x${reg.MH_LOCK.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TMK] Test Mode Key = 0x${reg.MH_LOCK.fields.TMK.toString(16).toUpperCase().padStart(4,'0')}\n` +
           `[ULK] Unlock Key    = 0x${reg.MH_LOCK.fields.ULK.toString(16).toUpperCase().padStart(4,'0')}`
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
    reg.TX_DESC_ADD_PT.fields.VAL = getBits(regValue, 31, 0);

    // 2. Generate human-readable register report
    reg.TX_DESC_ADD_PT.report.push({
      severityLevel: sevC.Info,
      msg: `TX_DESC_ADD_PT: ${reg.TX_DESC_ADD_PT.name_long} (0x${reg.TX_DESC_ADD_PT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[VAL] TX Descriptor Address (SMEM) Currently used by MH = 0x${reg.TX_DESC_ADD_PT.fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }

  // === TX_STATISTICS: TX Message Counter =============================
  if ('TX_STATISTICS' in reg && reg.TX_STATISTICS.int32 !== undefined) {
    const regValue = reg.TX_STATISTICS.int32;

    // 0. Extend existing register structure
    reg.TX_STATISTICS.fields = {};
    reg.TX_STATISTICS.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    reg.TX_STATISTICS.fields.UNSUCC = getBits(regValue, 27, 16);
    reg.TX_STATISTICS.fields.SUCC   = getBits(regValue, 11, 0);

    // 2. Generate human-readable register report
    reg.TX_STATISTICS.report.push({
      severityLevel: sevC.Info,
      msg: `TX_STATISTICS: ${reg.TX_STATISTICS.name_long} (0x${reg.TX_STATISTICS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[UNSUCC] Unsuccessful TX Count = ${reg.TX_STATISTICS.fields.UNSUCC}\n` +
           `[SUCC  ] Successful   TX Count = ${reg.TX_STATISTICS.fields.SUCC}`
    });
  }

  // === TX_FQ_STS0: TX FIFO Queue Status (BUSY/STOP) ==================
  if ('TX_FQ_STS0' in reg && reg.TX_FQ_STS0.int32 !== undefined) {
    const regValue = reg.TX_FQ_STS0.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_STS0.fields = {};
    reg.TX_FQ_STS0.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    reg.TX_FQ_STS0.fields.STOP = getBits(regValue, 23, 16);
    reg.TX_FQ_STS0.fields.BUSY = getBits(regValue, 7, 0);

    const stopIdx = listSetIdx8(reg.TX_FQ_STS0.fields.STOP);
    const busyIdx = listSetIdx8(reg.TX_FQ_STS0.fields.BUSY);

    // 2. Generate human-readable register report
    reg.TX_FQ_STS0.report.push({
      severityLevel: sevC.Info,
      msg: `TX_FQ_STS0: ${reg.TX_FQ_STS0.name_long} (0x${reg.TX_FQ_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[STOP] On Hold Queues = 0x${reg.TX_FQ_STS0.fields.STOP.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${stopIdx.length?stopIdx.join(', '):'none'}\n` +
           `[BUSY] Active  Queues = 0x${reg.TX_FQ_STS0.fields.BUSY.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${busyIdx.length?busyIdx.join(', '):'none'}`
    });
  }

  // === TX_FQ_STS1: TX FIFO Queue Status (UNVALID/ERROR) ==============
  if ('TX_FQ_STS1' in reg && reg.TX_FQ_STS1.int32 !== undefined) {
    const regValue = reg.TX_FQ_STS1.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_STS1.fields = {};
    reg.TX_FQ_STS1.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    reg.TX_FQ_STS1.fields.ERROR   = getBits(regValue, 23, 16);
    reg.TX_FQ_STS1.fields.UNVALID = getBits(regValue, 7, 0);

    const errIdx = listSetIdx8(reg.TX_FQ_STS1.fields.ERROR);
    const invIdx = listSetIdx8(reg.TX_FQ_STS1.fields.UNVALID);

    // 2. Generate human-readable register report
    reg.TX_FQ_STS1.report.push({
      severityLevel: sevC.Info,
      msg: `TX_FQ_STS1: ${reg.TX_FQ_STS1.name_long} (0x${reg.TX_FQ_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ERROR  ] Descriptor with ERROR   Queues = 0x${reg.TX_FQ_STS1.fields.ERROR.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${errIdx.length?errIdx.join(', '):'none'}\n` +
           `[UNVALID] Descriptor with VALID=0 Queues = 0x${reg.TX_FQ_STS1.fields.UNVALID.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${invIdx.length?invIdx.join(', '):'none'}`
    });
  }

  // === TX_FQ_CTRL2: TX FIFO Queue Control 2 (ENABLE) =================
  if ('TX_FQ_CTRL2' in reg && reg.TX_FQ_CTRL2.int32 !== undefined) {
    const regValue = reg.TX_FQ_CTRL2.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_CTRL2.fields = {};
    reg.TX_FQ_CTRL2.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    reg.TX_FQ_CTRL2.fields.ENABLE = getBits(regValue, 7, 0);
    const enaIdx = listSetIdx8(reg.TX_FQ_CTRL2.fields.ENABLE);

    // 2. Generate human-readable register report
    reg.TX_FQ_CTRL2.report.push({
      severityLevel: sevC.Info,
      msg: `TX_FQ_CTRL2: ${reg.TX_FQ_CTRL2.name_long} (0x${reg.TX_FQ_CTRL2.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ENABLE] Enabled Queues = 0x${reg.TX_FQ_CTRL2.fields.ENABLE.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${enaIdx.length?enaIdx.join(', '):'none'}`
    });
  }

  // === TX_FQ_CTRL1: TX FIFO Queue Control 1 (ABORT) ==================
  if ('TX_FQ_CTRL1' in reg && reg.TX_FQ_CTRL1.int32 !== undefined) {
    const regValue = reg.TX_FQ_CTRL1.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_CTRL1.fields = {};
    reg.TX_FQ_CTRL1.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    reg.TX_FQ_CTRL1.fields.ABORT = getBits(regValue, 7, 0);
    const abortIdx = listSetIdx8(reg.TX_FQ_CTRL1.fields.ABORT);

    // 2. Generate human-readable register report
    reg.TX_FQ_CTRL1.report.push({
      severityLevel: sevC.Info,
      msg: `TX_FQ_CTRL1: ${reg.TX_FQ_CTRL1.name_long} (0x${reg.TX_FQ_CTRL1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ABORT] Aborted Queues = 0x${reg.TX_FQ_CTRL1.fields.ABORT.toString(16).toUpperCase().padStart(2,'0')}  => FIFOs: ${abortIdx.length?abortIdx.join(', '):'none'}`
    });
  }

  // === TX_FQ_CTRL0: TX FIFO Queue Control 0 (START) ==================
  if ('TX_FQ_CTRL0' in reg && reg.TX_FQ_CTRL0.int32 !== undefined) {
    const regValue = reg.TX_FQ_CTRL0.int32;

    // 0. Extend existing register structure
    reg.TX_FQ_CTRL0.fields = {};
    reg.TX_FQ_CTRL0.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    reg.TX_FQ_CTRL0.fields.START = getBits(regValue, 7, 0);
    const startIdx = listSetIdx8(reg.TX_FQ_CTRL0.fields.START);

    // 2. Generate human-readable register report
    reg.TX_FQ_CTRL0.report.push({
      severityLevel: sevC.Info,
      msg: `TX_FQ_CTRL0: ${reg.TX_FQ_CTRL0.name_long} (0x${reg.TX_FQ_CTRL0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[START] Started Queues = 0x${reg.TX_FQ_CTRL0.fields.START.toString(16).toUpperCase().padStart(2,'0')}) => FIFOs: ${startIdx.length?startIdx.join(', '):'none'}`
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
        reg.TX_FQ_CTRL0.report.push({ severityLevel: sevC.Warn, msg: `TX_FQ_CTRL0: START requested for disabled queues: ${notEnabled.join(', ')}` });
      }
    }
    if (startIdx.length && prtEnable === 0) {
      reg.TX_FQ_CTRL0.report.push({ severityLevel: sevC.Warn, msg: 'TX_FQ_CTRL0: START requested while PRT ENABLE=0 (MH_STS.ENABLE=0).' });
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
      reg[addPtName].fields.VAL = getBits(regValue, 31, 0);
      reg[addPtName].report.push({
        severityLevel: sevC.Info,
        msg: `${addPtName}: ${reg[addPtName].name_long} (0x${reg[addPtName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[VAL] TXFQ${q} Head Descriptor Address (SMEM) = 0x${reg[addPtName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
      });
    }

    // --- Start Address (Queue q) -------------------------------------
    if (startAddName in reg && reg[startAddName].int32 !== undefined) {
      const regValue = reg[startAddName].int32;
      reg[startAddName].fields = {};
      reg[startAddName].report = [];
      reg[startAddName].fields.VAL = getBits(regValue, 31, 0);
      const alignOk = (regValue & 0x3) === 0;
      reg[startAddName].report.push({
        severityLevel: sevC.Info,
        msg: `${startAddName}: ${reg[startAddName].name_long} (0x${reg[startAddName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[VAL] TXFQ${q} Start Address (SMEM)           = 0x${reg[startAddName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
      });
      if (!alignOk) {
        reg[startAddName].report.push({ severityLevel: sevC.Warn, msg: `${startAddName}: Address not word-aligned (LSBs [1:0] should be 0).` });
      }
    }

    // --- Size Register (Queue q) ------------------------------------
    if (sizeName in reg && reg[sizeName].int32 !== undefined) {
      const regValue = reg[sizeName].int32;
      reg[sizeName].fields = {};
      reg[sizeName].report = [];
      reg[sizeName].fields.MAX_DESC = getBits(regValue, 9, 0);
      const maxDesc = reg[sizeName].fields.MAX_DESC;
      const memBytes = maxDesc > 0 ? (maxDesc * 32) >>> 0 : 0;
      reg[sizeName].report.push({
        severityLevel: sevC.Info,
        msg: `${sizeName}: ${reg[sizeName].name_long} (0x${reg[sizeName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[MAX_DESC] TXFQ${q} Max Descriptors = ${maxDesc}${maxDesc>0?` (allocate ${memBytes} bytes in S_MEM)`:''}`
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

      const startRegVal = (startAddName in reg && reg[startAddName].fields && 'VAL' in reg[startAddName].fields) ? ('0x'+reg[startAddName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')) : '-';
      const addPtRegVal = (addPtName in reg && reg[addPtName].fields && 'VAL' in reg[addPtName].fields) ? ('0x'+reg[addPtName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')) : '-';
      const sizeVal     = (sizeName in reg && reg[sizeName].fields && 'MAX_DESC' in reg[sizeName].fields) ? (''+reg[sizeName].fields.MAX_DESC) : '-';

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
      severityLevel: sevC.Info,
      highlight: true,
      msg: 'TX FIFO Queues Summary\n' + lines.join('\n')
    });
  } catch (e) {
    // On error create a dedicated synthetic register entry so the issue is clearly shown.
    const msg = 'TX FIFO summary generation failed: ' + (e && e.message ? e.message : e);
    if (!reg._TX_FIFO_SUMMARY) {
      reg._TX_FIFO_SUMMARY = { name_long: 'TX FIFO Summary (error)', report: [] };
    }
    if (!Array.isArray(reg._TX_FIFO_SUMMARY.report)) reg._TX_FIFO_SUMMARY.report = [];
    reg._TX_FIFO_SUMMARY.report.push({ severityLevel: sevC.Warn, highlight: true, msg });
  }
}
