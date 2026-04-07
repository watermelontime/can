// =============================================================================
// frame_main.js — Init, event listeners, input parsing, orchestration
// =============================================================================
import { CanFrame } from './frame_builder.js';
import { drawFrame } from './frame_draw.js';
import { exportSVG, exportPNG, exportCSV, exportVHDL } from './frame_export.js';
import { EXAMPLE_CONFIGS } from './frame_definitions.js';

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

  // Set initial field enable/disable state
  onFrameTypeChange();
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
// Real Arb/Data bit ratio switch toggled
// =============================================================================
function onRealBitRatioToggle() {
  var isOn = document.getElementById("chkRealArbDataBitRatio").checked;
  var inputsDiv = document.getElementById("realBitRatioInputs");
  var arbLongerChk = document.getElementById("chkArbPhaseBitsLonger");

  inputsDiv.style.display = isOn ? "flex" : "none";

  if (isOn) {
    arbLongerChk.checked = false;
    arbLongerChk.disabled = true;
  } else {
    arbLongerChk.disabled = false;
  }

  // Update VHDL button visibility
  _updateVHDLButtonVisibility();
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
    var dataBR = _clampInput("inputDataBitrate", 100, 20000);
    var arbSP  = _clampInput("inputArbSP",  1, 99);
    var dataSP = _clampInput("inputDataSP", 1, 99);

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

  var lines = [];
  lines.push("Frame type: " + frame.frameType);
  lines.push("Total bits: " + frame.computed.totalBits);
  lines.push("Dynamic stuff bits: " + frame.computed.stuffBitCountDyn);
  lines.push("Fixed stuff bits: " + frame.computed.stuffBitCountFixed);
  lines.push("Data bytes: " + frame.computed.dataFieldBytes);

  if (frame._isCC()) {
    lines.push("CRC-15: 0x" + frame.computed.crcValue.toString(16).toUpperCase());
    //lines.push("CRC input bit stream: " + frame.debug.crcInputBitStream.join(""));
    //z_pushCrcTrace(lines, frame.debug.crcShiftRegTrace, 15, "CRC-15");
  } else if (frame._isFD()) {
    lines.push("CRC-" + frame.computed.crcLength + ": 0x" + frame.computed.crcValue.toString(16).toUpperCase());
    //lines.push("CRC input bit stream: " + frame.debug.crcInputBitStream.join(""));
    //_pushCrcTrace(lines, frame.debug.crcShiftRegTrace, frame.computed.crcLength, "CRC-" + frame.computed.crcLength);
  } else if (frame._isXL()) {
    lines.push("PCRC-13: 0x" + frame.computed.pcrcValue.toString(16).toUpperCase());
    //lines.push("PCRC input bit stream: " + frame.debug.pcrcInputBitStream.join(""));
    //_pushCrcTrace(lines, frame.debug.pcrcShiftRegTrace, 13, "PCRC-13");
    lines.push("FCRC-32: 0x" + frame.computed.fcrcValue.toString(16).toUpperCase().padStart(8, "0"));
    //lines.push("FCRC input bit stream: " + frame.debug.fcrcInputBitStream.join(""));
  }

  info.textContent = lines.join("\n");
}

// =============================================================================
// Run init when DOM ready
// =============================================================================
document.addEventListener("DOMContentLoaded", frameInit);
