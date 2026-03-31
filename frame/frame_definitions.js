// =============================================================================
// frame_definitions.js Field definition templates per CAN frame type
// =============================================================================
// Used by CanFrame._buildFrameStructure() to create the fields[] hierarchy.
// Each template defines the frame fields, elements, and their metadata.
// The bits[] arrays are left empty â€” they are filled in subsequent pipeline steps.
// =============================================================================

/**
 * DLC-to-byte-count mapping for CAN CC frames.
 * DLC 0â€“8 maps 1:1. DLC 9â€“15 is capped at 8.
 */
var DLC_MAP_CC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8];

/**
 * DLC-to-byte-count mapping for CAN FD frames.
 * DLC 0â€“8 maps 1:1, then 9â†’12, 10â†’16, 11â†’20, 12â†’24, 13â†’32, 14â†’48, 15â†’64.
 */
var DLC_MAP_FD = [0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16, 20, 24, 32, 48, 64];

/**
 * Returns data byte count from DLC for a given frame type.
 */
function dlcToBytes(frameType, dlc) {
  if (frameType.startsWith("XL_")) {
    // XL: data field length = DLC + 1 (DLC range 0â€“2047)
    return Math.min(Math.max(dlc + 1, 1), 2048);
  } else if (frameType.startsWith("FD_")) {
    return DLC_MAP_FD[Math.min(Math.max(dlc, 0), 15)];
  } else {
    // CC: remote frames have 0 data bytes regardless of DLC
    if (frameType.endsWith("_RTR")) return 0;
    return DLC_MAP_CC[Math.min(Math.max(dlc, 0), 15)];
  }
}

// =============================================================================
// Helper: create an element object (for non-data fields)
// =============================================================================
/**
 * Create a field element definition.
 * @param {string}  name                 - Element name (e.g. "DLC", "CRC del")
 * @param {number}  nominalBits          - Number of nominal bits
 * @param {string}  bitNamePrefix        - Prefix for auto-generated bit names ("" if unused)
 * @param {boolean} isUserInput          - Whether the value is user-configurable
 * @param {number}  value                - Bit value
 * @param {boolean} printNameInFieldsBar - Whether to show element name in the SVG fields bar
 * @param {Array}   customBitNamesArray  - Custom per-bit names ([] if using prefix scheme)
 */
function defElement(name, nominalBits, bitNamePrefix, isUserInput, value, printNameInFieldsBar, customBitNamesArray) {
  if (!customBitNamesArray) customBitNamesArray = [];
  return {
    name:                 name,
    nominalBits:          nominalBits,
    bitNamePrefix:        bitNamePrefix,
    customBitNames:       customBitNamesArray.length > 0,
    customBitNamesArray:  customBitNamesArray,
    isUserInput:          isUserInput,
    value:                value,
    printNameInFieldsBar: printNameInFieldsBar,
    bits:                 []
  };
}

// =============================================================================
// Helper: create a data field with byte sub-elements
// =============================================================================
function defDataField(dataBytes, bitNamePrefix) {
  var df = {
    fieldName: "Data field",
    nominalBits: dataBytes.length * 8,
    totalBits: dataBytes.length * 8,
    bitNamePrefix: bitNamePrefix,
    isUserInput: true,
    dataField: []
  };
  for (var i = 0; i < dataBytes.length; i++) {
    df.dataField.push({
      name: "Byte" + i,
      value: dataBytes[i],
      totalBits: 8,
      bits: []
    });
  }
  return df;
}

// =============================================================================
// Frame definition builders per frame type
// =============================================================================

/**
 * Build fields[] template for CC_CBFF or CC_CBFF_RTR.
 */
function getDefinition_CC_CBFF(input, isRemote) {
  var dlc = Math.min(Math.max(input.dlc, 0), 15);
  var dataByteCount = isRemote ? 0 : DLC_MAP_CC[dlc];
  var dataBytes = input.data.slice(0, dataByteCount);
  // Pad with zeros if not enough data provided
  while (dataBytes.length < dataByteCount) dataBytes.push(0x00);

  var fields = [];

  // SOF
  fields.push({
    fieldName: "SOF",
    nominalBits: 1, totalBits: 1,
    elements: [defElement("SOF", 1, "", false, 0, false)]
  });

  // Arbitration field
  fields.push({
    fieldName: "Arbitration field",
    nominalBits: 12, totalBits: 12,
    elements: [
      defElement("Base ID", 11, "ID", true,  input.id & 0x7FF, true, ["ID28","ID27","ID26","ID25","ID24","ID23","ID22","ID21","ID20","ID19","ID18"]),
      defElement("RTR",      1, "",   false, isRemote ? 1 : 0, true)
    ]
  });

  // Control field
  fields.push({
    fieldName: "Control field",
    nominalBits: 6, totalBits: 6,
    elements: [
      defElement("IDE", 1, "",    false, 0,   true),
      defElement("r0",  1, "",    false, 0,   true),
      defElement("DLC", 4, "Bit", true,  dlc, true)
    ]
  });

  // Data field
  if (dataByteCount > 0) {
    fields.push(defDataField(dataBytes, "Bit"));
  }

  // CRC field
  fields.push({
    fieldName: "CRC field",
    nominalBits: 16, totalBits: 16,
    elements: [
      defElement("CRC",     15, "Bit", false, 0, true),
      defElement("CRC del",  1, "",    false, 1, false)
    ]
  });

  // ACK field
  fields.push({
    fieldName: "ACK",
    nominalBits: 2, totalBits: 2,
    elements: [
      defElement("ACK slot", 1, "", true,  input.ackSlot, false),
      defElement("ACK del",  1, "", false, 1,             false)
    ]
  });

  // EOF
  fields.push({
    fieldName: "EOF",
    nominalBits: 7, totalBits: 7,
    elements: [defElement("EOF", 7, "", false, 0x7F, false, ["Bit1","Bit2","Bit3","Bit4","Bit5","Bit6","Bit7"])]
  });

  var bitTimeInfo = {
    dataPhasePresent: false,
    firstDataPhaseBit: null,
    lastDataPhaseBit: null
  };

  return {
    fields: fields,
    dataByteCount: dataByteCount,
    bitTimeInfo: bitTimeInfo
  };
}

/**
 * Build fields[] template for CC_CEFF or CC_CEFF_RTR.
 */
function getDefinition_CC_CEFF(input, isRemote) {
  var dlc = Math.min(Math.max(input.dlc, 0), 15);
  var dataByteCount = isRemote ? 0 : DLC_MAP_CC[dlc];
  var dataBytes = input.data.slice(0, dataByteCount);
  while (dataBytes.length < dataByteCount) dataBytes.push(0x00);

  var id29 = input.id & 0x1FFFFFFF;
  var idHigh = (id29 >> 18) & 0x7FF;  // ID[28:18] = Base ID
  var idLow  = id29 & 0x3FFFF;        // ID[17:0] = Extended ID

  var fields = [];

  // SOF
  fields.push({
    fieldName: "SOF",
    nominalBits: 1, totalBits: 1,
    elements: [defElement("SOF", 1, "", false, 0, false)]
  });

  // Arbitration field (29-bit: Base ID(11 bit), SRR, IDE, Extended ID(18 bit), RTR)
  fields.push({
    fieldName: "Arbitration field",
    nominalBits: 32, totalBits: 32,
    elements: [
      defElement("Base ID",      11, "ID", true,  idHigh,           true, ["ID28","ID27","ID26","ID25","ID24","ID23","ID22","ID21","ID20","ID19","ID18"]),
      defElement("SRR",           1, "",   false, 1,                true),
      defElement("IDE",           1, "",   false, 1,                true),
      defElement("Extended ID",  18, "ID", true,  idLow,            true, ["ID17","ID16","ID15","ID14","ID13","ID12","ID11","ID10","ID9","ID8","ID7","ID6","ID5","ID4","ID3","ID2","ID1","ID0"]),
      defElement("RTR",           1, "",   false, isRemote ? 1 : 0, true)
    ]
  });

  // Control field
  fields.push({
    fieldName: "Control field",
    nominalBits: 6, totalBits: 6,
    elements: [
      defElement("r1",  1, "",    false, 0,   true),
      defElement("r0",  1, "",    false, 0,   true),
      defElement("DLC", 4, "Bit", true,  dlc, true)
    ]
  });

  // Data field
  if (dataByteCount > 0) {
    fields.push(defDataField(dataBytes, "Bit"));
  }

  // CRC field
  fields.push({
    fieldName: "CRC field",
    nominalBits: 16, totalBits: 16,
    elements: [
      defElement("CRC",     15, "Bit", false, 0, true),
      defElement("CRC del",  1, "",    false, 1, false)
    ]
  });

  // ACK field
  fields.push({
    fieldName: "ACK",
    nominalBits: 2, totalBits: 2,
    elements: [
      defElement("ACK slot", 1, "", true,  input.ackSlot, false),
      defElement("ACK del",  1, "", false, 1,             false)
    ]
  });

  // EOF
  fields.push({
    fieldName: "EOF",
    nominalBits: 7, totalBits: 7,
    elements: [defElement("EOF", 7, "", false, 0x7F, false, ["Bit1","Bit2","Bit3","Bit4","Bit5","Bit6","Bit7"])]
  });

  var bitTimeInfo = {
    dataPhasePresent: false,
    firstDataPhaseBit: null,
    lastDataPhaseBit: null
  };

  return {
    fields: fields,
    dataByteCount: dataByteCount,
    bitTimeInfo: bitTimeInfo
  };
}

/**
 * Build fields[] template for FD_FBFF.
 */
function getDefinition_FD_FBFF(input) {
  var dlc = Math.min(Math.max(input.dlc, 0), 15);
  var dataByteCount = DLC_MAP_FD[dlc];
  var dataBytes = input.data.slice(0, dataByteCount);
  while (dataBytes.length < dataByteCount) dataBytes.push(0x00);

  var crcLen = (dataByteCount <= 16) ? 17 : 21;

  var fields = [];

  // SOF
  fields.push({
    fieldName: "SOF",
    nominalBits: 1, totalBits: 1,
    elements: [defElement("SOF", 1, "", false, 0, false)]
  });

  // Arbitration field
  fields.push({
    fieldName: "Arbitration field",
    nominalBits: 12, totalBits: 12,
    elements: [
      defElement("Base ID", 11, "ID", true,  input.id & 0x7FF, true, ["ID28","ID27","ID26","ID25","ID24","ID23","ID22","ID21","ID20","ID19","ID18"]),
      defElement("RRS",      1, "",   false, 0,                true)
    ]
  });

  // Control field
  fields.push({
    fieldName: "Control field",
    nominalBits: 10, totalBits: 10,
    elements: [
      defElement("IDE", 1, "",    false, 0,         true),
      defElement("FDF", 1, "",    false, 1,         true),
      defElement("res", 1, "",    false, 0,         true),
      defElement("BRS", 1, "",    true,  input.brs, true),
      defElement("ESI", 1, "",    true,  input.esi, true),
      defElement("DLC", 4, "Bit", true,  dlc,       true)
    ]
  });

  // Data field
  if (dataByteCount > 0) {
    fields.push(defDataField(dataBytes, "Bit"));
  }

  // CRC field (SBC + CRC + CRC del)
  fields.push({
    fieldName: "CRC field",
    nominalBits: 4 + crcLen + 1, totalBits: 4 + crcLen + 1,
    elements: [
      defElement("SBC",      4,      "Bit", false, 0, true),
      defElement("CRC",      crcLen, "Bit", false, 0, true),
      defElement("CRC del",  1,      "",    false, 1, false)
    ]
  });

  // ACK field
  fields.push({
    fieldName: "ACK",
    nominalBits: 2, totalBits: 2,
    elements: [
      defElement("ACK slot", 1, "", true,  input.ackSlot, false),
      defElement("ACK del",  1, "", false, 1,             false)
    ]
  });

  // EOF
  fields.push({
    fieldName: "EOF",
    nominalBits: 7, totalBits: 7,
    elements: [defElement("EOF", 7, "", false, 0x7F, false, ["Bit1","Bit2","Bit3","Bit4","Bit5","Bit6","Bit7"])]
  });

  var bitTimeInfo = {
    dataPhasePresent: !!input.brs,
    firstDataPhaseBit: "BRS",
    lastDataPhaseBit: "CRC del"
  };

  return {
    fields: fields,
    dataByteCount: dataByteCount,
    crcLen: crcLen,
    bitTimeInfo: bitTimeInfo
  };
}

/**
 * Build fields[] template for FD_FEFF.
 */
function getDefinition_FD_FEFF(input) {
  var dlc = Math.min(Math.max(input.dlc, 0), 15);
  var dataByteCount = DLC_MAP_FD[dlc];
  var dataBytes = input.data.slice(0, dataByteCount);
  while (dataBytes.length < dataByteCount) dataBytes.push(0x00);

  var id29 = input.id & 0x1FFFFFFF;
  var idHigh = (id29 >> 18) & 0x7FF;
  var idLow  = id29 & 0x3FFFF;
  var crcLen = (dataByteCount <= 16) ? 17 : 21;

  var fields = [];

  // SOF
  fields.push({
    fieldName: "SOF",
    nominalBits: 1, totalBits: 1,
    elements: [defElement("SOF", 1, "", false, 0, false)]
  });

  // Arbitration field (29-bit)
  fields.push({
    fieldName: "Arbitration field",
    nominalBits: 32, totalBits: 32,
    elements: [
      defElement("Base ID",      11, "ID", true,  idHigh, true, ["ID28","ID27","ID26","ID25","ID24","ID23","ID22","ID21","ID20","ID19","ID18"]),
      defElement("SRR",           1, "",   false, 1,      true),
      defElement("IDE",           1, "",   false, 1,      true),
      defElement("Extended ID",  18, "ID", true,  idLow,  true, ["ID17","ID16","ID15","ID14","ID13","ID12","ID11","ID10","ID9","ID8","ID7","ID6","ID5","ID4","ID3","ID2","ID1","ID0"]),
      defElement("RRS",           1, "",   false, 0,      true)
    ]
  });

  // Control field
  fields.push({
    fieldName: "Control field",
    nominalBits: 10, totalBits: 10,
    elements: [
      defElement("FDF", 1, "",    false, 1,         true),
      defElement("res", 1, "",    false, 0,         true),
      defElement("BRS", 1, "",    true,  input.brs, true),
      defElement("ESI", 1, "",    true,  input.esi, true),
      defElement("DLC", 4, "Bit", true,  dlc,       true)
    ]
  });

  // Data field
  if (dataByteCount > 0) {
    fields.push(defDataField(dataBytes, "Bit"));
  }

  // CRC field (SBC + CRC + CRC del)
  fields.push({
    fieldName: "CRC field",
    nominalBits: 4 + crcLen + 1, totalBits: 4 + crcLen + 1,
    elements: [
      defElement("SBC",      4,      "Bit", false, 0, true),
      defElement("CRC",      crcLen, "Bit", false, 0, true),
      defElement("CRC del",  1,      "",    false, 1, false)
    ]
  });

  // ACK field
  fields.push({
    fieldName: "ACK",
    nominalBits: 2, totalBits: 2,
    elements: [
      defElement("ACK slot", 1, "", true,  input.ackSlot, false),
      defElement("ACK del",  1, "", false, 1,             false)
    ]
  });

  // EOF
  fields.push({
    fieldName: "EOF",
    nominalBits: 7, totalBits: 7,
    elements: [defElement("EOF", 7, "", false, 0x7F, false, ["Bit1","Bit2","Bit3","Bit4","Bit5","Bit6","Bit7"])]
  });

  var bitTimeInfo = {
    dataPhasePresent: !!input.brs,
    firstDataPhaseBit: "BRS",
    lastDataPhaseBit: "CRC del"
  };

  return {
    fields: fields,
    dataByteCount: dataByteCount,
    crcLen: crcLen,
    bitTimeInfo: bitTimeInfo
  };
}

/**
 * Build fields[] template for XL_XBFF.
 */
function getDefinition_XL_XBFF(input) {
  var dlc = Math.min(Math.max(input.dlc, 0), 2047);
  var dataByteCount = dlc + 1;  // XL: data field length = DLC + 1
  var dataBytes = input.data.slice(0, dataByteCount);
  while (dataBytes.length < dataByteCount) dataBytes.push(0x00);

  var fields = [];

  // SOF
  fields.push({
    fieldName: "SOF",
    nominalBits: 1, totalBits: 1,
    elements: [defElement("SOF", 1, "", false, 0, false)]
  });

  // Arbitration field
  fields.push({
    fieldName: "Arbitration field",
    nominalBits: 16, totalBits: 16,
    elements: [
      defElement("Priority ID", 11, "ID", true,  input.id & 0x7FF,                        true, ["ID28","ID27","ID26","ID25","ID24","ID23","ID22","ID21","ID20","ID19","ID18"]),
      defElement("RRS",      1, "",   true,  input.rrs !== undefined ? input.rrs : 0, true),
      defElement("IDE",      1, "",   false, 0,                                       true),
      defElement("FDF",      1, "",   false, 1,                                       true),
      defElement("XLF",      1, "",   false, 1,                                       true)
    ]
  });

  // Control field (split into parts conceptually, but one field in structure)
  // Part 1: resXL, ADH, DH1, DH2, DL1, SDT, SEC, DLC, SBC, PCRC
  // Part 2: VCID, AF
  fields.push({
    fieldName: "Control field",
    nominalBits: 5 + 8 + 1 + 11 + 3 + 13 + 8 + 32, // = 81
    totalBits:   5 + 8 + 1 + 11 + 3 + 13 + 8 + 32, // = 81 (initially equal to nominal bits, will increase later when stuff bits are added)
    elements: [
      defElement("resXL",  1, "",    false, 0,          false),
      defElement("ADS",    4, "",    false, 0xE,        true,  ["ADH","DH1","DH2","DL1"]),
      defElement("SDT",    8, "Bit", true,  input.sdt,  true),
      defElement("SEC",    1, "",    true,  input.sec,  true),
      defElement("DLC",   11, "Bit", true,  dlc,        true),
      defElement("SBC",    3, "Bit", false, 0,          true),   // computed
      defElement("PCRC",  13, "Bit", false, 0,          true),   // computed
      defElement("VCID",   8, "Bit", true,  input.vcid, true),
      defElement("AF",    32, "Bit", true,  input.af,   true)
    ]
  });

  // Data field
  fields.push(defDataField(dataBytes, "Bit"));

  // CRC field (FCRC + FCP)
  fields.push({
    fieldName: "CRC field",
    nominalBits: 36, totalBits: 36,
    elements: [
      defElement("FCRC", 32, "Bit", false, 0,    true),   // computed
      defElement("FCP",   4, "FCP", false, 0x0C, true)    // 1100 = 0x0C
    ]
  });

  // ACK field (DAS + ACK)
  fields.push({
    fieldName: "ACK field",
    nominalBits: 6, totalBits: 6,
    elements: [
      defElement("DAS", 4, "", false, 0xD,                       true,  ["DAH","AH1","AL1","AH2"]),
      defElement("ACK", 2, "", true,  (input.ackSlot << 1) | 1, true,  ["ACK slot","ACK del"])
    ]
  });

  // EOF
  fields.push({
    fieldName: "EOF",
    nominalBits: 7, totalBits: 7,
    elements: [defElement("EOF", 7, "", false, 0x7F, false, ["Bit1","Bit2","Bit3","Bit4","Bit5","Bit6","Bit7"])]
  });

  var bitTimeInfo = {
    dataPhasePresent: true,
    firstDataPhaseBit: "DH1",
    lastDataPhaseBit: "FCP0",
  };

  return {
    fields: fields,
    dataByteCount: dataByteCount,
    bitTimeInfo: bitTimeInfo
  };
}

/**
 * Master function: get field definition for any frame type.
 */
export function getFrameDefinition(frameType, input) {
  switch (frameType) {
    case "CC_CBFF":     return getDefinition_CC_CBFF(input, false);
    case "CC_CBFF_RTR": return getDefinition_CC_CBFF(input, true);
    case "CC_CEFF":     return getDefinition_CC_CEFF(input, false);
    case "CC_CEFF_RTR": return getDefinition_CC_CEFF(input, true);
    case "FD_FBFF":     return getDefinition_FD_FBFF(input);
    case "FD_FEFF":     return getDefinition_FD_FEFF(input);
    case "XL_XBFF":     return getDefinition_XL_XBFF(input);
    default:
      throw new Error("Unknown frame type: " + frameType);
  }
}
