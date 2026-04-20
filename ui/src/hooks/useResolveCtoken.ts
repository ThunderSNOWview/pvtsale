import {
  PrivacyPresale__factory,
  PrivacyPresaleFactory__factory,
} from "@/web3/contracts";
import { ConfidentialTokenWrapper__factory } from "@/web3/contracts/factories/contracts/ConfidentialTokenWrapper__factory";
import { PRIVACY_PRESALE_FACTORY_ADDRESS } from "@/web3/core/constants";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { isAddress } from "viem";
import { usePublicClient } from "wagmi";
import useWeb3 from "./useWeb3";

export type PresaleWrapperMatch = {
  presale: Address;
  ctoken: Address;
};

export type ResolveCtokenResult =
  | { kind: "factory"; matches: PresaleWrapperMatch[] }
  | { kind: "direct_wrapper"; ctoken: Address; underlying: Address }
  | { kind: "none" };

/**
 * From a public ERC-20 address: scan this chain’s PrivacyPresaleFactory presales for matching `pool.token`.
 * If no match, checks whether the address is already a ConfidentialTokenWrapper (`underlyingToken()`).
 */
export function useResolveCtokenFromInput(inputAddress: string | undefined, enabled: boolean) {
  const { chainId } = useWeb3();
  const publicClient = usePublicClient({ chainId });
  const factoryAddress = PRIVACY_PRESALE_FACTORY_ADDRESS[Number(chainId) as keyof typeof PRIVACY_PRESALE_FACTORY_ADDRESS];

  return useQuery({
    queryKey: ["resolveCtoken", inputAddress, chainId],
    queryFn: async (): Promise<ResolveCtokenResult> => {
      if (!publicClient || !inputAddress || !isAddress(inputAddress)) {
        return { kind: "none" };
      }
      if (!factoryAddress) return { kind: "none" };

      const normalized = inputAddress.toLowerCase() as Address;

      const list = (await publicClient.readContract({
        address: factoryAddress as Address,
        abi: PrivacyPresaleFactory__factory.abi,
        functionName: "getPresales",
      })) as Address[];

      const matches: PresaleWrapperMatch[] = [];

      if (list.length > 0) {
        const poolResults = await publicClient.multicall({
          contracts: list.map((presale) => ({
            address: presale,
            abi: PrivacyPresale__factory.abi,
            functionName: "pool" as const,
          })),
          allowFailure: true,
        });

        list.forEach((presale, i) => {
          const res = poolResults[i];
          if (res.status !== "success" || !res.result) return;
          const pool = res.result as readonly unknown[];
          const ctoken = pool[2] as Address;
          const token = String(pool[3]).toLowerCase() as Address;
          if (token === normalized) {
            matches.push({ presale, ctoken });
          }
        });
      }

      if (matches.length > 0) {
        return { kind: "factory", matches };
      }

      try {
        const underlying = (await publicClient.readContract({
          address: normalized,
          abi: ConfidentialTokenWrapper__factory.abi,
          functionName: "underlyingToken",
        })) as Address;
        return { kind: "direct_wrapper", ctoken: normalized, underlying };
      } catch {
        return { kind: "none" };
      }
    },
    enabled: Boolean(enabled && publicClient && factoryAddress && inputAddress && isAddress(inputAddress)),
    staleTime: 30_000,
  });
}
