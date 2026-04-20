"use client";

import { Button } from "@/components/ui/button";
import WalletButton from "@/components/WalletButton";
import { navConfig } from "@/configs/nav.config";
import { cn } from "@/lib/utils";
import { useCwethWrapModal } from "@/state/modal/cweth-wrap";
import { ArrowLeftRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { pathname } = useLocation();
  const { setModalOpen: setShowWrapDialog } = useCwethWrapModal();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[oklch(0.97_0.012_85/0.85)] backdrop-blur-md">
      <div className="max-w-320 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 text-stone-900">
            <img src="/icon.png" alt="" width={36} height={36} className="size-9 rounded-2xl shadow-sm ring-2 ring-white" />
            <span className="font-display text-lg font-semibold tracking-tight">pvtsale</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navConfig.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/docs"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                pathname === "/docs"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
              )}
            >
              Docs
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              onClick={() => setShowWrapDialog(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 border-stone-200 bg-white text-stone-800 shadow-sm hover:bg-stone-50"
              title="Wrap ETH to cWETH — the confidential asset used in raises"
            >
              <ArrowLeftRight className="size-3.5 shrink-0 opacity-70" aria-hidden />
              <span className="sm:hidden">cWETH</span>
              <span className="hidden sm:inline">Get cWETH</span>
            </Button>
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
