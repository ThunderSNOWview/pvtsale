import { AddressMap } from "../types";
import { ChainId } from "./chains";

export const WETH9_ADDRESS: AddressMap = {
  [ChainId.SEPOLIA]: "",
};

export const TOKEN_FACTORY_ADDRESS: AddressMap = {
  [ChainId.SEPOLIA]: "0x01DF4400383fB61997FfF49f0B1A5A55494e72e1",
};

export const CONFIDENTIAL_WETH_ADDRESS: AddressMap = {
  [ChainId.SEPOLIA]: "0x4bfeD648B058CcF97594c4d5e556A99912C68eD9",
};

export const PRIVACY_PRESALE_FACTORY_ADDRESS: AddressMap = {
  [ChainId.SEPOLIA]:
    import.meta.env.VITE_PRESALE_FACTORY_CA || "0xc917C03b18a04Bc994679c6E778C9D1916445d51",
};
