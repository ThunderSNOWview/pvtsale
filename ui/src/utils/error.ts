import { AxiosError } from "axios";

export class ContractNotFoundError extends Error {
  constructor() {
    super("No contract found");
  }
}

export function getErrorMessage(error: any): string {
  if (error instanceof AxiosError) {
    if (typeof error.response?.data?.message === "string") return error.response.data.message;
    if (typeof error.response?.data?.error === "string") return error.response.data.error;
  }
  if (typeof error?.shortMessage === "string") return error.shortMessage;
  if (typeof error?.message === "string") {
    const msg = error.message as string;
    if (msg === "missing revert data" && error?.code === "CALL_EXCEPTION") {
      return "Transaction reverted (no revert reason from the RPC). Common causes: wrong contract version on this network, insufficient gas, or failed require inside a nested call. Try again or confirm the presale factory address matches your latest deployment.";
    }
    return msg;
  }
  if (typeof error?.reason === "string") return error.reason;
  return error ? "Something went wrong" : "";
}
