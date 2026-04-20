/**
 * @cofhe/sdk uses `import * as nacl from 'tweetnacl'`. With Vite + CJS tweetnacl,
 * that pattern yields `nacl.box === undefined`, so `nacl.box.keyPair()` throws.
 * Re-export the real API as named exports so namespace imports work.
 */
import t from "tweetnacl/nacl-fast.js";

export const box = t.box;
export const randomBytes = t.randomBytes;
export const secretbox = t.secretbox;
export const sign = t.sign;
export const scalarMult = t.scalarMult;
export const hash = t.hash;
export const verify = t.verify;
export const setPRNG = t.setPRNG;
