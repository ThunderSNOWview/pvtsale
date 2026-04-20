import { TPresale } from "@/@types/launchpad.types";
import { CopyButton } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/utils/format";
import { formatUnits } from "viem";

export default function TokenDetails({ launchpadData }: { launchpadData: TPresale }) {
  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Token</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="w-1/3 py-3 pr-4 text-sm font-medium text-stone-500">Contract</td>
                <td className="py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 truncate rounded-lg bg-stone-100 px-2 py-1.5 font-mono text-xs text-stone-800 ring-1 ring-stone-200/80">
                      {launchpadData.token.address}
                    </div>
                    <CopyButton text={launchpadData.token.address} />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Name</td>
                <td className="py-3 text-sm font-medium text-stone-900">{launchpadData.token.name}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Symbol</td>
                <td className="py-3 text-sm font-medium text-stone-900">{launchpadData.token.symbol}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Decimals</td>
                <td className="py-3 text-sm text-stone-900">{launchpadData.token.decimals}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-stone-500">Total supply</td>
                <td className="py-3 text-sm text-stone-900">
                  {formatNumber(formatUnits(BigInt(launchpadData.token.totalSupply), launchpadData.token.decimals))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
