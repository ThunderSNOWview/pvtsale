import { Button } from "@/components/ui/button";
import { useCwethWrapModal } from "@/state/modal/cweth-wrap";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroBanner() {
  const navigate = useNavigate();
  const { setModalOpen: openWrap } = useCwethWrapModal();

  return (
    <div className="relative pb-12 pt-4 md:pb-16">
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-primary">Confidential launchpad · Ethereum Sepolia · Fhenix CoFHE</p>
        <h1 className="font-display mt-4 text-balance text-4xl font-semibold leading-[1.15] tracking-tight text-stone-900 md:text-5xl lg:text-6xl">
          Token raises where{" "}
          <span className="italic text-primary">contribution sizes</span> stay encrypted.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-stone-600 md:text-lg">
          pvtsale is a CoFHE launchpad: buyers pay in confidential WETH (cWETH), amounts move as FHE values, and soft/hard
          caps still enforce on-chain. Addresses, timing, and transaction shape stay visible like any EVM app — only the
          numeric ticket path is protected.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-stone-600">
          <button
            type="button"
            onClick={() => openWrap(true)}
            className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            Wrap ETH to cWETH
          </button>{" "}
          before you buy into a raise (also under <strong className="font-medium text-stone-700">Get cWETH</strong> and in
          the bar below).
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Button size="lg" onClick={() => navigate("/create")} className="min-w-[200px]">
            Launch a presale
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/raises")} className="min-w-[200px]">
            Browse raises
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/docs")} className="min-w-[200px]">
            How it works
          </Button>
        </div>
      </div>
    </div>
  );
}
