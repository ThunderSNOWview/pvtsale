

import { defaultChain, networks, projectId, wagmiAdapter } from "@/web3/config";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
/** Update when you have a production host; used by the wallet connect modal. */
const SITE_URL = "https://pvtsale.xyz";

const metadata = {
  name: "pvtsale",
  description:
    "pvtsale — confidential token presales on Sepolia with CoFHE and FHE-protected cWETH contributions.",
  url: SITE_URL,
  icons: [`${SITE_URL}/icon.png`],
};

// Create the modal
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  // @ts-expect-error
  networks: networks,
  defaultNetwork: defaultChain,
  metadata: metadata,
  features: {
    analytics: false, // Optional - defaults to your Cloud configuration
    // socials: false,
    // email: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "var(--primary)",
    "--w3m-border-radius-master": "1px",
  },
});

export default function Providers({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
