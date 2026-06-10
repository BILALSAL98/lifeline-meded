import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Ecosystems from "@/components/landing/Ecosystems";
import SignatureFeatures from "@/components/landing/SignatureFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="relative">
      <Navigation />
      <Hero />
      <Stats />
      <Ecosystems />
      <SignatureFeatures />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTABanner />
      <Footer />
    </main>
  );
}
