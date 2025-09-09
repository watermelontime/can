// Severity level constants as an object
export const sevC = {
  info: 0,
  infoVerbose: 1,
  infoHighlighted: 2,
  warning: 3,
  error: 4,
  recommendation: 5,
  calculation: 6,
};

// Helper function to extract bits from register value
export function getBits(regVal, endBit, startBit) {
  // endBit: with larger index
  // startBit: with smaller index
  // example: getBits(0b11110000, 4, 3) => 0b10
  const length = endBit - startBit + 1;
  if (length == 32) {
    // Special case for 32-bit fields
    return regVal & 0xFFFFFFFF;
  } else {
    // length 1 to 31s
    const mask = (1 << length) - 1;
    return (regVal >> startBit) & mask;
  }
}

// Generate binary line data for a given register value
// 0 0 0 0   0 0 0 1   1 0 1 0   0 0 1 1 ...
export function getBinaryLineData(regValue, bits2print=32) {
  let lineData = "";
  for (let i = bits2print - 1; i >= 0; i--) {
    lineData += getBits(regValue, i, i);
    if (i > 0) lineData += " ";
    if (i % 4 === 0 && i > 0) lineData += "  ";
  }
  return lineData;
}

// Clear all elements of an object
export function clearObject(o) { Object.keys(o).forEach(k => delete o[k]); }