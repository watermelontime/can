// X_CAN: MH register decoding
import { getBits } from './help_functions.js';
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
    reg.VERSION.fields.REL     = getBits(regValue, 31, 28);
    reg.VERSION.fields.STEP    = getBits(regValue, 27, 24);
    reg.VERSION.fields.SUBSTEP = getBits(regValue, 23, 20);
    reg.VERSION.fields.YEAR    = getBits(regValue, 19, 16);
    reg.VERSION.fields.MON     = getBits(regValue, 15,  8);
    reg.VERSION.fields.DAY     = getBits(regValue,  7,  0);

  // 1. Decode all individual bits of MODE register
  // Bit fields (BCD-coded date fields per spec)
    reg.VERSION.report.push({
      severityLevel: sevC.info,
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
      severityLevel: sevC.infoHighlighted,
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
      severityLevel: sevC.info,
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
    reg.MH_CFG.fields.RX_CONT_DC  = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.MH_CFG.report.push({
      severityLevel: sevC.info,
      msg: `MH_CFG: ${reg.MH_CFG.name_long} (0x${reg.MH_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[INST_NUM   ] Instance Number (of X_CAN IP)     = ${reg.MH_CFG.fields.INS_NUM}\n` +
           `[MAX_RETRANS] Maximum TX re-transmissions       = ${reg.MH_CFG.fields.MAX_RETRANS} (0: NO, 1-6: 1-6, 7: unlimited)\n` +
           `[RX_CONT_DC ] RX Continuous Data Container mode = ${reg.MH_CFG.fields.RX_CONT_DC}`
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
      severityLevel: sevC.info,
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
      severityLevel: sevC.info,
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
      severityLevel: sevC.info,
      msg: `MH_SFTY_CTRL: ${reg.MH_SFTY_CTRL.name_long} (0x${reg.MH_SFTY_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
      `[PRT_TO_EN      ] PRT IF  Watchdog Enable          = ${reg.MH_SFTY_CTRL.fields.PRT_TO_EN}\n` +
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
        reg.MH_SFTY_CTRL.report.push({ severityLevel: sevC.warning, msg: 'MH_STY_CTRL: DMA_TO_VAL is 0 while DMA_TO_EN=1: DMA timeout triggers immediately.'});
      }
      if (sftyEna.MEM_TO_EN === 1 && sftyToVal.MEM_TO_VAL === 0) {
        reg.MH_SFTY_CTRL.report.push({ severityLevel: sevC.warning, msg: 'MH_STY_CTRL: MEM_TO_VAL is 0 while MEM_TO_EN=1: MEM timeout triggers immediately.'});
      }
      if (sftyEna.PRT_TO_EN === 1 && sftyToVal.PRT_TO_VAL === 0) {
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
    reg.RX_FILTER_MEM_ADD.fields.BASE_ADDR = getBits(regValue, 15, 0);
    const base = reg.RX_FILTER_MEM_ADD.fields.BASE_ADDR;
    const alignOk = (base & 0x3) === 0;

    // 2. Generate human-readable register report
    reg.RX_FILTER_MEM_ADD.report.push({
      severityLevel: sevC.info,
      msg: `RX_FILTER_MEM_ADD: ${reg.RX_FILTER_MEM_ADD.name_long} (0x${reg.RX_FILTER_MEM_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[BASE_ADDR] RX Filter Base Address (L_MEM) = 0x${base.toString(16).toUpperCase().padStart(5,'0')} (16 bit, expected bits[1:0]=0)`
    });

    // 3. Check Address Alignment
    if ((reg.RX_FILTER_MEM_ADD.fields.BASE_ADDR & 0x3) !== 0) {
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
    reg.TX_DESC_MEM_ADD.fields.PQ_BASE_ADDR = getBits(regValue, 31, 16);
    reg.TX_DESC_MEM_ADD.fields.FQ_BASE_ADDR = getBits(regValue, 15, 0);
    const alignFqOk = (reg.TX_DESC_MEM_ADD.fields.FQ_BASE_ADDR & 0x3) === 0;
    const alignPqOk = (reg.TX_DESC_MEM_ADD.fields.PQ_BASE_ADDR & 0x3) === 0;

    // 2. Generate human-readable register report
    reg.TX_DESC_MEM_ADD.report.push({
      severityLevel: sevC.info,
      msg: `TX_DESC_MEM_ADD: ${reg.TX_DESC_MEM_ADD.name_long} (0x${reg.TX_DESC_MEM_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[PQ_BASE_ADDR] TX Priority Queue Base Address = 0x${reg.TX_DESC_MEM_ADD.fields.PQ_BASE_ADDR.toString(16).toUpperCase().padStart(4,'0')} (16 bit, expected bits[1:0]=0)\n` +
           `[FQ_BASE_ADDR] TX FIFO Queue Base Address     = 0x${reg.TX_DESC_MEM_ADD.fields.FQ_BASE_ADDR.toString(16).toUpperCase().padStart(4,'0')} (16 bit, expected bits[1:0]=0)`
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
    reg.AXI_ADD_EXT.fields.VAL = regValue;

    // 2. Generate human-readable register report
    reg.AXI_ADD_EXT.report.push({
      severityLevel: sevC.info,
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
      severityLevel: sevC.info,
      msg: `AXI_PARAMS: ${reg.AXI_PARAMS.name_long} (0x${reg.AXI_PARAMS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[AW_MAX_PEND] Max pending AXI writes = ${reg.AXI_PARAMS.fields.AW_MAX_PEND} (= ${pendMap(reg.AXI_PARAMS.fields.AW_MAX_PEND,'write')})\n` +
           `[AR_MAX_PEND] Max pending AXI reads  = ${reg.AXI_PARAMS.fields.AR_MAX_PEND} (= ${pendMap(reg.AXI_PARAMS.fields.AR_MAX_PEND,'read ')})`
    });

    // 3. Check AW_MAX_PEND and AR_MAX_PEND values
    if (reg.AXI_PARAMS.fields.AW_MAX_PEND === 0) {
      reg.AXI_PARAMS.report.push({ severityLevel: sevC.error, msg: 'AXI_PARAMS: AW_MAX_PEND is 0: No AXI write transfers possible.'});
    }

    // Check AR_MAX_PEND and AR_MAX_PEND values
    if (reg.AXI_PARAMS.fields.AR_MAX_PEND === 0) {
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
    reg.MH_LOCK.fields.TMK = getBits(regValue, 31, 16);
    reg.MH_LOCK.fields.ULK = getBits(regValue, 15, 0);

    // 2. Generate human-readable register report
    reg.MH_LOCK.report.push({
      severityLevel: sevC.info,
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
      severityLevel: sevC.info,
      msg: `TX_DESC_ADD_PT: ${reg.TX_DESC_ADD_PT.name_long} (0x${reg.TX_DESC_ADD_PT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[VAL] TX Descriptor Address (SMEM) currently used by MH = 0x${reg.TX_DESC_ADD_PT.fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
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
      severityLevel: sevC.info,
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
      severityLevel: sevC.info,
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
      severityLevel: sevC.info,
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
      severityLevel: sevC.info,
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
      severityLevel: sevC.info,
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
      severityLevel: sevC.info,
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
      reg[addPtName].fields.VAL = getBits(regValue, 31, 0);
      reg[addPtName].report.push({
        severityLevel: sevC.info,
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
        severityLevel: sevC.info,
        msg: `${startAddName}: ${reg[startAddName].name_long} (0x${reg[startAddName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[VAL] TXFQ${q} Start Address (SMEM)           = 0x${reg[startAddName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
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
      reg[sizeName].fields.MAX_DESC = getBits(regValue, 9, 0);
      const maxDesc = reg[sizeName].fields.MAX_DESC;
      const memBytes = maxDesc > 0 ? (maxDesc * 32) >>> 0 : 0;
      reg[sizeName].report.push({
        severityLevel: sevC.info,
        msg: `${sizeName}: ${reg[sizeName].name_long} (0x${reg[sizeName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[MAX_DESC] TXFQ${q} Max Descriptors = ${maxDesc}${maxDesc>0?` (allocates ${memBytes} bytes in S_MEM)`:''}`
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
      severityLevel: sevC.infoHighlighted,
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
    reg.TX_PQ_STS0.fields.BUSY = getBits(regValue, 31, 0);

    // 2. Generate human-readable register report
    const busyIdx = listSetIdx32(reg.TX_PQ_STS0.fields.BUSY);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);

    reg.TX_PQ_STS0.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_STS0: ${reg.TX_PQ_STS0.name_long} (0x${reg.TX_PQ_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[BUSY] Active Slots (TX Pending) = 0x${reg.TX_PQ_STS0.fields.BUSY.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${busyIdx.length?busyIdx.join(', '):'none'}\n` +
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
    reg.TX_PQ_STS1.fields.SENT = getBits(regValue, 31, 0);

    // 2. Generate human-readable register report
    const sentIdx = listSetIdx32(reg.TX_PQ_STS1.fields.SENT);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);
    reg.TX_PQ_STS1.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_STS1: ${reg.TX_PQ_STS1.name_long} (0x${reg.TX_PQ_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[SENT] Sent (TX Desc. SMEM update) = 0x${reg.TX_PQ_STS1.fields.SENT.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${sentIdx.length?sentIdx.join(', '):'none'}\n` +
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
    reg.TX_PQ_CTRL0.fields.START = getBits(regValue, 31, 0);

    // 2. Generate human-readable register report
    const startIdx = listSetIdx32(reg.TX_PQ_CTRL0.fields.START);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);    
    reg.TX_PQ_CTRL0.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_CTRL0: ${reg.TX_PQ_CTRL0.name_long} (0x${reg.TX_PQ_CTRL0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[START] Started Slots              = 0x${reg.TX_PQ_CTRL0.fields.START.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${startIdx.length?startIdx.join(', '):'none'}\n` +
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
    reg.TX_PQ_CTRL1.fields.ABORT = getBits(regValue, 31, 0);

    // 2. Generate human-readable register report
    const abortIdx = listSetIdx32(reg.TX_PQ_CTRL1.fields.ABORT);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);    
    reg.TX_PQ_CTRL1.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_CTRL1: ${reg.TX_PQ_CTRL1.name_long} (0x${reg.TX_PQ_CTRL1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ABORT] Aborted Slots (requested)  = 0x${reg.TX_PQ_CTRL1.fields.ABORT.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${abortIdx.length?abortIdx.join(', '):'none'}\n` +
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
    reg.TX_PQ_CTRL2.fields.ENABLE = getBits(regValue, 31, 0);

    // 2. Generate human-readable register report
    const enaIdx = listSetIdx32(reg.TX_PQ_CTRL2.fields.ENABLE);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);    
    reg.TX_PQ_CTRL2.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_CTRL2: ${reg.TX_PQ_CTRL2.name_long} (0x${reg.TX_PQ_CTRL2.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ENABLE] Enabled Slots             = 0x${reg.TX_PQ_CTRL2.fields.ENABLE.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${enaIdx.length?enaIdx.join(', '):'none'}\n` +
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
    reg.TX_PQ_START_ADD.fields.VAL = getBits(regValue, 31, 0);
    const alignOk = (regValue & 0x3) === 0;

    // 2. Generate human-readable register report
    reg.TX_PQ_START_ADD.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_START_ADD: ${reg.TX_PQ_START_ADD.name_long} (0x${reg.TX_PQ_START_ADD.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[VAL] TXPQ Start Address (SMEM) = 0x${reg.TX_PQ_START_ADD.fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
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

    const getVal = (r, f) => (r in reg && reg[r].fields && f in reg[r].fields) ? reg[r].fields[f] : null;
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
        severityLevel: sevC.infoHighlighted,
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
    reg.RX_DESC_ADD_PT.fields.VAL = getBits(regValue, 31, 0);

    // 2. Generate human-readable register report
    reg.RX_DESC_ADD_PT.report.push({
      severityLevel: sevC.info,
      msg: `RX_DESC_ADD_PT: ${reg.RX_DESC_ADD_PT.name_long} (0x${reg.RX_DESC_ADD_PT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[VAL] RX Descriptor Address (SMEM) currently used by MH = 0x${reg.RX_DESC_ADD_PT.fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }

  // === RX_STATISTICS: RX Message Counter =============================
  if ('RX_STATISTICS' in reg && reg.RX_STATISTICS.int32 !== undefined) {
    const regValue = reg.RX_STATISTICS.int32;

    // 0. Extend existing register structure
    reg.RX_STATISTICS.fields = {};
    reg.RX_STATISTICS.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    reg.RX_STATISTICS.fields.UNSUCC = getBits(regValue, 27, 16); // unsuccessful receptions
    reg.RX_STATISTICS.fields.SUCC   = getBits(regValue, 11, 0);  // successful receptions

    // 2. Generate human-readable register report
    reg.RX_STATISTICS.report.push({
      severityLevel: sevC.info,
      msg: `RX_STATISTICS: ${reg.RX_STATISTICS.name_long} (0x${reg.RX_STATISTICS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[UNSUCC] Unsuccessful RX Count = ${reg.RX_STATISTICS.fields.UNSUCC}\n` +
           `[SUCC  ] Successful   RX Count = ${reg.RX_STATISTICS.fields.SUCC}`
    });
  }

  // === RX_FQ_STS0: RX FIFO Queue Status (BUSY/STOP) ==================
  if ('RX_FQ_STS0' in reg && reg.RX_FQ_STS0.int32 !== undefined) {
    const regValue = reg.RX_FQ_STS0.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_STS0.fields = {};
    reg.RX_FQ_STS0.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    reg.RX_FQ_STS0.fields.STOP = getBits(regValue, 23, 16);
    reg.RX_FQ_STS0.fields.BUSY = getBits(regValue, 7, 0);

    const stopIdx = listSetIdx8(reg.RX_FQ_STS0.fields.STOP);
    const busyIdx = listSetIdx8(reg.RX_FQ_STS0.fields.BUSY);

    // 2. Generate human-readable register report
    reg.RX_FQ_STS0.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_STS0: ${reg.RX_FQ_STS0.name_long} (0x${reg.RX_FQ_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[STOP] On Hold Queues = 0x${reg.RX_FQ_STS0.fields.STOP.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${stopIdx.length?stopIdx.join(', '):'none'}\n` +
           `[BUSY] Active  Queues = 0x${reg.RX_FQ_STS0.fields.BUSY.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${busyIdx.length?busyIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_STS1: RX FIFO Queue Status (UNVALID/ERROR) ==============
  if ('RX_FQ_STS1' in reg && reg.RX_FQ_STS1.int32 !== undefined) {
    const regValue = reg.RX_FQ_STS1.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_STS1.fields = {};
    reg.RX_FQ_STS1.report = [];

    // 1. Decode all individual bits of register (MSB -> LSB)
    reg.RX_FQ_STS1.fields.ERROR   = getBits(regValue, 23, 16);
    reg.RX_FQ_STS1.fields.UNVALID = getBits(regValue, 7, 0);

    const errIdx = listSetIdx8(reg.RX_FQ_STS1.fields.ERROR);
    const invIdx = listSetIdx8(reg.RX_FQ_STS1.fields.UNVALID);

    // 2. Generate human-readable register report
    reg.RX_FQ_STS1.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_STS1: ${reg.RX_FQ_STS1.name_long} (0x${reg.RX_FQ_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ERROR  ] Descriptor with ERROR   Queues = 0x${reg.RX_FQ_STS1.fields.ERROR.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${errIdx.length?errIdx.join(', '):'none'}\n` +
           `[UNVALID] Descriptor with VALID=0 Queues = 0x${reg.RX_FQ_STS1.fields.UNVALID.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${invIdx.length?invIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_STS2: RX FIFO Queue Status (DC_FULL) ===================
  if ('RX_FQ_STS2' in reg && reg.RX_FQ_STS2.int32 !== undefined) {
    const regValue = reg.RX_FQ_STS2.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_STS2.fields = {};
    reg.RX_FQ_STS2.report = [];

    // 1. Decode bits (MSB -> LSB) only DC_FULL[7:0]
    reg.RX_FQ_STS2.fields.DC_FULL = getBits(regValue, 7, 0);
    const fullIdx = listSetIdx8(reg.RX_FQ_STS2.fields.DC_FULL);

    // 2. Generate report
    reg.RX_FQ_STS2.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_STS2: ${reg.RX_FQ_STS2.name_long} (0x${reg.RX_FQ_STS2.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[DC_FULL] Data Container Full for Queues = 0x${reg.RX_FQ_STS2.fields.DC_FULL.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${fullIdx.length?fullIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_CTRL0: RX FIFO Queue Control 0 (START) ==================
  if ('RX_FQ_CTRL0' in reg && reg.RX_FQ_CTRL0.int32 !== undefined) {
    const regValue = reg.RX_FQ_CTRL0.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_CTRL0.fields = {};
    reg.RX_FQ_CTRL0.report = [];

    // 1. Decode
    reg.RX_FQ_CTRL0.fields.START = getBits(regValue, 7, 0);
    const startIdx = listSetIdx8(reg.RX_FQ_CTRL0.fields.START);

    // 2. Report
    reg.RX_FQ_CTRL0.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_CTRL0: ${reg.RX_FQ_CTRL0.name_long} (0x${reg.RX_FQ_CTRL0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[START] Started Queues = 0x${reg.RX_FQ_CTRL0.fields.START.toString(16).toUpperCase().padStart(2,'0')}) => FIFOs: ${startIdx.length?startIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_CTRL1: RX FIFO Queue Control 1 (ABORT) ==================
  if ('RX_FQ_CTRL1' in reg && reg.RX_FQ_CTRL1.int32 !== undefined) {
    const regValue = reg.RX_FQ_CTRL1.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_CTRL1.fields = {};
    reg.RX_FQ_CTRL1.report = [];

    // 1. Decode
    reg.RX_FQ_CTRL1.fields.ABORT = getBits(regValue, 7, 0);
    const abortIdx = listSetIdx8(reg.RX_FQ_CTRL1.fields.ABORT);

    // 2. Report
    reg.RX_FQ_CTRL1.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_CTRL1: ${reg.RX_FQ_CTRL1.name_long} (0x${reg.RX_FQ_CTRL1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ABORT] Aborted Queues = 0x${reg.RX_FQ_CTRL1.fields.ABORT.toString(16).toUpperCase().padStart(2,'0')}  => FIFOs: ${abortIdx.length?abortIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_CTRL2: RX FIFO Queue Control 2 (ENABLE) =================
  if ('RX_FQ_CTRL2' in reg && reg.RX_FQ_CTRL2.int32 !== undefined) {
    const regValue = reg.RX_FQ_CTRL2.int32;

    // 0. Extend existing register structure
    reg.RX_FQ_CTRL2.fields = {};
    reg.RX_FQ_CTRL2.report = [];

    // 1. Decode
    reg.RX_FQ_CTRL2.fields.ENABLE = getBits(regValue, 7, 0);
    const enaIdx = listSetIdx8(reg.RX_FQ_CTRL2.fields.ENABLE);

    // 2. Report
    reg.RX_FQ_CTRL2.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_CTRL2: ${reg.RX_FQ_CTRL2.name_long} (0x${reg.RX_FQ_CTRL2.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ENABLE] Enabled Queues = 0x${reg.RX_FQ_CTRL2.fields.ENABLE.toString(16).toUpperCase().padStart(2,'0')} => FIFOs: ${enaIdx.length?enaIdx.join(', '):'none'}`
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
      reg[addPtName].fields.VAL = getBits(regValue, 31, 0);
      reg[addPtName].report.push({
        severityLevel: sevC.info,
        msg: `${addPtName}: ${reg[addPtName].name_long} (0x${reg[addPtName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[VAL] RXFQ${q} Current Descriptor Address (SMEM) = 0x${reg[addPtName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
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
        severityLevel: sevC.info,
        msg: `${startAddName}: ${reg[startAddName].name_long} (0x${reg[startAddName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[VAL] RXFQ${q} Start Address (SMEM)                = 0x${reg[startAddName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
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
      reg[sizeName].fields.DC_SIZE  = getBits(regValue, 27, 16); // data container size units
      reg[sizeName].fields.MAX_DESC = getBits(regValue,  9,  0); // link list descriptors
      const maxDesc = reg[sizeName].fields.MAX_DESC;
      const dcSize = reg[sizeName].fields.DC_SIZE; // units of 32 bytes (normal: per desc; continuous: whole container)
      const descBytes = maxDesc > 0 ? (maxDesc * 16) >>> 0 : 0; // RX descriptors 16 bytes each
      let dcInfo = '';
      if (dcSize > 0) dcInfo = ` (in Normal Mode = ${getBits(dcSize, 6, 0)* 32} byte; in Continuous Mode = ${dcSize * 32} byte)`;
      reg[sizeName].report.push({
        severityLevel: sevC.info,
        msg: `${sizeName}: ${reg[sizeName].name_long} (0x${reg[sizeName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[DC_SIZE ] RXFQ${q} Data Container Size = ${dcSize}${dcInfo}\n` +
             `[MAX_DESC] RXFQ${q} Size                = ${maxDesc}${maxDesc>0?` (Descriptors allocate ${descBytes} byte in S_MEM)`:''}`
      });
    }

    // --- Data Container Start Address (Continuous Mode) -------------
    if (dcStartAddName in reg && reg[dcStartAddName].int32 !== undefined) {
      const regValue = reg[dcStartAddName].int32;
      reg[dcStartAddName].fields = {};
      reg[dcStartAddName].report = [];
      reg[dcStartAddName].fields.VAL = getBits(regValue, 31, 0);
      const alignOk = (regValue & 0x3) === 0;
      reg[dcStartAddName].report.push({
        severityLevel: sevC.info,
        msg: `${dcStartAddName}: ${reg[dcStartAddName].name_long} (0x${reg[dcStartAddName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[VAL] RXFQ${q} Data Container Start Address (SMEM) = 0x${reg[dcStartAddName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
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
      reg[rdAddPtName].fields.VAL = getBits(regValue, 31, 0);
      const initialSpecial = (regValue & 0x3) === 0x3; // initial required 0b11 for start according to manual
      const alignedLater   = (regValue & 0x3) === 0x0; // after initial should be aligned
      reg[rdAddPtName].report.push({
        severityLevel: sevC.info,
        msg: `${rdAddPtName}: ${reg[rdAddPtName].name_long} (0x${reg[rdAddPtName].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
             `[VAL] RXFQ${q} Data Container Read Address (SMEM)  = 0x${reg[rdAddPtName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')}`
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

      const startRegVal = (startAddName in reg && reg[startAddName].fields && 'VAL' in reg[startAddName].fields) ? ('0x'+reg[startAddName].fields.VAL.toString(16).toUpperCase().padStart(8,'0')) : '-';
      const addPtRegVal = (addPtName   in reg && reg[addPtName].fields   && 'VAL' in reg[addPtName].fields)   ? ('0x'+reg[addPtName].fields.VAL.toString(16).toUpperCase().padStart(8,'0'))   : '-';
      const sizeVal     = (sizeName    in reg && reg[sizeName].fields    && 'MAX_DESC' in reg[sizeName].fields)? (''+reg[sizeName].fields.MAX_DESC) : '-';
      const dcSizeVal   = (sizeName    in reg && reg[sizeName].fields    && 'DC_SIZE'  in reg[sizeName].fields)? (''+reg[sizeName].fields.DC_SIZE)  : '-';

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
      severityLevel: sevC.infoHighlighted,
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
    reg.TX_FILTER_CTRL0.fields.IRQ_EN = getBits(regValue, 20, 20);
    reg.TX_FILTER_CTRL0.fields.EN     = getBits(regValue, 19, 19);
    reg.TX_FILTER_CTRL0.fields.CC_CAN = getBits(regValue, 18, 18);
    reg.TX_FILTER_CTRL0.fields.CAN_FD = getBits(regValue, 17, 17);
    reg.TX_FILTER_CTRL0.fields.MODE   = getBits(regValue, 16,16); // 1=accept on match else reject on match
    reg.TX_FILTER_CTRL0.fields.MASK   = getBits(regValue, 15, 8);
    reg.TX_FILTER_CTRL0.fields.COMB   = getBits(regValue, 7, 0);
    // for each element of maskIdx => create strings 0/1, 2/3, ...
    const maskIdx = listSetIdx8(reg.TX_FILTER_CTRL0.fields.MASK);
    const combIdx = listSetIdx8(reg.TX_FILTER_CTRL0.fields.COMB);
    let maskIdxPairsString = maskIdx.map((v, i) => `${2*v+1}/${2*v}`).join(', ');
    let combIdxPairsString = combIdx.map((v, i) => `${2*v+1}/${2*v}`).join(', ');
    // 2. Report
    reg.TX_FILTER_CTRL0.report.push({
      severityLevel: sevC.info,
      msg: `TX_FILTER_CTRL0: ${reg.TX_FILTER_CTRL0.name_long} (0x${reg.TX_FILTER_CTRL0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[IRQ_EN] Interrupt on Rejection Enabled = ${reg.TX_FILTER_CTRL0.fields.IRQ_EN}\n` +
           `[EN    ] TX Filter Global Enable        = ${reg.TX_FILTER_CTRL0.fields.EN}\n`+
           `[CC_CAN] CAN CC frame Reject(1)         = ${reg.TX_FILTER_CTRL0.fields.CC_CAN} ${reg.TX_FILTER_CTRL0.fields.CC_CAN? '(=Reject)':'(=Accept)'}\n`+
           `[CAN_FD] CAN FD frame Reject(1)         = ${reg.TX_FILTER_CTRL0.fields.CAN_FD} ${reg.TX_FILTER_CTRL0.fields.CAN_FD? '(=Reject)':'(=Accept)'}\n`+
           `[MODE  ] Mode: Accept (1) or Reject (0) = ${reg.TX_FILTER_CTRL0.fields.MODE} ${reg.TX_FILTER_CTRL0.fields.MODE? '(=Accept)':'(=Reject)'} on match)\n`+
           `[MASK  ] Use Value/Mask pairs           = 0x${reg.TX_FILTER_CTRL0.fields.MASK.toString(16).toUpperCase().padStart(2,'0')} => Mask/Value Pairs: ${maskIdxPairsString? maskIdxPairsString : 'none'}\n`+
           `[COMB  ] Use REF_VAL pairs (0+1, 2+3, ) = 0x${reg.TX_FILTER_CTRL0.fields.COMB.toString(16).toUpperCase().padStart(2,'0')} => Filter     Pairs: ${combIdxPairsString? combIdxPairsString : 'none'}`
    });
  }

  // === TX_FILTER_CTRL1 =============================================
  if ('TX_FILTER_CTRL1' in reg && reg.TX_FILTER_CTRL1.int32 !== undefined) {
    const regValue = reg.TX_FILTER_CTRL1.int32;
    // 0. Extend structure
    reg.TX_FILTER_CTRL1.fields = {};
    reg.TX_FILTER_CTRL1.report = [];
    // 1. Decode
    reg.TX_FILTER_CTRL1.fields.FIELD = getBits(regValue, 31,16); // 1 = SDT, 0 = VCID
    reg.TX_FILTER_CTRL1.fields.VALID = getBits(regValue, 15, 0);
    // 2. Report
    const fieldIdx = listSetIdx16(reg.TX_FILTER_CTRL1.fields.FIELD);
    const validIdx = listSetIdx16(reg.TX_FILTER_CTRL1.fields.VALID);
    reg.TX_FILTER_CTRL1.report.push({
      severityLevel: sevC.info,
      msg: `TX_FILTER_CTRL1: ${reg.TX_FILTER_CTRL1.name_long} (0x${reg.TX_FILTER_CTRL1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[VALID] Active Ref Value Indexes: REF_VALx = 0x${reg.TX_FILTER_CTRL1.fields.VALID.toString(16).toUpperCase().padStart(4,'0')} => ${validIdx.length?validIdx.join(', '):'none'}\n`+
           `[FIELD] Compared field: SDT(1) or VCID(0)  = 0x${reg.TX_FILTER_CTRL1.fields.FIELD.toString(16).toUpperCase().padStart(4,'0')} => binary (15:0)  ${getBinaryLineData(reg.TX_FILTER_CTRL1.fields.FIELD, 16)}`
    });
  }

  // === TX_FILTER_REFVAL0/1/2/3 =====================================
  // Helper to decode TX_FILTER_REFVALx
  const decodeRefVal = (name, index) => {
    if (name in reg && reg[name].int32 !== undefined) {
      const regValue = reg[name].int32;
      reg[name].fields = {};
      reg[name].report = [];
      reg[name].fields.REF_VAL0 = getBits(regValue, 7, 0);
      reg[name].fields.REF_VAL1 = getBits(regValue,15, 8);
      reg[name].fields.REF_VAL2 = getBits(regValue,23,16);
      reg[name].fields.REF_VAL3 = getBits(regValue,31,24);
      reg[name].report.push({
        severityLevel: sevC.info,
        msg: `${name}: ${reg[name].name_long} (0x${reg[name].addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
             `[REF_VAL3] global REF_VAL${(index*4+3).toString().padEnd(2,' ')} = 0x${reg[name].fields.REF_VAL3.toString(16).toUpperCase().padStart(2,'0')}\n`+
             `[REF_VAL2] global REF_VAL${(index*4+2).toString().padEnd(2,' ')} = 0x${reg[name].fields.REF_VAL2.toString(16).toUpperCase().padStart(2,'0')}\n`+
             `[REF_VAL1] global REF_VAL${(index*4+1).toString().padEnd(2,' ')} = 0x${reg[name].fields.REF_VAL1.toString(16).toUpperCase().padStart(2,'0')}\n`+
             `[REF_VAL0] global REF_VAL${(index*4+0).toString().padEnd(2,' ')} = 0x${reg[name].fields.REF_VAL0.toString(16).toUpperCase().padStart(2,'0')}`
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
    const enGlobal = reg.TX_FILTER_CTRL0.fields.EN === 1;
    const validMask = reg.TX_FILTER_CTRL1.fields.VALID; // 16 bits -> REF_VAL00..15
    const fieldMask = reg.TX_FILTER_CTRL1.fields.FIELD; // 1 = SDT, 0 = VCID
    const maskPairs = reg.TX_FILTER_CTRL0.fields.MASK;  // bit i => use REF_VAL(2*i+1)/(2*i)
    const combPairs = reg.TX_FILTER_CTRL0.fields.COMB;  // bit i => combine pair (2*i,2*i+1)

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
      return entry.fields[`REF_VAL${pos}`];
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
      severityLevel: sevC.infoHighlighted,
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
    reg.RX_FILTER_CTRL.fields.ANFF     = getBits(regValue,21,21);
    reg.RX_FILTER_CTRL.fields.ANMF     = getBits(regValue,20,20);
    reg.RX_FILTER_CTRL.fields.ANMF_FQ  = getBits(regValue,18,16);
    reg.RX_FILTER_CTRL.fields.THRESHOLD= getBits(regValue,12, 8);
    reg.RX_FILTER_CTRL.fields.NB_FE      = getBits(regValue, 7, 0);
    // 2.
    reg.RX_FILTER_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `RX_FILTER_CTRL: ${reg.RX_FILTER_CTRL.name_long} (0x${reg.RX_FILTER_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[ANFF     ] Threshold for RX DMA FIFO (=cache) = ${reg.RX_FILTER_CTRL.fields.ANFF}\n`+
           `[ANMF     ] Accept Non-Matching Frames         = ${reg.RX_FILTER_CTRL.fields.ANMF}\n`+
           `[ANMF_FQ  ] Default RX FIFO Queue (ANMF/ANFF)  = ${reg.RX_FILTER_CTRL.fields.ANMF_FQ}\n`+
           `[THRESHOLD] Threshold (words, if ANFF=1)       = ${reg.RX_FILTER_CTRL.fields.THRESHOLD}\n`+
           `[NB_FE    ] Number of RX Filter Elements       = ${reg.RX_FILTER_CTRL.fields.NB_FE}`
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
    reg.TX_FQ_INT_STS.fields.UNVALID = getBits(regValue,23,16); // invalid descriptor
    reg.TX_FQ_INT_STS.fields.SENT    = getBits(regValue,7,0);   // sent msg
    const unvIdx = listSet(reg.TX_FQ_INT_STS.fields.UNVALID,7);
    const sentIdx= listSet(reg.TX_FQ_INT_STS.fields.SENT,7);
    // 2. Report
    reg.TX_FQ_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `TX_FQ_INT_STS: ${reg.TX_FQ_INT_STS.name_long} (0x${reg.TX_FQ_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[UNVALID ] TXFQ Descriptor VALID=0 IR = 0x${reg.TX_FQ_INT_STS.fields.UNVALID.toString(16).toUpperCase().padStart(2,'0')} => Queues: ${unvIdx.length?unvIdx.join(', '):'none'}\n`+
           `[SENT    ] TXFQ Message Dequeued   IR = 0x${reg.TX_FQ_INT_STS.fields.SENT.toString(16).toUpperCase().padStart(2,'0')} => Queues: ${sentIdx.length?sentIdx.join(', '):'none'}`
    });
  }

  // === RX_FQ_INT_STS: RX FIFO Queue Interrupt Status ===============
  if ('RX_FQ_INT_STS' in reg && reg.RX_FQ_INT_STS.int32 !== undefined) {
    const regValue = reg.RX_FQ_INT_STS.int32;
    // 0. Extend structure
    reg.RX_FQ_INT_STS.fields = {};
    reg.RX_FQ_INT_STS.report = [];
    // 1. Decode (MSB -> LSB)
    reg.RX_FQ_INT_STS.fields.UNVALID  = getBits(regValue,23,16);
    reg.RX_FQ_INT_STS.fields.RECEIVED = getBits(regValue,7,0);
    // 2. Report
    const unvIdx = listSet(reg.RX_FQ_INT_STS.fields.UNVALID,7);
    const rcvIdx = listSet(reg.RX_FQ_INT_STS.fields.RECEIVED,7);
    reg.RX_FQ_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `RX_FQ_INT_STS: ${reg.RX_FQ_INT_STS.name_long} (0x${reg.RX_FQ_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[UNVALID ] RXFQ Descriptor VALID=0 IR = 0x${reg.RX_FQ_INT_STS.fields.UNVALID.toString(16).toUpperCase().padStart(2,'0')} => Queues: ${unvIdx.length?unvIdx.join(', '):'none'}\n`+
           `[RECEIVED] RXFQ Message Enqueued   IR = 0x${reg.RX_FQ_INT_STS.fields.RECEIVED.toString(16).toUpperCase().padStart(2,'0')} => Queues: ${rcvIdx.length?rcvIdx.join(', '):'none'}`
    });
  }

  // === TX_PQ_INT_STS0: TX Priority Queue Sent ======================
  if ('TX_PQ_INT_STS0' in reg && reg.TX_PQ_INT_STS0.int32 !== undefined) {
    const regValue = reg.TX_PQ_INT_STS0.int32;
    // 0. Extend structure
    reg.TX_PQ_INT_STS0.fields = {};
    reg.TX_PQ_INT_STS0.report = [];
    // 1. Decode (MSB -> LSB)
    reg.TX_PQ_INT_STS0.fields.SENT = getBits(regValue,31,0);
    // 2. Report
    const sentIdx = listSet(reg.TX_PQ_INT_STS0.fields.SENT,31);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);
    reg.TX_PQ_INT_STS0.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_INT_STS0: ${reg.TX_PQ_INT_STS0.name_long} (0x${reg.TX_PQ_INT_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[SENT] TXPQ Messages Dequeued IR      = 0x${reg.TX_PQ_INT_STS0.fields.SENT.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${sentIdx.length?sentIdx.join(', '):'none'}\n` +
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
    reg.TX_PQ_INT_STS1.fields.UNVALID = getBits(regValue,31,0);
    // 2. Report
    const unvIdx = listSet(reg.TX_PQ_INT_STS1.fields.UNVALID,31);
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);
    reg.TX_PQ_INT_STS1.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_INT_STS1: ${reg.TX_PQ_INT_STS1.name_long} (0x${reg.TX_PQ_INT_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[UNVALID] TXPQ Descriptor VALID=0 IR  = 0x${reg.TX_PQ_INT_STS1.fields.UNVALID.toString(16).toUpperCase().padStart(8,'0')} => Slots: ${unvIdx.length?unvIdx.join(', '):'none'}\n` +
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
    reg.STATS_INT_STS.fields.RX_UNSUCC = getBits(regValue,3,3);
    reg.STATS_INT_STS.fields.RX_SUCC   = getBits(regValue,2,2);
    reg.STATS_INT_STS.fields.TX_UNSUCC = getBits(regValue,1,1);
    reg.STATS_INT_STS.fields.TX_SUCC   = getBits(regValue,0,0);
    // 2. Report
    reg.STATS_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `STATS_INT_STS: ${reg.STATS_INT_STS.name_long} (0x${reg.STATS_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[RX_UNSUCC] RX unsuccessful counter = ${reg.STATS_INT_STS.fields.RX_UNSUCC}\n`+
           `[RX_SUCC  ] RX successful counter   = ${reg.STATS_INT_STS.fields.RX_SUCC}\n`+
           `[TX_UNSUCC] TX unsuccessful counter = ${reg.STATS_INT_STS.fields.TX_UNSUCC}\n`+
           `[TX_SUCC  ] TX successful counter   = ${reg.STATS_INT_STS.fields.TX_SUCC}`
    });
  }

  // === ERR_INT_STS: Error Interrupt Status =========================
  if ('ERR_INT_STS' in reg && reg.ERR_INT_STS.int32 !== undefined) {
    const regValue = reg.ERR_INT_STS.int32;
    // 0. Extend structure
    reg.ERR_INT_STS.fields = {};
    reg.ERR_INT_STS.report = [];
    // 1. Decode (MSB -> LSB)
    reg.ERR_INT_STS.fields.DP_RX_SEQ_ERR     = getBits(regValue,4,4);
    reg.ERR_INT_STS.fields.DP_TX_SEQ_ERR     = getBits(regValue,3,3);
    reg.ERR_INT_STS.fields.DP_RX_ACK_DO_ERR  = getBits(regValue,2,2);
    reg.ERR_INT_STS.fields.DP_RX_FIFO_DO_ERR = getBits(regValue,1,1);
    reg.ERR_INT_STS.fields.DP_TX_ACK_DO_ERR  = getBits(regValue,0,0);
    // 2. Report
    reg.ERR_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `ERR_INT_STS: ${reg.ERR_INT_STS.name_long} (0x${reg.ERR_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[DP_RX_SEQ_ERR    ] Data Path RX sequence error            = ${reg.ERR_INT_STS.fields.DP_RX_SEQ_ERR}\n`+
           `[DP_TX_SEQ_ERR    ] Data Path TX sequence error            = ${reg.ERR_INT_STS.fields.DP_TX_SEQ_ERR}\n`+
           `[DP_RX_ACK_DO_ERR ] Data Path RX acknowledge data overflow = ${reg.ERR_INT_STS.fields.DP_RX_ACK_DO_ERR}\n`+
           `[DP_RX_FIFO_DO_ERR] Data Path RX DMA FIFO overflow         = ${reg.ERR_INT_STS.fields.DP_RX_FIFO_DO_ERR}\n`+
           `[DP_TX_ACK_DO_ERR ] Data Path TX acknowledge data overflow = ${reg.ERR_INT_STS.fields.DP_TX_ACK_DO_ERR}`
    });
  }

  // === SFTY_INT_STS: Safety Interrupt Status =======================
  if ('SFTY_INT_STS' in reg && reg.SFTY_INT_STS.int32 !== undefined) {
    const regValue = reg.SFTY_INT_STS.int32;
    // 0. Extend structure
    reg.SFTY_INT_STS.fields = {};
    reg.SFTY_INT_STS.report = [];
    // 1. Decode (MSB -> LSB)
    reg.SFTY_INT_STS.fields.ACK_RX_PARITY_ERR    = getBits(regValue,17,17);
    reg.SFTY_INT_STS.fields.ACK_TX_PARITY_ERR    = getBits(regValue,16,16);
    reg.SFTY_INT_STS.fields.MEM_SFTY_CE  = getBits(regValue,15,15);
    reg.SFTY_INT_STS.fields.MEM_SFTY_UE  = getBits(regValue,14,14);
    reg.SFTY_INT_STS.fields.RX_DESC_CRC_ERR   = getBits(regValue,13,13);
    reg.SFTY_INT_STS.fields.RX_DESC_REQ_ERR   = getBits(regValue,12,12);
    reg.SFTY_INT_STS.fields.TX_DESC_CRC_ERR   = getBits(regValue,11,11);
    reg.SFTY_INT_STS.fields.TX_DESC_REQ_ERR   = getBits(regValue,10,10);
    reg.SFTY_INT_STS.fields.AP_RX_PARITY_ERR  = getBits(regValue,9,9);
    reg.SFTY_INT_STS.fields.AP_TX_PARITY_ERR  = getBits(regValue,8,8);
    reg.SFTY_INT_STS.fields.DP_RX_PARITY_ERR  = getBits(regValue,7,7);
    reg.SFTY_INT_STS.fields.DP_TX_PARITY_ERR  = getBits(regValue,6,6);
    reg.SFTY_INT_STS.fields.MEM_AXI_RD_TO_ERR = getBits(regValue,5,5);
    reg.SFTY_INT_STS.fields.MEM_AXI_WR_TO_ERR = getBits(regValue,4,4);
    reg.SFTY_INT_STS.fields.DP_PRT_RX_TO_ERR     = getBits(regValue,3,3);
    reg.SFTY_INT_STS.fields.DP_PRT_TX_TO_ERR     = getBits(regValue,2,2);
    reg.SFTY_INT_STS.fields.DMA_AXI_RD_TO_ERR = getBits(regValue,1,1);
    reg.SFTY_INT_STS.fields.DMA_AXI_WR_TO_ERR = getBits(regValue,0,0);
    // 2. Report
    reg.SFTY_INT_STS.report.push({
      severityLevel: sevC.info,
      msg: `SFTY_INT_STS: ${reg.SFTY_INT_STS.name_long} (0x${reg.SFTY_INT_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[ACK_RX_PARITY_ERR] RX Ack Data Parity Issue        = ${reg.SFTY_INT_STS.fields.ACK_RX_PARITY_ERR}\n`+
           `[ACK_TX_PARITY_ERR] TX Ack Data Parity Issue        = ${reg.SFTY_INT_STS.fields.ACK_TX_PARITY_ERR}\n`+
           `[MEM_SFTY_CE      ] LMEM Correctable   Error        = ${reg.SFTY_INT_STS.fields.MEM_SFTY_CE}\n`+
           `[MEM_SFTY_UE      ] LMEM Uncorrectable Error        = ${reg.SFTY_INT_STS.fields.MEM_SFTY_UE}\n`+
           `[RX_DESC_CRC_ERR  ] RX Descriptor CRC Error         = ${reg.SFTY_INT_STS.fields.RX_DESC_CRC_ERR}\n`+
           `[RX_DESC_REQ_ERR  ] RX Descriptor Fetched Wrong     = ${reg.SFTY_INT_STS.fields.RX_DESC_REQ_ERR}\n`+
           `[TX_DESC_CRC_ERR  ] TX Descriptor Wrong CRC         = ${reg.SFTY_INT_STS.fields.TX_DESC_CRC_ERR}\n`+
           `[TX_DESC_REQ_ERR  ] TX Descriptor Fetched Wrong     = ${reg.SFTY_INT_STS.fields.TX_DESC_REQ_ERR}\n`+
           `[AP_RX_PARITY_ERR ] RX Address Pointer Parity Error = ${reg.SFTY_INT_STS.fields.AP_RX_PARITY_ERR}\n`+
           `[AP_TX_PARITY_ERR ] TX Address Pointer Parity Error = ${reg.SFTY_INT_STS.fields.AP_TX_PARITY_ERR}\n`+
           `[DP_RX_PARITY_ERR ] RX Data Parity Error            = ${reg.SFTY_INT_STS.fields.DP_RX_PARITY_ERR}\n`+
           `[DP_TX_PARITY_ERR ] TX Data Parity Error            = ${reg.SFTY_INT_STS.fields.DP_TX_PARITY_ERR}\n`+
           `[MEM_AXI_RD_TO_ERR] MEM AXI Read Timeout            = ${reg.SFTY_INT_STS.fields.MEM_AXI_RD_TO_ERR}\n`+
           `[MEM_AXI_WR_TO_ERR] MEM AXI Write Timeout           = ${reg.SFTY_INT_STS.fields.MEM_AXI_WR_TO_ERR}\n`+
           `[DP_PRT_RX_TO_ERR ] (PRT=>MH) RX_MSG IF Timeout     = ${reg.SFTY_INT_STS.fields.DP_PRT_RX_TO_ERR}\n`+
           `[DP_PRT_TX_TO_ERR ] (MH=>PRT) TX_MSG IF Timeout     = ${reg.SFTY_INT_STS.fields.DP_PRT_TX_TO_ERR}\n`+
           `[DMA_AXI_RD_TO_ERR] DMA AXI Read  Timeout           = ${reg.SFTY_INT_STS.fields.DMA_AXI_RD_TO_ERR}\n`+
           `[DMA_AXI_WR_TO_ERR] DMA AXI Write Timeout           = ${reg.SFTY_INT_STS.fields.DMA_AXI_WR_TO_ERR}`
    });
  }

  // === AXI_ERR_INFO: AXI Error Information =========================
  if ('AXI_ERR_INFO' in reg && reg.AXI_ERR_INFO.int32 !== undefined) {
    const regValue = reg.AXI_ERR_INFO.int32;
    // 0. Extend structure
    reg.AXI_ERR_INFO.fields = {};
    reg.AXI_ERR_INFO.report = [];
    // 1. Decode (MSB -> LSB)
    reg.AXI_ERR_INFO.fields.MEM_RESP = getBits(regValue,7,6);
    reg.AXI_ERR_INFO.fields.MEM_ID   = getBits(regValue,5,4);
    reg.AXI_ERR_INFO.fields.DMA_RESP = getBits(regValue,3,2);
    reg.AXI_ERR_INFO.fields.DMA_ID   = getBits(regValue,1,0);
    // 2. Report
    reg.AXI_ERR_INFO.report.push({
      severityLevel: sevC.info,
      msg: `AXI_ERR_INFO: ${reg.AXI_ERR_INFO.name_long} (0x${reg.AXI_ERR_INFO.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[MEM_RESP] MEM AXI Response                                = ${reg.AXI_ERR_INFO.fields.MEM_RESP} (0: Okay, 1: res, 2: SLVERR, 3: DECERR)\n`+
           `[MEM_ID  ] MEM AXI ID (in case of RD or WR Error Response) = ${reg.AXI_ERR_INFO.fields.MEM_ID}\n`+
           `[DMA_RESP] DMA AXI Response                                = ${reg.AXI_ERR_INFO.fields.DMA_RESP} (0: Okay, 1: res, 2: SLVERR, 3: DECERR)\n`+
           `[DMA_ID  ] DMA AXI ID (in case of RD or WR Error Response) = ${reg.AXI_ERR_INFO.fields.DMA_ID}`
    });
  }

  // === DESC_ERR_INFO0: Descriptor Error Address ====================
  if ('DESC_ERR_INFO0' in reg && reg.DESC_ERR_INFO0.int32 !== undefined) {
    const regValue = reg.DESC_ERR_INFO0.int32;
    // 0. Extend structure
    reg.DESC_ERR_INFO0.fields = {};
    reg.DESC_ERR_INFO0.report = [];
    // 1. Decode (MSB -> LSB)
    reg.DESC_ERR_INFO0.fields.ADD = getBits(regValue,31,0);
    // 2. Report
    reg.DESC_ERR_INFO0.report.push({
      severityLevel: sevC.info,
      msg: `DESC_ERR_INFO0: ${reg.DESC_ERR_INFO0.name_long} (0x${reg.DESC_ERR_INFO0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[ADD] Descriptor Address = 0x${reg.DESC_ERR_INFO0.fields.ADD.toString(16).toUpperCase().padStart(8,'0')}`
    });
  }

  // === DESC_ERR_INFO1: Descriptor Error Details ====================
  if ('DESC_ERR_INFO1' in reg && reg.DESC_ERR_INFO1.int32 !== undefined) {
    const regValue = reg.DESC_ERR_INFO1.int32;
    // 0. Extend structure
    reg.DESC_ERR_INFO1.fields = {};
    reg.DESC_ERR_INFO1.report = [];
    // 1. Decode (MSB -> LSB)
    reg.DESC_ERR_INFO1.fields.CRC      = getBits(regValue,24,16);
    reg.DESC_ERR_INFO1.fields.RX_TX    = getBits(regValue,15,15);
    reg.DESC_ERR_INFO1.fields.RC       = getBits(regValue,13,9);
    reg.DESC_ERR_INFO1.fields.PQ       = getBits(regValue,8,8);
    reg.DESC_ERR_INFO1.fields.INSTANCE = getBits(regValue,7,5);
    reg.DESC_ERR_INFO1.fields.FQN_PQSN = getBits(regValue,4,0);
    // 2. Report
    reg.DESC_ERR_INFO1.report.push({
      severityLevel: sevC.info,
      msg: `DESC_ERR_INFO1: ${reg.DESC_ERR_INFO1.name_long} (0x${reg.DESC_ERR_INFO1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[CRC     ] Descriptor CRC Value        = 0x${reg.DESC_ERR_INFO1.fields.CRC.toString(16).toUpperCase().padStart(2,'0')}\n`+
           `[RX_TX   ] RX(1) or TX(0) Descriptor   = ${reg.DESC_ERR_INFO1.fields.RX_TX}\n`+
           `[RC      ] Rolling Counter             = ${reg.DESC_ERR_INFO1.fields.RC}\n`+
           `[PQ      ] TX Queue type: PQ(1), FQ(0) = ${reg.DESC_ERR_INFO1.fields.PQ}\n`+
           `[INSTANCE] Instance Number             = ${reg.DESC_ERR_INFO1.fields.INSTANCE}\n`+
           `[FQN_PQSN] Queue/Slot Number           = ${reg.DESC_ERR_INFO1.fields.FQN_PQSN}`
    });
  }

  // === TX_FILTER_ERR_INFO: TX Filter Error Info ====================
  if ('TX_FILTER_ERR_INFO' in reg && reg.TX_FILTER_ERR_INFO.int32 !== undefined) {
    const regValue = reg.TX_FILTER_ERR_INFO.int32;
    // 0. Extend structure
    reg.TX_FILTER_ERR_INFO.fields = {};
    reg.TX_FILTER_ERR_INFO.report = [];
    // 1. Decode (MSB -> LSB)
    reg.TX_FILTER_ERR_INFO.fields.FQN_PQS = getBits(regValue,5,1);
    reg.TX_FILTER_ERR_INFO.fields.FQ      = getBits(regValue,0,0); // 1=TX FIFO Queue, 0=TX PQ slot
    // 2. Report
    reg.TX_FILTER_ERR_INFO.report.push({
      severityLevel: sevC.info,
      msg: `TX_FILTER_ERR_INFO: ${reg.TX_FILTER_ERR_INFO.name_long} (0x${reg.TX_FILTER_ERR_INFO.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[FQN_PQS] FIFO Queue/Slot Number     = ${reg.TX_FILTER_ERR_INFO.fields.FQN_PQS}\n` +
           `[FQ     ] TX Queue type FQ(1), PQ(0) = ${reg.TX_FILTER_ERR_INFO.fields.FQ}`
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
    reg.DEBUG_TEST_CTRL.fields.HDP_SEL     = getBits(regValue,10,8);
    reg.DEBUG_TEST_CTRL.fields.HDP_EN      = getBits(regValue,1,1);
    reg.DEBUG_TEST_CTRL.fields.TEST_IRQ_EN = getBits(regValue,0,0);
    // 2. Report
    reg.DEBUG_TEST_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `DEBUG_TEST_CTRL: ${reg.DEBUG_TEST_CTRL.name_long} (0x${reg.DEBUG_TEST_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[HDP_SEL    ] HDP Signal Set        = ${reg.DEBUG_TEST_CTRL.fields.HDP_SEL}\n`+
           `[HDP_EN     ] HDP Port Enable       = ${reg.DEBUG_TEST_CTRL.fields.HDP_EN}\n`+
           `[TEST_IRQ_EN] Test Interrupt Enable = ${reg.DEBUG_TEST_CTRL.fields.TEST_IRQ_EN}`
    });
  }

  // === INT_TEST0 ===================================================
  if ('INT_TEST0' in reg && reg.INT_TEST0.int32 !== undefined) {
    const regValue = reg.INT_TEST0.int32;
    // 0. Extend structure
    reg.INT_TEST0.fields = {};
    reg.INT_TEST0.report = [];
    // 1. Decode (MSB->LSB)
    reg.INT_TEST0.fields.RX_FQ_IRQ = getBits(regValue,23,16);
    reg.INT_TEST0.fields.TX_FQ_IRQ = getBits(regValue,7,0);
    // 2. Report
    reg.INT_TEST0.report.push({
      severityLevel: sevC.info,
      msg: `INT_TEST0: ${reg.INT_TEST0.name_long} (0x${reg.INT_TEST0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[RX_FQ_IRQ] Trigger RX_FQ IRQs = 0x${reg.INT_TEST0.fields.RX_FQ_IRQ.toString(16).toUpperCase().padStart(2,'0')}\n`+
           `[TX_FQ_IRQ] Trigger TX_FQ IRQs = 0x${reg.INT_TEST0.fields.TX_FQ_IRQ.toString(16).toUpperCase().padStart(2,'0')}`
    });
  }

  // === INT_TEST1 ===================================================
  if ('INT_TEST1' in reg && reg.INT_TEST1.int32 !== undefined) {
    const regValue = reg.INT_TEST1.int32;
    // 0. Extend structure
    reg.INT_TEST1.fields = {};
    reg.INT_TEST1.report = [];
    // 1. Decode (MSB->LSB)
    reg.INT_TEST1.fields.TX_PQ_IRQ     = getBits(regValue,20,20);
    reg.INT_TEST1.fields.STATS_IRQ     = getBits(regValue,19,19);
    reg.INT_TEST1.fields.STOP_IRQ      = getBits(regValue,18,18);
    reg.INT_TEST1.fields.RX_FILTER_IRQ = getBits(regValue,17,17);
    reg.INT_TEST1.fields.TX_FILTER_IRQ = getBits(regValue,16,16);
    reg.INT_TEST1.fields.TX_ABORT_IRQ  = getBits(regValue,15,15);
    reg.INT_TEST1.fields.RX_ABORT_IRQ  = getBits(regValue,14,14);
    reg.INT_TEST1.fields.RX_FILTER_ERR = getBits(regValue,13,13);
    reg.INT_TEST1.fields.MEM_TO_ERR    = getBits(regValue,12,12);
    reg.INT_TEST1.fields.MEM_SFTY_ERR  = getBits(regValue,11,11);
    reg.INT_TEST1.fields.REG_CRC_ERR   = getBits(regValue,10,10);
    reg.INT_TEST1.fields.DESC_ERR      = getBits(regValue,9,9);
    reg.INT_TEST1.fields.AP_PARITY_ERR = getBits(regValue,8,8);
    reg.INT_TEST1.fields.DP_PARITY_ERR = getBits(regValue,7,7);
    reg.INT_TEST1.fields.DP_SEQ_ERR    = getBits(regValue,6,6);
    reg.INT_TEST1.fields.DP_DO_ERR     = getBits(regValue,5,5);
    reg.INT_TEST1.fields.DP_TO_ERR     = getBits(regValue,4,4);
    reg.INT_TEST1.fields.DMA_CH_ERR    = getBits(regValue,3,3);
    reg.INT_TEST1.fields.DMA_TO_ERR    = getBits(regValue,2,2);
    reg.INT_TEST1.fields.RESP_ERR      = getBits(regValue,1,0);
    // 2. Report
    reg.INT_TEST1.report.push({
      severityLevel: sevC.info,
      msg: `INT_TEST1: ${reg.INT_TEST1.name_long} (0x${reg.INT_TEST1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[TX_PQ_IRQ    ] Trigger TX Priority Queue IRQ      = ${reg.INT_TEST1.fields.TX_PQ_IRQ}\n`+
           `[STATS_IRQ    ] Trigger Statistics IRQ             = ${reg.INT_TEST1.fields.STATS_IRQ}\n`+
           `[STOP_IRQ     ] Trigger STOP IRQ                   = ${reg.INT_TEST1.fields.STOP_IRQ}\n`+
           `[RX_FILTER_IRQ] Trigger RX Filter IRQ              = ${reg.INT_TEST1.fields.RX_FILTER_IRQ}\n`+
           `[TX_FILTER_IRQ] Trigger TX Filter IRQ              = ${reg.INT_TEST1.fields.TX_FILTER_IRQ}\n`+
           `[TX_ABORT_IRQ ] Trigger TX Abort IRQ               = ${reg.INT_TEST1.fields.TX_ABORT_IRQ}\n`+
           `[RX_ABORT_IRQ ] Trigger RX Abort IRQ               = ${reg.INT_TEST1.fields.RX_ABORT_IRQ}\n`+
           `[RX_FILTER_ERR] Trigger RX Filter Error IRQ        = ${reg.INT_TEST1.fields.RX_FILTER_ERR}\n`+
           `[MEM_TO_ERR   ] Trigger MEM AXI Timeout IRQ        = ${reg.INT_TEST1.fields.MEM_TO_ERR}\n`+
           `[MEM_SFTY_ERR ] Trigger MEM Safety Error IRQ       = ${reg.INT_TEST1.fields.MEM_SFTY_ERR}\n`+
           `[REG_CRC_ERR  ] Trigger Register CRC Error IRQ     = ${reg.INT_TEST1.fields.REG_CRC_ERR}\n`+
           `[DESC_ERR     ] Trigger Descriptor Error IRQ       = ${reg.INT_TEST1.fields.DESC_ERR}\n`+
           `[AP_PARITY_ERR] Trigger Address Pointer Parity IRQ = ${reg.INT_TEST1.fields.AP_PARITY_ERR}\n`+
           `[DP_PARITY_ERR] Trigger Data Path Parity IRQ       = ${reg.INT_TEST1.fields.DP_PARITY_ERR}\n`+
           `[DP_SEQ_ERR   ] Trigger Data Path Sequence IRQ     = ${reg.INT_TEST1.fields.DP_SEQ_ERR}\n`+
           `[DP_DO_ERR    ] Trigger Data Path Overflow IRQ     = ${reg.INT_TEST1.fields.DP_DO_ERR}\n`+
           `[DP_TO_ERR    ] Trigger Data Path Timeout IRQ      = ${reg.INT_TEST1.fields.DP_TO_ERR}\n`+
           `[DMA_CH_ERR   ] Trigger DMA Channel Error IRQ      = ${reg.INT_TEST1.fields.DMA_CH_ERR}\n`+
           `[DMA_TO_ERR   ] Trigger DMA Timeout IRQ            = ${reg.INT_TEST1.fields.DMA_TO_ERR}\n`+
           `[RESP_ERR     ] Trigger AXI Response Error IRQs    = 0b${reg.INT_TEST1.fields.RESP_ERR.toString(2).padStart(2,'0')}`
    });
  }

  // === TX_SCAN_FC ==================================================
  if ('TX_SCAN_FC' in reg && reg.TX_SCAN_FC.int32 !== undefined) {
    const regValue = reg.TX_SCAN_FC.int32;
    // 0. Extend structure
    reg.TX_SCAN_FC.fields = {};
    reg.TX_SCAN_FC.report = [];
    // 1. Decode (MSB->LSB)
    reg.TX_SCAN_FC.fields.FQN_PQSN3 = getBits(regValue,29,25);
    reg.TX_SCAN_FC.fields.FQ_PQ3    = getBits(regValue,24,24);
    reg.TX_SCAN_FC.fields.FQN_PQSN2 = getBits(regValue,21,17);
    reg.TX_SCAN_FC.fields.FQ_PQ2    = getBits(regValue,16,16);
    reg.TX_SCAN_FC.fields.FQN_PQSN1 = getBits(regValue,13,9);
    reg.TX_SCAN_FC.fields.FQ_PQ1    = getBits(regValue,8,8);
    reg.TX_SCAN_FC.fields.FQN_PQSN0 = getBits(regValue,5,1);
    reg.TX_SCAN_FC.fields.FQ_PQ0    = getBits(regValue,0,0);
    // 2. Report
    reg.TX_SCAN_FC.report.push({
      severityLevel: sevC.info,
      msg: `TX_SCAN_FC: ${reg.TX_SCAN_FC.name_long} (0x${reg.TX_SCAN_FC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[FQN_PQSN3] 4th cand. Queue/Slot    = ${reg.TX_SCAN_FC.fields.FQN_PQSN3}\n`+
           `[FQ_PQ3   ] TX Queue type FQ(0), PQ(1) = ${reg.TX_SCAN_FC.fields.FQ_PQ3}\n`+
           `[FQN_PQSN2] 3rd  cand. Queue/Slot    = ${reg.TX_SCAN_FC.fields.FQN_PQSN2}\n`+
           `[FQ_PQ2   ] TX Queue type FQ(0), PQ(1) = ${reg.TX_SCAN_FC.fields.FQ_PQ2}\n`+
           `[FQN_PQSN1] 2nd cand. Queue/Slot    = ${reg.TX_SCAN_FC.fields.FQN_PQSN1}\n`+
           `[FQ_PQ1   ] TX Queue type FQ(0), PQ(1) = ${reg.TX_SCAN_FC.fields.FQ_PQ1}\n`+
           `[FQN_PQSN0] 1st  cand. Queue/Slot    = ${reg.TX_SCAN_FC.fields.FQN_PQSN0}\n`+
           `[FQ_PQ0   ] TX Queue type FQ(0), PQ(1) = ${reg.TX_SCAN_FC.fields.FQ_PQ0}`
    });
  }

  // === TX_SCAN_BC ==================================================
  if ('TX_SCAN_BC' in reg && reg.TX_SCAN_BC.int32 !== undefined) {
    const regValue = reg.TX_SCAN_BC.int32;
    // 0. Extend structure
    reg.TX_SCAN_BC.fields = {};
    reg.TX_SCAN_BC.report = [];
    // 1. Decode (MSB->LSB)
    reg.TX_SCAN_BC.fields.SH_OFFSET    = getBits(regValue,31,22);
    reg.TX_SCAN_BC.fields.SH_FQN_PQSN  = getBits(regValue,21,17);
    reg.TX_SCAN_BC.fields.SH_PQ        = getBits(regValue,16,16);
    reg.TX_SCAN_BC.fields.FH_OFFSET    = getBits(regValue,15,6);
    reg.TX_SCAN_BC.fields.FH_FQN_PQSN  = getBits(regValue,5,1);
    reg.TX_SCAN_BC.fields.FH_PQ        = getBits(regValue,0,0);
    // 2. Report
    reg.TX_SCAN_BC.report.push({
      severityLevel: sevC.info,
      msg: `TX_SCAN_BC: ${reg.TX_SCAN_BC.name_long} (0x${reg.TX_SCAN_BC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[SH_OFFSET  ] 2nd cand. Offset (32byte/Desc)       = ${reg.TX_SCAN_BC.fields.SH_OFFSET} (valid if SH_PQ=0, Offset = ${reg.TX_SCAN_BC.fields.SH_OFFSET}*32byte = ${reg.TX_SCAN_BC.fields.SH_OFFSET * 32} byte)\n`+
           `[SH_FQN_PQSN] 2nd cand. FIFO Queue/Slot Number     = ${reg.TX_SCAN_BC.fields.SH_FQN_PQSN}\n`+
           `[SH_PQ      ] 2nd cand. TX Queue type FQ(0), PQ(1) = ${reg.TX_SCAN_BC.fields.SH_PQ}\n`+
           `[FH_OFFSET  ] 1st cand. Offset (32byte/Desc)       = ${reg.TX_SCAN_BC.fields.FH_OFFSET} (valid if FH_PQ=0, Offset = ${reg.TX_SCAN_BC.fields.FH_OFFSET}*32byte = ${reg.TX_SCAN_BC.fields.FH_OFFSET * 32} byte)\n`+
           `[FH_FQN_PQSN] 1st cand. FIFO Queue/Slot Number     = ${reg.TX_SCAN_BC.fields.FH_FQN_PQSN}\n`+
           `[FH_PQ      ] 1st cand. TX Queue type FQ(0), PQ(1) = ${reg.TX_SCAN_BC.fields.SH_PQ}`
    });
  }

  // === TX_FQ_DESC_VALID ============================================
  if ('TX_FQ_DESC_VALID' in reg && reg.TX_FQ_DESC_VALID.int32 !== undefined) {
    const regValue = reg.TX_FQ_DESC_VALID.int32;
    // 0. Extend structure
    reg.TX_FQ_DESC_VALID.fields = {};
    reg.TX_FQ_DESC_VALID.report = [];
    // 1. Decode (MSB->LSB)
    reg.TX_FQ_DESC_VALID.fields.DESC_NC_VALID = getBits(regValue,23,16); // next/current
    reg.TX_FQ_DESC_VALID.fields.DESC_CN_VALID = getBits(regValue,7,0);   // current/next
    const ncIdx = listSet(reg.TX_FQ_DESC_VALID.fields.DESC_NC_VALID,7);
    const cnIdx = listSet(reg.TX_FQ_DESC_VALID.fields.DESC_CN_VALID,7);
    // 2. Report
    reg.TX_FQ_DESC_VALID.report.push({
      severityLevel: sevC.info,
      msg: `TX_FQ_DESC_VALID: ${reg.TX_FQ_DESC_VALID.name_long} (0x${reg.TX_FQ_DESC_VALID.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[DESC_NC_VALID] Next/Current Descriptors is in L_MEM = 0x${reg.TX_FQ_DESC_VALID.fields.DESC_NC_VALID.toString(16).toUpperCase().padStart(2,'0')} => TX FIFO Queues: ${ncIdx.length?ncIdx.join(', '):'none'}\n`+
           `[DESC_CN_VALID] Current/Next Descriptors is in L_MEM = 0x${reg.TX_FQ_DESC_VALID.fields.DESC_CN_VALID.toString(16).toUpperCase().padStart(2,'0')} => TX FIFO Queues: ${cnIdx.length?cnIdx.join(', '):'none'}`
    });
  }

  // === TX_PQ_DESC_VALID ============================================
  if ('TX_PQ_DESC_VALID' in reg && reg.TX_PQ_DESC_VALID.int32 !== undefined) {
    const regValue = reg.TX_PQ_DESC_VALID.int32;
    // 0. Extend structure
    reg.TX_PQ_DESC_VALID.fields = {};
    reg.TX_PQ_DESC_VALID.report = [];
    // 1. Decode (MSB->LSB)
    reg.TX_PQ_DESC_VALID.fields.DESC_VALID = regValue >>> 0; // full mask
    // 2. Report
    let binLineHead = "Bit: 31                  23                  15                  7               0\n";
    let binLineData = "Slot " + getBinaryLineData(regValue);
    reg.TX_PQ_DESC_VALID.report.push({
      severityLevel: sevC.info,
      msg: `TX_PQ_DESC_VALID: ${reg.TX_PQ_DESC_VALID.name_long} (0x${reg.TX_PQ_DESC_VALID.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[DESC_VALID] PQ Slot Descriptors is in LMEM = 0x${reg.TX_PQ_DESC_VALID.fields.DESC_VALID.toString(16).toUpperCase().padStart(8,'0')}\n`+
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
    reg.CRC_CTRL.fields.START = getBits(regValue,0,0);
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
    reg.CRC_REG.fields.CRC = regValue >>> 0;
    // 2. Report
    reg.CRC_REG.report.push({
      severityLevel: sevC.info,
      msg: `CRC_REG: ${reg.CRC_REG.name_long} (0x${reg.CRC_REG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n`+
           `[CRC] Register Bank CRC Value = 0x${reg.CRC_REG.fields.CRC.toString(16).toUpperCase().padStart(8,'0')}`
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
  const txPqEnableMask = bits(txPqCtrl2, 31, 0);
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
      reg[name].report.push({ severityLevel: sevC.infoHighlighted, msg: msg_lmemMap });
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
