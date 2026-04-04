# Specification: Phase Margin 1 (PM1) SVG Drawing

## Overview

The PM1 drawing visualizes how Phase Margin 1 arises in CAN XL bit timing. It shows the relationship between the actual RX signal (affected by clock deviation) and the node's internal bit timing view, highlighting the time margin (PM1) between a critical signal edge and the sample point.

## Context

- **S_Stuff = 11**: In CAN XL data phase, every 11th bit is a fixed stuff bit. (every 10th bit is followed by a fixed stuff bit)
- **PM1** measures the margin between the **Sample Point (SP)** of the stuff bit (as seen by the receiver's internal timing) and the **rising edge of the previous bit transition** as it actually arrives on the bus (RX signal). PM1 must be positive for correct operation.
- The worst case for PM1 occurs when the transmitter's clock is **slower** than the receiver's clock (`df_used`), causing bit edges to arrive **late** relative to the receiver's expectations.

---

## Drawing Structure

The SVG consists of two horizontal rows (waveform lines) plus a PM1 annotation area. A title is displayed above the drawing.

### Title

- Text: `"Phase Margin 1 (PM1)"`
- Position: top-left of the SVG
- Font: sans-serif, ~11px, black

---

### Line 1: RX Signal (Waveform)

**Purpose:** Shows the actual signal as it appears at the RX pin of the receiving node.

**Label:** `"RX Signal"` — displayed to the left of the waveform.

**Content (left to right):**

1. **30% of the preceding bit (bit before the 11 zero bits)**
   - Shown as a high-level (recessive) waveform segment.
   - Width = 30% of bit length (in pixels, scaled to drawing).
   - This is the tail end of the previous bit, providing visual context.

2. **11 zero bits (dominant)**
   - These 11 bits are at the low (dominant) level. The first bit is a fixed stuff bit. The 11th bit is named 11 bit.
   - **Only the first and last of the 11 zero bits are drawn at full width.**
   - The bits in between (bits 2–10) are **omitted** and replaced by a **visual break indicator** — a vertical zigzag or diagonal break line (similar to a "break" symbol in engineering drawings) — signaling that the middle bits are not shown to save horizontal space.

3. **1 stuff bit**
   - Shown as a high-level (recessive) waveform segment immediately after the 11th zero bit.
   - The **rising edge** at the transition from zero-bit-11 to the stuff bit is a key reference point for the PM1 marking (see below).
   - Width = 1 bit time (same scaling as the zero bits).

**Waveform style:**
- The waveform is drawn as a polyline/path with two levels:
  - **High level (recessive):** upper position of the waveform row.
  - **Low level (dominant):** lower position of the waveform row.
- Transitions between levels are drawn as vertical edges.
- Line color: black or dark grey (`#333`).
- Line width: ~2px.

**Bit time scaling for Line 1 (RX signal):**
- Each shown bit has a width proportional to the SVG width. Means the width of a single bit is determined by the SVG width, so that all bits fit to the SVG. So the width of the bits is static and independet of user parameters.
- No scaling based on df has to be assumed. All the scaling is done on Line 2. This is not 100% exact, but easier to draw.

**Names**
- All bits that are completely visible have the bit name inside the bit, horizntally.
- Explicitly this means here there are 3 bit names: "Stuff bit", "Bit 11", "Stuff bit"
---

### Line 2: Node Internal View (Rectangles)

**Purpose:** Shows how the receiving node internally segments the bit stream based on its own (nominal) clock.

**Label:** `"Node internal view"` — displayed to the left of the row.

**Content (left to right):**

1. **Same bits as Line 1** — the 30% of the preceding bit are NOT shown. Only 3 bits are drawn as rectangles with a visual gap between the first and second bit. The sequence is: **Stuff bit** (first), **space**, **break indicator**, **space**, **Bit 11**, **Stuff bit** (last). The break indicator sits in the gap where no rectangle is drawn.
2. Each bit is drawn as a **rectangle** (square-ish box) with:
   - Fill: light grey (`#CCC` or similar).
   - Stroke: black (`#000000`).
3. **Sample Point (SP)** is marked in each visible bit as a **blue vertical line** (`#2196F3`) spanning the full height of the rectangle, positioned at the SP fraction of the bit time from the bit's start. The SP line is 50% longer than the height of the bit. The line starts at the bottom of the bit. The name "SP" is placed above the SP line of the rightmost stuff bit, centered, very close to it. The distance between SP line and SP text is configurable.

**Horizontal offset (critical):**
- First bit (stuff bit) Line 2 is shifted **1 tq to the left** relative to the falling edges of Line 1.
- This 1 tq offset represents the SyncSeg: the receiving node's internal bit boundary starts 1 tq before the detected edge (the falling edge seen on the bus triggers resynchronization, and SyncSeg precedes PropSeg+PhaseSeg1).
- The length of 1 tq in pixel is calculated from the length of one bit in Line 2 devided by the number of TQ per bit.
- The start of the stuff bit (after the 11 zero bits) is shifted to the left relative to the rising edge of Line 1. The shift is: 1tq + (11 bit * 2*df_used).

**Bit time scaling for Line 2 (Node internal view):**
- The bit duration uses the receiver's **faster** clock: `bt_d × BRP × clk_period / (1+2*df_used)`. Practically, here in this image it means: `bit length in line 2 = bit length in line 1 (in pixel) / (1+2*df_used)` 
- The bits in Line 2 are a littel shorter than in line 1.

**Names**
- Bits contain no names.


---

### PM1 Marking

**Purpose:** Visually highlights the Phase Margin 1 time window.

**Representation:** A **vertical light-red semi-transparent bar** (rectangle) spanning vertically across both Line 1 and Line 2. The bar is in the background.

**Horizontal extent:**
- **Left edge** = the x-position of the **rising edge** in Line 1 (the transition from the 11th zero bit to the stuff bit — i.e., where the RX signal goes from dominant to recessive).
- **Right edge** = the x-position of the **Sample Point (SP)** in Line 2 for the stuff bit.

**Style:**
- Fill color: light red semi-transparent (e.g., `rgba(255, 100, 100, 0.3)` or `#FFCCCC` with opacity).
- The bar should be clearly visible but not obscure the waveform and rectangles behind it.

**PM1 value label:**
- Display the numeric PM1 value (e.g., `"PM1 = 12.5 ns"`).
- Font color: black.
- Font: sans-serif, ~10px, bold.

---

### TQ Marking

**Purpose:** Visually highlights the Quantization Error of 1 tq.

**Representation:** A **vertical light-blue semi-transparent bar** (rectangle) spanning vertically across both Line 1 and Line 2. The bar is in the background.

**Occurence:** at the beginning of each edge in Line 2. So here 2 times
- at the beginning of the fist stuff bit
- at the beginning of the second stuff bit

**Horizontal extent:**
- **Left edge** = the x-position of the start of stuff bit
- **Right edge** = Left edge + 1 tq

**Style:**
- Fill color: light blue semi-transparent (e.g., `rgba(100, 100, 255, 0.3)`).
- The bar should be clearly visible but not obscure the waveform and rectangles behind it.

**Value label:**
- Display the numeric tq value (e.g., `"tq = 6.25 ns"`). Value = `BRP × clk_period`.
- Font color: black.
- Font: sans-serif, ~10px, bold.

---

### "Phase Error" Marking

**Purpose:** Visually highlights the phase error introduced by the clock difference in sender and receiver.

**Representation:** A **vertical light-green semi-transparent bar** (rectangle) spanning vertically across both Line 1 and Line 2. The bar is in the background.

**Occurence:** directly after the tq marking of the second stuff bit

**Horizontal extent:**
- **Left edge** = the x-position of the end of the tq marking
- **Right edge** = Left edge + bit_length_in_line1_in_pixel * 11 * (2*df_used); This point is the beginning of the second stuff bit in Line 1.

**Style:**
- Fill color: light green semi-transparent (e.g., `rgba(100, 255, 100, 0.3)`).
- The bar should be clearly visible but not obscure the waveform and rectangles behind it.

**Value label:**
- Display the numeric Phase Error value (e.g., `"Phase Error = xxx ns"`).
- Value xxx = `11 * bt_d × BRP × clk_period * 2 * df_used`
- Font color: black.
- Font: sans-serif, ~10px, bold.
- All labels (for TQ, PM1, and Phase Error) use the same color (black) and font size.
- Labels are placed on a single horizontal line below the vertical bars.
- The `"tq = ..."` label is positioned at the left of the SVG and exists only once. A thin (1px) connector line links the label to each of the two TQ vertical bars.
- The `"Phase Error = ..."` label is positioned in the middle, with a thin (1px) connector line to its vertical bar.
- The `"PM1 = ..."` label is positioned at the right, with a thin (1px) connector line to its vertical bar.
- The gap between the bottom of the vertical bars and the label line is configurable (`gap_bars_to_labels`).

---

## Layout & Dimensions

```
+--------------------------------------------------+
| Phase Margin PM1                        (title)   |
|                                                   |
| RX Signal                                         |
| ___                               ________________|
|    |_stuff bit___... __bit 11____|   Stuff bit    |
|                                                   |
| View of RX node                                  |
| ________________________________________________  |
| |________________| ... |_____________|__________|
+--------------------------------------------------+
```

- **SVG width:** dynamic, matches the parent column width (passed as `svgWidth`).
- **SVG height:** determined by Line hight and other required space. when calculated, it is stored in variable `svgHeight`.
- Line hight = bit hight = 25 px
- Vertical gap between rows: 10 px.
- Vertical bars (TQ, Phase Error, PM1) start 10 px above Line 1 (configurable: `bar_exceed_top`) and exceed Line 2 towards the bottom by 20 px (configurable: `bar_exceed_bottom`).
- Left margin: 0
- Labels of the lines 1 and 2 are above the lines. See rough layout.
- Below the vertical bars, there is a horizontal label row (gap configurable: `gap_bars_to_labels`). All three labels (TQ, Phase Error, PM1) are on the same horizontal line. Each label is connected to its respective vertical bar by a thin 1px line.

---

## Detailed Geometry (Pixel Mapping)

### Horizontal Scale

The drawing must fit the following content into the available width:
- 30% x bt_d (tail of preceding bit)
- 11 × bt_d tq (eleven zero bits, but visually compressed with break)
- 1 × bt_d tq (stuff bit)

Since showing all 11 bits at full scale would be too wide, the **break compression** reduces the middle 9 bits to a small fixed-width break symbol (~15–25px). The effectively drawn width is svgWidth.

### Key X-Coordinates

to be filled out

---

## Break Indicator Specification

The break indicator replaces the middle 9 zero bits (bits 2–10):

- **Style:** Two diagonal lines forming a zigzag/gap, similar to:
  ```
  /  /
  ```
  or a pair of angled parallel lines breaking the waveform/rectangle row.
- **Width:** Fixed, approximately 15–25px regardless of actual bit count.
- **Position:** Between the first and last zero bit in both Line 1 and Line 2.
- **Color:** Same as the waveform/border color (`#333` or `#888`).

---

## Error Handling

If `pmValue` is a string (e.g., `"df_used too large"`):
- Display the title.
- Below the title, draw a grey box (`#DDDDDD`) filling the remaining SVG area.
- Display the error string as text inside the grey box, left-aligned and vertically centered.
- Vertical size of SVG: shall be the same as with wave form

---

## Input Parameters

The drawing function receives:

| Parameter | Type | Description |
|-----------|------|-------------|
| `pmValue` | number or string | PM1 value in ns, or error string |
| `bt_d` | number | Data-phase bit time in tq |
| `ps2_d` | number | PhaseSeg2 in tq (data phase) |
| `spFraction` | number | Sample point as fraction of bit time (0..1) |
| `df_used` | number | Clock deviation as fraction (e.g., 0.002) |
| `S_Stuff` | number | Fixed stuff bit distance (11 for CAN XL) | => constant in the function
| `BRP` | number | Baud rate prescaler |
| `clk_period` | number | Clock period in ns |
| `HTMLDrawingName` | string | ID of the SVG element (`'DrawingPM1'`) |
| `svgWidth` | number | SVG width in pixels |

---

## Color Summary

| Element | Color |
|---------|-------|
| Waveform line (Line 1) | `#333333` (dark grey) |
| Bit rectangles fill (Line 2) | `#CCCCCC` (light grey) |
| Bit rectangles stroke (Line 2) | `#000000` (black) |
| Sample Point line | `#2196F3` (blue) |
| PM1 bar fill | light red, semi-transparent (e.g., `rgba(255,100,100,0.3)`) |
| PM1 label text | black |
| Row labels | `#555555` |
| Break indicator | `#333333` or `#888888` |
| Error box | `#DDDDDD` |

## Parameters of the SVG
The parameters not handed over to the drawing function are summarized at the top of the drawing function as constants.
Exemples for those constatns are
- Wave line color
- Wave line width
- SP color
- PM1 color
- Phase Error color
- TQ color
- Line1 hight
- Line2 hight
- gap_vertical_Line1_Line2
- gap_vertical_Line_LineLabel
- vertical_bar_exceed_top (vertical bars extend above Line 1 by this amount, default 10 px)
- vertical_bar_exceed_bottom (vertical bars extend below Line 2 by this amount, default 20 px)
- gap_bars_to_labels (gap between bottom of vertical bars and label line)
- SP_text_gap (distance between SP line top and "SP" text)
- connector_line_width (1 px, width of lines connecting labels to vertical bars)
- vertical_bar_min_width (1 px, minimum width of any vertical bar — TQ, Phase Error, PM1)