import { FormStepSection } from "@/components/create-flow/FormStepSection";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTokenFactoryContractWrite } from "@/hooks/useContract";
import useWeb3 from "@/hooks/useWeb3";
import { toastTxSuccess } from "@/lib/toast";
import yup from "@/lib/yup";
import { getErrorMessage } from "@/utils/error";
import { formatNumber } from "@/utils/format";
import { yupResolver } from "@hookform/resolvers/yup";
import { EventLog } from "ethers";
import { ArrowLeft, Coins, Info, Sparkles, Type, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  symbol: yup.string().required("Symbol is required"),
  decimals: yup
    .number()
    .integer("Decimals must be an integer")
    .min(6, "Decimals must be at least 6")
    .max(18, "Decimals must be at most 18")
    .required("Decimals is required"),
  totalSupply: yup
    .number()
    .integer("Total supply must be an integer")
    .positive("Total supply must be a positive number")
    .required("Total supply is required"),
});
type FormData = yup.InferType<typeof schema>;

export default function CreateTokenView() {
  const { address } = useWeb3();
  const tokenFactoryContract = useTokenFactoryContractWrite();

  const form = useForm({
    defaultValues: {
      name: "",
      symbol: "",
      decimals: 18,
      totalSupply: 1_000_000_000,
    },
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: yupResolver(schema),
  });
  const tokenData = form.watch();
  const formState = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      if (!address) {
        throw new Error("Please connect your wallet to create a token.");
      }
      if (!tokenFactoryContract) {
        throw new Error("Token Factory contract is not available.");
      }
      const totalSupplyInWei = BigInt(data.totalSupply) * BigInt(10) ** BigInt(data.decimals);
      const tx = await tokenFactoryContract.createToken(
        data.name,
        data.symbol,
        data.decimals,
        totalSupplyInWei,
        ""
      );
      const receipt = await tx.wait();

      const event = receipt?.logs?.[2] as EventLog;
      const tokenAddress = event.args[0] as string;
      console.log({
        tokenAddress,
        name: data.name,
        symbol: data.symbol,
        decimals: data.decimals,
        totalSupply: totalSupplyInWei,
      });
      toastTxSuccess("Token created successfully!", tx.hash);
    } catch (error) {
      console.error("Error creating token:", error);
      toast.error("Failed to create token", { description: getErrorMessage(error) });
    }
  };

  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;

  return (
    <div className="relative pb-12 pt-2">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-32 h-56 w-56 rounded-full bg-teal-200/20 blur-3xl" />

      <div className="relative">
        <Link
          to="/raises"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to raises
        </Link>

        <header className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Token factory · Sepolia</p>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Mint your project ERC-20
          </h1>
          <p className="mt-3 text-base leading-relaxed text-stone-600 md:text-lg">
            Deploy the public token you’ll sell in a confidential presale — name, symbol, decimals, and supply in one tx.
            Then use <strong className="font-medium text-stone-800">Create presale</strong> to wire the CoFHE launch.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-5">
          <div className="space-y-6 xl:col-span-3">
            <Card className="protocol-card relative overflow-hidden border-stone-200/90">
              <CardHeader className="border-b border-stone-100 bg-stone-50/40 pb-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="size-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl font-semibold text-stone-900">Configuration</CardTitle>
                    <p className="mt-1 text-sm text-stone-600">Name &amp; symbol, then supply &amp; decimals.</p>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={form.handleSubmit(onSubmit)} className="contents" id="create-token-form">
                <CardContent className="space-y-6 bg-white/80 px-4 py-6 sm:px-6">
                  <FormStepSection
                    step={1}
                    title="Identity"
                    description="Name and symbol as they appear in wallets and explorers."
                    icon={Type}
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="protocol-label">
                          Token name
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g. Ocean DAO"
                          {...form.register("name")}
                          error={!!formState.errors.name}
                          helperText={formState.errors.name?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symbol" className="protocol-label">
                          Symbol
                        </Label>
                        <Input
                          id="symbol"
                          placeholder="e.g. OCEAN"
                          {...form.register("symbol")}
                          error={!!formState.errors.symbol}
                          helperText={formState.errors.symbol?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                    </div>
                  </FormStepSection>

                  <FormStepSection
                    step={2}
                    title="Supply & decimals"
                    description="Total minted to the deployer. Decimals usually stay at 18 for DEX compatibility."
                    icon={Coins}
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="decimals" className="protocol-label">
                          Decimals
                        </Label>
                        <Input
                          id="decimals"
                          type="number"
                          min="6"
                          max="18"
                          placeholder="18"
                          {...form.register("decimals")}
                          error={!!formState.errors.decimals}
                          helperText={formState.errors.decimals?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalSupply" className="protocol-label">
                          Total supply (whole tokens)
                        </Label>
                        <Input.Number
                          id="totalSupply"
                          placeholder="1000000000"
                          {...form.register("totalSupply")}
                          value={tokenData.totalSupply}
                          error={!!formState.errors.totalSupply}
                          helperText={formState.errors.totalSupply?.message}
                          className="protocol-field placeholder:text-stone-400"
                        />
                      </div>
                    </div>
                  </FormStepSection>
                </CardContent>

                <CardFooter className="flex flex-col gap-5 border-t border-stone-200/80 bg-gradient-to-b from-stone-50/90 to-stone-50 px-4 py-6 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md text-sm leading-relaxed text-stone-600">
                      {address ? (
                        <>
                          Deploying as <span className="font-mono font-medium text-stone-800">{shortAddr}</span> on
                          Sepolia. Gas paid in ETH.
                        </>
                      ) : (
                        <>Connect a wallet on Sepolia to deploy. Gas is an estimate only.</>
                      )}
                    </p>
                    <Button
                      type="submit"
                      loading={formState.isSubmitting}
                      disabled={formState.isValidating || formState.isLoading || formState.isSubmitting || !address}
                      loadingText="Deploying…"
                      className="w-full shrink-0 sm:w-auto"
                      icon={<Zap className="size-4" />}
                    >
                      Deploy token
                    </Button>
                  </div>
                  {!address ? (
                    <p className="text-center text-xs text-amber-800 sm:text-left">
                      Wallet not connected — use the control in the header, then return here.
                    </p>
                  ) : null}
                </CardFooter>
              </form>
            </Card>
          </div>

          <aside className="space-y-4 xl:col-span-2">
            <div className="lg:sticky lg:top-24 lg:space-y-4">
              <Card className="protocol-card overflow-hidden border-stone-200/90">
                <CardHeader className="border-b border-stone-100 bg-gradient-to-r from-primary/[0.06] to-transparent pb-4">
                  <CardTitle className="font-display text-lg font-semibold text-stone-900">Live preview</CardTitle>
                  <p className="text-sm font-normal text-stone-600">Exactly what you are about to ship.</p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="relative mx-auto max-w-[220px] rounded-3xl bg-stone-100/80 p-6 text-center ring-1 ring-stone-200/80">
                    <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                      <span className="font-display">{tokenData.symbol ? tokenData.symbol.slice(0, 2).toUpperCase() : "?"}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-stone-900">
                      {tokenData.name || "Untitled token"}
                    </h3>
                    <p className="mt-1 font-mono text-sm tracking-wide text-stone-500">
                      {tokenData.symbol || "SYMBOL"}
                    </p>
                  </div>

                  <dl className="grid gap-3 rounded-2xl bg-stone-50/90 p-4 text-sm ring-1 ring-stone-100">
                    <div className="flex justify-between gap-4">
                      <dt className="text-stone-600">Total supply</dt>
                      <dd className="font-mono font-medium text-stone-900">{formatNumber(tokenData.totalSupply || "0")}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-stone-600">Decimals</dt>
                      <dd className="font-mono font-medium text-stone-900">{tokenData.decimals}</dd>
                    </div>
                  </dl>

                  <div className="flex gap-3 rounded-2xl border border-stone-200/80 bg-white p-4">
                    <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="text-sm text-stone-600">
                      <p>
                        Est. gas <span className="font-semibold text-stone-900">~0.0012 ETH</span>
                      </p>
                      <p className="mt-1 text-xs text-stone-500">Sepolia testnet · standard ERC-20</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
