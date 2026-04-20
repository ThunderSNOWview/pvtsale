import { EPresaleOnchainState, TPresale } from "@/@types/launchpad.types";
import Button from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCofheClient from "@/hooks/useCofheClient";
import { useConfidentialTokenWrapperWrite, usePrivacyPresaleContractWrite } from "@/hooks/useContract";
import useWeb3 from "@/hooks/useWeb3";
import { decryptClaimableTokensAmount } from "@/lib/presale/decryptClaimable";
import { toastTxSuccess } from "@/lib/toast";
import { getErrorMessage } from "@/utils/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { maxUint128 } from "viem";
import { usePublicClient } from "wagmi";

export default function Actions({ launchpadData, address }: { launchpadData: TPresale; address: string }) {
  const presaleContract = usePrivacyPresaleContractWrite(launchpadData.presaleAddress);
  const wrapperContract = useConfidentialTokenWrapperWrite(launchpadData.ctoken);
  const { client: cofheClient, isReady } = useCofheClient();
  const { chainId } = useWeb3();
  const publicClient = usePublicClient({ chainId });
  const queryClient = useQueryClient();

  const presaleState = launchpadData.status;
  const isSaleEnded = new Date(launchpadData.endTime).getTime() < Date.now();
  const isOwner = address.toLowerCase() === launchpadData.presaleOwner.toLowerCase();

  const invalidatePresale = () =>
    void queryClient.invalidateQueries({ queryKey: ["presale", launchpadData.presaleAddress, chainId] });

  const claimPrivateMutation = useMutation({
    mutationFn: async () => {
      if (!presaleContract) throw new Error("Presale contract not available");
      const tx = await presaleContract.claim();
      await tx.wait();
      return tx;
    },
    onError: (error) => {
      toast.error("Claim failed", { description: getErrorMessage(error) });
    },
    onSuccess: (tx) => {
      if (tx.hash) toastTxSuccess("Claimed as confidential (cTOKEN)", tx.hash);
      else toast.success("Claimed as confidential (cTOKEN)");
      invalidatePresale();
    },
  });

  const claimPublicMutation = useMutation({
    mutationFn: async () => {
      if (!presaleContract || !wrapperContract || !publicClient || !cofheClient || !isReady) {
        throw new Error("Wallet or coFHE client not ready");
      }
      const amount = await decryptClaimableTokensAmount(
        publicClient,
        cofheClient,
        launchpadData.presaleAddress as `0x${string}`,
        address as `0x${string}`,
      );
      if (amount === 0n) throw new Error("Nothing to claim");

      let unwrapAmount = amount;
      if (unwrapAmount > maxUint128) unwrapAmount = maxUint128;

      toast.message("Step 1 of 2", { description: "Confirm claim in your wallet…" });
      const tx1 = await presaleContract.claim();
      await tx1.wait();

      toast.message("Step 2 of 2", { description: "Confirm unwrap to public tokens…" });
      const tx2 = await wrapperContract.withdraw(unwrapAmount);
      await tx2.wait();
      return { tx1, tx2 };
    },
    onError: (error) => {
      toast.error("Public claim failed", { description: getErrorMessage(error) });
    },
    onSuccess: ({ tx2 }) => {
      if (tx2.hash) toastTxSuccess("Claimed as public tokens", tx2.hash);
      else toast.success("Claimed as public tokens");
      invalidatePresale();
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (!presaleContract) throw new Error("Presale contract not available");
      const { FheTypes } = await import("@cofhe/sdk");
      if (!cofheClient || !isReady) throw new Error("coFHE client not ready");

      const allowTx = await presaleContract.allowFinalizationDecrypt();
      await allowTx.wait();

      const ethEnc = await presaleContract.getEthRaisedEncrypted();
      const tokenEnc = await presaleContract.getTokensSoldEncrypted();

      const ethDec = await cofheClient.decryptForTx(ethEnc, FheTypes.Uint128).withoutPermit().execute();
      const tokenDec = await cofheClient.decryptForTx(tokenEnc, FheTypes.Uint128).withoutPermit().execute();

      const tx = await presaleContract.finalizePreSale(
        ethDec.decryptedValue,
        ethDec.signature,
        tokenDec.decryptedValue,
        tokenDec.signature,
      );
      await tx.wait();
      return tx;
    },
    onError: (error) => {
      toast.error("Finalization failed", { description: getErrorMessage(error) });
    },
    onSuccess: (tx) => {
      if (tx.hash) toastTxSuccess("Finalization successful", tx.hash);
      else toast.success("Finalization successful");
      invalidatePresale();
    },
  });

  const refundMutation = useMutation({
    mutationFn: async () => {
      if (!presaleContract) throw new Error("Presale contract not available");
      const tx = await presaleContract.refund();
      await tx.wait();
      return tx;
    },
    onError: (error) => {
      toast.error("Refund failed", { description: getErrorMessage(error) });
    },
    onSuccess: (tx) => {
      if (tx.hash) toastTxSuccess("Refund successful", tx.hash);
      else toast.success("Refund successful");
      invalidatePresale();
    },
  });

  const claimBusy = claimPrivateMutation.isPending || claimPublicMutation.isPending;

  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Presale actions</CardTitle>
        <p className="text-sm text-stone-600">
          Creator tools, then your allocation after the sale succeeds. Public and confidential are 1:1 the same token.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isOwner && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Creator</div>
            <Button
              className="w-full"
              onClick={() => finalizeMutation.mutate()}
              loading={finalizeMutation.isPending}
              disabled={
                finalizeMutation.isPending ||
                finalizeMutation.isSuccess ||
                presaleState !== EPresaleOnchainState.ACTIVE ||
                !isSaleEnded
              }
              loadingText="Finalizing…"
            >
              Request finalization
            </Button>
          </div>
        )}

        {presaleState === EPresaleOnchainState.FINALIZED && (
          <div className="space-y-3 border-t border-stone-100 pt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Your allocation</div>
            <p className="text-xs text-stone-600">
              <strong className="text-stone-800">Confidential:</strong> c{launchpadData.token.symbol} (cTOKEN) balance.
              <br />
              <strong className="text-stone-800">Public:</strong> normal {launchpadData.token.symbol} in your wallet
              (two transactions: claim then unwrap).
            </p>
            <Button
              className="w-full"
              variant="outline"
              loading={claimPrivateMutation.isPending}
              disabled={claimBusy || claimPrivateMutation.isSuccess}
              loadingText="Claiming…"
              onClick={() => claimPrivateMutation.mutate()}
            >
              Claim as private (cTOKEN)
            </Button>
            <Button
              className="w-full"
              loading={claimPublicMutation.isPending}
              disabled={claimBusy || claimPublicMutation.isSuccess || !isReady}
              loadingText="Claiming…"
              onClick={() => claimPublicMutation.mutate()}
            >
              Claim as public ({launchpadData.token.symbol})
            </Button>
          </div>
        )}

        {presaleState === EPresaleOnchainState.CANCELED && (
          <div className="space-y-2 border-t border-stone-100 pt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Refund</div>
            <Button
              className="w-full"
              onClick={() => refundMutation.mutate()}
              loading={refundMutation.isPending}
              disabled={refundMutation.isPending || refundMutation.isSuccess}
              loadingText="Refunding…"
            >
              Refund cWETH
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
