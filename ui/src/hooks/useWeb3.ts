import { defaultChain } from "@/web3/config";
import { Provider, useAppKitProvider } from "@reown/appkit/react";
import { useAccount } from "wagmi";

export default function useWeb3() {
  const account = useAccount();
  const chain = account.chain;
  const _chain = chain ? chain : defaultChain;

  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  return {
    ...account,
    chain: _chain,
    chainId: _chain.id,
    wagmiChain: chain,
    provider: walletProvider,
  };
}
