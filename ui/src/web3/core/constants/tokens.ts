import { Token } from "../entities";
import { TokenMap } from "../types";
import { CONFIDENTIAL_WETH_ADDRESS } from "./addresses";
import { ChainId } from "./chains";

export const WETH9: TokenMap = {};

export const C_WETH9: TokenMap = {
  [ChainId.SEPOLIA]: new Token(
    ChainId.SEPOLIA,
    CONFIDENTIAL_WETH_ADDRESS[ChainId.SEPOLIA],
    9,
    "cWETH",
    "Confidential WETH",
    "/images/empty-token.webp"
  ),
};
