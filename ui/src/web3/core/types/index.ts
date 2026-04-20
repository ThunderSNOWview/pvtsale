import { NativeCurrency, Token } from "../entities";
export type TokenMap = { [chainId: number]: Token };

export type AddressMap = { [chainId: number]: string };

export type NativeMap = { [chainId: number]: NativeCurrency };
