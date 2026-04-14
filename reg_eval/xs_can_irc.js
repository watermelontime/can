// XS_CAN: IRC register decoding
import { getBits } from './help_functions.js';
import { sevC } from './help_functions.js';

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
		reg.TX_FUNC_RAW.fields.PRT_TX_EVT       = getBits(v,16,16);
		reg.TX_FUNC_RAW.fields.MH_CTB_TX_BC_REQ = getBits(v,4,4);
		reg.TX_FUNC_RAW.fields.MH_TEFQ_DEQ      = getBits(v,3,3);
		reg.TX_FUNC_RAW.fields.MH_TEFQ_ENQ      = getBits(v,2,2);
		reg.TX_FUNC_RAW.fields.MH_TXPQ_ENQ      = getBits(v,1,1);
		reg.TX_FUNC_RAW.fields.MH_TXFQ_ENQ      = getBits(v,0,0);
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
					 `[16 PRT_TX_EVT               ] PRT TX CAN Message                = ${reg.TX_FUNC_RAW.fields.PRT_TX_EVT}\n`+
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
					 `[ 4 MH_CTB_TX_BC_REQ         ] MH Block Copy Pending (TX dir)    = ${reg.TX_FUNC_RAW.fields.MH_CTB_TX_BC_REQ}\n`+
					 `[ 3 MH_TEFQ_DEQ              ] TEFQ Dequeue                      = ${reg.TX_FUNC_RAW.fields.MH_TEFQ_DEQ}\n`+
					 `[ 2 MH_TEFQ_ENQ              ] TEFQ Enqueue                      = ${reg.TX_FUNC_RAW.fields.MH_TEFQ_ENQ}\n`+
					 `[ 1 MH_TXPQ_ENQ              ] TX Priority Queue Enqueue         = ${reg.TX_FUNC_RAW.fields.MH_TXPQ_ENQ}\n`+
					 `[ 0 MH_TXFQ_ENQ              ] TX FIFO Queue Enqueue             = ${reg.TX_FUNC_RAW.fields.MH_TXFQ_ENQ}`
		});
	}

	// === RX_FUNC_RAW: RX Functional Raw Event Status ===
	if ('RX_FUNC_RAW' in reg && reg.RX_FUNC_RAW.int32 !== undefined) {
		const v = reg.RX_FUNC_RAW.int32;
		// 0. Extend existing register structure
		reg.RX_FUNC_RAW.fields = {};
		reg.RX_FUNC_RAW.report = [];
		// 1. Decode all individual bits of RX_FUNC_RAW register
		reg.RX_FUNC_RAW.fields.PRT_RX_EVT        = getBits(v,16,16);
		reg.RX_FUNC_RAW.fields.MH_RX_MSG_ALERT   = getBits(v,6,6);
		reg.RX_FUNC_RAW.fields.MH_RX_FILTER_MATCH= getBits(v,5,5);
		reg.RX_FUNC_RAW.fields.MH_CTB_RX_BC_REQ  = getBits(v,4,4);
		reg.RX_FUNC_RAW.fields.MH_RXFQ1_DEQ      = getBits(v,3,3);
		reg.RX_FUNC_RAW.fields.MH_RXFQ0_DEQ      = getBits(v,2,2);
		reg.RX_FUNC_RAW.fields.MH_RXFQ1_ENQ      = getBits(v,1,1);
		reg.RX_FUNC_RAW.fields.MH_RXFQ0_ENQ      = getBits(v,0,0);
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
					 `[16 PRT_RX_EVT               ] PRT RX CAN Message                = ${reg.RX_FUNC_RAW.fields.PRT_RX_EVT}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
				   `[ 8 -                        ] Reserved                          = - \n`+
				   `[ 7 -                        ] Reserved                          = - \n`+
					 `[ 6 MH_RX_MSG_ALERT          ] RX Message Alert (FEC.ALERT=1)    = ${reg.RX_FUNC_RAW.fields.MH_RX_MSG_ALERT}\n`+
					 `[ 5 MH_RX_FILTER_MATCH       ] RX Filter Match (FEC.IRQ=1)       = ${reg.RX_FUNC_RAW.fields.MH_RX_FILTER_MATCH}\n`+
					 `[ 4 MH_CTB_RX_BC_REQ         ] Block Copy Pending (RX dir)       = ${reg.RX_FUNC_RAW.fields.MH_CTB_RX_BC_REQ}\n`+
					 `[ 3 MH_RXFQ1_DEQ             ] RXFQ1 Dequeue                     = ${reg.RX_FUNC_RAW.fields.MH_RXFQ1_DEQ}\n`+
					 `[ 2 MH_RXFQ0_DEQ             ] RXFQ0 Dequeue                     = ${reg.RX_FUNC_RAW.fields.MH_RXFQ0_DEQ}\n`+
					 `[ 1 MH_RXFQ1_ENQ             ] RXFQ1 Enqueue                     = ${reg.RX_FUNC_RAW.fields.MH_RXFQ1_ENQ}\n`+
					 `[ 0 MH_RXFQ0_ENQ             ] RXFQ0 Enqueue                     = ${reg.RX_FUNC_RAW.fields.MH_RXFQ0_ENQ}`
		});
	}

	// === ERR_STS_RAW: Error Raw Event Status ===
	if ('ERR_STS_RAW' in reg && reg.ERR_STS_RAW.int32 !== undefined) {
		const v = reg.ERR_STS_RAW.int32;
		// 0. Extend existing register structure
		reg.ERR_STS_RAW.fields = {};
		reg.ERR_STS_RAW.report = [];
		// 1. Decode all individual bits of ERR_STS_RAW register
		reg.ERR_STS_RAW.fields.PRT_BUS_ON                 = getBits(v,22,22);
		reg.ERR_STS_RAW.fields.PRT_E_ACTIVE               = getBits(v,21,21);
		reg.ERR_STS_RAW.fields.PRT_BUS_OFF                = getBits(v,20,20);
		reg.ERR_STS_RAW.fields.PRT_E_PASSIVE              = getBits(v,19,19);
		reg.ERR_STS_RAW.fields.PRT_BUS_ERR                = getBits(v,18,18);
		reg.ERR_STS_RAW.fields.PRT_IFF                    = getBits(v,17,17);
		reg.ERR_STS_RAW.fields.PRT_STOP                   = getBits(v,16,16);
		reg.ERR_STS_RAW.fields.HOST_ARA                   = getBits(v,8,8);
		reg.ERR_STS_RAW.fields.MH_VB_NO_SA                = getBits(v,7,7);
		reg.ERR_STS_RAW.fields.MH_QUEUE_ACCESS_VIOLATION  = getBits(v,6,6);
		reg.ERR_STS_RAW.fields.MH_LMEM_CERR               = getBits(v,5,5);
		reg.ERR_STS_RAW.fields.MH_RXFQ1_DROP              = getBits(v,4,4);
		reg.ERR_STS_RAW.fields.MH_RXFQ0_DROP              = getBits(v,3,3);
		reg.ERR_STS_RAW.fields.MH_TEFQ_DROP               = getBits(v,2,2);
		reg.ERR_STS_RAW.fields.MH_TXPQ_DEQ_NO_TX          = getBits(v,1,1);
		reg.ERR_STS_RAW.fields.MH_TXFQ_DEQ_NO_TX          = getBits(v,0,0);
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
					 `[22 PRT_BUS_ON               ] PRT Bus-On                        = ${reg.ERR_STS_RAW.fields.PRT_BUS_ON}\n`+
					 `[21 PRT_E_ACTIVE             ] PRT Error-Active                  = ${reg.ERR_STS_RAW.fields.PRT_E_ACTIVE}\n`+
					 `[20 PRT_BUS_OFF              ] PRT Stop / Bus-Off                = ${reg.ERR_STS_RAW.fields.PRT_BUS_OFF}\n`+
					 `[19 PRT_E_PASSIVE            ] PRT Error-Passive                 = ${reg.ERR_STS_RAW.fields.PRT_E_PASSIVE}\n`+
					 `[18 PRT_BUS_ERR              ] PRT CAN Bus Error                 = ${reg.ERR_STS_RAW.fields.PRT_BUS_ERR}\n`+
					 `[17 PRT_IFF                  ] PRT Invalid Frame Format          = ${reg.ERR_STS_RAW.fields.PRT_IFF}\n`+
					 `[16 PRT_STOP                 ] PRT STOP                          = ${reg.ERR_STS_RAW.fields.PRT_STOP}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
					 `[ 8 HOST_ARA                 ] Host Access Reserved Addr         = ${reg.ERR_STS_RAW.fields.HOST_ARA}\n`+
					 `[ 7 MH_VB_NO_SA              ] VB Start Address Missing          = ${reg.ERR_STS_RAW.fields.MH_VB_NO_SA}\n`+
					 `[ 6 MH_QUEUE_ACCESS_VIOLATION] Queue Access Violation            = ${reg.ERR_STS_RAW.fields.MH_QUEUE_ACCESS_VIOLATION}\n`+
					 `[ 5 MH_LMEM_CERR             ] LMEM Correctable Error            = ${reg.ERR_STS_RAW.fields.MH_LMEM_CERR}\n`+
					 `[ 4 MH_RXFQ1_DROP            ] RXFQ1 Drop                        = ${reg.ERR_STS_RAW.fields.MH_RXFQ1_DROP}\n`+
					 `[ 3 MH_RXFQ0_DROP            ] RXFQ0 Drop                        = ${reg.ERR_STS_RAW.fields.MH_RXFQ0_DROP}\n`+
					 `[ 2 MH_TEFQ_DROP             ] TEFQ Drop                         = ${reg.ERR_STS_RAW.fields.MH_TEFQ_DROP}\n`+
					 `[ 1 MH_TXPQ_DEQ_NO_TX        ] TXPQ Dequeued but Not Transmitted = ${reg.ERR_STS_RAW.fields.MH_TXPQ_DEQ_NO_TX}\n`+
					 `[ 0 MH_TXFQ_DEQ_NO_TX        ] TXFQ Dequeued but Not Transmitted = ${reg.ERR_STS_RAW.fields.MH_TXFQ_DEQ_NO_TX}`
		});
	}

	// === SAFETY_RAW: Safety Raw Event Status ===
	if ('SAFETY_RAW' in reg && reg.SAFETY_RAW.int32 !== undefined) {
		const v = reg.SAFETY_RAW.int32;
		// 0. Extend existing register structure
		reg.SAFETY_RAW.fields = {};
		reg.SAFETY_RAW.report = [];
		// 1. Decode all individual bits of SAFETY_RAW register
		reg.SAFETY_RAW.fields.PRT_RX_DO             = getBits(v,19,19);
		reg.SAFETY_RAW.fields.PRT_TX_DU             = getBits(v,18,18);
		reg.SAFETY_RAW.fields.PRT_USOS              = getBits(v,17,17);
		reg.SAFETY_RAW.fields.PRT_TX_ABORTED        = getBits(v,16,16);
		reg.SAFETY_RAW.fields.MH_TX_ABORT           = getBits(v,9,9);
		reg.SAFETY_RAW.fields.MH_RX_ABORT           = getBits(v,8,8);
		reg.SAFETY_RAW.fields.MH_RX_FILTER_ERR      = getBits(v,7,7);
		reg.SAFETY_RAW.fields.MH_SAFETY_MISC        = getBits(v,6,6);
		reg.SAFETY_RAW.fields.MH_VB_ACCESS_VIOLATION= getBits(v,5,5);
		reg.SAFETY_RAW.fields.MH_LMEM_PROT_ERR      = getBits(v,4,4);
		reg.SAFETY_RAW.fields.MH_LMEM_TO_ERR        = getBits(v,3,3);
		reg.SAFETY_RAW.fields.MH_LMEM_UERR          = getBits(v,2,2);
		reg.SAFETY_RAW.fields.MH_CTB_BC_ERR         = getBits(v,1,1);
		reg.SAFETY_RAW.fields.MH_CTB_BC_TO          = getBits(v,0,0);
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
					 `[19 PRT_RX_DO                ] PRT RX Overflow                   = ${reg.SAFETY_RAW.fields.PRT_RX_DO}\n`+
					 `[18 PRT_TX_DU                ] PRT TX Underrun                   = ${reg.SAFETY_RAW.fields.PRT_TX_DU}\n`+
					 `[17 PRT_USOS                 ] PRT Unexpected Start Of Seq       = ${reg.SAFETY_RAW.fields.PRT_USOS}\n`+
					 `[16 PRT_TX_ABORTED           ] PRT TX Sequence Aborted           = ${reg.SAFETY_RAW.fields.PRT_TX_ABORTED}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
					 `[ 9 MH_TX_ABORT              ] MH Abort TX to PRT                = ${reg.SAFETY_RAW.fields.MH_TX_ABORT}\n`+
					 `[ 8 MH_RX_ABORT              ] MH Abort RX from PRT              = ${reg.SAFETY_RAW.fields.MH_RX_ABORT}\n`+
					 `[ 7 MH_RX_FILTER_ERR         ] RX Filter Error                   = ${reg.SAFETY_RAW.fields.MH_RX_FILTER_ERR}\n`+
					 `[ 6 MH_SAFETY_MISC           ] Safety Misc Issues                = ${reg.SAFETY_RAW.fields.MH_SAFETY_MISC}\n`+
					 `[ 5 MH_VB_ACCESS_VIOLATION   ] VB Access Violation               = ${reg.SAFETY_RAW.fields.MH_VB_ACCESS_VIOLATION}\n`+
					 `[ 4 MH_LMEM_PROT_ERR         ] LMEM Access Outside PROT Range    = ${reg.SAFETY_RAW.fields.MH_LMEM_PROT_ERR}\n`+
					 `[ 3 MH_LMEM_TO_ERR           ] LMEM Timeout                      = ${reg.SAFETY_RAW.fields.MH_LMEM_TO_ERR}\n`+
					 `[ 2 MH_LMEM_UERR             ] LMEM Uncorrectable Error          = ${reg.SAFETY_RAW.fields.MH_LMEM_UERR}\n`+
					 `[ 1 MH_CTB_BC_ERR            ] CTB Block Copy Cancelled          = ${reg.SAFETY_RAW.fields.MH_CTB_BC_ERR}\n`+
					 `[ 0 MH_CTB_BC_TO             ] CTB Block Copy Timeout            = ${reg.SAFETY_RAW.fields.MH_CTB_BC_TO}`
		});
	}

	// === TX_FUNC_CLR (write-only) ===
	if ('TX_FUNC_CLR' in reg && reg.TX_FUNC_CLR.int32 !== undefined) {
		const v = reg.TX_FUNC_CLR.int32;
		// 0. Extend existing register structure
		reg.TX_FUNC_CLR.fields = { BITS: v };
		reg.TX_FUNC_CLR.report = [];
		// 1. Decode all individual bits of TX_FUNC_CLR register (write-only)
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
		reg.RX_FUNC_CLR.fields = { BITS: v };
		reg.RX_FUNC_CLR.report = [];
		// 1. Decode all individual bits of RX_FUNC_CLR register (write-only)
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
		reg.ERR_STS_CLR.fields = { BITS: v };
		reg.ERR_STS_CLR.report = [];
		// 1. Decode all individual bits of ERR_STS_CLR register (write-only)
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
		reg.SAFETY_CLR.fields = { BITS: v };
		reg.SAFETY_CLR.report = [];
		// 1. Decode all individual bits of SAFETY_CLR register (write-only)
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
		reg.TX_FUNC_ENA.fields.PRT_TX_EVT       = getBits(v,16,16);
		reg.TX_FUNC_ENA.fields.MH_CTB_TX_BC_REQ = getBits(v,4,4);
		reg.TX_FUNC_ENA.fields.MH_TEFQ_DEQ      = getBits(v,3,3);
		reg.TX_FUNC_ENA.fields.MH_TEFQ_ENQ      = getBits(v,2,2);
		reg.TX_FUNC_ENA.fields.MH_TXPQ_ENQ      = getBits(v,1,1);
		reg.TX_FUNC_ENA.fields.MH_TXFQ_ENQ      = getBits(v,0,0);
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
					 `[16 PRT_TX_EVT               ] Enable PRT TX Event               = ${reg.TX_FUNC_ENA.fields.PRT_TX_EVT}\n`+
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
					 `[ 4 MH_CTB_TX_BC_REQ         ] Enable Block Copy Request (TX)    = ${reg.TX_FUNC_ENA.fields.MH_CTB_TX_BC_REQ}\n`+
					 `[ 3 MH_TEFQ_DEQ              ] Enable TEFQ Dequeue               = ${reg.TX_FUNC_ENA.fields.MH_TEFQ_DEQ}\n`+
					 `[ 2 MH_TEFQ_ENQ              ] Enable TEFQ Enqueue               = ${reg.TX_FUNC_ENA.fields.MH_TEFQ_ENQ}\n`+
					 `[ 1 MH_TXPQ_ENQ              ] Enable TXPQ Enqueue               = ${reg.TX_FUNC_ENA.fields.MH_TXPQ_ENQ}\n`+
					 `[ 0 MH_TXFQ_ENQ              ] Enable TXFQ Enqueue               = ${reg.TX_FUNC_ENA.fields.MH_TXFQ_ENQ}`
		});
	}

	// === RX_FUNC_ENA: RX Functional Enable ===
	if ('RX_FUNC_ENA' in reg && reg.RX_FUNC_ENA.int32 !== undefined) {
		const v = reg.RX_FUNC_ENA.int32;
		// 0. Extend existing register structure
		reg.RX_FUNC_ENA.fields = {};
		reg.RX_FUNC_ENA.report = [];
		// 1. Decode all individual bits of RX_FUNC_ENA register
		reg.RX_FUNC_ENA.fields.PRT_RX_EVT        = getBits(v,16,16);
		reg.RX_FUNC_ENA.fields.MH_RX_MSG_ALERT   = getBits(v,6,6);
		reg.RX_FUNC_ENA.fields.MH_RX_FILTER_MATCH= getBits(v,5,5);
		reg.RX_FUNC_ENA.fields.MH_CTB_RX_BC_REQ  = getBits(v,4,4);
		reg.RX_FUNC_ENA.fields.MH_RXFQ1_DEQ      = getBits(v,3,3);
		reg.RX_FUNC_ENA.fields.MH_RXFQ0_DEQ      = getBits(v,2,2);
		reg.RX_FUNC_ENA.fields.MH_RXFQ1_ENQ      = getBits(v,1,1);
		reg.RX_FUNC_ENA.fields.MH_RXFQ0_ENQ      = getBits(v,0,0);
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
					 `[16 PRT_RX_EVT               ] Enable PRT RX Event               = ${reg.RX_FUNC_ENA.fields.PRT_RX_EVT}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
				   `[ 8 -                        ] Reserved                          = - \n`+
				   `[ 7 -                        ] Reserved                          = - \n`+
					 `[ 6 MH_RX_MSG_ALERT          ] Enable RX Message Alert           = ${reg.RX_FUNC_ENA.fields.MH_RX_MSG_ALERT}\n`+
					 `[ 5 MH_RX_FILTER_MATCH       ] Enable RX Filter Match            = ${reg.RX_FUNC_ENA.fields.MH_RX_FILTER_MATCH}\n`+
					 `[ 4 MH_CTB_RX_BC_REQ         ] Enable Block Copy Request (RX)    = ${reg.RX_FUNC_ENA.fields.MH_CTB_RX_BC_REQ}\n`+
					 `[ 3 MH_RXFQ1_DEQ             ] Enable RXFQ1 Dequeue              = ${reg.RX_FUNC_ENA.fields.MH_RXFQ1_DEQ}\n`+
					 `[ 2 MH_RXFQ0_DEQ             ] Enable RXFQ0 Dequeue              = ${reg.RX_FUNC_ENA.fields.MH_RXFQ0_DEQ}\n`+
					 `[ 1 MH_RXFQ1_ENQ             ] Enable RXFQ1 Enqueue              = ${reg.RX_FUNC_ENA.fields.MH_RXFQ1_ENQ}\n`+
					 `[ 0 MH_RXFQ0_ENQ             ] Enable RXFQ0 Enqueue              = ${reg.RX_FUNC_ENA.fields.MH_RXFQ0_ENQ}`
		});
	}

	// === ERR_STS_ENA: Error Enable ===
	if ('ERR_STS_ENA' in reg && reg.ERR_STS_ENA.int32 !== undefined) {
		const v = reg.ERR_STS_ENA.int32;
		// 0. Extend existing register structure
		reg.ERR_STS_ENA.fields = {};
		reg.ERR_STS_ENA.report = [];
		// 1. Decode all individual bits of ERR_STS_ENA register
		reg.ERR_STS_ENA.fields.PRT_BUS_ON                 = getBits(v,22,22);
		reg.ERR_STS_ENA.fields.PRT_E_ACTIVE               = getBits(v,21,21);
		reg.ERR_STS_ENA.fields.PRT_BUS_OFF                = getBits(v,20,20);
		reg.ERR_STS_ENA.fields.PRT_E_PASSIVE              = getBits(v,19,19);
		reg.ERR_STS_ENA.fields.PRT_BUS_ERR                = getBits(v,18,18);
		reg.ERR_STS_ENA.fields.PRT_IFF                    = getBits(v,17,17);
		reg.ERR_STS_ENA.fields.PRT_STOP                   = getBits(v,16,16);
		reg.ERR_STS_ENA.fields.HOST_ARA                   = getBits(v,8,8);
		reg.ERR_STS_ENA.fields.MH_VB_NO_SA                = getBits(v,7,7);
		reg.ERR_STS_ENA.fields.MH_QUEUE_ACCESS_VIOLATION  = getBits(v,6,6);
		reg.ERR_STS_ENA.fields.MH_LMEM_CERR               = getBits(v,5,5);
		reg.ERR_STS_ENA.fields.MH_RXFQ1_DROP              = getBits(v,4,4);
		reg.ERR_STS_ENA.fields.MH_RXFQ0_DROP              = getBits(v,3,3);
		reg.ERR_STS_ENA.fields.MH_TEFQ_DROP               = getBits(v,2,2);
		reg.ERR_STS_ENA.fields.MH_TXPQ_DEQ_NO_TX          = getBits(v,1,1);
		reg.ERR_STS_ENA.fields.MH_TXFQ_DEQ_NO_TX          = getBits(v,0,0);
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
					 `[22 PRT_BUS_ON               ] Enable PRT Bus-On                 = ${reg.ERR_STS_ENA.fields.PRT_BUS_ON}\n`+
					 `[21 PRT_E_ACTIVE             ] Enable PRT Error-Active           = ${reg.ERR_STS_ENA.fields.PRT_E_ACTIVE}\n`+
					 `[20 PRT_BUS_OFF              ] Enable PRT Stop / Bus-Off         = ${reg.ERR_STS_ENA.fields.PRT_BUS_OFF}\n`+
					 `[19 PRT_E_PASSIVE            ] Enable PRT Error-Passive          = ${reg.ERR_STS_ENA.fields.PRT_E_PASSIVE}\n`+
					 `[18 PRT_BUS_ERR              ] Enable PRT CAN Bus Error          = ${reg.ERR_STS_ENA.fields.PRT_BUS_ERR}\n`+
					 `[17 PRT_IFF                  ] Enable Invalid Frame Format       = ${reg.ERR_STS_ENA.fields.PRT_IFF}\n`+
					 `[16 PRT_STOP                 ] Enable PRT STOP                   = ${reg.ERR_STS_ENA.fields.PRT_STOP}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
				   `[ 9 -                        ] Reserved                          = - \n`+
					 `[ 8 HOST_ARA                 ] Enable Host Access Reserved Addr  = ${reg.ERR_STS_ENA.fields.HOST_ARA}\n`+
					 `[ 7 MH_VB_NO_SA              ] Enable VB Start Address Missing   = ${reg.ERR_STS_ENA.fields.MH_VB_NO_SA}\n`+
					 `[ 6 MH_QUEUE_ACCESS_VIOLATION] Enable Queue Access Violation     = ${reg.ERR_STS_ENA.fields.MH_QUEUE_ACCESS_VIOLATION}\n`+
					 `[ 5 MH_LMEM_CERR             ] Enable LMEM Correctable Error     = ${reg.ERR_STS_ENA.fields.MH_LMEM_CERR}\n`+
					 `[ 4 MH_RXFQ1_DROP            ] Enable RXFQ1 Drop                 = ${reg.ERR_STS_ENA.fields.MH_RXFQ1_DROP}\n`+
					 `[ 3 MH_RXFQ0_DROP            ] Enable RXFQ0 Drop                 = ${reg.ERR_STS_ENA.fields.MH_RXFQ0_DROP}\n`+
					 `[ 2 MH_TEFQ_DROP             ] Enable TEFQ Drop                  = ${reg.ERR_STS_ENA.fields.MH_TEFQ_DROP}\n`+
					 `[ 1 MH_TXPQ_DEQ_NO_TX        ] Enable TXPQ Dequeued Not TX       = ${reg.ERR_STS_ENA.fields.MH_TXPQ_DEQ_NO_TX}\n`+
					 `[ 0 MH_TXFQ_DEQ_NO_TX        ] Enable TXFQ Dequeued Not TX       = ${reg.ERR_STS_ENA.fields.MH_TXFQ_DEQ_NO_TX}`
		});
	}

	// === SAFETY_ENA: Safety Enable ===
	if ('SAFETY_ENA' in reg && reg.SAFETY_ENA.int32 !== undefined) {
		const v = reg.SAFETY_ENA.int32;
		// 0. Extend existing register structure
		reg.SAFETY_ENA.fields = {};
		reg.SAFETY_ENA.report = [];
		// 1. Decode all individual bits of SAFETY_ENA register
		reg.SAFETY_ENA.fields.PRT_RX_DO              = getBits(v,19,19);
		reg.SAFETY_ENA.fields.PRT_TX_DU              = getBits(v,18,18);
		reg.SAFETY_ENA.fields.PRT_USOS               = getBits(v,17,17);
		reg.SAFETY_ENA.fields.PRT_TX_ABORTED         = getBits(v,16,16);
		reg.SAFETY_ENA.fields.MH_TX_ABORT            = getBits(v,9,9);
		reg.SAFETY_ENA.fields.MH_RX_ABORT            = getBits(v,8,8);
		reg.SAFETY_ENA.fields.MH_RX_FILTER_ERR       = getBits(v,7,7);
		reg.SAFETY_ENA.fields.MH_SAFETY_MISC         = getBits(v,6,6);
		reg.SAFETY_ENA.fields.MH_VB_ACCESS_VIOLATION = getBits(v,5,5);
		reg.SAFETY_ENA.fields.MH_LMEM_PROT_ERR       = getBits(v,4,4);
		reg.SAFETY_ENA.fields.MH_LMEM_TO_ERR         = getBits(v,3,3);
		reg.SAFETY_ENA.fields.MH_LMEM_UERR           = getBits(v,2,2);
		reg.SAFETY_ENA.fields.MH_CTB_BC_ERR          = getBits(v,1,1);
		reg.SAFETY_ENA.fields.MH_CTB_BC_TO           = getBits(v,0,0);
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
					 `[19 PRT_RX_DO                ] Enable PRT RX Overflow            = ${reg.SAFETY_ENA.fields.PRT_RX_DO}\n`+
					 `[18 PRT_TX_DU                ] Enable PRT TX Underrun            = ${reg.SAFETY_ENA.fields.PRT_TX_DU}\n`+
					 `[17 PRT_USOS                 ] Enable PRT Unexpected SoS         = ${reg.SAFETY_ENA.fields.PRT_USOS}\n`+
					 `[16 PRT_TX_ABORTED           ] Enable PRT TX Aborted             = ${reg.SAFETY_ENA.fields.PRT_TX_ABORTED}\n`+
				   `[15 -                        ] Reserved                          = - \n`+
				   `[14 -                        ] Reserved                          = - \n`+
				   `[13 -                        ] Reserved                          = - \n`+
				   `[12 -                        ] Reserved                          = - \n`+
				   `[11 -                        ] Reserved                          = - \n`+
				   `[10 -                        ] Reserved                          = - \n`+
					 `[ 9 MH_TX_ABORT              ] Enable MH TX Abort                = ${reg.SAFETY_ENA.fields.MH_TX_ABORT}\n`+
					 `[ 8 MH_RX_ABORT              ] Enable MH RX Abort                = ${reg.SAFETY_ENA.fields.MH_RX_ABORT}\n`+
					 `[ 7 MH_RX_FILTER_ERR         ] Enable RX Filter Error            = ${reg.SAFETY_ENA.fields.MH_RX_FILTER_ERR}\n`+
					 `[ 6 MH_SAFETY_MISC           ] Enable Safety Misc                = ${reg.SAFETY_ENA.fields.MH_SAFETY_MISC}\n`+
					 `[ 5 MH_VB_ACCESS_VIOLATION   ] Enable VB Access Violation        = ${reg.SAFETY_ENA.fields.MH_VB_ACCESS_VIOLATION}\n`+
					 `[ 4 MH_LMEM_PROT_ERR         ] Enable LMEM PROT Error            = ${reg.SAFETY_ENA.fields.MH_LMEM_PROT_ERR}\n`+
					 `[ 3 MH_LMEM_TO_ERR           ] Enable LMEM Timeout               = ${reg.SAFETY_ENA.fields.MH_LMEM_TO_ERR}\n`+
					 `[ 2 MH_LMEM_UERR             ] Enable LMEM Uncorrect. Error      = ${reg.SAFETY_ENA.fields.MH_LMEM_UERR}\n`+
					 `[ 1 MH_CTB_BC_ERR            ] Enable CTB Block Copy Cancelled   = ${reg.SAFETY_ENA.fields.MH_CTB_BC_ERR}\n`+
					 `[ 0 MH_CTB_BC_TO             ] Enable CTB Block Copy Timeout     = ${reg.SAFETY_ENA.fields.MH_CTB_BC_TO}`
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
		const enabledTx = defsTx.filter(d => reg.TX_FUNC_ENA.fields[d.key] === 1);
		const nameWidthTx = Math.max(4, ...enabledTx.map(e => e.key.length));
		const linesTx = enabledTx.length === 0
			? 'No TX_FUNC interrupts enabled (all ENA bits = 0)'
			: enabledTx.map(d => `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthTx,' ')}  ${String(reg.TX_FUNC_RAW.fields[d.key])}   ${String(reg.TX_FUNC_ENA.fields[d.key])}`).join('\n');
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
		const enabledRx = defsRx.filter(d => reg.RX_FUNC_ENA.fields[d.key] === 1);
		const nameWidthRx = Math.max(4, ...enabledRx.map(e => e.key.length));
		const linesRx = enabledRx.length === 0
			? 'No RX_FUNC interrupts enabled (all ENA bits = 0)'
			: enabledRx.map(d => `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthRx,' ')}  ${String(reg.RX_FUNC_RAW.fields[d.key])}   ${String(reg.RX_FUNC_ENA.fields[d.key])}`).join('\n');
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
		const enabledErr = defsErr.filter(d => reg.ERR_STS_ENA.fields[d.key] === 1);
		const nameWidthErr = Math.max(4, ...enabledErr.map(e => e.key.length));
		const linesErr = enabledErr.length === 0
			? 'No ERR_STS interrupts enabled (all ENA bits = 0)'
			: enabledErr.map(d => `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthErr,' ')}  ${String(reg.ERR_STS_RAW.fields[d.key])}   ${String(reg.ERR_STS_ENA.fields[d.key])}`).join('\n');
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
		const enabledSaf = defsSaf.filter(d => reg.SAFETY_ENA.fields[d.key] === 1);
		const nameWidthSaf = Math.max(4, ...enabledSaf.map(e => e.key.length));
		const linesSaf = enabledSaf.length === 0
			? 'No SAFETY interrupts enabled (all ENA bits = 0)'
			: enabledSaf.map(d => `${d.bit.toString().padStart(2,' ')}   ${d.key.padEnd(nameWidthSaf,' ')}  ${String(reg.SAFETY_RAW.fields[d.key])}   ${String(reg.SAFETY_ENA.fields[d.key])}`).join('\n');
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
		reg.CAPTURING_MODE.fields.SAFETY = getBits(v,2,2);
		reg.CAPTURING_MODE.fields.ERR    = getBits(v,1,1);
		reg.CAPTURING_MODE.fields.FUNC   = getBits(v,0,0);
		const modeStr = (b) => b ? 'Edge' : 'Level';
		const expected = 0x7;
		reg.CAPTURING_MODE.report.push({
			severityLevel: sevC.info,
			msg: `CAPTURING_MODE: ${reg.CAPTURING_MODE.name_long} (0x${reg.CAPTURING_MODE.addr !== undefined ? reg.CAPTURING_MODE.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
					 `Expected fixed value: 0x${expected.toString(16).toUpperCase()} (all Edge).${v!==expected? ' (NOTE: Value differs from expected !)':''}\n`+
					 `[SAFETY ] SAFETY RAW input flag Capturing Mode = ${reg.CAPTURING_MODE.fields.SAFETY} (${modeStr(reg.CAPTURING_MODE.fields.SAFETY)})\n`+
					 `[ERR    ] ERR    RAW input flag Capturing Mode = ${reg.CAPTURING_MODE.fields.ERR} (${modeStr(reg.CAPTURING_MODE.fields.ERR)})\n`+
					 `[FUNC   ] FUNC   RAW input flag Capturing Mode = ${reg.CAPTURING_MODE.fields.FUNC} (${modeStr(reg.CAPTURING_MODE.fields.FUNC)})`
		});
	}

	// === HDP: Hardware Debug Port Control ===
	if ('HDP' in reg && reg.HDP.int32 !== undefined) {
		const v = reg.HDP.int32;
		reg.HDP.fields = {};
		reg.HDP.report = [];
		reg.HDP.fields.HDP_SEL = getBits(v,0,0);
		reg.HDP.report.push({
			severityLevel: sevC.info,
			msg: `HDP: ${reg.HDP.name_long} (0x${reg.HDP.addr !== undefined ? reg.HDP.addr.toString(16).toUpperCase().padStart(3,'0') : '---'}: 0x${v.toString(16).toUpperCase().padStart(8,'0')})\n`+
					 `[HDP_SEL] HDP Select (0=MH, 1=PRT) = ${reg.HDP.fields.HDP_SEL} (${reg.HDP.fields.HDP_SEL? 'PRT selected':'MH selected'})`
		});
	}

}