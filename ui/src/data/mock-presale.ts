import { EPresaleOnchainState, TPresale } from "@/@types/launchpad.types";
import { parseUnits } from "viem";

// export const mockPresale: TPresale = {
//   id: 1,
//   name: "HIPPO Presale",
//   description: "This is a mock presale for demonstration purposes.",
//   startTime: "2025-07-29T14:53:00.211Z",
//   endTime: "2025-08-29T14:53:00.211Z",
//   token: {
//     symbol: "HIPPO",
//     name: "Hippo Token",
//     address: "0x0203847394B40Ed2F43631A976B058751bC105E1",
//     decimals: 18,
//     totalSupply: parseUnits("1000000000", 18).toString(),
//     icon: "/images/empty-token.webp",
//   },
//   softCap: parseUnits("0.002", 9).toString(),
//   hardCap: parseUnits("0.005", 9).toString(),
//   presaleRate: "105000000",
//   liquidityRate: "50000000",
//   // liquidityLockTime: 20 * 24 * 60 * 60,
//   tokensForSale: parseUnits("525000", 18).toString(),
//   tokensForLiquidity: parseUnits("125000", 18).toString(),
//   liquidityPercent: 5000, // 10% of the hard cap will be locked in liquidity
//   status: EPresaleOnchainState.ACTIVE,
//   presaleAddress: "0x60274d50a12ae9cadc73d17020bd91501b75c2bd",
//   txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
//   raisedAmount: "0",
//   social: {
//     website: "https://example.com",
//     twitter: "https://twitter.com/example",
//     telegram: "https://t.me/example",
//     discord: "https://discord.gg/example",
//     medium: "https://medium.com/@example",
//   },
//   createdAt: "2025-07-29T14:53:00.211Z",
//   updatedAt: "2025-07-29T14:53:00.211Z",
//   deletedAt: null,
// };
