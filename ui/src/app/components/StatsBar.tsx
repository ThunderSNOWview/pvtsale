"use client";

import { Button } from "@/components/ui/button";
import useWeb3 from "@/hooks/useWeb3";
import { useCwethWrapModal } from "@/state/modal/cweth-wrap";
import { ArrowLeftRight } from "lucide-react";

export default function StatsBar() {
  const { address } = useWeb3();
  const walletConnected = !!address;
  const { setModalOpen: openWrap } = useCwethWrapModal();

  return (
    <div className="border-b border-stone-200/80 bg-white/50">
      <div className="max-w-320 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500">
            <span>
              Network <strong className="font-semibold text-stone-800">Sepolia</strong>
            </span>
            <span className="hidden sm:inline">
              Model <strong className="font-semibold text-stone-800">FHE amounts · public metadata</strong>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openWrap(true)}
              className="h-7 max-w-full gap-1 border-primary/25 bg-primary/5 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <ArrowLeftRight className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate sm:whitespace-normal">
                <span className="sm:hidden">Wrap ETH → cWETH</span>
                <span className="hidden sm:inline">Raises settle in cWETH — wrap ETH here</span>
              </span>
            </Button>
          </div>
          <span className={`shrink-0 text-xs ${walletConnected ? "font-medium text-emerald-700" : "text-stone-500"}`}>
            {walletConnected ? "Wallet connected" : "Connect to participate"}
          </span>
        </div>
      </div>
    </div>
  );
}
