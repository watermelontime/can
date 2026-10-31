// All rights reserved. (c) 2026 //
// =============================================================================
// sim_bsp.js — Bit Stream Processor: build the XLFF logical bit sequence.
// Produces an ordered array of bits with frame metadata (field / phase / name)
// and stuff bits (dynamic + fixed, ISO 11898-1). Field sizes mirror
// frame/frame_definitions.js (getDefinition_XL_XBFF). CRC values are fixed
// inputs (never computed).
// =============================================================================

import { DOMINANT, RECESSIVE } from './sim_bittiming.js';

// Push `nbits` of `value` (MSB first) as individual bit records.
function pushBits(arr, value, nbits, field, subfield, phase, names) {
  for (let i = nbits - 1; i >= 0; i--) {
    const bitVal = (Number(value) >> i) & 1;
    arr.push({
      name: names ? names[nbits - 1 - i] : `${subfield}${i}`,
      field,
      subfield,
      phase,
      value: bitVal,
      stuff: false,
    });
  }
}

// Single bit whose subfield is the bit name itself.
const bit = (name, field, phase, value, extra = {}) => ({
  name, field, subfield: name, phase, value, stuff: false, ...extra,
});

// Field IDs (bit.field); display names as used in frame/frame_definitions.js.
const F_SOF = 'sofField';
const F_ARB = 'arbField';
const F_CTRL = 'ctrlField';
const F_DATA = 'dataField';
const F_CRC = 'crcField';
const F_ACK = 'ackField';
const F_EOF = 'eofField';

export const FIELD_NAMES = {
  [F_SOF]: 'SOF',
  [F_ARB]: 'Arbitration field',
  [F_CTRL]: 'Control field',
  [F_DATA]: 'Data field',
  [F_CRC]: 'CRC field',
  [F_ACK]: 'ACK field',
  [F_EOF]: 'EOF',
};

// Build the un-stuffed, ordered bit list for one node's frame.
function buildRawBits(node) {
  const f = node.frame;
  const bits = [];
  const ARB = 'arb';
  const DATA = 'data';

  bits.push(bit('SOF', F_SOF, ARB, DOMINANT));

  // Arbitration field
  const idNames = ['ID28','ID27','ID26','ID25','ID24','ID23','ID22','ID21','ID20','ID19','ID18'];
  pushBits(bits, f.id & 0x7FF, 11, F_ARB, 'Priority ID', ARB, idNames);
  bits.push(bit('RRS', F_ARB, ARB, f.rrs & 1));
  bits.push(bit('IDE', F_ARB, ARB, DOMINANT));
  bits.push(bit('FDF', F_ARB, ARB, RECESSIVE));
  bits.push(bit('XLF', F_ARB, ARB, RECESSIVE));

  // Control field — resXL + ADH in arbitration phase; DH1 switches to data phase.
  bits.push(bit('resXL', F_CTRL, ARB, DOMINANT));
  // ADS = 0xE => ADH=1, DH1=1, DH2=1, DL1=0
  const ads = (name, phase, value) => ({ ...bit(name, F_CTRL, phase, value), subfield: 'ADS' });
  bits.push(ads('ADH', ARB, RECESSIVE));
  bits.push(ads('DH1', DATA, RECESSIVE));
  bits.push(ads('DH2', DATA, RECESSIVE));
  bits.push(ads('DL1', DATA, DOMINANT));

  pushBits(bits, f.sdt & 0xFF, 8, F_CTRL, 'SDT', DATA);
  bits.push(bit('SEC', F_CTRL, DATA, f.sec & 1));
  pushBits(bits, f.dlc & 0x7FF, 11, F_CTRL, 'DLC', DATA);
  pushBits(bits, 0, 3, F_CTRL, 'SBC', DATA);           // stuff-bit count — 0 in v1
  pushBits(bits, f.pcrc & 0x1FFF, 13, F_CTRL, 'PCRC', DATA);
  pushBits(bits, f.vcid & 0xFF, 8, F_CTRL, 'VCID', DATA);
  pushBits(bits, f.af >>> 0, 32, F_CTRL, 'AF', DATA);

  // Data field: (DLC + 1) bytes
  const byteCount = (f.dlc & 0x7FF) + 1;
  for (let b = 0; b < byteCount; b++) {
    const byteVal = (f.data && f.data[b] !== undefined) ? f.data[b] : 0;
    const names = [7, 6, 5, 4, 3, 2, 1, 0].map((i) => `Data${b}${i}`);
    pushBits(bits, byteVal & 0xFF, 8, F_DATA, `Byte${b}`, DATA, names);
  }

  // CRC field: FCRC(32) + FCP(4 = 0xC)
  pushBits(bits, f.fcrc >>> 0, 32, F_CRC, 'FCRC', DATA);
  pushBits(bits, 0xC, 4, F_CRC, 'FCP', DATA, ['FCP3', 'FCP2', 'FCP1', 'FCP0']);

  // ACK field: DAS(4 = 0xD => DAH,AH1,AL1,AH2) + ACK slot + ACK delimiter
  const das = (name, value) => ({ ...bit(name, F_ACK, ARB, value), subfield: 'DAS' });
  bits.push(das('DAH', RECESSIVE));
  bits.push(das('AH1', RECESSIVE));
  bits.push(das('AL1', DOMINANT));
  bits.push(das('AH2', RECESSIVE));
  bits.push(bit('ACK slot', F_ACK, ARB, RECESSIVE, { ackSlot: true }));
  bits.push(bit('ACK del', F_ACK, ARB, RECESSIVE));

  // EOF (7 recessive)
  pushBits(bits, 0x7F, 7, F_EOF, 'EOF', ARB, ['EOF1','EOF2','EOF3','EOF4','EOF5','EOF6','EOF7']);

  return bits;
}

const DYN_STUFF_RUN = 5;
const FIXED_STUFF_DIST = 10;

const stuffBit = (prev) => ({
  name: 'stuff', field: prev.field, subfield: prev.subfield, phase: prev.phase,
  value: prev.value === DOMINANT ? RECESSIVE : DOMINANT, stuff: true,
});

// ISO 11898-1 XL bit stuffing. Stuff bits inherit field/phase of the preceding bit.
//  - dynamic: SOF..IDE; after 5 equal bits the complement is inserted (the
//    last dynamic stuff bit may follow IDE)
//  - fixed: after each 10th frame bit counted from and including DL1, a bit
//    with the inverse value of the preceding bit is inserted; the last one may
//    directly follow FCRC0.
function applyStuffing(raw) {
  const iIde = raw.findIndex((b) => b.name === 'IDE');
  const iDl1 = raw.findIndex((b) => b.name === 'DL1');
  const iFcrc0 = raw.findIndex((b) => b.name === 'FCRC0');
  const out = [];
  let runVal = null;
  let runLen = 0;
  for (let i = 0; i < raw.length; i++) {
    const bit = raw[i];
    out.push(bit);

    if (i <= iIde) {
      if (bit.value === runVal) runLen++;
      else { runVal = bit.value; runLen = 1; }
      if (runLen === DYN_STUFF_RUN) {
        const s = stuffBit(bit);
        out.push(s);
        runVal = s.value;
        runLen = 1;
      }
    }

    if (i >= iDl1 && i <= iFcrc0 && (i - iDl1 + 1) % FIXED_STUFF_DIST === 0) {
      out.push(stuffBit(bit));
    }
  }
  return out;
}

// Public: build the final stuffed bit sequence for a node.
export function buildBitSequence(node) {
  return applyStuffing(buildRawBits(node));
}

const MAX_DH = 6;

// Online Bit Stream Processor. Starts as transmitter of its own frame; loses
// arbitration when it sends recessive but samples dominant (up to XLF) and then
// follows the other node's frame as receiver.
//  - transmitter: sends the ACK slot recessive and expects it dominant (ACK
//    error otherwise); bit monitoring ignored from ADH to FCP0
//  - receiver: sampled level must match the expected bit (ADH is ignored),
//    except for the DH*
//    tolerance: DH1 required; each following bit is DHn when sampled 1 or DL1
//    when sampled 0; a 1 after DH6 is an error.
// After an error the node stays in error state (drives recessive, done).
export class Bsp {
  constructor(ownSeq, otherSeq) {
    this.other = otherSeq;
    this.role = 'transmitter';
    this.idx = 0;
    this.dh = 0;
    this.errored = false;
    this.done = false;
    this.useSeq(ownSeq);
    this.bit = this.seq[0];
  }

  useSeq(seq) {
    const find = (name) => seq.findIndex((b) => b.name === name);
    this.seq = seq;
    this.iXlf = find('XLF');
    this.iAdh = find('ADH');
    this.iDl1 = find('DL1');
    this.iFcp0 = find('FCP0');
  }

  get isTx() {
    return this.role === 'transmitter';
  }

  // Follow the other node's frame from the current bit position on.
  becomeReceiver() {
    this.role = 'receiver';
    this.useSeq(this.other);
    this.bit = this.seq[this.idx];
  }

  // Level handed to the BTL / PWM encoder for the current bit.
  drive() {
    if (this.errored || this.done) return RECESSIVE;
    if (this.isTx) return this.bit.value;
    return this.bit.ackSlot ? DOMINANT : RECESSIVE;
  }

  // Value sampled at the SP. Returns { lost, error }.
  sample(rx) {
    const b = this.bit;
    const res = { lost: false, error: false };
    if (this.isTx) {
      const sent = this.drive();
      if (sent === RECESSIVE && rx === DOMINANT && this.idx <= this.iXlf) {
        this.becomeReceiver();
        res.lost = true;
        return res;
      }
      if (b.ackSlot) {
        res.error = rx !== DOMINANT; // ACK error: no receiver acknowledged
      } else {
        const ignored = this.idx >= this.iAdh && this.idx <= this.iFcp0;
        res.error = !ignored && rx !== sent;
      }
    } else if (b.ackSlot) {
      res.error = rx !== DOMINANT;
    } else if (b.candidate) {
      if (rx === DOMINANT) {
        this.bit = { ...b, name: 'DL1', candidate: false };
        this.dh = 0;
        this.idx = this.iDl1;
      } else if (this.dh < MAX_DH) {
        this.dh++;
        this.bit = { ...b, name: `DH${this.dh}` };
      } else {
        this.bit = { ...b, name: 'DL1' };
        res.error = true;
      }
    } else if (b.name === 'DH1') {
      if (rx !== RECESSIVE) res.error = true;
      else this.dh = 1;
    } else if (b.name !== 'ADH') {
      res.error = rx !== b.value;
    }
    if (res.error) this.errored = true;
    return res;
  }

  // Advance to the next bit (called at the end of a bit).
  next() {
    if (this.errored) {
      this.done = true;
      return;
    }
    if (this.dh > 0) {
      this.bit = {
        name: 'DH?', field: F_CTRL, subfield: 'ADS', phase: 'data', value: RECESSIVE, stuff: false, candidate: true,
      };
      return;
    }
    this.idx++;
    if (this.idx >= this.seq.length) {
      this.done = true;
      return;
    }
    this.bit = this.seq[this.idx];
  }

  // Hard synchronization on a recessive->dominant edge. Returns null (no hard
  // sync), 'restart' (current bit restarts at the edge) or 'next' (the next bit
  // starts at the edge).
  //  - SOF: receivers always; a transmitter only on an early edge
  //  - receivers: XLF->resXL edge and the DL1 edge (end of the DH* bits)
  hardSyncMode(edgeAfterSp) {
    const b = this.bit;
    const startsAtEdge = edgeAfterSp ? 'next' : 'restart';
    if (b.name === 'SOF') {
      if (!this.isTx) return 'restart';
      return edgeAfterSp ? 'next' : null;
    }
    if (this.isTx) return null;
    if (b.name === 'resXL') return 'restart';
    if (b.name === 'XLF') return edgeAfterSp ? 'next' : null;
    if (b.name === 'DH1' || b.candidate) return startsAtEdge;
    return null;
  }
}
