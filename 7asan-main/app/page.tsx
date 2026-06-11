import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import HomeCardsSection from "@/components/HomeCardsSection";
import SocialSection from "@/components/SocialSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <AboutSection />
        <HomeCardsSection />
        <SocialSection />
      </main>
      <Footer />
    </>
  );
}
