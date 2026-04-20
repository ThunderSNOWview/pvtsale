import { TToken } from "@/@types/token.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { Clock, DollarSign, Rocket, Target } from "lucide-react";

export default function PresalePreview({
  launchpadData,
  erc20Info,
}: {
  launchpadData: {
    softCap?: number;
    hardCap?: number;
    startDate?: Date;
    endDate?: Date;
    liquidityLockup?: number;
  };
  erc20Info?: TToken;
}) {
  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Presale preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl bg-stone-50 p-4 text-center ring-1 ring-stone-200/80">
          <div className="mb-3 flex justify-center">
            <Avatar className="size-16 rounded-2xl ring-2 ring-white shadow-sm">
              <AvatarImage src={erc20Info?.icon || undefined} alt={erc20Info?.name} />
              <AvatarFallback className="rounded-2xl bg-primary text-primary-foreground">
                <Rocket className="size-8" />
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="font-display text-lg font-semibold text-stone-900">{erc20Info?.name || "Token Name"}</h3>
          <p className="text-sm text-stone-500">{erc20Info?.symbol || "SYMBOL"}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-primary" />
            <span className="text-stone-600">Soft cap</span>
            <span className="ml-auto font-medium text-stone-900">{launchpadData.softCap || "0"} cWETH</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <span className="text-stone-600">Hard cap</span>
            <span className="ml-auto font-medium text-stone-900">{launchpadData.hardCap || "0"} cWETH</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <span className="text-stone-600">Duration</span>
            <span className="ml-auto font-medium text-stone-900">
              {launchpadData.startDate && launchpadData.endDate
                ? formatDistance(launchpadData.startDate, launchpadData.endDate, {
                    addSuffix: false,
                  })
                : "Not set"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
