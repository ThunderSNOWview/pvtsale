import { TQueryOptions } from "@/@types/common.types";
import { TToken } from "@/@types/token.types";
import { ERC20__factory } from "@/web3/contracts";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "viem";
import { usePublicClient } from "wagmi";

export type UseErc20TokenInfoOptions = TQueryOptions<TToken>;

export function useErc20TokenInfo(tokenAddress?: string, options?: UseErc20TokenInfoOptions) {
  const publicClient = usePublicClient();
  const multicall = publicClient?.multicall;

  return useQuery({
    queryKey: ["erc20TokenInfo", tokenAddress],
    queryFn: async () => {
      if (!tokenAddress || !isAddress(tokenAddress)) {
        throw new Error("Invalid token address");
      }

      // query the blockchain for token info
      const res = await multicall!({
        contracts: [
          { abi: ERC20__factory.abi, address: tokenAddress, functionName: "name" },
          { abi: ERC20__factory.abi, address: tokenAddress, functionName: "symbol" },
          { abi: ERC20__factory.abi, address: tokenAddress, functionName: "decimals" },
          { abi: ERC20__factory.abi, address: tokenAddress, functionName: "totalSupply" },
        ],
        allowFailure: false,
      });

      // Simulate fetching token info from an API or blockchain
      // const response = await fetch(`/api/tokens/${tokenAddress}`);
      // if (!response.ok) {
      //   throw new Error("Failed to fetch token info");
      // }
      return {
        address: tokenAddress,
        name: res[0],
        symbol: res[1],
        decimals: res[2],
        totalSupply: res[3].toString(),
        icon: "/images/empty-token.webp",
      } as TToken;
    },
    staleTime: 10_000,
    ...options,
    enabled: !!tokenAddress && isAddress(tokenAddress) && !!multicall,
  });
}
