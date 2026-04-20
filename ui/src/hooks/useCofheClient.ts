import { useEffect, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

// The @cofhe/sdk uses the builder pattern:
// 1. createCofheConfig({ supportedChains: [chains.sepolia] })
// 2. createCofheClient(config)
// 3. client.connect(publicClient, walletClient)

let cofheClientInstance: any = null;
let cofheConfig: any = null;

export default function useCofheClient() {
  const [client, setClient] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (!isConnected || !publicClient || !walletClient) {
      setClient(null);
      setIsReady(false);
      return;
    }

    let cancelled = false;

    const initClient = async () => {
      try {
        // Dynamic import to avoid SSR issues (WASM loading)
        const { createCofheConfig, createCofheClient } = await import("@cofhe/sdk/web");
        const { chains } = await import("@cofhe/sdk/chains");

        if (!cofheConfig) {
          cofheConfig = createCofheConfig({
            supportedChains: [chains.sepolia],
          });
        }

        if (!cofheClientInstance) {
          cofheClientInstance = createCofheClient(cofheConfig);
        }

        // Connect (or reconnect) with the current public/wallet client
        await cofheClientInstance.connect(publicClient, walletClient);
        if (!cancelled) {
          setClient(cofheClientInstance);
          setIsReady(true);
        }
      } catch (err) {
        console.error("Failed to initialize coFHE client:", err);
        if (!cancelled) {
          setClient(null);
          setIsReady(false);
        }
      }
    };

    void initClient();

    return () => {
      cancelled = true;
    };
  }, [isConnected, publicClient, walletClient]);

  return { client, isReady };
}
