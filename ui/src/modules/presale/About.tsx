import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About({ description }: { description: string }) {
  return (
    <Card className="protocol-card border-stone-200/90">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold text-stone-900">About</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line text-sm leading-relaxed text-stone-600">{description}</div>
      </CardContent>
    </Card>
  );
}
