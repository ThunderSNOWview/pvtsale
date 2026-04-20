import { ChainId } from "@/web3/core/constants";
import { getExplorerLink } from "@/web3/core/functions/explorer";
import { toast } from "sonner";

export function toastTxSuccess(message: string, txHash: string, chainId: number = ChainId.SEPOLIA) {
  return toast.success(message, {
    action: {
      label: "View Tx",
      onClick: () => {
        window.open(getExplorerLink(chainId, txHash, "transaction"), "_blank");
      },
    },
  });
}

export function toastTxError(message: string, txHash: string, chainId: number = ChainId.SEPOLIA) {
  return toast.error(message, {
    action: {
      label: "View Tx",
      onClick: () => {
        window.open(getExplorerLink(chainId, txHash, "transaction"), "_blank");
      },
    },
  });
}
