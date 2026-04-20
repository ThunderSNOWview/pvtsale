import { PrivacyPresale__factory } from "@/web3/contracts";
import type { Address, PublicClient } from "viem";

/** Decrypts `viewClaimableTokens(user)` for a presale via CoFHE (view-only). */
export async function decryptClaimableTokensAmount(
  publicClient: PublicClient,
  cofheClient: {
    permits: { getOrCreateSelfPermit: () => Promise<unknown> };
    decryptForView: (h: bigint, t: unknown) => { execute: () => Promise<bigint | string> };
  },
  presaleAddress: Address,
  userAddress: Address,
): Promise<bigint> {
  const { FheTypes } = await import("@cofhe/sdk");

  const claimCtHash = await publicClient.readContract({
    address: presaleAddress,
    abi: PrivacyPresale__factory.abi,
    functionName: "viewClaimableTokens",
    args: [userAddress],
  });

  const claimCtHashBigInt = claimCtHash ? BigInt(claimCtHash as string | bigint) : 0n;
  if (claimCtHashBigInt === 0n) return 0n;

  await cofheClient.permits.getOrCreateSelfPermit();
  const decrypted = await cofheClient.decryptForView(claimCtHashBigInt, FheTypes.Uint128).execute();
  return BigInt(decrypted);
}
