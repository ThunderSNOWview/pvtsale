import { TPresale } from "@/@types/launchpad.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCofheClient from "@/hooks/useCofheClient";
import { formatNumber } from "@/utils/format";
import { PrivacyPresale__factory } from "@/web3/contracts";
import { Token } from "@/web3/core/entities";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Address, formatUnits } from "viem";
import { usePublicClient } from "wagmi";

interface ContributionInfoProps {
  launchpadData: TPresale;
  CWETH: Token;
  address: string;
}

export default function ContributionInfo({ launchpadData, CWETH, address }: ContributionInfoProps) {
  const publicClient = usePublicClient();
  const { client: cofheClient, isReady } = useCofheClient();

  const [isRevealed, setIsRevealed] = useState(false);

  const {
    data,
    isPending: isInfoLoading,
    mutateAsync: fetchInfo,
  } = useMutation({
    mutationFn: async () => {
      if (!publicClient || !address || !cofheClient || !isReady) {
        throw new Error("Invalid parameters");
      }
      const presaleAddress = launchpadData.presaleAddress as Address;

      const { FheTypes } = await import("@cofhe/sdk");

      const [contributionCtHash, claimableCtHash] = await publicClient.multicall({
        contracts: [
          {
            abi: PrivacyPresale__factory.abi,
            address: presaleAddress,
            functionName: "viewContribution",
            args: [address as Address],
          },
          {
            abi: PrivacyPresale__factory.abi,
            address: presaleAddress,
            functionName: "viewClaimableTokens",
            args: [address as Address],
          },
        ],
        allowFailure: false,
      });

      await cofheClient.permits.getOrCreateSelfPermit();

      let contributionAmount = 0n;
      let claimableTokensAmount = 0n;

      const ctHashBigInt = contributionCtHash ? BigInt(contributionCtHash as string | bigint) : 0n;
      if (ctHashBigInt !== 0n) {
        contributionAmount = BigInt(await cofheClient.decryptForView(ctHashBigInt, FheTypes.Uint128).execute());
      }

      const claimCtHashBigInt = claimableCtHash ? BigInt(claimableCtHash as string | bigint) : 0n;
      if (claimCtHashBigInt !== 0n) {
        claimableTokensAmount = BigInt(await cofheClient.decryptForView(claimCtHashBigInt, FheTypes.Uint128).execute());
      }

      return {
        contributedAmount: contributionAmount,
        claimableTokens: claimableTokensAmount,
      };
    },
    onError: (error) => {
      console.error("Error fetching contribution data:", error);
      toast.error("Failed to fetch contribution data. Please try again.");
      setIsRevealed(false);
    },
    onSuccess: () => {
      setIsRevealed(true);
    },
  });

  const contributedAmount = data?.contributedAmount;

  const formatContributedAmount = () => {
    if (data?.contributedAmount === BigInt(0)) return "0";
    return formatNumber(data?.contributedAmount ? formatUnits(data?.contributedAmount, CWETH.decimals) : 0, {
      fractionDigits: CWETH.decimals,
    });
  };

  const formatClaimableTokens = () => {
    if (data?.claimableTokens === BigInt(0)) return "0";
    return formatNumber(
      data?.claimableTokens ? formatUnits(data?.claimableTokens, launchpadData.token.decimals) : 0,
      { fractionDigits: 6 },
    );
  };

  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg font-semibold text-stone-900">Your contribution</CardTitle>
          <button
            type="button"
            onClick={() => {
              if (!isRevealed) {
                void fetchInfo();
              } else {
                setIsRevealed(false);
              }
            }}
            className="rounded-xl p-2 text-stone-500 transition-colors hover:bg-stone-100"
            aria-label={isRevealed ? "Hide contribution details" : "Show contribution details"}
          >
            {isRevealed ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isRevealed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80">
              <span className="text-sm font-medium text-stone-600">Contributed</span>
              <div className="text-right">
                <div className="font-display text-xl font-semibold text-stone-900">{formatContributedAmount()}</div>
                <div className="text-xs text-stone-500">{CWETH.symbol}</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80">
              <span className="text-sm font-medium text-stone-600">Claimable</span>
              <div className="text-right">
                <div className="font-display text-xl font-semibold text-stone-900">{formatClaimableTokens()}</div>
                <div className="text-xs text-stone-500">{launchpadData.token.symbol}</div>
              </div>
            </div>

            {contributedAmount != undefined && contributedAmount > BigInt(0) && (
              <div className="border-t border-stone-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Share of hard cap</span>
                  <span className="font-semibold text-stone-900">
                    {(
                      (Number(formatUnits(contributedAmount, CWETH.decimals)) /
                        Number(formatUnits(BigInt(launchpadData.hardCap), CWETH.decimals))) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : isInfoLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-stone-600">Decrypting your balances…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <Eye className="size-6" />
            </div>
            <p className="text-sm text-stone-600">Tap the eye to decrypt your contribution (CoFHE).</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
