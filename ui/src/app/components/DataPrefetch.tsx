"use client";

import { useTokenListQuery } from "@/hooks/useTokens";

export default function DataPrefetch() {
  useTokenListQuery({ enabled: true, refetchInterval: 20_000 });
  return null;
}
