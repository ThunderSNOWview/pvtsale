import { ComponentProps } from "react";
import { QueryKey, UseQueryOptions } from "@tanstack/react-query";

export type TQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryKey" | "initialData" | "queryFn">;

export type TBaseRecord<D> = D & {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};
