import Hero from '@/components/landing/Hero';
import SocialProof from '@/components/landing/SocialProof';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import PricingTeaser from '@/components/landing/PricingTeaser';
import FAQ from '@/components/landing/FAQ';
import CallToAction from '@/components/landing/CallToAction';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Testimonials />
      <PricingTeaser />
      <FAQ />
      <CallToAction />
    </>
  );
}
