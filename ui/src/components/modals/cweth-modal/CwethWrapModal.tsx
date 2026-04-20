import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCWETHBalanceMutation } from "@/hooks/useBalance";
import useWeb3 from "@/hooks/useWeb3";
import { cn } from "@/lib/utils";
import { useCwethWrapModal } from "@/state/modal/cweth-wrap";
import { getErrorMessage } from "@/utils/error";
import { formatNumber } from "@/utils/format";
import { ArrowUpDown, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBalance } from "wagmi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import UnWrapTabContent from "./UnWrapTabContent";
import WrapTabContent from "./WrapTabContent";

export default function CwethWrapModal() {
  const { address } = useWeb3();
  const { open, setModalOpen } = useCwethWrapModal();

  const [showCwethBalance, setShowCwethBalance] = useState(false);

  const {
    data: cWETHBalance,
    isPending,
    mutateAsync: fetchCwethBalance,
    canDecryptCwethBalance,
    cwethBalanceBlockedReason,
  } = useCWETHBalanceMutation(address, {
    onError: (error) => {
      console.error("Error fetching cWETH balance:", error);
      toast.error("Failed to fetch cWETH balance.", { description: getErrorMessage(error) });
      setShowCwethBalance(false);
    },
  });

  const { data: ethBalance } = useBalance({
    address: address,
  });

  return (
    <Dialog open={open} onOpenChange={setModalOpen}>
      <DialogContent
        className="protocol-card max-w-md border-stone-200/90 text-stone-900"
        onInteractOutside={(e) => {
          e.preventDefault(); // Prevent closing on outside click
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-display text-xl font-semibold text-stone-900">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <ArrowUpDown className="size-5" />
            </div>
            cWETH · wrap &amp; unwrap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-stone-50 p-3 ring-1 ring-stone-200/80">
              <div className="mb-1 text-xs font-medium text-stone-500">ETH balance</div>
              <div className="font-display text-lg font-semibold text-stone-900">
                {formatNumber(ethBalance?.formatted, { fractionDigits: 5 })}
              </div>
            </div>
            <div className="rounded-2xl bg-stone-50 p-3 ring-1 ring-stone-200/80">
              <div className="mb-1 text-xs font-medium text-stone-500">cWETH balance</div>
              <div className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
                <div className="flex-1">
                  {showCwethBalance ? (
                    <>
                      {isPending ? (
                        <div className="h-6 w-28 animate-pulse rounded-lg bg-stone-200" />
                      ) : (
                        formatNumber(cWETHBalance?.formatted, { fractionDigits: 5 })
                      )}
                    </>
                  ) : (
                    "••••••"
                  )}
                </div>
                {showCwethBalance ? (
                  <Tooltip>
                    <TooltipTrigger onClick={() => setShowCwethBalance(false)}>
                      <EyeOff className="size-5 cursor-pointer text-stone-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-sm font-medium">Hide balance</span>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "inline-flex rounded-md p-0.5 text-stone-500 transition-colors hover:text-stone-800",
                          !canDecryptCwethBalance && "opacity-50",
                        )}
                        onClick={() => {
                          if (!canDecryptCwethBalance) {
                            toast.info("Cannot reveal balance yet", {
                              description: cwethBalanceBlockedReason,
                            });
                            return;
                          }
                          void fetchCwethBalance();
                          setShowCwethBalance(true);
                        }}
                      >
                        {!canDecryptCwethBalance && address ? (
                          <Loader2 className="size-5 animate-spin text-stone-400" aria-hidden />
                        ) : (
                          <Eye className="size-5" aria-hidden />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-left">
                      <span className="text-sm font-medium">
                        {canDecryptCwethBalance
                          ? "Reveal balance"
                          : cwethBalanceBlockedReason ?? "Not ready to decrypt"}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="wrap" className="w-full">
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-full bg-stone-100 p-1 ring-1 ring-stone-200/80">
              <TabsTrigger
                value="wrap"
                className="rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
              >
                Wrap ETH
              </TabsTrigger>
              <TabsTrigger
                value="unwrap"
                className="rounded-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
              >
                Unwrap cWETH
              </TabsTrigger>
            </TabsList>

            <WrapTabContent />

            <UnWrapTabContent />
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
