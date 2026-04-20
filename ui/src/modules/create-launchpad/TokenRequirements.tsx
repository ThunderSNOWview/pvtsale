import { TToken } from "@/@types/token.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useWeb3 from "@/hooks/useWeb3";
import { formatNumber } from "@/utils/format";
import { AlertCircle, CheckCircle } from "lucide-react";
import { formatUnits } from "viem";
import { useBalance } from "wagmi";

export default function TokenRequirements({
  launchpadData,
  erc20Info,
}: {
  launchpadData: {
    softCap?: number;
    hardCap?: number;
    presaleRate?: number;
    listingRate?: number;
    liquidityPercent?: number;
    tokenAddress?: string;
  };
  erc20Info?: TToken;
}) {
  const { address } = useWeb3();

  const { data: balanceData } = useBalance({
    address: address as `0x${string}`,
    token: launchpadData.tokenAddress as `0x${string}`,
    query: {
      enabled: !!address && !!launchpadData.tokenAddress,
    },
  });

  if (!erc20Info || !launchpadData.hardCap || !launchpadData.presaleRate || !launchpadData.listingRate) {
    return null;
  }

  const hardCap = launchpadData.hardCap || 0;
  const presaleRate = launchpadData.presaleRate || 0;
  const listingRate = launchpadData.listingRate || 0;
  const liquidityPercent = launchpadData.liquidityPercent || 60;

  const tokensForPresale = hardCap * presaleRate;
  const tokensForLiquidity = hardCap * (liquidityPercent / 100) * listingRate;
  const totalRequiredTokens = tokensForPresale + tokensForLiquidity;

  const userBalance = balanceData ? Number(formatUnits(balanceData.value, balanceData.decimals)) : 0;
  const hasEnoughTokens = userBalance >= totalRequiredTokens;

  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Token requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">For presale</span>
            <span className="font-medium text-stone-900">
              {formatNumber(tokensForPresale)} {erc20Info.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">For liquidity</span>
            <span className="font-medium text-stone-900">
              {formatNumber(tokensForLiquidity)} {erc20Info.symbol}
            </span>
          </div>
          <div className="my-2 border-t border-stone-100" />
          <div className="flex justify-between font-semibold">
            <span className="text-stone-600">Total required</span>
            <span className="text-primary">
              {formatNumber(totalRequiredTokens)} {erc20Info.symbol}
            </span>
          </div>
        </div>

        {balanceData && (
          <div
            className={`rounded-2xl border p-3 ${hasEnoughTokens ? "border-emerald-200 bg-emerald-50/70" : "border-red-200 bg-red-50/70"}`}
          >
            <div className="mb-1 flex items-center gap-2">
              {hasEnoughTokens ? <CheckCircle className="size-4 text-emerald-600" /> : <AlertCircle className="size-4 text-red-600" />}
              <span className={`text-sm font-semibold ${hasEnoughTokens ? "text-emerald-900" : "text-red-800"}`}>
                {hasEnoughTokens ? "Sufficient balance" : "Insufficient balance"}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-stone-600">Your balance</span>
              <span className={`font-mono font-bold ${hasEnoughTokens ? "text-stone-900" : "text-red-700"}`}>
                {formatNumber(userBalance)} {erc20Info.symbol}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
