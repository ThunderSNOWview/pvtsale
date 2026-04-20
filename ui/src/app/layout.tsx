import Modals from "@/components/modals/Modals";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { generateMetadata } from "@/utils/seo";
import type { Metadata } from "next";
import DataPrefetch from "./components/DataPrefetch";
import Header from "./components/Header";
import StatsBar from "./components/StatsBar";
import "./globals.css";

export const metadata: Metadata = {
  ...generateMetadata(),
  title: {
    default: "pvtsale — confidential token presales",
    template: "%s | pvtsale",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div>
          <Providers>
            <Header />
            <StatsBar />
            <main className="max-w-320 mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
            <DataPrefetch />
            <Modals />
            <Toaster duration={8000} position="top-right" closeButton expand visibleToasts={3} />
          </Providers>
        </div>
      </body>
    </html>
  );
}
