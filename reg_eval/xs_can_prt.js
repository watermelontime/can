// XS_CAN: PRT register decoding
import { getBits } from './help_functions.js';
import { sevC } from './help_functions.js';

// ==================================================================================
// Process Nominal Bit Timing Register: Extract parameters, validate ranges, calculate results, generate report
export function procRegsPrtOther(reg) {

// TODO: add X_CANB to Website (PRT nearly identical to X_CAN)
// TODO: add XS_CAN to Website (PRT similar to X_CAN, but some differences and some more registers)

// Comparison of X_CANB XS_CAN X_CAN PRT Registers:
// X_CAN & X_CANB => same, but X_CANB has some more configuration bits in some registers!
// X_CAN & XS_CAN => differences in XS_CAN
//   no PREL
//   STAT0 = new name of STAT, uses PREL address
//   STAT1 = new
//   STATISTIC_COUNTER = new
//   EVNT register has 2 new bits: 14, 15

// TODO: add special XS_CAN PRT registers

} // PRT