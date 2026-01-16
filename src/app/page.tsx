import { HeroSection } from "@/components/landing/hero";
import { LandmarksCarousel } from "@/components/landing/landmarks-carousel";
import { LocalFavorites } from "@/components/landing/local-favorites";
import { LatestReviews } from "@/components/landing/latest-reviews";
import CtaCards from "@/components/landing/cta";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <LandmarksCarousel />
      <LocalFavorites />
      <LatestReviews />
      <CtaCards />
    </main>
  );
}
