import Button from "@/components/Button";
import Input from "@/components/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import useCofheClient from "@/hooks/useCofheClient";
import { useConfidentialTokenWrapperWrite } from "@/hooks/useContract";
import useWeb3 from "@/hooks/useWeb3";
import { toastTxSuccess } from "@/lib/toast";
import { getErrorMessage } from "@/utils/error";
import { formatNumber } from "@/utils/format";
import { ChainId } from "@/web3/core/constants";
import { Token } from "@/web3/core/entities";
import { calculateGasMargin } from "@/web3/core/functions/trade";
import { ConfidentialTokenWrapper__factory } from "@/web3/contracts/factories/contracts/ConfidentialTokenWrapper__factory";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { erc20Abi, formatUnits, isAddress, maxUint128, parseUnits } from "viem";
import { usePublicClient, useReadContract } from "wagmi";
import useApproveCallback, { ApprovalState } from "@/hooks/useApproveCallback";

type Props = {
  ctokenAddress: string;
  title?: string;
};

export default function TokenConvertPanel({ ctokenAddress, title = "Convert public ↔ private (1:1)" }: Props) {
  const { address, chainId } = useWeb3();
  const publicClient = usePublicClient({ chainId });
  const { client: cofheClient, isReady } = useCofheClient();
  const wrapperWrite = useConfidentialTokenWrapperWrite(ctokenAddress);

  const [shieldAmt, setShieldAmt] = useState("");
  const [unshieldAmt, setUnshieldAmt] = useState("");

  const underlyingQuery = useQuery({
    queryKey: ["ctokenUnderlying", ctokenAddress, chainId],
    queryFn: async () => {
      if (!publicClient || !isAddress(ctokenAddress)) throw new Error("Invalid wrapper");
      const underlying = (await publicClient.readContract({
        address: ctokenAddress as `0x${string}`,
        abi: ConfidentialTokenWrapper__factory.abi,
        functionName: "underlyingToken",
      })) as `0x${string}`;
      const [decimals, symbol, name] = await publicClient.multicall({
        contracts: [
          { address: underlying, abi: erc20Abi, functionName: "decimals" },
          { address: underlying, abi: erc20Abi, functionName: "symbol" },
          { address: underlying, abi: erc20Abi, functionName: "name" },
        ],
        allowFailure: false,
      });
      return {
        address: underlying,
        decimals: Number(decimals),
        symbol: symbol as string,
        name: name as string,
      };
    },
    enabled: Boolean(publicClient && ctokenAddress && isAddress(ctokenAddress)),
  });

  const underlying = underlyingQuery.data;
  const underlyingToken = useMemo(() => {
    if (!underlying) return undefined;
    return new Token(chainId as ChainId, underlying.address, underlying.decimals, underlying.symbol, underlying.name);
  }, [chainId, underlying]);

  const { data: publicBal = 0n, refetch: refetchPublic } = useReadContract({
    address: underlying?.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: Boolean(underlying?.address && address) },
  });

  const privateBalanceMutation = useMutation({
    mutationKey: ["ctokenEncBal", ctokenAddress, address, chainId],
    mutationFn: async () => {
      if (!publicClient || !address || !cofheClient || !isReady || !underlying) {
        throw new Error("Missing wallet or coFHE");
      }
      const { FheTypes } = await import("@cofhe/sdk");
      const ctHash = await publicClient.readContract({
        address: ctokenAddress as `0x${string}`,
        abi: ConfidentialTokenWrapper__factory.abi,
        functionName: "balanceOfEncrypted",
        args: [address as `0x${string}`],
      });
      const h = ctHash ? BigInt(ctHash as string | bigint) : 0n;
      if (h === 0n) return 0n;
      await cofheClient.permits.getOrCreateSelfPermit();
      const v = await cofheClient.decryptForView(h, FheTypes.Uint128).execute();
      return BigInt(v);
    },
  });

  const [approvalState, approve] = useApproveCallback({
    amountToApprove: shieldAmt ? parseUnits(shieldAmt, underlying?.decimals ?? 18) : undefined,
    currency: underlyingToken,
    spender: ctokenAddress,
    onReceipt: () => toast.success("Approved"),
    onError: (e) => toast.error("Approve failed", { description: getErrorMessage(e) }),
  });

  const shieldMutation = useMutation({
    mutationFn: async () => {
      if (!wrapperWrite || !address || !underlying) throw new Error("Not ready");
      const amount = parseUnits(shieldAmt, underlying.decimals);
      if (amount === 0n) throw new Error("Enter an amount");
      if (amount > maxUint128) throw new Error("Amount too large");
      const gas = await wrapperWrite.deposit.estimateGas(amount, address);
      const tx = await wrapperWrite.deposit(amount, address, { gasLimit: calculateGasMargin(gas) });
      await tx.wait();
      return tx;
    },
    onSuccess: (tx) => {
      if (tx.hash) toastTxSuccess("Shielded to confidential balance", tx.hash);
      else toast.success("Shielded");
      setShieldAmt("");
      void refetchPublic();
      void privateBalanceMutation.mutate();
    },
    onError: (e) => toast.error("Shield failed", { description: getErrorMessage(e) }),
  });

  const unshieldMutation = useMutation({
    mutationFn: async () => {
      if (!wrapperWrite || !underlying) throw new Error("Not ready");
      const amount = parseUnits(unshieldAmt, underlying.decimals);
      if (amount === 0n) throw new Error("Enter an amount");
      if (amount > maxUint128) throw new Error("Amount too large");
      const gas = await wrapperWrite.withdraw.estimateGas(amount);
      const tx = await wrapperWrite.withdraw(amount, { gasLimit: calculateGasMargin(gas) });
      await tx.wait();
      return tx;
    },
    onSuccess: (tx) => {
      if (tx.hash) toastTxSuccess("Unshielded to public balance", tx.hash);
      else toast.success("Unshielded");
      setUnshieldAmt("");
      void refetchPublic();
      void privateBalanceMutation.mutate();
    },
    onError: (e) => toast.error("Unshield failed", { description: getErrorMessage(e) }),
  });

  if (!isAddress(ctokenAddress)) {
    return (
      <Card className="protocol-card border-stone-200/90">
        <CardContent className="py-8 text-center text-sm text-stone-600">Enter a valid wrapper address.</CardContent>
      </Card>
    );
  }

  if (underlyingQuery.isPending) {
    return (
      <Card className="protocol-card border-stone-200/90">
        <CardContent className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (underlyingQuery.isError || !underlying) {
    return (
      <Card className="protocol-card border-stone-200/90">
        <CardContent className="py-6 text-sm text-rose-700">Could not load this wrapper. Check the address.</CardContent>
      </Card>
    );
  }

  const privateFormatted =
    privateBalanceMutation.data !== undefined
      ? formatNumber(formatUnits(privateBalanceMutation.data, underlying.decimals), { fractionDigits: 6 })
      : "—";

  const publicFormatted = formatNumber(formatUnits(publicBal, underlying.decimals), { fractionDigits: 6 });

  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base font-semibold text-stone-900">{title}</CardTitle>
        <p className="text-xs text-stone-600">
          Wrapper <span className="font-mono text-stone-800">{ctokenAddress.slice(0, 10)}…</span> · Underlying{" "}
          <strong>{underlying.symbol}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-stone-50 p-3 text-sm ring-1 ring-stone-200/80">
          <div>
            <div className="text-stone-500">Public {underlying.symbol}</div>
            <div className="font-mono font-semibold text-stone-900">{publicFormatted}</div>
          </div>
          <div>
            <div className="text-stone-500">Private (cTOKEN)</div>
            <div className="font-mono font-semibold text-stone-900">{privateFormatted}</div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => privateBalanceMutation.mutate()}
            disabled={!address || !isReady || privateBalanceMutation.isPending}
          >
            <RefreshCw className="mr-1 size-3.5" />
            Refresh private
          </Button>
        </div>

        {!address ? (
          <p className="text-sm text-stone-600">Connect a wallet to convert.</p>
        ) : (
          <>
            <div className="space-y-2 border-t border-stone-100 pt-4">
              <Label className="protocol-label">Shield — public → private</Label>
              <Input.Number
                placeholder="0"
                value={shieldAmt}
                onChange={(e) => setShieldAmt(e.target.value)}
                className="protocol-field border-stone-200"
              />
              <div className="flex flex-wrap gap-2">
                {approvalState === ApprovalState.NOT_APPROVED && shieldAmt && Number(shieldAmt) > 0 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => approve()}>
                    Approve {underlying.symbol}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    shieldMutation.isPending ||
                    !shieldAmt ||
                    approvalState !== ApprovalState.APPROVED ||
                    (shieldAmt ? Number(shieldAmt) <= 0 : true)
                  }
                  loading={shieldMutation.isPending}
                  onClick={() => shieldMutation.mutate()}
                >
                  Shield
                </Button>
              </div>
            </div>

            <div className="space-y-2 border-t border-stone-100 pt-4">
              <Label className="protocol-label">Unshield — private → public</Label>
              <Input.Number
                placeholder="0"
                value={unshieldAmt}
                onChange={(e) => setUnshieldAmt(e.target.value)}
                className="protocol-field border-stone-200"
              />
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={unshieldMutation.isPending || !unshieldAmt || Number(unshieldAmt) <= 0}
                loading={unshieldMutation.isPending}
                onClick={() => unshieldMutation.mutate()}
              >
                Unshield
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
