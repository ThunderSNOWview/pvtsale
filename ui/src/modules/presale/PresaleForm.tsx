import { EPresaleOnchainState, EPresaleStatus, TPresale } from "@/@types/launchpad.types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ConnectButton from "@/components/WalletButton/ConnectButton";
import { ApprovalState, useConfidentialApproveCallback } from "@/hooks/useApproveCallback";
import { usePrivacyPresaleContractWrite } from "@/hooks/useContract";
import { usePresaleStatus } from "@/hooks/usePresale";
import useWeb3 from "@/hooks/useWeb3";
import useCofheClient from "@/hooks/useCofheClient";
import { toastTxSuccess } from "@/lib/toast";
import yup from "@/lib/yup";
import { getErrorMessage } from "@/utils/error";
import { formatNumber } from "@/utils/format";
import { Token } from "@/web3/core/entities";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { formatEther, parseUnits } from "viem";
import CountdownTimer from "./Timer";

const formSchema = yup.object().shape({
  amount: yup.number().label("Amount").required("Amount is required").moreThan(0, "Amount must be greater than 0"),
});

type FormValues = yup.InferType<typeof formSchema>;

export default function PresaleForm({ launchpadData, CWETH }: { launchpadData: TPresale; CWETH: Token }) {
  const { address } = useWeb3();

  const presaleContract = usePrivacyPresaleContractWrite(launchpadData.presaleAddress);
  const { client: cofheClient, isReady: isCofheReady } = useCofheClient();

  const status = usePresaleStatus(launchpadData);

  const form = useForm({
    defaultValues: {
      amount: undefined,
    },
    resolver: yupResolver(formSchema),
  });

  const formValues = form.watch();

  const [approvalState, approve] = useConfidentialApproveCallback({
    currency: CWETH,
    spender: launchpadData.presaleAddress,
    onReceipt: (tx) => {
      if (tx?.hash) {
        toastTxSuccess("Approval successful", tx.hash);
      } else {
        toast.success("Approval successful");
      }
    },
    onError: (error) => {
      console.error("Approval error:", error);
      toast.error("Approval failed. Please try again.");
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!presaleContract) {
        throw new Error("Presale contract is not available");
      }
      if (!address) {
        throw new Error("Wallet not connected");
      }
      if (!cofheClient || !isCofheReady) {
        throw new Error("coFHE client is not ready");
      }

      const { Encryptable } = await import("@cofhe/sdk");

      const amount = parseUnits(data.amount.toString(), CWETH.decimals);

      const [eAmount] = await cofheClient.encryptInputs([Encryptable.uint128(amount)]).execute();

      const tx = await presaleContract.purchase(eAmount);
      await tx.wait();
      toastTxSuccess("Contribution successful", tx.hash);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to contribute", { description: getErrorMessage(error) });
    }
  };

  return (
    <Card className="protocol-card border-stone-200/90">
      <CardContent className="pt-6">
        <div className="space-y-4 text-center">
          <div className="rounded-2xl bg-primary/10 p-4 ring-1 ring-primary/15">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">Presale</div>
            <div className="mt-1 text-sm text-stone-700">
              {status === EPresaleStatus.Upcoming && "Starts in"}
              {status === EPresaleStatus.Active && "Ends in"}
              {status === EPresaleStatus.Completed && "Completed"}
              {status === EPresaleStatus.Failed && "Did not reach goal"}
            </div>
          </div>

          {status === EPresaleStatus.Upcoming && <CountdownTimer to={new Date(launchpadData.startTime).getTime()} />}
          {status === EPresaleStatus.Active && <CountdownTimer to={new Date(launchpadData.endTime).getTime()} />}

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="amount" className="protocol-label">
                  Amount
                </Label>
                <Input.Number
                  id="amount"
                  placeholder="0"
                  {...form.register("amount")}
                  value={formValues.amount || ""}
                  className="protocol-field border-stone-200 pr-24"
                  endIcon={
                    <div className="flex items-center gap-1">
                      <Avatar className="size-5">
                        <AvatarImage src={CWETH.logo} alt={CWETH.symbol} />
                      </Avatar>
                      <span className="text-sm font-semibold text-stone-800">{CWETH.symbol}</span>
                    </div>
                  }
                />
              </div>

              {!address ? (
                <ConnectButton className="w-full" />
              ) : (
                <div className="space-y-2">
                  {approvalState !== ApprovalState.APPROVED && (
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => approve()}
                      disabled={approvalState === ApprovalState.PENDING || approvalState === ApprovalState.UNKNOWN}
                      loading={approvalState === ApprovalState.PENDING}
                      loadingText="Approving..."
                    >
                      Approve {CWETH.symbol}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      approvalState !== ApprovalState.APPROVED ||
                      form.formState.isSubmitting ||
                      form.formState.isLoading ||
                      !form.formState.isValid ||
                      status !== EPresaleStatus.Active
                    }
                    loading={form.formState.isSubmitting || form.formState.isLoading}
                    loadingText="Contributing..."
                  >
                    Contribute
                  </Button>
                </div>
              )}
            </div>
          </form>

          <div className="space-y-2 border-t border-stone-100 pt-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Status</span>
              {status === EPresaleStatus.Upcoming ? (
                <Badge className="bg-sky-100 text-sky-800">Upcoming</Badge>
              ) : status === EPresaleStatus.Active ? (
                <Badge className="bg-emerald-100 text-emerald-900">Active</Badge>
              ) : status === EPresaleStatus.Completed ? (
                <Badge className="bg-stone-100 text-stone-700">Completed</Badge>
              ) : status === EPresaleStatus.Failed ? (
                <Badge className="bg-rose-100 text-rose-900">Failed</Badge>
              ) : status === EPresaleStatus.Ended ? (
                <Badge className="bg-amber-100 text-amber-900">Ended</Badge>
              ) : (
                <Badge className="bg-stone-100 text-stone-600">Unknown</Badge>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Sale type</span>
              <span className="font-medium text-stone-900">Public</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Raised</span>
              <span className="font-medium text-stone-900">
                {[EPresaleOnchainState.CANCELED, EPresaleOnchainState.FINALIZED].includes(launchpadData.status)
                  ? formatNumber(formatEther(BigInt(launchpadData.weiRaised)), { fractionDigits: 5 })
                  : "?"}{" "}
                {CWETH.symbol}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
