import { useCallback, useMemo, useState } from "react";

import { MaxUint256 } from "@/web3/core/constants";
import { Currency, Token } from "@/web3/core/entities";
import { calculateGasMargin } from "@/web3/core/functions/trade";

import { ConfidentialWETH__factory } from "@/web3/contracts";
import { Addressable, ContractTransactionReceipt } from "ethers";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import useCofheClient from "./useCofheClient";
import { useConfidentialWETHContractWrite, useErc20ContractWrite } from "./useContract";
import useWeb3 from "./useWeb3";

export enum ApprovalState {
  UNKNOWN = "UNKNOWN",
  NOT_APPROVED = "NOT_APPROVED",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
}

export function useTokenAllowance(token?: Token, owner?: string, spender?: string | Addressable) {
  const args = useMemo(() => [owner, spender], [owner, spender]);

  return useReadContract({
    abi: erc20Abi,
    address: token?.address as any,
    functionName: "allowance",
    args: args as any,
    query: {
      enabled: Boolean(owner && token),
    },
  });
}

export function useConfidentialTokenApproval(token?: Token, owner?: string, spender?: string | Addressable) {
  const args = useMemo(() => [owner, spender], [owner, spender]);

  return useReadContract({
    abi: ConfidentialWETH__factory.abi,
    address: token?.address as any,
    functionName: "allowanceEncrypted",
    args: args as any,
    query: {
      enabled: Boolean(owner && token),
    },
  });
}

interface IUseApproveCallbackProps {
  amountToApprove?: bigint;
  currency?: Currency;
  spender?: string | Addressable;
  onReceipt?: (tx: ContractTransactionReceipt | null) => void;
  onError?: (error: Error) => void;
}

/**
 * Standard ERC20 approval hook for plaintext tokens (used in LaunchPresaleDialog).
 */
export default function useApproveCallback({
  amountToApprove,
  currency,
  spender,
  onReceipt = () => {},
  onError = () => {},
}: IUseApproveCallbackProps): [ApprovalState, () => Promise<void>] {
  const { address } = useWeb3();
  const token = currency?.isToken ? currency : undefined;
  const { data: currentAllowance, refetch: allowanceRefetch } = useTokenAllowance(token, address ?? undefined, spender);
  const [approving, setApproving] = useState<boolean>(false);

  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender || !currency) return ApprovalState.UNKNOWN;
    if (currency.isNative) return ApprovalState.APPROVED;
    if (currentAllowance == undefined) return ApprovalState.UNKNOWN;

    return currentAllowance < amountToApprove
      ? approving
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [amountToApprove, spender, currency, currentAllowance, approving]);

  const tokenContract = useErc20ContractWrite(token?.address);

  const approve = useCallback(async () => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error("approve was called unnecessarily");
      return;
    }
    if (!token) {
      console.error("no token");
      return;
    }
    if (!tokenContract) {
      console.error("tokenContract is null");
      return;
    }
    if (!amountToApprove) {
      console.error("missing amount to approve");
      return;
    }
    if (!spender) {
      console.error("no spender");
      return;
    }

    setApproving(true);

    try {
      let useExact = false;
      const estimatedGas = await tokenContract.approve.estimateGas(spender, MaxUint256).catch(() => {
        useExact = true;
        return tokenContract.approve.estimateGas(spender, amountToApprove);
      });

      const res = await tokenContract
        .approve(spender, useExact ? amountToApprove : MaxUint256, {
          gasLimit: calculateGasMargin(estimatedGas),
        })
        .catch((error: Error) => {
          console.debug("Failed to approve token", error);
          setApproving(false);
          throw error;
        });

      const tx = await res.wait();
      onReceipt(tx);
      allowanceRefetch();
    } catch (error) {
      onError(error as Error);
    }

    setApproving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalState, token, tokenContract, amountToApprove, spender]);

  return [approvalState, approve];
}

/**
 * FHERC20 confidential approval hook — encrypts a max uint128 value and calls approveEncrypted.
 */
export function useConfidentialApproveCallback({
  currency,
  spender,
  onReceipt = () => {},
  onError = () => {},
}: Pick<IUseApproveCallbackProps, "currency" | "spender" | "onReceipt" | "onError">): [
  ApprovalState,
  () => Promise<void>,
] {
  const { address } = useWeb3();
  const { client: cofheClient, isReady: isCofheReady } = useCofheClient();

  const token = currency?.isToken ? currency : undefined;
  const { data: allowanceHandle, refetch: allowanceRefetch } = useConfidentialTokenApproval(
    token,
    address ?? undefined,
    spender as string | Addressable
  );

  const [approving, setApproving] = useState<boolean>(false);

  // For FHERC20 we check if an allowance handle exists (non-zero bytes32 means approved)
  const hasAllowance = useMemo(() => {
    if (!allowanceHandle) return false;
    const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
    return allowanceHandle !== zeroHash;
  }, [allowanceHandle]);

  const approvalState: ApprovalState = useMemo(() => {
    if (!spender || !currency) return ApprovalState.UNKNOWN;
    if (currency.isNative || hasAllowance) return ApprovalState.APPROVED;

    return approving ? ApprovalState.PENDING : ApprovalState.NOT_APPROVED;
  }, [spender, currency, hasAllowance, approving]);

  const tokenContract = useConfidentialWETHContractWrite();

  const approve = useCallback(async () => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error("approve was called unnecessarily");
      return;
    }
    if (!token) {
      console.error("no token");
      return;
    }
    if (!tokenContract) {
      console.error("tokenContract is null");
      return;
    }
    if (!spender) {
      console.error("no spender");
      return;
    }

    setApproving(true);

    try {
      if (!cofheClient || !isCofheReady) {
        throw new Error("coFHE client is not ready — wait for the wallet to finish connecting.");
      }
      const { Encryptable } = await import("@cofhe/sdk");

      // Encrypt a max uint128 value for unlimited approval
      const maxUint128 = (1n << 128n) - 1n;
      const [encryptedAmount] = await cofheClient
        .encryptInputs([Encryptable.uint128(maxUint128)])
        .execute();

      const estimatedGas = await tokenContract.approveEncrypted.estimateGas(spender, encryptedAmount);

      const res = await tokenContract
        .approveEncrypted(spender, encryptedAmount, {
          gasLimit: calculateGasMargin(estimatedGas),
        })
        .catch((error: Error) => {
          console.debug("Failed to approve token", error);
          setApproving(false);
          throw error;
        });

      const tx = await res.wait();
      onReceipt(tx);
      allowanceRefetch();
    } catch (error) {
      onError(error as Error);
    }

    setApproving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalState, token, tokenContract, spender, cofheClient, isCofheReady]);

  return [approvalState, approve];
}
