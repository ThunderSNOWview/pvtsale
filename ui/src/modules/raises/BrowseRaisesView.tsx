import { EPresaleStatus } from "@/@types/launchpad.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPresaleStatus, usePresaleListQuery } from "@/hooks/usePresale";
import PresaleItem from "@/modules/home/PresaleItem";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function BrowseRaisesView() {
  const { data: presaleList, isLoading, isPending } = usePresaleListQuery({ enabled: true, refetchInterval: 20_000 });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLaunches = useMemo(() => {
    return presaleList?.filter((launch) => {
      const matchesSearch =
        launch.token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        launch.token.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const status = getPresaleStatus(launch);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [presaleList, searchTerm, statusFilter]);

  return (
    <div className="py-6 md:py-8">
      <Card className="protocol-card overflow-hidden border-stone-200/90">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-xl font-semibold text-stone-900">Browse raises</CardTitle>
          <p className="text-sm font-normal text-stone-600">
            Live and upcoming confidential presales on Sepolia — filter by status or search by token.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search by name or symbol…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="protocol-field max-w-md border-stone-200 placeholder:text-stone-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="protocol-field w-full border-stone-200 sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-stone-200 bg-white">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value={EPresaleStatus.Upcoming}>Upcoming</SelectItem>
                <SelectItem value={EPresaleStatus.Active}>Active</SelectItem>
                <SelectItem value={EPresaleStatus.Completed}>Completed</SelectItem>
                <SelectItem value={EPresaleStatus.Failed}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading || isPending ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-primary">
              <Loader2 className="size-8 animate-spin" />
              <span className="text-sm text-stone-600">Loading launches…</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredLaunches?.map((launch) => (
                <PresaleItem key={launch.presaleAddress} presale={launch} />
              ))}
              {filteredLaunches?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center gap-2 py-16 text-center text-stone-500">
                  <p className="font-medium text-stone-700">No matches</p>
                  <p className="text-sm">Try another search or status filter.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
