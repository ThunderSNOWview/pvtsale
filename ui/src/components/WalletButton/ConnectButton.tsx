import { ChainNamespace } from "@reown/appkit-common";
import { useAppKit } from "@reown/appkit/react";
import { Wallet } from "lucide-react";
import { Button, ButtonProps } from "../ui/button";

export default function ConnectButton({ namespace, ...props }: ButtonProps & { namespace?: ChainNamespace }) {
  const appKit = useAppKit();

  return (
    <Button {...props} onClick={() => appKit.open({ view: "Connect", namespace })}>
      <Wallet className="size-[1.2em]" />
      Connect Wallet
    </Button>
  );
}
