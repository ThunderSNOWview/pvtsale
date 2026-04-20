import Button from "@/components/Button";
import Input from "@/components/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResolveCtokenFromInput } from "@/hooks/useResolveCtoken";
import { useCwethWrapModal } from "@/state/modal/cweth-wrap";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Coins, Layers, Loader2, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isAddress } from "viem";
import TokenConvertPanel from "./TokenConvertPanel";

export default function PortfolioView() {
  const { setModalOpen: openWrap } = useCwethWrapModal();

  const [tab, setTab] = useState<"public" | "wrapper">("public");
  const [publicInput, setPublicInput] = useState("");
  const [submittedPublic, setSubmittedPublic] = useState<string | undefined>(undefined);
  const [wrapperInput, setWrapperInput] = useState("");
  const [submittedWrapper, setSubmittedWrapper] = useState<string | undefined>(undefined);
  const [pickedCtoken, setPickedCtoken] = useState<string | undefined>(undefined);

  const resolve = useResolveCtokenFromInput(
    tab === "public" ? submittedPublic : undefined,
    Boolean(tab === "public" && submittedPublic && isAddress(submittedPublic)),
  );

  useEffect(() => {
    const d = resolve.data;
    if (!d) return;
    if (d.kind === "factory") {
      if (d.matches.length === 1) {
        setPickedCtoken(d.matches[0].ctoken);
      } else if (d.matches.length > 1) {
        setPickedCtoken((prev) =>
          prev && d.matches.some((m) => m.ctoken === prev) ? prev : d.matches[0].ctoken,
        );
      } else {
        setPickedCtoken(undefined);
      }
    } else if (d.kind === "direct_wrapper") {
      setPickedCtoken(d.ctoken);
    } else {
      setPickedCtoken(undefined);
    }
  }, [resolve.data]);

  const activeCtoken = useMemo(() => {
    if (tab === "wrapper" && submittedWrapper && isAddress(submittedWrapper)) {
      return submittedWrapper;
    }
    if (tab !== "public" || !resolve.data) return undefined;
    if (resolve.data.kind === "direct_wrapper") return resolve.data.ctoken;
    if (resolve.data.kind === "factory" && resolve.data.matches.length > 0) {
      const pick = pickedCtoken ?? resolve.data.matches[0].ctoken;
      return resolve.data.matches.some((m) => m.ctoken === pick) ? pick : resolve.data.matches[0].ctoken;
    }
    return undefined;
  }, [tab, submittedWrapper, resolve.data, pickedCtoken]);

  const publicReady =
    tab === "public" &&
    Boolean(submittedPublic) &&
    resolve.isSuccess &&
    !resolve.isFetching &&
    resolve.data?.kind !== "none";

  const wrapperReady = tab === "wrapper" && Boolean(submittedWrapper && isAddress(submittedWrapper));

  const showConvert = Boolean(activeCtoken) && (wrapperReady || publicReady);

  const onFindWrapper = () => {
    const v = publicInput.trim();
    if (!isAddress(v)) return;
    setSubmittedPublic(v);
  };

  const onLoadWrapper = () => {
    const v = wrapperInput.trim();
    if (!isAddress(v)) return;
    setSubmittedWrapper(v);
  };

  const onTabChange = (v: string) => {
    const next = v as "public" | "wrapper";
    setTab(next);
    if (next === "public") setSubmittedWrapper(undefined);
    else setSubmittedPublic(undefined);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-[oklch(0.97_0.012_85)] via-[oklch(0.985_0.008_85)] to-stone-100/90 pb-16 pt-8">
      <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white/90 px-6 py-10 shadow-sm ring-1 ring-stone-100 sm:px-10">
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/[0.09] blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">After the raise</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Portfolio &amp; convert
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600">
              Manage <strong className="font-medium text-stone-800">cWETH</strong> and your project&apos;s{" "}
              <strong className="font-medium text-stone-800">cTOKEN</strong> (confidential wrapper). Paste a public token
              address and we resolve the wrapper from factory presales, or enter the wrapper contract directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                to="/raises"
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 font-medium text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
              >
                <Sparkles className="size-3.5 text-primary" />
                Browse raises
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* cWETH */}
          <Card className="protocol-card overflow-hidden border-stone-200/90 shadow-sm">
            <CardHeader className="border-b border-stone-100 bg-gradient-to-r from-primary/[0.08] to-transparent pb-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <ArrowLeftRight className="size-5" />
                </div>
                <div>
                  <CardTitle className="font-display text-lg text-stone-900">Confidential ETH</CardTitle>
                  <CardDescription className="text-stone-600">
                    cWETH for presales — wrap ETH or unwrap back when you need plain ETH.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Button type="button" className="w-full sm:w-auto" onClick={() => openWrap(true)}>
                <ArrowLeftRight className="size-4" />
                Open cWETH tool
              </Button>
            </CardContent>
          </Card>

          {/* Quick explainer */}
          <Card className="protocol-card border-stone-200/90 border-dashed bg-stone-50/50 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-stone-800">
                <Layers className="size-5 text-primary" />
                <CardTitle className="font-display text-base">How project tokens work</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-stone-600">
              Each raise deploys a <strong className="text-stone-800">wrapper (cTOKEN)</strong> over the public token.
              We scan your network&apos;s factory to find that wrapper from the token you paste — or accept a wrapper
              address if you already copied it from pool info.
            </CardContent>
          </Card>
        </div>

        {/* Project tokens — full width */}
        <Card className="protocol-card border-stone-200/90 shadow-md">
          <CardHeader className="border-b border-stone-100 bg-white">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-900">
                  <Coins className="size-5" />
                </div>
                <div>
                  <CardTitle className="font-display text-xl text-stone-900">Project tokens</CardTitle>
                  <CardDescription>Public ↔ private · 1:1 shield and unshield</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Tabs value={tab} onValueChange={onTabChange} className="gap-4">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-stone-100/90 p-1.5 sm:w-auto">
                <TabsTrigger
                  value="public"
                  className={cn(
                    "rounded-xl px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm",
                  )}
                >
                  From public token
                </TabsTrigger>
                <TabsTrigger
                  value="wrapper"
                  className={cn(
                    "rounded-xl px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm",
                  )}
                >
                  Wrapper (cTOKEN)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="public" className="mt-4 space-y-4">
                <p className="text-sm text-stone-600">
                  Paste the <strong className="text-stone-800">same ERC-20 contract address</strong> you see on Etherscan
                  for the project token. We match it against presales created from this app&apos;s factory on your
                  current network.
                </p>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor="public-token">Public token address</Label>
                    <Input
                      id="public-token"
                      placeholder="0x… (ERC-20)"
                      value={publicInput}
                      onChange={(e) => setPublicInput(e.target.value.trim())}
                      className="protocol-field border-stone-200 font-mono text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    className="shrink-0 gap-2"
                    onClick={onFindWrapper}
                    disabled={!isAddress(publicInput.trim())}
                  >
                    <Search className="size-4" />
                    Find wrapper
                  </Button>
                </div>

                {tab === "public" && submittedPublic && resolve.isPending && (
                  <div className="flex items-center gap-2 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600 ring-1 ring-stone-200/80">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    Scanning factory presales…
                  </div>
                )}

                {tab === "public" && submittedPublic && resolve.isSuccess && resolve.data?.kind === "factory" && (
                  <div className="rounded-2xl bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 ring-1 ring-emerald-200/80">
                    {resolve.data.matches.length === 1 ? (
                      <span>
                        Found <strong>1</strong> raise using this token — wrapper loaded below.
                      </span>
                    ) : (
                      <div className="space-y-3">
                        <span>
                          This token is used in <strong>{resolve.data.matches.length}</strong> raises. Pick which
                          wrapper to use (e.g. the one for the sale you joined):
                        </span>
                        <Select
                          value={pickedCtoken ?? resolve.data.matches[0]?.ctoken}
                          onValueChange={(v) => setPickedCtoken(v)}
                        >
                          <SelectTrigger className="w-full max-w-md border-stone-200 bg-white font-mono text-xs">
                            <SelectValue placeholder="Select wrapper" />
                          </SelectTrigger>
                          <SelectContent>
                            {resolve.data.matches.map((m) => (
                              <SelectItem key={`${m.presale}-${m.ctoken}`} value={m.ctoken} className="font-mono text-xs">
                                Presale {m.presale.slice(0, 10)}… · cTOKEN {m.ctoken.slice(0, 10)}…
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {tab === "public" && submittedPublic && resolve.isSuccess && resolve.data?.kind === "direct_wrapper" && (
                  <div className="rounded-2xl bg-sky-50/90 px-4 py-3 text-sm text-sky-950 ring-1 ring-sky-200/80">
                    This address is already a <strong>confidential wrapper</strong> — using it directly.
                  </div>
                )}

                {tab === "public" && submittedPublic && resolve.isSuccess && resolve.data?.kind === "none" && (
                  <div className="rounded-2xl bg-rose-50/90 px-4 py-3 text-sm text-rose-950 ring-1 ring-rose-200/80">
                    No presale from this factory uses that token, and the address isn&apos;t a wrapper contract. Double-check
                    the network and address, or switch to the <strong>Wrapper (cTOKEN)</strong> tab.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wrapper" className="mt-4 space-y-4">
                <p className="text-sm text-stone-600">
                  Paste the <strong className="text-stone-800">cTOKEN / wrapper</strong> contract from the presale pool
                  details (starts a convert panel immediately).
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor="wrapper-addr">Wrapper (cTOKEN) address</Label>
                    <Input
                      id="wrapper-addr"
                      placeholder="0x…"
                      value={wrapperInput}
                      onChange={(e) => setWrapperInput(e.target.value.trim())}
                      className="protocol-field border-stone-200 font-mono text-sm"
                    />
                  </div>
                  <Button type="button" onClick={onLoadWrapper} disabled={!isAddress(wrapperInput.trim())}>
                    Load
                  </Button>
                </div>
                {tab === "wrapper" && submittedWrapper && !isAddress(submittedWrapper) && (
                  <p className="text-sm text-rose-700">Invalid address.</p>
                )}
              </TabsContent>
            </Tabs>

            {showConvert && activeCtoken ? (
              <div className="border-t border-stone-100 pt-6">
                <TokenConvertPanel ctokenAddress={activeCtoken} title="Convert 1:1" />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
