import { TooltipProps } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function ComingSoonTooltipWrapper({
  children,
  comingSoon,
  ...props
}: TooltipProps & { comingSoon?: boolean }) {
  return comingSoon ? (
    <Tooltip {...props}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>Coming soon</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    <>{children}</>
  );
}
