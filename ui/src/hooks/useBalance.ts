import { ConfidentialWETH__factory } from "@/web3/contracts";
import { C_WETH9, ChainId } from "@/web3/core/constants";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { Address, formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import { GetBalanceData } from "wagmi/query";
import useWeb3 from "./useWeb3";
import useCofheClient from "./useCofheClient";

export type UseCommonBalancesOptions = UseMutationOptions<GetBalanceData>;

function missingDepsMessage(opts: {
  address?: string;
  cWETH: unknown;
  publicClient: unknown;
  cofheClient: unknown;
  isReady: boolean;
}) {
  const parts: string[] = [];
  if (!opts.address) parts.push("connect your wallet");
  if (!opts.cWETH) parts.push("cWETH is only configured for Sepolia");
  if (!opts.publicClient) parts.push("no RPC client for Sepolia");
  if (!opts.cofheClient || !opts.isReady) parts.push("wait for CoFHE to finish initializing (or check the console)");
  return parts.length ? parts.join(" · ") : "unknown error";
}

export function useCWETHBalanceMutation(address?: string, options?: UseCommonBalancesOptions) {
  const { chainId } = useWeb3();
  const cWETH = C_WETH9[ChainId.SEPOLIA];
  const publicClient = usePublicClient({ chainId: ChainId.SEPOLIA });
  const { client: cofheClient, isReady } = useCofheClient();

  const canDecrypt = Boolean(address && cWETH && publicClient && cofheClient && isReady);

  const mutation = useMutation({
    mutationKey: ["cwethBalance", address, chainId],
    mutationFn: async () => {
      if (!address || !cWETH || !publicClient || !cofheClient || !isReady) {
        throw new Error(
          missingDepsMessage({ address, cWETH, publicClient, cofheClient, isReady }),
        );
      }

      // coFHE decryptForView flow:
      // 1. Read the ctHash handle from the contract
      // 2. Call client.decryptForView(ctHash, FheTypes.Uint128).execute()

      const { FheTypes } = await import("@cofhe/sdk");

      const ctHash = await publicClient.readContract({
        address: cWETH.address as Address,
        abi: ConfidentialWETH__factory.abi,
        functionName: "balanceOfEncrypted",
        args: [address as Address],
      });

      const ctHashBigInt = ctHash ? BigInt(ctHash as string | bigint) : 0n;
      if (ctHashBigInt === 0n) {
        return {
          decimals: cWETH.decimals,
          symbol: cWETH.symbol || "cWETH",
          value: 0n,
          formatted: "0",
        };
      }

      // Ensure we have a self permit (prompts wallet signature if needed)
      await cofheClient.permits.getOrCreateSelfPermit();

      // Decrypt the balance for UI display
      const balance = await cofheClient
        .decryptForView(ctHash, FheTypes.Uint128)
        .execute();

      return {
        decimals: cWETH.decimals,
        symbol: cWETH.symbol || "cWETH",
        value: BigInt(balance),
        formatted: formatUnits(BigInt(balance), cWETH.decimals),
      };
    },
    retry: 0,
    ...options,
  });

  return {
    ...mutation,
    canDecryptCwethBalance: canDecrypt,
    cwethBalanceBlockedReason: canDecrypt
      ? undefined
      : missingDepsMessage({ address, cWETH, publicClient, cofheClient, isReady }),
  };
}
