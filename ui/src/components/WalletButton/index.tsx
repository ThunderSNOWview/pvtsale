import { truncateString } from "@/utils/format";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import ConnectButton from "./ConnectButton";

export default function WalletButton() {
  const namespace = "eip155";
  const { address, status } = useAppKitAccount({ namespace });
  const appKit = useAppKit();

  const [mounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!mounted || status === "connecting" || status === "reconnecting") {
    return (
      <Button variant="outline" className="min-w-[130px]">
        Loading…
      </Button>
    );
  }

  if (status === "disconnected" || (status === "connected" && !address)) {
    return <ConnectButton namespace={namespace} />;
  }

  return (
    <Button variant="outline" className="min-w-[130px] gap-2" onClick={() => appKit.open({ view: "Account", namespace })}>
      {/* @ts-ignore */}
      <wui-avatar address={address} size="xs" className="shadow-none" />
      {truncateString(address)}
    </Button>
  );
}
