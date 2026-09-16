import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import PricingTeaser from '@/components/landing/PricingTeaser';
import FAQ from '@/components/landing/FAQ';
import CallToAction from '@/components/landing/CallToAction';
import { seoMetadata } from '@/lib/seo/metadata';
import JsonLd from '@/components/seo/JsonLd';
import { softwareApplicationSchema, faqSchema } from '@/lib/seo/schema';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

export const generateMetadata = seoMetadata('home');

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);
  const copy = dictionary.marketing as Record<string, string>;
  const seo = (dictionary as unknown as { seo: Record<string, string> }).seo;

  return (
    <>
      {/* The product itself, plus the FAQ. Both are built from the same
          dictionary the visible sections render from, so the structured data
          always states what a visitor can actually read on the page. */}
      <JsonLd
        data={[
          softwareApplicationSchema(locale as Locale, seo['home.description']),
          faqSchema(copy),
        ]}
      />
      <Hero />
      <Features />
      <HowItWorks />
      <PricingTeaser />
      <FAQ />
      <CallToAction />
    </>
  );
}
