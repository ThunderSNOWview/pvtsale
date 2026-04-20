import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ExternalLink, Layers, Shield, Wallet } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { Link } from "react-router-dom";

function DocSection({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader className="border-b border-stone-100 pb-4">
        <CardTitle className="font-display flex items-center gap-2 text-lg font-semibold text-stone-900">
          <Icon className="size-5 text-primary" strokeWidth={2} aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-5 text-sm leading-relaxed text-stone-600">{children}</CardContent>
    </Card>
  );
}

export default function DocsView() {
  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <p className="text-sm font-medium text-primary">Documentation</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            What pvtsale is
          </h1>
          <p className="mt-4 text-pretty text-base text-stone-600">
            <strong className="font-medium text-stone-800">pvtsale</strong> is a confidential token launchpad on{" "}
            <strong className="font-medium text-stone-800">Ethereum Sepolia</strong> built on{" "}
            <strong className="font-medium text-stone-800">Fhenix CoFHE</strong>: buyers contribute{" "}
            <strong className="font-medium text-stone-800">cWETH</strong> and amounts are handled as FHE ciphertext on the
            host chain. Caps, schedule, and wallet addresses are ordinary EVM data — the protected piece is the{" "}
            <strong className="font-medium text-stone-800">numeric contribution path</strong>, not full anonymity.
          </p>
        </div>

        <div className="space-y-6">
          <DocSection icon={Wallet} title="Before you start">
            <ul className="list-inside list-disc space-y-2">
              <li>
                Connect a wallet on <strong>Sepolia</strong> and get test ETH for gas.
              </li>
              <li>
                Use <strong>Get cWETH</strong> in the header to wrap ETH into confidential WETH (cWETH). Buyers need cWETH
                balances and an encrypted <strong>approve</strong> to the presale contract before contributing.
              </li>
              <li>
                The UI uses <strong>@cofhe/sdk</strong> for encrypt inputs and decrypt-for-view flows where shown.
              </li>
            </ul>
          </DocSection>

          <DocSection icon={Layers} title="Contracts (mental model)">
            <ul className="list-inside list-disc space-y-2">
              <li>
                <strong>PrivacyPresaleFactory</strong> — creates each sale; references the network&apos;s{" "}
                <strong>ConfidentialWETH</strong> (cWETH).
              </li>
              <li>
                <strong>PrivacyPresale</strong> — sale logic, encrypted raised/sold state, caps, purchase window, finalize,
                claim, refund.
              </li>
              <li>
                <strong>ConfidentialTokenWrapper</strong> — per-sale <strong>cTOKEN</strong> wrapper over your plain ERC-20;
                successful sales can pay allocations in confidential form.
              </li>
            </ul>
          </DocSection>

          <DocSection icon={BookOpen} title="Create a presale">
            <p>
              Deploying calls <strong>createPrivacyPresaleWithExistingToken</strong>: it deploys the cTOKEN wrapper and
              PrivacyPresale, moves your token budget (sale + liquidity slice), and emits{" "}
              <strong>PrivacyPresaleCreated</strong>. Gas is significant because two CoFHE-linked contracts deploy in one
              transaction.
            </p>
            <p className="pt-2">
              Form fields match the chain: presale and listing rates (tokens per cWETH), soft/hard caps in cWETH, optional
              per-wallet min/max, liquidity %, and schedule — see in-form tooltips.
            </p>
            <p className="pt-2">
              <Link to="/create" className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
                Open create presale
              </Link>
            </p>
          </DocSection>

          <DocSection icon={Shield} title="Contribute, finalize, claim">
            <ul className="list-inside list-disc space-y-2">
              <li>
                <strong>Contribute</strong> — while active, buyers submit an encrypted amount; the contract clamps to caps
                and per-wallet bounds in FHE, then pulls cWETH via <strong>_transferFromEncrypted</strong>.
              </li>
              <li>
                <strong>Finalize</strong> — after the window, the owner finalizes with decrypted totals (CoFHE verify path).
                Below soft cap: failed sale and refunds; at or above: success and liquidity/token handling on chain.
              </li>
              <li>
                <strong>Claim / convert</strong> — allocations can be taken as cTOKEN or public ERC-20 depending on the flow
                in the app; the portfolio section helps track wrappers and convert when supported.
              </li>
            </ul>
          </DocSection>

          <Card className="border-stone-200/90 bg-stone-50/80">
            <CardContent className="pt-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                <ExternalLink className="size-4 shrink-0 text-stone-500" aria-hidden />
                Official references
              </p>
              <p className="mt-2 text-sm text-stone-600">
                For CoFHE APIs, ACL, and FHERC20 details, use the official docs (open in a new tab):
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                <li>
                  <a
                    href="https://cofhe-docs.fhenix.zone/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                  >
                    CoFHE documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.fhenix.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                  >
                    Fhenix hub
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
