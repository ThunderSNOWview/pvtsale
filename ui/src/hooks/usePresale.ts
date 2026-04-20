import { TQueryOptions } from "@/@types/common.types";
import { EPresaleOnchainState, EPresaleStatus, TPresale } from "@/@types/launchpad.types";
import { PrivacyPresale__factory, PrivacyPresaleFactory__factory } from "@/web3/contracts";
import { PRIVACY_PRESALE_FACTORY_ADDRESS } from "@/web3/core/constants";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Address, erc20Abi, formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import useWeb3 from "./useWeb3";

export type TPoolInfo = {
  presaleOwner: string;
  cweth: string;
  ctoken: string;
  token: string;
  options: {
    tokenPresale: bigint;
    tokenAddLiquidity: bigint;
    softCap: bigint;
    hardCap: bigint;
    minContribution: bigint;
    maxContribution: bigint;
    start: bigint;
    end: bigint;
    liquidityPercentage: number;
    listingRate: bigint;
  };
  ethRaisedEncrypted: bigint;
  tokensSoldEncrypted: bigint;
  weiRaised: bigint;
  tokensSold: bigint;
  tokenPerEthWithDecimals: bigint;
  state: EPresaleOnchainState;
};

/** Stored as 18-decimal fixed-point since deploy; smaller values treated as legacy whole-number rates. */
function decodeListingRate(raw: bigint): string {
  if (raw >= 1_000_000_000_000n) {
    return formatUnits(raw, 18);
  }
  return raw.toString();
}

// Helper function to map on-chain pool data and token metadata to our TPresale shape
function mapContractToPresale(presaleAddress: Address, poolArray: any, tokenMetadata: any): TPresale {
  const options = poolArray[4];
  
  return {
    presaleAddress,
    presaleOwner: poolArray[0],
    cweth: poolArray[1],
    ctoken: poolArray[2],
    token: {
      address: poolArray[3],
      name: tokenMetadata.name as string,
      symbol: tokenMetadata.symbol as string,
      decimals: tokenMetadata.decimals as number,
      totalSupply: (tokenMetadata.totalSupply as bigint).toString(),
    },
    softCap: options.softCap.toString(),
    hardCap: options.hardCap.toString(),
    minContribution: options.minContribution.toString(),
    maxContribution: options.maxContribution.toString(),
    startTime: Number(options.start) * 1000,
    endTime: Number(options.end) * 1000,
    liquidityPercent: Number(options.liquidityPercentage),
    listingRate: decodeListingRate(options.listingRate as bigint),
    tokensForSale: options.tokenPresale.toString(),
    tokensForLiquidity: options.tokenAddLiquidity.toString(),
    presaleRate: (options.tokenPresale / options.hardCap).toString(),
    weiRaised: poolArray[7].toString(),
    tokensSold: poolArray[8].toString(),
    status: poolArray[10] as EPresaleOnchainState,
  };
}

export function usePresaleListQuery(options?: TQueryOptions<TPresale[]>) {
  const { chainId } = useWeb3();
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: ["presaleList", chainId],
    queryFn: async () => {
      if (!publicClient) throw new Error("Public client not found");
      const factoryAddress = PRIVACY_PRESALE_FACTORY_ADDRESS[chainId] as Address;

      // 1. Get all presale addresses from factory
      const presales = (await publicClient.readContract({
        address: factoryAddress,
        abi: PrivacyPresaleFactory__factory.abi,
        functionName: "getPresales",
      })) as Address[];

      if (presales.length === 0) return [];

      // 2. Multicall pool() for all presales
      const poolContracts = presales.map((address) => ({
        address,
        abi: PrivacyPresale__factory.abi,
        functionName: "pool",
      }));

      const poolResults = await publicClient.multicall({
        contracts: poolContracts,
        allowFailure: false,
      });

      // 3. Extract unqiue token addresses to fetch metadata
      const uniqueTokenAddresses = [...new Set(poolResults.map((res: any) => res[3] as Address))];

      // 4. Multicall metadata for tokens
      const tokenContracts = uniqueTokenAddresses.flatMap((address) => [
        { address, abi: erc20Abi, functionName: "name" },
        { address, abi: erc20Abi, functionName: "symbol" },
        { address, abi: erc20Abi, functionName: "decimals" },
        { address, abi: erc20Abi, functionName: "totalSupply" },
      ]);

      const tokenResults = await publicClient.multicall({
        contracts: tokenContracts,
        allowFailure: false,
      });

      // Reconstruct token metadata map
      const metadataMap: Record<Address, any> = {};
      uniqueTokenAddresses.forEach((address, i) => {
        const baseIdx = i * 4;
        metadataMap[address] = {
          name: tokenResults[baseIdx],
          symbol: tokenResults[baseIdx + 1],
          decimals: tokenResults[baseIdx + 2],
          totalSupply: tokenResults[baseIdx + 3],
        };
      });

      // 5. Map all data to TPresale objects
      return presales.map((address, i) => {
        const poolArray = poolResults[i] as any;
        const metadata = metadataMap[poolArray[3] as Address];
        return mapContractToPresale(address, poolArray, metadata);
      });
    },
    staleTime: 10_000,
    ...options,
    enabled: options?.enabled ?? false,
  });
}

export function usePresaleQuery(presaleAddress?: string, options?: TQueryOptions<TPresale>) {
  const { chainId } = useWeb3();
  const publicClient = usePublicClient({ chainId });

  return useQuery({
    queryKey: ["presale", presaleAddress, chainId],
    queryFn: async () => {
      if (!publicClient || !presaleAddress) throw new Error("Missing params");

      // 1. Fetch pool data
      const poolData = (await publicClient.readContract({
        address: presaleAddress as Address,
        abi: PrivacyPresale__factory.abi,
        functionName: "pool",
      })) as any;

      const tokenAddress = poolData[3] as Address;

      // 2. Fetch token metadata
      const tokenResults = await publicClient.multicall({
        contracts: [
          { address: tokenAddress, abi: erc20Abi, functionName: "name" },
          { address: tokenAddress, abi: erc20Abi, functionName: "symbol" },
          { address: tokenAddress, abi: erc20Abi, functionName: "decimals" },
          { address: tokenAddress, abi: erc20Abi, functionName: "totalSupply" },
        ],
        allowFailure: false,
      });

      const tokenMetadata = {
        name: tokenResults[0],
        symbol: tokenResults[1],
        decimals: tokenResults[2],
        totalSupply: tokenResults[3],
      };

      // 3. Map to TPresale
      return mapContractToPresale(presaleAddress as Address, poolData, tokenMetadata);
    },
    staleTime: 10_000,
    ...options,
    enabled: !!presaleAddress && (options?.enabled ?? false),
  });
}

export const getPresaleStatus = (presale?: TPresale) => {
  if (!presale) return EPresaleStatus.Upcoming;
  const status = presale.status;
  const now = Date.now();

  if (now < presale.startTime) return EPresaleStatus.Upcoming;
  if (now > presale.endTime) {
    if (status == EPresaleOnchainState.FINALIZED) {
      return EPresaleStatus.Completed;
    } else if (status == EPresaleOnchainState.CANCELED) {
      return EPresaleStatus.Failed;
    }
    return EPresaleStatus.Ended;
  }
  return EPresaleStatus.Active;
};

export function usePresaleStatus(presale?: TPresale) {
  const [status, setStatus] = useState<EPresaleStatus>(EPresaleStatus.Upcoming);

  useEffect(() => {
    setStatus(getPresaleStatus(presale));
    const intervalId = setInterval(() => {
      setStatus(getPresaleStatus(presale));
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [presale]);

  return status;
}
