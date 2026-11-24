// All rights reserved. (c) 2026 //
// =============================================================================
// frame_main.js — Init, event listeners, input parsing, orchestration
// =============================================================================
import { CanFrame } from './frame_builder.js';
import { drawFrame } from './frame_draw.js';
import { exportSVG, exportPNG, exportCSV, exportVHDL } from './frame_export.js';
import { EXAMPLE_CONFIGS } from './frame_definitions.js';

// Application version shown next to the page title
const APP_VERSION = 'V1.2.0';

var myFrame = null;

// =============================================================================
// Init — runs when page loads
// =============================================================================
function frameInit() {
  // Attach event listeners
  document.getElementById("frameTypeSelect").addEventListener("change", onFrameTypeChange);
  document.getElementById("showFrameBtn").addEventListener("click", onShowFrame);
  document.getElementById("loadExampleBtn").addEventListener("click", onLoadExample);

  document.getElementById("btnExportSVG").addEventListener("click", function() {
    if (myFrame) exportSVG(myFrame, document.getElementById("svgContainer"));
  });
  document.getElementById("btnExportPNG").addEventListener("click", function() {
    if (myFrame) exportPNG(myFrame, document.getElementById("svgContainer"));
  });
  document.getElementById("btnExportCSV").addEventListener("click", function() {
    if (myFrame) exportCSV(myFrame);
  });
  document.getElementById("btnExportVHDL").addEventListener("click", function() {
    if (myFrame) exportVHDL(myFrame);
  });

  // Real Arb/Data bit ratio switch toggle
  document.getElementById("chkRealArbDataBitRatio").addEventListener("change", onRealBitRatioToggle);

  // Redraw on display-checkbox change (only if frame already generated)
  var displayChkIds = [
    "chkBitNames", "chkColor", "chkColorStuff", "chkBitSeparators",
    "chkFields", "chkPhases", "chkArbPhaseBitsLonger"
  ];
  for (var i = 0; i < displayChkIds.length; i++) {
    document.getElementById(displayChkIds[i]).addEventListener("change", _redraw);
  }

  // Drag-to-scroll (pan) the SVG waveform with the mouse
  _enableDragScroll(document.getElementById("svgContainer"));

  // Share link button
  var shareBtn = document.getElementById("copyShareLinkButton");
  if (shareBtn) shareBtn.addEventListener("click", function() { _copyShareLink(shareBtn); });

  // Set initial field enable/disable state
  onFrameTypeChange();

  // Show application version next to title
  const versionEl = document.getElementById('appVersion');
  if (versionEl) {
    versionEl.textContent = APP_VERSION;
  }

  // Apply settings from a shared link (#cfg=...) and show the frame
  if (_applySettingsFromHash()) onShowFrame();
}

// =============================================================================
// Share link: all user settings (inputs + display options) in the URL hash
// =============================================================================
// Element IDs whose value (text/number/select) or checked state (checkbox) is shared
var SHARE_SETTING_IDS = [
  "frameTypeSelect", "inputID", "inputDLC", "inputBRS", "inputESI", "inputRRS", "inputSEC",
  "inputSDT", "inputVCID", "inputAF", "inputData", "inputACK",
  "chkBitNames", "chkColor", "chkColorStuff", "chkBitSeparators", "chkFields", "chkPhases",
  "chkArbPhaseBitsLonger", "chkRealArbDataBitRatio",
  "inputArbBitrate", "inputArbSP", "inputDataBitrate", "inputDataSP"
];

function _collectSettings() {
  var s = {};
  for (var i = 0; i < SHARE_SETTING_IDS.length; i++) {
    var el = document.getElementById(SHARE_SETTING_IDS[i]);
    if (!el) continue;
    s[SHARE_SETTING_IDS[i]] = (el.type === "checkbox") ? el.checked : el.value;
  }
  return s;
}

// Set one element from untrusted link data: only matching types, select values must exist
function _applySetting(el, v) {
  if (el.type === "checkbox") {
    if (typeof v === "boolean") el.checked = v;
  } else if (typeof v === "string" && v.length <= 2000) {
    if (el.tagName === "SELECT") {
      var exists = Array.prototype.some.call(el.options, function(o) { return o.value === v; });
      if (!exists) return;
    }
    el.value = v;
  }
}

// Returns true if settings were found and applied
function _applySettingsFromHash() {
  var raw = new URLSearchParams(location.hash.slice(1)).get("cfg");
  if (!raw) return false;
  var s;
  try {
    s = JSON.parse(raw);
  } catch (e) {
    console.warn("[Warning] Invalid settings in link:", e);
    return false;
  }
  if (!s || typeof s !== "object") return false;

  // Frame type first: it enables/disables and shows/hides the other inputs
  var ftSel = document.getElementById("frameTypeSelect");
  if ("frameTypeSelect" in s) _applySetting(ftSel, s.frameTypeSelect);
  onFrameTypeChange();

  for (var i = 0; i < SHARE_SETTING_IDS.length; i++) {
    var id = SHARE_SETTING_IDS[i];
    if (id === "frameTypeSelect" || !(id in s)) continue;
    var el = document.getElementById(id);
    if (el) _applySetting(el, s[id]);
  }

  // Update dependent UI (bit-rate inputs, "Arb-bits longer" lock)
  onRealBitRatioToggle();
  return true;
}

async function _copyShareLink(button) {
  var link = location.origin + location.pathname + "#cfg=" + encodeURIComponent(JSON.stringify(_collectSettings()));
  var ok = true;
  try {
    await navigator.clipboard.writeText(link);
  } catch (e) {
    // Fallback for contexts without clipboard permission
    var tmp = document.createElement("textarea");
    tmp.value = link;
    document.body.appendChild(tmp);
    tmp.select();
    try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    tmp.remove();
  }
  var original = button.dataset.originalLabel || button.textContent;
  button.dataset.originalLabel = original;
  button.textContent = ok ? "Link copied!" : "Copy failed";
  setTimeout(function() { button.textContent = original; }, 1500);
}

// =============================================================================
// Drag-to-scroll: pan the scrollable SVG container by click & drag (mouse/pen)
// =============================================================================
function _enableDragScroll(container) {
  if (!container) return;
  var dragging = false;
  var startX = 0, startY = 0, startLeft = 0, startTop = 0;

  container.addEventListener("pointerdown", function(e) {
    // Left mouse button / pen only; touch keeps native scrolling
    if (e.pointerType === "touch" || e.button !== 0) return;
    // Only start panning on the waveform itself (not on padding/scrollbar)
    if (!(e.target instanceof Element) || !e.target.closest("svg")) return;
    // Exclude the scrollbar area (also for overlay scrollbars drawn over the content)
    var rect = container.getBoundingClientRect();
    if (e.clientY - rect.top - container.clientTop >= container.clientHeight) return;
    if (e.clientX - rect.left - container.clientLeft >= container.clientWidth) return;
    // Only pan if there is something to scroll
    if (container.scrollWidth <= container.clientWidth &&
        container.scrollHeight <= container.clientHeight) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = container.scrollLeft;
    startTop = container.scrollTop;
    container.setPointerCapture(e.pointerId);
    container.classList.add("dragging");
    e.preventDefault(); // avoid text selection / native SVG drag
  });

  container.addEventListener("pointermove", function(e) {
    if (!dragging) return;
    container.scrollLeft = startLeft - (e.clientX - startX);
    container.scrollTop = startTop - (e.clientY - startY);
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    container.classList.remove("dragging");
    if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
  }
  container.addEventListener("pointerup", endDrag);
  container.addEventListener("pointercancel", endDrag);
}

// =============================================================================
// Frame type changed → enable/disable fields
// =============================================================================
function onFrameTypeChange() {
  var ft = document.getElementById("frameTypeSelect").value;
  var isCC  = ft.startsWith("CC_");
  var isFD  = ft.startsWith("FD_");
  var isXL  = ft.startsWith("XL_");
  var isRTR = ft.endsWith("_RTR");

  // Data: disabled for remote frames
  document.getElementById("inputData").disabled = isRTR;

  // BRS, ESI: FD only
  document.getElementById("inputBRS").disabled = !isFD;
  document.getElementById("inputESI").disabled = !isFD;

  // SEC, SDT, VCID, AF: XL only
  document.getElementById("inputSEC").disabled  = !isXL;
  document.getElementById("inputSDT").disabled  = !isXL;
  document.getElementById("inputVCID").disabled = !isXL;
  document.getElementById("inputAF").disabled   = !isXL;

  // RRS: XL only (user input)
  document.getElementById("inputRRS").disabled = !isXL;

  // Hide/show Data Phase inputs (only for FD/XL)
  _updateDataPhaseVisibility();

  // Hide/show rows based on frame type
  document.getElementById("rowBRS").style.display  = isFD ? "" : "none";
  document.getElementById("rowESI").style.display  = isFD ? "" : "none";
  document.getElementById("rowRRS").style.display  = isXL ? "" : "none";
  document.getElementById("rowSEC").style.display  = isXL ? "" : "none";
  document.getElementById("rowSDT").style.display  = isXL ? "" : "none";
  document.getElementById("rowVCID").style.display = isXL ? "" : "none";
  document.getElementById("rowAF").style.display   = isXL ? "" : "none";
  document.getElementById("rowData").style.display = isRTR ? "none" : "";

  // Update DLC label/range hint
  var dlcInput = document.getElementById("inputDLC");
  if (isXL) {
    dlcInput.max = 2047;
    document.getElementById("dlcRangeHint").textContent = "(0–2047)";
  } else if (isFD) {
    dlcInput.max = 15;
    document.getElementById("dlcRangeHint").textContent = "(0–15)";
  } else {
    dlcInput.max = 15;
    document.getElementById("dlcRangeHint").textContent = "(0–15)";
  }

  // Update example dropdown for selected frame type
  _populateExampleDropdown();
}

// =============================================================================
// Populate example dropdown based on selected frame type
// =============================================================================
function _populateExampleDropdown() {
  var ft = document.getElementById("frameTypeSelect").value;
  var sel = document.getElementById("exampleSelect");
  sel.innerHTML = "";
  var examples = EXAMPLE_CONFIGS[ft] || [];
  for (var i = 0; i < examples.length; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.textContent = examples[i].name;
    sel.appendChild(opt);
  }
}

// =============================================================================
// "Load" button pressed → populate input fields from selected example
// =============================================================================
function onLoadExample() {
  var ft = document.getElementById("frameTypeSelect").value;
  var sel = document.getElementById("exampleSelect");
  var examples = EXAMPLE_CONFIGS[ft] || [];
  var idx = parseInt(sel.value, 10);
  if (isNaN(idx) || idx < 0 || idx >= examples.length) return;
  var ex = examples[idx];

  // ID
  if ("id" in ex) {
    document.getElementById("inputID").value = "0x" + ex.id.toString(16).toUpperCase();
  }
  // DLC
  if ("dlc" in ex) {
    document.getElementById("inputDLC").value = ex.dlc;
  }
  // BRS
  if ("brs" in ex) {
    document.getElementById("inputBRS").checked = !!ex.brs;
  }
  // ESI
  if ("esi" in ex) {
    document.getElementById("inputESI").checked = !!ex.esi;
  }
  // SEC
  if ("sec" in ex) {
    document.getElementById("inputSEC").checked = !!ex.sec;
  }
  // SDT
  if ("sdt" in ex) {
    document.getElementById("inputSDT").value = "0x" + ("0" + ex.sdt.toString(16).toUpperCase()).slice(-2);
  }
  // VCID
  if ("vcid" in ex) {
    document.getElementById("inputVCID").value = "0x" + ("0" + ex.vcid.toString(16).toUpperCase()).slice(-2);
  }
  // AF
  if ("af" in ex) {
    document.getElementById("inputAF").value = "0x" + ("0000000" + ex.af.toString(16).toUpperCase()).slice(-8);
  }
  // RRS
  if ("rrs" in ex) {
    document.getElementById("inputRRS").checked = !!ex.rrs;
  }
  // Data (last)
  if ("data" in ex) {
    document.getElementById("inputData").value = ex.data.map(function(b) {
      return ("0" + b.toString(16).toUpperCase()).slice(-2);
    }).join(" ");
  }

  // Auto-trigger "Show Frame"
  onShowFrame();
}

// =============================================================================
// Show/hide Data Phase inputs based on frame type
// =============================================================================
function _updateDataPhaseVisibility() {
  var ft = document.getElementById("frameTypeSelect").value;
  var isCC = ft.startsWith("CC_");
  var dataPhase = document.getElementById("dataPhaseInputs");
  if (dataPhase) {
    dataPhase.style.display = isCC ? "none" : "";
  }
}

// =============================================================================
// Real Arb/Data bit ratio switch toggled
// =============================================================================
function onRealBitRatioToggle() {
  var isOn = document.getElementById("chkRealArbDataBitRatio").checked;
  var inputsDiv = document.getElementById("realBitRatioInputs");
  var arbLongerChk = document.getElementById("chkArbPhaseBitsLonger");

  inputsDiv.style.display = isOn ? "flex" : "none";
  _updateDataPhaseVisibility();

  if (isOn) {
    arbLongerChk.checked = false;
    arbLongerChk.disabled = true;
  } else {
    arbLongerChk.disabled = false;
  }

  // Update VHDL button visibility
  _updateVHDLButtonVisibility();

  // Auto-trigger "Show Frame" if a frame was already generated
  if (myFrame) onShowFrame();
}

// =============================================================================
// Show/hide VHDL download button (requires realBitRatio ON + frame generated)
// =============================================================================
function _updateVHDLButtonVisibility() {
  var isOn = document.getElementById("chkRealArbDataBitRatio").checked;
  var btn = document.getElementById("btnExportVHDL");
  btn.style.display = (isOn && myFrame) ? "" : "none";
}

// =============================================================================
// Clamp a numeric input value to [min, max]
// =============================================================================
function _clampInput(id, min, max) {
  var el = document.getElementById(id);
  var v = parseInt(el.value, 10);
  if (isNaN(v)) v = min;
  if (v < min) v = min;
  if (v > max) v = max;
  el.value = v;
  return v;
}

// =============================================================================
// "Show Frame" button pressed → full pipeline
// =============================================================================
function onShowFrame() {
  var ft = document.getElementById("frameTypeSelect").value;

  // Create CanFrame
  myFrame = new CanFrame(ft);

  // Read inputs
  myFrame.input.id       = _parseHex(document.getElementById("inputID").value, 0);
  myFrame.input.dlc      = parseInt(document.getElementById("inputDLC").value, 10) || 0;
  myFrame.input.data     = _parseDataInput(document.getElementById("inputData").value);
  myFrame.input.ackSlot  = parseInt(document.getElementById("inputACK").value, 10);
  myFrame.input.brs      = document.getElementById("inputBRS").checked ? 1 : 0;
  myFrame.input.esi      = document.getElementById("inputESI").checked ? 1 : 0;
  myFrame.input.sec      = document.getElementById("inputSEC").checked ? 1 : 0;
  myFrame.input.sdt      = _parseHex(document.getElementById("inputSDT").value, 0);
  myFrame.input.vcid     = _parseHex(document.getElementById("inputVCID").value, 0);
  myFrame.input.af       = _parseHex(document.getElementById("inputAF").value, 0);
  myFrame.input.rrs      = document.getElementById("inputRRS").checked ? 1 : 0;

  // Build frame
  myFrame.build();

  // Apply real bit ratio settings to bitTimeInfo after build
  var realBitRatioOn = document.getElementById("chkRealArbDataBitRatio").checked;
  if (realBitRatioOn) {
    var arbBR  = _clampInput("inputArbBitrate",  100, 20000);
    var arbSP  = _clampInput("inputArbSP",  1, 99);
    var isCC   = ft.startsWith("CC_");
    // Hint: Currently, for CC frames the larger arbitration bits are not possible. This is because there is just 1 bit rate, not ratio.
    // TODO/Question: To enable the same larger visual bit lenghts
    //   Option a) show the data phase bit rate anyway => so due to the ratio, the arb bits get visually larger
    //   Option b) add a "visual bit ratio" setting that only affects the drawing, not the actual bit time calculations
    //   Option c) leave as is, do not provide feature
    var dataBR = isCC ? arbBR : _clampInput("inputDataBitrate", 100, 20000);
    var dataSP = isCC ? arbSP : _clampInput("inputDataSP", 1, 99);

    myFrame.bitTimeInfo.realBitRatio = true;
    myFrame.bitTimeInfo.realArbDataBitLenRatio = dataBR / arbBR;
    myFrame.bitTimeInfo.arbSP = arbSP;
    myFrame.bitTimeInfo.dataSP = dataSP;
    myFrame.bitTimeInfo.arbBitrate = arbBR;
    myFrame.bitTimeInfo.dataBitrate = dataBR;
  }

  // Draw + update displays
  _redraw();

  // Update info display (frame data, not drawing-related)
  _updateInfoDisplay(myFrame);

  // Debug
  console.log("myFrame with fields:", myFrame); // DEBUG
}

// =============================================================================
// Redraw the frame using current checkboxes (only if myFrame exists)
// =============================================================================
function _redraw() {
  if (!myFrame) return;

  var opts = {
    arbPhaseBitsLonger: document.getElementById("chkArbPhaseBitsLonger").checked,
    showBitNames:  document.getElementById("chkBitNames").checked,
    useColor:      document.getElementById("chkColor").checked,
    useColorStuff: document.getElementById("chkColorStuff").checked,
    showFields:    document.getElementById("chkFields").checked,
    showBitSeparators: document.getElementById("chkBitSeparators").checked,
    showPhases:    document.getElementById("chkPhases").checked
  };

  drawFrame(myFrame, document.getElementById("svgContainer"), opts);
  _updateInfoDisplay(myFrame);
  _updateVHDLButtonVisibility();
}

// =============================================================================
// Parse hex input: "0x1AB" or "1AB" → integer
// =============================================================================
function _parseHex(str, defaultVal) {
  if (!str || str.trim() === "") return defaultVal;
  str = str.trim().replace(/^0x/i, "");
  var val = parseInt(str, 16);
  return isNaN(val) ? defaultVal : val;
}

// =============================================================================
// Parse data input: accepts "DE AD BE EF" or "DEADBEEF" → [0xDE, 0xAD, ...]
// =============================================================================
function _parseDataInput(str) {
  if (!str || str.trim() === "") return [];
  str = str.trim();

  // Check if space-separated
  if (str.indexOf(" ") >= 0) {
    var parts = str.split(/\s+/);
    var bytes = [];
    for (var i = 0; i < parts.length; i++) {
      var b = parseInt(parts[i], 16);
      if (!isNaN(b)) bytes.push(b & 0xFF);
    }
    return bytes;
  }

  // Continuous hex string: "DEADBEEF"
  // Remove optional "0x" prefix
  str = str.replace(/^0x/i, "");
  // Pad to even length
  if (str.length % 2 !== 0) str = "0" + str;
  var result = [];
  for (var j = 0; j < str.length; j += 2) {
    var byte = parseInt(str.substring(j, j + 2), 16);
    if (!isNaN(byte)) result.push(byte & 0xFF);
  }
  return result;
}

// =============================================================================
// Update info display below SVG
// =============================================================================
function _pushCrcTrace(lines, trace, crcBits, label) {
  if (!trace || trace.length === 0) return;
  lines.push("");
  lines.push(label + " shift register trace:");
  var dataLen = trace.length - 1 - crcBits; // number of data bits
  for (var i = 0; i < trace.length; i++) {
    var stepLabel;
    if (i === 0) {
      stepLabel = "Init   ";
    } else if (i <= dataLen) {
      stepLabel = "Bit  " + String(i - 1).padStart(3, " ") + " ";
    } else {
      stepLabel = "Zero " + String(i - 1 - dataLen).padStart(3, " ") + " ";
    }
    lines.push("  " + stepLabel + ": " + trace[i].toString(2).padStart(crcBits, "0"));
  }
}

function _updateInfoDisplay(frame) {
  var info = document.getElementById("infoDisplay");
  if (!info) return;

  var rows = [];   // [label, value] pairs, printed as aligned columns
  var lines = [];  // free-form lines appended below the table (debug output)
  rows.push(["Frame type", frame.frameType]);
  rows.push(["Total bits", frame.computed.totalBits]);

  // Arbitration / data phase bit counts
  var phases = _countPhaseBits(frame);
  rows.push(["Arb. phase bits", phases.arb]);
  rows.push(["Data phase bits", phases.data]);
  rows.push(["Mixed phase bits", phases.mixed + (phases.mixed > 0 ? " (mixed Arb./Data phase bits: BRS and CRC del)" : "")]);
  rows.push(["Data field bytes", frame.computed.dataFieldBytes + " (DLC = " + frame.input.dlc + ")"]);

  rows.push(["Dynamic stuff bits", frame.computed.stuffBitCountDyn]);
  rows.push(["Fixed stuff bits", frame.computed.stuffBitCountFixed]);

  // Dynamic stuff bits relative to the non-stuff bits of the dynamic stuffing range
  var dynStuff = frame.computed.stuffBitCountDyn;
  var dynRegion = frame.computed.dynStuffRegionBits;
  var dynRatio = dynRegion > 0 ? (100 * dynStuff / dynRegion).toFixed(2) + " %" : "n/a";
  rows.push(["Ratio", dynStuff + " / " + dynRegion + " = " + dynRatio + " (dynamic stuff bits / non-stuff bits)"]);

  if (frame._isCC()) {
    rows.push(["CRC-15", "0x" + frame.computed.crcValue.toString(16).toUpperCase()]);
    //lines.push("CRC input bit stream: " + frame.debug.crcInputBitStream.join(""));
    //z_pushCrcTrace(lines, frame.debug.crcShiftRegTrace, 15, "CRC-15");
  } else if (frame._isFD()) {
    rows.push(["CRC-" + frame.computed.crcLength, "0x" + frame.computed.crcValue.toString(16).toUpperCase()]);
    //lines.push("CRC input bit stream: " + frame.debug.crcInputBitStream.join(""));
    //_pushCrcTrace(lines, frame.debug.crcShiftRegTrace, frame.computed.crcLength, "CRC-" + frame.computed.crcLength);
  } else if (frame._isXL()) {
    rows.push(["PCRC-13", "0x" + frame.computed.pcrcValue.toString(16).toUpperCase()]);
    //lines.push("PCRC input bit stream: " + frame.debug.pcrcInputBitStream.join(""));
    //_pushCrcTrace(lines, frame.debug.pcrcShiftRegTrace, 13, "PCRC-13");
    rows.push(["FCRC-32", "0x" + frame.computed.fcrcValue.toString(16).toUpperCase().padStart(8, "0")]);
    //lines.push("FCRC input bit stream: " + frame.debug.fcrcInputBitStream.join(""));
  }

  // Align values: pad all labels (incl. colon) to the longest label
  var labelWidth = 0;
  for (var r = 0; r < rows.length; r++) {
    labelWidth = Math.max(labelWidth, rows[r][0].length + 1);
  }
  var table = rows.map(function(row) {
    return (row[0] + ":").padEnd(labelWidth + 2) + row[1];
  });

  info.textContent = table.concat(lines).join("\n");
}

// =============================================================================
// Count bits per phase (same phase boundaries as the phase bar in the drawing).
// CAN FD (BRS=1): the first (BRS) and last (CRC del) data phase bit contain the
// bit-rate switch at the sample point -> counted as "mixed".
// CAN XL: switch happens at bit boundaries -> no mixed bits.
// =============================================================================
function _countPhaseBits(frame) {
  var allIdx = [];
  for (var i = 0; i < frame.fields.length; i++) allIdx.push(i);
  var bits = frame._flattenBits(allIdx);
  var total = bits.length;
  var bti = frame.bitTimeInfo;

  var start = -1, end = -1;
  if (bti && bti.dataPhasePresent) {
    for (var s = 0; s < total; s++) {
      if (bits[s].name === bti.firstDataPhaseBit) { start = s; break; }
    }
    for (var e = total - 1; e >= 0; e--) {
      if (bits[e].name === bti.lastDataPhaseBit) { end = e; break; }
    }
  }
  if (start < 0 || end < 0 || start > end) {
    return { arb: total, data: 0, mixed: 0 };
  }

  var dataRangeLen = end - start + 1;
  var mixed = frame._isFD() ? Math.min(2, dataRangeLen) : 0;
  var data = dataRangeLen - mixed;
  return { arb: total - dataRangeLen, data: data, mixed: mixed };
}

// =============================================================================
// Run init when DOM ready
// =============================================================================
document.addEventListener("DOMContentLoaded", frameInit);
