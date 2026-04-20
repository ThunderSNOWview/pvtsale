import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Comments() {
  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-12 text-center text-stone-500">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
            <MessageSquare className="size-7" />
          </div>
          <p className="font-medium text-stone-700">Coming soon</p>
          <p className="mt-1 max-w-xs text-sm">Community threads aren’t enabled yet.</p>
        </div>
      </CardContent>
    </Card>
  );
}
