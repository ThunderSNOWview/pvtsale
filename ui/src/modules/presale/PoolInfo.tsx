import type { ReactNode } from "react";
import { TPresale } from "@/@types/launchpad.types";
import { CopyButton } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/utils/format";
import { Token } from "@/web3/core/entities";
import { format } from "date-fns";
import { formatUnits } from "viem";

function Chip({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 truncate rounded-lg bg-stone-100 px-2 py-1.5 font-mono text-xs text-stone-800 ring-1 ring-stone-200/80">
      {children}
    </div>
  );
}

export default function PoolInfo({ launchpadData, CWETH }: { launchpadData: TPresale; CWETH: Token }) {
  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Pool details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="w-1/3 py-3 pr-4 text-sm font-medium text-stone-500">Presale address</td>
                <td className="py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Chip>{launchpadData.presaleAddress}</Chip>
                    <CopyButton text={launchpadData.presaleAddress} />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">cToken</td>
                <td className="py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Chip>{launchpadData.ctoken}</Chip>
                    <CopyButton text={launchpadData.ctoken} />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Tokens for presale</td>
                <td className="py-3 text-sm text-stone-900">
                  {formatNumber(formatUnits(BigInt(launchpadData.tokensForSale), launchpadData.token.decimals))}{" "}
                  {launchpadData.token.symbol}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Tokens for liquidity</td>
                <td className="py-3 text-sm text-stone-900">
                  {formatNumber(formatUnits(BigInt(launchpadData.tokensForLiquidity), launchpadData.token.decimals))}{" "}
                  {launchpadData.token.symbol}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Soft cap</td>
                <td className="py-3 text-sm text-stone-900">
                  {formatNumber(formatUnits(BigInt(launchpadData.softCap), CWETH.decimals), {
                    fractionDigits: CWETH.decimals,
                  })}{" "}
                  {CWETH.symbol}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Hard cap</td>
                <td className="py-3 text-sm text-stone-900">
                  {formatNumber(formatUnits(BigInt(launchpadData.hardCap), CWETH.decimals), {
                    fractionDigits: CWETH.decimals,
                  })}{" "}
                  {CWETH.symbol}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Start</td>
                <td className="py-3 text-sm text-stone-900">{format(launchpadData.startTime, "PPpp")}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">End</td>
                <td className="py-3 text-sm text-stone-900">{format(launchpadData.endTime, "PPpp")}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Listing</td>
                <td className="py-3 text-sm font-semibold text-primary">Uniswap</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Liquidity %</td>
                <td className="py-3 text-sm text-stone-900">{Number(launchpadData.liquidityPercent) / 100}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
