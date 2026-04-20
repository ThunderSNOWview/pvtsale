import Input from "@/components/Input";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useConfidentialWETHContractWrite } from "@/hooks/useContract";
import useWeb3 from "@/hooks/useWeb3";
import { toastTxSuccess } from "@/lib/toast";
import { getExplorerLink } from "@/web3/core/functions/explorer";
import BigNumber from "bignumber.js";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useBalance } from "wagmi";

export default function WrapTabContent() {
  const { address, chainId } = useWeb3();
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: address,
  });

  const cWETHContract = useConfidentialWETHContractWrite();

  const [transactionHash, setTransactionHash] = useState("0xabc");
  const [wrapAmount, setWrapAmount] = useState("");
  const [wrapStatus, setWrapStatus] = useState("pending"); // pending, loading, success, error

  const handleWrapETH = async () => {
    if (!wrapAmount || Number.parseFloat(wrapAmount) <= 0) return;

    setWrapStatus("loading");

    try {
      if (!cWETHContract) {
        throw new Error("cWETH contract not available");
      }
      if (!address) {
        throw new Error("Wallet address not connected");
      }
      const tx = await cWETHContract.deposit(address, {
        value: parseEther(new BigNumber(wrapAmount).toFixed(9, BigNumber.ROUND_DOWN)),
      });
      await tx.wait();
      toastTxSuccess("ETH Wrapped Successfully!", tx.hash);
      setTransactionHash(tx.hash);
      setWrapStatus("success");
      refetchEthBalance();
    } catch (error) {
      setWrapStatus("error");
      toast.error("Wrapping failed. Please try again.");
      console.error("Wrap error:", error);
    }
  };

  const setMaxAmount = () => {
    const maxAmountCanWrap = new BigNumber(ethBalance?.formatted || "0").minus(0.01).toFixed();
    setWrapAmount(maxAmountCanWrap);
  };

  const receiveAmount = wrapAmount
    ? new BigNumber(wrapAmount).toFixed(9, BigNumber.ROUND_DOWN).replace(/\.?0+$/, "")
    : "0";

  return (
    <TabsContent value="wrap" className="space-y-4">
      <div className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-stone-600">Amount to wrap</span>
          <Button variant="link" onClick={setMaxAmount} className="h-auto p-0 text-sm font-semibold text-primary">
            MAX
          </Button>
        </div>
        <div className="relative">
          <Input.Number
            autoFocus
            placeholder="0.0"
            value={wrapAmount}
            onChange={(e) => setWrapAmount(e.target.value)}
            className="protocol-field border-stone-200 pr-16 text-right font-mono text-lg text-stone-900"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-sm font-semibold text-stone-700">ETH</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-stone-600">
          You will receive: <span className="font-semibold text-primary">{receiveAmount} cWETH</span>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3">
        <div className="mb-1 text-xs font-semibold text-amber-900">About cWETH</div>
        <div className="text-xs leading-relaxed text-amber-950/80">
          cWETH is Confidential WETH on this network: the asset buyers use in pvtsale pools. Balances and transfers are
          FHE-backed; 1 ETH wraps to 1 cWETH unit at this contract&apos;s rate.
        </div>
      </div>

      {wrapStatus === "success" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="size-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-900">ETH wrapped</span>
          </div>
          <div className="break-all font-mono text-xs text-stone-600">
            Transaction:
            <a
              href={getExplorerLink(chainId, transactionHash, "transaction")}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-mono text-emerald-700 underline hover:text-emerald-800"
            >
              {transactionHash}
            </a>
          </div>
        </div>
      )}

      {wrapStatus === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-600" />
            <span className="text-sm text-red-800">Wrapping failed. Please try again.</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleWrapETH}
        disabled={wrapStatus === "loading" || !wrapAmount || Number.parseFloat(wrapAmount) <= 0}
        className="w-full"
      >
        {wrapStatus === "loading" ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Wrapping...
          </>
        ) : (
          "Wrap ETH to cWETH"
        )}
      </Button>
    </TabsContent>
  );
}
