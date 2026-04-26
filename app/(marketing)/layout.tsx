import LandingNav from '@/components/landing/LandingNav';
import Footer from '@/components/landing/Footer';
import { LanguageProvider } from '@/lib/language-context';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden flex flex-col">
        <LandingNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
