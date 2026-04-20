export type TErc20Info = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  icon?: string | null;
  description?: string | null;

  website?: string | null;
  twitter?: string | null;
  discord?: string | null;
  telegram?: string | null;
  github?: string | null;
  medium?: string | null;
};

export type TToken = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  icon: string | null;
};
