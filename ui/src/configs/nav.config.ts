import { Home, LayoutGrid, Plus, Rocket, Wallet } from "lucide-react";

export type TNavConfig = {
  id: string;
  label: string;
  href: string;
  Icon?: React.ElementType; // Optional: Add icon property if needed
};

export const navConfig: TNavConfig[] = [
  {
    id: "home",
    label: "Home",
    href: "/create",
    Icon: Home,
  },
  {
    id: "raises",
    label: "Raises",
    href: "/raises",
    Icon: LayoutGrid,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    href: "/portfolio",
    Icon: Wallet,
  },
  {
    id: "create-token",
    label: "Create Token",
    href: "/create-token",
    Icon: Plus,
  },
  {
    id: "create-launchpad",
    label: "Create presale",
    href: "/create-launchpad",
    Icon: Rocket,
  },
];
