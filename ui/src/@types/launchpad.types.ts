export enum EPresaleStatus {
  Upcoming = "Upcoming",
  Active = "Active",
  Completed = "Completed",
  Failed = "Failed",
  Ended = "Ended",
}

export enum EPresaleOnchainState {
  ACTIVE = 1,
  WAITING_FOR_FINALIZE = 2,
  CANCELED = 3,
  FINALIZED = 4,
}

/**
 * On-chain presale data — built entirely from contract reads.
 * No off-chain backend needed.
 */
export type TPresale = {
  presaleAddress: string;
  presaleOwner: string;
  cweth: string;
  ctoken: string;
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  };
  softCap: string;
  hardCap: string;
  minContribution: string;
  maxContribution: string;
  startTime: number; // unix seconds
  endTime: number; // unix seconds
  liquidityPercent: number;
  listingRate: string;
  tokensForSale: string;
  tokensForLiquidity: string;
  presaleRate: string; // derived: tokenPresale / hardCap
  weiRaised: string;
  tokensSold: string;
  status: EPresaleOnchainState;
};
