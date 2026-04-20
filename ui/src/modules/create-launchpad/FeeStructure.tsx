import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeeStructure() {
  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Fee structure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-600">Platform fee</span>
          <span className="font-medium text-stone-900">0%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-600">Token fee</span>
          <span className="font-medium text-stone-900">0%</span>
        </div>
        <div className="border-t border-stone-100 pt-2">
          <div className="flex justify-between font-semibold">
            <span className="text-stone-600">Total</span>
            <span className="text-primary">0%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
