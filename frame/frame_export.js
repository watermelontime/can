// =============================================================================
// frame_export.js — SVG, PNG, CSV download helpers
// =============================================================================
import { DRAW_CFG } from './frame_draw.js';

/**
 * Build the export filename.
 * Pattern: <FRAME_FORMAT_SHORT>_DLC<value>.<ext>
 * e.g. CBFF_DLC8.svg, FEFF_DLC15.png, XBFF_DLC127.csv
 */
function _exportFilename(frame, ext) {
  // Extract short format: CC_CBFF → CBFF, FD_FBFF → FBFF, XL_XBFF → XBFF
  var parts = frame.frameType.split("_");
  var short = parts.length > 1 ? parts.slice(1).join("_") : frame.frameType;
  return short + "_DLC" + frame.input.dlc + "." + ext;
}

// =============================================================================
// SVG download
// =============================================================================
export function exportSVG(frame, svgContainer) {
  var svgElem = svgContainer.querySelector("svg");
  if (!svgElem) { alert("No frame drawn yet."); return; }

  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(svgElem);

  // Ensure XML declaration and namespace
  if (svgString.indexOf("xmlns=") === -1) {
    svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  var blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  _downloadBlob(blob, _exportFilename(frame, "svg"));
}

// =============================================================================
// PNG download
// =============================================================================
export function exportPNG(frame, svgContainer) {
  var svgElem = svgContainer.querySelector("svg");
  if (!svgElem) { alert("No frame drawn yet."); return; }

  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(svgElem);

  var svgWidth  = parseFloat(svgElem.getAttribute("width"));
  var svgHeight = parseFloat(svgElem.getAttribute("height"));

  // Scale factor for higher resolution PNG
  var scale = 2;

  var canvas = document.createElement("canvas");
  canvas.width  = svgWidth  * scale;
  canvas.height = svgHeight * scale;
  var ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  var img = new Image();
  var svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  var url = URL.createObjectURL(svgBlob);

  img.onload = function() {
    // Fill white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, svgWidth, svgHeight);
    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
    URL.revokeObjectURL(url);

    canvas.toBlob(function(blob) {
      _downloadBlob(blob, _exportFilename(frame, "png"));
    }, "image/png");
  };

  img.src = url;
}

// =============================================================================
// CSV download
// =============================================================================
export function exportCSV(frame) {
  var sep = ";";
  var lines = [];
  lines.push("bit_value" + sep + "bit_name" + sep + "element_name" + sep + "field_name");

  for (var fi = 0; fi < frame.fields.length; fi++) {
    var field = frame.fields[fi];

    if (field.dataField) {
      for (var bi = 0; bi < field.dataField.length; bi++) {
        var byteElem = field.dataField[bi];
        for (var bk = 0; bk < byteElem.bits.length; bk++) {
          var bit = byteElem.bits[bk];
          var elemName = bit.isStuffBit ? (bit.isStuffBitTypeFixed ? DRAW_CFG.fixedStuffBitName : DRAW_CFG.dynStuffBitName) : byteElem.name;
          lines.push(bit.v + sep + bit.name + sep + elemName + sep + field.fieldName);
        }
      }
    } else if (field.elements) {
      for (var ei = 0; ei < field.elements.length; ei++) {
        var elem = field.elements[ei];
        for (var ej = 0; ej < elem.bits.length; ej++) {
          var ebit = elem.bits[ej];
          var eName = ebit.isStuffBit ? (ebit.isStuffBitTypeFixed ? DRAW_CFG.fixedStuffBitName : DRAW_CFG.dynStuffBitName) : elem.name;
          lines.push(ebit.v + sep + ebit.name + sep + eName + sep + field.fieldName);
        }
      }
    }
  }

  var csvString = lines.join("\n");
  var blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
  _downloadBlob(blob, _exportFilename(frame, "csv"));
}

// =============================================================================
// VHDL helper: sanitize a name to a valid VHDL identifier
// =============================================================================
function _vhdlId(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, "_");
}

// =============================================================================
// VHDL helper: format value as hex + binary for a given bit width
// Hex: leading zeros to ceil(numBits/4) nibbles
// Binary: padded to numBits, nibble-grouped from LSB side
// =============================================================================
function _vhdlHexBin(value, numBits) {
  var hexNibbles = Math.ceil(numBits / 4);
  var hex = "0x" + value.toString(16).toUpperCase().padStart(hexNibbles, "0");
  var bin = value.toString(2).padStart(numBits, "0");
  // Group from LSB: remainder bits on MSB side, then full nibbles
  var rem = numBits % 4;
  var groups = [];
  if (rem > 0) groups.push(bin.slice(0, rem));
  for (var i = rem; i < bin.length; i += 4) groups.push(bin.slice(i, i + 4));
  return { hex: hex, bin: groups.join(" ") };
}

// =============================================================================
// VHDL helper: collect unique ordered values from bits, with a sanitizer
// =============================================================================
function _collectUniqueOrdered(bits, accessor) {
  var seen = {};
  var list = [];
  for (var i = 0; i < bits.length; i++) {
    var raw = accessor(bits[i]);
    var id  = _vhdlId(raw);
    if (!seen[id]) { seen[id] = true; list.push(id); }
  }
  return list;
}

// =============================================================================
// VHDL download — generates a FRAME_GENERATOR entity + testbench
// =============================================================================
export function exportVHDL(frame) {
  var bti = frame.bitTimeInfo;
  if (!bti || !bti.realBitRatio) { alert("Real Arb/Data bit ratio must be enabled."); return; }

  var arbBitrate  = bti.arbBitrate  || 500;   // kbit/s
  var dataBitrate = bti.dataBitrate || 1000;   // kbit/s
  var arbSP       = bti.arbSP  || 80;         // %
  var dataSP      = bti.dataSP || 70;         // %

  // Bit times in ns
  var arbBitTimeNs  = Math.round(1e6 / arbBitrate);
  var dataBitTimeNs = Math.round(1e6 / dataBitrate);

  // Collect flat bit list with metadata
  var bits = _collectVHDLBits(frame);

  var isCC  = frame.frameType.startsWith("CC_");
  var isFD  = frame.frameType.startsWith("FD_");
  var isXL  = frame.frameType.startsWith("XL_");
  var hasDataPhase = (isFD && frame.input.brs) || isXL;

  // Collect unique enum values (preserving order of first appearance)
  var bitNames  = _collectUniqueOrdered(bits, function(b) { return b.bitName; });
  var elemNames = _collectUniqueOrdered(bits, function(b) { return b.elemName; });
  var fieldNames = _collectUniqueOrdered(bits, function(b) { return b.fieldName; });

  // Add NO_FRAME sentinel
  bitNames.unshift("NO_FRAME");
  elemNames.unshift("NO_FRAME");
  fieldNames.unshift("NO_FRAME");

  // --- Header ---
  var lines = [];
  lines.push("-- =============================================================================");
  lines.push("-- Auto-generated CAN frame VHDL waveform: " + frame.frameType);
  lines.push("-- =============================================================================");
  lines.push("-- Created with Frame Generator on Arthur's CAN Page");
  lines.push("-- Disclaimer: No guarantee for correct behavior. Use on own risk.");
  lines.push("-- =============================================================================");
  lines.push("-- Arbitration: " + String(arbBitrate).padStart(5) + " kbit/s, SP " + String(arbSP).padStart(2) + "%");
  if (hasDataPhase) {
    lines.push("-- Data:        " + String(dataBitrate).padStart(5) + " kbit/s, SP " + String(dataSP).padStart(2) + "%");
  }

  // ID
  var isExt = frame.frameType.indexOf("EFF") !== -1;
  var idBits = isExt ? 29 : 11;
  var idFmt = _vhdlHexBin(frame.input.id, idBits);
  lines.push("-- ID:" + " ".repeat(10 - 3) + idFmt.hex + " = " + idFmt.bin);

  // DLC
  var dlcBits = isXL ? 11 : 4;
  var dlcFmt = _vhdlHexBin(frame.input.dlc, dlcBits);
  lines.push("-- DLC:" + " ".repeat(10 - 4) + dlcFmt.hex + " = " + dlcFmt.bin);

  // BRS (FD only)
  if (isFD) {
    lines.push("-- BRS:" + " ".repeat(10 - 4) + frame.input.brs);
  }

  // XL-specific fields
  if (isXL) {
    lines.push("-- SEC:" + " ".repeat(10 - 4) + frame.input.sec);
    var sdtFmt = _vhdlHexBin(frame.input.sdt, 8);
    lines.push("-- SDT:" + " ".repeat(10 - 4) + sdtFmt.hex + " = " + sdtFmt.bin);
    var vcidFmt = _vhdlHexBin(frame.input.vcid, 8);
    lines.push("-- VCID:" + " ".repeat(10 - 5) + vcidFmt.hex + " = " + vcidFmt.bin);
    var afFmt = _vhdlHexBin(frame.input.af, 32);
    lines.push("-- AF:" + " ".repeat(10 - 3) + afFmt.hex + " = " + afFmt.bin);
  }

  // Data
  var isRTR = frame.frameType.endsWith("_RTR");
  if (!isRTR && frame.input.data && frame.input.data.length > 0) {
    var dataStr = frame.input.data.map(function(b) {
      return ("0" + b.toString(16).toUpperCase()).slice(-2);
    }).join(" ");
    lines.push("-- Data:" + " ".repeat(10 - 5) + dataStr);
  }

  // ACK slot
  lines.push("-- ACK slot:" + " ".repeat(10 - 9) + frame.input.ackSlot);

  lines.push("-- =============================================================================");
  lines.push("");
  lines.push("library ieee;");
  lines.push("use ieee.std_logic_1164.all;");
  lines.push("");

  // Type declarations (package-style, declared before entity)
  lines.push("package FRAME_TYPES is");
  lines.push("  type t_bit_name is (" + bitNames.join(", ") + ");");
  lines.push("  type t_element_name is (" + elemNames.join(", ") + ");");
  lines.push("  type t_field_name is (" + fieldNames.join(", ") + ");");
  lines.push("end package FRAME_TYPES;");
  lines.push("");
  lines.push("library ieee;");
  lines.push("use ieee.std_logic_1164.all;");
  lines.push("use work.FRAME_TYPES.all;");
  lines.push("");

  lines.push("entity FRAME_GENERATOR is");
  lines.push("  generic (");
  lines.push("    ARB_BITRATE_KBPS  : integer := " + arbBitrate + ";");
  lines.push("    DATA_BITRATE_KBPS : integer := " + dataBitrate + ";");
  lines.push("    ARB_SP_PERCENT    : integer := " + arbSP + ";");
  lines.push("    DATA_SP_PERCENT   : integer := " + dataSP);
  lines.push("  );");
  lines.push("  port (");
  lines.push("    CAN_TX              : out std_logic;");
  lines.push("    CAN_TX_BIT_NAME     : out t_bit_name;");
  lines.push("    CAN_TX_ELEMENT_NAME : out t_element_name;");
  lines.push("    CAN_TX_FIELD_NAME   : out t_field_name");
  lines.push("  );");
  lines.push("end entity FRAME_GENERATOR;");
  lines.push("");
  lines.push("architecture BEH of FRAME_GENERATOR is");
  lines.push("  constant ARB_BIT_TIME  : time := (1 ms) / ARB_BITRATE_KBPS;");
  lines.push("  constant DATA_BIT_TIME : time := (1 ms) / DATA_BITRATE_KBPS;");
  lines.push("begin");
  lines.push("  P_FRAME : process");
  lines.push("  begin");

  // Recessive time before SOF
  lines.push("    -- Wait before frame is transmitted");
  lines.push("    CAN_TX              <= '1'; -- recessive");
  lines.push("    CAN_TX_BIT_NAME     <= NO_FRAME;");
  lines.push("    CAN_TX_ELEMENT_NAME <= NO_FRAME;");
  lines.push("    CAN_TX_FIELD_NAME   <= NO_FRAME;");
  lines.push("    -- Configure: 2 arbitration bit times recessive: time to configure CAN Module before first edge");
  lines.push("    wait for 2 * ARB_BIT_TIME;");
  lines.push("");
  lines.push("    -- Bus idle: 11 arbitration bit times recessive, gives CAN module time to perform bus integration");
  lines.push("    wait for 11 * ARB_BIT_TIME;");
  lines.push("");
  lines.push("    -- START FRAME TRANSMISSION");

  // Determine data phase range
  var dataRange = _findVHDLDataPhaseRange(bits, bti);
  var isXL = bti.firstDataPhaseBit === "DH1";

  var prevElem = "";
  var prevField = "";

  for (var i = 0; i < bits.length; i++) {
    var b = bits[i];
    var inDataPhase = dataRange.found && i >= dataRange.start && i <= dataRange.end;
    var bitTime;

    // Helper signal assignments
    var helpLines = [];
    helpLines.push("    CAN_TX_BIT_NAME     <= " + _vhdlId(b.bitName) + ";");
    if (b.elemName !== prevElem) {
      helpLines.push("    CAN_TX_ELEMENT_NAME <= " + _vhdlId(b.elemName) + ";");
      prevElem = b.elemName;
    }
    if (b.fieldName !== prevField) {
      helpLines.push("    CAN_TX_FIELD_NAME   <= " + _vhdlId(b.fieldName) + ";");
      prevField = b.fieldName;
    }

    // Determine bit timing
    var waitLines = [];
    var commentSuffix = "";

    if (!dataRange.found) {
      // CC or FD without BRS: all arbitration
      waitLines.push("    wait for ARB_BIT_TIME;");
    } else if (isXL) {
      // XL: transition at bit boundary, data phase bits fully data
      waitLines.push("    wait for " + (inDataPhase ? "DATA_BIT_TIME" : "ARB_BIT_TIME") + ";");
    } else if (i === dataRange.start) {
      // FD: first transition bit (arb->data), split at SP
      commentSuffix = " (arb->data transition)";
      waitLines.push("    wait for (ARB_BIT_TIME * ARB_SP_PERCENT) / 100;");
      waitLines.push("    wait for (DATA_BIT_TIME * (100 - DATA_SP_PERCENT)) / 100;");
    } else if (i === dataRange.end) {
      // FD: last transition bit (data->arb), split at SP
      commentSuffix = " (data->arb transition)";
      waitLines.push("    wait for (DATA_BIT_TIME * DATA_SP_PERCENT) / 100;");
      waitLines.push("    wait for (ARB_BIT_TIME * (100 - ARB_SP_PERCENT)) / 100;");
    } else {
      // FD non-transition bits
      waitLines.push("    wait for " + (inDataPhase ? "DATA_BIT_TIME" : "ARB_BIT_TIME") + ";");
    }

    // Emit VHDL lines
    lines.push("    CAN_TX              <= '" + b.value + "'; -- " + b.fieldName + " / " + b.elemName + " / " + b.bitName + commentSuffix);
    for (var h = 0; h < helpLines.length; h++) lines.push(helpLines[h]);
    for (var w = 0; w < waitLines.length; w++) lines.push(waitLines[w]);
  }

  lines.push("    -- END FRAME TRANSMISSION");
  lines.push("");
  lines.push("    -- End: hold recessive");
  lines.push("    CAN_TX              <= '1';");
  lines.push("    CAN_TX_BIT_NAME     <= NO_FRAME;");
  lines.push("    CAN_TX_ELEMENT_NAME <= NO_FRAME;");
  lines.push("    CAN_TX_FIELD_NAME   <= NO_FRAME;");
  lines.push("    wait;");
  lines.push("  end process P_FRAME;");
  lines.push("end architecture BEH;");

  // Testbench
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- Testbench");
  lines.push("-- =============================================================================");
  lines.push("library ieee;");
  lines.push("use ieee.std_logic_1164.all;");
  lines.push("use work.FRAME_TYPES.all;");
  lines.push("");
  lines.push("entity FRAME_GENERATOR_TB is");
  lines.push("end entity FRAME_GENERATOR_TB;");
  lines.push("");
  lines.push("architecture TB of FRAME_GENERATOR_TB is");
  lines.push("  signal CAN_TX             : std_logic;");
  lines.push("  signal CAN_TX_BIT_NAME    : t_bit_name;");
  lines.push("  signal CAN_TX_ELEMENT_NAME : t_element_name;");
  lines.push("  signal CAN_TX_FIELD_NAME  : t_field_name;");
  lines.push("begin");
  lines.push("  DUT : entity work.FRAME_GENERATOR");
  lines.push("    port map (");
  lines.push("      CAN_TX             => CAN_TX,");
  lines.push("      CAN_TX_BIT_NAME    => CAN_TX_BIT_NAME,");
  lines.push("      CAN_TX_ELEMENT_NAME => CAN_TX_ELEMENT_NAME,");
  lines.push("      CAN_TX_FIELD_NAME  => CAN_TX_FIELD_NAME");
  lines.push("    );");
  lines.push("end architecture TB;");

  var vhdlString = lines.join("\n");
  var blob = new Blob([vhdlString], { type: "text/plain;charset=utf-8" });
  _downloadBlob(blob, _exportFilename(frame, "vhd"));
}

// Helper: collect flat bit list for VHDL export
function _collectVHDLBits(frame) {
  var bits = [];
  for (var fi = 0; fi < frame.fields.length; fi++) {
    var field = frame.fields[fi];
    if (field.dataField) {
      for (var bi = 0; bi < field.dataField.length; bi++) {
        var byteElem = field.dataField[bi];
        for (var bk = 0; bk < byteElem.bits.length; bk++) {
          var bit = byteElem.bits[bk];
          bits.push({
            value:     bit.v,
            bitName:   bit.name,
            elemName:  byteElem.name,
            fieldName: field.fieldName
          });
        }
      }
    } else if (field.elements) {
      for (var ei = 0; ei < field.elements.length; ei++) {
        var elem = field.elements[ei];
        for (var ej = 0; ej < elem.bits.length; ej++) {
          var ebit = elem.bits[ej];
          bits.push({
            value:     ebit.v,
            bitName:   ebit.name,
            elemName:  elem.name,
            fieldName: field.fieldName
          });
        }
      }
    }
  }
  return bits;
}

// Helper: find data phase range by bit names (mirrors _findDataPhaseRange from frame_draw.js)
function _findVHDLDataPhaseRange(bits, bitTimeInfo) {
  if (!bitTimeInfo || !bitTimeInfo.dataPhasePresent) {
    return { found: false, start: -1, end: -1 };
  }
  var start = -1, end = -1;
  for (var i = 0; i < bits.length; i++) {
    if (bits[i].bitName === bitTimeInfo.firstDataPhaseBit) { start = i; break; }
  }
  for (var j = bits.length - 1; j >= 0; j--) {
    if (bits[j].bitName === bitTimeInfo.lastDataPhaseBit) { end = j; break; }
  }
  if (start < 0 || end < 0 || start > end) return { found: false, start: -1, end: -1 };
  return { found: true, start: start, end: end };
}

// =============================================================================
// Generic blob download helper
// =============================================================================
function _downloadBlob(blob, filename) {
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
