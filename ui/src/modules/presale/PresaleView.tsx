import { usePresaleQuery } from "@/hooks/usePresale";
import useWeb3 from "@/hooks/useWeb3";
import TokenConvertPanel from "@/modules/portfolio/TokenConvertPanel";
import { useCwethWrapModal } from "@/state/modal/cweth-wrap";
import { C_WETH9 } from "@/web3/core/constants";
import { Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Actions from "./Actions";
import BannerAndToken from "./BannerAndToken";
import Comments from "./Comments";
import ContributionInfo from "./ContributionInfo";
import PoolInfo from "./PoolInfo";
import PresaleForm from "./PresaleForm";
import TokenDetails from "./TokenDetails";

export default function PresaleView() {
  const { chainId, address } = useWeb3();
  const { setModalOpen: openWrap } = useCwethWrapModal();
  const CWETH = C_WETH9[chainId];

  const presaleAddress = useParams().id as string;

  const {
    data: launchpadData,
    isLoading,
    isPending,
  } = usePresaleQuery(presaleAddress, {
    enabled: true,
    refetchInterval: 20_000,
  });

  return (
    <div className="py-6">
      {isLoading || isPending ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-sm text-stone-600">Loading presale…</span>
        </div>
      ) : (
        <div>
          {launchpadData && (
            <>
              <div className="mb-6 rounded-2xl border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
                <span className="font-medium">Contributions are in cWETH (FHE-backed), not plain ETH.</span>{" "}
                <button
                  type="button"
                  onClick={() => openWrap(true)}
                  className="font-semibold text-primary underline decoration-primary/35 underline-offset-2 hover:decoration-primary"
                >
                  Open the wrap tool
                </button>{" "}
                to convert ETH, or use <strong className="font-semibold">Get cWETH</strong> in the header.
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <BannerAndToken launchpadData={launchpadData} />
                  <TokenDetails launchpadData={launchpadData} />
                  <PoolInfo launchpadData={launchpadData} CWETH={CWETH} />
                  {address && <Comments />}
                </div>

                <div className="space-y-6">
                  <PresaleForm launchpadData={launchpadData} CWETH={CWETH} />
                  {address && <ContributionInfo launchpadData={launchpadData} CWETH={CWETH} address={address} />}
                  {address && <Actions launchpadData={launchpadData} address={address} />}
                  <TokenConvertPanel
                    ctokenAddress={launchpadData.ctoken}
                    title={`${launchpadData.token.symbol}: public ERC-20 ↔ confidential (cTOKEN)`}
                  />
                  <p className="text-center text-xs text-stone-500">
                    More tokens?{" "}
                    <Link to="/portfolio" className="font-medium text-primary underline decoration-primary/30">
                      Portfolio
                    </Link>
                  </p>
                </div>
              </div>
            </>
          )}
          {!launchpadData && (
            <div className="protocol-card border-dashed border-stone-300 py-14 text-center">
              <p className="font-display text-lg font-semibold text-stone-900">Presale not found</p>
              <p className="mt-2 text-sm text-stone-600">This address is missing or invalid.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
