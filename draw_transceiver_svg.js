/**
 * Creates an SO8 IC top-view SVG element, rotated 90° anti-clockwise.
 * Pins are on top and bottom, pin-1 dot at bottom-left. 3D appearance.
 * @param {string} label - Text to display on the IC body.
 * @returns {SVGElement} - The SVG element ready to append.
 */
export function createSO8svg(label) {
  // --- User parameters ---
  const svgWidth   = 60;     // SVG width in pixels (x dimension)
  const svgHeight  = 45;     // SVG height in pixels (y dimension)
  const fontSize   = 14;     // Font size for the label text
  const fontWeight = 'bold'; // Font weight: 'normal' or 'bold'

  // --- Fixed pin dimensions (do not scale) ---
  const pinWidth  = 4;
  const pinHeight = 9;
  const pinGap    = 1;  // gap from SVG edge to pins
  const numPins   = 4;
  
  // --- Derived layout (IC body scales with svgWidth / svgHeight) ---
  const bodyMarginX = 4;
  const topPinY     = pinGap;
  const bottomPinY  = svgHeight - pinGap - pinHeight;
  const bodyX       = bodyMarginX;
  const bodyY       = topPinY + pinHeight;
  const bodyW       = svgWidth - 2 * bodyMarginX;
  const bodyH       = bottomPinY - bodyY;
  const pinSpacing  = bodyW / (numPins + 1);
  var pinXPositions = [];
  for (var p = 0; p < numPins; p++) {
    pinXPositions.push(bodyX + pinSpacing * (p + 1));
  }

  var svgNS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", String(svgWidth));
  svg.setAttribute("height", String(svgHeight));
  svg.setAttribute("viewBox", "0 0 " + svgWidth + " " + svgHeight);

  // --- Top pins (pins 5,6,7,8) ---
  for (var i = 0; i < numPins; i++) {
    var px = pinXPositions[i] - pinWidth / 2;
    // Pin shadow (3D depth)
    var pinShadow = document.createElementNS(svgNS, "rect");
    pinShadow.setAttribute("x", px + 0.5);
    pinShadow.setAttribute("y", topPinY + 1);
    pinShadow.setAttribute("width", pinWidth);
    pinShadow.setAttribute("height", pinHeight);
    pinShadow.setAttribute("rx", "0.5");
    pinShadow.setAttribute("fill", "#666");
    svg.appendChild(pinShadow);
    // Pin face
    var pin = document.createElementNS(svgNS, "rect");
    pin.setAttribute("x", px);
    pin.setAttribute("y", topPinY);
    pin.setAttribute("width", pinWidth);
    pin.setAttribute("height", pinHeight);
    pin.setAttribute("rx", "0.5");
    pin.setAttribute("fill", "#bbb");
    svg.appendChild(pin);
  }

  // --- Bottom pins (pins 1,2,3,4) ---
  for (var j = 0; j < numPins; j++) {
    var bx = pinXPositions[j] - pinWidth / 2;
    // Pin shadow (3D depth)
    var bPinShadow = document.createElementNS(svgNS, "rect");
    bPinShadow.setAttribute("x", bx + 0.5);
    bPinShadow.setAttribute("y", bottomPinY + 1);
    bPinShadow.setAttribute("width", pinWidth);
    bPinShadow.setAttribute("height", pinHeight);
    bPinShadow.setAttribute("rx", "0.5");
    bPinShadow.setAttribute("fill", "#666");
    svg.appendChild(bPinShadow);
    // Pin face
    var bPin = document.createElementNS(svgNS, "rect");
    bPin.setAttribute("x", bx);
    bPin.setAttribute("y", bottomPinY);
    bPin.setAttribute("width", pinWidth);
    bPin.setAttribute("height", pinHeight);
    bPin.setAttribute("rx", "0.5");
    bPin.setAttribute("fill", "#bbb");
    svg.appendChild(bPin);
  }

  // --- IC body 3D: bottom/right shadow layer ---
  var bodyShadow = document.createElementNS(svgNS, "rect");
  bodyShadow.setAttribute("x", bodyX + 1);
  bodyShadow.setAttribute("y", bodyY + 2);
  bodyShadow.setAttribute("width", bodyW);
  bodyShadow.setAttribute("height", bodyH);
  bodyShadow.setAttribute("rx", "2");
  bodyShadow.setAttribute("fill", "#111");
  svg.appendChild(bodyShadow);

  // --- IC body main ---
  var body = document.createElementNS(svgNS, "rect");
  body.setAttribute("class", "ic-body");
  body.setAttribute("x", bodyX);
  body.setAttribute("y", bodyY);
  body.setAttribute("width", bodyW);
  body.setAttribute("height", bodyH);
  body.setAttribute("rx", "2");
  body.setAttribute("fill", "#222");
  svg.appendChild(body);

  // --- IC body highlight (top edge bevel for 3D) ---
  var bevel = document.createElementNS(svgNS, "rect");
  bevel.setAttribute("x", bodyX);
  bevel.setAttribute("y", bodyY);
  bevel.setAttribute("width", bodyW);
  bevel.setAttribute("height", 3);
  bevel.setAttribute("rx", "2");
  bevel.setAttribute("fill", "rgba(255,255,255,0.1)");
  svg.appendChild(bevel);

  // --- Pin-1 dot (bottom-left of IC body) ---
  var dot = document.createElementNS(svgNS, "circle");
  dot.setAttribute("cx", bodyX + 8);
  dot.setAttribute("cy", bodyY + bodyH - 6);
  dot.setAttribute("r", "2.5");
  dot.setAttribute("fill", "#555");
  svg.appendChild(dot);

  // --- Label text (centered on IC body) ---
  var text = document.createElementNS(svgNS, "text");
  text.setAttribute("x", bodyX + bodyW / 2);
  text.setAttribute("y", bodyY + bodyH / 2);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "central");
  text.setAttribute("fill", "white");
  text.setAttribute("font-size", String(fontSize));
  text.setAttribute("font-family", "sans-serif");
  text.setAttribute("font-weight", fontWeight);
  text.textContent = label;
  svg.appendChild(text);

  return svg;
}