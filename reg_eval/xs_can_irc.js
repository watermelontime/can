// All rights reserved. (c) 2026 //

// XS_CAN: IRC register decoding
import { getBits, defineField } from './help_functions.js';
import { sevC } from './help_functions.js';

// Render a single 32-bit table row from a decoded field (single source of truth).
// Produces: `[<bit> <NAME_SHORT padded>] <name_long padded> = <value>`
const ircRow = (fld) => `[${String(fld.lsb).padStart(2)} ${fld.name_short.padEnd(25)}] ${fld.name_long.padEnd(33)} = ${fld.value}`;

// ===================================================================================
// IRC registers decoding
export function procRegsIRC(reg) {
	// === TX_FUNC_RAW: TX Functional Raw Event Status ===
	if ('TX_FUNC_RAW' in reg && reg.TX_FUNC_RAW.int32 !== undefined) {
		const v = reg.TX_FUNC_RAW.int32;
		// 0. Extend existing register structure
		reg.TX_FUNC_RAW.fields = {};
		reg.TX_FUNC_RAW.report = [];
		// 1. Decode all individual bits of TX_FUNC_RAW register
		defineField(reg.TX_FUNC_RAW, v, 'PRT_TX_EVT', 16, 16, 'PRT TX CAN Message');
		defineField(reg.TX_FUNC_RAW, v, 'MH_CTB_TX_BC_REQ', 4, 4, 'MH Block Copy Pending (TX dir)');
		defineField(reg.TX_FUNC_RAW, v, 'MH_TEFQ_DEQ', 3, 3, 'TEFQ Dequeue');
		defineField(reg.TX_FUNC_RAW, v, 'MH_TEFQ_ENQ', 2, 2, 'TEFQ Enqueue');
		defineField(reg.TX_FUNC_RAW, v, 'MH_TXPQ_ENQ', 1, 1, 'TX Priority Queue Enqueue');
		defineField(reg.TX_FUNC_RAW, v, 'MH_TXFQ_ENQ', 0, 0, 'TX FIFO Queue Enqueue');
		const f = reg.TX_FUNC_RAW.fields;
		// 2. Generate human-readable register report
		reg.TX_FUNC_RAW.report.push({
			severityLevel: sevC.info,
			msg: `TX_FUNC_RAW: ${reg.TX_FUNC_RAW.name_long} (0x${reg.TX_FUNC_RAW.addr !== undefined ? reg.TX_FUNC_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
				   `[31 -                        ] Reserved                          = - \n`+
				   `[30 -                        ] Reserved                          = - \n`+
				   `[29 -                        ] Reserved                          = - \n`+
				   `[28 -                        ] Reserved                          = - \n`+
				   `[27 -                        ] Reserved                          = - \n`+
				   `[26 -                        ] Reserved                          = - \n`+
				   `[25 -                        ] Reserved                          = - \n`+
				   `[24 -                        ] Reserved                          = - \n`+
				   `[23 -                        ] Reserved                          = - \n`+
				   `[22 -                        ] Reserved                          = - \n`+
				   `[21 -                        ] Reserved                          = - \n`+
				   `[20 -                        ] Reserved                          = - \n`+
				   `[19 -                        ] Reserved                          = - \n`+
				   `[18 -                        ] Reserved                          = - \n`+
				   `[17 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.PRT_TX_EVT)}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
				   `[ 8 -                        ] Reserved                          = - \n`+
				   `[ 7 -                        ] Reserved                          = - \n`+
				   `[ 6 -                        ] Reserved                          = - \n`+
				   `[ 5 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.MH_CTB_TX_BC_REQ)}\n`+
				   `${ircRow(f.MH_TEFQ_DEQ)}\n`+
				   `${ircRow(f.MH_TEFQ_ENQ)}\n`+
				   `${ircRow(f.MH_TXPQ_ENQ)}\n`+
				   `${ircRow(f.MH_TXFQ_ENQ)}`
		});
	}

	// === RX_FUNC_RAW: RX Functional Raw Event Status ===
	if ('RX_FUNC_RAW' in reg && reg.RX_FUNC_RAW.int32 !== undefined) {
		const v = reg.RX_FUNC_RAW.int32;
		// 0. Extend existing register structure
		reg.RX_FUNC_RAW.fields = {};
		reg.RX_FUNC_RAW.report = [];
		// 1. Decode all individual bits of RX_FUNC_RAW register
		defineField(reg.RX_FUNC_RAW, v, 'PRT_RX_EVT', 16, 16, 'PRT RX CAN Message');
		defineField(reg.RX_FUNC_RAW, v, 'MH_RX_MSG_ALERT', 6, 6, 'RX Message Alert (FEC.ALERT=1)');
		defineField(reg.RX_FUNC_RAW, v, 'MH_RX_FILTER_MATCH', 5, 5, 'RX Filter Match (FEC.IRQ=1)');
		defineField(reg.RX_FUNC_RAW, v, 'MH_CTB_RX_BC_REQ', 4, 4, 'Block Copy Pending (RX dir)');
		defineField(reg.RX_FUNC_RAW, v, 'MH_RXFQ1_DEQ', 3, 3, 'RXFQ1 Dequeue');
		defineField(reg.RX_FUNC_RAW, v, 'MH_RXFQ0_DEQ', 2, 2, 'RXFQ0 Dequeue');
		defineField(reg.RX_FUNC_RAW, v, 'MH_RXFQ1_ENQ', 1, 1, 'RXFQ1 Enqueue');
		defineField(reg.RX_FUNC_RAW, v, 'MH_RXFQ0_ENQ', 0, 0, 'RXFQ0 Enqueue');
		const f = reg.RX_FUNC_RAW.fields;
		// 2. Generate human-readable register report
		reg.RX_FUNC_RAW.report.push({
			severityLevel: sevC.info,
			msg: `RX_FUNC_RAW: ${reg.RX_FUNC_RAW.name_long} (0x${reg.RX_FUNC_RAW.addr !== undefined ? reg.RX_FUNC_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
				   `[31 -                        ] Reserved                          = - \n`+
				   `[30 -                        ] Reserved                          = - \n`+
				   `[29 -                        ] Reserved                          = - \n`+
				   `[28 -                        ] Reserved                          = - \n`+
				   `[27 -                        ] Reserved                          = - \n`+
				   `[26 -                        ] Reserved                          = - \n`+
				   `[25 -                        ] Reserved                          = - \n`+
				   `[24 -                        ] Reserved                          = - \n`+
				   `[23 -                        ] Reserved                          = - \n`+
				   `[22 -                        ] Reserved                          = - \n`+
				   `[21 -                        ] Reserved                          = - \n`+
				   `[20 -                        ] Reserved                          = - \n`+
				   `[19 -                        ] Reserved                          = - \n`+
				   `[18 -                        ] Reserved                          = - \n`+
				   `[17 -                        ] Reserved                          = - \n`+
			       `${ircRow(f.PRT_RX_EVT)}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
				   `[ 8 -                        ] Reserved                          = - \n`+
				   `[ 7 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.MH_RX_MSG_ALERT)}\n`+
				   `${ircRow(f.MH_RX_FILTER_MATCH)}\n`+
				   `${ircRow(f.MH_CTB_RX_BC_REQ)}\n`+
				   `${ircRow(f.MH_RXFQ1_DEQ)}\n`+
				   `${ircRow(f.MH_RXFQ0_DEQ)}\n`+
				   `${ircRow(f.MH_RXFQ1_ENQ)}\n`+
				   `${ircRow(f.MH_RXFQ0_ENQ)}`
		});
	}

	// === ERR_STS_RAW: Error Raw Event Status ===
	if ('ERR_STS_RAW' in reg && reg.ERR_STS_RAW.int32 !== undefined) {
		const v = reg.ERR_STS_RAW.int32;
		// 0. Extend existing register structure
		reg.ERR_STS_RAW.fields = {};
		reg.ERR_STS_RAW.report = [];
		// 1. Decode all individual bits of ERR_STS_RAW register
		defineField(reg.ERR_STS_RAW, v, 'PRT_BUS_ON', 22, 22, 'PRT Bus-On');
		defineField(reg.ERR_STS_RAW, v, 'PRT_E_ACTIVE', 21, 21, 'PRT Error-Active');
		defineField(reg.ERR_STS_RAW, v, 'PRT_BUS_OFF', 20, 20, 'PRT Stop / Bus-Off');
		defineField(reg.ERR_STS_RAW, v, 'PRT_E_PASSIVE', 19, 19, 'PRT Error-Passive');
		defineField(reg.ERR_STS_RAW, v, 'PRT_BUS_ERR', 18, 18, 'PRT CAN Bus Error');
		defineField(reg.ERR_STS_RAW, v, 'PRT_IFF', 17, 17, 'PRT Invalid Frame Format');
		defineField(reg.ERR_STS_RAW, v, 'PRT_STOP', 16, 16, 'PRT STOP');
		defineField(reg.ERR_STS_RAW, v, 'HOST_ARA', 8, 8, 'Host Access Reserved Addr');
		defineField(reg.ERR_STS_RAW, v, 'MH_VB_NO_SA', 7, 7, 'VB Start Address Missing');
		defineField(reg.ERR_STS_RAW, v, 'MH_QUEUE_ACCESS_VIOLATION', 6, 6, 'Queue Access Violation');
		defineField(reg.ERR_STS_RAW, v, 'MH_LMEM_CERR', 5, 5, 'LMEM Correctable Error');
		defineField(reg.ERR_STS_RAW, v, 'MH_RXFQ1_DROP', 4, 4, 'RXFQ1 Drop');
		defineField(reg.ERR_STS_RAW, v, 'MH_RXFQ0_DROP', 3, 3, 'RXFQ0 Drop');
		defineField(reg.ERR_STS_RAW, v, 'MH_TEFQ_DROP', 2, 2, 'TEFQ Drop');
		defineField(reg.ERR_STS_RAW, v, 'MH_TXPQ_DEQ_NO_TX', 1, 1, 'TXPQ Dequeued but Not Transmitted');
		defineField(reg.ERR_STS_RAW, v, 'MH_TXFQ_DEQ_NO_TX', 0, 0, 'TXFQ Dequeued but Not Transmitted');
		const f = reg.ERR_STS_RAW.fields;
		// 2. Generate human-readable register report
		reg.ERR_STS_RAW.report.push({
			severityLevel: sevC.info,
			msg: `ERR_STS_RAW: ${reg.ERR_STS_RAW.name_long} (0x${reg.ERR_STS_RAW.addr !== undefined ? reg.ERR_STS_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
				   `[31 -                        ] Reserved                          = - \n`+
				   `[30 -                        ] Reserved                          = - \n`+
				   `[29 -                        ] Reserved                          = - \n`+
				   `[28 -                        ] Reserved                          = - \n`+
				   `[27 -                        ] Reserved                          = - \n`+
				   `[26 -                        ] Reserved                          = - \n`+
				   `[25 -                        ] Reserved                          = - \n`+
				   `[24 -                        ] Reserved                          = - \n`+
				   `[23 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.PRT_BUS_ON)}\n`+
				   `${ircRow(f.PRT_E_ACTIVE)}\n`+
				   `${ircRow(f.PRT_BUS_OFF)}\n`+
				   `${ircRow(f.PRT_E_PASSIVE)}\n`+
				   `${ircRow(f.PRT_BUS_ERR)}\n`+
				   `${ircRow(f.PRT_IFF)}\n`+
				   `${ircRow(f.PRT_STOP)}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.HOST_ARA)}\n`+
				   `${ircRow(f.MH_VB_NO_SA)}\n`+
				   `${ircRow(f.MH_QUEUE_ACCESS_VIOLATION)}\n`+
				   `${ircRow(f.MH_LMEM_CERR)}\n`+
				   `${ircRow(f.MH_RXFQ1_DROP)}\n`+
				   `${ircRow(f.MH_RXFQ0_DROP)}\n`+
				   `${ircRow(f.MH_TEFQ_DROP)}\n`+
				   `${ircRow(f.MH_TXPQ_DEQ_NO_TX)}\n`+
				   `${ircRow(f.MH_TXFQ_DEQ_NO_TX)}`
		});
	}

	// === SAFETY_RAW: Safety Raw Event Status ===
	if ('SAFETY_RAW' in reg && reg.SAFETY_RAW.int32 !== undefined) {
		const v = reg.SAFETY_RAW.int32;
		// 0. Extend existing register structure
		reg.SAFETY_RAW.fields = {};
		reg.SAFETY_RAW.report = [];
		// 1. Decode all individual bits of SAFETY_RAW register
		defineField(reg.SAFETY_RAW, v, 'PRT_RX_DO', 19, 19, 'PRT RX Overflow');
		defineField(reg.SAFETY_RAW, v, 'PRT_TX_DU', 18, 18, 'PRT TX Underrun');
		defineField(reg.SAFETY_RAW, v, 'PRT_USOS', 17, 17, 'PRT Unexpected Start Of Seq');
		defineField(reg.SAFETY_RAW, v, 'PRT_TX_ABORTED', 16, 16, 'PRT TX Sequence Aborted');
		defineField(reg.SAFETY_RAW, v, 'MH_TX_ABORT', 9, 9, 'MH Abort TX to PRT');
		defineField(reg.SAFETY_RAW, v, 'MH_RX_ABORT', 8, 8, 'MH Abort RX from PRT');
		defineField(reg.SAFETY_RAW, v, 'MH_RX_FILTER_ERR', 7, 7, 'RX Filter Error');
		defineField(reg.SAFETY_RAW, v, 'MH_SAFETY_MISC', 6, 6, 'Safety Misc Issues');
		defineField(reg.SAFETY_RAW, v, 'MH_VB_ACCESS_VIOLATION', 5, 5, 'VB Access Violation');
		defineField(reg.SAFETY_RAW, v, 'MH_LMEM_PROT_ERR', 4, 4, 'LMEM Access Outside PROT Range');
		defineField(reg.SAFETY_RAW, v, 'MH_LMEM_TO_ERR', 3, 3, 'LMEM Timeout');
		defineField(reg.SAFETY_RAW, v, 'MH_LMEM_UERR', 2, 2, 'LMEM Uncorrectable Error');
		defineField(reg.SAFETY_RAW, v, 'MH_CTB_BC_ERR', 1, 1, 'CTB Block Copy Cancelled');
		defineField(reg.SAFETY_RAW, v, 'MH_CTB_BC_TO', 0, 0, 'CTB Block Copy Timeout');
		const f = reg.SAFETY_RAW.fields;
		// 2. Generate human-readable register report
		reg.SAFETY_RAW.report.push({
			severityLevel: sevC.info,
			msg: `SAFETY_RAW: ${reg.SAFETY_RAW.name_long} (0x${reg.SAFETY_RAW.addr !== undefined ? reg.SAFETY_RAW.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
				   `[31 -                        ] Reserved                          = - \n`+
				   `[30 -                        ] Reserved                          = - \n`+
				   `[29 -                        ] Reserved                          = - \n`+
				   `[28 -                        ] Reserved                          = - \n`+
				   `[27 -                        ] Reserved                          = - \n`+
				   `[26 -                        ] Reserved                          = - \n`+
				   `[25 -                        ] Reserved                          = - \n`+
				   `[24 -                        ] Reserved                          = - \n`+
				   `[23 -                        ] Reserved                          = - \n`+
				   `[22 -                        ] Reserved                          = - \n`+
				   `[21 -                        ] Reserved                          = - \n`+
				   `[20 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.PRT_RX_DO)}\n`+
				   `${ircRow(f.PRT_TX_DU)}\n`+
				   `${ircRow(f.PRT_USOS)}\n`+
				   `${ircRow(f.PRT_TX_ABORTED)}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.MH_TX_ABORT)}\n`+
				   `${ircRow(f.MH_RX_ABORT)}\n`+
				   `${ircRow(f.MH_RX_FILTER_ERR)}\n`+
				   `${ircRow(f.MH_SAFETY_MISC)}\n`+
				   `${ircRow(f.MH_VB_ACCESS_VIOLATION)}\n`+
				   `${ircRow(f.MH_LMEM_PROT_ERR)}\n`+
				   `${ircRow(f.MH_LMEM_TO_ERR)}\n`+
				   `${ircRow(f.MH_LMEM_UERR)}\n`+
				   `${ircRow(f.MH_CTB_BC_ERR)}\n`+
				   `${ircRow(f.MH_CTB_BC_TO)}`
		});
	}

	// === TX_FUNC_CLR (write-only) ===
	if ('TX_FUNC_CLR' in reg && reg.TX_FUNC_CLR.int32 !== undefined) {
		const v = reg.TX_FUNC_CLR.int32;
		// 0. Extend existing register structure
		reg.TX_FUNC_CLR.fields = {};
		reg.TX_FUNC_CLR.report = [];
		// 1. Decode all individual bits of TX_FUNC_CLR register
		// decoding makes no sense, because it is a Write-Only register
		defineField(reg.TX_FUNC_CLR, v, 'BITS', 31, 0, 'TX Functional Raw Event Clear bits');
		reg.TX_FUNC_CLR.report.push({
			severityLevel: sevC.info,
			msg: `TX_FUNC_CLR: ${reg.TX_FUNC_CLR.name_long} (write-only) (0x${reg.TX_FUNC_CLR.addr !== undefined ? reg.TX_FUNC_CLR.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})`
		});
		if (v !== 0) {
			reg.TX_FUNC_CLR.report.push({ severityLevel: sevC.warning, msg: `TX_FUNC_CLR: read-value should be 0..0 (write-only)` });
		}
	}

	// === RX_FUNC_CLR (write-only) ===
	if ('RX_FUNC_CLR' in reg && reg.RX_FUNC_CLR.int32 !== undefined) {
		const v = reg.RX_FUNC_CLR.int32;
		// 0. Extend existing register structure
		reg.RX_FUNC_CLR.fields = {};
		reg.RX_FUNC_CLR.report = [];
		// 1. Decode all individual bits of RX_FUNC_CLR register
		// decoding makes no sense, because it is a Write-Only register
		defineField(reg.RX_FUNC_CLR, v, 'BITS', 31, 0, 'RX Functional Raw Event Clear bits');
		reg.RX_FUNC_CLR.report.push({
			severityLevel: sevC.info,
			msg: `RX_FUNC_CLR: ${reg.RX_FUNC_CLR.name_long} (write-only) (0x${reg.RX_FUNC_CLR.addr !== undefined ? reg.RX_FUNC_CLR.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})`
		});
		if (v !== 0) {
			reg.RX_FUNC_CLR.report.push({ severityLevel: sevC.warning, msg: `RX_FUNC_CLR: read-value should be 0..0 (write-only)` });
		}
	}

	// === ERR_STS_CLR (write-only) ===
	if ('ERR_STS_CLR' in reg && reg.ERR_STS_CLR.int32 !== undefined) {
		const v = reg.ERR_STS_CLR.int32;
		// 0. Extend existing register structure
		reg.ERR_STS_CLR.fields = {};
		reg.ERR_STS_CLR.report = [];
		// 1. Decode all individual bits of ERR_STS_CLK register
		// decoding makes no sense, because it is a Write-Only register
		defineField(reg.ERR_STS_CLR, v, 'BITS', 31, 0, 'Error Status Clear bits');
		reg.ERR_STS_CLR.report.push({
			severityLevel: sevC.info,
			msg: `ERR_STS_CLR: ${reg.ERR_STS_CLR.name_long} (write-only) (0x${reg.ERR_STS_CLR.addr !== undefined ? reg.ERR_STS_CLR.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})`
		});
		if (v !== 0) {
			reg.ERR_STS_CLR.report.push({ severityLevel: sevC.warning, msg: `ERR_STS_CLR: read-value should be 0..0 (write-only)` });
		}
	}

	// === SAFETY_CLR (write-only) ===
	if ('SAFETY_CLR' in reg && reg.SAFETY_CLR.int32 !== undefined) {
		const v = reg.SAFETY_CLR.int32;
		// 0. Extend existing register structure
		reg.SAFETY_CLR.fields = {};
		reg.SAFETY_CLR.report = [];
		// 1. Decode all individual bits of SAFETY_CLR register
		// decoding makes no sense, because it is a Write-Only register
		defineField(reg.SAFETY_CLR, v, 'BITS', 31, 0, 'Safety Clear bits');
		reg.SAFETY_CLR.report.push({
			severityLevel: sevC.info,
			msg: `SAFETY_CLR: ${reg.SAFETY_CLR.name_long} (write-only) (0x${reg.SAFETY_CLR.addr !== undefined ? reg.SAFETY_CLR.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})`
		});
		if (v !== 0) {
			reg.SAFETY_CLR.report.push({ severityLevel: sevC.warning, msg: `SAFETY_CLR: read-value should be 0..0 (write-only)` });
		}
	}

	// === TX_FUNC_ENA: TX Functional Enable ===
	if ('TX_FUNC_ENA' in reg && reg.TX_FUNC_ENA.int32 !== undefined) {
		const v = reg.TX_FUNC_ENA.int32;
		// 0. Extend existing register structure
		reg.TX_FUNC_ENA.fields = {};
		reg.TX_FUNC_ENA.report = [];
		// 1. Decode all individual bits of TX_FUNC_ENA register
		defineField(reg.TX_FUNC_ENA, v, 'PRT_TX_EVT', 16, 16, 'Enable PRT TX Event');
		defineField(reg.TX_FUNC_ENA, v, 'MH_CTB_TX_BC_REQ', 4, 4, 'Enable Block Copy Request (TX)');
		defineField(reg.TX_FUNC_ENA, v, 'MH_TEFQ_DEQ', 3, 3, 'Enable TEFQ Dequeue');
		defineField(reg.TX_FUNC_ENA, v, 'MH_TEFQ_ENQ', 2, 2, 'Enable TEFQ Enqueue');
		defineField(reg.TX_FUNC_ENA, v, 'MH_TXPQ_ENQ', 1, 1, 'Enable TXPQ Enqueue');
		defineField(reg.TX_FUNC_ENA, v, 'MH_TXFQ_ENQ', 0, 0, 'Enable TXFQ Enqueue');
		const f = reg.TX_FUNC_ENA.fields;
		// 2. Generate human-readable register report
		reg.TX_FUNC_ENA.report.push({
			severityLevel: sevC.info,
			msg: `TX_FUNC_ENA: ${reg.TX_FUNC_ENA.name_long} (0x${reg.TX_FUNC_ENA.addr !== undefined ? reg.TX_FUNC_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
				   `[31 -                        ] Reserved                          = - \n`+
				   `[30 -                        ] Reserved                          = - \n`+
				   `[29 -                        ] Reserved                          = - \n`+
				   `[28 -                        ] Reserved                          = - \n`+
				   `[27 -                        ] Reserved                          = - \n`+
				   `[26 -                        ] Reserved                          = - \n`+
				   `[25 -                        ] Reserved                          = - \n`+
				   `[24 -                        ] Reserved                          = - \n`+
				   `[23 -                        ] Reserved                          = - \n`+
				   `[22 -                        ] Reserved                          = - \n`+
				   `[21 -                        ] Reserved                          = - \n`+
				   `[20 -                        ] Reserved                          = - \n`+
				   `[19 -                        ] Reserved                          = - \n`+
				   `[18 -                        ] Reserved                          = - \n`+
				   `[17 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.PRT_TX_EVT)}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
				   `[ 8 -                        ] Reserved                          = - \n`+
				   `[ 7 -                        ] Reserved                          = - \n`+
				   `[ 6 -                        ] Reserved                          = - \n`+
				   `[ 5 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.MH_CTB_TX_BC_REQ)}\n`+
				   `${ircRow(f.MH_TEFQ_DEQ)}\n`+
				   `${ircRow(f.MH_TEFQ_ENQ)}\n`+
				   `${ircRow(f.MH_TXPQ_ENQ)}\n`+
				   `${ircRow(f.MH_TXFQ_ENQ)}`
		});
	}

	// === RX_FUNC_ENA: RX Functional Enable ===
	if ('RX_FUNC_ENA' in reg && reg.RX_FUNC_ENA.int32 !== undefined) {
		const v = reg.RX_FUNC_ENA.int32;
		// 0. Extend existing register structure
		reg.RX_FUNC_ENA.fields = {};
		reg.RX_FUNC_ENA.report = [];
		// 1. Decode all individual bits of RX_FUNC_ENA register
		defineField(reg.RX_FUNC_ENA, v, 'PRT_RX_EVT', 16, 16, 'Enable PRT RX Event');
		defineField(reg.RX_FUNC_ENA, v, 'MH_RX_MSG_ALERT', 6, 6, 'Enable RX Message Alert');
		defineField(reg.RX_FUNC_ENA, v, 'MH_RX_FILTER_MATCH', 5, 5, 'Enable RX Filter Match');
		defineField(reg.RX_FUNC_ENA, v, 'MH_CTB_RX_BC_REQ', 4, 4, 'Enable Block Copy Request (RX)');
		defineField(reg.RX_FUNC_ENA, v, 'MH_RXFQ1_DEQ', 3, 3, 'Enable RXFQ1 Dequeue');
		defineField(reg.RX_FUNC_ENA, v, 'MH_RXFQ0_DEQ', 2, 2, 'Enable RXFQ0 Dequeue');
		defineField(reg.RX_FUNC_ENA, v, 'MH_RXFQ1_ENQ', 1, 1, 'Enable RXFQ1 Enqueue');
		defineField(reg.RX_FUNC_ENA, v, 'MH_RXFQ0_ENQ', 0, 0, 'Enable RXFQ0 Enqueue');
		const f = reg.RX_FUNC_ENA.fields;
		// 2. Generate human-readable register report
		reg.RX_FUNC_ENA.report.push({
			severityLevel: sevC.info,
			msg: `RX_FUNC_ENA: ${reg.RX_FUNC_ENA.name_long} (0x${reg.RX_FUNC_ENA.addr !== undefined ? reg.RX_FUNC_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
				   `[31 -                        ] Reserved                          = - \n`+
				   `[30 -                        ] Reserved                          = - \n`+
				   `[29 -                        ] Reserved                          = - \n`+
				   `[28 -                        ] Reserved                          = - \n`+
				   `[27 -                        ] Reserved                          = - \n`+
				   `[26 -                        ] Reserved                          = - \n`+
				   `[25 -                        ] Reserved                          = - \n`+
				   `[24 -                        ] Reserved                          = - \n`+
				   `[23 -                        ] Reserved                          = - \n`+
				   `[22 -                        ] Reserved                          = - \n`+
				   `[21 -                        ] Reserved                          = - \n`+
				   `[20 -                        ] Reserved                          = - \n`+
				   `[19 -                        ] Reserved                          = - \n`+
				   `[18 -                        ] Reserved                          = - \n`+
				   `[17 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.PRT_RX_EVT)}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
				   `[ 8 -                        ] Reserved                          = - \n`+
				   `[ 7 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.MH_RX_MSG_ALERT)}\n`+
				   `${ircRow(f.MH_RX_FILTER_MATCH)}\n`+
				   `${ircRow(f.MH_CTB_RX_BC_REQ)}\n`+
				   `${ircRow(f.MH_RXFQ1_DEQ)}\n`+
				   `${ircRow(f.MH_RXFQ0_DEQ)}\n`+
				   `${ircRow(f.MH_RXFQ1_ENQ)}\n`+
				   `${ircRow(f.MH_RXFQ0_ENQ)}`
		});
	}

	// === ERR_STS_ENA: Error Enable ===
	if ('ERR_STS_ENA' in reg && reg.ERR_STS_ENA.int32 !== undefined) {
		const v = reg.ERR_STS_ENA.int32;
		// 0. Extend existing register structure
		reg.ERR_STS_ENA.fields = {};
		reg.ERR_STS_ENA.report = [];
		// 1. Decode all individual bits of ERR_STS_ENA register
		defineField(reg.ERR_STS_ENA, v, 'PRT_BUS_ON', 22, 22, 'Enable PRT Bus-On');
		defineField(reg.ERR_STS_ENA, v, 'PRT_E_ACTIVE', 21, 21, 'Enable PRT Error-Active');
		defineField(reg.ERR_STS_ENA, v, 'PRT_BUS_OFF', 20, 20, 'Enable PRT Stop / Bus-Off');
		defineField(reg.ERR_STS_ENA, v, 'PRT_E_PASSIVE', 19, 19, 'Enable PRT Error-Passive');
		defineField(reg.ERR_STS_ENA, v, 'PRT_BUS_ERR', 18, 18, 'Enable PRT CAN Bus Error');
		defineField(reg.ERR_STS_ENA, v, 'PRT_IFF', 17, 17, 'Enable Invalid Frame Format');
		defineField(reg.ERR_STS_ENA, v, 'PRT_STOP', 16, 16, 'Enable PRT STOP');
		defineField(reg.ERR_STS_ENA, v, 'HOST_ARA', 8, 8, 'Enable Host Access Reserved Addr');
		defineField(reg.ERR_STS_ENA, v, 'MH_VB_NO_SA', 7, 7, 'Enable VB Start Address Missing');
		defineField(reg.ERR_STS_ENA, v, 'MH_QUEUE_ACCESS_VIOLATION', 6, 6, 'Enable Queue Access Violation');
		defineField(reg.ERR_STS_ENA, v, 'MH_LMEM_CERR', 5, 5, 'Enable LMEM Correctable Error');
		defineField(reg.ERR_STS_ENA, v, 'MH_RXFQ1_DROP', 4, 4, 'Enable RXFQ1 Drop');
		defineField(reg.ERR_STS_ENA, v, 'MH_RXFQ0_DROP', 3, 3, 'Enable RXFQ0 Drop');
		defineField(reg.ERR_STS_ENA, v, 'MH_TEFQ_DROP', 2, 2, 'Enable TEFQ Drop');
		defineField(reg.ERR_STS_ENA, v, 'MH_TXPQ_DEQ_NO_TX', 1, 1, 'Enable TXPQ Dequeued Not TX');
		defineField(reg.ERR_STS_ENA, v, 'MH_TXFQ_DEQ_NO_TX', 0, 0, 'Enable TXFQ Dequeued Not TX');
		const f = reg.ERR_STS_ENA.fields;
		// 2. Generate human-readable register report
		reg.ERR_STS_ENA.report.push({
			severityLevel: sevC.info,
			msg: `ERR_STS_ENA: ${reg.ERR_STS_ENA.name_long} (0x${reg.ERR_STS_ENA.addr !== undefined ? reg.ERR_STS_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
				   `[31 -                        ] Reserved                          = - \n`+
				   `[30 -                        ] Reserved                          = - \n`+
				   `[29 -                        ] Reserved                          = - \n`+
				   `[28 -                        ] Reserved                          = - \n`+
				   `[27 -                        ] Reserved                          = - \n`+
				   `[26 -                        ] Reserved                          = - \n`+
				   `[25 -                        ] Reserved                          = - \n`+
				   `[24 -                        ] Reserved                          = - \n`+
				   `[23 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.PRT_BUS_ON)}\n`+
				   `${ircRow(f.PRT_E_ACTIVE)}\n`+
				   `${ircRow(f.PRT_BUS_OFF)}\n`+
				   `${ircRow(f.PRT_E_PASSIVE)}\n`+
				   `${ircRow(f.PRT_BUS_ERR)}\n`+
				   `${ircRow(f.PRT_IFF)}\n`+
				   `${ircRow(f.PRT_STOP)}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.HOST_ARA)}\n`+
				   `${ircRow(f.MH_VB_NO_SA)}\n`+
				   `${ircRow(f.MH_QUEUE_ACCESS_VIOLATION)}\n`+
				   `${ircRow(f.MH_LMEM_CERR)}\n`+
				   `${ircRow(f.MH_RXFQ1_DROP)}\n`+
				   `${ircRow(f.MH_RXFQ0_DROP)}\n`+
				   `${ircRow(f.MH_TEFQ_DROP)}\n`+
				   `${ircRow(f.MH_TXPQ_DEQ_NO_TX)}\n`+
				   `${ircRow(f.MH_TXFQ_DEQ_NO_TX)}`
		});
	}

	// === SAFETY_ENA: Safety Enable ===
	if ('SAFETY_ENA' in reg && reg.SAFETY_ENA.int32 !== undefined) {
		const v = reg.SAFETY_ENA.int32;
		// 0. Extend existing register structure
		reg.SAFETY_ENA.fields = {};
		reg.SAFETY_ENA.report = [];
		// 1. Decode all individual bits of SAFETY_ENA register
		defineField(reg.SAFETY_ENA, v, 'PRT_RX_DO', 19, 19, 'Enable PRT RX Overflow');
		defineField(reg.SAFETY_ENA, v, 'PRT_TX_DU', 18, 18, 'Enable PRT TX Underrun');
		defineField(reg.SAFETY_ENA, v, 'PRT_USOS', 17, 17, 'Enable PRT Unexpected SoS');
		defineField(reg.SAFETY_ENA, v, 'PRT_TX_ABORTED', 16, 16, 'Enable PRT TX Aborted');
		defineField(reg.SAFETY_ENA, v, 'MH_TX_ABORT', 9, 9, 'Enable MH TX Abort');
		defineField(reg.SAFETY_ENA, v, 'MH_RX_ABORT', 8, 8, 'Enable MH RX Abort');
		defineField(reg.SAFETY_ENA, v, 'MH_RX_FILTER_ERR', 7, 7, 'Enable RX Filter Error');
		defineField(reg.SAFETY_ENA, v, 'MH_SAFETY_MISC', 6, 6, 'Enable Safety Misc');
		defineField(reg.SAFETY_ENA, v, 'MH_VB_ACCESS_VIOLATION', 5, 5, 'Enable VB Access Violation');
		defineField(reg.SAFETY_ENA, v, 'MH_LMEM_PROT_ERR', 4, 4, 'Enable LMEM PROT Error');
		defineField(reg.SAFETY_ENA, v, 'MH_LMEM_TO_ERR', 3, 3, 'Enable LMEM Timeout');
		defineField(reg.SAFETY_ENA, v, 'MH_LMEM_UERR', 2, 2, 'Enable LMEM Uncorrect. Error');
		defineField(reg.SAFETY_ENA, v, 'MH_CTB_BC_ERR', 1, 1, 'Enable CTB Block Copy Cancelled');
		defineField(reg.SAFETY_ENA, v, 'MH_CTB_BC_TO', 0, 0, 'Enable CTB Block Copy Timeout');
		const f = reg.SAFETY_ENA.fields;
		// 2. Generate human-readable register report
		reg.SAFETY_ENA.report.push({
			severityLevel: sevC.info,
			msg: `SAFETY_ENA: ${reg.SAFETY_ENA.name_long} (0x${reg.SAFETY_ENA.addr !== undefined ? reg.SAFETY_ENA.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
				   `[31 -                        ] Reserved                          = - \n`+
				   `[30 -                        ] Reserved                          = - \n`+
				   `[29 -                        ] Reserved                          = - \n`+
				   `[28 -                        ] Reserved                          = - \n`+
				   `[27 -                        ] Reserved                          = - \n`+
				   `[26 -                        ] Reserved                          = - \n`+
				   `[25 -                        ] Reserved                          = - \n`+
				   `[24 -                        ] Reserved                          = - \n`+
				   `[23 -                        ] Reserved                          = - \n`+
				   `[22 -                        ] Reserved                          = - \n`+
				   `[21 -                        ] Reserved                          = - \n`+
				   `[20 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.PRT_RX_DO)}\n`+
				   `${ircRow(f.PRT_TX_DU)}\n`+
				   `${ircRow(f.PRT_USOS)}\n`+
				   `${ircRow(f.PRT_TX_ABORTED)}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `${ircRow(f.MH_TX_ABORT)}\n`+
				   `${ircRow(f.MH_RX_ABORT)}\n`+
				   `${ircRow(f.MH_RX_FILTER_ERR)}\n`+
				   `${ircRow(f.MH_SAFETY_MISC)}\n`+
				   `${ircRow(f.MH_VB_ACCESS_VIOLATION)}\n`+
				   `${ircRow(f.MH_LMEM_PROT_ERR)}\n`+
				   `${ircRow(f.MH_LMEM_TO_ERR)}\n`+
				   `${ircRow(f.MH_LMEM_UERR)}\n`+
				   `${ircRow(f.MH_CTB_BC_ERR)}\n`+
				   `${ircRow(f.MH_CTB_BC_TO)}`
		});
	}

	// === Summaries: show only enabled IRs, RAW vs ENA ===
	if (reg.TX_FUNC_RAW && reg.TX_FUNC_RAW.fields && reg.TX_FUNC_ENA && reg.TX_FUNC_ENA.fields) {
		const defsTx = [
			{bit:16,key:'PRT_TX_EVT'},
			{bit: 4,key:'MH_CTB_TX_BC_REQ'},
			{bit: 3,key:'MH_TEFQ_DEQ'},
			{bit: 2,key:'MH_TEFQ_ENQ'},
			{bit: 1,key:'MH_TXPQ_ENQ'},
			{bit: 0,key:'MH_TXFQ_ENQ'},
		];
		const enabledTx = defsTx.filter(d => reg.TX_FUNC_ENA.fields[d.key].value === 1);
		const nameWidthTx = Math.max(4, ...enabledTx.map(e => e.key.length));
		const linesTx = enabledTx.length === 0
			? 'No TX_FUNC interrupts enabled (all ENA bits = 0)'
			: enabledTx.map(d => `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthTx,' ')}  ${String(reg.TX_FUNC_RAW.fields[d.key].value)}   ${String(reg.TX_FUNC_ENA.fields[d.key].value)}`).join('\n');
		reg.TX_FUNC_ENA.report.push({
			severityLevel: sevC.infoBold,
			msg: `TX_FUNC Interrupt Summary (only enabled IRs)\n`+
					 `Bit  Name${' '.repeat(nameWidthTx-4)}  RAW ENA\n`+
					 `${linesTx}`
		});
	}

	if (reg.RX_FUNC_RAW && reg.RX_FUNC_RAW.fields && reg.RX_FUNC_ENA && reg.RX_FUNC_ENA.fields) {
		const defsRx = [
			{bit:16,key:'PRT_RX_EVT'},
			{bit: 6,key:'MH_RX_MSG_ALERT'},
			{bit: 5,key:'MH_RX_FILTER_MATCH'},
			{bit: 4,key:'MH_CTB_RX_BC_REQ'},
			{bit: 3,key:'MH_RXFQ1_DEQ'},
			{bit: 2,key:'MH_RXFQ0_DEQ'},
			{bit: 1,key:'MH_RXFQ1_ENQ'},
			{bit: 0,key:'MH_RXFQ0_ENQ'},
		];
		const enabledRx = defsRx.filter(d => reg.RX_FUNC_ENA.fields[d.key].value === 1);
		const nameWidthRx = Math.max(4, ...enabledRx.map(e => e.key.length));
		const linesRx = enabledRx.length === 0
			? 'No RX_FUNC interrupts enabled (all ENA bits = 0)'
			: enabledRx.map(d => `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthRx,' ')}  ${String(reg.RX_FUNC_RAW.fields[d.key].value)}   ${String(reg.RX_FUNC_ENA.fields[d.key].value)}`).join('\n');
		reg.RX_FUNC_ENA.report.push({
			severityLevel: sevC.infoBold,
			msg: `RX_FUNC Interrupt Summary (only enabled IRs)\n`+
					 `Bit  Name${' '.repeat(nameWidthRx-4)}  RAW ENA\n`+
					 `${linesRx}`
		});
	}

	if (reg.ERR_STS_RAW && reg.ERR_STS_RAW.fields && reg.ERR_STS_ENA && reg.ERR_STS_ENA.fields) {
		const defsErr = [
			{bit:22,key:'PRT_BUS_ON'},
			{bit:21,key:'PRT_E_ACTIVE'},
			{bit:20,key:'PRT_BUS_OFF'},
			{bit:19,key:'PRT_E_PASSIVE'},
			{bit:18,key:'PRT_BUS_ERR'},
			{bit:17,key:'PRT_IFF'},
			{bit:16,key:'PRT_STOP'},
			{bit: 8,key:'HOST_ARA'},
			{bit: 7,key:'MH_VB_NO_SA'},
			{bit: 6,key:'MH_QUEUE_ACCESS_VIOLATION'},
			{bit: 5,key:'MH_LMEM_CERR'},
			{bit: 4,key:'MH_RXFQ1_DROP'},
			{bit: 3,key:'MH_RXFQ0_DROP'},
			{bit: 2,key:'MH_TEFQ_DROP'},
			{bit: 1,key:'MH_TXPQ_DEQ_NO_TX'},
			{bit: 0,key:'MH_TXFQ_DEQ_NO_TX'},
		];
		const enabledErr = defsErr.filter(d => reg.ERR_STS_ENA.fields[d.key].value === 1);
		const nameWidthErr = Math.max(4, ...enabledErr.map(e => e.key.length));
		const linesErr = enabledErr.length === 0
			? 'No ERR_STS interrupts enabled (all ENA bits = 0)'
			: enabledErr.map(d => `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthErr,' ')}  ${String(reg.ERR_STS_RAW.fields[d.key].value)}   ${String(reg.ERR_STS_ENA.fields[d.key].value)}`).join('\n');
		reg.ERR_STS_ENA.report.push({
			severityLevel: sevC.infoBold,
			msg: `ERR_STS Interrupt Summary (only enabled IRs)\n`+
					 `Bit  Name${' '.repeat(nameWidthErr-4)}  RAW ENA\n`+
					 `${linesErr}`
		});
	}

	if (reg.SAFETY_RAW && reg.SAFETY_RAW.fields && reg.SAFETY_ENA && reg.SAFETY_ENA.fields) {
		const defsSaf = [
			{bit:19,key:'PRT_RX_DO'},
			{bit:18,key:'PRT_TX_DU'},
			{bit:17,key:'PRT_USOS'},
			{bit:16,key:'PRT_TX_ABORTED'},
			{bit: 9,key:'MH_TX_ABORT'},
			{bit: 8,key:'MH_RX_ABORT'},
			{bit: 7,key:'MH_RX_FILTER_ERR'},
			{bit: 6,key:'MH_SAFETY_MISC'},
			{bit: 5,key:'MH_VB_ACCESS_VIOLATION'},
			{bit: 4,key:'MH_LMEM_PROT_ERR'},
			{bit: 3,key:'MH_LMEM_TO_ERR'},
			{bit: 2,key:'MH_LMEM_UERR'},
			{bit: 1,key:'MH_CTB_BC_ERR'},
			{bit: 0,key:'MH_CTB_BC_TO'},
		];
		const enabledSaf = defsSaf.filter(d => reg.SAFETY_ENA.fields[d.key].value === 1);
		const nameWidthSaf = Math.max(4, ...enabledSaf.map(e => e.key.length));
		const linesSaf = enabledSaf.length === 0
			? 'No SAFETY interrupts enabled (all ENA bits = 0)'
			: enabledSaf.map(d => `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthSaf,' ')}  ${String(reg.SAFETY_RAW.fields[d.key].value)}   ${String(reg.SAFETY_ENA.fields[d.key].value)}`).join('\n');
		reg.SAFETY_ENA.report.push({
			severityLevel: sevC.infoBold,
			msg: `SAFETY Interrupt Summary (only enabled IRs)\n`+
					 `Bit  Name${' '.repeat(nameWidthSaf-4)}  RAW ENA\n`+
					 `${linesSaf}`
		});
	}

	// === CAPTURING_MODE: IRC Capturing Mode Configuration ===
	if ('CAPTURING_MODE' in reg && reg.CAPTURING_MODE.int32 !== undefined) {
		const v = reg.CAPTURING_MODE.int32;
		reg.CAPTURING_MODE.fields = {};
		reg.CAPTURING_MODE.report = [];
		defineField(reg.CAPTURING_MODE, v, 'SAFETY', 2, 2, 'RAW input flag Capturing Mode');
		defineField(reg.CAPTURING_MODE, v, 'ERR', 1, 1, 'RAW input flag Capturing Mode');
		defineField(reg.CAPTURING_MODE, v, 'FUNC', 0, 0, 'RAW input flag Capturing Mode');
		const f = reg.CAPTURING_MODE.fields;
		const modeStr = (b) => b ? 'Edge' : 'Level';
		const capRow = (fld) => `[${fld.name_short.padEnd(7)}] ${fld.name_short.padEnd(7)}${fld.name_long} = ${fld.value} (${modeStr(fld.value)})`;
		const expected = 0x7;
		reg.CAPTURING_MODE.report.push({
			severityLevel: sevC.info,
			msg: `CAPTURING_MODE: ${reg.CAPTURING_MODE.name_long} (0x${reg.CAPTURING_MODE.addr !== undefined ? reg.CAPTURING_MODE.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
					 `Expected fixed value: 0x${expected.toString(16).toUpperCase()} (all Edge).${v!==expected? ' (NOTE: Value differs from expected !)':''}\n`+
					 `${capRow(f.SAFETY)}\n`+
					 `${capRow(f.ERR)}\n`+
					 `${capRow(f.FUNC)}`
		});
	}

	// === HDP: Hardware Debug Port Control ===
	if ('HDP' in reg && reg.HDP.int32 !== undefined) {
		const v = reg.HDP.int32;
		reg.HDP.fields = {};
		reg.HDP.report = [];
		defineField(reg.HDP, v, 'HDP_SEL', 0, 0, 'HDP Select (0=MH, 1=PRT)');
		const f = reg.HDP.fields;
		reg.HDP.report.push({
			severityLevel: sevC.info,
			msg: `HDP: ${reg.HDP.name_long} (0x${reg.HDP.addr !== undefined ? reg.HDP.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
					 `[${f.HDP_SEL.name_short}] ${f.HDP_SEL.name_long} = ${f.HDP_SEL.value} (${f.HDP_SEL.value? 'PRT selected':'MH selected'})`
		});
	}

}