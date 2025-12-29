// XS_CAN: MH register decoding
import { getBits } from './help_functions.js';
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
    reg.XSCAN_VERSION.fields.MAJOR   = getBits(regValue, 11, 8);
    reg.XSCAN_VERSION.fields.MINOR   = getBits(regValue, 7, 4);
    reg.XSCAN_VERSION.fields.PATCH   = getBits(regValue, 3, 0);

    // 1. Decode all individual bits of register
    reg.XSCAN_VERSION.report.push({
      severityLevel: sevC.info,
      msg: `XSCAN_VERSION: ${reg.XSCAN_VERSION.name_long} (0x${reg.XSCAN_VERSION.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
         `[MAJOR  ] Major = 0x${reg.XSCAN_VERSION.fields.MAJOR.toString(16).toUpperCase()}\n` +
         `[MINOR  ] Minor = 0x${reg.XSCAN_VERSION.fields.MINOR.toString(16).toUpperCase()}\n` +
         `[PATCH  ] Patch = 0x${reg.XSCAN_VERSION.fields.PATCH.toString(16).toUpperCase()}`
    });

    // 2. Generate human-readable register report
    reg.XSCAN_VERSION.report.push({
      severityLevel: sevC.infoHighlighted,
      msg: `Version: XS_CAN ${reg.XSCAN_VERSION.fields.MAJOR.toString(16).toUpperCase()}.${reg.XSCAN_VERSION.fields.MINOR.toString(16).toUpperCase()}.${reg.XSCAN_VERSION.fields.PATCH.toString(16).toUpperCase()}`
    });
  } // XSCAN_VERSION

  // === MH_CTRL: Message Handler Control register =======================
  if ('MH_CTRL' in reg && reg.MH_CTRL.int32 !== undefined) {
    const regValue = reg.MH_CTRL.int32;

    // 0. Extend existing register structure
    reg.MH_CTRL.fields = {};
    reg.MH_CTRL.report = [];

    // 1. Decode all individual bits of MH_CTRL register
    reg.MH_CTRL.fields.MH_ENABLE = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.MH_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `MH_CTRL: ${reg.MH_CTRL.name_long} (0x${reg.MH_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[MH_ENABLE] Message Handler Enable = ${reg.MH_CTRL.fields.MH_ENABLE} (0: disabled, 1: enabled)`
    });
  } // MH_CTRL

  // === MH_CFG: Message Handler Configuration register ==================
  if ('MH_CFG' in reg && reg.MH_CFG.int32 !== undefined) {
    const regValue = reg.MH_CFG.int32;

    // 0. Extend existing register structure
    reg.MH_CFG.fields = {};
    reg.MH_CFG.report = [];

    // 1. Decode all individual bits of MH_CFG register
    reg.MH_CFG.fields.MAX_RETRANS = getBits(regValue, 18, 16);
    reg.MH_CFG.fields.CTME        = getBits(regValue, 8, 8);
    reg.MH_CFG.fields.RXFQ1E      = getBits(regValue, 4, 4);
    reg.MH_CFG.fields.RXFQ0E      = getBits(regValue, 3, 3);
    reg.MH_CFG.fields.TEFQE       = getBits(regValue, 2, 2);
    reg.MH_CFG.fields.TXPQE       = getBits(regValue, 1, 1);
    reg.MH_CFG.fields.TXFQE       = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.MH_CFG.report.push({
      severityLevel: sevC.info,
      msg: `MH_CFG: ${reg.MH_CFG.name_long} (0x${reg.MH_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[MAX_RETRANS] Maximum TX re-transmissions = ${reg.MH_CFG.fields.MAX_RETRANS} (0: none, 1-6: 1-6, 7: unlimited)\n` +
           `[CTME       ] Cut-Through Mode Enable     = ${reg.MH_CFG.fields.CTME} (0: FMM, 1: CTM)\n` +
           `[RXFQ1E     ] RXFQ1 Enable                = ${reg.MH_CFG.fields.RXFQ1E}\n` +
           `[RXFQ0E     ] RXFQ0 Enable                = ${reg.MH_CFG.fields.RXFQ0E}\n` +
           `[TEFQE      ] TX Event FIFO Enable        = ${reg.MH_CFG.fields.TEFQE}\n` +
           `[TXPQE      ] TX Priority Queue Enable    = ${reg.MH_CFG.fields.TXPQE}\n` +
           `[TXFQE      ] TX FIFO Queue Enable        = ${reg.MH_CFG.fields.TXFQE}`
    });
  } // MH_CFG

  // === MH_STS0: Message Handler Status register ======================
  if ('MH_STS0' in reg && reg.MH_STS0.int32 !== undefined) {
    const regValue = reg.MH_STS0.int32;

    // 0. Extend existing register structure
    reg.MH_STS0.fields = {};
    reg.MH_STS0.report = [];

    // 1. Decode all individual bits of MH_STS0 register
    reg.MH_STS0.fields.TXFQ_ELEM_TOO_BIG = getBits(regValue, 30, 30);
    reg.MH_STS0.fields.TXPQ_ELEM_TOO_BIG = getBits(regValue, 29, 29);
    reg.MH_STS0.fields.TXFQ_FULL_WR      = getBits(regValue, 28, 28);
    reg.MH_STS0.fields.TXPQ_FULL_WR      = getBits(regValue, 27, 27);
    reg.MH_STS0.fields.TEFQ_EMPTY_RD     = getBits(regValue, 26, 26);
    reg.MH_STS0.fields.RXFQ0_EMPTY_RD    = getBits(regValue, 25, 25);
    reg.MH_STS0.fields.RXFQ1_EMPTY_RD    = getBits(regValue, 24, 24);
    reg.MH_STS0.fields.CTB_RD_WO_REQ     = getBits(regValue, 23, 23);
    reg.MH_STS0.fields.CTB_WR_WO_REQ     = getBits(regValue, 22, 22);
    reg.MH_STS0.fields.TXFQ_VB_NO_SA     = getBits(regValue, 21, 21);
    reg.MH_STS0.fields.TXPQ_VB_NO_SA     = getBits(regValue, 20, 20);
    reg.MH_STS0.fields.TEFQ_VB_NO_SA     = getBits(regValue, 19, 19);
    reg.MH_STS0.fields.RXFQ0_VB_NO_SA    = getBits(regValue, 18, 18);
    reg.MH_STS0.fields.RXFQ1_VB_NO_SA    = getBits(regValue, 17, 17);
    reg.MH_STS0.fields.CTB_VB_NO_SA      = getBits(regValue, 16, 16);
    reg.MH_STS0.fields.CLOCK_ACTIVE      = getBits(regValue, 1, 1);
    reg.MH_STS0.fields.PRT_ENABLE        = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.MH_STS0.report.push({
      severityLevel: sevC.info,
      msg: `MH_STS0: ${reg.MH_STS0.name_long} (0x${reg.MH_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TXFQ_ELEM_TOO_BIG] TXFQ element too big         = ${reg.MH_STS0.fields.TXFQ_ELEM_TOO_BIG}\n` +
           `[TXPQ_ELEM_TOO_BIG] TXPQ element too big         = ${reg.MH_STS0.fields.TXPQ_ELEM_TOO_BIG}\n` +
           `[TXFQ_FULL_WR     ] Write to full TXFQ           = ${reg.MH_STS0.fields.TXFQ_FULL_WR}\n` +
           `[TXPQ_FULL_WR     ] Write to full TXPQ           = ${reg.MH_STS0.fields.TXPQ_FULL_WR}\n` +
           `[TEFQ_EMPTY_RD    ] Read from empty TEFQ         = ${reg.MH_STS0.fields.TEFQ_EMPTY_RD}\n` +
           `[RXFQ0_EMPTY_RD   ] Read from empty RXFQ0        = ${reg.MH_STS0.fields.RXFQ0_EMPTY_RD}\n` +
           `[RXFQ1_EMPTY_RD   ] Read from empty RXFQ1        = ${reg.MH_STS0.fields.RXFQ1_EMPTY_RD}\n` +
           `[CTB_RD_WO_REQ    ] CTB read without request     = ${reg.MH_STS0.fields.CTB_RD_WO_REQ} (N/A in FMM)\n` +
           `[CTB_WR_WO_REQ    ] CTB write without request    = ${reg.MH_STS0.fields.CTB_WR_WO_REQ} (N/A in FMM)\n` +
           `[TXFQ_VB_NO_SA    ] TXFQ VB wrong addr           = ${reg.MH_STS0.fields.TXFQ_VB_NO_SA}\n` +
           `[TXPQ_VB_NO_SA    ] TXPQ VB wrong addr           = ${reg.MH_STS0.fields.TXPQ_VB_NO_SA}\n` +
           `[TEFQ_VB_NO_SA    ] TEFQ VB wrong addr           = ${reg.MH_STS0.fields.TEFQ_VB_NO_SA}\n` +
           `[RXFQ0_VB_NO_SA   ] RXFQ0 VB wrong addr          = ${reg.MH_STS0.fields.RXFQ0_VB_NO_SA}\n` +
           `[RXFQ1_VB_NO_SA   ] RXFQ1 VB wrong addr          = ${reg.MH_STS0.fields.RXFQ1_VB_NO_SA}\n` +
           `[CTB_VB_NO_SA     ] CTB VB wrong addr            = ${reg.MH_STS0.fields.CTB_VB_NO_SA} (N/A in FMM)\n` +
           `[CLOCK_ACTIVE     ] HOST_CLK active              = ${reg.MH_STS0.fields.CLOCK_ACTIVE}\n` +
           `[PRT_ENABLE       ] PRT enable signal            = ${reg.MH_STS0.fields.PRT_ENABLE}`
    });
  } // MH_STS0

  // === MH_STS1: Message Handler Status register ======================
  if ('MH_STS1' in reg && reg.MH_STS1.int32 !== undefined) {
    const regValue = reg.MH_STS1.int32;

    // 0. Extend existing register structure
    reg.MH_STS1.fields = {};
    reg.MH_STS1.report = [];

    // 1. Decode all individual bits of MH_STS1 register
    reg.MH_STS1.fields.TXFQ_VB_NONLIN_ACC = getBits(regValue, 17, 17);
    reg.MH_STS1.fields.TXPQ_VB_NONLIN_ACC = getBits(regValue, 16, 16);
    reg.MH_STS1.fields.TEFQ_VB_NONLIN_ACC = getBits(regValue, 15, 15);
    reg.MH_STS1.fields.RXFQ0_VB_NONLIN_ACC = getBits(regValue, 14, 14);
    reg.MH_STS1.fields.RXFQ1_VB_NONLIN_ACC = getBits(regValue, 13, 13);
    reg.MH_STS1.fields.CTB_VB_NONLIN_ACC  = getBits(regValue, 12, 12);
    reg.MH_STS1.fields.TXFQ_VB_RD         = getBits(regValue, 11, 11);
    reg.MH_STS1.fields.TXPQ_VB_RD         = getBits(regValue, 10, 10);
    reg.MH_STS1.fields.TEFQ_VB_WR         = getBits(regValue, 9, 9);
    reg.MH_STS1.fields.RXFQ0_VB_WR        = getBits(regValue, 8, 8);
    reg.MH_STS1.fields.RXFQ1_VB_WR        = getBits(regValue, 7, 7);
    reg.MH_STS1.fields.CTB_VB_TX_RD       = getBits(regValue, 6, 6);
    reg.MH_STS1.fields.CTB_VB_RX_WR       = getBits(regValue, 5, 5);
    reg.MH_STS1.fields.TX_DP_SEQ_ERR      = getBits(regValue, 4, 4);
    reg.MH_STS1.fields.RX_DP_SEQ_ERR      = getBits(regValue, 3, 3);
    reg.MH_STS1.fields.TX_DP_PARITY_ERR   = getBits(regValue, 2, 2);
    reg.MH_STS1.fields.RX_DP_PARITY_ERR   = getBits(regValue, 1, 1);
    reg.MH_STS1.fields.TS_PARITY_ERR      = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.MH_STS1.report.push({
      severityLevel: sevC.info,
      msg: `MH_STS1: ${reg.MH_STS1.name_long} (0x${reg.MH_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TXFQ_VB_NONLIN_ACC ] TXFQ VB non-linear access  = ${reg.MH_STS1.fields.TXFQ_VB_NONLIN_ACC}\n` +
           `[TXPQ_VB_NONLIN_ACC ] TXPQ VB non-linear access  = ${reg.MH_STS1.fields.TXPQ_VB_NONLIN_ACC}\n` +
           `[TEFQ_VB_NONLIN_ACC ] TEFQ VB non-linear access  = ${reg.MH_STS1.fields.TEFQ_VB_NONLIN_ACC}\n` +
           `[RXFQ0_VB_NONLIN_ACC] RXFQ0 VB non-linear access = ${reg.MH_STS1.fields.RXFQ0_VB_NONLIN_ACC}\n` +
           `[RXFQ1_VB_NONLIN_ACC] RXFQ1 VB non-linear access = ${reg.MH_STS1.fields.RXFQ1_VB_NONLIN_ACC}\n` +
           `[CTB_VB_NONLIN_ACC  ] CTB VB non-linear access   = ${reg.MH_STS1.fields.CTB_VB_NONLIN_ACC} (N/A in FMM)\n` +
           `[TXFQ_VB_RD         ] Read from TXFQ VB          = ${reg.MH_STS1.fields.TXFQ_VB_RD}\n` +
           `[TXPQ_VB_RD         ] Read from TXPQ VB          = ${reg.MH_STS1.fields.TXPQ_VB_RD}\n` +
           `[TEFQ_VB_WR         ] Write to TEFQ VB           = ${reg.MH_STS1.fields.TEFQ_VB_WR}\n` +
           `[RXFQ0_VB_WR        ] Write to RXFQ0 VB          = ${reg.MH_STS1.fields.RXFQ0_VB_WR}\n` +
           `[RXFQ1_VB_WR        ] Write to RXFQ1 VB          = ${reg.MH_STS1.fields.RXFQ1_VB_WR}\n` +
           `[CTB_VB_TX_RD       ] Read TX from CTB VB        = ${reg.MH_STS1.fields.CTB_VB_TX_RD} (N/A in FMM)\n` +
           `[CTB_VB_RX_WR       ] Write RX to CTB VB         = ${reg.MH_STS1.fields.CTB_VB_RX_WR} (N/A in FMM)\n` +
           `[TX_DP_SEQ_ERR      ] TX datapath sequence error = ${reg.MH_STS1.fields.TX_DP_SEQ_ERR}\n` +
           `[RX_DP_SEQ_ERR      ] RX datapath sequence error = ${reg.MH_STS1.fields.RX_DP_SEQ_ERR}\n` +
           `[TX_DP_PARITY_ERR   ] TX datapath parity error   = ${reg.MH_STS1.fields.TX_DP_PARITY_ERR}\n` +
           `[RX_DP_PARITY_ERR   ] RX datapath parity error   = ${reg.MH_STS1.fields.RX_DP_PARITY_ERR}\n` +
           `[TS_PARITY_ERR      ] Timestamp parity error     = ${reg.MH_STS1.fields.TS_PARITY_ERR} (PRT stops when set)`
    });
  } // MH_STS1

  // === MH_SFTY_CFG: Safety Configuration register ====================
  if ('MH_SFTY_CFG' in reg && reg.MH_SFTY_CFG.int32 !== undefined) {
    const regValue = reg.MH_SFTY_CFG.int32;

    // 0. Extend existing register structure
    reg.MH_SFTY_CFG.fields = {};
    reg.MH_SFTY_CFG.report = [];

    // 1. Decode all individual bits of MH_SFTY_CFG register
    reg.MH_SFTY_CFG.fields.LMEM_TIMEOUT_VAL = getBits(regValue, 15, 8);
    reg.MH_SFTY_CFG.fields.PRESCALER        = getBits(regValue, 2, 1);
    reg.MH_SFTY_CFG.fields.LMEM_TO_EN       = getBits(regValue, 0, 0);

    // Derive human-readable clock division from PRESCALER
    const presVal = reg.MH_SFTY_CFG.fields.PRESCALER;
    const presDiv = (presVal >= 0 && presVal <= 3) ? (32 << presVal) : undefined;

    // 2. Generate human-readable register report
    reg.MH_SFTY_CFG.report.push({
      severityLevel: sevC.info,
      msg: `MH_SFTY_CFG: ${reg.MH_SFTY_CFG.name_long} (0x${reg.MH_SFTY_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[LMEM_TIMEOUT_VAL] LMEM watchdog timeout (ticks) = ${reg.MH_SFTY_CFG.fields.LMEM_TIMEOUT_VAL}\n` +
           `[PRESCALER       ] Watchdog prescaler            = ${reg.MH_SFTY_CFG.fields.PRESCALER} (${presDiv !== undefined ? `clk divided by ${presDiv}` : 'Reserved/invalid'})\n` +
           `[LMEM_TO_EN      ] Enable LMEM watchdog          = ${reg.MH_SFTY_CFG.fields.LMEM_TO_EN}`
    });
  } // MH_SFTY_CFG

  // === LMEM_PROT: LMEM Protection Address register ===================
  if ('LMEM_PROT' in reg && reg.LMEM_PROT.int32 !== undefined) {
    const regValue = reg.LMEM_PROT.int32;

    // 0. Extend existing register structure
    reg.LMEM_PROT.fields = {};
    reg.LMEM_PROT.report = [];

    // 1. Decode all individual bits of register
    reg.LMEM_PROT.fields.EA = getBits(regValue, 31, 16);
    reg.LMEM_PROT.fields.SA = getBits(regValue, 15, 0);

    // 2. Generate human-readable register report
    reg.LMEM_PROT.report.push({
      severityLevel: sevC.info,
      msg: `LMEM_PROT: ${reg.LMEM_PROT.name_long} (0x${reg.LMEM_PROT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[EA] LMEM End   Address (of accessible space) = 0x${(reg.LMEM_PROT.fields.EA << 2).toString(16).toUpperCase().padStart(5,'0')} (dec: ${(reg.LMEM_PROT.fields.EA << 2).toString(10).padStart(6,' ')}) as byte addr\n` +
           `[SA] LMEM Start Address (of accessible space) = 0x${(reg.LMEM_PROT.fields.SA << 2).toString(16).toUpperCase().padStart(5,'0')} (dec: ${(reg.LMEM_PROT.fields.SA << 2).toString(10).padStart(6,' ')}) as byte addr`
    });

    // Check if Protected area is maximum size
    if (reg.LMEM_PROT.fields.SA === 0x0000 && reg.LMEM_PROT.fields.EA === 0xFFFF) {
      reg.LMEM_PROT.report.push({
        severityLevel: sevC.infoHighlighted,
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
    reg.RX_FILTER_CFG.fields.DEFAULT_FIFO = getBits(regValue, 9, 9);
    reg.RX_FILTER_CFG.fields.AFAB        = getBits(regValue, 8, 8);
    reg.RX_FILTER_CFG.fields.ANMF        = getBits(regValue, 7, 7);
    reg.RX_FILTER_CFG.fields.FE_NUM      = getBits(regValue, 6, 0);

    const defFifoName = reg.RX_FILTER_CFG.fields.DEFAULT_FIFO ? 'RXFQ1' : 'RXFQ0';

    // 2. Generate human-readable register report
    reg.RX_FILTER_CFG.report.push({
      severityLevel: sevC.info,
      msg: `RX_FILTER_CFG: ${reg.RX_FILTER_CFG.name_long} (0x${reg.RX_FILTER_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[DEFAULT_FIFO] Default RX FIFO            = ${reg.RX_FILTER_CFG.fields.DEFAULT_FIFO} (${defFifoName}, destination for Frames for AFAB and ANMF)\n` +
           `[AFAB        ] Accept Filter Abort Frames = ${reg.RX_FILTER_CFG.fields.AFAB} (store Frame if Filtering not finished in time)\n` +
           `[ANMF        ] Accept Non-Matching Frames = ${reg.RX_FILTER_CFG.fields.ANMF} (store Frame if no Filter matches)\n` +
           `[FE_NUM      ] RX Filter elements #       = ${reg.RX_FILTER_CFG.fields.FE_NUM} (0-127 allowed, 0: disabled)`
    });
  } // RX_FILTER_CFG

  // === RX_FILTER_LMEM: RX Filter Start Address register ===============
  if ('RX_FILTER_LMEM' in reg && reg.RX_FILTER_LMEM.int32 !== undefined) {
    const regValue = reg.RX_FILTER_LMEM.int32;

    // 0. Extend existing register structure
    reg.RX_FILTER_LMEM.fields = {};
    reg.RX_FILTER_LMEM.report = [];

    // 1. Decode all individual bits of register
    reg.RX_FILTER_LMEM.fields.SA = getBits(regValue, 17, 6);
    const startAddrByte = reg.RX_FILTER_LMEM.fields.SA << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RX_FILTER_LMEM.report.push({
      severityLevel: sevC.info,
      msg: `RX_FILTER_LMEM: ${reg.RX_FILTER_LMEM.name_long} (0x${reg.RX_FILTER_LMEM.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[SA] Start address (LMEM, 64 byte aligned) = 0x${(startAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte}) as byte addr`
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
    reg.TXFQ_LMEM_SA.fields.ADD = getBits(regValue, 17, 6);
    const startAddrByte = reg.TXFQ_LMEM_SA.fields.ADD << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.TXFQ_LMEM_SA.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_LMEM_SA: ${reg.TXFQ_LMEM_SA.name_long} (0x${reg.TXFQ_LMEM_SA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] TXFQ Start Address (LMEM, 64 byte aligned) = 0x${(startAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // TXFQ_LMEM_SA

  // === TXFQ_LMEM_EA: TXFQ End Address register =======================
  if ('TXFQ_LMEM_EA' in reg && reg.TXFQ_LMEM_EA.int32 !== undefined) {
    const regValue = reg.TXFQ_LMEM_EA.int32;

    // 0. Extend existing register structure
    reg.TXFQ_LMEM_EA.fields = {};
    reg.TXFQ_LMEM_EA.report = [];

    // 1. Decode all individual bits of register
    reg.TXFQ_LMEM_EA.fields.ADD = getBits(regValue, 17, 6);
    const endAddrByte = reg.TXFQ_LMEM_EA.fields.ADD << 6;

    // 2. Generate human-readable register report
    reg.TXFQ_LMEM_EA.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_LMEM_EA: ${reg.TXFQ_LMEM_EA.name_long} (0x${reg.TXFQ_LMEM_EA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] TXFQ End   Address (LMEM, 64 byte aligned) = 0x${(endAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${endAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  }

  // === TXFQ_STS: TX FIFO Queue Status register =======================
  if ('TXFQ_STS' in reg && reg.TXFQ_STS.int32 !== undefined) {
    const regValue = reg.TXFQ_STS.int32;

    // 0. Extend existing register structure
    reg.TXFQ_STS.fields = {};
    reg.TXFQ_STS.report = [];

    // 1. Decode all individual bits of register
    reg.TXFQ_STS.fields.FIFO_FULL  = getBits(regValue, 8, 8);
    reg.TXFQ_STS.fields.FILL_LEVEL = getBits(regValue, 7, 0);

    // 2. Generate human-readable register report
    reg.TXFQ_STS.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_STS: ${reg.TXFQ_STS.name_long} (0x${reg.TXFQ_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[FIFO_FULL ] TXFQ full flag   = ${reg.TXFQ_STS.fields.FIFO_FULL}\n` +
           `[FILL_LEVEL] Elements in TXFQ = ${reg.TXFQ_STS.fields.FILL_LEVEL}`
    });
  }

  // === TXFQ_CFG: TX FIFO Configuration register ======================
  if ('TXFQ_CFG' in reg && reg.TXFQ_CFG.int32 !== undefined) {
    const regValue = reg.TXFQ_CFG.int32;

    // 0. Extend existing register structure
    reg.TXFQ_CFG.fields = {};
    reg.TXFQ_CFG.report = [];

    // 1. Decode all individual bits of register
    reg.TXFQ_CFG.fields.MAX_ELEM_SIZE = getBits(regValue, 5, 0);
    const maxElemBytes = reg.TXFQ_CFG.fields.MAX_ELEM_SIZE << 6; // in bytes: * 64

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
           `[MAX_ELEM_SIZE] Max TX Element size = ${reg.TXFQ_CFG.fields.MAX_ELEM_SIZE} x 64 byte (${maxElemBytes} bytes) (In FMM enough for: FD with ${fmmFdMaxPayload} bytes payload, or XL with ${fmmXlMaxPayload} bytes payload)`
    });

    // Check if CTM is enabled and max Elements size is > 2
    if (('MH_CFG' in reg) && (reg.MH_CFG.fields !== undefined)) {
      const ctmEnabled = reg.MH_CFG.fields.CTME === 1;
      if (ctmEnabled && (reg.TXFQ_CFG.fields.MAX_ELEM_SIZE > 2)) {
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
    reg.TXFQ_WPTR.fields.WPTR_ADD = getBits(regValue, 17, 2);
    const wptrAddrByte = reg.TXFQ_WPTR.fields.WPTR_ADD << 2;

    // 2. Generate human-readable register report
    reg.TXFQ_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_WPTR: ${reg.TXFQ_WPTR.name_long} (0x${reg.TXFQ_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[WPTR_ADD] TXFQ Write Pointer (LMEM) = 0x${(wptrAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // TXFQ_WPTR

  // === TXFQ_RPTR: TXFQ Read Pointer register =========================
  if ('TXFQ_RPTR' in reg && reg.TXFQ_RPTR.int32 !== undefined) {
    const regValue = reg.TXFQ_RPTR.int32;

    // 0. Extend existing register structure
    reg.TXFQ_RPTR.fields = {};
    reg.TXFQ_RPTR.report = [];

    // 1. Decode all individual bits of register
    reg.TXFQ_RPTR.fields.RPTR_ADD = getBits(regValue, 17, 2);
    const rptrAddrByte = reg.TXFQ_RPTR.fields.RPTR_ADD << 2;

    // 2. Generate human-readable register report
    reg.TXFQ_RPTR.report.push({
      severityLevel: sevC.info,
      msg: `TXFQ_RPTR: ${reg.TXFQ_RPTR.name_long} (0x${reg.TXFQ_RPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[RPTR_ADD] TXFQ Read Pointer (LMEM)  = 0x${(rptrAddrByte).toString(16).toUpperCase().padStart(4,'0')} (dec: ${rptrAddrByte.toString(10).padStart(6,' ')}) as byte addr`
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
    reg.TXPQ_CFG.fields.SLOT_SIZE   = getBits(regValue, 17, 8);
    reg.TXPQ_CFG.fields.TX_MSG_SEQE = getBits(regValue, 7, 7);
    reg.TXPQ_CFG.fields.SLOT_NUM    = getBits(regValue, 5, 0);

    const slotSizeWords = reg.TXPQ_CFG.fields.SLOT_SIZE;
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
           `[SLOT_SIZE  ] Slot size                            = ${slotSizeWords} words (${slotSizeBytes} bytes) (In FMM enough for: FD with ${fmmFdMaxPayload} bytes payload, or XL with ${fmmXlMaxPayload} bytes payload)\n` +
           `[TX_MSG_SEQE] TX Messages with same ID in sequence = ${reg.TXPQ_CFG.fields.TX_MSG_SEQE}\n` +
           `[SLOT_NUM   ] Number of PQ slots                   = ${reg.TXPQ_CFG.fields.SLOT_NUM} (0 disables TXPQ, >32 is capped to 32)`
    });

    // Check if CTM is enabled and max Elements size is > 2
    if (('MH_CFG' in reg) && (reg.MH_CFG.fields !== undefined)) {
      const ctmEnabled = reg.MH_CFG.fields.CTME === 1;
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
    reg.TXPQ_STS0.fields.SLOT_OCC = getBits(regValue, 31, 0);
    const occ = reg.TXPQ_STS0.fields.SLOT_OCC >>> 0;
    // Count busy slots
    let busyCount = 0; {
      let v = occ; while (v) { v &= (v - 1); busyCount++; } // uses Brian Kernighan’s algorithm
    }

    // 2. Generate human-readable register report
    reg.TXPQ_STS0.report.push({
      severityLevel: sevC.info,
      msg: `TXPQ_STS0: ${reg.TXPQ_STS0.name_long} (0x${reg.TXPQ_STS0.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[SLOT_OCC] Slot occupancy mask = 0x${occ.toString(16).toUpperCase().padStart(8,'0')} (busy slots: ${busyCount})`
    });
  } // TXPQ_STS0

  // === TXPQ_STS1: TX Priority Queue Status 1 register ===============
  if ('TXPQ_STS1' in reg && reg.TXPQ_STS1.int32 !== undefined) {
    const regValue = reg.TXPQ_STS1.int32;

    // 0. Extend existing register structure
    reg.TXPQ_STS1.fields = {};
    reg.TXPQ_STS1.report = [];

    // 1. Decode all individual bits of register
    reg.TXPQ_STS1.fields.TXPQ_FULL  = getBits(regValue, 8, 8);
    reg.TXPQ_STS1.fields.FILL_LEVEL = getBits(regValue, 5, 0);

    // 2. Generate human-readable register report
    reg.TXPQ_STS1.report.push({
      severityLevel: sevC.info,
      msg: `TXPQ_STS1: ${reg.TXPQ_STS1.name_long} (0x${reg.TXPQ_STS1.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TXPQ_FULL ] TXPQ full flag       = ${reg.TXPQ_STS1.fields.TXPQ_FULL}\n` +
           `[FILL_LEVEL] Pending PQ elements  = ${reg.TXPQ_STS1.fields.FILL_LEVEL}`
    });
  } // TXPQ_STS1

  // === TXPQ_LMEM: TX Priority Queue LMEM Address register ===========
  if ('TXPQ_LMEM' in reg && reg.TXPQ_LMEM.int32 !== undefined) {
    const regValue = reg.TXPQ_LMEM.int32;

    // 0. Extend existing register structure
    reg.TXPQ_LMEM.fields = {};
    reg.TXPQ_LMEM.report = [];

    // 1. Decode all individual bits of register
    reg.TXPQ_LMEM.fields.SA = getBits(regValue, 17, 6);
    const startAddrByte = reg.TXPQ_LMEM.fields.SA << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.TXPQ_LMEM.report.push({
      severityLevel: sevC.info,
      msg: `TXPQ_LMEM: ${reg.TXPQ_LMEM.name_long}  (0x${reg.TXPQ_LMEM.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[SA] Start address (LMEM, 64 byte aligned) = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // TXPQ_LMEM

  // === TXPQ_WPTR: TX Priority Queue Write Pointer register ==========
  if ('TXPQ_WPTR' in reg && reg.TXPQ_WPTR.int32 !== undefined) {
    const regValue = reg.TXPQ_WPTR.int32;

    // 0. Extend existing register structure
    reg.TXPQ_WPTR.fields = {};
    reg.TXPQ_WPTR.report = [];

    // 1. Decode all individual bits of register
    reg.TXPQ_WPTR.fields.WPTR_ADD = getBits(regValue, 17, 2);
    const wptrAddrByte = reg.TXPQ_WPTR.fields.WPTR_ADD << 2; // word aligned

    // 2. Generate human-readable register report
    reg.TXPQ_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `TXPQ_WPTR: ${reg.TXPQ_WPTR.name_long} (0x${reg.TXPQ_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[WPTR_ADD] TXPQ Write Pointer (LMEM)       = 0x${wptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(6,' ')}) as byte addr`
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
    reg.TEFQ_LMEM.fields.SA = getBits(regValue, 17, 6);
    const startAddrByte = reg.TEFQ_LMEM.fields.SA << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.TEFQ_LMEM.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_LMEM: ${reg.TEFQ_LMEM.name_long} (0x${reg.TEFQ_LMEM.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[SA] Start address (LMEM, 64 byte aligned) = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // TEFQ_LMEM

  // === TEFQ_CFG: TX Event FIFO Configuration register ===============
  if ('TEFQ_CFG' in reg && reg.TEFQ_CFG.int32 !== undefined) {
    const regValue = reg.TEFQ_CFG.int32;

    // 0. Extend existing register structure
    reg.TEFQ_CFG.fields = {};
    reg.TEFQ_CFG.report = [];

    // 1. Decode all individual bits of register
    reg.TEFQ_CFG.fields.TEQE_LARGE = getBits(regValue, 8, 8);
    reg.TEFQ_CFG.fields.TEQE_NUM   = getBits(regValue, 5, 0);

    const teqeSizeWords = 4 + (reg.TEFQ_CFG.fields.TEQE_LARGE ? 1 : 0);
    const teqeSizeBytes = teqeSizeWords << 2; // words -> bytes (*4)

    // 2. Generate human-readable register report
    reg.TEFQ_CFG.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_CFG: ${reg.TEFQ_CFG.name_long} (0x${reg.TEFQ_CFG.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TEQE_LARGE] TEFQ large element size enable = ${reg.TEFQ_CFG.fields.TEQE_LARGE} (resulting TEQE size: ${teqeSizeWords} words, ${teqeSizeBytes} bytes)\n` +
           `[TEQE_NUM  ] Number of TEFQ elements        = ${reg.TEFQ_CFG.fields.TEQE_NUM} (0 disables TEFQ, max. 63)`
    });
  } // TEFQ_CFG

  // === TEFQ_STS: TX Event FIFO Status register ======================
  if ('TEFQ_STS' in reg && reg.TEFQ_STS.int32 !== undefined) {
    const regValue = reg.TEFQ_STS.int32;

    // 0. Extend existing register structure
    reg.TEFQ_STS.fields = {};
    reg.TEFQ_STS.report = [];

    // 1. Decode all individual bits of register
    reg.TEFQ_STS.fields.TEFQ_FULL  = getBits(regValue, 8, 8);
    reg.TEFQ_STS.fields.FILL_LEVEL = getBits(regValue, 5, 0);

    // 2. Generate human-readable register report
    reg.TEFQ_STS.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_STS: ${reg.TEFQ_STS.name_long} (0x${reg.TEFQ_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TEFQ_FULL ] TEFQ full flag  = ${reg.TEFQ_STS.fields.TEFQ_FULL}\n` +
           `[FILL_LEVEL] TEFQ fill level = ${reg.TEFQ_STS.fields.FILL_LEVEL} TEQEs (0: empty)`
    });
  } // TEFQ_STS

  // === TEFQ_WPTR: TX Event FIFO Write Pointer register ==============
  if ('TEFQ_WPTR' in reg && reg.TEFQ_WPTR.int32 !== undefined) {
    const regValue = reg.TEFQ_WPTR.int32;

    // 0. Extend existing register structure
    reg.TEFQ_WPTR.fields = {};
    reg.TEFQ_WPTR.report = [];

    // 1. Decode all individual bits of register
    reg.TEFQ_WPTR.fields.WPTR_ADD = getBits(regValue, 17, 2);
    const wptrAddrByte = reg.TEFQ_WPTR.fields.WPTR_ADD << 2; // word aligned

    // 2. Generate human-readable register report
    reg.TEFQ_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_WPTR: ${reg.TEFQ_WPTR.name_long} (0x${reg.TEFQ_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[WPTR_ADD] TEFQ Write Pointer (LMEM) = 0x${wptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // TEFQ_WPTR

  // === TEFQ_RPTR: TX Event FIFO Read Pointer register ===============
  if ('TEFQ_RPTR' in reg && reg.TEFQ_RPTR.int32 !== undefined) {
    const regValue = reg.TEFQ_RPTR.int32;

    // 0. Extend existing register structure
    reg.TEFQ_RPTR.fields = {};
    reg.TEFQ_RPTR.report = [];

    // 1. Decode all individual bits of register
    reg.TEFQ_RPTR.fields.RPTR_ADD = getBits(regValue, 17, 2);
    const rptrAddrByte = reg.TEFQ_RPTR.fields.RPTR_ADD << 2; // word aligned

    // 2. Generate human-readable register report
    reg.TEFQ_RPTR.report.push({
      severityLevel: sevC.info,
      msg: `TEFQ_RPTR: ${reg.TEFQ_RPTR.name_long} (0x${reg.TEFQ_RPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[RPTR_ADD] TEFQ Read Pointer (LMEM)  = 0x${rptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${rptrAddrByte.toString(10).padStart(6,' ')}) as byte addr`
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
    reg.CTB_LMEM.fields.SA = getBits(regValue, 17, 6);
    const startAddrByte = reg.CTB_LMEM.fields.SA << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.CTB_LMEM.report.push({
      severityLevel: sevC.info,
      msg: `CTB_LMEM: ${reg.CTB_LMEM.name_long} (0x${reg.CTB_LMEM.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[SA] Start address (LMEM, 64 byte aligned) = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(6,' ')}) as byte addr (only applicable in CTM)`
    });
  } // CTB_LMEM

  // === CTM_DESC_SRC: Cut-Through Mode Source Address Register ======
  if ('CTM_DESC_SRC' in reg && reg.CTM_DESC_SRC.int32 !== undefined) {
    const regValue = reg.CTM_DESC_SRC.int32;

    // 0. Extend existing register structure
    reg.CTM_DESC_SRC.fields = {};
    reg.CTM_DESC_SRC.report = [];

    // 1. Decode all individual bits of register
    reg.CTM_DESC_SRC.fields.ADD = getBits(regValue, 31, 0);

    // 2. Generate human-readable register report
    reg.CTM_DESC_SRC.report.push({
      severityLevel: sevC.info,
      msg: `CTM_DESC_SRC: ${reg.CTM_DESC_SRC.name_long} (0x${reg.CTM_DESC_SRC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] CTM source address for 64 byte block copy      = 0x${reg.CTM_DESC_SRC.fields.ADD.toString(16).toUpperCase().padStart(8,'0')} (dec: ${reg.CTM_DESC_SRC.fields.ADD >>> 0}) (only applicable in CTM)`
    });
  } // CTM_DESC_SRC

  // === CTM_DESC_DEST: Cut-Through Mode Destination Address Register ==
  if ('CTM_DESC_DEST' in reg && reg.CTM_DESC_DEST.int32 !== undefined) {
    const regValue = reg.CTM_DESC_DEST.int32;

    // 0. Extend existing register structure
    reg.CTM_DESC_DEST.fields = {};
    reg.CTM_DESC_DEST.report = [];

    // 1. Decode all individual bits of register
    reg.CTM_DESC_DEST.fields.ADD = getBits(regValue, 31, 0);

    // 2. Generate human-readable register report
    reg.CTM_DESC_DEST.report.push({
      severityLevel: sevC.info,
      msg: `CTM_DESC_DEST: ${reg.CTM_DESC_DEST.name_long} (0x${reg.CTM_DESC_DEST.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] CTM destination address for 64 byte block copy = 0x${reg.CTM_DESC_DEST.fields.ADD.toString(16).toUpperCase().padStart(8,'0')} (dec: ${reg.CTM_DESC_DEST.fields.ADD >>> 0}) (only applicable in CTM)`
    });
  } // CTM_DESC_DEST

  // === CTM_EVENT: Cut-Through Mode Event Register ==================
  if ('CTM_EVENT' in reg && reg.CTM_EVENT.int32 !== undefined) {
    const regValue = reg.CTM_EVENT.int32;

    // 0. Extend existing register structure
    reg.CTM_EVENT.fields = {};
    reg.CTM_EVENT.report = [];

    // 1. Decode all individual bits of register
    reg.CTM_EVENT.fields.RX_BLOCK_COPY_REQ = getBits(regValue, 1, 1);
    reg.CTM_EVENT.fields.TX_BLOCK_COPY_REQ = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.CTM_EVENT.report.push({
      severityLevel: sevC.info,
      msg: `CTM_EVENT: ${reg.CTM_EVENT.name_long} (0x${reg.CTM_EVENT.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[RX_BLOCK_COPY_REQ] RX block copy request = ${reg.CTM_EVENT.fields.RX_BLOCK_COPY_REQ} (only applicable in CTM)\n` +
           `[TX_BLOCK_COPY_REQ] TX block copy request = ${reg.CTM_EVENT.fields.TX_BLOCK_COPY_REQ} (only applicable in CTM)`
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
    reg.RXFQ0_SA.fields.ADD = getBits(regValue, 31, 6);
    const startAddrByte = reg.RXFQ0_SA.fields.ADD << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RXFQ0_SA.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_SA: ${reg.RXFQ0_SA.name_long} (0x${reg.RXFQ0_SA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] RXFQ0 Start Address (FMM: LMEM, CTM: SMEM, 64 byte aligned) = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // RXFQ0_SA

  // === RXFQ0_EA: RX FIFO Queue 0 End Address register ==============
  if ('RXFQ0_EA' in reg && reg.RXFQ0_EA.int32 !== undefined) {
    const regValue = reg.RXFQ0_EA.int32;

    // 0. Extend existing register structure
    reg.RXFQ0_EA.fields = {};
    reg.RXFQ0_EA.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ0_EA.fields.ADD = getBits(regValue, 31, 6);
    const endAddrByte = reg.RXFQ0_EA.fields.ADD << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RXFQ0_EA.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_EA: ${reg.RXFQ0_EA.name_long} (0x${reg.RXFQ0_EA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] RXFQ0 End   Address (FMM: LMEM, CTM: SMEM, 64 byte aligned) = 0x${endAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${endAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // RXFQ0_EA

  // === RXFQ0_RPTR: RX FIFO Queue 0 Read Pointer register ===========
  if ('RXFQ0_RPTR' in reg && reg.RXFQ0_RPTR.int32 !== undefined) {
    const regValue = reg.RXFQ0_RPTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ0_RPTR.fields = {};
    reg.RXFQ0_RPTR.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ0_RPTR.fields.ADD = getBits(regValue, 31, 2);
    const rptrAddrByte = reg.RXFQ0_RPTR.fields.ADD << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ0_RPTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_RPTR: ${reg.RXFQ0_RPTR.name_long} (0x${reg.RXFQ0_RPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] RXFQ0 Read Pointer (FMM: LMEM, CTM: SMEM) = 0x${rptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${rptrAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // RXFQ0_RPTR

  // === RXFQ0_WPTR: RX FIFO Queue 0 Write Pointer register ==========
  if ('RXFQ0_WPTR' in reg && reg.RXFQ0_WPTR.int32 !== undefined) {
    const regValue = reg.RXFQ0_WPTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ0_WPTR.fields = {};
    reg.RXFQ0_WPTR.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ0_WPTR.fields.ADD = getBits(regValue, 31, 2);
    const wptrAddrByte = reg.RXFQ0_WPTR.fields.ADD << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ0_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_WPTR: ${reg.RXFQ0_WPTR.name_long} (0x${reg.RXFQ0_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] RXFQ0 Write Pointer (FMM: LMEM, CTM: SMEM) = 0x${wptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // RXFQ0_WPTR

  // === RXFQ0_WRAP_PTR: RX FIFO Queue 0 Wrap Pointer in SMEM Register ===
  if ('RXFQ0_WRAP_PTR' in reg && reg.RXFQ0_WRAP_PTR.int32 !== undefined) {
    const regValue = reg.RXFQ0_WRAP_PTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ0_WRAP_PTR.fields = {};
    reg.RXFQ0_WRAP_PTR.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ0_WRAP_PTR.fields.SMEM_ADD = getBits(regValue, 31, 2);
    const smemAddrByte = reg.RXFQ0_WRAP_PTR.fields.SMEM_ADD << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ0_WRAP_PTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ0_WRAP_PTR: ${reg.RXFQ0_WRAP_PTR.name_long} (0x${reg.RXFQ0_WRAP_PTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[SMEM_ADD] RXFQ0 Wrap Pointer (SMEM) = 0x${smemAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${smemAddrByte.toString(10).padStart(6,' ')}) as byte addr (only applicable in CTM)`
    });
  } // RXFQ0_WRAP_PTR

  // === RXFQ1_SA: RX FIFO Queue 1 Start Address register ============
  if ('RXFQ1_SA' in reg && reg.RXFQ1_SA.int32 !== undefined) {
    const regValue = reg.RXFQ1_SA.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_SA.fields = {};
    reg.RXFQ1_SA.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ1_SA.fields.ADD = getBits(regValue, 31, 6);
    const startAddrByte = reg.RXFQ1_SA.fields.ADD << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RXFQ1_SA.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_SA: ${reg.RXFQ1_SA.name_long} (0x${reg.RXFQ1_SA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] RXFQ1 Start Address (FMM: LMEM, CTM: SMEM, 64 byte aligned) = 0x${startAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${startAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // RXFQ1_SA

  // === RXFQ1_EA: RX FIFO Queue 1 End Address register ==============
  if ('RXFQ1_EA' in reg && reg.RXFQ1_EA.int32 !== undefined) {
    const regValue = reg.RXFQ1_EA.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_EA.fields = {};
    reg.RXFQ1_EA.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ1_EA.fields.ADD = getBits(regValue, 31, 6);
    const endAddrByte = reg.RXFQ1_EA.fields.ADD << 6; // 64-byte alignment

    // 2. Generate human-readable register report
    reg.RXFQ1_EA.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_EA: ${reg.RXFQ1_EA.name_long} (0x${reg.RXFQ1_EA.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] RXFQ1 End   Address (FMM: LMEM, CTM: SMEM, 64 byte aligned) = 0x${endAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${endAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // RXFQ1_EA

  // === RXFQ1_RPTR: RX FIFO Queue 1 Read Pointer register ===========
  if ('RXFQ1_RPTR' in reg && reg.RXFQ1_RPTR.int32 !== undefined) {
    const regValue = reg.RXFQ1_RPTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_RPTR.fields = {};
    reg.RXFQ1_RPTR.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ1_RPTR.fields.ADD = getBits(regValue, 31, 2);
    const rptrAddrByte = reg.RXFQ1_RPTR.fields.ADD << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ1_RPTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_RPTR: ${reg.RXFQ1_RPTR.name_long} (0x${reg.RXFQ1_RPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] RXFQ1 Read Pointer (FMM: LMEM, CTM: SMEM)  = 0x${rptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${rptrAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // RXFQ1_RPTR

  // === RXFQ1_WPTR: RX FIFO Queue 1 Write Pointer register ==========
  if ('RXFQ1_WPTR' in reg && reg.RXFQ1_WPTR.int32 !== undefined) {
    const regValue = reg.RXFQ1_WPTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_WPTR.fields = {};
    reg.RXFQ1_WPTR.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ1_WPTR.fields.ADD = getBits(regValue, 31, 2);
    const wptrAddrByte = reg.RXFQ1_WPTR.fields.ADD << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ1_WPTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_WPTR: ${reg.RXFQ1_WPTR.name_long} (0x${reg.RXFQ1_WPTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[ADD] RXFQ1 Write Pointer (FMM: LMEM, CTM: SMEM) = 0x${wptrAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${wptrAddrByte.toString(10).padStart(6,' ')}) as byte addr`
    });
  } // RXFQ1_WPTR

  // === RXFQ1_WRAP_PTR: RX FIFO Queue 1 Wrap Pointer in SMEM Register ===
  if ('RXFQ1_WRAP_PTR' in reg && reg.RXFQ1_WRAP_PTR.int32 !== undefined) {
    const regValue = reg.RXFQ1_WRAP_PTR.int32;

    // 0. Extend existing register structure
    reg.RXFQ1_WRAP_PTR.fields = {};
    reg.RXFQ1_WRAP_PTR.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ1_WRAP_PTR.fields.SMEM_ADD = getBits(regValue, 31, 2);
    const smemAddrByte = reg.RXFQ1_WRAP_PTR.fields.SMEM_ADD << 2; // word aligned

    // 2. Generate human-readable register report
    reg.RXFQ1_WRAP_PTR.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ1_WRAP_PTR: ${reg.RXFQ1_WRAP_PTR.name_long} (0x${reg.RXFQ1_WRAP_PTR.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[SMEM_ADD] RXFQ1 Wrap Pointer (SMEM) = 0x${smemAddrByte.toString(16).toUpperCase().padStart(4,'0')} (dec: ${smemAddrByte.toString(10).padStart(6,' ')}) as byte addr (ony applicable in CTM)`
    });
  } // RXFQ1_WRAP_PTR

  // === RXFQ_STS: RX FIFO Queue Status register =====================
  if ('RXFQ_STS' in reg && reg.RXFQ_STS.int32 !== undefined) {
    const regValue = reg.RXFQ_STS.int32;

    // 0. Extend existing register structure
    reg.RXFQ_STS.fields = {};
    reg.RXFQ_STS.report = [];

    // 1. Decode all individual bits of register
    reg.RXFQ_STS.fields.RXFQ1_FILL_LEVEL = getBits(regValue, 15, 8);
    reg.RXFQ_STS.fields.RXFQ0_FILL_LEVEL = getBits(regValue, 7, 0);

    // 2. Generate human-readable register report
    reg.RXFQ_STS.report.push({
      severityLevel: sevC.info,
      msg: `RXFQ_STS: ${reg.RXFQ_STS.name_long} (0x${reg.RXFQ_STS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[RXFQ1_FILL_LEVEL] Elements in RXFQ1 = ${reg.RXFQ_STS.fields.RXFQ1_FILL_LEVEL} (range: 0 to 255) (FMM: real fill level, CTM: only up counter with warp-around)\n` +
           `[RXFQ0_FILL_LEVEL] Elements in RXFQ0 = ${reg.RXFQ_STS.fields.RXFQ0_FILL_LEVEL} (range: 0 to 255) (FMM: real fill level, CTM: only up counter with wrap-around)`
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
    reg.DEBUG_TEST_CTRL.fields.HDP_SEL = getBits(regValue, 10, 8);
    reg.DEBUG_TEST_CTRL.fields.HDP_EN  = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.DEBUG_TEST_CTRL.report.push({
      severityLevel: sevC.info,
      msg: `DEBUG_TEST_CTRL: ${reg.DEBUG_TEST_CTRL.name_long} (0x${reg.DEBUG_TEST_CTRL.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[HDP_SEL] HDP[15:0] signal set select = ${reg.DEBUG_TEST_CTRL.fields.HDP_SEL}\n` +
           `[HDP_EN ] Hardware debug port enable  = ${reg.DEBUG_TEST_CTRL.fields.HDP_EN}`
    });
  } // DEBUG_TEST_CTRL

  // === TX_SCAN_WC: TX-SCAN winning candidates register =============
  if ('TX_SCAN_WC' in reg && reg.TX_SCAN_WC.int32 !== undefined) {
    const regValue = reg.TX_SCAN_WC.int32;

    // 0. Extend existing register structure
    reg.TX_SCAN_WC.fields = {};
    reg.TX_SCAN_WC.report = [];

    // 1. Decode all individual bits of register
    reg.TX_SCAN_WC.fields.FQ_PQ_ADD = getBits(regValue, 31, 16);
    reg.TX_SCAN_WC.fields.PQSN      = getBits(regValue, 6, 2);
    reg.TX_SCAN_WC.fields.FQ_PQ     = getBits(regValue, 1, 1);
    reg.TX_SCAN_WC.fields.VALID     = getBits(regValue, 0, 0);

    const candType = reg.TX_SCAN_WC.fields.FQ_PQ ? 'TXPQ' : 'TXFQ';
    const addrByte = reg.TX_SCAN_WC.fields.FQ_PQ_ADD << 2; // LMEM pointer, word -> byte

    // 2. Generate human-readable register report
    reg.TX_SCAN_WC.report.push({
      severityLevel: sevC.info,
      msg: `TX_SCAN_WC: ${reg.TX_SCAN_WC.name_long} (0x${reg.TX_SCAN_WC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[FQ_PQ_ADD] LMEM address pointer (byte)       = 0x${addrByte.toString(16).toUpperCase().padStart(5,'0')} (dec: ${addrByte.toString(10).padStart(6,' ')})\n` +
           `[PQSN     ] PQ slot number (if from PQ)       = ${reg.TX_SCAN_WC.fields.PQSN}\n` +
           `[FQ_PQ    ] Candidate source (0:TXFQ, 1:TXPQ) = ${reg.TX_SCAN_WC.fields.FQ_PQ} (${candType})\n` +
           `[VALID    ] Register contents valid           = ${reg.TX_SCAN_WC.fields.VALID} (0: invalid, 1: valid)` 
    });
  } // TX_SCAN_WC

  // === TX_SCAN_PC: TX-SCAN prepared candidates register ============
  if ('TX_SCAN_PC' in reg && reg.TX_SCAN_PC.int32 !== undefined) {
    const regValue = reg.TX_SCAN_PC.int32;

    // 0. Extend existing register structure
    reg.TX_SCAN_PC.fields = {};
    reg.TX_SCAN_PC.report = [];

    // 1. Decode all individual bits of register
    reg.TX_SCAN_PC.fields.FQ_PQ_ADD = getBits(regValue, 31, 16);
    reg.TX_SCAN_PC.fields.PQSN      = getBits(regValue, 6, 2);
    reg.TX_SCAN_PC.fields.FQ_PQ     = getBits(regValue, 1, 1);
    reg.TX_SCAN_PC.fields.VALID     = getBits(regValue, 0, 0);

    const candType = reg.TX_SCAN_PC.fields.FQ_PQ ? 'TXPQ' : 'TXFQ';
    const addrByte = reg.TX_SCAN_PC.fields.FQ_PQ_ADD << 2; // LMEM pointer, word -> byte

    // 2. Generate human-readable register report
    reg.TX_SCAN_PC.report.push({
      severityLevel: sevC.info,
      msg: `TX_SCAN_PC: ${reg.TX_SCAN_PC.name_long} (0x${reg.TX_SCAN_PC.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[FQ_PQ_ADD] LMEM address pointer (byte)       = 0x${addrByte.toString(16).toUpperCase().padStart(5,'0')} (dec: ${addrByte.toString(10).padStart(6,' ')})\n` +
           `[PQSN     ] PQ slot number (if from PQ)       = ${reg.TX_SCAN_PC.fields.PQSN}\n` +
           `[FQ_PQ    ] Candidate source (0:TXFQ, 1:TXPQ) = ${reg.TX_SCAN_PC.fields.FQ_PQ} (${candType})\n` +
           `[VALID    ] Register contents valid           = ${reg.TX_SCAN_PC.fields.VALID} (0: invalid, 1: valid)`
    });
  } // TX_SCAN_PC

  // === VBM_STATUS: VBM Status register ====================================
  if ('VBM_STATUS' in reg && reg.VBM_STATUS.int32 !== undefined) {
    const regValue = reg.VBM_STATUS.int32;

    // 0. Extend existing register structure
    reg.VBM_STATUS.fields = {};
    reg.VBM_STATUS.report = [];

    // 1. Decode all individual bits of register
    reg.VBM_STATUS.fields.TXFQ_ENQ  = getBits(regValue, 6, 6);
    reg.VBM_STATUS.fields.TXPQ_ENQ  = getBits(regValue, 5, 5);
    reg.VBM_STATUS.fields.RXFQ0_DEQ = getBits(regValue, 4, 4);
    reg.VBM_STATUS.fields.RXFQ1_DEQ = getBits(regValue, 3, 3);
    reg.VBM_STATUS.fields.TEFQ_DEQ  = getBits(regValue, 2, 2);
    reg.VBM_STATUS.fields.CTB_ENQ   = getBits(regValue, 1, 1);
    reg.VBM_STATUS.fields.CTB_DEQ   = getBits(regValue, 0, 0);

    // 2. Generate human-readable register report
    reg.VBM_STATUS.report.push({
      severityLevel: sevC.info,
      msg: `VBM_STATUS: ${reg.VBM_STATUS.name_long} (0x${reg.VBM_STATUS.addr.toString(16).toUpperCase().padStart(3,'0')}: 0x${regValue.toString(16).toUpperCase().padStart(8,'0')})\n` +
           `[TXFQ_ENQ ] TXFQ enqueuing in progress  = ${reg.VBM_STATUS.fields.TXFQ_ENQ}\n` +
           `[TXPQ_ENQ ] TXPQ enqueuing in progress  = ${reg.VBM_STATUS.fields.TXPQ_ENQ}\n` +
           `[RXFQ0_DEQ] RXFQ0 dequeuing in progress = ${reg.VBM_STATUS.fields.RXFQ0_DEQ}\n` +
           `[RXFQ1_DEQ] RXFQ1 dequeuing in progress = ${reg.VBM_STATUS.fields.RXFQ1_DEQ}\n` +
           `[TEFQ_DEQ ] TEFQ dequeuing in progress  = ${reg.VBM_STATUS.fields.TEFQ_DEQ}\n` +
           `[CTB_ENQ  ] CTB enqueuing in progress   = ${reg.VBM_STATUS.fields.CTB_ENQ} (only applicable in CTM)\n` +
           `[CTB_DEQ  ] CTB dequeuing in progress   = ${reg.VBM_STATUS.fields.CTB_DEQ} (only applicable in CTM)`
    });
  }
}

// ===================================================================================
// Task 1: Queues Summary: Build a formatted overview of TX/RX/Event queues
// Task 2: LMEM and SMEM memory map including overlaps detection
export function buildQueuesSummary(reg) {
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
  const txfq_totalB = (txfq_sa_b !== undefined && txfq_ea_b !== undefined && txfq_ea_b >= txfq_sa_b) ? (txfq_ea_b - txfq_sa_b + 64) : undefined;
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
  const r0_totalB = (r0_sa_b !== undefined && r0_ea_b !== undefined && r0_ea_b >= r0_sa_b) ? (r0_ea_b - r0_sa_b + 64) : undefined;
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
  const r1_totalB = (r1_sa_b !== undefined && r1_ea_b !== undefined && r1_ea_b >= r1_sa_b) ? (r1_ea_b - r1_sa_b + 64) : undefined;
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
    const txfqEaLast = txfq_ea_b !== undefined ? (txfq_ea_b + 63) : undefined; // last byte of last 64-byte block
    lmemEntries.push({ name: 'TXFQ', sa: txfq_sa_b, ea: txfqEaLast, size: txfq_totalB });
  }
  // TXPQ (enabled via MH_CFG)
  if (enTXPQ === 1 && txpq_sa_b !== undefined) {
    const txpqEaLast = txpq_ea_b !== undefined ? (txpq_ea_b - 1) : undefined; // computed end last byte
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
      const r0EaLast = r0_ea_b !== undefined ? (r0_ea_b + 63) : undefined; // last byte of last 64-byte block
      lmemEntries.push({ name: 'RXFQ0', sa: r0_sa_b, ea: r0EaLast, size: r0_totalB });
    }
    if (enRXFQ1 === 1 && r1_sa_b !== undefined) {
      const r1EaLast = r1_ea_b !== undefined ? (r1_ea_b + 63) : undefined;
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
    const lmemSize = (lmemSA !== undefined && lmemEA !== undefined) ? (lmemEA - lmemSA + 1) : undefined;
    lmemRows.push(entryLineLmem('LMEM_PROT', lmemSA, lmemEA, lmemSize));
    if (lmemProt === undefined) {
      lmemRows[lmemRows.length - 1] += ' (register undefined: max. LMEM size assumed (256 kbyte))';
    }
    let prevEnd = lmemSA; // start gaps from LMEM start if available
    for (const it of lmemEntries) {
      if (prevEnd !== undefined && it.sa !== undefined && it.sa > (prevEnd + 1)) {
        lmemRows.push(entryLineLmem('- GAP -', prevEnd + 1, it.sa, (it.sa - (prevEnd + 1)))); // gap
      }
      lmemRows.push(entryLineLmem(it.name, it.sa, it.ea, it.size));
      if (it.name === 'Filters' && it._filtersMaxEa !== undefined) {
        lmemRows[lmemRows.length - 1] += ` (max. End byte ${hex5(it._filtersMaxEa)} if 2 Comparisons/Filter)`;
      }
      prevEnd = (it.ea !== undefined ? it.ea : prevEnd);
    }
    if (prevEnd !== undefined && lmemEA !== undefined && lmemEA > (prevEnd + 1)) {
      lmemRows.push(entryLineLmem('- GAP -', prevEnd + 1, lmemEA, (lmemEA - (prevEnd + 1)))); // final gap
    }
  }

  // SMEM map in CTM consists only of RXFQ0/1
  const smemOverlapErrors = [];
  if (ctme === 1) {
    const smemEntries = [];
    if (enRXFQ0 === 1 && r0_sa_b !== undefined) {
      const r0EaLast = r0_ea_b !== undefined ? (r0_ea_b + 63) : undefined;
      const r0Size = (r0_totalB !== undefined ? r0_totalB : (r0EaLast !== undefined && r0_sa_b !== undefined ? (r0EaLast - r0_sa_b + 1) : undefined));
      smemEntries.push({ name: 'RXFQ0', sa: r0_sa_b, ea: r0EaLast, size: r0Size });
    }
    if (enRXFQ1 === 1 && r1_sa_b !== undefined) {
      const r1EaLast = r1_ea_b !== undefined ? (r1_ea_b + 63) : undefined;
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

  for (const name of targets) {
    if (name in reg && reg[name] && Array.isArray(reg[name].report)) {
      reg[name].report.push({ severityLevel: sevC.infoHighlighted, msg: msg_qsum });
      reg[name].report.push({ severityLevel: sevC.infoHighlighted, msg: msg_lmemMap });
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
        reg[name].report.push({ severityLevel: sevC.infoHighlighted, msg: msg_smemMap });
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
      break;
    } else {
      console.log('Queues Summary: no queue-related register report available; summary not printed.');
    }
  }

} // Queues Summary