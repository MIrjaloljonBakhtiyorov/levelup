import HeroSection from "../components/HeroSection";
import PartnersSection from "../components/PartnersSection";
import ResourcesCenterSection from "../components/ResourcesCenterSection";
import TeachersReviewsSection from "../components/TeachersReviewsSection";
import TestModesSection from "../components/TestModesSection";

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const section = document.getElementById(location.hash.slice(1));
    if (!section) return;

    window.requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash]);

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
import { useEffect } from "react";
import { useLocation } from "react-router";
