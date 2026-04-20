import HeroBanner from "./HeroBanner";
import HomeFeatures from "./HomeFeatures";
import HomeGetStarted from "./HomeGetStarted";

export default function HomeView() {
  return (
    <div className="space-y-14 py-6 md:space-y-16 md:py-8">
      <HeroBanner />

      <HomeFeatures />

      <HomeGetStarted />
    </div>
  );
}
