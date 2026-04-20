import { useCwethWrapModal } from "@/state/modal/cweth-wrap";
import { Link } from "react-router-dom";

export default function AppFooter() {
  const { setModalOpen: openWrap } = useCwethWrapModal();

  return (
    <footer className="mt-24 border-t border-stone-200 bg-white/60 backdrop-blur-sm">
      <div className="max-w-320 mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-xl font-semibold text-stone-900">pvtsale</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
              Confidential token launchpad on Sepolia (Fhenix CoFHE): cWETH contributions with encrypted amounts, on-chain
              caps, and tooling to create presales and manage cTOKEN allocations.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-stone-600">
            <Link className="hover:text-primary" to="/docs">
              Docs
            </Link>
            <a className="hover:text-primary" href="https://docs.fhenix.io/" target="_blank" rel="noopener noreferrer">
              Fhenix
            </a>
            <Link className="hover:text-primary" to="/create">
              New presale
            </Link>
            <button
              type="button"
              className="cursor-pointer text-left text-sm font-medium text-stone-600 hover:text-primary"
              onClick={() => openWrap(true)}
            >
              Wrap ETH → cWETH
            </button>
            <a
              className="hover:text-primary"
              href="https://github.com/ThunderSNOWview/pvtsale"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
        <p className="mt-10 border-t border-stone-100 pt-8 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} pvtsale · Sepolia testnet
        </p>
      </div>
    </footer>
  );
}
