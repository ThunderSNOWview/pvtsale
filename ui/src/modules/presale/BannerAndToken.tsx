import { TPresale } from "@/@types/launchpad.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function BannerAndToken({ launchpadData }: { launchpadData: TPresale }) {
  return (
    <Card className="protocol-card overflow-hidden border-stone-200/90 py-0 shadow-md">
      <div
        className="relative aspect-[3.85] bg-gradient-to-br from-teal-200 via-amber-100 to-rose-100"
        style={{
          backgroundImage: `linear-gradient(105deg, oklch(0.92 0.06 160 / 0.85), oklch(0.95 0.05 85 / 0.9)), url("/images/default-banner.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
        <div className="absolute bottom-5 left-6 flex items-end gap-4">
          <Avatar className="size-16 rounded-2xl ring-4 ring-white shadow-lg">
            <AvatarImage src={"/images/empty-token.webp"} alt={launchpadData.token.name} />
            <AvatarFallback className="rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
              {launchpadData.token.symbol.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="pb-1">
            <h1 className="font-display text-2xl font-semibold text-stone-900 md:text-3xl">{launchpadData.token.name}</h1>
            <Badge className="mt-2 rounded-full bg-white/90 px-3 py-0.5 text-xs font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200/80">
              Presale
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
