/**
 * Draws the CAN Bit Timing as a bar chart with SVG.
 * @param {string} HTMLDrawingName - Name of the SVG element to draw into.
 *   Example: 'DrawingBTNominal' for the nominal Bit Timing.
 * @param {string} BitTimingName - Name of the Bit Timing, displayed in the bar area.
 *   Example: 'Nominal Bit Timing' for the nominal Bit Timing.
 * @param {number} spPercent - Sample Point percentage value (0-100).
 *   Example: 80 for 80% of the Bit Timing.
 * @param {number} PropSeg, PhaseSeg1, PhaseSeg2, sjwLen - Bit timing parameter in TQ.
 * @param {number} sspPercent - SSP percentage value (0-100).
 *   Example: 60 for 60% of the Bit Timing.
 * @param {number} tdcEna - TDC enabled (true) or disabled (false).
 */
// ===================================================================================
export function drawBitTiming(PropSeg, PhaseSeg1, PhaseSeg2, spPercent, sjwLen, sspPercent, tdcEna, HTMLDrawingName, BitTimingName, svgWidth, svgHeight) {

  // dimension svg element
  let svg = document.getElementById(HTMLDrawingName);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);

  // Erase previous content (drawing + text)
  svg.innerHTML = '';

  // define colors
  const sjwColor = '#999999'; // Color of the SJW line
  const spColor = '#FF0000'; // Color of the Sample Point line
  const sspColor = '#800080'; // Color of the SSP line (TDC)
  const textColor = 'black'; // Color of the labels
  const syncSegColor = '#555555'; // Color of the SyncSeg bar
  const PropSegColor = '#FFD000'; // Color of the PropSeg bar
  const PhaseSeg1Color = '#4CAF50'; // Color of the PhaseSeg1 bar
  const PhaseSeg2Color = '#2196F3'; // Color of the PhaseSeg2 bar #FF9800

  // Positions in SVG
  const fontSize = 14; // Font size
  const yTextSP = 0; // Text position SP
  const yTextName = 0; // Y-Position of the text
  const xTextName = 0; // X-Position of the text

  const ySPueberstand = 5; // Sample Point line extends beyond the bar by 5px top and bottom
  const yBarTop = fontSize + ySPueberstand + 2; // Y-Position of bar
  const yBarHeigth = svg.clientHeight - yBarTop - ySPueberstand;

  const spLineWidht = 5; // Thickness of the SP line
  const sspLineWidht = 2; // Thickness of the SSP line
  const sjwLineWidth = 8; // Thickness of the SJW line

  // Calculations for the bars
  const totalTQ = 1 + PropSeg + PhaseSeg1 + PhaseSeg2;; // Total length in TQ
  let x = 0; // current x-Position in SVG

  // Sample Point
  let sampleX = null;
  let segWidthPixel = 0; // width of the current segment in pixels
  let rect = null; // SVG rectangle element for segments

  // DEBUG: draw a rectangle around the SVG area
  //const debugRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  //debugRect.setAttribute('x', 0);
  //debugRect.setAttribute('y', 0);
  //debugRect.setAttribute('width', svgWidth);
  //debugRect.setAttribute('height', svgHeight);
  //debugRect.setAttribute('fill', 'none');
  //debugRect.setAttribute('stroke', 'red');
  //debugRect.setAttribute('stroke-width', 1);
  //svg.appendChild(debugRect);

  // SyncSeg drawing ----------------------------------
  segWidthPixel = (1 / totalTQ) * svgWidth;
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', yBarTop); // Top margin
  rect.setAttribute('width', segWidthPixel);
  rect.setAttribute('height', yBarHeigth);
  rect.setAttribute('fill', syncSegColor);
  svg.appendChild(rect);
  x += segWidthPixel; // x-Position for next Segment

  // PropSeg drawing ----------------------------------
  segWidthPixel = (PropSeg / totalTQ) * svgWidth;
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', yBarTop); // Top margin
  rect.setAttribute('width', segWidthPixel);
  rect.setAttribute('height', yBarHeigth);
  rect.setAttribute('fill', PropSegColor);
  svg.appendChild(rect);
  x += segWidthPixel; // x-Position for next Segment

  // PhaseSeg1 drawing ----------------------------------
  segWidthPixel = (PhaseSeg1 / totalTQ) * svgWidth;
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', yBarTop); // Top margin
  rect.setAttribute('width', segWidthPixel);
  rect.setAttribute('height', yBarHeigth);
  rect.setAttribute('fill', PhaseSeg1Color);
  svg.appendChild(rect);
  x += segWidthPixel; // x-Position for next Segment

  // SP Position: save X-Position
  sampleX = x; // Position at the end of PhaseSeg1, the Sample Point is drawn here
  
  // PhaseSeg2 drawing ----------------------------------
  segWidthPixel = (PhaseSeg2 / totalTQ) * svgWidth;
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', yBarTop); // Top margin
  rect.setAttribute('width', segWidthPixel);
  rect.setAttribute('height', yBarHeigth);
  rect.setAttribute('fill', PhaseSeg2Color);
  svg.appendChild(rect);

  // SJW drawing ----------------------------------------
  const sjwPixel = (sjwLen / totalTQ) * svgWidth;
  const sjwLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  sjwLine.setAttribute('x1', sampleX - sjwPixel);
  sjwLine.setAttribute('x2', sampleX + sjwPixel);
  sjwLine.setAttribute('y1', yBarTop + yBarHeigth - sjwLineWidth/2);
  sjwLine.setAttribute('y2', yBarTop + yBarHeigth - sjwLineWidth/2);
  sjwLine.setAttribute('stroke', sjwColor);
  sjwLine.setAttribute('stroke-width', sjwLineWidth);
  sjwLine.setAttribute('marker-start', 'url(#arrow)');
  sjwLine.setAttribute('marker-end', 'url(#arrow)');
  svg.appendChild(sjwLine);

  // SP drawing ----------------------------------------
  if (sampleX !== null && typeof spPercent === 'number') {
    // Sample Point Line
    const spLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    spLine.setAttribute('x1', sampleX);
    spLine.setAttribute('x2', sampleX);
    spLine.setAttribute('y1', yBarTop - ySPueberstand);
    spLine.setAttribute('y2', yBarTop + yBarHeigth + ySPueberstand);
    spLine.setAttribute('stroke', spColor);
    spLine.setAttribute('stroke-width', spLineWidht);
    svg.appendChild(spLine);
    // Sample Point Label
    const spLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    spLabel.setAttribute('x', sampleX);
    spLabel.setAttribute('y', yTextSP);
    spLabel.setAttribute('fill', spColor);
    spLabel.setAttribute('font-size', fontSize);
    spLabel.setAttribute('font-family', 'sans-serif');
    spLabel.setAttribute('text-anchor', 'middle');
    spLabel.setAttribute('dominant-baseline', 'hanging'); // Vertical alignment: auto, middle, central, hanging, text-before-edge, text-after-edge, alphabetic (default), ideographic
    spLabel.textContent = `SP ${Math.round(spPercent)}%`;
    svg.appendChild(spLabel);
  } else {
    console.log(`[Error] drawBitTiming(${BitTimingName}): sampleX or spPercent is not defined!`);
  }

  // SSP drawing -----------------------------------------
  if (tdcEna === true && typeof sspPercent === 'number') {
    const xSSPposition = sspPercent/100 * svgWidth; // X-Position of SSP Line
    // SSP Line
    const spLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    spLine.setAttribute('x1', xSSPposition);
    spLine.setAttribute('x2', xSSPposition);
    spLine.setAttribute('y1', yBarTop - ySPueberstand);
    spLine.setAttribute('y2', yBarTop + yBarHeigth + ySPueberstand);
    spLine.setAttribute('stroke', sspColor);
    spLine.setAttribute('stroke-width', sspLineWidht);
    svg.appendChild(spLine);
    //// SSP Label
    //const spLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    //spLabel.setAttribute('x', sampleX);
    //spLabel.setAttribute('y', yTextSP);
    //spLabel.setAttribute('fill', sspColor);
    //spLabel.setAttribute('font-size', fontSize);
    //spLabel.setAttribute('font-family', 'sans-serif');
    //spLabel.setAttribute('text-anchor', 'middle');
    //spLabel.setAttribute('dominant-baseline', 'text-before-edge'); // Vertical alignment: auto, middle, central, hanging, text-before-edge, text-after-edge, alphabetic (default), ideographic
    //spLabel.textContent = `SP ${Math.round(sspPercent)}%`;
    //svg.appendChild(spLabel);
  } else {
    // since SSP is optional, we can skip this part
    // Debug: console.log(`[Error] drawBitTiming(${BitTimingName}): tdcEna or sspPercent is not defined!`);
  }

  // Title label in the bar area (left)
  const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleText.setAttribute('x', xTextName);       // Distance from left edge
  titleText.setAttribute('y', yTextName);  
  titleText.setAttribute('fill', textColor);
  titleText.setAttribute('font-size', fontSize);
  titleText.setAttribute('font-family', 'sans-serif');
  titleText.setAttribute('dominant-baseline', 'hanging'); // Vertical alignment: auto, middle, central, hanging, text-before-edge, text-after-edge, alphabetic (default), ideographic
  titleText.textContent = BitTimingName;
  svg.appendChild(titleText);
}

// ===================================================================================
// Draw PWM symbols of 1 XL Data Phase Bit
export function drawPWMsymbols(PWMS, PWML, pwm_symbols_per_bit, HTMLDrawingName, NameToPrint, svgWidth, svgHeight) {

  // dimension svg element
  let svg = document.getElementById(HTMLDrawingName);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);

  // Erase previous content (drawing + text)
  svg.innerHTML = '';

  // Positions in SVG
  const fontSize = 14; // Font size
  const yTextName = 0; // Y-Position of the text
  const xTextName = 0; // X-Position of the text

  const lineWidth = 6; // Line width
  const lineColor = 'black'; // Color of the Line
  const noPWMboxColor = '#DDDDDD'; // Color of the box, if no PWM symbols are possible

  const yMarginText2PWM = 7; // Margin from text to PWM symbols
  const yMarginPWM2Bottom = lineWidth/2 + 1; // Margin from PWM symbols to bottom of SVG: as much, that the line is fully visible
  const y_pwm_top = fontSize + yMarginText2PWM + lineWidth/2; // y-Position of PWM symbol
  const y_pwm_bottom = svg.clientHeight - yMarginPWM2Bottom; // y-Position of the bar bottom

  // Calculate pixels for PWMs and PWML
  const totalMTQ = (PWMS + PWML) * pwm_symbols_per_bit; // Total lenght in mTQ (minimum TQ = CAN CLOCK Periods)
  
  // Drawing the PWM symbols
  let x = lineWidth/2; // current position in SVG, start with half line width to center the first symbol

  // DEBUG: draw a rectangle around the SVG area
  //const debugRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  //debugRect.setAttribute('x', 0);
  //debugRect.setAttribute('y', 0);
  //debugRect.setAttribute('width', svgWidth);
  //debugRect.setAttribute('height', svgHeight);
  //debugRect.setAttribute('fill', 'none');
  //debugRect.setAttribute('stroke', 'red');
  //debugRect.setAttribute('stroke-width', 1);
  //svg.appendChild(debugRect);

  if (pwm_symbols_per_bit > 0) {
    // Draw PWM symbols
    for (let i = 0; i < pwm_symbols_per_bit; i++) {
      // Calculate width of the current PWM symbol
      const PWMSwidthPX = (svgWidth / totalMTQ) * PWMS; // Width of PWMS in Pixel
      const PWMLwidthPX = (svgWidth / totalMTQ) * PWML; // Width of PWML in Pixel
    
      // PWMS: Vertical rising edge of PWM Symbol
      let myline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      myline.setAttribute('x1', x);
      myline.setAttribute('x2', x);
      myline.setAttribute('y1', y_pwm_bottom);
      myline.setAttribute('y2', y_pwm_top);
      myline.setAttribute('stroke', lineColor);
      myline.setAttribute('stroke-width', lineWidth);
      myline.setAttribute('stroke-linecap', 'square'); // or round, square or butt
      svg.appendChild(myline);
    
      // PWMS: Horizontal line
      myline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      myline.setAttribute('x1', x);
      myline.setAttribute('x2', x + PWMSwidthPX);
      myline.setAttribute('y1', y_pwm_top);
      myline.setAttribute('y2', y_pwm_top);
      myline.setAttribute('stroke', lineColor);
      myline.setAttribute('stroke-width', lineWidth);
      myline.setAttribute('stroke-linecap', 'square'); // or round, square or butt
      svg.appendChild(myline);
    
      x += PWMSwidthPX; // update X position for next line
    
      // PWML: Vertical rising edge of PWM Symbol
      myline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      myline.setAttribute('x1', x);
      myline.setAttribute('x2', x);
      myline.setAttribute('y1', y_pwm_top);
      myline.setAttribute('y2', y_pwm_bottom);
      myline.setAttribute('stroke', lineColor);
      myline.setAttribute('stroke-width', lineWidth);
      myline.setAttribute('stroke-linecap', 'square'); // or round, square or butt
      svg.appendChild(myline);
    
      // PWML: Horizontal line
      myline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      myline.setAttribute('x1', x);
      myline.setAttribute('x2', x + PWMLwidthPX);
      myline.setAttribute('y1', y_pwm_bottom);
      myline.setAttribute('y2', y_pwm_bottom);
      myline.setAttribute('stroke', lineColor);
      myline.setAttribute('stroke-width', lineWidth);
      myline.setAttribute('stroke-linecap', 'square'); // or round, square or butt
      svg.appendChild(myline);
    
      x += PWMLwidthPX; // update X position for next line
    }
  } else {
    // No PWM symbols possible, draw a box
    // Draw a box to indicate no PWM symbols
    let myrect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');  
    myrect.setAttribute('x', 0);
    myrect.setAttribute('y', y_pwm_top - lineWidth/2); // y-Position of the top edge of the rectangle
    myrect.setAttribute('width', svgWidth); // fill the rest of the SVG
    myrect.setAttribute('height', y_pwm_bottom - y_pwm_top + lineWidth/2); // height of the rectangle
    myrect.setAttribute('fill', noPWMboxColor);
    svg.appendChild(myrect);
  }

  // Label
  const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleText.setAttribute('x', xTextName); // Distance from left edge
  titleText.setAttribute('y', yTextName); // Distance from top edge
  titleText.setAttribute('fill', 'black');
  titleText.setAttribute('font-size', fontSize);
  titleText.setAttribute('font-family', 'sans-serif');
  titleText.setAttribute('dominant-baseline', 'hanging'); // Vertical alignment: auto, middle, central, hanging, text-before-edge, text-after-edge, alphabetic (default), ideographic
  titleText.textContent = NameToPrint;
  svg.appendChild(titleText);
}

// ===================================================================================
// Draw Error Message in a grey box
export function drawErrorMessage(HTMLDrawingName, NameToPrint, ErrorMsgToPrint, svgWidth, svgHeight) {

  // dimension svg element
  let svg = document.getElementById(HTMLDrawingName);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);

  // Erase previous content (drawing + text)
  svg.innerHTML = '';

  // Positions in SVG
  const fontSize = 14; // Font size
  const yTextName = 0; // Y-Position of the text
  const xTextName = 0; // X-Position of the text

  const lineWidth = 6; // Line width for consistency
  const errorBoxColor = '#DDDDDD'; // Color of the error box (same grey as noPWMboxColor)

  const yMarginText2Box = 7; // Margin from text to box
  const yMarginBox2Bottom = 1; // Margin from box to bottom of SVG
  const yBoxTop = fontSize + yMarginText2Box; // y-Position of box top
  const yBoxBottom = svgHeight - yMarginBox2Bottom; // y-Position of box bottom

  // Draw the grey error box
  let errorRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');  
  errorRect.setAttribute('x', 0);
  errorRect.setAttribute('y', yBoxTop); // y-Position of the top edge of the rectangle
  errorRect.setAttribute('width', svgWidth); // fill the entire width of the SVG
  errorRect.setAttribute('height', yBoxBottom - yBoxTop); // height of the rectangle
  errorRect.setAttribute('fill', errorBoxColor);
  svg.appendChild(errorRect);

  // Title Label (NameToPrint)
  const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleText.setAttribute('x', xTextName); // Distance from left edge
  titleText.setAttribute('y', yTextName); // Distance from top edge
  titleText.setAttribute('fill', 'black');
  titleText.setAttribute('font-size', fontSize);
  titleText.setAttribute('font-family', 'sans-serif');
  titleText.setAttribute('dominant-baseline', 'hanging'); // Vertical alignment
  titleText.textContent = NameToPrint;
  svg.appendChild(titleText);

  // Error Message Label (ErrorMsgToPrint) - left aligned inside the grey box, vertically centered
  const errorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  errorText.setAttribute('x', 10); // Small margin from left edge of box
  errorText.setAttribute('y', yBoxTop + (yBoxBottom - yBoxTop) / 2); // Vertically centered in the box
  errorText.setAttribute('fill', 'black');
  errorText.setAttribute('font-size', fontSize);
  errorText.setAttribute('font-family', 'sans-serif');
  errorText.setAttribute('dominant-baseline', 'central'); // Vertical alignment: perfectly center the text on the y position
  errorText.textContent = ErrorMsgToPrint;
  svg.appendChild(errorText);
}

// ===================================================================================
// Draw Bit Timing Legend as SVG
// Items are placed left-to-right and wrap to the next row when exceeding svgWidth.
export function drawBTLegend(HTMLDrawingName, svgWidth) {

  // define colors (same as in drawBitTiming)
  const syncSegColor = '#555555';
  const PropSegColor = '#FFD000';
  const PhaseSeg1Color = '#4CAF50';
  const spColor = '#FF0000';
  const PhaseSeg2Color = '#2196F3';
  const sspColor = '#800080';
  const sjwColor = '#999999';
  const textColor = 'black';

  // Legend items: color swatch + label
  const items = [
    { color: syncSegColor, label: 'SyncSeg' },
    { color: PropSegColor, label: 'PropSeg' },
    { color: PhaseSeg1Color, label: 'PhaseSeg1' },
    { color: spColor, label: 'SP' },
    { color: PhaseSeg2Color, label: 'PhaseSeg2' },
    { color: sspColor, label: 'SSP Offset' },
    { color: sjwColor, label: 'SJW' },
  ];

  // Layout constants
  const fontSize = 14;
  const itemGap = 12; // gap between legend items
  const swatchTextGap = 4; // gap between swatch and label text
  const rowHeight = fontSize + 6; // vertical spacing per row
  const charWidth = fontSize * 0.6; // estimated character width
  const swatchSize = fontSize; // color swatch width & height

  // Measure items and lay them out with wrapping
  let x = 0;
  let y = 0;
  const positions = []; // {x, y, color, label} for each item

  for (const item of items) {
    const labelWidth = item.label.length * charWidth;
    const totalItemWidth = swatchSize + swatchTextGap + labelWidth;

    // Wrap to next row if this item would exceed svgWidth (unless it's the first item on the row)
    if (x > 0 && x + totalItemWidth > svgWidth) {
      x = 0;
      y += rowHeight;
    }

    positions.push({ x, y, color: item.color, label: item.label });
    x += totalItemWidth + itemGap;
  }

  const svgHeight = y + rowHeight;

  // SVG setup
  const svg = document.getElementById(HTMLDrawingName);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.innerHTML = '';

  const ns = 'http://www.w3.org/2000/svg';

  // Draw each legend item
  for (const pos of positions) {
    // Color swatch
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', pos.x);
    rect.setAttribute('y', pos.y + (rowHeight - swatchSize) / 2);
    rect.setAttribute('width', swatchSize);
    rect.setAttribute('height', swatchSize);
    rect.setAttribute('fill', pos.color);
    svg.appendChild(rect);

    // Label text
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', pos.x + swatchSize + swatchTextGap);
    text.setAttribute('y', pos.y + rowHeight / 2);
    text.setAttribute('fill', textColor);
    text.setAttribute('font-size', fontSize);
    text.setAttribute('font-family', 'sans-serif');
    text.setAttribute('dominant-baseline', 'central');
    text.textContent = pos.label;
    svg.appendChild(text);
  }
}


// ===================================================================================
// Draw Phase Margin 1 (PM1) diagram
// See SPECIFICATION_PM1_DRAWING.md for detailed specification.
//
// Line 1: RX Signal waveform (30% preceding bit + stuff bit + break + Bit 11 + stuff bit)
// Line 2: Node internal view (rectangles with SP lines, shifted by 1 tq + phase error)
// Vertical bars: TQ (blue), Phase Error (green), PM1 (red)
// Labels with connector lines below the bars.
export function drawPM1(pmValue, bt_d, ps2_d, spFraction, df_used, BRP, clk_period, HTMLDrawingName, svgWidth) {
  const S_Stuff = 11;

  // --- Configurable layout constants ---
  const showSPvalue = true; // true: display "SP xx%" label, false: display "SP" only
  const svgPadding = 5; // padding inside the SVG around the figure

  const titleFontSize = 14;
  const titleBold = true;
  const labelFontSize = 14;
  const lineLabelBold = false;
  const valueLabelBold = false;

  const waveLineHeight = 25;
  const waveLineColor = '#333333';
  const waveLineWidth = 3;
  
  const spColor = '#FF0000'; //'#2196F3';
  const spLineWidth = 3;
  
  const pm1BarColor = 'rgba(255, 156, 35, 0.4)'; // rosa: 'rgba(255, 100, 100, 0.3)'
  const phaseErrorBarColor = 'rgba(100, 255, 100, 0.3)';
  const tqBarColor = 'rgba(82, 146, 255, 0.3)';

  const bitFillColor = '#CCCCCC';
  const bitStrokeColor = '#000000';
  const breakIndicatorColor = '#888888';
  const breakIndicatorWidth = 1.5;
  const breakIndicatorExceedBit = 5;
  const rowLabelColor = '#000000';
  const errorBoxColor = '#DDDDDD';
  const labelColor = 'black';
  const connectorColor = 'black';
  
  const gap_title_to_label = 10;
  const gap_label_to_line = 8;
  const gap_Line1_Line2 = 20;
  const bar_exceed_top = 5;
  const bar_exceed_bottom = 20;
  const gap_bars_to_labels = 13;
  const SP_text_gap = 3;
  const sp_exceed_top = 10; // how many pixels the SP line exceeds above the top of the bit in Line 2
  const connector_line_width = 1; // width of the connector lines from bars to labels
  const gap_connector_to_label = 4; // gap in px between connector line end and value label
  const vertical_bar_min_width = 1;
  const breakWidth = 30;
  const Line1PrecedingBitFraction = 0.3;

  // Bit separator parameters
  const bitSeparatorExceedBit = 5;
  const bitSeparatorDash = '4,2'; // dash pattern for bit separator lines (3px dash, 1px gap)
  const bitSeparatorColor = 'red';
  const bitSeparatorWidth = 1;

  // Bit separator connector line parameters (connects matching separators between Line 1 and Line 2)
  const bitSepConnectorDash = '4,2'; // dash pattern for bit separator connector lines (4px dash, 2px gap)
  const bitSepConnectorColor = '#CCCCCC';
  const bitSepConnectorWidth = 1;

  // Title and row label texts
  const titleText = 'Phase Margin 1 (PM1)';
  const line1Label = 'RX Signal';
  const line2Label = 'Node internal view';

  // Bit label texts
  const line1Bit1 = 'Stuff Bit';
  const line1Bit2 = 'Bit 11';
  const line1Bit3 = 'Stuff Bit';
  const line2Bit1 = 'Stuff Bit';
  const line2Bit2 = 'Bit 11';
  const line2Bit3 = 'Stuff Bit';

  // --- Vertical layout ---
  const y_title = 0;
  const y_line1_label = titleFontSize + gap_title_to_label;
  const y_line1_top = y_line1_label + labelFontSize + gap_label_to_line;
  const y_line1_bottom = y_line1_top + waveLineHeight;
  const y_line2_label = y_line1_bottom + gap_Line1_Line2;
  const y_line2_top = y_line2_label + labelFontSize + gap_label_to_line;
  const y_line2_bottom = y_line2_top + waveLineHeight;
  const y_bars_top = y_line1_top - bar_exceed_top;
  const y_bars_bottom = y_line2_bottom + bar_exceed_bottom;
  const y_bars_height = y_bars_bottom - y_bars_top;
  const y_labels_line = y_bars_bottom + gap_bars_to_labels;
  const svgHeight = y_labels_line + labelFontSize + 4;

  // Content width excludes padding on both sides
  const contentWidth = svgWidth - 2 * svgPadding;

  // Waveform levels (Line 1)
  const y_high = y_line1_top;   // recessive
  const y_low = y_line1_bottom; // dominant

  // --- SVG setup ---
  const svg = document.getElementById(HTMLDrawingName);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight + 2 * svgPadding);
  svg.innerHTML = '';
  svg.style.backgroundColor = 'white';

  const ns = 'http://www.w3.org/2000/svg';

  // Content group: translates all content by padding
  const contentGroup = document.createElementNS(ns, 'g');
  contentGroup.setAttribute('transform', `translate(${svgPadding},${svgPadding})`);

  // Text group: appended to content group last so all labels render on top of lines/shapes
  const textGroup = document.createElementNS(ns, 'g');

  function addText(x, y, text, size, color, anchor, baseline, bold) {
    const el = document.createElementNS(ns, 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('fill', color);
    el.setAttribute('font-size', size);
    el.setAttribute('font-family', 'sans-serif');
    el.setAttribute('text-anchor', anchor || 'start');
    el.setAttribute('dominant-baseline', baseline || 'hanging');
    if (bold) el.setAttribute('font-weight', 'bold');
    el.textContent = text;
    contentGroup.appendChild(el);
    return el;
  }

  function addTextOnTop(x, y, text, size, color, anchor, baseline, bold) {
    const el = document.createElementNS(ns, 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('fill', color);
    el.setAttribute('font-size', size);
    el.setAttribute('font-family', 'sans-serif');
    el.setAttribute('text-anchor', anchor || 'start');
    el.setAttribute('dominant-baseline', baseline || 'hanging');
    if (bold) el.setAttribute('font-weight', 'bold');
    el.textContent = text;
    textGroup.appendChild(el);
    return el;
  }

  function addRect(x, y, w, h, fill, stroke, sw) {
    const el = document.createElementNS(ns, 'rect');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('width', Math.max(w, 0));
    el.setAttribute('height', h);
    el.setAttribute('fill', fill);
    if (stroke) {
      el.setAttribute('stroke', stroke);
      el.setAttribute('stroke-width', sw || 1);
    }
    contentGroup.appendChild(el);
  }

  function addDashedLine(x1, y1, x2, y2, color, width, dash) {
    const el = document.createElementNS(ns, 'line');
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2);
    el.setAttribute('stroke', color);
    el.setAttribute('stroke-width', width);
    if (dash) el.setAttribute('stroke-dasharray', dash);
    contentGroup.appendChild(el);
  }

  function addLine(x1, y1, x2, y2, color, width) {
    const el = document.createElementNS(ns, 'line');
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2);
    el.setAttribute('stroke', color);
    el.setAttribute('stroke-width', width);
    contentGroup.appendChild(el);
  }

  // --- Title ---
  addTextOnTop(0, y_title, titleText, titleFontSize, 'black', 'start', 'hanging', titleBold);

  // --- Error handling ---
  if (typeof pmValue === 'string') {
    addRect(0, y_line1_label, contentWidth, svgHeight - y_line1_label, errorBoxColor);
    addText(10, (y_line1_label + svgHeight) / 2, pmValue, titleFontSize, 'black', 'start', 'central');
    contentGroup.appendChild(textGroup);
    svg.appendChild(contentGroup);
    return;
  }

  // ============================
  // Horizontal geometry
  // ============================
  // Line 1: 0.3*bit + 1 bit (stuff) + break + 1 bit (Bit 11) + 1 bit (stuff) = 3.3 bits + breakWidth = contentWidth
  const bitPxL1 = (contentWidth - breakWidth) / (Line1PrecedingBitFraction + 3);
  const bitPxL2 = bitPxL1 / (1 + 2 * df_used);
  const tq_px = bitPxL2 / bt_d;

  // --- Line 1 X coordinates ---
  const x_falling_edge = Line1PrecedingBitFraction * bitPxL1;
  const x_zero1_end = x_falling_edge + bitPxL1;
  const x_break_end_L1 = x_zero1_end + breakWidth;
  const x_zero11_end = x_break_end_L1 + bitPxL1;
  const x_rising_edge = x_zero11_end;
  const x_L1_end = x_rising_edge + bitPxL1;

  // --- Line 2 X coordinates ---
  const phase_error_px = bitPxL1 * S_Stuff * 2 * df_used;

  // First stuff bit: shifted 1 tq left of first falling edge
  const x_L2_stuff1_start = x_falling_edge - tq_px;
  const x_L2_stuff1_end = x_L2_stuff1_start + bitPxL2;

  // Second stuff bit: shifted left from rising edge by 1 tq + phase error
  const x_L2_stuff2_start = x_rising_edge - tq_px - phase_error_px;
  const x_L2_stuff2_end = x_L2_stuff2_start + bitPxL2;

  // Bit 11 in Line 2 (immediately before second stuff bit)
  const x_L2_bit11_start = x_L2_stuff2_start - bitPxL2;
  const x_L2_bit11_end = x_L2_stuff2_start;

  // SP positions in Line 2
  const sp_stuff1_x = x_L2_stuff1_start + spFraction * bitPxL2;
  const sp_bit11_x = x_L2_bit11_start + spFraction * bitPxL2;
  const sp_stuff2_x = x_L2_stuff2_start + spFraction * bitPxL2;

  // --- Computed values for labels ---
  const tq_ns = BRP * clk_period;
  const phase_error_ns = (bt_d - ps2_d - 1) * BRP * clk_period / (1 + df_used) - pmValue; // ps1 = bt - ps2 - 1

  // --- Bar dimensions (clamped to min width) ---
  const tq_bar_w = Math.max(tq_px, vertical_bar_min_width);
  const pe_bar_x = x_L2_stuff2_start + tq_px;
  const pe_bar_w = Math.max(phase_error_px, vertical_bar_min_width);
  const pm1_bar_x = x_rising_edge;
  const pm1_bar_w = Math.max(sp_stuff2_x - x_rising_edge, vertical_bar_min_width);

  // ============================
  // DRAWING (background → foreground)
  // ============================

  // --- 1. Vertical bars (background) ---
  // TQ bar 1 (at first stuff bit start in Line 2)
  addRect(x_L2_stuff1_start, y_bars_top, tq_bar_w, y_bars_height, tqBarColor);
  // TQ bar 2 (at second stuff bit start in Line 2)
  addRect(x_L2_stuff2_start, y_bars_top, tq_bar_w, y_bars_height, tqBarColor);
  // Phase Error bar
  addRect(pe_bar_x, y_bars_top, pe_bar_w, y_bars_height, phaseErrorBarColor);
  // PM1 bar
  addRect(pm1_bar_x, y_bars_top, pm1_bar_w, y_bars_height, pm1BarColor);

  // --- 2. Line 1: RX Signal ---
  addTextOnTop(0, y_line1_label, line1Label, labelFontSize, rowLabelColor, 'start', 'hanging', lineLabelBold);

  // Waveform path (before break): preceding bit (high) → falling edge → first zero bit (low)
  const pathBefore = document.createElementNS(ns, 'path');
  pathBefore.setAttribute('d', `M 0,${y_high} H ${x_falling_edge} V ${y_low} H ${x_zero1_end}`);
  pathBefore.setAttribute('stroke', waveLineColor);
  pathBefore.setAttribute('stroke-width', waveLineWidth);
  pathBefore.setAttribute('fill', 'none');
  contentGroup.appendChild(pathBefore);

  // Waveform path (after break): last zero bit (low) → rising edge → stuff bit (high)
  const pathAfter = document.createElementNS(ns, 'path');
  pathAfter.setAttribute('d', `M ${x_break_end_L1},${y_low} H ${x_zero11_end} V ${y_high} H ${x_L1_end}`);
  pathAfter.setAttribute('stroke', waveLineColor);
  pathAfter.setAttribute('stroke-width', waveLineWidth);
  pathAfter.setAttribute('fill', 'none');
  contentGroup.appendChild(pathAfter);

  // Break indicator for Line 1 (two S-shaped waves with spacing)
  const breakMidL1 = (x_zero1_end + x_break_end_L1) / 2;
  const breakL1_top = y_line1_top - breakIndicatorExceedBit;
  const breakL1_bottom = y_line1_bottom + breakIndicatorExceedBit;
  const breakL1_midY = (breakL1_top + breakL1_bottom) / 2;
  const breakL1_path1 = document.createElementNS(ns, 'path');
  breakL1_path1.setAttribute('d', `M ${breakMidL1 - 2},${breakL1_bottom} C ${breakMidL1 - 2 + 6},${breakL1_midY} ${breakMidL1 - 2 - 6},${breakL1_midY} ${breakMidL1 - 2},${breakL1_top}`);
  breakL1_path1.setAttribute('stroke', breakIndicatorColor);
  breakL1_path1.setAttribute('stroke-width', breakIndicatorWidth);
  breakL1_path1.setAttribute('fill', 'none');
  contentGroup.appendChild(breakL1_path1);
  const breakL1_path2 = document.createElementNS(ns, 'path');
  breakL1_path2.setAttribute('d', `M ${breakMidL1 + 2},${breakL1_bottom} C ${breakMidL1 + 2 + 6},${breakL1_midY} ${breakMidL1 + 2 - 6},${breakL1_midY} ${breakMidL1 + 2},${breakL1_top}`);
  breakL1_path2.setAttribute('stroke', breakIndicatorColor);
  breakL1_path2.setAttribute('stroke-width', breakIndicatorWidth);
  breakL1_path2.setAttribute('fill', 'none');
  contentGroup.appendChild(breakL1_path2);

  // Bit separators in Line 1 (at bit boundaries, exceeding top and bottom)
  const L1_sep_top = y_line1_top - bitSeparatorExceedBit;
  const L1_sep_bottom = y_line1_bottom + bitSeparatorExceedBit;
  addDashedLine(x_falling_edge, L1_sep_top, x_falling_edge, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_zero1_end, L1_sep_top, x_zero1_end, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_break_end_L1, L1_sep_top, x_break_end_L1, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_zero11_end, L1_sep_top, x_zero11_end, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L1_end, L1_sep_top, x_L1_end, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);

  // Bit name labels in Line 1 (centered in each full bit)
  const bitTextY = y_line1_top + waveLineHeight / 2;
  if (line1Bit1) addTextOnTop(x_falling_edge + bitPxL1 / 2, bitTextY, line1Bit1, labelFontSize - 1, waveLineColor, 'middle', 'central');
  if (line1Bit2) addTextOnTop(x_break_end_L1 + bitPxL1 / 2, bitTextY, line1Bit2, labelFontSize - 1, waveLineColor, 'middle', 'central');
  if (line1Bit3) addTextOnTop(x_rising_edge + bitPxL1 / 2, bitTextY, line1Bit3, labelFontSize - 1, waveLineColor, 'middle', 'central');

  // --- 3. Line 2: Node internal view ---
  addTextOnTop(0, y_line2_label, line2Label, labelFontSize, rowLabelColor, 'start', 'hanging', lineLabelBold);

  // Three rectangles
  addRect(x_L2_stuff1_start, y_line2_top, bitPxL2, waveLineHeight, bitFillColor, bitStrokeColor, 1);
  addRect(x_L2_bit11_start, y_line2_top, bitPxL2, waveLineHeight, bitFillColor, bitStrokeColor, 1);
  addRect(x_L2_stuff2_start, y_line2_top, bitPxL2, waveLineHeight, bitFillColor, bitStrokeColor, 1);

  // Bit separators in Line 2 (at bit boundaries, exceeding top and bottom)
  const L2_sep_top = y_line2_top - bitSeparatorExceedBit;
  const L2_sep_bottom = y_line2_bottom + bitSeparatorExceedBit;
  addDashedLine(x_L2_stuff1_start, L2_sep_top, x_L2_stuff1_start, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L2_stuff1_end, L2_sep_top, x_L2_stuff1_end, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L2_bit11_start, L2_sep_top, x_L2_bit11_start, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L2_bit11_end, L2_sep_top, x_L2_bit11_end, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L2_stuff2_end, L2_sep_top, x_L2_stuff2_end, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);

  // Connector lines between matching bit separators in Line 1 and Line 2
  addDashedLine(x_falling_edge, L1_sep_bottom, x_L2_stuff1_start, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);
  addDashedLine(x_zero1_end, L1_sep_bottom, x_L2_stuff1_end, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);
  addDashedLine(x_break_end_L1, L1_sep_bottom, x_L2_bit11_start, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);
  addDashedLine(x_zero11_end, L1_sep_bottom, x_L2_bit11_end, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);
  addDashedLine(x_L1_end, L1_sep_bottom, x_L2_stuff2_end, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);

  // Bit name labels in Line 2 (centered in each rectangle)
  const bitTextY_L2 = y_line2_top + waveLineHeight / 2;
  if (line2Bit1) addTextOnTop(x_L2_stuff1_start + bitPxL2 / 2, bitTextY_L2, line2Bit1, labelFontSize - 1, waveLineColor, 'middle', 'central');
  if (line2Bit2) addTextOnTop(x_L2_bit11_start + bitPxL2 / 2, bitTextY_L2, line2Bit2, labelFontSize - 1, waveLineColor, 'middle', 'central');
  if (line2Bit3) addTextOnTop(x_L2_stuff2_start + bitPxL2 / 2, bitTextY_L2, line2Bit3, labelFontSize - 1, waveLineColor, 'middle', 'central');

  // SP lines (from bottom of bit, exceeding top by sp_exceed_top)
  const sp_y_bottom = y_line2_bottom;
  const sp_y_top = y_line2_top - sp_exceed_top;

  addLine(sp_stuff1_x, sp_y_bottom, sp_stuff1_x, sp_y_top, spColor, spLineWidth);
  addLine(sp_bit11_x, sp_y_bottom, sp_bit11_x, sp_y_top, spColor, spLineWidth);
  addLine(sp_stuff2_x, sp_y_bottom, sp_stuff2_x, sp_y_top, spColor, spLineWidth);

  // "SP" text above the rightmost stuff bit's SP line only
  const spText_PM1 = showSPvalue ? `SP ${Math.round(spFraction * 100)}%` : 'SP';
  addTextOnTop(sp_stuff2_x, sp_y_top - SP_text_gap, spText_PM1, labelFontSize - 1, spColor, 'middle', 'auto');

  // Break indicator for Line 2 (two S-shaped waves with spacing)
  const breakMidL2 = (x_L2_stuff1_end + x_L2_bit11_start) / 2;
  const breakL2_top = y_line2_top - breakIndicatorExceedBit;
  const breakL2_bottom = y_line2_bottom + breakIndicatorExceedBit;
  const breakL2_midY = (breakL2_top + breakL2_bottom) / 2;
  const breakL2_path1 = document.createElementNS(ns, 'path');
  breakL2_path1.setAttribute('d', `M ${breakMidL2 - 2},${breakL2_bottom} C ${breakMidL2 - 2 + 6},${breakL2_midY} ${breakMidL2 - 2 - 6},${breakL2_midY} ${breakMidL2 - 2},${breakL2_top}`);
  breakL2_path1.setAttribute('stroke', breakIndicatorColor);
  breakL2_path1.setAttribute('stroke-width', breakIndicatorWidth);
  breakL2_path1.setAttribute('fill', 'none');
  contentGroup.appendChild(breakL2_path1);
  const breakL2_path2 = document.createElementNS(ns, 'path');
  breakL2_path2.setAttribute('d', `M ${breakMidL2 + 2},${breakL2_bottom} C ${breakMidL2 + 2 + 6},${breakL2_midY} ${breakMidL2 + 2 - 6},${breakL2_midY} ${breakMidL2 + 2},${breakL2_top}`);
  breakL2_path2.setAttribute('stroke', breakIndicatorColor);
  breakL2_path2.setAttribute('stroke-width', breakIndicatorWidth);
  breakL2_path2.setAttribute('fill', 'none');
  contentGroup.appendChild(breakL2_path2);

  // --- 4. Labels and connector lines ---
  const tq_label_text = `tq = ${tq_ns.toFixed(2)} ns`;
  const pe_label_text = `Phase Error = ${phase_error_ns.toFixed(2)} ns`;
  const pm1_label_text = `PM1 = ${pmValue.toFixed(2)} ns`;

  // Estimate character width (approx 0.45 * fontSize per character for sans-serif)
  const charW = labelFontSize * 0.45;

  addTextOnTop(0, y_labels_line, tq_label_text, labelFontSize, labelColor, 'start', 'hanging', valueLabelBold);
  addTextOnTop(contentWidth / 2 - 10, y_labels_line, pe_label_text, labelFontSize, labelColor, 'middle', 'hanging', valueLabelBold);
  addTextOnTop(contentWidth, y_labels_line, pm1_label_text, labelFontSize, labelColor, 'end', 'hanging', valueLabelBold);

  // Connector lines: diagonal from bar center bottom to label target position
  const tq1_cx = x_L2_stuff1_start + tq_bar_w / 2;
  const tq2_cx = x_L2_stuff2_start + tq_bar_w / 2;
  const pe_cx = pe_bar_x + pe_bar_w / 2;
  const pm1_cx = pm1_bar_x + pm1_bar_w / 2;

  const tq_label_w = tq_label_text.length * charW;
  const pe_label_w = pe_label_text.length * charW;
  const pm1_label_w = pm1_label_text.length * charW;

  // TQ label starts at x=0 (anchor=start), middle = half width
  const tq_label_mid = tq_label_w / 2;
  // TQ bar 1: diagonal to middle of label
  addLine(tq1_cx, y_bars_bottom, tq_label_mid, y_labels_line - gap_connector_to_label, connectorColor, connector_line_width);
  // TQ bar 2: diagonal to 10px right of middle of label
  addLine(tq2_cx, y_bars_bottom, tq_label_mid + 10, y_labels_line - gap_connector_to_label, connectorColor, connector_line_width);

  // Phase Error label centered at contentWidth/2 - 10 (anchor=middle), end = center + half width
  const pe_label_end = contentWidth / 2 - 10 + pe_label_w / 2;
  addLine(pe_cx, y_bars_bottom, pe_label_end, y_labels_line - gap_connector_to_label, connectorColor, connector_line_width);

  // PM1 label ends at contentWidth (anchor=end), middle = contentWidth - half width
  const pm1_label_mid = contentWidth - pm1_label_w / 2;
  addLine(pm1_cx, y_bars_bottom, pm1_label_mid, y_labels_line - gap_connector_to_label, connectorColor, connector_line_width);

  // Append text group to content group, then content group to SVG
  contentGroup.appendChild(textGroup);
  svg.appendChild(contentGroup);
}

// ===================================================================================
// Draw Phase Margin 2 (PM2) diagram
// Similar to PM1 but:
// - Line 2 bits are longer (slower clock): bitPxL2 = bitPxL1 * (1 + 2*df_used)
// - No quantization error (no tq offset)
// - SP label above Bit 11 in Line 2
// - PM2 = SP of Bit 11 in Line 2 → rising edge in Line 1
// - Phase Error = rising edge in Line 1 → bit 11 end in Line 2
export function drawPM2(pmValue, bt_d, ps2_d, spFraction, df_used, BRP, clk_period, HTMLDrawingName, svgWidth) {
  const S_Stuff = 11;

  // --- Configurable layout constants ---
  const showSPvalue = true; // true: display "SP xx%" label, false: display "SP" only
  const svgPadding = 5;

  const titleFontSize = 14;
  const titleBold = true;
  const labelFontSize = 14;
  const lineLabelBold = false;
  const valueLabelBold = false;

  const waveLineHeight = 25;
  const waveLineColor = '#333333';
  const waveLineWidth = 3;

  const spColor = '#FF0000'; //'#2196F3';
  const spLineWidth = 3;

  const pm2BarColor = 'rgba(255, 156, 35, 0.4)'; // rosa: 'rgba(255, 100, 100, 0.3)';
  const phaseErrorBarColor = 'rgba(100, 255, 100, 0.3)';

  const bitFillColor = '#CCCCCC';
  const bitStrokeColor = '#000000';
  const breakIndicatorColor = '#888888';
  const breakIndicatorWidth = 1.5;
  const breakIndicatorExceedBit = 5;
  const rowLabelColor = '#000000';
  const errorBoxColor = '#DDDDDD';
  const labelColor = 'black';
  const connectorColor = 'black';

  const gap_title_to_label = 10;
  const gap_label_to_line = 8;
  const gap_Line1_Line2 = 20;
  const bar_exceed_top = 5;
  const bar_exceed_bottom = 20;
  const gap_bars_to_labels = 13;
  const SP_text_gap = 3;
  const sp_exceed_top = 10;
  const connector_line_width = 1;
  const gap_connector_to_label = 4;
  const vertical_bar_min_width = 1;
  const breakWidth = 30;
  const Line1PrecedingBitFraction = 0.3;

  // Bit separator parameters
  const bitSeparatorExceedBit = 5;
  const bitSeparatorDash = '4,2';
  const bitSeparatorColor = 'red';
  const bitSeparatorWidth = 1;

  // Bit separator connector line parameters
  const bitSepConnectorDash = '4,2';
  const bitSepConnectorColor = '#CCCCCC';
  const bitSepConnectorWidth = 1;

  // Title and row label texts
  const titleText = 'Phase Margin 2 (PM2)';
  const line1Label = 'RX Signal';
  const line2Label = 'Node internal view';

  // Bit label texts
  const line1Bit1 = 'Stuff Bit';
  const line1Bit2 = 'Bit 11';
  const line1Bit3 = 'Stuff Bit';
  const line2Bit1 = 'Stuff Bit';
  const line2Bit2 = 'Bit 11';
  const line2Bit3 = 'Stuff Bit';

  // --- Vertical layout ---
  const y_title = 0;
  const y_line1_label = titleFontSize + gap_title_to_label;
  const y_line1_top = y_line1_label + labelFontSize + gap_label_to_line;
  const y_line1_bottom = y_line1_top + waveLineHeight;
  const y_line2_label = y_line1_bottom + gap_Line1_Line2;
  const y_line2_top = y_line2_label + labelFontSize + gap_label_to_line;
  const y_line2_bottom = y_line2_top + waveLineHeight;
  const y_bars_top = y_line1_top - bar_exceed_top;
  const y_bars_bottom = y_line2_bottom + bar_exceed_bottom;
  const y_bars_height = y_bars_bottom - y_bars_top;
  const y_labels_line = y_bars_bottom + gap_bars_to_labels;
  const svgHeight = y_labels_line + labelFontSize + 4;

  const contentWidth = svgWidth - 2 * svgPadding;

  // Waveform levels (Line 1)
  const y_high = y_line1_top;
  const y_low = y_line1_bottom;

  // --- SVG setup ---
  const svg = document.getElementById(HTMLDrawingName);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight + 2 * svgPadding);
  svg.innerHTML = '';
  svg.style.backgroundColor = 'white';

  const ns = 'http://www.w3.org/2000/svg';

  const contentGroup = document.createElementNS(ns, 'g');
  contentGroup.setAttribute('transform', `translate(${svgPadding},${svgPadding})`);

  const textGroup = document.createElementNS(ns, 'g');

  function addText(x, y, text, size, color, anchor, baseline, bold) {
    const el = document.createElementNS(ns, 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('fill', color);
    el.setAttribute('font-size', size);
    el.setAttribute('font-family', 'sans-serif');
    el.setAttribute('text-anchor', anchor || 'start');
    el.setAttribute('dominant-baseline', baseline || 'hanging');
    if (bold) el.setAttribute('font-weight', 'bold');
    el.textContent = text;
    contentGroup.appendChild(el);
    return el;
  }

  function addTextOnTop(x, y, text, size, color, anchor, baseline, bold) {
    const el = document.createElementNS(ns, 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('fill', color);
    el.setAttribute('font-size', size);
    el.setAttribute('font-family', 'sans-serif');
    el.setAttribute('text-anchor', anchor || 'start');
    el.setAttribute('dominant-baseline', baseline || 'hanging');
    if (bold) el.setAttribute('font-weight', 'bold');
    el.textContent = text;
    textGroup.appendChild(el);
    return el;
  }

  function addRect(x, y, w, h, fill, stroke, sw) {
    const el = document.createElementNS(ns, 'rect');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('width', Math.max(w, 0));
    el.setAttribute('height', h);
    el.setAttribute('fill', fill);
    if (stroke) {
      el.setAttribute('stroke', stroke);
      el.setAttribute('stroke-width', sw || 1);
    }
    contentGroup.appendChild(el);
  }

  function addDashedLine(x1, y1, x2, y2, color, width, dash) {
    const el = document.createElementNS(ns, 'line');
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2);
    el.setAttribute('stroke', color);
    el.setAttribute('stroke-width', width);
    if (dash) el.setAttribute('stroke-dasharray', dash);
    contentGroup.appendChild(el);
  }

  function addLine(x1, y1, x2, y2, color, width) {
    const el = document.createElementNS(ns, 'line');
    el.setAttribute('x1', x1);
    el.setAttribute('y1', y1);
    el.setAttribute('x2', x2);
    el.setAttribute('y2', y2);
    el.setAttribute('stroke', color);
    el.setAttribute('stroke-width', width);
    contentGroup.appendChild(el);
  }

  // --- Title ---
  addTextOnTop(0, y_title, titleText, titleFontSize, 'black', 'start', 'hanging', titleBold);

  // --- Error handling ---
  if (typeof pmValue === 'string') {
    addRect(0, y_line1_label, contentWidth, svgHeight - y_line1_label, errorBoxColor);
    addText(10, (y_line1_label + svgHeight) / 2, pmValue, titleFontSize, 'black', 'start', 'central');
    contentGroup.appendChild(textGroup);
    svg.appendChild(contentGroup);
    return;
  }

  // ============================
  // Horizontal geometry
  // ============================
  // Line 1 scaled to leave room for Line 2 (longer bits + phase error of 12 bits: stuff + 10 + stuff)
  const extraSpaceL2 = 12 * 2 * df_used; // additional horizontal fraction needed for Line 2
  const bitPxL1 = (contentWidth - breakWidth) / (Line1PrecedingBitFraction + 3 + extraSpaceL2);
  // Line 2: bits are LONGER (slower clock)
  const bitPxL2 = bitPxL1 * (1 + 2 * df_used);

  // --- Line 1 X coordinates ---
  const x_falling_edge = Line1PrecedingBitFraction * bitPxL1;
  const x_zero1_end = x_falling_edge + bitPxL1;
  const x_break_end_L1 = x_zero1_end + breakWidth;
  const x_zero11_end = x_break_end_L1 + bitPxL1;
  const x_rising_edge = x_zero11_end;
  const x_L1_end = x_rising_edge + bitPxL1;

  // --- Line 2 X coordinates ---
  const phase_error_px = bitPxL1 * S_Stuff * 2 * df_used;

  // First stuff bit: starts exactly at falling edge (no tq offset in PM2)
  const x_L2_stuff1_start = x_falling_edge;
  const x_L2_stuff1_end = x_L2_stuff1_start + bitPxL2;

  // Bit 11 end is shifted right of rising edge by phase error
  const x_L2_bit11_end = x_rising_edge + phase_error_px;
  const x_L2_bit11_start = x_L2_bit11_end - bitPxL2;

  // Second stuff bit: immediately after Bit 11
  const x_L2_stuff2_start = x_L2_bit11_end;
  const x_L2_stuff2_end = x_L2_stuff2_start + bitPxL2;

  // SP positions in Line 2
  const sp_stuff1_x = x_L2_stuff1_start + spFraction * bitPxL2;
  const sp_bit11_x = x_L2_bit11_start + spFraction * bitPxL2;
  const sp_stuff2_x = x_L2_stuff2_start + spFraction * bitPxL2;

  // --- Computed values for labels ---
  const phase_error_ns = ps2_d * BRP * clk_period / (1 - df_used) - pmValue;

  // --- Bar dimensions (clamped to min width) ---
  // PM2 bar: from SP of Bit 11 to rising edge
  const pm2_bar_x = sp_bit11_x;
  const pm2_bar_w = Math.max(x_rising_edge - sp_bit11_x, vertical_bar_min_width);
  // Phase Error bar: from rising edge to Bit 11 end in Line 2
  const pe_bar_x = x_rising_edge;
  const pe_bar_w = Math.max(phase_error_px, vertical_bar_min_width);

  // ============================
  // DRAWING (background → foreground)
  // ============================

  // --- 1. Vertical bars (background) ---
  // Phase Error bar
  addRect(pe_bar_x, y_bars_top, pe_bar_w, y_bars_height, phaseErrorBarColor);
  // PM2 bar
  addRect(pm2_bar_x, y_bars_top, pm2_bar_w, y_bars_height, pm2BarColor);

  // --- 2. Line 1: RX Signal ---
  addTextOnTop(0, y_line1_label, line1Label, labelFontSize, rowLabelColor, 'start', 'hanging', lineLabelBold);

  // Waveform path (before break)
  const pathBefore = document.createElementNS(ns, 'path');
  pathBefore.setAttribute('d', `M 0,${y_high} H ${x_falling_edge} V ${y_low} H ${x_zero1_end}`);
  pathBefore.setAttribute('stroke', waveLineColor);
  pathBefore.setAttribute('stroke-width', waveLineWidth);
  pathBefore.setAttribute('fill', 'none');
  contentGroup.appendChild(pathBefore);

  // Waveform path (after break)
  const pathAfter = document.createElementNS(ns, 'path');
  pathAfter.setAttribute('d', `M ${x_break_end_L1},${y_low} H ${x_zero11_end} V ${y_high} H ${x_L1_end}`);
  pathAfter.setAttribute('stroke', waveLineColor);
  pathAfter.setAttribute('stroke-width', waveLineWidth);
  pathAfter.setAttribute('fill', 'none');
  contentGroup.appendChild(pathAfter);

  // Break indicator for Line 1
  const breakMidL1 = (x_zero1_end + x_break_end_L1) / 2;
  const breakL1_top = y_line1_top - breakIndicatorExceedBit;
  const breakL1_bottom = y_line1_bottom + breakIndicatorExceedBit;
  const breakL1_midY = (breakL1_top + breakL1_bottom) / 2;
  const breakL1_path1 = document.createElementNS(ns, 'path');
  breakL1_path1.setAttribute('d', `M ${breakMidL1 - 2},${breakL1_bottom} C ${breakMidL1 - 2 + 6},${breakL1_midY} ${breakMidL1 - 2 - 6},${breakL1_midY} ${breakMidL1 - 2},${breakL1_top}`);
  breakL1_path1.setAttribute('stroke', breakIndicatorColor);
  breakL1_path1.setAttribute('stroke-width', breakIndicatorWidth);
  breakL1_path1.setAttribute('fill', 'none');
  contentGroup.appendChild(breakL1_path1);
  const breakL1_path2 = document.createElementNS(ns, 'path');
  breakL1_path2.setAttribute('d', `M ${breakMidL1 + 2},${breakL1_bottom} C ${breakMidL1 + 2 + 6},${breakL1_midY} ${breakMidL1 + 2 - 6},${breakL1_midY} ${breakMidL1 + 2},${breakL1_top}`);
  breakL1_path2.setAttribute('stroke', breakIndicatorColor);
  breakL1_path2.setAttribute('stroke-width', breakIndicatorWidth);
  breakL1_path2.setAttribute('fill', 'none');
  contentGroup.appendChild(breakL1_path2);

  // Bit separators in Line 1
  const L1_sep_top = y_line1_top - bitSeparatorExceedBit;
  const L1_sep_bottom = y_line1_bottom + bitSeparatorExceedBit;
  addDashedLine(x_falling_edge, L1_sep_top, x_falling_edge, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_zero1_end, L1_sep_top, x_zero1_end, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_break_end_L1, L1_sep_top, x_break_end_L1, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_zero11_end, L1_sep_top, x_zero11_end, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L1_end, L1_sep_top, x_L1_end, L1_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);

  // Bit name labels in Line 1
  const bitTextY = y_line1_top + waveLineHeight / 2;
  if (line1Bit1) addTextOnTop(x_falling_edge + bitPxL1 / 2, bitTextY, line1Bit1, labelFontSize - 1, waveLineColor, 'middle', 'central');
  if (line1Bit2) addTextOnTop(x_break_end_L1 + bitPxL1 / 2, bitTextY, line1Bit2, labelFontSize - 1, waveLineColor, 'middle', 'central');
  if (line1Bit3) addTextOnTop(x_rising_edge + bitPxL1 / 2, bitTextY, line1Bit3, labelFontSize - 1, waveLineColor, 'middle', 'central');

  // --- 3. Line 2: Node internal view ---
  addTextOnTop(0, y_line2_label, line2Label, labelFontSize, rowLabelColor, 'start', 'hanging', lineLabelBold);

  // Three rectangles
  addRect(x_L2_stuff1_start, y_line2_top, bitPxL2, waveLineHeight, bitFillColor, bitStrokeColor, 1);
  addRect(x_L2_bit11_start, y_line2_top, bitPxL2, waveLineHeight, bitFillColor, bitStrokeColor, 1);
  addRect(x_L2_stuff2_start, y_line2_top, bitPxL2, waveLineHeight, bitFillColor, bitStrokeColor, 1);

  // Bit separators in Line 2
  const L2_sep_top = y_line2_top - bitSeparatorExceedBit;
  const L2_sep_bottom = y_line2_bottom + bitSeparatorExceedBit;
  addDashedLine(x_L2_stuff1_start, L2_sep_top, x_L2_stuff1_start, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L2_stuff1_end, L2_sep_top, x_L2_stuff1_end, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L2_bit11_start, L2_sep_top, x_L2_bit11_start, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L2_bit11_end, L2_sep_top, x_L2_bit11_end, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);
  addDashedLine(x_L2_stuff2_end, L2_sep_top, x_L2_stuff2_end, L2_sep_bottom, bitSeparatorColor, bitSeparatorWidth, bitSeparatorDash);

  // Connector lines between matching bit separators in Line 1 and Line 2
  addDashedLine(x_falling_edge, L1_sep_bottom, x_L2_stuff1_start, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);
  addDashedLine(x_zero1_end, L1_sep_bottom, x_L2_stuff1_end, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);
  addDashedLine(x_break_end_L1, L1_sep_bottom, x_L2_bit11_start, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);
  addDashedLine(x_zero11_end, L1_sep_bottom, x_L2_bit11_end, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);
  addDashedLine(x_L1_end, L1_sep_bottom, x_L2_stuff2_end, L2_sep_top, bitSepConnectorColor, bitSepConnectorWidth, bitSepConnectorDash);

  // Bit name labels in Line 2
  const bitTextY_L2 = y_line2_top + waveLineHeight / 2;
  if (line2Bit1) addTextOnTop(x_L2_stuff1_start + bitPxL2 / 2, bitTextY_L2, line2Bit1, labelFontSize - 1, waveLineColor, 'middle', 'central');
  if (line2Bit2) addTextOnTop(x_L2_bit11_start + bitPxL2 / 2, bitTextY_L2, line2Bit2, labelFontSize - 1, waveLineColor, 'middle', 'central');
  if (line2Bit3) addTextOnTop(x_L2_stuff2_start + bitPxL2 / 2, bitTextY_L2, line2Bit3, labelFontSize - 1, waveLineColor, 'middle', 'central');

  // SP lines
  const sp_y_bottom = y_line2_bottom;
  const sp_y_top = y_line2_top - sp_exceed_top;

  addLine(sp_stuff1_x, sp_y_bottom, sp_stuff1_x, sp_y_top, spColor, spLineWidth);
  addLine(sp_bit11_x, sp_y_bottom, sp_bit11_x, sp_y_top, spColor, spLineWidth);
  addLine(sp_stuff2_x, sp_y_bottom, sp_stuff2_x, sp_y_top, spColor, spLineWidth);

  // "SP" text above Bit 11's SP line (differs from PM1)
  const spText_PM2 = showSPvalue ? `SP ${Math.round(spFraction * 100)}%` : 'SP';
  addTextOnTop(sp_bit11_x, sp_y_top - SP_text_gap, spText_PM2, labelFontSize - 1, spColor, 'middle', 'auto');

  // Break indicator for Line 2
  const breakMidL2 = (x_L2_stuff1_end + x_L2_bit11_start) / 2;
  const breakL2_top = y_line2_top - breakIndicatorExceedBit;
  const breakL2_bottom = y_line2_bottom + breakIndicatorExceedBit;
  const breakL2_midY = (breakL2_top + breakL2_bottom) / 2;
  const breakL2_path1 = document.createElementNS(ns, 'path');
  breakL2_path1.setAttribute('d', `M ${breakMidL2 - 2},${breakL2_bottom} C ${breakMidL2 - 2 + 6},${breakL2_midY} ${breakMidL2 - 2 - 6},${breakL2_midY} ${breakMidL2 - 2},${breakL2_top}`);
  breakL2_path1.setAttribute('stroke', breakIndicatorColor);
  breakL2_path1.setAttribute('stroke-width', breakIndicatorWidth);
  breakL2_path1.setAttribute('fill', 'none');
  contentGroup.appendChild(breakL2_path1);
  const breakL2_path2 = document.createElementNS(ns, 'path');
  breakL2_path2.setAttribute('d', `M ${breakMidL2 + 2},${breakL2_bottom} C ${breakMidL2 + 2 + 6},${breakL2_midY} ${breakMidL2 + 2 - 6},${breakL2_midY} ${breakMidL2 + 2},${breakL2_top}`);
  breakL2_path2.setAttribute('stroke', breakIndicatorColor);
  breakL2_path2.setAttribute('stroke-width', breakIndicatorWidth);
  breakL2_path2.setAttribute('fill', 'none');
  contentGroup.appendChild(breakL2_path2);

  // --- 4. Labels and connector lines ---
  const pe_label_text = `Phase Error = ${phase_error_ns.toFixed(2)} ns`;
  const pm2_label_text = `PM2 = ${pmValue.toFixed(2)} ns`;

  const charW = labelFontSize * 0.45;

  addTextOnTop(0, y_labels_line, pm2_label_text, labelFontSize, labelColor, 'start', 'hanging', valueLabelBold);
  addTextOnTop(contentWidth, y_labels_line, pe_label_text, labelFontSize, labelColor, 'end', 'hanging', valueLabelBold);

  // Connector lines
  const pe_cx = pe_bar_x + pe_bar_w / 2;
  const pm2_cx = pm2_bar_x + pm2_bar_w / 2;

  const pe_label_w = pe_label_text.length * charW;
  const pm2_label_w = pm2_label_text.length * charW;

  // PM2 label at x=0 (anchor=start), middle = half width
  const pm2_label_mid = pm2_label_w / 2;
  addLine(pm2_cx, y_bars_bottom, pm2_label_mid, y_labels_line - gap_connector_to_label, connectorColor, connector_line_width);

  // Phase Error label ends at contentWidth (anchor=end), middle = contentWidth - half width
  const pe_label_mid = contentWidth - pe_label_w / 2;
  addLine(pe_cx, y_bars_bottom, pe_label_mid, y_labels_line - gap_connector_to_label, connectorColor, connector_line_width);

  // Append text group to content group, then content group to SVG
  contentGroup.appendChild(textGroup);
  svg.appendChild(contentGroup);
}

// ===================================================================================
// Trigger a file download from a Blob
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===================================================================================
// Download multiple SVGs combined into a single stacked image (SVG or PNG)
// @param {string[]} svgIds - Array of SVG element IDs to stack vertically
// @param {string} baseName - Base filename (without extension)
// @param {string} imageFormat - 'svg' or 'png'
// @param {number} gap - Vertical gap between stacked SVGs in px
// @param {number} margin - Margin around the entire combined image in px
export function downloadCombinedSVGs(svgIds, baseName, imageFormat, gap, margin) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const pngScaleFactor = 3;

  // Measure total height and max width
  let totalHeight = 0;
  let maxWidth = 0;
  const sources = [];
  for (const id of svgIds) {
    const src = document.getElementById(id);
    const w = parseFloat(src.getAttribute('width'));
    const h = parseFloat(src.getAttribute('height'));
    sources.push({ src, w, h });
    maxWidth = Math.max(maxWidth, w);
    totalHeight += h;
  }
  totalHeight += gap * (svgIds.length - 1);

  // Add margin to total dimensions
  const outerWidth = maxWidth + 2 * margin;
  const outerHeight = totalHeight + 2 * margin;

  // Build a single combined SVG
  const combined = document.createElementNS(svgNS, 'svg');
  combined.setAttribute('xmlns', svgNS);
  combined.setAttribute('width', outerWidth);
  combined.setAttribute('height', outerHeight);
  combined.setAttribute('viewBox', '0 0 ' + outerWidth + ' ' + outerHeight);
  combined.style.backgroundColor = 'white';

  let yOffset = margin;
  for (const { src, w, h } of sources) {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('transform', 'translate(' + margin + ',' + yOffset + ')');
    Array.from(src.childNodes).forEach(n => g.appendChild(n.cloneNode(true)));
    combined.appendChild(g);
    yOffset += h + gap;
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(combined);

  if (imageFormat === 'svg') {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, baseName + '.svg');
  } else if (imageFormat === 'png') {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = outerWidth * pngScaleFactor;
      canvas.height = outerHeight * pngScaleFactor;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(pngScaleFactor, pngScaleFactor);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(function (blob) {
        triggerDownload(blob, baseName + '.png');
      }, 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  }
}