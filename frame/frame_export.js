// =============================================================================
// frame_export.js — SVG, PNG, CSV download helpers
// =============================================================================

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
function exportSVG(frame, svgContainer) {
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
function exportPNG(frame, svgContainer) {
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
function exportCSV(frame) {
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
          var elemName = bit.isStuffBit ? "stuff" : byteElem.name;
          lines.push(bit.v + sep + bit.name + sep + elemName + sep + field.fieldName);
        }
      }
    } else if (field.elements) {
      for (var ei = 0; ei < field.elements.length; ei++) {
        var elem = field.elements[ei];
        for (var ej = 0; ej < elem.bits.length; ej++) {
          var ebit = elem.bits[ej];
          var eName = ebit.isStuffBit ? "stuff" : elem.name;
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
