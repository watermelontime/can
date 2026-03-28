// =============================================================================
// frame_builder.js — CanFrame class: build frame structure, bits, stuffing, CRC
// =============================================================================

// --- Configurable stuff bit names (from DRAW_CFG in frame_draw.js) ---
// Resolved lazily because frame_draw.js may load after this file.
var STUFF_DYN_NAME;   // name for dynamic stuff bits
var STUFF_FIX_NAME;   // name for fixed stuff bits
function _initStuffNames() {
  STUFF_DYN_NAME = DRAW_CFG.dynStuffBitName;
  STUFF_FIX_NAME = DRAW_CFG.fixedStuffBitName;
}

// --- SBC lookup tables ---
// FD: 4-bit SBC (Gray-coded + parity), indexed by (dynamic stuff count mod 8)
var SBC_FD_TABLE = [
  [0,0,0,0], // 0
  [0,0,1,1], // 1
  [0,1,1,0], // 2
  [0,1,0,1], // 3
  [1,1,0,0], // 4
  [1,1,1,1], // 5
  [1,0,1,0], // 6
  [1,0,0,1]  // 7
];

// XL: 3-bit SBC (Gray-coded + parity), indexed by dynamic stuff count (0–3)
var SBC_XL_TABLE = [
  [0,0,1], // 0
  [0,1,0], // 1
  [1,1,1], // 2
  [1,0,0]  // 3
];

// =============================================================================
// CanFrame class
// =============================================================================
function CanFrame(frameType) {
  this.frameType = frameType;

  this.input = {
    id:       0x000,
    dlc:      0,
    data:     [],
    ackSlot:  1,
    brs:      0,
    esi:      0,
    sec:      0,
    sdt:      0x00,
    vcid:     0x00,
    af:       0x00000000,
    rrs:      0
  };

  this.computed = {
    dataFieldBytes:     0,
    crcLength:          0,
    crcValue:           0,
    pcrcValue:          0,
    fcrcValue:          0,
    stuffBitCountDyn:   0,
    stuffBitCountFixed: 0,
    totalBits:          0
  };

  this.fields = [];
  
  this.bitTimeInfo = {
    dataPhasePresent: false,
    firstDataPhaseBit: null,
    lastDataPhaseBit: null,
    realBitRatio: false,
    realArbDataBitLenRatio: 1.0,
    arbSP: 80,
    dataSP: 70
  };

  this.debug = {
    crcInputBitStream:  [],
    pcrcInputBitStream: [],
    fcrcInputBitStream: [],
    crcShiftRegTrace:   [],
    pcrcShiftRegTrace:  []
  };
}

// =============================================================================
// Type checking helpers
// =============================================================================
CanFrame.prototype._isCC = function() { return this.frameType.startsWith("CC_"); };
CanFrame.prototype._isFD = function() { return this.frameType.startsWith("FD_"); };
CanFrame.prototype._isXL = function() { return this.frameType.startsWith("XL_"); };

// =============================================================================
// Public: build the complete frame
// =============================================================================
CanFrame.prototype.build = function() {
  _initStuffNames();
  this._buildFrameStructure();

  if (this._isCC())      this._buildCC();
  else if (this._isFD()) this._buildFD();
  else if (this._isXL()) this._buildXL();

  this._finalize();
};

// =============================================================================
// Step 2: Build frame structure (fields[] with empty bits[])
// =============================================================================
CanFrame.prototype._buildFrameStructure = function() {
  var def = getFrameDefinition(this.frameType, this.input);
  this.fields = def.fields;
  this.bitTimeInfo = def.bitTimeInfo || {
    dataPhasePresent: false,
    firstDataPhaseBit: null,
    lastDataPhaseBit: null,
    realBitRatio: false,
    realArbDataBitLenRatio: 1.0,
    arbSP: 80,
    dataSP: 70
  };
  this.computed.dataFieldBytes = def.dataByteCount;
  if (def.crcLen !== undefined) { // TODO: omitt this code; crcLen alwasys defined in frame definitions
    this.computed.crcLength = def.crcLen;
  } else if (this._isCC()) {
    this.computed.crcLength = 15;
  } else if (this._isXL()) {
    this.computed.crcLength = 32; // FCRC
  }
};

// =============================================================================
// Shared: Generate bits[] for an element from its value and bitNamePrefix
// =============================================================================
CanFrame.prototype._generateBitsForElement = function(elem) {
  var bits = [];
  var n = elem.nominalBits;
  var prefix = elem.bitNamePrefix;
  var customNames = elem.customBitNames ? elem.customBitNamesArray : null;

  var startIndex = n - 1;

  for (var i = 0; i < n; i++) {
    var bitVal = (elem.value >> (n - 1 - i)) & 1; // extract bit value
    var bitName;

    // custom bit names
    if (customNames && customNames.length === n) { // customBitNamesArray
      bitName = customNames[i];
    // single bits
    } else if (n === 1 && prefix === "") {
      bitName = elem.name;
    // default bit names: prefix + bit index
    } else {
      bitName = prefix + String(startIndex - i);
    }

    // create bit object (array element)
    bits.push({
      v: bitVal,
      name: bitName,
      isStuffBit: false,
      isStuffBitTypeFixed: false
    });
  }
  return bits;
};

// =============================================================================
// Shared: Fill bits[] for all elements in specified fields (by field indices)
// For data fields, fills byte-level bits.
// Skips elements whose bits[] is already non-empty (e.g., already computed).
// =============================================================================
CanFrame.prototype._fillNominalBits = function(fieldIndices) {
  for (var fi = 0; fi < fieldIndices.length; fi++) {
    var oneField = this.fields[fieldIndices[fi]];
    if (oneField.dataField) { // Array of Data Field bytes is named dataField
      // Data field: generate bits for each byte
      var prefix = oneField.bitNamePrefix || "Bit";
      for (var bi = 0; bi < oneField.dataField.length; bi++) {
        var byteElem = oneField.dataField[bi];
        if (byteElem.bits.length > 0) continue;
        byteElem.bits = [];
        for (var bitIdx = 7; bitIdx >= 0; bitIdx--) {
          byteElem.bits.push({
            v: (byteElem.value >> bitIdx) & 1,
            name: prefix + String(bitIdx),
            isStuffBit: false,
            isStuffBitTypeFixed: false
          });
        }
      }
    } else if (oneField.elements) { // Array of Elements is named elements
      for (var ei = 0; ei < oneField.elements.length; ei++) {
        var elem = oneField.elements[ei];
        if (elem.bits.length > 0) continue; // already filled
        elem.bits = this._generateBitsForElement(elem);
      }
    }
  }
};

// =============================================================================
// Shared: Flatten bits from fields (respecting which have bits filled)
// Returns array of {v, name, isStuffBit, isStuffBitTypeFixed, _fieldIdx, _elemIdx, _bitIdx}
// =============================================================================
CanFrame.prototype._flattenBits = function(fieldIndices, options) {
  var flat = [];
  var opts = options || {};
  var includeStuff = (opts.includeStuff !== false);
  var excludeStuff = (opts.excludeStuff === true);
  var excludeFixed = (opts.excludeFixed === true);

  for (var fi = 0; fi < fieldIndices.length; fi++) {
    var fIdx = fieldIndices[fi];
    var field = this.fields[fIdx];
    if (field.dataField) {
      for (var bi = 0; bi < field.dataField.length; bi++) {
        var byteElem = field.dataField[bi];
        for (var i = 0; i < byteElem.bits.length; i++) {
          var b = byteElem.bits[i];
          if (excludeStuff && b.isStuffBit) continue;
          if (excludeFixed && b.isStuffBit && b.isStuffBitTypeFixed) continue;
          flat.push(b);
        }
      }
    } else if (field.elements) {
      for (var ei = 0; ei < field.elements.length; ei++) {
        var elem = field.elements[ei];
        for (var j = 0; j < elem.bits.length; j++) {
          var bit = elem.bits[j];
          if (excludeStuff && bit.isStuffBit) continue;
          if (excludeFixed && bit.isStuffBit && bit.isStuffBitTypeFixed) continue;
          flat.push(bit);
        }
      }
    }
  }
  return flat;
};

// =============================================================================
// Shared: Get field index by fieldName
// =============================================================================
CanFrame.prototype._fieldIndex = function(fieldName) {
  for (var i = 0; i < this.fields.length; i++) {
    if (this.fields[i].fieldName === fieldName) return i;
  }
  return -1;
};

// =============================================================================
// Shared: Get element within a field by element name
// =============================================================================
CanFrame.prototype._getElement = function(fieldName, elemName) {
  var fi = this._fieldIndex(fieldName);
  if (fi < 0) return null;
  var field = this.fields[fi];
  if (!field.elements) return null;
  for (var i = 0; i < field.elements.length; i++) {
    if (field.elements[i].name === elemName) return field.elements[i];
  }
  return null;
};

// =============================================================================
// Shared: Get all field indices up to (and optionally including) a field
// =============================================================================
CanFrame.prototype._fieldIndicesUpTo = function(fieldName, inclusive) {
  var indices = [];
  for (var i = 0; i < this.fields.length; i++) {
    if (this.fields[i].fieldName === fieldName) {
      if (inclusive) indices.push(i);
      break;
    }
    indices.push(i);
  }
  return indices;
};

CanFrame.prototype._fieldIndicesAll = function() {
  var indices = [];
  for (var i = 0; i < this.fields.length; i++) indices.push(i);
  return indices;
};

// =============================================================================
// Dynamic stuff bit insertion
// Walks through bits[] arrays and inserts complement bits after 5 consecutive
// identical bits. Operates on specified field ranges.
// =============================================================================
CanFrame.prototype._insertDynamicStuffBitsInRange = function(fieldIndices, stopBeforeElemName) {
  // Collect all bits refs in order; track which container each belongs to
  var containers = []; // each: {bits: <reference to bits array>, isData: bool}

  for (var fi = 0; fi < fieldIndices.length; fi++) {
    var field = this.fields[fieldIndices[fi]];
    if (field.dataField) {
      for (var bi = 0; bi < field.dataField.length; bi++) {
        containers.push({ bits: field.dataField[bi].bits, owner: field.dataField[bi] });
      }
    } else if (field.elements) {
      for (var ei = 0; ei < field.elements.length; ei++) {
        var elem = field.elements[ei];
        if (stopBeforeElemName && elem.name === stopBeforeElemName) {
          // Stop before this element
          break;
        }
        if (elem.bits.length > 0) {
          containers.push({ bits: elem.bits, owner: elem });
        }
      }
    }
  }

  // Walk all bits globally, track consecutive count, insert stuff bits
  var consecutiveCount = 1;
  var lastVal = -1;
  var stuffCount = 0;

  for (var ci = 0; ci < containers.length; ci++) {
    var bitsArr = containers[ci].bits;
    var i = 0;
    while (i < bitsArr.length) {
      var bit = bitsArr[i];
      if (bit.isStuffBit) { i++; continue; } // skip existing stuff bits

      if (bit.v === lastVal) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
        lastVal = bit.v;
      }

      if (consecutiveCount === 5) {
        // Insert stuff bit after this position
        var stuffVal = lastVal === 0 ? 1 : 0;
        var stuffBit = {
          v: stuffVal,
          name: STUFF_DYN_NAME,
          isStuffBit: true,
          isStuffBitTypeFixed: false
        };
        bitsArr.splice(i + 1, 0, stuffBit);
        stuffCount++;
        // The stuff bit resets the counter
        consecutiveCount = 1;
        lastVal = stuffVal;
        i += 2; // skip past the stuff bit
        continue;
      }
      i++;
    }
  }

  return stuffCount;
};

// =============================================================================
// Fixed stuff bit insertion for FD
// Insert 1 before SBC, then every 4th CRC-field bit
// =============================================================================
CanFrame.prototype._insertFixedStuffBits_FD = function() {
  var crcFieldIdx = this._fieldIndex("CRC field");
  var field = this.fields[crcFieldIdx];
  var stuffCount = 0;

  // The CRC field elements: SBC, CRC, CRC del
  // We need to insert fixed stuff bits in SBC + CRC region (NOT CRC del)
  // Rule: 1 before SBC, then every 4 CRC-field bits

  // Get the last bit value before the CRC field
  var prevVal = this._getLastBitValueBefore(crcFieldIdx);

  // We work on the SBC and CRC elements only
  var sbcElem = field.elements[0]; // SBC
  var crcElem = field.elements[1]; // CRC

  // Merge SBC + CRC bits into a single working array
  var workBits = [];
  for (var i = 0; i < sbcElem.bits.length; i++) workBits.push(sbcElem.bits[i]);
  for (var j = 0; j < crcElem.bits.length; j++) workBits.push(crcElem.bits[j]);

  // Insert fixed stuff bits
  var result = [];
  var countSinceLastStuff = 0;
  var lastV = prevVal;

  // First: insert 1 fixed stuff bit before the first bit
  var firstStuff = {
    v: lastV === 0 ? 1 : 0,
    name: STUFF_FIX_NAME,
    isStuffBit: true,
    isStuffBitTypeFixed: true
  };
  result.push(firstStuff);
  lastV = firstStuff.v;
  countSinceLastStuff = 0;
  stuffCount++;

  for (var k = 0; k < workBits.length; k++) {
    result.push(workBits[k]);
    countSinceLastStuff++;
    lastV = workBits[k].v;

    if (countSinceLastStuff === 4 && k < workBits.length - 1) {
      // Insert fixed stuff bit
      var fsb = {
        v: lastV === 0 ? 1 : 0,
        name: STUFF_FIX_NAME,
        isStuffBit: true,
        isStuffBitTypeFixed: true
      };
      result.push(fsb);
      lastV = fsb.v;
      countSinceLastStuff = 0;
      stuffCount++;
    }
  }

  // Split result back into SBC and CRC elements
  var sbcNominal = sbcElem.nominalBits;
  var sbcBitsNew = [];
  var crcBitsNew = [];
  var nomCount = 0;
  var inCrc = false;

  for (var m = 0; m < result.length; m++) {
    if (!inCrc) {
      sbcBitsNew.push(result[m]);
      if (!result[m].isStuffBit) {
        nomCount++;
        if (nomCount >= sbcNominal) inCrc = true;
      }
    } else {
      crcBitsNew.push(result[m]);
    }
  }

  sbcElem.bits = sbcBitsNew;
  crcElem.bits = crcBitsNew;

  this.computed.stuffBitCountFixed = stuffCount;
  return stuffCount;
};

// =============================================================================
// Fixed stuff bit insertion for XL
// Every 10 frame bits from DL1 through end of FCRC
// =============================================================================
CanFrame.prototype._insertFixedStuffBits_XL = function() {
  // Find DL1 element and FCRC element
  var ctrlFieldIdx = this._fieldIndex("Control field");
  var dataFieldIdx = this._fieldIndex("Data field");
  var crcFieldIdx  = this._fieldIndex("CRC field");

  // Collect all containers from DL1 (last bit of ADS) through FCRC
  var containers = [];
  var ctrlField = this.fields[ctrlFieldIdx];
  var foundStart = false;

  for (var ei = 0; ei < ctrlField.elements.length; ei++) {
    var elem = ctrlField.elements[ei];
    if (elem.name === "ADS") {
      foundStart = true;
      // DL1 is the last bit of ADS; start fixed stuff counting from there
      var dl1Idx = elem.bits.length - 1;
      containers.push({ bits: elem.bits, owner: elem, startIdx: dl1Idx });
      continue;
    }
    if (foundStart && elem.bits.length > 0) {
      containers.push({ bits: elem.bits, owner: elem, startIdx: 0 });
    }
  }

  // Data field bytes
  if (dataFieldIdx >= 0) {
    var dataField = this.fields[dataFieldIdx];
    if (dataField.dataField) {
      for (var bi = 0; bi < dataField.dataField.length; bi++) {
        containers.push({ bits: dataField.dataField[bi].bits, owner: dataField.dataField[bi] });
      }
    }
  }

  // FCRC element only (not FCP)
  var crcField = this.fields[crcFieldIdx];
  for (var ci = 0; ci < crcField.elements.length; ci++) {
    if (crcField.elements[ci].name === "FCRC") {
      containers.push({ bits: crcField.elements[ci].bits, owner: crcField.elements[ci] });
      break;
    }
  }

  // Walk all bits, count frame bits, insert fixed stuff after every 10th
  var frameBitCount = 0; // counts from DL1 (DL1 is bit 1)
  var stuffCount = 0;

  for (var cIdx = 0; cIdx < containers.length; cIdx++) {
    var bitsArr = containers[cIdx].bits;
    var i = containers[cIdx].startIdx || 0;
    while (i < bitsArr.length) {
      var bit = bitsArr[i];
      if (bit.isStuffBit) { i++; continue; }

      frameBitCount++;

      if (frameBitCount % 10 === 0) {
        // Insert fixed stuff bit after this bit
        var prevV = bitsArr[i].v;
        var fsb = {
          v: prevV === 0 ? 1 : 0,
          name: STUFF_FIX_NAME,
          isStuffBit: true,
          isStuffBitTypeFixed: true
        };
        bitsArr.splice(i + 1, 0, fsb);
        stuffCount++;
        i += 2;
        continue;
      }
      i++;
    }
  }

  this.computed.stuffBitCountFixed = stuffCount;
  return stuffCount;
};

// =============================================================================
// Helper: remove trailing dynamic stuff bit from the last bits[] container
// Returns 1 if a bit was removed, 0 otherwise.
// Used by FD to prevent double stuffing at the SBC boundary.
// =============================================================================
CanFrame.prototype._removeTrailingDynStuffBit = function(fieldIndices) {
  for (var fi = fieldIndices.length - 1; fi >= 0; fi--) {
    var field = this.fields[fieldIndices[fi]];
    if (field.dataField) {
      for (var bi = field.dataField.length - 1; bi >= 0; bi--) {
        var bits = field.dataField[bi].bits;
        if (bits.length > 0) {
          var last = bits[bits.length - 1];
          if (last.isStuffBit && !last.isStuffBitTypeFixed) {
            bits.pop();
            return 1;
          }
          return 0;
        }
      }
    } else if (field.elements) {
      for (var ei = field.elements.length - 1; ei >= 0; ei--) {
        var bits = field.elements[ei].bits;
        if (bits.length > 0) {
          var last = bits[bits.length - 1];
          if (last.isStuffBit && !last.isStuffBitTypeFixed) {
            bits.pop();
            return 1;
          }
          return 0;
        }
      }
    }
  }
  return 0;
};

// =============================================================================
// Helper: get last bit value before a given field index
// =============================================================================
CanFrame.prototype._getLastBitValueBefore = function(fieldIdx) {
  for (var fi = fieldIdx - 1; fi >= 0; fi--) {
    var field = this.fields[fi];
    if (field.dataField) {
      for (var bi = field.dataField.length - 1; bi >= 0; bi--) {
        var bytes = field.dataField[bi].bits;
        if (bytes.length > 0) return bytes[bytes.length - 1].v;
      }
    } else if (field.elements) {
      for (var ei = field.elements.length - 1; ei >= 0; ei--) {
        var bits = field.elements[ei].bits;
        if (bits.length > 0) return bits[bits.length - 1].v;
      }
    }
  }
  return 0;
};

// =============================================================================
// CC Pipeline
// =============================================================================
CanFrame.prototype._buildCC = function() {
  // Step 3: Build nominal bits for SOF, Arb, Control, Data
  var sofIdx = 0;
  var arbIdx = this._fieldIndex("Arbitration field");
  var ctrlIdx = this._fieldIndex("Control field");
  var dataIdx = this._fieldIndex("Data field");
  var indicesToFill = [sofIdx, arbIdx, ctrlIdx];
  if (dataIdx >= 0) indicesToFill.push(dataIdx);
  this._fillNominalBits(indicesToFill);

  // Step 5+6: Compute CRC-15 over unstuffed nominal stream (SOF through Data)
  var crcIndices = [sofIdx, arbIdx, ctrlIdx];
  if (dataIdx >= 0) crcIndices.push(dataIdx);
  var unstuffedBits = this._flattenBits(crcIndices, { excludeStuff: true });
  var bitValues = unstuffedBits.map(function(b) { return b.v; });
  this.debug.crcInputBitStream = bitValues;
  this.computed.crcValue = crc15(bitValues);
  this.debug.crcShiftRegTrace = crc15Trace(bitValues);

  // Step 7: Append CRC, CRC del, ACK, EOF
  var crcFieldIdx = this._fieldIndex("CRC field");
  var ackFieldIdx = this._fieldIndex("ACK") >= 0 ? this._fieldIndex("ACK") : this._fieldIndex("ACK field");
  var eofFieldIdx = this._fieldIndex("EOF");

  // Set CRC value in element
  var crcElem = this.fields[crcFieldIdx].elements[0]; // CRC element
  crcElem.value = this.computed.crcValue;
  this._fillNominalBits([crcFieldIdx, ackFieldIdx, eofFieldIdx]);

  // Step 4: Insert dynamic stuff bits: SOF through end of CRC sequence (not CRC del, ACK, EOF)
  // Single pass from SOF through CRC (stop before CRC del element)
  var stuffIndices = [sofIdx, arbIdx, ctrlIdx];
  if (dataIdx >= 0) stuffIndices.push(dataIdx);
  stuffIndices.push(crcFieldIdx);
  var dynCount = this._insertDynamicStuffBitsInRange(stuffIndices, "CRC del");

  this.computed.stuffBitCountDyn = dynCount;
};

// =============================================================================
// FD Pipeline
// =============================================================================
CanFrame.prototype._buildFD = function() {
  // Step 3: Build nominal bits for SOF, Arb, Control, Data
  // nominal bits are the bits without stuff bits
  var sofIdx = 0;
  var arbIdx = this._fieldIndex("Arbitration field");
  var ctrlIdx = this._fieldIndex("Control field");
  var dataIdx = this._fieldIndex("Data field"); // index or -1 if no data field
  var indicesToFill = [sofIdx, arbIdx, ctrlIdx];
  // if there is a data field at it to list of fields to fill with nominal bits; if not, skip it
  if (dataIdx >= 0) indicesToFill.push(dataIdx);
  this._fillNominalBits(indicesToFill);

  // Step 4: Insert dynamic stuff bits: SOF through end of Data field
  var stuffIndices = [sofIdx, arbIdx, ctrlIdx];
  if (dataIdx >= 0) stuffIndices.push(dataIdx);
  var dynCount = this._insertDynamicStuffBitsInRange(stuffIndices);

  // FD special rule: If preceding 5 bits before SBC were equal, only the
  // fixed stuff bit is inserted (no double stuffing). Remove trailing
  // dynamic stuff bit if one was placed at the very end of the range.
  dynCount -= this._removeTrailingDynStuffBit(stuffIndices);
  this.computed.stuffBitCountDyn = dynCount;

  // Step 5: Compute SBC (4 bits)
  var sbcVal = SBC_FD_TABLE[dynCount % 8];

  // Step 6: Compute CRC
  // The CRC input includes: stuffed stream (SOF through Data with dyn stuff bits) + SBC
  var stuffedBits = this._flattenBits(stuffIndices, { excludeFixed: true });
  var crcInput = stuffedBits.map(function(b) { return b.v; });
  // Append SBC bits
  for (var si = 0; si < sbcVal.length; si++) crcInput.push(sbcVal[si]);

  this.debug.crcInputBitStream = crcInput;

  var dataByteCount = this.computed.dataFieldBytes;
  if (dataByteCount <= 16) {
    this.computed.crcValue = crc17(crcInput);
    this.computed.crcLength = 17;
    this.debug.crcShiftRegTrace = crc17Trace(crcInput);
  } else {
    this.computed.crcValue = crc21(crcInput);
    this.computed.crcLength = 21;
    this.debug.crcShiftRegTrace = crc21Trace(crcInput);
  }

  // Step 7: Fill SBC, CRC, CRC del, ACK, EOF
  var crcFieldIdx = this._fieldIndex("CRC field");
  var ackFieldIdx = this._fieldIndex("ACK") >= 0 ? this._fieldIndex("ACK") : this._fieldIndex("ACK field");
  var eofFieldIdx = this._fieldIndex("EOF");

  var sbcElem = this.fields[crcFieldIdx].elements[0]; // SBC
  var crcElem = this.fields[crcFieldIdx].elements[1]; // CRC
  sbcElem.value = this._sbcBitsToValue(sbcVal);
  crcElem.value = this.computed.crcValue;

  // Manually fill SBC bits
  sbcElem.bits = [];
  for (var i = 0; i < sbcVal.length; i++) {
    sbcElem.bits.push({
      v: sbcVal[i],
      name: sbcElem.bitNamePrefix + String(sbcVal.length - 1 - i),
      isStuffBit: false,
      isStuffBitTypeFixed: false
    });
  }

  // Fill CRC bits
  crcElem.bits = this._generateBitsForElement(crcElem);
  // Fill CRC del, ACK, EOF
  this._fillNominalBits([ackFieldIdx, eofFieldIdx]);
  // CRC del
  var crcDelElem = this.fields[crcFieldIdx].elements[2]; // CRC del
  crcDelElem.bits = this._generateBitsForElement(crcDelElem);

  // Step 8: Insert fixed stuff bits
  this._insertFixedStuffBits_FD();
};

// =============================================================================
// XL Pipeline
// =============================================================================
CanFrame.prototype._buildXL = function() {
  var sofIdx = 0;
  var arbIdx = this._fieldIndex("Arbitration field");
  var ctrlIdx = this._fieldIndex("Control field");
  var dataIdx = this._fieldIndex("Data field");
  var crcFieldIdx = this._fieldIndex("CRC field");
  var ackFieldIdx = this._fieldIndex("ACK field");
  var eofFieldIdx = this._fieldIndex("EOF");

  // Step 3a: Build nominal bits[] for arbitration: SOF, ID[28:18], RRS, IDE, FDF, XLF
  this._fillNominalBits([sofIdx, arbIdx]);

  // Step 4: Insert dynamic stuff bits: SOF through before FDF (max 3)
  // We stuff SOF + arbitration up to but NOT including FDF
  var dynCount = this._insertDynStuffBitsArbXL();
  this.computed.stuffBitCountDyn = dynCount;

  // Step 3b: Build nominal bits[] for control part 1: resXL, ADH, DH1, DH2, DL1, SDT, SEC, DLC
  this._fillNominalBitsCtrlPart1_XL();

  // Step 5: Compute SBC (3 bits)
  var sbcValBits = SBC_XL_TABLE[Math.min(dynCount, 3)];

  // Step 6a: Compute PCRC-13
  // Input: ID[28:18] + RRS + dynamic stuff bits + SDT + SEC + DLC + SBC
  // Excludes: SOF, IDE, FDF, XLF, resXL, ADS (ADH, DH1, DH2, DL1)
  // create BitStream for PCRC calculation
  var pcrcInputBitStream = this._buildPCRCBitStream(sbcValBits);
  this.debug.pcrcInputBitStream = pcrcInputBitStream;
  // Calculate PCRC
  this.computed.pcrcValue = crc13(pcrcInputBitStream);
  this.debug.pcrcShiftRegTrace = crc13Trace(pcrcInputBitStream);

  // SBC and PCRC: Fill Elements with values and bits
  var sbcElem = this._getElement("Control field", "SBC");
  var pcrcElem = this._getElement("Control field", "PCRC");
  sbcElem.value = this._sbcBitsToValue(sbcValBits);
  pcrcElem.value = this.computed.pcrcValue;
  
  sbcElem.bits = [];
  for (var i = 0; i < sbcValBits.length; i++) {
    sbcElem.bits.push({
      v: sbcValBits[i],
      name: sbcElem.bitNamePrefix + String(sbcValBits.length - 1 - i),
      isStuffBit: false,
      isStuffBitTypeFixed: false
    });
  }
  pcrcElem.bits = this._generateBitsForElement(pcrcElem);

  // Step 3c: Build nominal bits for control part 2: VCID, AF
  this._fillNominalBitsCtrlPart2_XL();

  // Step 3d: Build nominal bits for data
  if (dataIdx >= 0) this._fillNominalBits([dataIdx]);

  // Step 6b: Compute FCRC-32
  // Input: ID[28:18] + RRS + SDT + SEC + DLC + SBC + PCRC + VCID + AF + Data
  // Excludes: SOF, IDE, FDF, XLF, resXL, ADS, ALL stuff bits
  // create BitStream for FCRC calculation
  var fcrcInputBitStream = this._buildFCRCBitStream();
  this.debug.fcrcInputBitStream = fcrcInputBitStream;
  // Calculate FCRC
  this.computed.fcrcValue = crc32can(fcrcInputBitStream);

  // FCRC and FCP: Fill Elements with values and bits
  var fcrcElem = this._getElement("CRC field", "FCRC");
  var fcpElem  = this._getElement("CRC field", "FCP");
  fcrcElem.value = this.computed.fcrcValue;
  fcrcElem.bits = this._generateBitsForElement(fcrcElem);
  fcpElem.bits = this._generateBitsForElement(fcpElem);

  // Step 8: Insert fixed stuff bits (DL1 through FCRC)
  this._insertFixedStuffBits_XL();

  // Step 9: Build nominalbits for DAS, ACK, EOF
  this._fillNominalBits([ackFieldIdx, eofFieldIdx]);
};

// =============================================================================
// XL-specific: Insert dynamic stuff in arb field (SOF through before FDF)
// =============================================================================
CanFrame.prototype._insertDynStuffBitsArbXL = function() {
  // Collect bit containers for SOF and arb elements up to but NOT including FDF
  // Hint: containers[] is a flat list of pointers to the various bits[] arrays
  //    scattered across fields/elements, making it easy to walk them sequentially.
  var containers = [];

  // SOF
  var sofField = this.fields[0];
  for (var ei = 0; ei < sofField.elements.length; ei++) {
    if (sofField.elements[ei].bits.length > 0) {
      containers.push({ bits: sofField.elements[ei].bits });
    }
  }

  // Arb field: ID[28:18], RRS, IDE — stop before FDF
  var arbIdx = this._fieldIndex("Arbitration field");
  var arbField = this.fields[arbIdx];
  for (var ai = 0; ai < arbField.elements.length; ai++) {
    if (arbField.elements[ai].name === "FDF") break;
    if (arbField.elements[ai].bits.length > 0) {
      containers.push({ bits: arbField.elements[ai].bits });
    }
  }

  // Walk all bits, insert stuff bits
  var consecutiveCount = 1;
  var lastVal = -1;
  var stuffCount = 0;

  for (var ci = 0; ci < containers.length; ci++) {
    var bitsArr = containers[ci].bits;
    var i = 0;
    while (i < bitsArr.length) {
      var bit = bitsArr[i];
      if (bit.isStuffBit) { i++; continue; }

      if (bit.v === lastVal) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
        lastVal = bit.v;
      }
      
      // insert dynamic stuff bit after 5 consecutive bits of same value
      if (consecutiveCount === 5) {
        var stuffVal = lastVal === 0 ? 1 : 0;
        bitsArr.splice(i + 1, 0, {
          v: stuffVal,
          name: STUFF_DYN_NAME,
          isStuffBit: true,
          isStuffBitTypeFixed: false
        });
        stuffCount++;
        consecutiveCount = 1;
        lastVal = stuffVal;
        i += 2;
        continue;
      }
      i++;
    }
  }

  return stuffCount;
};

// =============================================================================
// XL-specific: Fill bits[] (array) for control part 1 (resXL through DLC)
// =============================================================================
CanFrame.prototype._fillNominalBitsCtrlPart1_XL = function() {
  var ctrlIdx = this._fieldIndex("Control field");
  var ctrlField = this.fields[ctrlIdx];
  var part1Names = ["resXL", "ADS", "SDT", "SEC", "DLC"];

  for (var i = 0; i < ctrlField.elements.length; i++) {
    var elem = ctrlField.elements[i];
    if (part1Names.indexOf(elem.name) >= 0 && elem.bits.length === 0) {
      elem.bits = this._generateBitsForElement(elem);
    }
  }
};

// =============================================================================
// XL-specific: Fill bits for control part 2 (VCID, AF)
// =============================================================================
CanFrame.prototype._fillNominalBitsCtrlPart2_XL = function() {
  var ctrlIdx = this._fieldIndex("Control field");
  var ctrlField = this.fields[ctrlIdx];

  for (var i = 0; i < ctrlField.elements.length; i++) {
    var elem = ctrlField.elements[i];
    if ((elem.name === "VCID" || elem.name === "AF") && elem.bits.length === 0) {
      elem.bits = this._generateBitsForElement(elem);
    }
  }
};

// =============================================================================
// XL-specific: Build PCRC input bit stream
// Includes: ID[28:18] + RRS + dynamic stuff bits (before FDF) + SDT + SEC + DLC + SBC
// Excludes: SOF, IDE, FDF, XLF, resXL, ADS, fixed stuff bits
// =============================================================================
CanFrame.prototype._buildPCRCBitStream = function(sbcBitsArr) {
  var bitStream = [];
  var arbIdx = this._fieldIndex("Arbitration field");
  var arbField = this.fields[arbIdx];

  // ID[28:18] + RRS + any dynamic stuff bits between them
  for (var ei = 0; ei < arbField.elements.length; ei++) {
    var elem = arbField.elements[ei];
    if (elem.name === "IDE") break; // Stop before IDE
    for (var bi = 0; bi < elem.bits.length; bi++) {
      var bit = elem.bits[bi];
      // Include data bits and dynamic stuff bits
      if (bit.isStuffBit && bit.isStuffBitTypeFixed) continue; // exclude fixed
      bitStream.push(bit.v);
    }
  }

  // SDT, SEC, DLC
  var ctrlIdx = this._fieldIndex("Control field");
  var ctrlField = this.fields[ctrlIdx];
  var pcrcElems = ["SDT", "SEC", "DLC"];
  for (var ci = 0; ci < ctrlField.elements.length; ci++) {
    var cElem = ctrlField.elements[ci];
    if (pcrcElems.indexOf(cElem.name) >= 0) {
      for (var bj = 0; bj < cElem.bits.length; bj++) {
        if (!cElem.bits[bj].isStuffBit) { // here only fixed stuff bits are possible, so no check for isStuffBitTypeFixed needed
          bitStream.push(cElem.bits[bj].v);
        }
      }
    }
  }

  // SBC
  for (var si = 0; si < sbcBitsArr.length; si++) {
    bitStream.push(sbcBitsArr[si]);
  }

  return bitStream;
};

// =============================================================================
// XL-specific: Build FCRC input bit stream
// Includes: ID[28:18] + RRS + SDT + SEC + DLC + SBC + PCRC + VCID + AF + Data
// Excludes: SOF, IDE, FDF, XLF, resXL, ADS, ALL stuff bits
// =============================================================================
CanFrame.prototype._buildFCRCBitStream = function() {
  var stream = [];
  var arbIdx = this._fieldIndex("Arbitration field");
  var arbField = this.fields[arbIdx];

  // ID[28:18] + RRS only (no stuff bits)
  for (var ei = 0; ei < arbField.elements.length; ei++) {
    var elem = arbField.elements[ei];
    if (elem.name === "IDE") break;
    for (var bi = 0; bi < elem.bits.length; bi++) {
      if (!elem.bits[bi].isStuffBit) stream.push(elem.bits[bi].v);
    }
  }

  // Control field: SDT, SEC, DLC, SBC, PCRC, VCID, AF (no stuff bits)
  var ctrlIdx = this._fieldIndex("Control field");
  var ctrlField = this.fields[ctrlIdx];
  var fcrcCtrlElems = ["SDT", "SEC", "DLC", "SBC", "PCRC", "VCID", "AF"];
  for (var ci = 0; ci < ctrlField.elements.length; ci++) {
    var cElem = ctrlField.elements[ci];
    if (fcrcCtrlElems.indexOf(cElem.name) >= 0) {
      for (var bj = 0; bj < cElem.bits.length; bj++) {
        if (!cElem.bits[bj].isStuffBit) stream.push(cElem.bits[bj].v);
      }
    }
  }

  // Data field (no stuff bits)
  var dataIdx = this._fieldIndex("Data field");
  if (dataIdx >= 0) {
    var dataField = this.fields[dataIdx];
    if (dataField.dataField) {
      for (var di = 0; di < dataField.dataField.length; di++) {
        var byteElem = dataField.dataField[di];
        for (var dk = 0; dk < byteElem.bits.length; dk++) {
          if (!byteElem.bits[dk].isStuffBit) stream.push(byteElem.bits[dk].v);
        }
      }
    }
  }

  return stream;
};

// =============================================================================
// Helper: Remove all dynamic stuff bits from specified field indices
// =============================================================================
CanFrame.prototype._removeAllDynStuffBits = function(fieldIndices) {
  for (var fi = 0; fi < fieldIndices.length; fi++) {
    var field = this.fields[fieldIndices[fi]];
    if (field.dataField) {
      for (var bi = 0; bi < field.dataField.length; bi++) {
        field.dataField[bi].bits = field.dataField[bi].bits.filter(function(b) {
          return !b.isStuffBit || b.isStuffBitTypeFixed;
        });
      }
    } else if (field.elements) {
      for (var ei = 0; ei < field.elements.length; ei++) {
        field.elements[ei].bits = field.elements[ei].bits.filter(function(b) {
          return !b.isStuffBit || b.isStuffBitTypeFixed;
        });
      }
    }
  }
};

// =============================================================================
// Helper: Convert SBC bits array to integer value
// =============================================================================
CanFrame.prototype._sbcBitsToValue = function(bitsArr) {
  var val = 0;
  for (var i = 0; i < bitsArr.length; i++) {
    val = (val << 1) | bitsArr[i];
  }
  return val;
};

// =============================================================================
// Step 9: Finalize — compute totals, update totalBits per field
// =============================================================================
CanFrame.prototype._finalize = function() {
  var totalBits = 0;
  var dynCount = 0;
  var fixCount = 0;

  for (var fi = 0; fi < this.fields.length; fi++) {
    var field = this.fields[fi];
    var fieldTotal = 0;

    if (field.dataField) {
      for (var bi = 0; bi < field.dataField.length; bi++) {
        var byteElem = field.dataField[bi];
        byteElem.totalBits = byteElem.bits.length;
        fieldTotal += byteElem.bits.length;
        for (var bk = 0; bk < byteElem.bits.length; bk++) {
          if (byteElem.bits[bk].isStuffBit) {
            if (byteElem.bits[bk].isStuffBitTypeFixed) fixCount++;
            else dynCount++;
          }
        }
      }
    } else if (field.elements) {
      for (var ei = 0; ei < field.elements.length; ei++) {
        var elem = field.elements[ei];
        fieldTotal += elem.bits.length;
        for (var ej = 0; ej < elem.bits.length; ej++) {
          if (elem.bits[ej].isStuffBit) {
            if (elem.bits[ej].isStuffBitTypeFixed) fixCount++;
            else dynCount++;
          }
        }
      }
    }

    field.totalBits = fieldTotal;
    totalBits += fieldTotal;
  }

  this.computed.totalBits = totalBits;
  this.computed.stuffBitCountDyn = dynCount;
  this.computed.stuffBitCountFixed = fixCount;
};
