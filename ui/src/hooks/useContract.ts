import {
  ConfidentialWETH,
  ConfidentialWETH__factory,
  ERC20,
  ERC20__factory,
  PrivacyPresale,
  PrivacyPresale__factory,
  PrivacyPresaleFactory,
  PrivacyPresaleFactory__factory,
  TokenFactory,
  TokenFactory__factory,
} from "@/web3/contracts";
import type { ConfidentialTokenWrapper } from "@/web3/contracts/contracts/ConfidentialTokenWrapper";
import { ConfidentialTokenWrapper__factory } from "@/web3/contracts/factories/contracts/ConfidentialTokenWrapper__factory";
import {
  CONFIDENTIAL_WETH_ADDRESS,
  PRIVACY_PRESALE_FACTORY_ADDRESS,
  TOKEN_FACTORY_ADDRESS,
} from "@/web3/core/constants";
import { BaseContract, Contract, isAddress } from "ethers";
import { useMemo } from "react";
import { zeroAddress } from "viem";
import { useEthersProvider } from "./useEthersProvider";
import { useEthersSigner } from "./useEthersSigner";
import useWeb3 from "./useWeb3";

// returns null on errors
export default function useContract<T extends BaseContract = BaseContract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSigner = false,
  _chainId?: number
): T | null {
  const { chain } = useWeb3();
  const chainId = Number(_chainId ?? chain.id);
  const provider = useEthersProvider({ chainId });
  const signer = useEthersSigner({ chainId });

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null;
    let address: string | undefined;
    if (typeof addressOrAddressMap === "string") address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];

    if (!address) return null;

    try {
      if (!isAddress(address) || address === zeroAddress) {
        throw Error(`Invalid address: ${address}.`);
      }
      if (withSigner && !signer) return null;
      if (withSigner && signer) {
        return new Contract(address, ABI, signer) as unknown as T;
      } else if (provider) {
        return new Contract(address, ABI, provider) as unknown as T;
      }
      return null;
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSigner, signer]);
}

export function useErc20ContractRead(tokenAddress?: string) {
  return useContract<ERC20>(tokenAddress, ERC20__factory.abi, false);
}

export function useErc20ContractWrite(tokenAddress?: string) {
  return useContract<ERC20>(tokenAddress, ERC20__factory.abi, true);
}

export function useTokenFactoryContractWrite() {
  return useContract<TokenFactory>(TOKEN_FACTORY_ADDRESS, TokenFactory__factory.abi, true);
}

export function usePresaleFactoryContractWrite() {
  return useContract<PrivacyPresaleFactory>(PRIVACY_PRESALE_FACTORY_ADDRESS, PrivacyPresaleFactory__factory.abi, true);
}

export function useConfidentialWETHContractWrite() {
  return useContract<ConfidentialWETH>(CONFIDENTIAL_WETH_ADDRESS, ConfidentialWETH__factory.abi, true);
}

export function usePrivacyPresaleContractWrite(presaleAddress?: string) {
  return useContract<PrivacyPresale>(presaleAddress, PrivacyPresale__factory.abi, true);
}

export function useConfidentialTokenWrapperWrite(ctokenAddress?: string) {
  return useContract<ConfidentialTokenWrapper>(ctokenAddress, ConfidentialTokenWrapper__factory.abi, true);
}
