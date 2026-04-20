import { Ether } from "../entities/Native";
import { NativeMap, TokenMap } from "../types";
import { ChainId } from "./chains";
import { WETH9 } from "./tokens";

export const NATIVE: NativeMap = {
  [ChainId.SEPOLIA]: Ether.onChain(ChainId.SEPOLIA),
};

export const WNATIVE: TokenMap = {
  [ChainId.SEPOLIA]: WETH9[ChainId.SEPOLIA],
};
