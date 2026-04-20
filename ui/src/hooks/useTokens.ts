import { tokenApi } from "@/@api/token.api";
import { TQueryOptions } from "@/@types/common.types";
import { TToken } from "@/@types/token.types";
import { useQuery } from "@tanstack/react-query";

export function useTokenListQuery(options?: TQueryOptions<TToken[]>) {
  return useQuery({
    queryKey: ["tokenList"],
    queryFn: async () => {
      return tokenApi.getTokenList();
    },
    staleTime: 10_000,
    ...options,
    enabled: options?.enabled ?? false,
  });
}
