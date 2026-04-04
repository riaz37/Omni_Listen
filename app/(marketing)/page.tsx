import Hero from '@/components/landing/Hero';
import SocialProof from '@/components/landing/SocialProof';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import PricingTeaser from '@/components/landing/PricingTeaser';
import FAQ from '@/components/landing/FAQ';
import CallToAction from '@/components/landing/CallToAction';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Testimonials />
      <PricingTeaser />
      <FAQ />
      <CallToAction />
      <Footer />
    </div>
  );
}
