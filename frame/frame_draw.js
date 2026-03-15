// =============================================================================
// frame_draw.js — SVG waveform drawing for CAN frames
// =============================================================================
// Reads myFrame.fields[] hierarchy and renders a digital waveform as SVG.
// =============================================================================

var DRAW_CFG = {
  bitWidth:           30,     // px per bit
  bitHeight:          60,     // px: waveform amplitude (vertical distance low ↔ high)
  lineWidth:           3,     // px: waveform stroke width
  fontSizeBitName:    12,     // px
  fontSizeFieldName:  15,     // px
  fontFamilyBitName:  "sans-serif", // examples: "sans-serif", "monospace", "Arial", "Helvetica", "Verdana"
  fontFamilyFieldName: "sans-serif", // examples: "sans-serif", "monospace", "Arial", "Helvetica", "Verdana"
  gapBitNameToWave:   4,      // px gap (unused when bit names are inside bits)
  gapFieldToWave:     20,     // px between field/element header area and waveform
  paddingTop:         10,     // px above everything
  paddingBottom:       5,     // px below waveform
  paddingLeft:        10,     // px left margin

  colors: {
    waveformLine:    "#000000",
    background:      "#FFFFFF",
    stuffBit:        "#FF8C00",          // orange
    sof:             ["#B0BEC5","#CFD8DC"],
    arbitration:     ["#90CAF9","#BBDEFB"],
    control:         ["#A5D6A7","#C8E6C9"],
    data:            ["#CE93D8","#E1BEE7"],
    crc:             ["#FFCC80","#FFE0B2"],
    ack:             ["#F48FB1","#F8BBD0"],
    eof:             ["#B0BEC5","#CFD8DC"]
  }
};

// =============================================================================
// Main draw function
// =============================================================================
function drawFrame(frame, svgContainer, options) {
  var opts = options || {};
  var showBitNames   = !!opts.showBitNames;
  var useColor       = !!opts.useColor;
  var useColorStuff  = !!opts.useColorStuff;
  var showFields     = !!opts.showFields;

  var cfg = DRAW_CFG;

  // --- Flatten all bits for drawing ---
  var drawBits = _collectDrawBits(frame);
  var totalBits = drawBits.length;
  if (totalBits === 0) return;

  // --- Compute layout dimensions ---
  var fieldHeaderHeight = 0;
  var elemHeaderHeight  = 0;
  var bitNameHeight     = 0;

  if (showFields) {
    fieldHeaderHeight = cfg.fontSizeFieldName + 6;  // line 1
    elemHeaderHeight  = cfg.fontSizeFieldName + 6;  // line 2
  }
  if (showBitNames) {
    // Bit names are drawn inside the waveform bits — no extra header height needed
    bitNameHeight = 0;
  }

  var headerArea = fieldHeaderHeight + elemHeaderHeight;
  if (showFields && showBitNames) headerArea += cfg.gapFieldToWave;

  var waveTop = cfg.paddingTop + headerArea + bitNameHeight;
  var waveHigh = waveTop;              // recessive (1) = top
  var waveLow  = waveTop + cfg.bitHeight;  // dominant (0) = bottom

  var svgWidth  = cfg.paddingLeft + totalBits * cfg.bitWidth + cfg.paddingLeft;
  var svgHeight = waveLow + cfg.paddingBottom;

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
      var x = cfg.paddingLeft + bi * cfg.bitWidth;
      var color = null;

      if (useColorStuff && db.isStuffBit) {
        color = cfg.colors.stuffBit;
      } else if (useColor) {
        color = _fieldColor(db.fieldName, db.elemIdx);
      }

      if (color) {
        var rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", waveTop);
        rect.setAttribute("width",  cfg.bitWidth);
        rect.setAttribute("height", cfg.bitHeight);
        rect.setAttribute("fill", color);
        rect.setAttribute("opacity", "0.3");
        svg.appendChild(rect);
      }
    }
  }

  // --- Draw field header (line 1: group names) ---
  if (showFields) {
    _drawFieldHeaders(svg, ns, drawBits, cfg, fieldHeaderHeight);
  }

  // --- Draw element header (line 2: element names) ---
  if (showFields) {
    _drawElementHeaders(svg, ns, drawBits, cfg, fieldHeaderHeight, elemHeaderHeight);
  }

  // --- Draw bit names inside the bits (rotated 90°) ---
  if (showBitNames) {
    var bitNameAnchorY = waveLow - cfg.gapBitNameToWave;  // slightly above level-0 (dominant)
    for (var bn = 0; bn < drawBits.length; bn++) {
      var bx = cfg.paddingLeft + bn * cfg.bitWidth + cfg.bitWidth / 2;
      var text = document.createElementNS(ns, "text");
      text.setAttribute("x", bx);
      text.setAttribute("y", bitNameAnchorY);
      text.setAttribute("font-size", cfg.fontSizeBitName);
      text.setAttribute("font-family", cfg.fontFamilyBitName);
      text.setAttribute("text-anchor", "start");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("transform", "rotate(-90," + bx + "," + bitNameAnchorY + ")");
      if (drawBits[bn].isStuffBit) {
        text.setAttribute("fill", cfg.colors.stuffBit);
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
    var xStart = cfg.paddingLeft + wi * cfg.bitWidth;
    var xEnd   = xStart + cfg.bitWidth;
    var yVal   = drawBits[wi].value === 1 ? waveHigh : waveLow;

    if (wi === 0) {
      pathData += "M " + xStart + " " + yVal;
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
  pathElem.setAttribute("stroke", cfg.colors.waveformLine);
  pathElem.setAttribute("stroke-width", cfg.lineWidth);
  pathElem.setAttribute("fill", "none");
  svg.appendChild(pathElem);

  // --- Insert SVG into container ---
  svgContainer.innerHTML = "";
  svgContainer.appendChild(svg);
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
            elemName:    bit.isStuffBit ? STUFF_DYN_NAME : byteElem.name,
            elemIdx:     bi,
            printName:   byteElem.printName !== false,
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
            elemName:    ebit.isStuffBit ? STUFF_DYN_NAME : elem.name,
            elemIdx:     ei,
            printName:   elem.printName !== false,
            fieldName:   field.fieldName
          });
        }
      }
    }
  }
  return bits;
}

// =============================================================================
// Draw field header (line 1): group name spans
// =============================================================================
function _drawFieldHeaders(svg, ns, drawBits, cfg, lineHeight) {
  var y = cfg.paddingTop + lineHeight / 2;
  var spans = _computeMergedSpans(drawBits, "fieldName");

  for (var si = 0; si < spans.length; si++) {
    var span = spans[si];

    var x = cfg.paddingLeft + span.start * cfg.bitWidth;
    var w = span.count * cfg.bitWidth;

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
      rect.setAttribute("rx", "3");
      svg.appendChild(rect);
    }

    // Separator line
    if (si > 0) {
      var line = document.createElementNS(ns, "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", cfg.paddingTop);
      line.setAttribute("x2", x);
      line.setAttribute("y2", cfg.paddingTop + lineHeight);
      line.setAttribute("stroke", "#999");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }

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
}

// =============================================================================
// Draw element header (line 2): element name spans
// =============================================================================
function _drawElementHeaders(svg, ns, drawBits, cfg, line1Height, line2Height) {
  var yTop = cfg.paddingTop + line1Height;
  var y = yTop + line2Height / 2;
  var spans = _computeMergedSpans(drawBits, "elemName");

  for (var si = 0; si < spans.length; si++) {
    var span = spans[si];

    var x = cfg.paddingLeft + span.start * cfg.bitWidth;
    var w = span.count * cfg.bitWidth;

    // Separator line
    if (si > 0) {
      var line = document.createElementNS(ns, "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", yTop);
      line.setAttribute("x2", x);
      line.setAttribute("y2", yTop + line2Height);
      line.setAttribute("stroke", "#ccc");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }

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

  // Build effective labels: stuff bits inherit from their left non-stuff neighbor
  var labels = [];
  var printNames = [];
  var elemIdxs = [];
  var fieldNames = [];
  var lastNonStuffLabel = null;
  var lastNonStuffPrintName = true;
  var lastNonStuffElemIdx = 0;
  var lastNonStuffFieldName = "";
  for (var i = 0; i < drawBits.length; i++) {
    if (drawBits[i].isStuffBit) {
      labels.push(lastNonStuffLabel);  // inherit from left neighbor
      printNames.push(lastNonStuffPrintName);
      elemIdxs.push(lastNonStuffElemIdx);
      fieldNames.push(lastNonStuffFieldName);
    } else {
      lastNonStuffLabel = drawBits[i][propName];
      lastNonStuffPrintName = drawBits[i].printName !== false;
      lastNonStuffElemIdx = drawBits[i].elemIdx || 0;
      lastNonStuffFieldName = drawBits[i].fieldName || "";
      labels.push(lastNonStuffLabel);
      printNames.push(lastNonStuffPrintName);
      elemIdxs.push(lastNonStuffElemIdx);
      fieldNames.push(lastNonStuffFieldName);
    }
  }
  // Fill any leading stuff bits from the right
  for (var i = 0; i < labels.length; i++) {
    if (labels[i] !== null) break;
    // find first non-null
    for (var j = i + 1; j < labels.length; j++) {
      if (labels[j] !== null) {
        labels[i] = labels[j];
        printNames[i] = printNames[j];
        elemIdxs[i] = elemIdxs[j];
        fieldNames[i] = fieldNames[j];
        break;
      }
    }
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
