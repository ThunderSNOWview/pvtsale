import { TToken } from "@/@types/token.types";

/** Curated / remote token lists can plug in here later; chain reads use `useErc20TokenInfo`. */
export const tokenApi = {
  async getTokenList(): Promise<TToken[]> {
    return [];
  },
};
