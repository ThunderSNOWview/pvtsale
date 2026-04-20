import Input from "@/components/Input";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function UnWrapTabContent() {
  const [wrapAmount, setWrapAmount] = useState("");
  const [wrapStatus, setWrapStatus] = useState("pending"); // pending, loading, success, error
  const [transactionHash, setTransactionHash] = useState("");
  const [ethBalance, setEthBalance] = useState("2.5847");
  const [cwethBalance, setCwethBalance] = useState("0.0000");

  const handleUnwrapETH = async () => {
    if (!wrapAmount || Number.parseFloat(wrapAmount) <= 0) return;

    setWrapStatus("loading");

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setTransactionHash("0xfedcba0987654321fedcba0987654321fedcba09");
      setWrapStatus("success");

      const unwrapAmountNum = Number.parseFloat(wrapAmount);
      setEthBalance((prev) => (Number.parseFloat(prev) + unwrapAmountNum).toFixed(4));
      setCwethBalance((prev) => (Number.parseFloat(prev) - unwrapAmountNum).toFixed(4));
    } catch {
      setWrapStatus("error");
    }
  };

  const setMaxAmount = (isWrap: boolean) => {
    if (isWrap) {
      const maxWrap = Math.max(0, Number.parseFloat(ethBalance) - 0.01);
      setWrapAmount(maxWrap.toFixed(4));
    } else {
      setWrapAmount(cwethBalance);
    }
  };

  return (
    <TabsContent value="unwrap" className="space-y-4">
      <div className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-stone-600">Amount to unwrap</span>
          <Button variant="link" onClick={() => setMaxAmount(false)} className="h-auto p-0 text-sm font-semibold text-primary">
            MAX
          </Button>
        </div>
        <div className="relative">
          <Input
            placeholder="0.0"
            value={wrapAmount}
            onChange={(e) => setWrapAmount(e.target.value)}
            className="protocol-field pr-20 text-right font-mono text-lg text-stone-900"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-sm font-semibold text-primary">cWETH</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-stone-600">
          You will receive: <span className="font-semibold text-stone-900">{wrapAmount || "0.0"} ETH</span>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3">
        <div className="mb-1 text-xs font-semibold text-amber-900">Gas fees</div>
        <div className="text-xs leading-relaxed text-amber-950/80">
          Unwrapping is paid in ETH. Keep a little ETH for gas.
        </div>
      </div>

      {wrapStatus === "success" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="size-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-900">cWETH unwrapped</span>
          </div>
          <div className="font-mono text-xs text-stone-600">
            Transaction:
            <code className="ml-1 font-mono text-emerald-700">{transactionHash}</code>
          </div>
        </div>
      )}

      {wrapStatus === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-600" />
            <span className="text-sm text-red-800">Unwrapping failed. Please try again.</span>
          </div>
        </div>
      )}

      <Button onClick={handleUnwrapETH} className="w-full opacity-60" disabled>
        Coming Soon
      </Button>
    </TabsContent>
  );
}
