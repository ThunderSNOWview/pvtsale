import { sepolia } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "4d8f52da0aa95a4e6bcc34ae17f4eae5";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [sepolia];
export const defaultChain = sepolia;

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
