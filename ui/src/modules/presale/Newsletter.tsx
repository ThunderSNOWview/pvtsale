import Button from "@/components/Button";
import ComingSoonTooltipWrapper from "@/components/ComingSoonTooltipWrapper";
import Input from "@/components/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Newsletter() {
  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">Newsletter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-stone-600">Presale and product updates (coming soon).</p>
          <Input placeholder="your@email.com" className="protocol-field placeholder:text-stone-400" />
          <ComingSoonTooltipWrapper comingSoon={true}>
            <Button className="w-full">Subscribe</Button>
          </ComingSoonTooltipWrapper>
        </div>
      </CardContent>
    </Card>
  );
}
