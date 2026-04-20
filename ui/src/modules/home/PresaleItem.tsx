import { EPresaleStatus, TPresale } from "@/@types/launchpad.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePresaleStatus } from "@/hooks/usePresale";
import { formatNumber } from "@/utils/format";
import { formatDistance } from "date-fns";
import _ from "lodash";
import { Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { formatUnits } from "viem";

const getStatusConfig = (status: EPresaleStatus) => {
  switch (status) {
    case EPresaleStatus.Upcoming:
      return {
        border: "border-sky-200",
        text: "text-sky-700",
        badge: "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80",
        label: "Upcoming",
      };
    case EPresaleStatus.Completed:
      return {
        border: "border-emerald-200",
        text: "text-emerald-700",
        badge: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80",
        label: "Completed",
      };
    case EPresaleStatus.Failed:
      return {
        border: "border-rose-200",
        text: "text-rose-700",
        badge: "bg-rose-50 text-rose-900 ring-1 ring-rose-200/80",
        label: "Failed",
      };
    default:
      return {
        border: "border-primary/30",
        text: "text-primary",
        badge: "bg-primary/10 text-primary ring-1 ring-primary/20",
        label: "Active",
      };
  }
};

export default function PresaleItem({ presale }: { presale: TPresale }) {
  const status = usePresaleStatus(presale);
  const statusConfig = getStatusConfig(status);

  const raised = presale.weiRaised ? formatUnits(BigInt(presale.weiRaised), 9) : "0";
  const target = presale.hardCap ? formatUnits(BigInt(presale.hardCap), 9) : "0";

  const progress = (Number(raised) / Number(target)) * 100 || 0;

  return (
    <div
      className={`protocol-card group p-5 transition-shadow hover:shadow-md ${statusConfig.border} border-2 border-l-4 border-l-primary/40`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-12 rounded-2xl ring-2 ring-white shadow-sm">
            <AvatarImage src={"/images/empty-token.webp"} alt={presale.token.name} className="object-cover" />
            <AvatarFallback className="rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
              {presale.token.symbol.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold text-stone-900">{presale.token.name}</h3>
            <p className="text-sm font-medium text-stone-500">{presale.token.symbol}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.badge}`}
        >
          {statusConfig.label}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">Progress</span>
          <div className={`text-right font-medium ${statusConfig.text}`}>
            {status === EPresaleStatus.Active
              ? `? / ${formatNumber(target, { fractionDigits: 4 })} cWETH`
              : `${formatNumber(raised, { fractionDigits: 4 })} / ${formatNumber(target, { fractionDigits: 4 })} cWETH`}
            {status !== EPresaleStatus.Active ? (
              <span className="ml-1 text-stone-400">({progress.toFixed(0)}%)</span>
            ) : null}
          </div>
        </div>

        {status !== EPresaleStatus.Upcoming && status !== EPresaleStatus.Active && (
          <div className="h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === EPresaleStatus.Completed
                  ? "bg-emerald-500"
                  : status === EPresaleStatus.Failed
                    ? "bg-rose-500"
                    : "bg-primary"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatDistance(presale.startTime, presale.endTime, { addSuffix: false })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {status === EPresaleStatus.Upcoming ? 0 : _.random(10, 1000)}
            </span>
          </div>
          <Button size="sm" asChild>
            <Link to={`/launchpad/${presale.presaleAddress}`}>View</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
