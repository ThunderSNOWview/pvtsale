import { PresaleView } from "@/modules/presale";
import { generateMetadata } from "@/utils/seo";

export const metadata = generateMetadata({
  title: "Launchpad Detail",
});

export default function LaunchpadDetailPage() {
  return (
    <>
      <PresaleView />
    </>
  );
}
