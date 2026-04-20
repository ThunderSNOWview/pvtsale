import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  htmlFor: string;
  tooltip: string;
  /** Short phrase for the help button’s accessible name */
  ariaLabel: string;
  children: ReactNode;
  className?: string;
};

export default function LabelWithTooltip({ htmlFor, tooltip, ariaLabel, children, className }: Props) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="protocol-label">
        {children}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex shrink-0 rounded-full text-stone-400 transition-colors hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={ariaLabel}
          >
            <CircleHelp className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="max-w-[min(22rem,calc(100vw-2rem))] px-3 py-2 text-left text-xs font-normal leading-relaxed shadow-lg"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
