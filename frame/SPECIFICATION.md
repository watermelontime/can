# CAN Frame Visualizer — Specification V1.1

---

## 1. Overview

A single-page JavaScript web application that visualizes CAN frames as bit-level digital waveforms (SVG).
Reuses the existing `styles.css` from the `reg_eval` project. Plain `<script>` tags (no ES modules).

---

## 2. Supported Frame Types

| # | Dropdown Label                      | Internal Key    | ID bits | Remote? |
|---|-------------------------------------|-----------------|---------|---------|
| 1 | CAN CC: CBFF (11-bit ID)            | `CC_CBFF`       | 11      | No      |
| 2 | CAN CC: CBFF (11-bit ID, remote)    | `CC_CBFF_RTR`   | 11      | Yes     |
| 3 | CAN CC: CEFF (29-bit ID)            | `CC_CEFF`       | 29      | No      |
| 4 | CAN CC: CEFF (29-bit ID, remote)    | `CC_CEFF_RTR`   | 29      | Yes     |
| 5 | CAN FD: FBFF (11-bit ID)            | `FD_FBFF`       | 11      | No      |
| 6 | CAN FD: FEFF (29-bit ID)            | `FD_FEFF`       | 29      | No      |
| 7 | CAN XL: XBFF (11-bit ID)            | `XL_XBFF`       | 11      | No      |

- No IFS/Intermission after EOF.
- No XEFF (29-bit XL). Not defined in ISO 11898-1.
- No bit-rate switch markers in the waveform.

---

## 3. Frame Field Definitions (transmission order)

**Naming convention:** In all frame types with 11-bit ID, the ID bits are labeled **ID28…ID18** (not ID10…ID0), consistent with ISO 11898-1.

### 3.1 CAN CC — CBFF (data frame)

| Group             | Element    | Bits | Fixed Value | User Input? | bitNamePrefix |
|-------------------|------------|------|-------------|-------------|---------------|
| *(none)*          | SOF        | 1    | 0           | No          | —             |
| Arbitration field | ID[28:18]  | 11   | —           | **Yes**     | `ID`          |
| Arbitration field | RTR        | 1    | 0           | No          | —             |
| Control field     | IDE        | 1    | 0           | No          | —             |
| Control field     | r0         | 1    | 0           | No          | —             |
| Control field     | DLC        | 4    | —           | **Yes**     | `Bit`         |
| Data field        | Byte0…ByteN | 0–64 bits | —    | **Yes**     | `Bit`         |
| CRC field         | CRC        | 15   | computed    | No          | `Bit`         |
| CRC field         | CRC del    | 1    | 1           | No          | —             |
| ACK field         | ACK slot   | 1    | 1 (default) | **Yes**     | —             |
| ACK field         | ACK del    | 1    | 1           | No          | —             |
| EOF               | EOF        | 7    | 1111111     | No          | `Bit`         |

**DLC range (CC):** 0–8. Values 9–15 accepted but capped to 8 data bytes.

### 3.2 CAN CC — CBFF Remote

Same as 3.1, except:
- RTR = 1 (recessive)
- Data field is **empty** (0 bytes), regardless of DLC value
- DLC is still present and user-settable (0–8, indicates data length of corresponding data frame)

### 3.3 CAN CC — CEFF (data frame)

| Group             | Element    | Bits | Fixed Value | User Input? | bitNamePrefix |
|-------------------|------------|------|-------------|-------------|---------------|
| *(none)*          | SOF        | 1    | 0           | No          | —             |
| Arbitration field | ID[28:18]  | 11   | —           | **Yes** (from 29-bit ID) | `ID` |
| Arbitration field | SRR        | 1    | 1           | No          | —             |
| Arbitration field | IDE        | 1    | 1           | No          | —             |
| Arbitration field | ID[17:0]   | 18   | —           | **Yes** (from 29-bit ID) | `ID` |
| Arbitration field | RTR        | 1    | 0           | No          | —             |
| Control field     | r1         | 1    | 0           | No          | —             |
| Control field     | r0         | 1    | 0           | No          | —             |
| Control field     | DLC        | 4    | —           | **Yes**     | `Bit`         |
| Data field        | Byte0…ByteN | 0–64 bits | —    | **Yes**     | `Bit`         |
| CRC field         | CRC        | 15   | computed    | No          | `Bit`         |
| CRC field         | CRC del    | 1    | 1           | No          | —             |
| ACK field         | ACK slot   | 1    | 1           | **Yes**     | —             |
| ACK field         | ACK del    | 1    | 1           | No          | —             |
| EOF               | EOF        | 7    | 1111111     | No          | `Bit`         |

**ID input:** User enters a single hex value (max 29 bits). Code splits into ID[28:18] and ID[17:0].

### 3.4 CAN CC — CEFF Remote

Same as 3.3, except:
- RTR = 1 (recessive)
- Data field is **empty** (0 bytes), regardless of DLC value

### 3.5 CAN FD — FBFF

| Group             | Element    | Bits    | Fixed Value | User Input? | bitNamePrefix |
|-------------------|------------|---------|-------------|-------------|---------------|
| *(none)*          | SOF        | 1       | 0           | No          | —             |
| Arbitration field | ID[28:18]  | 11      | —           | **Yes**     | `ID`          |
| Arbitration field | RRS        | 1       | 0           | No          | —             |
| Control field     | IDE        | 1       | 0           | No          | —             |
| Control field     | FDF        | 1       | 1           | No          | —             |
| Control field     | res        | 1       | 0           | No          | —             |
| Control field     | BRS        | 1       | —           | **Yes** (default 0) | —     |
| Control field     | ESI        | 1       | —           | **Yes** (default 0) | —     |
| Control field     | DLC        | 4       | —           | **Yes**     | `Bit`         |
| Data field        | Byte0…ByteN | 0–512 bits | —     | **Yes**     | `Bit`         |
| CRC field         | SBC        | 4       | computed    | No          | `Bit`         |
| CRC field         | CRC        | 17 or 21 | computed   | No          | `Bit`         |
| CRC field         | CRC del    | 1       | 1           | No          | —             |
| ACK field         | ACK slot   | 1       | 1           | **Yes**     | —             |
| ACK field         | ACK del    | 1       | 1           | No          | —             |
| EOF               | EOF        | 7       | 1111111     | No          | `Bit`         |

**DLC mapping (FD):** 0→0, 1→1, …, 8→8, 9→12, 10→16, 11→20, 12→24, 13→32, 14→48, 15→64 bytes.
**CRC selection:** CRC-17 if ≤16 data bytes; CRC-21 if >16 data bytes.
**CRC delimiter:** Always 1 bit.

### 3.6 CAN FD — FEFF

| Group             | Element    | Bits    | Fixed Value | User Input? | bitNamePrefix |
|-------------------|------------|---------|-------------|-------------|---------------|
| *(none)*          | SOF        | 1       | 0           | No          | —             |
| Arbitration field | ID[28:18]  | 11      | —           | **Yes**     | `ID`          |
| Arbitration field | SRR        | 1       | 1           | No          | —             |
| Arbitration field | IDE        | 1       | 1           | No          | —             |
| Arbitration field | ID[17:0]   | 18      | —           | **Yes**     | `ID`          |
| Arbitration field | RRS        | 1       | 0           | No          | —             |
| Control field     | FDF        | 1       | 1           | No          | —             |
| Control field     | res        | 1       | 0           | No          | —             |
| Control field     | BRS        | 1       | —           | **Yes**     | —             |
| Control field     | ESI        | 1       | —           | **Yes**     | —             |
| Control field     | DLC        | 4       | —           | **Yes**     | `Bit`         |
| Data field        | Byte0…ByteN | 0–512 bits | —       | **Yes**     | `Bit`         |
| CRC field         | SBC        | 4       | computed    | No          | `Bit`         |
| CRC field         | CRC        | 17 or 21 | computed   | No          | `Bit`         |
| CRC field         | CRC del    | 1       | 1           | No          | —             |
| ACK field         | ACK slot   | 1       | 1           | **Yes**     | —             |
| ACK field         | ACK del    | 1       | 1           | No          | —             |
| EOF               | EOF        | 7       | 1111111     | No          | `Bit`         |

### 3.7 CAN XL — XBFF

| Group             | Element    | Bits      | Fixed Value | User Input? | bitNamePrefix |
|-------------------|------------|-----------|-------------|-------------|---------------|
| *(none)*          | SOF        | 1         | 0           | No          | —             |
| Arbitration field | ID[28:18]  | 11        | —           | **Yes**     | `ID`          |
| Arbitration field | RRS        | 1         | —           | **Yes**     | —             |
| Arbitration field | IDE        | 1         | 0           | No          | —             |
| Arbitration field | FDF        | 1         | 1           | No          | —             |
| Arbitration field | XLF        | 1         | 1           | No          | —             |
| Control field     | resXL      | 1         | 0           | No          | —             |
| Control field     | ADH        | 1         | 1           | No          | —             |
| Control field     | DH1        | 1         | 1           | No          | —             |
| Control field     | DH2        | 1         | 1           | No          | —             |
| Control field     | DL1        | 1         | 0           | No          | —             |
| Control field     | SDT        | 8         | —           | **Yes**     | `Bit`         |
| Control field     | SEC        | 1         | —           | **Yes**     | —             |
| Control field     | DLC        | 11        | —           | **Yes**     | `Bit`         |
| Control field     | SBC        | 3         | computed    | No          | `Bit`         |
| Control field     | PCRC       | 13        | computed    | No          | `Bit`         |
| Control field     | VCID       | 8         | —           | **Yes**     | `Bit`         |
| Control field     | AF         | 32        | —           | **Yes**     | `Bit`         |
| Data field        | Byte0…ByteN | 8–16384 bits | —       | **Yes**     | `Bit`         |
| CRC field         | FCRC       | 32        | computed    | No          | `Bit`         |
| CRC field         | FCP        | 4         | 1100        | No          | `Bit`         |
| ACK field         | DAH        | 1         | 1           | No          | —             |
| ACK field         | AH1        | 1         | 1           | No          | —             |
| ACK field         | AL1        | 1         | 0           | No          | —             |
| ACK field         | AH2        | 1         | 1           | No          | —             |
| ACK field         | ACK slot   | 1         | 1           | **Yes**     | —             |
| ACK field         | ACK del    | 1         | 1           | No          | —             |
| EOF               | EOF        | 7         | 1111111     | No          | `Bit`         |

**XL DLC:** 11 bits, range 0–2047. Data field length = DLC + 1 (→ 1 to 2048 bytes). Input label is "DLC".

---

## 4. CRC Rules

### 4.1 Polynomials & Init Vectors

| CRC     | Bits | Polynomial (hex, incl. leading 1) | Init Vector        | Used by              |
|---------|------|-----------------------------------|--------------------|----------------------|
| CRC-15  | 15   | `0xC599`                          | All zeros          | CC                   |
| CRC-17  | 17   | `0x3685B`                         | MSB=1, rest 0      | FD (≤16 data bytes)  |
| CRC-21  | 21   | `0x302899`                        | MSB=1, rest 0      | FD (>16 data bytes)  |
| CRC-13  | 13   | `0x39E7`  (PCRC)                  | LSB=1, rest 0      | XL header            |
| CRC-32  | 32   | `0x1F4ACFB13` (FCRC)              | LSB=1, rest 0      | XL frame             |

### 4.2 Relevant Bit Streams

**CC (CRC-15):**
- Includes: SOF + Arbitration field + Control field + Data field (if present)
- Excludes: All stuff bits

**FD (CRC-17 / CRC-21):**
- Includes: SOF + Arbitration field + Control field + Data field (if present) + **SBC (stuff bit count)** + **dynamic stuff bits**
- Excludes: Fixed stuff bits
- CRC-17 used when data field ≤ 16 bytes; CRC-21 when data field > 16 bytes

**XL — PCRC (CRC-13):**
- Includes: ID[28:18] + RRS + dynamic stuff bits (up to 3, before FDF) + SDT + SEC + DLC + SBC
- Excludes: Static bits SOF, IDE, FDF, XLF, resXL, ADS (ADH, DH1, DH2, DL1); fixed stuff bits

**XL — FCRC (CRC-32):**
- Includes: ID[28:18] + RRS + SDT + SEC + DLC + SBC + PCRC + VCID + AF + Data
- Excludes: Static bits SOF, IDE, FDF, XLF, resXL, ADS (ADH, DH1, DH2, DL1); ALL stuff bits (dynamic + fixed)

Each CRC input bit stream is appended with n_CRC zero bits before the polynomial division.

---

## 5. Stuff Bit Rules

### 5.1 Dynamic Stuff Bits

| Frame type       | Stuffed region                                | Rule                                                            |
|------------------|-----------------------------------------------|-----------------------------------------------------------------|
| CC (CBFF, CEFF)  | SOF through end of **CRC sequence** (15 bits) | After 5 consecutive identical bits → insert 1 complement bit    |
| FD (FBFF, FEFF)  | SOF through end of **Data field**             | Same 5-consecutive rule; no stuff bit after last data field bit |
| XL (XBFF)        | SOF through **before FDF bit** (arb. only)    | Same 5-consecutive rule; max 3 dynamic stuff bits               |

**Not stuffed (all types):** CRC delimiter, ACK field, EOF.

### 5.2 Fixed Stuff Bits

| Frame type | Region                          | Rule                                                                                          |
|------------|---------------------------------|-----------------------------------------------------------------------------------------------|
| CC         | —                               | None                                                                                          |
| FD         | CRC field (SBC + CRC)           | 1 fixed stuff bit **before SBC** (= complement of preceding bit), then 1 after every **4th CRC-field bit**. Regarding the first fixed stuff bit: If preceding 5 bits were equal, only the fixed stuff bit is inserted (no double stuffing). |
| XL         | DL1 through end of **FCRC**     | 1 fixed stuff bit after every **10 frame bits**, counting starts at and including DL1 (bit 1). Value = complement of preceding bit. Last possible position = directly after end of FCRC (before FCP). |

**Not stuffed (XL):** FCP, DAS (DAH, AH1, AL1, AH2), ACK slot, ACK del, EOF.

### 5.3 SBC (Stuff Bit Count)

**FD — 4 bits** (SBC3, SBC2, SBC1 = Gray-coded; SBC0 = even parity):

| Dynamic stuff bits mod 8 | 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    |
|--------------------------|------|------|------|------|------|------|------|------|
| SBC (binary)             | 0000 | 0011 | 0110 | 0101 | 1100 | 1111 | 1010 | 1001 |

**XL — 3 bits** (SBC2, SBC1 = Gray-coded; SBC0 = even parity):

| Dynamic stuff bits | 0   | 1   | 2   | 3   |
|--------------------|-----|-----|-----|-----|
| SBC (binary)       | 001 | 010 | 111 | 100 |

---

## 6. Processing Pipeline

### 6.0 General Pipeline

```
User presses "Show Frame"
        │
        ▼
┌─────────────────────────────────┐
│ 1. Read HTML input fields       │  → populate myFrame.input
└────────┬────────────────────────┘
         ▼
┌─────────────────────────────────┐
│ 2. Build frame structure        │  Create fields[] hierarchy with elements,
│                                 │  but bits[] arrays are EMPTY.
│                                 │  Uses frame_definitions.js templates.
└────────┬────────────────────────┘
         ▼
┌─────────────────────────────────┐
│ 3. Build nominal bits           │  Fill elements[].bits[] with {v, name, ...}
│    (no stuff bits, no CRC yet)  │  based on element values and bitNamePrefix.
│                                 │  CRC/SBC fields are excluded (filled later).
└────────┬────────────────────────┘
         ▼
┌─────────────────────────────────┐
│ 4. Insert DYNAMIC stuff bits    │  Walk bits[], insert complement after 5
│                                 │  consecutive equal bits.
│                                 │  Region depends on frame type (see 6.1–6.3).
└────────┬────────────────────────┘
         ▼
┌─────────────────────────────────┐
│ 5. Compute SBC                  │  FD: 4 bits, XL: 3 bits
│    (CC: skip this step)         │  Count dynamic stuff bits → Gray + parity
└────────┬────────────────────────┘
         ▼
┌─────────────────────────────────┐
│ 6. Compute CRC(s)               │  CC: CRC-15 (unstuffed stream)
│                                 │  FD: CRC-17/21 (incl. dyn. stuff bits + SBC)
│                                 │  XL: PCRC-13, then FCRC-32
└────────┬────────────────────────┘
         ▼
┌─────────────────────────────────┐
│ 7. Append remaining fields      │  Fill bits[] for CRC, SBC, CRC del, ACK, EOF
│                                 │  (details depend on frame type, see 6.1–6.3)
└────────┬────────────────────────┘
         ▼
┌─────────────────────────────────┐
│ 8. Insert FIXED stuff bits      │  FD: before SBC, then every 4 bits in CRC field
│    (CC: skip)                   │  XL: every 10 bits from DL1 through end of FCRC
└────────┬────────────────────────┘
         ▼
┌─────────────────────────────────┐
│ 9. Finalize computed values     │  totalBits, stuffBitCountDyn, stuffBitCountFixed
└────────┬────────────────────────┘
         ▼
┌─────────────────────────────────┐
│ 10. Draw SVG                    │  Walk myFrame.fields[] hierarchy → render waveform
└─────────────────────────────────┘
```

The `build()` method delegates to **separate internal pipelines** for CC, FD, and XL after step 2:

```javascript
build() {
  this._buildFrameStructure();     // step 2: create fields[] skeleton (empty bits[])

  if (this._isCC())  this._buildCC();
  else if (this._isFD())  this._buildFD();
  else if (this._isXL())  this._buildXL();

  this._finalize();                // step 9: compute totals
}
```

### 6.1 CAN CC Pipeline (`_buildCC`)

1. Build nominal bits: fill bits[] for SOF → ID[28:18] → RTR → IDE → r0 → DLC → Data bytes
2. Compute CRC-15 over **unstuffed** nominal stream (SOF through end of Data)
3. Append: fill bits[] for CRC (15 bits) + CRC del + ACK slot + ACK del + EOF
4. Insert dynamic stuff bits: SOF through end of CRC sequence (15 bits). NOT over CRC del, ACK, EOF.
5. No fixed stuff bits.

### 6.2 CAN FD Pipeline (`_buildFD`)

1. Build nominal bits: fill bits[] for SOF → Arb → Control → Data bytes
2. Insert dynamic stuff bits: SOF through end of Data field; no stuff bit after last data field bit
3. Compute SBC (4 bits): count dynamic stuff bits mod 8, encode as Gray + parity
4. Compute CRC-17/21 over: the stuffed stream (SOF…Data including dynamic stuff bits) + SBC bits
5. Append: fill bits[] for SBC (4 bits) + CRC (17 or 21 bits) + CRC del + ACK slot + ACK del + EOF
6. Insert fixed stuff bits: 1 fixed stuff bit before SBC, then 1 after every 4th CRC-field bit

### 6.3 CAN XL Pipeline (`_buildXL`)

1. Build nominal bits (arbitration): fill bits[] for SOF → ID[28:18] → RRS → IDE → FDF → XLF
2. Insert dynamic stuff bits: SOF through before FDF (max 3)
3. Build nominal bits (control part 1): fill bits[] for resXL → ADH → DH1 → DH2 → DL1 → SDT → SEC → DLC
4. Compute SBC (3 bits): count dynamic stuff bits, encode as Gray + parity
5. Compute PCRC-13 over: ID[28:18] + RRS + dyn. stuff bits + SDT + SEC + DLC + SBC (excludes SOF, IDE, FDF, XLF, resXL, ADS, fixed stuff bits)
6. Append: fill bits[] for SBC (3 bits) + PCRC (13 bits)
7. Build nominal bits (control part 2): fill bits[] for VCID → AF
8. Build nominal bits (data): fill bits[] for Byte0…ByteN
9. Compute FCRC-32 over: ID[28:18] + RRS + SDT + SEC + DLC + SBC + PCRC + VCID + AF + Data (excludes SOF, IDE, FDF, XLF, resXL, ADS, ALL stuff bits)
10. Append: fill bits[] for FCRC (32 bits) + FCP (4 bits: 1100)
11. Insert fixed stuff bits: every 10 bits from DL1 through end of FCRC. Last possible position = directly after FCRC, before FCP.
12. Append: fill bits[] for DAH + AH1 + AL1 + AH2 + ACK slot + ACK del + EOF

---

## 7. `myFrame` Data Structure (JavaScript Class)

### 7.1 Configurable Constants

```javascript
// --- Configurable stuff bit names (central place) ---
const STUFF_DYN_NAME = "stuff";    // name used for dynamic stuff bits in bits[].name
const STUFF_FIX_NAME = "stuff";    // name used for fixed stuff bits in bits[].name
```

These are used when inserting stuff bits into `bits[]` arrays:
```javascript
{v: 0, name: STUFF_DYN_NAME, isStuffBit: true, isStuffBitTypeFixed: false}  // dynamic
{v: 1, name: STUFF_FIX_NAME, isStuffBit: true, isStuffBitTypeFixed: true}   // fixed
```

### 7.2 Class Structure

```javascript
class CanFrame {

  constructor(frameType) {
    // --- Meta information ---
    this.frameType = frameType;  // "CC_CBFF" | "CC_CBFF_RTR" | "CC_CEFF" | "CC_CEFF_RTR"
                                 // "FD_FBFF" | "FD_FEFF" | "XL_XBFF"

    // --- User input values (raw) ---
    this.input = {
      id:       0x000,       // 11-bit (0x000–0x7FF) or 29-bit (0x00000000–0x1FFFFFFF)
      dlc:      0,           // CC: 0–8, FD: 0–15, XL: 0–2047
      data:     [],          // payload bytes, e.g. [0xDE, 0xAD, 0xBE, 0xEF]
      ackSlot:  1,           // 1 = recessive (no ACK), 0 = dominant (ACK received)
      brs:      0,           // FD only: bit rate switch (0 or 1)
      esi:      0,           // FD only: error state indicator (0 or 1)
      sec:      0,           // XL only: simple/extended content (0 or 1)
      sdt:      0x00,        // XL only: SDU type (8-bit)
      vcid:     0x00,        // XL only: virtual CAN network ID (8-bit)
      af:       0x00000000,  // XL only: acceptance field (32-bit)
    };

    // --- Computed values ---
    this.computed = {
      dataFieldBytes:      0,    // actual byte count after DLC mapping
      crcLength:           0,    // 15, 17, 21 bits (CC/FD main CRC)
      crcValue:            0,    // computed CRC value (CC: CRC-15, FD: CRC-17/21)
      pcrcValue:           0,    // XL only: PCRC-13 value
      fcrcValue:           0,    // XL only: FCRC-32 value
      stuffBitCountDyn:    0,    // number of dynamic stuff bits inserted
      stuffBitCountFixed:  0,    // number of fixed stuff bits inserted
      totalBits:           0,    // total bit count including all stuff bits
    };

    // --- Fields: hierarchical structure (see Section 7.3) ---
    this.fields = [];
  }

  // ── Public method: orchestrates full pipeline ──────────────
  build() {
    this._buildFrameStructure();     // step 2: fields[] with empty bits[]

    if (this._isCC())  this._buildCC();
    else if (this._isFD())  this._buildFD();
    else if (this._isXL())  this._buildXL();

    this._finalize();                // step 9: totals
  }

  // ── CC pipeline (steps 3–5 for Classic CAN) ───────────────
  _buildCC() {
    this._buildNominalBits();        // fill bits[] for all elements
    this._computeCRC_CC();           // CRC-15 over unstuffed stream
    this._appendCrcAckEof_CC();      // fill bits[] for CRC, CRC del, ACK, EOF
    this._insertDynStuffBits_CC();   // SOF through end of CRC sequence
  }

  // ── FD pipeline (steps 3–8 for CAN FD) ────────────────────
  _buildFD() {
    this._buildNominalBits();        // fill bits[] for SOF through Data
    this._insertDynStuffBits_FD();   // SOF through end of Data field
    this._computeSBC_FD();           // 4-bit SBC from dynamic stuff count
    this._computeCRC_FD();           // CRC-17/21 over stuffed stream + SBC
    this._appendSbcCrcAckEof_FD();   // fill bits[] for SBC, CRC, CRC del, ACK, EOF
    this._insertFixedStuffBits_FD(); // before SBC, then every 4th bit
  }

  // ── XL pipeline (steps 3–8 for CAN XL) ────────────────────
  _buildXL() {
    this._buildNominalBitsArb_XL();      // fill bits[] for SOF through XLF
    this._insertDynStuffBits_XL();       // SOF through before FDF (max 3)
    this._buildNominalBitsCtrl1_XL();    // fill bits[] for resXL through DLC
    this._computeSBC_XL();               // 3-bit SBC from dynamic stuff count
    this._computePCRC_XL();              // PCRC-13
    this._appendSbcPcrc_XL();            // fill bits[] for SBC, PCRC
    this._buildNominalBitsCtrl2_XL();    // fill bits[] for VCID, AF
    this._buildNominalBitsData_XL();     // fill bits[] for data bytes
    this._computeFCRC_XL();              // FCRC-32
    this._appendFcrcFcpAckEof_XL();      // fill bits[] for FCRC, FCP, DAS, ACK, EOF
    this._insertFixedStuffBits_XL();     // every 10 bits from DL1 through FCRC
  }

  // ── Shared helpers ─────────────────────────────────────────
  _buildFrameStructure()   { /* step 2: create fields[] from definitions, empty bits[] */ }
  _buildNominalBits()      { /* step 3: fill bits[] based on value + bitNamePrefix */ }
  _finalize()              { /* step 9: compute totalBits, stuff counts */ }

  _isCC() { return this.frameType.startsWith("CC_"); }
  _isFD() { return this.frameType.startsWith("FD_"); }
  _isXL() { return this.frameType.startsWith("XL_"); }
}
```

### 7.3 `fields[]` Structure

The `fields[]` array is the hierarchical data structure that represents the frame. It is also the input for the SVG drawing function.

Building the frame happens in **two phases**:

1. **Phase 1 — Build frame structure (step 2):** The `fields[]` hierarchy is created from definition templates. All `elements[]` and `dataField[]` entries exist with their metadata (name, nominalBits, bitNamePrefix, etc.), but `bits[]` is an **empty array** `[]`.

2. **Phase 2 — Build nominal bits (step 3+):** The `bits[]` arrays are populated based on element values and `bitNamePrefix`. Stuff bits and CRC bits are added in subsequent steps.

**Structure overview:**

```
fields[]
  └─ field (e.g., "Arbitration field")
       ├─ fieldName        → group label for drawing line 1
       ├─ nominalBits      → bit count without stuff bits
       ├─ totalBits        → bit count including stuff bits (updated after stuffing)
       └─ elements[] (for non-data fields)
       │    └─ element (e.g., "ID[28:18]")
       │         ├─ name           → element label for drawing line 2
       │         ├─ nominalBits    → bit count without stuff bits
       │         ├─ bitNamePrefix  → prefix for individual bit names (e.g., "ID", "Bit", "")
       │         ├─ isUserInput    → true if value comes from user
       │         ├─ value          → the value (integer)
       │         └─ bits[]         → EMPTY after step 2; filled in step 3+
       │              └─ {v, name, isStuffBit, isStuffBitTypeFixed}
       │
       └─ dataField[] (for Data field only)
            └─ byte (e.g., "Byte0")
                 ├─ name       → "Byte0", "Byte1", …
                 ├─ value      → byte value (integer)
                 ├─ totalBits  → 8 + stuff bits in this byte (updated after stuffing)
                 └─ bits[]     → EMPTY after step 2; filled in step 3+
                      └─ {v, name, isStuffBit, isStuffBitTypeFixed}
```

### 7.4 Example: After Step 2 — Frame Structure (CC_CBFF, empty bits)

This shows `fields[]` immediately after `_buildFrameStructure()`. All metadata is present, but `bits[]` is empty.

```javascript
this.fields = [

  // ── SOF (no group name) ────────────────────────────────────
  { fieldName: "",
    nominalBits: 1,
    totalBits:   1,
    elements: [
      { name: "SOF", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 0,
        bits: []    // ← empty, filled in step 3
      },
    ]
  },

  // ── Arbitration field ──────────────────────────────────────
  { fieldName: "Arbitration field",
    nominalBits: 12,
    totalBits:   12,
    elements: [
      { name: "ID[28:18]", nominalBits: 11, bitNamePrefix: "ID",
        isUserInput: true, value: 0x7FF,
        bits: []
      },
      { name: "RTR", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 0,
        bits: []
      },
    ]
  },

  // ── Control field ──────────────────────────────────────────
  { fieldName: "Control field",
    nominalBits: 6,
    totalBits:   6,
    elements: [
      { name: "IDE", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 0,
        bits: []
      },
      { name: "r0", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 0,
        bits: []
      },
      { name: "DLC", nominalBits: 4, bitNamePrefix: "Bit",
        isUserInput: true, value: 8,
        bits: []
      },
    ]
  },

  // ── Data field ─────────────────────────────────────────────
  { fieldName: "Data field",
    nominalBits: 64,
    totalBits:   64,
    bitNamePrefix: "Bit",
    isUserInput: true,
    dataField: [
      { name: "Byte0", value: 0xDE, totalBits: 8, bits: [] },
      { name: "Byte1", value: 0xAD, totalBits: 8, bits: [] },
      { name: "Byte2", value: 0xBE, totalBits: 8, bits: [] },
      { name: "Byte3", value: 0xEF, totalBits: 8, bits: [] },
      { name: "Byte4", value: 0x01, totalBits: 8, bits: [] },
      { name: "Byte5", value: 0x02, totalBits: 8, bits: [] },
      { name: "Byte6", value: 0x03, totalBits: 8, bits: [] },
      { name: "Byte7", value: 0x04, totalBits: 8, bits: [] },
    ]
  },

  // ── CRC field ──────────────────────────────────────────────
  { fieldName: "CRC field",
    nominalBits: 16,
    totalBits:   16,
    elements: [
      { name: "CRC", nominalBits: 15, bitNamePrefix: "Bit",
        isUserInput: false, value: 0,
        bits: []
      },
      { name: "CRC del", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 1,
        bits: []
      },
    ]
  },

  // ── ACK field ──────────────────────────────────────────────
  { fieldName: "ACK field",
    nominalBits: 2,
    totalBits:   2,
    elements: [
      { name: "ACK slot", nominalBits: 1, bitNamePrefix: "",
        isUserInput: true, value: 1,
        bits: []
      },
      { name: "ACK del", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 1,
        bits: []
      },
    ]
  },

  // ── EOF ────────────────────────────────────────────────────
  { fieldName: "EOF",
    nominalBits: 7,
    totalBits:   7,
    elements: [
      { name: "EOF", nominalBits: 7, bitNamePrefix: "Bit",
        isUserInput: false, value: 0x7F,
        bits: []
      },
    ]
  },
];
```

### 7.5 Example: After Step 3 — Nominal Bits Filled (CC_CBFF)

After `_buildNominalBits()`, the `bits[]` arrays are populated using the element's `value` and `bitNamePrefix`.

**Bit name generation rule:** For each element:
- If `nominalBits == 1` and `bitNamePrefix == ""`: bit name = element `name` (e.g., `"SOF"`, `"RTR"`, `"IDE"`)
- If `nominalBits > 1` or `bitNamePrefix != ""`: bit name = `bitNamePrefix + (nominalBits - 1 - i)` where `i` is 0, 1, 2, … (e.g., `"ID28"`, `"ID27"`, …, `"Bit3"`, `"Bit2"`, …)

```javascript
this.fields = [

  // ── SOF ────────────────────────────────────────────────────
  { fieldName: "",
    nominalBits: 1, totalBits: 1,
    elements: [
      { name: "SOF", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 0,
        bits: [
          {v: 0, name: "SOF", isStuffBit: false, isStuffBitTypeFixed: false},
        ]
      },
    ]
  },

  // ── Arbitration field ──────────────────────────────────────
  { fieldName: "Arbitration field",
    nominalBits: 12, totalBits: 12,
    elements: [
      { name: "ID[28:18]", nominalBits: 11, bitNamePrefix: "ID",
        isUserInput: true, value: 0x7FF,
        bits: [
          {v: 1, name: "ID28", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID27", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID26", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID25", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID24", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID23", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID22", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID21", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID20", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID19", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "ID18", isStuffBit: false, isStuffBitTypeFixed: false},
        ]
      },
      { name: "RTR", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 0,
        bits: [
          {v: 0, name: "RTR", isStuffBit: false, isStuffBitTypeFixed: false},
        ]
      },
    ]
  },

  // ── Control field ──────────────────────────────────────────
  { fieldName: "Control field",
    nominalBits: 6, totalBits: 6,
    elements: [
      { name: "IDE", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 0,
        bits: [
          {v: 0, name: "IDE", isStuffBit: false, isStuffBitTypeFixed: false},
        ]
      },
      { name: "r0", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 0,
        bits: [
          {v: 0, name: "r0", isStuffBit: false, isStuffBitTypeFixed: false},
        ]
      },
      { name: "DLC", nominalBits: 4, bitNamePrefix: "Bit",
        isUserInput: true, value: 8,
        bits: [
          {v: 1, name: "Bit3", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 0, name: "Bit2", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 0, name: "Bit1", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 0, name: "Bit0", isStuffBit: false, isStuffBitTypeFixed: false},
        ]
      },
    ]
  },

  // ── Data field ─────────────────────────────────────────────
  { fieldName: "Data field",
    nominalBits: 64, totalBits: 64,
    bitNamePrefix: "Bit",
    isUserInput: true,
    dataField: [
      { name: "Byte0", value: 0xDE, totalBits: 8,
        bits: [
          {v: 1, name: "Bit7", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "Bit6", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 0, name: "Bit5", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "Bit4", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "Bit3", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "Bit2", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "Bit1", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 0, name: "Bit0", isStuffBit: false, isStuffBitTypeFixed: false},
        ]
      },
      { name: "Byte1", value: 0xAD, totalBits: 8,
        bits: [
          {v: 1, name: "Bit7", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 0, name: "Bit6", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "Bit5", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 0, name: "Bit4", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "Bit3", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "Bit2", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 0, name: "Bit1", isStuffBit: false, isStuffBitTypeFixed: false},
          {v: 1, name: "Bit0", isStuffBit: false, isStuffBitTypeFixed: false},
        ]
      },
      // ... Byte2 through Byte7
    ]
  },

  // ── CRC field ──────────────────────────────────────────────
  // bits[] for CRC and CRC del are NOT yet filled (computed later)
  { fieldName: "CRC field",
    nominalBits: 16, totalBits: 16,
    elements: [
      { name: "CRC", nominalBits: 15, bitNamePrefix: "Bit",
        isUserInput: false, value: 0,
        bits: []   // ← filled after CRC computation
      },
      { name: "CRC del", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 1,
        bits: []   // ← filled after CRC computation
      },
    ]
  },

  // ── ACK field ──────────────────────────────────────────────
  // bits[] for ACK are NOT yet filled (appended together with CRC)
  { fieldName: "ACK field",
    nominalBits: 2, totalBits: 2,
    elements: [
      { name: "ACK slot", nominalBits: 1, bitNamePrefix: "",
        isUserInput: true, value: 1,
        bits: []
      },
      { name: "ACK del", nominalBits: 1, bitNamePrefix: "",
        isUserInput: false, value: 1,
        bits: []
      },
    ]
  },

  // ── EOF ────────────────────────────────────────────────────
  { fieldName: "EOF",
    nominalBits: 7, totalBits: 7,
    elements: [
      { name: "EOF", nominalBits: 7, bitNamePrefix: "Bit",
        isUserInput: false, value: 0x7F,
        bits: []
      },
    ]
  },
];
```

> **Note:** After step 3 (nominal bits), the bits[] for CRC, ACK, and EOF are still empty.
> They are filled in step 7 (`_appendCrcAckEof_CC` / `_appendSbcCrcAckEof_FD` / etc.) after CRC computation.

### 7.6 Example: After Dynamic Stuff Bit Insertion

When a dynamic stuff bit is inserted into an element's `bits[]` array, it looks like this:

```javascript
// DLC element after stuff bit insertion (example: stuff bit after 5 consecutive dominant bits)
{ name: "DLC", nominalBits: 4, bitNamePrefix: "Bit",
  isUserInput: true, value: 8,
  bits: [
    {v: 1, name: "Bit3",           isStuffBit: false, isStuffBitTypeFixed: false},
    {v: 0, name: "Bit2",           isStuffBit: false, isStuffBitTypeFixed: false},
    {v: 0, name: "Bit1",           isStuffBit: false, isStuffBitTypeFixed: false},
    {v: 1, name: STUFF_DYN_NAME,   isStuffBit: true,  isStuffBitTypeFixed: false},  // ← inserted
    {v: 0, name: "Bit0",           isStuffBit: false, isStuffBitTypeFixed: false},
  ]
}
```

Similarly, fixed stuff bits use `STUFF_FIX_NAME` and `isStuffBitTypeFixed: true`:

```javascript
{v: 1, name: STUFF_FIX_NAME, isStuffBit: true, isStuffBitTypeFixed: true}  // fixed stuff bit
```

### 7.7 Bit Naming Rules Summary

Bit names are derived from the element's `bitNamePrefix` and the bit position within the element.

| Context                  | bitNamePrefix | Name pattern                              | Examples                     |
|--------------------------|---------------|-------------------------------------------|------------------------------|
| 1-bit field (prefix="")  | `""`         | Element `name` itself                     | `SOF`, `RTR`, `IDE`, `FDF`, `BRS`, `ESI`, `SEC`, `XLF`, `resXL`, `ADH`, `DH1`, `DH2`, `DL1`, `SRR`, `RRS`, `r0`, `r1`, `res`, `ACK slot`, `ACK del`, `CRC del` |
| ID bits (11-bit frame)   | `"ID"`       | `ID` + (28 down to 18)                   | `ID28`, `ID27`, …, `ID18`   |
| ID bits (29-bit frame)   | `"ID"`       | `ID` + (28 down to 0)                    | `ID28`, …, `ID18`, `ID17`, …, `ID0` |
| DLC bits (CC/FD: 4 bits) | `"Bit"`      | `Bit` + (3 down to 0)                    | `Bit3`, `Bit2`, `Bit1`, `Bit0` |
| DLC bits (XL: 11 bits)   | `"Bit"`      | `Bit` + (10 down to 0)                   | `Bit10`, `Bit9`, …, `Bit0`  |
| Data bytes               | `"Bit"`      | Per byte: `Bit7` down to `Bit0`          | `Bit7`, …, `Bit0` (repeats) |
| CRC-15 bits              | `"Bit"`      | `Bit` + (14 down to 0)                   | `Bit14`, …, `Bit0`          |
| CRC-17 bits              | `"Bit"`      | `Bit` + (16 down to 0)                   | `Bit16`, …, `Bit0`          |
| CRC-21 bits              | `"Bit"`      | `Bit` + (20 down to 0)                   | `Bit20`, …, `Bit0`          |
| PCRC-13 bits             | `"Bit"`      | `Bit` + (12 down to 0)                   | `Bit12`, …, `Bit0`          |
| FCRC-32 bits             | `"Bit"`      | `Bit` + (31 down to 0)                   | `Bit31`, …, `Bit0`          |
| SBC bits (FD: 4 bits)    | `"Bit"`      | `Bit` + (3 down to 0)                    | `Bit3`, `Bit2`, `Bit1`, `Bit0` |
| SBC bits (XL: 3 bits)    | `"Bit"`      | `Bit` + (2 down to 0)                    | `Bit2`, `Bit1`, `Bit0`      |
| SDT bits (8 bits)        | `"Bit"`      | `Bit` + (7 down to 0)                    | `Bit7`, …, `Bit0`           |
| VCID bits (8 bits)       | `"Bit"`      | `Bit` + (7 down to 0)                    | `Bit7`, …, `Bit0`           |
| AF bits (32 bits)        | `"Bit"`      | `Bit` + (31 down to 0)                   | `Bit31`, …, `Bit0`          |
| FCP bits (4 bits)        | `"Bit"`      | `Bit` + (3 down to 0)                    | `Bit3`, `Bit2`, `Bit1`, `Bit0` |
| EOF bits (7 bits)        | `"Bit"`      | `Bit` + (6 down to 0)                    | `Bit6`, …, `Bit0`           |
| Stuff bits (dynamic)     | —            | `STUFF_DYN_NAME`                          | `"stuff"`                    |
| Stuff bits (fixed)       | —            | `STUFF_FIX_NAME`                          | `"stuff"`                    |

**General formula:** `bitNamePrefix + String(nominalBits - 1 - i)` where `i = 0, 1, 2, …`
**Exception:** If `nominalBits == 1` and `bitNamePrefix == ""`, use the element `name` directly.

---

## 8. HTML Input Area (Part 1)

All user-controllable fields are always **visible**. Fields not applicable to the selected frame type are **disabled and greyed out**.

| Input Field   | HTML Type  | Enabled when           | Default        |
|---------------|------------|------------------------|----------------|
| Frame Type    | dropdown   | always                 | `CC_CBFF`      |
| ID (hex)      | text       | always                 | `0x000`        |
| DLC           | number     | always                 | `0`            |
| Data (hex)    | text       | always (disabled for remote) | *(empty)* |
| BRS           | checkbox   | FD only                | unchecked (0)  |
| ESI           | checkbox   | FD only                | unchecked (0)  |
| SEC           | checkbox   | XL only                | unchecked (0)  |
| SDT (hex)     | text       | XL only                | `0x00`         |
| VCID (hex)    | text       | XL only                | `0x00`         |
| AF (hex)      | text       | XL only                | `0x00000000`   |
| ACK slot      | dropdown   | always                 | `1`            |

**Data input format:** Both `DE AD BE EF` (space-separated hex bytes) and `DEADBEEF` (continuous hex string) are accepted.

**Button:** `[Show Frame]` — triggers the full pipeline.

**Format bits** (SOF, IDE, FDF, XLF, RTR, SRR, RRS, r0, r1, res, resXL, ADH, DH1, DH2, DL1, etc.) are **NOT shown** in the input area. They are set internally by the code based on the selected frame type.

---

## 9. Drawing Area (Part 2)

### 9.1 Layout

```
┌── Checkboxes (horizontal row, above SVG) ────────────────────────────────────┐
│ ☑ show bit names    ☑ use color    ☑ use color stuff bit    ☑ show fields    │
├── SVG container (fixed height, horizontal scroll) ───────────────────────────┤
│ ┌─ Group names (line 1, only if "show fields" checked) ──────────────────┐   │
│ │       │ Arbitration field          │ Control field │ Data field │ CRC …│   │
│ ├─ Element names (line 2, only if "show fields" checked) ────────────────┤   │
│ │  SOF  │ ID[28:18]       │ RTR │IDE│r0│ DLC │ Byte0  Byte1 … │ CRC  … │   │
│ ├─ Bit names (rotated 90°, only if "show bit names" checked) ────────────┤   │
│ │  SOF ID28 ID27 ID26 … RTR IDE r0 Bit3 Bit2 … Bit7 Bit6 …             │   │
│ ├─ Digital waveform ─────────────────────────────────────────────────────┤   │
│ │   ┌──┐  ┌───────────┐  ┌──┐     ┌──┐                                  │   │
│ │   │  └──┘           └──┘  └─────┘  └── …                              │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Lines 1 & 2** only shown when checkbox **"show fields"** is checked
- **Bit names** only shown when **"show bit names"** is checked (text rotated 90°, not touching waveform)
- **"use color"** → colored background rectangles behind each bit (color per group/field)
- **"use color stuff bit"** → stuff bits get a colored background rectangle (orange)
- All checkboxes take effect only when **"Show Frame"** is pressed (not live-updating)
- Waveform: dominant (0) = **low**, recessive (1) = **high**
- SVG height is **fixed**; container scrolls **horizontally only**

### 9.2 Drawing Configuration Constants

```javascript
const DRAW_CFG = {
  bitWidth:           20,     // px per bit
  bitHeight:          40,     // px: waveform amplitude (vertical distance between low and high)
  lineWidth:          2,      // px: waveform stroke width
  fontSizeBitName:    10,     // px
  fontSizeFieldName:  12,     // px
  gapBitNameToWave:   4,      // px gap between bit name text bottom and waveform top
  gapFieldToWave:     20,     // px between field/element header area and bit name area
  paddingTop:         10,     // px above everything
  paddingBottom:      10,     // px below waveform
  paddingLeft:        10,     // px left margin

  colors: {
    waveformLine:    "#000000",    // waveform stroke color
    background:      "#FFFFFF",    // page/SVG background
    stuffBit:        "#FF8C00",    // orange (stuff bit background rectangle)
    // Group/field background colors (for "use color"):
    sof:             "#B0BEC5",
    arbitration:     "#90CAF9",
    control:         "#A5D6A7",
    data:            "#CE93D8",
    crc:             "#FFCC80",
    ack:             "#F48FB1",
    eof:             "#B0BEC5",
  },
};
```

---

## 10. Export Area (Part 3)

A separate row **below the SVG**.

| Button       | Filename pattern             | Content                          |
|--------------|------------------------------|----------------------------------|
| Download SVG | `CBFF_DLC8.svg`              | The `<svg>` element as-is        |
| Download PNG | `CBFF_DLC8.png`              | SVG rendered to canvas → PNG     |
| Download CSV | `CBFF_DLC8.csv`              | Bit-level data table (see below) |

**Filename pattern:** `<FRAME_FORMAT_SHORT>_DLC<value>.<ext>` — e.g., `CBFF_DLC4.svg`, `FEFF_DLC15.png`, `XBFF_DLC127.csv`.

### CSV Format

- Separator: semicolon `;`
- 4 columns: `bit_value`, `bit_name`, `element_name`, `field_name`
- One row per bit (including stuff bits)
- Header row included

**Example (CC_CBFF, DLC=2, data=0x00 0x00, truncated):**

```csv
bit_value;bit_name;element_name;field_name
0;SOF;SOF;
1;ID28;ID[28:18];Arbitration field
1;ID27;ID[28:18];Arbitration field
1;ID26;ID[28:18];Arbitration field
...
0;stuff;stuff;Arbitration field
...
0;RTR;RTR;Arbitration field
0;IDE;IDE;Control field
0;r0;r0;Control field
1;Bit3;DLC;Control field
0;Bit2;DLC;Control field
0;Bit1;DLC;Control field
0;Bit0;DLC;Control field
0;Bit7;Byte0;Data field
0;Bit6;Byte0;Data field
...
1;Bit14;CRC;CRC field
0;Bit13;CRC;CRC field
...
1;CRC del;CRC del;CRC field
1;ACK slot;ACK slot;ACK field
1;ACK del;ACK del;ACK field
1;Bit6;EOF;EOF
...
```

For stuff bits, `element_name` is set to `"stuff"` and `field_name` is the field group where the stuff bit was inserted.

---

## 11. HTML Page Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  CAN Frame Visualizer  V1.0.0                                   [Help]  │
├──────────────┬───────────────────────────────────────────────────────────┤
│ Input        │  ☑ show bit names  ☑ use color  ☑ color stuff  ☑ fields  │
│ (left col)   │                                                           │
│              ├───────────────────────────────────────────────────────────┤
│ Frame Type   │                                                           │
│ ID           │  SVG waveform (horizontally scrollable)                   │
│ DLC          │                                                           │
│ Data         │                                                           │
│ BRS / ESI    │                                                           │
│ SEC / SDT    ├───────────────────────────────────────────────────────────┤
│ VCID / AF    │  Export: [SVG] [PNG] [CSV]                                │
│ ACK slot     │                                                           │
│              │                                                           │
│ [Show Frame] │                                                           │
└──────────────┴───────────────────────────────────────────────────────────┘
```

Uses the shared `../styles.css`. Same header/footer structure as `reg_eval/index.html`.

---

## 12. File Structure

```
can_frame/
├── index.html              ← main page
├── frame_main.js           ← init, event listeners, orchestration (reads input, calls build, triggers draw)
├── frame_builder.js        ← CanFrame class: build frame structure, nominal bits, stuff bits, CRC
├── frame_crc.js            ← CRC-15, CRC-17, CRC-21, CRC-13, CRC-32 implementations
├── frame_draw.js           ← SVG drawing function (reads myFrame.fields[], renders waveform)
├── frame_export.js         ← SVG/PNG/CSV download helpers
├── frame_definitions.js    ← field definition templates per frame type (used by _buildFrameStructure)
└── styles.css              ← shared (already exists at ../styles.css)
```

All scripts loaded via plain `<script src="...">` tags (no ES modules).

---

## 13. DLC Mapping Reference

### CC frames (CBFF, CEFF)

| DLC | Data bytes |
|-----|------------|
| 0   | 0          |
| 1   | 1          |
| 2   | 2          |
| 3   | 3          |
| 4   | 4          |
| 5   | 5          |
| 6   | 6          |
| 7   | 7          |
| 8   | 8          |
| 9–15 | 8 (capped) |

### FD frames (FBFF, FEFF)

| DLC | Data bytes |
|-----|------------|
| 0   | 0          |
| 1   | 1          |
| 2   | 2          |
| 3   | 3          |
| 4   | 4          |
| 5   | 5          |
| 6   | 6          |
| 7   | 7          |
| 8   | 8          |
| 9   | 12         |
| 10  | 16         |
| 11  | 20         |
| 12  | 24         |
| 13  | 32         |
| 14  | 48         |
| 15  | 64         |

### XL frames (XBFF)

DLC is 11 bits, range 0–2047. Data field length = DLC + 1 → 1 to 2048 bytes.

---

*End of Specification V1.1*
