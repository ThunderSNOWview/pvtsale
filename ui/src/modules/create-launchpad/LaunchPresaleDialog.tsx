
import { EPresaleOnchainState } from "@/@types/launchpad.types";
import { TToken } from "@/@types/token.types";
import Button from "@/components/Button";
import { Button as UIButton } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useApproveCallback, { ApprovalState } from "@/hooks/useApproveCallback";
import { usePresaleFactoryContractWrite } from "@/hooks/useContract";
import useWeb3 from "@/hooks/useWeb3";
import { toastTxSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/utils/error";
import { formatNumber } from "@/utils/format";
import { C_WETH9, ChainId } from "@/web3/core/constants";
import { Token } from "@/web3/core/entities";
import { getExplorerLink } from "@/web3/core/functions/explorer";
import { DialogProps } from "@radix-ui/react-dialog";
import BigNumber from "bignumber.js";
import { EventLog } from "ethers";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatUnits, maxUint128, parseUnits } from "viem";
import { FormData } from "./helpers";
import { Link } from "react-router-dom";

export default function LaunchPresaleDialog({
  onOpenChange,
  open,
  erc20Info,
  launchpadData,
}: {
  open?: boolean;
  onOpenChange?: DialogProps["onOpenChange"];
  launchpadData: FormData;
  erc20Info: TToken;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="protocol-card max-w-md border-stone-200/90 text-stone-900"
        onInteractOutside={(e) => {
          e.preventDefault(); // Prevent closing on outside click
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-stone-900">Launch presale</DialogTitle>
        </DialogHeader>

        <Content launchpadData={launchpadData} erc20Info={erc20Info} onClose={() => onOpenChange?.(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Content({
  launchpadData,
  erc20Info,
  onClose = () => {},
}: {
  launchpadData: FormData;
  erc20Info: TToken;
  onClose?: () => void;
}) {
  const { address, chainId } = useWeb3();
  const presaleFactoryContract = usePresaleFactoryContractWrite();

  const CWETH = C_WETH9[chainId as ChainId];

  const [launchStep, setLaunchStep] = useState(1); // 1: Token Approve, 2: Confirmation
  const [deploymentStatus, setDeploymentStatus] = useState("pending"); // pending, loading, success, error
  const [transactionHash, setTransactionHash] = useState("");
  const [presaleAddress, setPresaleAddress] = useState("");

  const data = useMemo(() => {
    const tokenAddress = launchpadData.tokenAddress;
    const softCapInWei = parseUnits(launchpadData.softCap.toString(), CWETH.decimals);
    const hardCapInWei = parseUnits(launchpadData.hardCap.toString(), CWETH.decimals);

    const minContributionWei =
      launchpadData.minContribution != null && launchpadData.minContribution !== undefined
        ? parseUnits(launchpadData.minContribution.toString(), CWETH.decimals)
        : 0n;

    let maxContributionWei = maxUint128;
    if (launchpadData.maxContribution != null && launchpadData.maxContribution !== undefined) {
      maxContributionWei = parseUnits(launchpadData.maxContribution.toString(), CWETH.decimals);
      if (maxContributionWei > maxUint128) maxContributionWei = maxUint128;
    }
    const startTime = Math.floor(launchpadData.startDate.getTime() / 1000); // Convert to seconds
    const endTime = Math.floor(launchpadData.endDate.getTime() / 1000); // Convert to seconds
    const liquidityPercent = parseUnits(launchpadData.liquidityPercent.toString(), 2); // Convert percentage to decimal

    const tokenForPresale = BigInt(
      new BigNumber(launchpadData.hardCap)
        .times(Math.pow(10, erc20Info!.decimals))
        .times(launchpadData.presaleRate)
        .toFixed(0)
    );
    const listingRateHuman = new BigNumber(launchpadData.listingRate.toString());
    const tokenAddLiquidity = BigInt(
      new BigNumber(launchpadData.hardCap)
        .times(Math.pow(10, erc20Info!.decimals))
        .times(launchpadData.liquidityPercent / 100)
        .times(listingRateHuman)
        .toFixed(0)
    );

    // On-chain uint256: fixed-point (18 decimals) so fractional rates survive ABI encoding (ethers cannot encode "0.01" as BigInt).
    const listingRateOnChain = parseUnits(listingRateHuman.decimalPlaces(18, BigNumber.ROUND_DOWN).toFixed(18), 18);

    return {
      tokenAddress,
      softCap: softCapInWei,
      hardCap: hardCapInWei,
      // maxContribution on-chain must not be 0 or purchases clamp to 0 and revert (see PrivacyPresale.purchase).
      minContribution: minContributionWei,
      maxContribution: maxContributionWei,
      startTime,
      endTime,
      tokenForPresale,
      tokenAddLiquidity,
      totalTokens: tokenForPresale + tokenAddLiquidity,
      presaleRate: launchpadData.presaleRate,
      listingRate: listingRateOnChain,
      liquidityPercent,
    };
  }, [erc20Info, launchpadData, CWETH]);

  const currency = useMemo(() => {
    return new Token(ChainId.SEPOLIA, erc20Info.address, erc20Info.decimals, erc20Info.symbol, erc20Info.name);
  }, [erc20Info]);

  const [approvalStatus, approve] = useApproveCallback({
    amountToApprove: data.totalTokens,
    currency,
    spender: presaleFactoryContract?.target,
    onReceipt: (tx) => {
      if (tx?.hash) {
        toastTxSuccess("Token approved successfully!", tx.hash);
      } else {
        toast.success("Token approved successfully!");
      }
    },
    onError: (error) => {
      console.error("Approval error:", error);
      toast.error("Token approval failed. Please try again.");
    },
  });

  const handleTokenApproval = async () => {
    await approve();
  };

  const handleConfirmDeployment = async () => {
    setDeploymentStatus("loading");
    try {
      if (!address) {
        toast.error("Please connect your wallet to deploy a presale.");
        setDeploymentStatus("error");
        return;
      }
      if (!presaleFactoryContract) {
        toast.error("Presale factory contract is not available. Please check your connection.");
        setDeploymentStatus("error");
        return;
      }

      const presaleOptions = {
        tokenPresale: data.tokenForPresale,
        tokenAddLiquidity: data.tokenAddLiquidity,
        softCap: data.softCap,
        hardCap: data.hardCap,
        minContribution: data.minContribution,
        maxContribution: data.maxContribution,
        start: data.startTime,
        end: data.endTime,
        liquidityPercentage: data.liquidityPercent,
        listingRate: data.listingRate,
      };

      await presaleFactoryContract.createPrivacyPresaleWithExistingToken.staticCall(
        data.tokenAddress,
        presaleOptions
      );

      const tx = await presaleFactoryContract.createPrivacyPresaleWithExistingToken(
        data.tokenAddress,
        presaleOptions
      );
      const receipt = await tx.wait();
      
      // Parse logs to find the PrivacyPresaleCreated event reliably
      const iface = presaleFactoryContract.interface;
      let presaleAddr: string | undefined;
      let cTokenAddr: string | undefined;
      
      for (const log of receipt?.logs || []) {
        try {
          const parsed = iface.parseLog({ topics: [...(log as any).topics], data: (log as any).data });
          if (parsed?.name === "PrivacyPresaleCreated") {
            presaleAddr = String(parsed.args.presale ?? parsed.args[1]);
            cTokenAddr = String(parsed.args.ctoken ?? parsed.args[3]);
            break;
          }
        } catch {
          // Skip logs that don't belong to our contract
        }
      }
      
      if (!presaleAddr) {
        throw new Error("Could not find PrivacyPresaleCreated event in transaction receipt");
      }

      toastTxSuccess("Presale deployed successfully!", tx.hash);
      setTransactionHash(tx.hash);
      setPresaleAddress(presaleAddr);
      setDeploymentStatus("success");
    } catch (error) {
      console.error("Error submitting presale deployment:", error);
      toast.error("Failed to deploy presale", { description: getErrorMessage(error) });
      setDeploymentStatus("error");
    }
  };

  const resetDialog = () => {
    onClose();
  };

  useEffect(() => {
    if (approvalStatus === ApprovalState.APPROVED) {
      setLaunchStep(2);
    }
  }, [approvalStatus]);

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              launchStep >= 1 ? "bg-primary text-primary-foreground" : "border-2 border-stone-200 bg-stone-50 text-stone-500"
            )}
          >
            1
          </div>
          <span className={cn("text-sm font-medium", launchStep >= 1 ? "text-stone-900" : "text-stone-500")}>Token approve</span>
        </div>

        <div className={cn("h-px w-12", launchStep >= 2 ? "bg-primary" : "bg-stone-200")} />

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              launchStep >= 2 ? "bg-primary text-primary-foreground" : "border-2 border-stone-200 bg-stone-50 text-stone-500"
            )}
          >
            2
          </div>
          <span className={cn("text-sm font-medium", launchStep >= 2 ? "text-stone-900" : "text-stone-500")}>Confirm</span>
        </div>
      </div>

      {/* Step 1: Token Approval */}
      {launchStep === 1 && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80">
            <h3 className="mb-2 font-display text-base font-semibold text-stone-900">Approve tokens</h3>
            <p className="mb-3 text-sm leading-relaxed text-stone-600">
              You need to approve the smart contract to spend your tokens for the presale.
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Token</span>
                <span className="font-medium text-stone-900">{launchpadData.tokenSymbol || "TOKEN"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Amount</span>
                <span className="font-mono font-medium text-stone-900">
                  {formatNumber(formatUnits(data.totalTokens, erc20Info.decimals))} {erc20Info.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Gas (est.)</span>
                <span className="font-mono text-stone-900">~0.0001 ETH</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleTokenApproval}
            disabled={
              approvalStatus === ApprovalState.PENDING ||
              approvalStatus === ApprovalState.UNKNOWN ||
              approvalStatus === ApprovalState.APPROVED
            }
            className="w-full"
            loading={approvalStatus === ApprovalState.PENDING}
            loadingText="Approving..."
          >
            {approvalStatus === ApprovalState.APPROVED ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approved
              </>
            ) : (
              "Approve Tokens"
            )}
          </Button>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {launchStep === 2 && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-200/80">
            <h3 className="mb-2 font-display text-base font-semibold text-stone-900">Launch presale</h3>
            <p className="mb-3 text-sm text-stone-600">Review and deploy.</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Token</span>
                <span className="font-medium text-stone-900">{launchpadData.tokenName || "Token Name"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Soft cap</span>
                <span className="font-mono font-medium text-stone-900">
                  {formatNumber(launchpadData.softCap, { fractionDigits: 6 }) || "0"} {CWETH.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Hard cap</span>
                <span className="font-mono font-medium text-stone-900">
                  {formatNumber(launchpadData.hardCap, { fractionDigits: 6 }) || "0"} {CWETH.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Presale rate</span>
                <span className="font-mono font-medium text-stone-900">
                  {formatNumber(launchpadData.presaleRate, { fractionDigits: 6 }) || "0"} {erc20Info.symbol}/
                  {CWETH.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Listing rate</span>
                <span className="font-mono font-medium text-stone-900">
                  {formatNumber(launchpadData.listingRate, { fractionDigits: 6 }) || "0"} {erc20Info.symbol}/
                  {CWETH.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Platform fee</span>
                <span className="font-mono font-medium text-stone-900">0%</span>
              </div>
            </div>
          </div>

          {deploymentStatus === "success" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle className="size-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-900">Presale launched</span>
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

          {deploymentStatus === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50/90 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-red-600" />
                <span className="text-sm text-red-800">Deployment failed — check the console and try again.</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={resetDialog}
              className="flex-1 border-stone-200 bg-white font-medium text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </Button>
            {deploymentStatus === "success" && presaleAddress ? (
              <UIButton asChild className="flex-1">
                <Link to={`/launchpad/${presaleAddress}`}>View Presale</Link>
              </UIButton>
            ) : (
              <Button
                onClick={handleConfirmDeployment}
                disabled={deploymentStatus === "loading" || deploymentStatus === "success"}
                className="flex-1"
                loading={deploymentStatus === "loading"}
                loadingText="Deploying..."
              >
                {deploymentStatus === "success" ? "Completed" : "Confirm Launch"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
