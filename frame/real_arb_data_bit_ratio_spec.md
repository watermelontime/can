# Specification: Real Arb/Data Bit Ratio Feature

## 1. UI (index.html)
- Add an iPhone-style switch labeled "Real Arb/Data bit ratio" (`chkRealArbDataBitRatio`) after the checkbox `chkArbPhaseBitsLonger`.
- When the switch is ON:
  - Show below the checkboxes (above the SVG):
    - **Arbitration Phase:** Bit-rate [500] kbit/s, SP [80]%
      - Inputs: `inputArbBitrate` (default 500), `inputArbSP` (default 80)
    - **Data Phase:** Bit-rate [1000] kbit/s, SP [70]%
      - Inputs: `inputDataBitrate` (default 1000), `inputDataSP` (default 70)
  - Validate:
    - SP: 1–99%
    - Bit rates: 100–20,000 kbit/s
  - When ON, `chkArbPhaseBitsLonger` is unchecked and disabled.
  - When OFF, `chkArbPhaseBitsLonger` is enabled.

## 2. Data Model (frame_definitions.js)
- Extend `bitTimeInfo`:
  - `realBitRatio` (boolean)
  - `realArbDataBitLenRatio` (float, data_bitrate / arb_bitrate)
  - `arbSP` (int, %)
  - `dataSP` (int, %)

## 3. Drawing Logic (frame_draw.js)
- If `realBitRatio` is true:
  - Draw bits with widths proportional to real bit times.
  - For FD:
    - Transition is inside the `firstDataPhaseBit` and `lastDataPhaseBit` at the SP position of the bit.
    - Up to SP: use one phase’s bit length; after SP: use the other’s.
    - Draw a vertical separator at the SP (half height).
  - For CC: No transition, all bits are arbitration phase.
  - For XL: Transition is at bit boundary; first/last data phase bits are fully in data phase.

## 4. Export Logic (frame_export.js)
- The "Download VHDL" button is only visible when **both** conditions are met:
  1. `realBitRatio` is ON, **and**
  2. The frame has been generated (i.e. the user clicked "Show Frame").
- When either condition is not met, the button is hidden.
- VHDL file:
  - Entity: `FRAME_GENERATOR` (parametrized for bit rates and SPs)
  - Output: `CAN_TX : out std_logic`
  - `CAN_TX` is '1' for 15 arbitration bit times before SOF
  - Each bit driven with correct timing (not clocked, just waveform with delays)
  - Comments for each bit: Field, Element, Bit name
  - Include a trivial testbench instantiating the entity
