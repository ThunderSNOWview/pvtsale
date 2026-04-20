import { Routes, Route, Navigate } from "react-router-dom";
import Providers from "@/components/Providers";
import AppFooter from "@/components/layout/AppFooter";
import Header from "@/app/components/Header";
import StatsBar from "@/app/components/StatsBar";
import DataPrefetch from "@/app/components/DataPrefetch";
import Modals from "@/components/modals/Modals";
import { Toaster } from "@/components/ui/sonner";
import { HomeView } from "@/modules/home";
import { PresaleView } from "@/modules/presale";
import { CreateLaunchpadView } from "@/modules/create-launchpad";
import { CreateTokenView } from "@/modules/create-token";
import { BrowseRaisesView } from "@/modules/raises";
import { PortfolioView } from "@/modules/portfolio";
import { DocsView } from "@/modules/docs";

export default function App() {
  return (
    <Providers>
      <div className="app-shell min-h-screen flex flex-col antialiased">
        <Header />
        <StatsBar />
        <main className="max-w-320 mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8 pb-16">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/raises" element={<BrowseRaisesView />} />
            <Route path="/portfolio" element={<PortfolioView />} />
            <Route path="/launchpad/:id" element={<PresaleView />} />
            <Route path="/create" element={<CreateLaunchpadView />} />
            <Route path="/create-launchpad" element={<CreateLaunchpadView />} />
            <Route path="/create-token" element={<CreateTokenView />} />
            <Route path="/docs" element={<DocsView />} />
          </Routes>
        </main>
        <AppFooter />
      </div>
      <DataPrefetch />
      <Modals />
      <Toaster
        duration={8000}
        position="top-right"
        closeButton
        expand
        visibleToasts={3}
      />
    </Providers>
  );
}
