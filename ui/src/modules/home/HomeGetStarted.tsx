import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, LayoutGrid, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeGetStarted() {
  return (
    <section aria-label="Get started">
      <h2 className="font-display mb-2 text-lg font-semibold text-stone-900">Start here</h2>
      <p className="mb-6 max-w-2xl text-sm text-stone-600">
        Mint an ERC-20 for your project, configure a confidential presale (economics + schedule), or browse live raises —
        all on Sepolia with CoFHE.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="protocol-card border-stone-200/90 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Rocket className="size-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-stone-900">Launch</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Deploy a plain token, then attach caps, rates, and timing for a cWETH raise with FHE-protected amounts.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild className="w-full sm:w-auto">
                <Link to="/create-token">
                  Create token
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto border-stone-200">
                <Link to="/create">
                  New presale
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="protocol-card border-stone-200/90 shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LayoutGrid className="size-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-stone-900">Browse</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Search and filter presales by status. Open a pool to contribute with encrypted cWETH or track the sale.
              </p>
            </div>
            <div className="mt-auto">
              <Button asChild variant="outline" className="w-full border-stone-200 sm:w-auto">
                <Link to="/raises">
                  View all raises
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
