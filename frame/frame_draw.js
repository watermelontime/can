// =============================================================================
// frame_draw.js — SVG waveform drawing for CAN frames
// =============================================================================
// Reads myFrame.fields[] hierarchy and renders a digital waveform as SVG.
// =============================================================================

var DRAW_CFG = {
  bitWidth:           30,     // px per bit
  bitHeight:          60,     // px: waveform amplitude (vertical distance low ↔ high)
  lineWidthWaveForm:   3,     // px: waveform stroke width
  lineWidthSeparators: 1,     // px: vertical lines separating bits (also field/element header lines)
  fontSizeBitName:    12,     // px
  fontSizeFieldName:  15,     // px
  fontFamilyBitName:  "sans-serif", // examples: "sans-serif", "monospace", "Arial", "Helvetica", "Verdana"
  fontFamilyFieldName: "sans-serif", // examples: "sans-serif", "monospace", "Arial", "Helvetica", "Verdana"
  gapBitNameToWave:   4,      // px gap (unused when bit names are inside bits)
  gapFieldToWave:     20,     // px between field/element header area and waveform
  gapPhaseToWave:     20,     // px between waveform and phase bar below
  paddingTop:         10,     // px above everything
  paddingBottom:       5,     // px below waveform
  paddingLeft:        10,     // px left margin

  dynStuffBitName:    "stuff_D",  // display name for dynamic stuff bits (SVG + CSV)
  fixedStuffBitName:  "stuff_F",  // display name for fixed stuff bits (SVG + CSV)

  defaultArbDataBitLenRatio: 2.0, // Ratio of Bit Lengths: Arbitration/Data, e.g. 2

  colors: {
    waveFormLine:       "#000000",
    separatorLine:      "#999999",
    background:         "#FFFFFF",
    stuffBitBackground: "#fd821d", // background color for stuff bits
    stuffBitFont:       "#fd821d", // font color for stuff bit names
    sof:               ["#B0BEC5","#CFD8DC"],
    arbitration:       ["#74c0ff","#BBDEFB"],
    control:           ["#89cc8b","#b9ddba"],
    data:              ["#CE93D8","#E1BEE7"],
    crc:               ["#22f8ff","#a1f1fc"], //["#FFCC80","#FFE0B2"],
    ack:               ["#ee7ca2","#F8BBD0"],
    eof:               ["#B0BEC5","#CFD8DC"],
    spMarker:          "#8B0000",  // dark red: SP marker line in FD transition bits
    arbPhase:          "#a1c7f0",  // arbitration phase bar
    dataPhase:         "#e27979"   // data phase bar
  }
};

// =============================================================================
// Main draw function
// =============================================================================
function drawFrame(frame, svgContainer, options) {
  var opts = options || {};
  var arbPhaseBitsLonger = !!opts.arbPhaseBitsLonger;
  var showBitNames   = !!opts.showBitNames;
  var useColor       = !!opts.useColor;
  var useColorStuff  = !!opts.useColorStuff;
  var showFields     = !!opts.showFields;
  var showBitSeparators = !!opts.showBitSeparators;
  var showPhases     = !!opts.showPhases;

  var cfg = DRAW_CFG;

  // --- Flatten all bits for drawing ---
  var drawBits = _collectDrawBits(frame);
  var totalBits = drawBits.length;
  if (totalBits === 0) return;

  // --- Compute per-bit geometry (allows arbitration/data phase scaling) ---
  var bitGeom = _computeBitGeometry(drawBits, frame.bitTimeInfo, cfg, arbPhaseBitsLonger);

  // --- Compute layout dimensions ---
  var fieldHeaderHeight = 0;
  var elemHeaderHeight  = 0;

  var headerArea = 0;

  if (showFields) {
    fieldHeaderHeight = cfg.fontSizeFieldName + 6;  // line 1
    elemHeaderHeight  = cfg.fontSizeFieldName + 6;  // line 2
    headerArea = cfg.gapFieldToWave + fieldHeaderHeight + elemHeaderHeight;
  }

  var waveTop = cfg.paddingTop + headerArea;
  var waveHigh = waveTop;              // recessive (1) = top
  var waveLow  = waveTop + cfg.bitHeight;  // dominant (0) = bottom

  var svgWidth  = cfg.paddingLeft + bitGeom.totalWidth + cfg.paddingLeft;

  // Phase bar area below waveform
  var phaseBarHeight = 0;
  var phaseBarTop = waveLow;
  if (showPhases) {
    phaseBarHeight = cfg.fontSizeFieldName + 6;
    phaseBarTop = waveLow + cfg.gapPhaseToWave;
  }

  var svgHeight = (showPhases ? phaseBarTop + phaseBarHeight : waveLow) + cfg.paddingBottom;

  // --- Create SVG element ---
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("xmlns", ns);
  svg.setAttribute("width",  svgWidth);
  svg.setAttribute("height", svgHeight);
  svg.setAttribute("viewBox", "0 0 " + svgWidth + " " + svgHeight);
  svg.style.background = cfg.colors.background;

  // --- Draw background color rectangles ---
  if (useColor || useColorStuff) {
    for (var bi = 0; bi < drawBits.length; bi++) {
      var db = drawBits[bi];
      var x = bitGeom.starts[bi];
      var color = null;

      if (useColorStuff && db.isStuffBit) {
        color = cfg.colors.stuffBitBackground;
      } else if (useColor) {
        color = _fieldColor(db.fieldName, db.elemIdx);
      }

      if (color) {
        var rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", waveTop);
        rect.setAttribute("width",  bitGeom.widths[bi]);
        rect.setAttribute("height", cfg.bitHeight);
        rect.setAttribute("fill", color);
        rect.setAttribute("opacity", "0.3");
        svg.appendChild(rect);
      }
    }
  }

  // --- Draw field header (line 1: group names) ---
  if (showFields) {
    _drawFieldHeaders(svg, ns, drawBits, cfg, fieldHeaderHeight, bitGeom);
  }

  // --- Draw element header (line 2: element names) ---
  if (showFields) {
    _drawElementHeaders(svg, ns, drawBits, cfg, fieldHeaderHeight, elemHeaderHeight, bitGeom);
  }

  // --- Draw bit separator lines (between background and waveform) ---
  if (showBitSeparators) {
    for (var si = 1; si < drawBits.length; si++) {
      var sx = bitGeom.starts[si];
      var sepLine = document.createElementNS(ns, "line");
      sepLine.setAttribute("x1", sx);
      sepLine.setAttribute("y1", waveTop);
      sepLine.setAttribute("x2", sx);
      sepLine.setAttribute("y2", waveLow);
      sepLine.setAttribute("stroke", cfg.colors.separatorLine);
      sepLine.setAttribute("stroke-width", cfg.lineWidthSeparators);
      svg.appendChild(sepLine);
    }
    // Right edge of last bit
    var lastIdx = drawBits.length - 1;
    var sxEnd = bitGeom.starts[lastIdx] + bitGeom.widths[lastIdx];
    var sepLineEnd = document.createElementNS(ns, "line");
    sepLineEnd.setAttribute("x1", sxEnd);
    sepLineEnd.setAttribute("y1", waveTop);
    sepLineEnd.setAttribute("x2", sxEnd);
    sepLineEnd.setAttribute("y2", waveLow);
    sepLineEnd.setAttribute("stroke", cfg.colors.separatorLine);
    sepLineEnd.setAttribute("stroke-width", cfg.lineWidthSeparators);
    svg.appendChild(sepLineEnd);
  }

  // --- Draw bit names inside the bits (rotated 90°) ---
  if (showBitNames) {
    var bitNameAnchorY = waveLow - cfg.gapBitNameToWave;  // slightly above level-0 (dominant)
    for (var bn = 0; bn < drawBits.length; bn++) {
      var bx = bitGeom.starts[bn] + bitGeom.widths[bn] / 2;
      var text = document.createElementNS(ns, "text");
      text.setAttribute("x", bx);
      text.setAttribute("y", bitNameAnchorY);
      text.setAttribute("font-size", cfg.fontSizeBitName);
      text.setAttribute("font-family", cfg.fontFamilyBitName);
      text.setAttribute("text-anchor", "start");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("transform", "rotate(-90," + bx + "," + bitNameAnchorY + ")");
      if (drawBits[bn].isStuffBit) {
        text.setAttribute("fill", cfg.colors.stuffBitFont);
        text.setAttribute("font-weight", "bold");
      } else {
        text.setAttribute("fill", "#333");
      }
      text.textContent = drawBits[bn].bitName;
      svg.appendChild(text);
    }
  }

  // --- Draw waveform ---
  var pathData = "";
  for (var wi = 0; wi < drawBits.length; wi++) {
    var xStart = bitGeom.starts[wi];
    var xEnd   = xStart + bitGeom.widths[wi];
    var yVal   = drawBits[wi].value === 1 ? waveHigh : waveLow;

    if (wi === 0) {
      // Bus is recessive (high) before frame starts; SOF causes a falling edge
      pathData += "M " + xStart + " " + waveHigh;
      if (yVal !== waveHigh) {
        pathData += " L " + xStart + " " + yVal;
      }
    } else {
      // Vertical transition if value changed
      var prevY = drawBits[wi - 1].value === 1 ? waveHigh : waveLow;
      if (yVal !== prevY) {
        pathData += " L " + xStart + " " + yVal;
      }
    }
    pathData += " L " + xEnd + " " + yVal;
  }

  var pathElem = document.createElementNS(ns, "path");
  pathElem.setAttribute("d", pathData);
  pathElem.setAttribute("stroke", cfg.colors.waveFormLine);
  pathElem.setAttribute("stroke-width", cfg.lineWidthWaveForm);
  pathElem.setAttribute("fill", "none");
  svg.appendChild(pathElem);

  // --- Draw SP markers for real bit ratio transition bits (half height) ---
  if (bitGeom.spMarkers && bitGeom.spMarkers.length > 0) {
    var spMidY = waveTop + cfg.bitHeight / 2;
    for (var mi = 0; mi < bitGeom.spMarkers.length; mi++) {
      var mx = bitGeom.spMarkers[mi].x;
      var spLine = document.createElementNS(ns, "line");
      spLine.setAttribute("x1", mx);
      spLine.setAttribute("y1", spMidY);
      spLine.setAttribute("x2", mx);
      spLine.setAttribute("y2", waveLow);
      spLine.setAttribute("stroke", cfg.colors.spMarker);
      spLine.setAttribute("stroke-width", cfg.lineWidthSeparators);
      spLine.setAttribute("stroke-dasharray", "4,2");
      svg.appendChild(spLine);
    }
  }

  // --- Draw phase bars below waveform ---
  if (showPhases && bitGeom.totalWidth > 0) {
    _drawPhaseBars(svg, ns, drawBits, frame.bitTimeInfo, cfg, bitGeom, phaseBarTop, phaseBarHeight);
  }

  // --- Insert SVG into container ---
  svgContainer.innerHTML = "";
  svgContainer.appendChild(svg);
}

// =============================================================================
// Draw phase bars below the waveform (arbitration phase / data phase)
// =============================================================================
function _drawPhaseBars(svg, ns, drawBits, bitTimeInfo, cfg, bitGeom, barTop, barHeight) {
  var dataRange = _findDataPhaseRange(drawBits, bitTimeInfo);
  var isXL = bitTimeInfo && bitTimeInfo.firstDataPhaseBit === "DH1";
  var isFDReal = bitTimeInfo && bitTimeInfo.realBitRatio && dataRange.found && !isXL;

  // Build pixel-based segments: { x, w, label }
  var segments = [];

  if (isFDReal && bitGeom.spMarkers && bitGeom.spMarkers.length >= 2) {
    // FD with real bit ratio: data phase starts/ends at SP markers
    var spStart = bitGeom.spMarkers[0].x;  // SP of first transition bit
    var spEnd   = bitGeom.spMarkers[1].x;  // SP of last transition bit
    var totalStart = bitGeom.starts[0];
    var lastBit = drawBits.length - 1;
    var totalEnd = bitGeom.starts[lastBit] + bitGeom.widths[lastBit];

    // Arb phase before SP of first transition bit
    if (spStart > totalStart) {
      segments.push({ x: totalStart, w: spStart - totalStart, label: "Arbitration phase" });
    }
    // Data phase between the two SP markers
    if (spEnd > spStart) {
      segments.push({ x: spStart, w: spEnd - spStart, label: "Data phase" });
    }
    // Arb phase after SP of last transition bit
    if (totalEnd > spEnd) {
      segments.push({ x: spEnd, w: totalEnd - spEnd, label: "Arbitration phase" });
    }
  } else if (dataRange.found) {
    var totalStart = bitGeom.starts[0];
    var lastBitIdx = drawBits.length - 1;
    var totalEnd = bitGeom.starts[lastBitIdx] + bitGeom.widths[lastBitIdx];
    var dataStart, dataEnd;

    if (isXL) {
      // XL: data phase from beginning of first to end of last data phase bit
      dataStart = bitGeom.starts[dataRange.start];
      dataEnd   = bitGeom.starts[dataRange.end] + bitGeom.widths[dataRange.end];
    } else {
      // Non-real-ratio FD/CC: data phase from middle of first to middle of last data phase bit
      dataStart = bitGeom.starts[dataRange.start] + bitGeom.widths[dataRange.start] / 2;
      dataEnd   = bitGeom.starts[dataRange.end]   + bitGeom.widths[dataRange.end]   / 2;
    }

    if (dataStart > totalStart) {
      segments.push({ x: totalStart, w: dataStart - totalStart, label: "Arbitration phase" });
    }
    if (dataEnd > dataStart) {
      segments.push({ x: dataStart, w: dataEnd - dataStart, label: "Data phase" });
    }
    if (totalEnd > dataEnd) {
      segments.push({ x: dataEnd, w: totalEnd - dataEnd, label: "Arbitration phase" });
    }
  } else {
    // No data phase (CC): entire frame is arbitration
    var totalW = bitGeom.totalWidth;
    segments.push({ x: bitGeom.starts[0], w: totalW, label: "Arbitration phase" });
  }

  var midY = barTop + barHeight / 2;

  for (var si = 0; si < segments.length; si++) {
    var seg = segments[si];
    var color = seg.label === "Data phase" ? cfg.colors.dataPhase : cfg.colors.arbPhase;

    // Background bar
    var rect = document.createElementNS(ns, "rect");
    rect.setAttribute("x", seg.x);
    rect.setAttribute("y", barTop);
    rect.setAttribute("width", seg.w);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", color);
    rect.setAttribute("opacity", "0.5");
    svg.appendChild(rect);

    // Left separator
    var line = document.createElementNS(ns, "line");
    line.setAttribute("x1", seg.x);
    line.setAttribute("y1", barTop);
    line.setAttribute("x2", seg.x);
    line.setAttribute("y2", barTop + barHeight);
    line.setAttribute("stroke", cfg.colors.separatorLine);
    line.setAttribute("stroke-width", cfg.lineWidthSeparators);
    svg.appendChild(line);

    // Label text
    var text = document.createElementNS(ns, "text");
    text.setAttribute("x", seg.x + seg.w / 2);
    text.setAttribute("y", midY);
    text.setAttribute("font-size", cfg.fontSizeFieldName);
    text.setAttribute("font-family", cfg.fontFamilyFieldName);
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("fill", "#333");

    var displayName = seg.label;
    var maxChars = Math.floor(seg.w / (cfg.fontSizeFieldName * 0.5));
    if (displayName.length > maxChars && maxChars > 2) {
      displayName = displayName.substring(0, maxChars - 1) + "\u2026";
    }
    text.textContent = displayName;
    svg.appendChild(text);
  }

  // Right-edge line
  if (segments.length > 0) {
    var lastSeg = segments[segments.length - 1];
    var xEnd = lastSeg.x + lastSeg.w;
    var lineEnd = document.createElementNS(ns, "line");
    lineEnd.setAttribute("x1", xEnd);
    lineEnd.setAttribute("y1", barTop);
    lineEnd.setAttribute("x2", xEnd);
    lineEnd.setAttribute("y2", barTop + barHeight);
    lineEnd.setAttribute("stroke", cfg.colors.separatorLine);
    lineEnd.setAttribute("stroke-width", cfg.lineWidthSeparators);
    svg.appendChild(lineEnd);
  }
}

// =============================================================================
// Collect flat array of draw bits from frame.fields[]
// =============================================================================
function _collectDrawBits(frame) {
  var bits = [];
  for (var fi = 0; fi < frame.fields.length; fi++) {
    var field = frame.fields[fi];
    if (field.dataField) {
      for (var bi = 0; bi < field.dataField.length; bi++) {
        var byteElem = field.dataField[bi];
        for (var bk = 0; bk < byteElem.bits.length; bk++) {
          var bit = byteElem.bits[bk];
          bits.push({
            value:       bit.v,
            bitName:     bit.name,
            isStuffBit:  bit.isStuffBit,
            elemName:    byteElem.name,
            elemIdx:     bi,
            printName:   byteElem.printNameInFieldsBar !== false,
            fieldName:   field.fieldName
          });
        }
      }
    } else if (field.elements) {
      for (var ei = 0; ei < field.elements.length; ei++) {
        var elem = field.elements[ei];
        for (var ej = 0; ej < elem.bits.length; ej++) {
          var ebit = elem.bits[ej];
          bits.push({
            value:       ebit.v,
            bitName:     ebit.name,
            isStuffBit:  ebit.isStuffBit,
            elemName:    elem.name,
            elemIdx:     ei,
            printName:   elem.printNameInFieldsBar !== false,
            fieldName:   field.fieldName
          });
        }
      }
    }
  }
  return bits;
}

// =============================================================================
// Compute variable geometry for all bits.
// Arbitration bits can be stretched relative to data-phase bits.
// =============================================================================
function _computeBitGeometry(drawBits, bitTimeInfo, cfg, arbPhaseBitsLonger) {
  var ratio = cfg.defaultArbDataBitLenRatio;
  var widths = [];
  var starts = [];
  var totalWidth = 0;
  var dataRange = _findDataPhaseRange(drawBits, bitTimeInfo);

  // Real bit ratio mode: widths proportional to real bit times
  if (bitTimeInfo && bitTimeInfo.realBitRatio) {
    var arbDataRatio = bitTimeInfo.realArbDataBitLenRatio || 1.0; // data_bitrate / arb_bitrate = arb_bit_time / data_bit_time
    var dataBitWidth = cfg.bitWidth;                               // data phase bits always use bitWidth
    var arbBitWidth  = cfg.bitWidth * arbDataRatio;                // only arb phase bit length changes
    var arbSP  = (bitTimeInfo.arbSP  || 80) / 100;
    var dataSP = (bitTimeInfo.dataSP || 70) / 100;
    var isXL = bitTimeInfo.firstDataPhaseBit === "DH1"; // XL: transition at bit boundary
    var isFD = dataRange.found && !isXL;
    var spMarkers = []; // { x: pixel_x } for vertical SP separators

    for (var i = 0; i < drawBits.length; i++) {
      var isDataBit = dataRange.found && i >= dataRange.start && i <= dataRange.end;
      var width;

      if (isFD && i === dataRange.start) {
        // First transition bit (arb→data): arbSP% of arb bit + (1-dataSP)% of data bit
        var part1 = arbSP * arbBitWidth;
        var part2 = (1 - dataSP) * dataBitWidth;
        width = part1 + part2;
        spMarkers.push({ x: cfg.paddingLeft + totalWidth + part1 });
      } else if (isFD && i === dataRange.end) {
        // Last transition bit (data→arb): dataSP% of data bit + (1-arbSP)% of arb bit
        var part1d = dataSP * dataBitWidth;
        var part2d = (1 - arbSP) * arbBitWidth;
        width = part1d + part2d;
        spMarkers.push({ x: cfg.paddingLeft + totalWidth + part1d });
      } else if (isDataBit) {
        width = dataBitWidth;
      } else {
        width = arbBitWidth;
      }

      widths.push(width);
      starts.push(cfg.paddingLeft + totalWidth);
      totalWidth += width;
    }

    return {
      widths: widths,
      starts: starts,
      totalWidth: totalWidth,
      spMarkers: spMarkers
    };
  }

  // Default mode: simple arb-bits-longer scaling
  for (var i = 0; i < drawBits.length; i++) {
    var isDataBit = dataRange.found && i >= dataRange.start && i <= dataRange.end;
    var width = cfg.bitWidth;
    if (arbPhaseBitsLonger && !isDataBit) {
      width = cfg.bitWidth * ratio;
    }

    widths.push(width);
    starts.push(cfg.paddingLeft + totalWidth);
    totalWidth += width;
  }

  return {
    widths: widths,
    starts: starts,
    totalWidth: totalWidth,
    spMarkers: []
  };
}

// =============================================================================
// Find data-phase start/end indices from bit names provided in bitTimeInfo.
// =============================================================================
function _findDataPhaseRange(drawBits, bitTimeInfo) {
  if (!bitTimeInfo || !bitTimeInfo.dataPhasePresent) {
    return { found: false, start: -1, end: -1 };
  }

  var firstName = bitTimeInfo.firstDataPhaseBit;
  var lastName = bitTimeInfo.lastDataPhaseBit;
  var start = -1;
  var end = -1;

  for (var i = 0; i < drawBits.length; i++) {
    if (drawBits[i].bitName === firstName) {
      start = i;
      break;
    }
  }

  for (var j = drawBits.length - 1; j >= 0; j--) {
    if (drawBits[j].bitName === lastName) {
      end = j;
      break;
    }
  }

  if (start < 0 || end < 0 || start > end) {
    return { found: false, start: -1, end: -1 };
  }

  return { found: true, start: start, end: end };
}

function _spanPixelWidth(bitGeom, spanStart, spanCount) {
  var width = 0;
  for (var i = spanStart; i < spanStart + spanCount; i++) {
    width += bitGeom.widths[i];
  }
  return width;
}

// =============================================================================
// Draw field header (line 1): group name spans
// =============================================================================
function _drawFieldHeaders(svg, ns, drawBits, cfg, lineHeight, bitGeom) {
  var y = cfg.paddingTop + lineHeight / 2;
  var spans = _computeMergedSpans(drawBits, "fieldName");

  for (var si = 0; si < spans.length; si++) {
    var span = spans[si];

    var x = bitGeom.starts[span.start];
    var w = _spanPixelWidth(bitGeom, span.start, span.count);

    // Background bar
    var color = _fieldColor(span.label, 0);
    if (color) {
      var rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", cfg.paddingTop);
      rect.setAttribute("width", w);
      rect.setAttribute("height", lineHeight);
      rect.setAttribute("fill", color);
      rect.setAttribute("opacity", "0.5");
      svg.appendChild(rect);
    }

    // Separator line (left edge of each span, including the first)
    var line = document.createElementNS(ns, "line");
    line.setAttribute("x1", x);
    line.setAttribute("y1", cfg.paddingTop);
    line.setAttribute("x2", x);
    line.setAttribute("y2", cfg.paddingTop + lineHeight);
    line.setAttribute("stroke", cfg.colors.separatorLine);
    line.setAttribute("stroke-width", cfg.lineWidthSeparators);
    svg.appendChild(line);

    // Text
    var text = document.createElementNS(ns, "text");
    text.setAttribute("x", x + w / 2);
    text.setAttribute("y", y);
    text.setAttribute("font-size", cfg.fontSizeFieldName);
    text.setAttribute("font-family", cfg.fontFamilyFieldName);
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("fill", "#333");
    text.textContent = span.label;
    svg.appendChild(text);
  }

  // Right-edge line after the last span
  if (spans.length > 0) {
    var last = spans[spans.length - 1];
    var xEnd = bitGeom.starts[last.start] + _spanPixelWidth(bitGeom, last.start, last.count);
    var lineEnd = document.createElementNS(ns, "line");
    lineEnd.setAttribute("x1", xEnd);
    lineEnd.setAttribute("y1", cfg.paddingTop);
    lineEnd.setAttribute("x2", xEnd);
    lineEnd.setAttribute("y2", cfg.paddingTop + lineHeight);
    lineEnd.setAttribute("stroke", cfg.colors.separatorLine);
    lineEnd.setAttribute("stroke-width", cfg.lineWidthSeparators);
    svg.appendChild(lineEnd);
  }
}

// =============================================================================
// Draw element header (line 2): element name spans
// =============================================================================
function _drawElementHeaders(svg, ns, drawBits, cfg, line1Height, line2Height, bitGeom) {
  var yTop = cfg.paddingTop + line1Height;
  var y = yTop + line2Height / 2;
  var spans = _computeMergedSpans(drawBits, "elemName");

  for (var si = 0; si < spans.length; si++) {
    var span = spans[si];

    var x = bitGeom.starts[span.start];
    var w = _spanPixelWidth(bitGeom, span.start, span.count);

    // Separator line (left edge of each span, including the first)
    var line = document.createElementNS(ns, "line");
    line.setAttribute("x1", x);
    line.setAttribute("y1", yTop);
    line.setAttribute("x2", x);
    line.setAttribute("y2", yTop + line2Height);
    line.setAttribute("stroke", "#ccc");
    line.setAttribute("stroke-width", cfg.lineWidthSeparators);
    svg.appendChild(line);

    // Skip text if printName is false for this span
    if (span.printName === false) continue;

    // Only draw text if there's enough room (span at least 2 bits wide or text fits)
    var text = document.createElementNS(ns, "text");
    text.setAttribute("x", x + w / 2);
    text.setAttribute("y", y);
    text.setAttribute("font-size", cfg.fontSizeFieldName - 1);
    text.setAttribute("font-family", cfg.fontFamilyFieldName);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("fill", "#555");

    // Truncate long names
    var displayName = span.label;
    var maxChars = Math.floor(w / (cfg.fontSizeFieldName * 0.5));
    if (displayName.length > maxChars && maxChars > 2) {
      displayName = displayName.substring(0, maxChars - 1) + "…";
    }
    text.textContent = displayName;
    svg.appendChild(text);
  }

  // Right-edge line after the last span
  if (spans.length > 0) {
    var last = spans[spans.length - 1];
    var xEnd = bitGeom.starts[last.start] + _spanPixelWidth(bitGeom, last.start, last.count);
    var lineEnd = document.createElementNS(ns, "line");
    lineEnd.setAttribute("x1", xEnd);
    lineEnd.setAttribute("y1", yTop);
    lineEnd.setAttribute("x2", xEnd);
    lineEnd.setAttribute("y2", yTop + line2Height);
    lineEnd.setAttribute("stroke", "#ccc");
    lineEnd.setAttribute("stroke-width", cfg.lineWidthSeparators);
    svg.appendChild(lineEnd);
  }
}

// =============================================================================
// Compute consecutive spans of a given property from drawBits
// =============================================================================
function _computeSpans(drawBits, propName) {
  var spans = [];
  if (drawBits.length === 0) return spans;

  var current = drawBits[0][propName];
  var start = 0;
  var count = 1;

  for (var i = 1; i < drawBits.length; i++) {
    if (drawBits[i][propName] === current) {
      count++;
    } else {
      spans.push({ label: current, start: start, count: count });
      current = drawBits[i][propName];
      start = i;
      count = 1;
    }
  }
  spans.push({ label: current, start: start, count: count });
  return spans;
}

// =============================================================================
// Compute merged spans: stuff bits inherit the label from surrounding non-stuff
// bits so they don't break field/element name spans.
// =============================================================================
function _computeMergedSpans(drawBits, propName) {
  var spans = [];
  if (drawBits.length === 0) return spans;

  // Build effective labels: each bit uses its own field/element assignment
  var labels = [];
  var printNames = [];
  var elemIdxs = [];
  var fieldNames = [];
  for (var i = 0; i < drawBits.length; i++) {
    labels.push(drawBits[i][propName]);
    printNames.push(drawBits[i].printName !== false);
    elemIdxs.push(drawBits[i].elemIdx || 0);
    fieldNames.push(drawBits[i].fieldName || "");
  }

  // Compute spans from effective labels
  var current = labels[0];
  var currentPrintName = printNames[0];
  var currentElemIdx = elemIdxs[0];
  var currentFieldName = fieldNames[0];
  var start = 0;
  var count = 1;
  for (var i = 1; i < labels.length; i++) {
    if (labels[i] === current) {
      count++;
    } else {
      spans.push({ label: current, start: start, count: count, printName: currentPrintName, elemIdx: currentElemIdx, fieldName: currentFieldName });
      current = labels[i];
      currentPrintName = printNames[i];
      currentElemIdx = elemIdxs[i];
      currentFieldName = fieldNames[i];
      start = i;
      count = 1;
    }
  }
  spans.push({ label: current, start: start, count: count, printName: currentPrintName, elemIdx: currentElemIdx, fieldName: currentFieldName });
  return spans;
}

// =============================================================================
// Map field name to color
// =============================================================================
function _fieldColor(fieldName, elemIdx) {
  var c = DRAW_CFG.colors;
  var pair = null;
  switch (fieldName) {
    case "SOF":               pair = c.sof; break;
    case "Arbitration field": pair = c.arbitration; break;
    case "Control field":     pair = c.control; break;
    case "Data field":        pair = c.data; break;
    case "CRC field":         pair = c.crc; break;
    case "ACK":               pair = c.ack; break;
    case "ACK field":         pair = c.ack; break;
    case "EOF":               pair = c.eof; break;
    default:                  return null;
  }
  if (!pair) return null;
  var idx = (elemIdx || 0) % 2;
  return pair[idx];
}
