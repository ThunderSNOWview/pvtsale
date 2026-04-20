import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Requirements({
  validTokenAddress,
  fundingGoalsSet,
  timelineSet,
}: {
  validTokenAddress: boolean;
  fundingGoalsSet: boolean;
  timelineSet: boolean;
}) {
  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div
            className={`size-2.5 shrink-0 rounded-full ${validTokenAddress ? "bg-primary shadow-[0_0_0_3px_rgba(217,119,87,0.25)]" : "bg-stone-300"}`}
          />
          <span className={validTokenAddress ? "font-medium text-stone-900" : "text-stone-500"}>Valid token contract</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div
            className={`size-2.5 shrink-0 rounded-full ${fundingGoalsSet ? "bg-primary shadow-[0_0_0_3px_rgba(217,119,87,0.25)]" : "bg-stone-300"}`}
          />
          <span className={fundingGoalsSet ? "font-medium text-stone-900" : "text-stone-500"}>Funding goals set</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div
            className={`size-2.5 shrink-0 rounded-full ${timelineSet ? "bg-primary shadow-[0_0_0_3px_rgba(217,119,87,0.25)]" : "bg-stone-300"}`}
          />
          <span className={timelineSet ? "font-medium text-stone-900" : "text-stone-500"}>Timeline set</span>
        </div>
      </CardContent>
    </Card>
  );
}
