

import { FormStepSection } from "@/components/create-flow/FormStepSection";
import LabelWithTooltip from "@/components/create-flow/LabelWithTooltip";
import Button from "@/components/Button";
import DatePicker from "@/components/DatePicker";
import Input from "@/components/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useErc20TokenInfo } from "@/hooks/useErc20";
import { cn } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, CalendarRange, Check, Circle, LineChart, Loader2, Rocket, ScanSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import FeeStructure from "./FeeStructure";
import LaunchPresaleDialog from "./LaunchPresaleDialog";
import PresalePreview from "./PresalePreview";
import TokenRequirements from "./TokenRequirements";
import { createPresaleSchema } from "./helpers";

function LaunchReadinessCard({
  validTokenAddress,
  fundingGoalsSet,
  timelineSet,
}: {
  validTokenAddress: boolean;
  fundingGoalsSet: boolean;
  timelineSet: boolean;
}) {
  const rows = [
    { ok: validTokenAddress, label: "Token contract found & metadata loaded" },
    { ok: fundingGoalsSet, label: "Soft cap, hard cap, and rates configured" },
    { ok: timelineSet, label: "Start and end times set" },
  ];
  const done = rows.filter((r) => r.ok).length;
  const pct = (done / rows.length) * 100;

  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader className="border-b border-stone-100 bg-gradient-to-r from-primary/[0.06] to-transparent pb-4">
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Launch readiness</CardTitle>
        <p className="text-sm font-normal text-stone-600">
          {done} of {rows.length} requirements met — the button below unlocks when the form validates.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.label} className="flex gap-3 text-sm">
              {row.ok ? (
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={2.5} aria-hidden />
              ) : (
                <Circle className="mt-0.5 size-4 shrink-0 text-stone-300" strokeWidth={2} aria-hidden />
              )}
              <span className={cn("leading-snug", row.ok ? "text-stone-800" : "text-stone-500")}>{row.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function CreateLaunchpadView() {
  const form = useForm({
    defaultValues: {
      tokenAddress: "",
      tokenName: "",
      tokenSymbol: "",
      presaleRate: undefined,
      softCap: undefined,
      hardCap: undefined,
      minContribution: undefined,
      maxContribution: undefined,
      liquidityPercent: 60,
      listingRate: undefined,
      website: undefined,
      telegram: undefined,
      twitter: undefined,
      startDate: undefined,
      endDate: undefined,
      thumbnail: undefined,
    },
    mode: "all",
    reValidateMode: "onChange",
    resolver: yupResolver(createPresaleSchema, { stripUnknown: false }),
  });

  const [showLaunchDialog, setShowLaunchDialog] = useState(false);

  const launchpadData = form.watch();
  const formState = form.formState;

  const { data: erc20Info, isLoading: isLoadingErc20Info } = useErc20TokenInfo(launchpadData.tokenAddress, {
    staleTime: 60_000,
  });

  const onSubmit = () => {
    setShowLaunchDialog(true);
  };

  const validTokenAddress = !!launchpadData.tokenAddress && erc20Info?.address === launchpadData.tokenAddress;
  const fundingGoalsSet = !!launchpadData.softCap && !!launchpadData.hardCap;
  const timelineSet = !!launchpadData.startDate && !!launchpadData.endDate;
  const checklistDone = validTokenAddress && fundingGoalsSet && timelineSet;

  useEffect(() => {
    if (erc20Info) {
      form.setValue("tokenName", erc20Info.name);
      form.setValue("tokenSymbol", erc20Info.symbol);
    } else {
      form.setValue("tokenName", "");
      form.setValue("tokenSymbol", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc20Info]);

  return (
    <>
      <div className="relative pb-12 pt-2">
        <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />

        <div className="relative">
          <Link
            to="/raises"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to raises
          </Link>

          <header className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Confidential presale · Sepolia</p>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
              Configure your CoFHE raise
            </h1>
            <p className="mt-3 text-base leading-relaxed text-stone-600 md:text-lg">
              Link an ERC-20, define economics (rates and cWETH caps), set the window, then deploy — the factory spins up a
              presale plus cTOKEN wrapper and pulls your token budget in one flow.
            </p>
          </header>

          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-5">
            <Card className="protocol-card relative overflow-hidden border-stone-200/90 xl:col-span-3">
              <CardHeader className="border-b border-stone-100 bg-stone-50/40 pb-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Rocket className="size-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl font-semibold text-stone-900">Presale setup</CardTitle>
                    <p className="mt-1 text-sm text-stone-600">Three blocks — token, economics, schedule.</p>
                  </div>
                </div>
              </CardHeader>

              <form id="create-launchpad-form" onSubmit={form.handleSubmit(onSubmit)} className="contents">
                <CardContent className="space-y-6 bg-white/80 px-4 py-6 sm:px-6">
                  <FormStepSection
                    step={1}
                    title="Token on-chain"
                    description="Paste the ERC-20 you already deployed. We read name and symbol from the contract."
                    icon={ScanSearch}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="tokenAddress" className="protocol-label">
                        Contract address
                      </Label>
                      <Input
                        id="tokenAddress"
                        placeholder="0x…"
                        {...form.register("tokenAddress")}
                        value={launchpadData.tokenAddress}
                        error={!!formState.errors.tokenAddress}
                        helperText={formState.errors.tokenAddress?.message}
                        className="protocol-field font-mono text-sm placeholder:text-stone-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="tokenName" className="protocol-label">
                          Name {isLoadingErc20Info ? <Loader2 className="inline size-[1em] animate-spin" /> : null}
                        </Label>
                        <Input
                          id="tokenName"
                          placeholder="Loads from chain"
                          value={launchpadData.tokenName}
                          disabled
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tokenSymbol" className="protocol-label">
                          Symbol {isLoadingErc20Info ? <Loader2 className="inline size-[1em] animate-spin" /> : null}
                        </Label>
                        <Input
                          id="tokenSymbol"
                          placeholder="Loads from chain"
                          value={launchpadData.tokenSymbol}
                          disabled
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                    </div>
                  </FormStepSection>

                  <FormStepSection
                    step={2}
                    title="Economics & liquidity"
                    description="How many tokens per cWETH, caps in cWETH, and how much liquidity you lock after the sale."
                    icon={LineChart}
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <LabelWithTooltip
                          htmlFor="presaleRate"
                          ariaLabel="What presale rate means"
                          tooltip="How many project tokens buyers get per 1 cWETH contributed at the sale price. Together with your hard cap, this sets how many tokens are allocated to the presale pool."
                        >
                          Presale rate (tokens / cWETH)
                        </LabelWithTooltip>
                        <Input.Number
                          id="presaleRate"
                          placeholder="e.g. 1000"
                          {...form.register("presaleRate")}
                          value={launchpadData.presaleRate}
                          error={!!formState.errors.presaleRate}
                          helperText={formState.errors.presaleRate?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <LabelWithTooltip
                          htmlFor="listingRate"
                          ariaLabel="What listing rate means"
                          tooltip="Tokens per cWETH used for the liquidity slice of your raise. It is multiplied by your Liquidity % and hard cap to reserve tokens intended for post-sale listing (alongside the presale allocation)."
                        >
                          Listing rate (tokens / cWETH)
                        </LabelWithTooltip>
                        <Input.Number
                          id="listingRate"
                          placeholder="e.g. 800"
                          value={launchpadData.listingRate}
                          {...form.register("listingRate")}
                          error={!!formState.errors.listingRate}
                          helperText={formState.errors.listingRate?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <LabelWithTooltip
                          htmlFor="softCap"
                          ariaLabel="What soft cap means"
                          tooltip="Minimum cWETH raised (in cWETH units) for the sale to count as successful after finalization. Below this, the sale fails and contributors can refund their cWETH."
                        >
                          Soft cap (cWETH)
                        </LabelWithTooltip>
                        <Input.Number
                          id="softCap"
                          placeholder="e.g. 50"
                          value={launchpadData.softCap}
                          {...form.register("softCap")}
                          error={!!formState.errors.softCap}
                          helperText={formState.errors.softCap?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <LabelWithTooltip
                          htmlFor="hardCap"
                          ariaLabel="What hard cap means"
                          tooltip="Maximum total cWETH the sale can raise from everyone combined; enforced with confidential balances on-chain. Also drives how many tokens are budgeted for the presale and liquidity portions when you deploy."
                        >
                          Hard cap (cWETH)
                        </LabelWithTooltip>
                        <Input.Number
                          id="hardCap"
                          placeholder="e.g. 200"
                          value={launchpadData.hardCap}
                          {...form.register("hardCap")}
                          error={!!formState.errors.hardCap}
                          helperText={formState.errors.hardCap?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <LabelWithTooltip
                          htmlFor="minContribution"
                          ariaLabel="What minimum per wallet means"
                          tooltip="Optional floor in cWETH on each wallet’s total contributed amount. If a purchase would leave that wallet below this minimum, the on-chain logic treats the buy as zero. Leave blank or 0 for no minimum."
                        >
                          Min per wallet (cWETH, optional)
                        </LabelWithTooltip>
                        <Input.Number
                          id="minContribution"
                          placeholder="0 = no minimum"
                          value={launchpadData.minContribution}
                          {...form.register("minContribution")}
                          error={!!formState.errors.minContribution}
                          helperText={formState.errors.minContribution?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <LabelWithTooltip
                          htmlFor="maxContribution"
                          ariaLabel="What maximum per wallet means"
                          tooltip="Optional per-wallet cap in cWETH. Each buy is clamped so cumulative contributions from that address never exceed this amount (remaining headroom is max minus what they already put in). Leave blank for no practical per-wallet limit."
                        >
                          Max per wallet (cWETH, optional)
                        </LabelWithTooltip>
                        <Input.Number
                          id="maxContribution"
                          placeholder="Blank = no cap (uint128 max)"
                          value={launchpadData.maxContribution}
                          {...form.register("maxContribution")}
                          error={!!formState.errors.maxContribution}
                          helperText={formState.errors.maxContribution?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                    </div>

                    <div className="max-w-md space-y-2">
                      <Label htmlFor="liquidityPercent" className="protocol-label">
                        Liquidity % (of raise)
                      </Label>
                      <Input.Number
                        id="liquidityPercent"
                        placeholder="60"
                        value={launchpadData.liquidityPercent}
                        {...form.register("liquidityPercent")}
                        error={!!formState.errors.liquidityPercent}
                        helperText={formState.errors.liquidityPercent?.message}
                        className="protocol-field placeholder:text-stone-400"
                      />
                    </div>
                  </FormStepSection>

                  <FormStepSection
                    step={3}
                    title="Sale window"
                    description="When contributors can buy. End must be after start — times use your local timezone."
                    icon={CalendarRange}
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="protocol-label">Start</Label>
                        <DatePicker
                          date={launchpadData.startDate}
                          onChange={(date) => form.setValue("startDate", date!, { shouldValidate: true })}
                          error={!!formState.errors.startDate}
                          helperText={formState.errors.startDate?.message}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="protocol-label">End</Label>
                        <DatePicker
                          date={launchpadData.endDate}
                          onChange={(date) => form.setValue("endDate", date!, { shouldValidate: true })}
                          error={!!formState.errors.endDate}
                          helperText={formState.errors.endDate?.message}
                        />
                      </div>
                    </div>
                  </FormStepSection>
                </CardContent>

                <CardFooter className="flex flex-col gap-5 border-t border-stone-200/80 bg-gradient-to-b from-stone-50/90 to-stone-50 px-4 py-6 sm:px-6">
                  <p className="text-sm leading-relaxed text-stone-600">
                    {checklistDone ? (
                      <>
                        Ready to go — the next step is on-chain approval and deployment in the modal. Keep Sepolia
                        selected in your wallet.
                      </>
                    ) : (
                      <>
                        Complete the three sections above. The launch control stays disabled until every field validates
                        and your token metadata loads.
                      </>
                    )}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      type="submit"
                      disabled={formState.isSubmitting || formState.isLoading || !formState.isValid}
                      loading={formState.isSubmitting}
                      className="w-full sm:w-auto"
                      icon={<Rocket className="size-4" />}
                    >
                      Continue to launch
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Card>

            <aside className="flex flex-col gap-4 xl:col-span-2">
              <div className="lg:sticky lg:top-24 lg:space-y-4">
                <LaunchReadinessCard
                  validTokenAddress={validTokenAddress}
                  fundingGoalsSet={fundingGoalsSet}
                  timelineSet={timelineSet}
                />
                <PresalePreview launchpadData={launchpadData} erc20Info={erc20Info} />
                <TokenRequirements launchpadData={launchpadData} erc20Info={erc20Info} />
                <FeeStructure />
              </div>
            </aside>
          </div>
        </div>
      </div>
      {erc20Info && (
        <LaunchPresaleDialog
          onOpenChange={setShowLaunchDialog}
          open={showLaunchDialog}
          launchpadData={launchpadData}
          erc20Info={erc20Info}
        />
      )}
    </>
  );
}
