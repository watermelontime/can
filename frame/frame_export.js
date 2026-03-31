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

  var lines = [];
  lines.push("-- =============================================================================");
  lines.push("-- Auto-generated CAN frame VHDL waveform: " + frame.frameType);
  lines.push("-- Arbitration: " + arbBitrate + " kbit/s, SP " + arbSP + "%");
  lines.push("-- Data:        " + dataBitrate + " kbit/s, SP " + dataSP + "%");
  lines.push("-- =============================================================================");
  lines.push("");
  lines.push("library ieee;");
  lines.push("use ieee.std_logic_1164.all;");
  lines.push("");
  lines.push("entity FRAME_GENERATOR is");
  lines.push("  generic (");
  lines.push("    ARB_BITRATE_KBPS : integer := " + arbBitrate + ";");
  lines.push("    DATA_BITRATE_KBPS : integer := " + dataBitrate + ";");
  lines.push("    ARB_SP_PCT : integer := " + arbSP + ";");
  lines.push("    DATA_SP_PCT : integer := " + dataSP);
  lines.push("  );");
  lines.push("  port (");
  lines.push("    CAN_TX : out std_logic");
  lines.push("  );");
  lines.push("end entity FRAME_GENERATOR;");
  lines.push("");
  lines.push("architecture BEH of FRAME_GENERATOR is");
  lines.push("  constant ARB_BIT_TIME : time := " + arbBitTimeNs + " ns;");
  lines.push("  constant DATA_BIT_TIME : time := " + dataBitTimeNs + " ns;");
  lines.push("begin");
  lines.push("  P_FRAME : process");
  lines.push("  begin");

  // 15 arbitration bit times of recessive before SOF
  lines.push("    -- Bus idle: 15 arbitration bit times recessive");
  lines.push("    CAN_TX <= '1';");
  lines.push("    wait for 15 * ARB_BIT_TIME;");
  lines.push("");

  // Determine data phase range
  var dataRange = _findVHDLDataPhaseRange(bits, bti);
  var isXL = bti.firstDataPhaseBit === "DH1";

  for (var i = 0; i < bits.length; i++) {
    var b = bits[i];
    var inDataPhase = dataRange.found && i >= dataRange.start && i <= dataRange.end;
    var bitTime;

    if (!dataRange.found) {
      // CC: all arbitration
      bitTime = "ARB_BIT_TIME";
    } else if (isXL) {
      // XL: transition at bit boundary, data phase bits fully data
      bitTime = inDataPhase ? "DATA_BIT_TIME" : "ARB_BIT_TIME";
    } else {
      // FD: transition bits split at SP
      if (i === dataRange.start) {
        // First transition bit: arbSP% of arb bit + (1-dataSP)% of data bit
        lines.push("    -- [" + b.fieldName + " / " + b.elemName + "] " + b.bitName + " (arb->data transition)");
        lines.push("    CAN_TX <= '" + b.value + "';");
        lines.push("    wait for (ARB_BIT_TIME * " + arbSP + ") / 100;");
        lines.push("    wait for (DATA_BIT_TIME * " + (100 - dataSP) + ") / 100;");
        continue;
      } else if (i === dataRange.end) {
        // Last transition bit: dataSP% of data bit + (1-arbSP)% of arb bit
        lines.push("    -- [" + b.fieldName + " / " + b.elemName + "] " + b.bitName + " (data->arb transition)");
        lines.push("    CAN_TX <= '" + b.value + "';");
        lines.push("    wait for (DATA_BIT_TIME * " + dataSP + ") / 100;");
        lines.push("    wait for (ARB_BIT_TIME * " + (100 - arbSP) + ") / 100;");
        continue;
      } else {
        bitTime = inDataPhase ? "DATA_BIT_TIME" : "ARB_BIT_TIME";
      }
    }

    lines.push("    -- [" + b.fieldName + " / " + b.elemName + "] " + b.bitName);
    lines.push("    CAN_TX <= '" + b.value + "';");
    lines.push("    wait for " + bitTime + ";");
  }

  lines.push("");
  lines.push("    -- End: hold recessive");
  lines.push("    CAN_TX <= '1';");
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
  lines.push("");
  lines.push("entity FRAME_GENERATOR_TB is");
  lines.push("end entity FRAME_GENERATOR_TB;");
  lines.push("");
  lines.push("architecture TB of FRAME_GENERATOR_TB is");
  lines.push("  signal CAN_TX : std_logic;");
  lines.push("begin");
  lines.push("  DUT : entity work.FRAME_GENERATOR");
  lines.push("    port map (CAN_TX => CAN_TX);");
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
            elemName:  bit.isStuffBit ? (bit.isStuffBitTypeFixed ? DRAW_CFG.fixedStuffBitName : DRAW_CFG.dynStuffBitName) : byteElem.name,
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
            elemName:  ebit.isStuffBit ? (ebit.isStuffBitTypeFixed ? DRAW_CFG.fixedStuffBitName : DRAW_CFG.dynStuffBitName) : elem.name,
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
