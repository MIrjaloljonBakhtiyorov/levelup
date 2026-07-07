import HeroSection from "../components/HeroSection";
import PartnersSection from "../components/PartnersSection";
import ResourcesCenterSection from "../components/ResourcesCenterSection";
import TeachersReviewsSection from "../components/TeachersReviewsSection";
import TestModesSection from "../components/TestModesSection";

function HomePage() {
  return (
    <main>
      <HeroSection />
      <TestModesSection />
      <TeachersReviewsSection />
      <ResourcesCenterSection />
      <PartnersSection />
    </main>
  );
}

export default HomePage;
