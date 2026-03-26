// =============================================================================
// frame_crc.js — CRC calculation functions for CAN frames
// =============================================================================
// CRC-15  (CC frames)
// CRC-17  (FD frames, ≤16 data bytes)
// CRC-21  (FD frames, >16 data bytes)
// CRC-13  (XL PCRC, header CRC)
// CRC-32  (XL FCRC, frame CRC)
//
// All functions take an array of bit values (0/1) and return the CRC as integer.
// =============================================================================

/**
 * Generic CRC calculation using standard LFSR feedback approach.
 * feedback = dataBit XOR MSB(crc); shift left; if feedback, XOR with poly.
 * This matches the CAN specification (ISO 11898-1) CRC algorithm.
 * @param {number[]} bitStream - Array of 0/1 values (MSB first)
 * @param {number} crcBits - Number of CRC bits (e.g., 15, 17, 21, 13, 32)
 * @param {number} poly - Generator polynomial WITHOUT leading 1 (e.g., 0x4599 for CRC-15)
 * @param {number} initVal - Initial CRC register value
 * @returns {number} CRC value as integer
 */
function crcCalculate(bitStream, crcBits, poly, initVal) {
  // For CRC-32 we need BigInt because JS numbers lose precision above 2^53
  if (crcBits > 30) {
    return Number(crcCalculateBigInt(bitStream, crcBits, BigInt(poly), BigInt(initVal)));
  }

  var crc = initVal;
  var topBitMask = 1 << (crcBits - 1);
  var crcMask = (1 << crcBits) - 1;

  for (var i = 0; i < bitStream.length; i++) {
    var dataBit = bitStream[i];
    var feedback = dataBit ^ ((crc & topBitMask) ? 1 : 0);

    crc = (crc << 1) & crcMask;

    if (feedback) {
      crc = (crc ^ poly) & crcMask;
    }
  }

  return crc;
}

/**
 * BigInt version for CRC-32 (and any CRC > 30 bits).
 */
function crcCalculateBigInt(bitStream, crcBits, poly, initVal) {
  var crc = initVal;
  var topBitMask = 1n << BigInt(crcBits - 1);
  var crcMask = (1n << BigInt(crcBits)) - 1n;

  for (var i = 0; i < bitStream.length; i++) {
    var dataBit = BigInt(bitStream[i]);
    var feedback = dataBit ^ ((crc & topBitMask) ? 1n : 0n);

    crc = (crc << 1n) & crcMask;

    if (feedback) {
      crc = (crc ^ poly) & crcMask;
    }
  }

  return crc;
}

/**
 * CRC calculation with trace: returns array of shift register values after each step.
 * trace[0] = initial value, trace[i+1] = register after processing bit i.
 * Total entries = bitStream.length + 1.
 */
function crcCalculateTrace(bitStream, crcBits, poly, initVal) {
  var crc = initVal;
  var topBitMask = 1 << (crcBits - 1);
  var crcMask = (1 << crcBits) - 1;
  var trace = [crc];

  for (var i = 0; i < bitStream.length; i++) {
    var dataBit = bitStream[i];
    var feedback = dataBit ^ ((crc & topBitMask) ? 1 : 0);

    crc = (crc << 1) & crcMask;

    if (feedback) {
      crc = (crc ^ poly) & crcMask;
    }
    trace.push(crc);
  }

  return trace;
}

// =============================================================================
// CRC-15 for CAN CC frames
// Polynomial: x^15 + x^14 + x^10 + x^8 + x^7 + x^4 + x^3 + 1
// Hex (without leading 1): 0x4599
// Init: all zeros
// =============================================================================
function crc15(bitStream) {
  return crcCalculate(bitStream, 15, 0x4599, 0x0000);
}

// =============================================================================
// CRC-17 for CAN FD frames (≤16 data bytes)
// Polynomial: x^17 + x^16 + x^14 + x^13 + x^11 + x^6 + x^4 + x^3 + x + 1
// Hex (without leading 1): 0x1685B
// Init: MSB=1, rest 0 → 0x10000
// =============================================================================
function crc17(bitStream) {
  return crcCalculate(bitStream, 17, 0x1685B, 0x10000);
}

// =============================================================================
// CRC-21 for CAN FD frames (>16 data bytes)
// Polynomial: x^21 + x^20 + x^13 + x^11 + x^7 + x^4 + x^3 + 1
// Hex (without leading 1): 0x102899
// Init: MSB=1, rest 0 → 0x100000
// =============================================================================
function crc21(bitStream) {
  return crcCalculate(bitStream, 21, 0x102899, 0x100000);
}

// =============================================================================
// CRC-13 for CAN XL PCRC (header CRC)
// Polynomial: x^13 + x^12 + x^11 + x^8 + x^7 + x^6 + x^5 + x^2 + x + 1
// Hex (without leading 1): 0x19E7
// Init: LSB=1, rest 0 → 0x0001
// =============================================================================
function crc13(bitStream) {
  return crcCalculate(bitStream, 13, 0x19E7, 0x0001);
}

// --- Trace variants (return array of shift register values after each step) ---
function crc15Trace(bitStream) { return crcCalculateTrace(bitStream, 15, 0x4599, 0x0000); }
function crc17Trace(bitStream) { return crcCalculateTrace(bitStream, 17, 0x1685B, 0x10000); }
function crc21Trace(bitStream) { return crcCalculateTrace(bitStream, 21, 0x102899, 0x100000); }
function crc13Trace(bitStream) { return crcCalculateTrace(bitStream, 13, 0x19E7, 0x0001); }

// =============================================================================
// CRC-32 for CAN XL FCRC (frame CRC)
// Polynomial: x^32+x^31+x^30+x^29+x^28+x^26+x^23+x^21+x^19+x^18+x^15+x^14+x^13+x^12+x^11+x^9+x^8+x^4+x+1
// Hex (without leading 1): 0xF4ACFB13
// Init: LSB=1, rest 0 → 0x00000001
// =============================================================================
function crc32can(bitStream) {
  return crcCalculate(bitStream, 32, 0xF4ACFB13, 0x00000001);
}
