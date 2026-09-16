import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Instrument_Serif, Noto_Sans_Arabic } from 'next/font/google';
import '../globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ConfigProvider } from '@/lib/config-context';
import { ThemeProvider } from '@/lib/theme-context';
import { Toaster } from '@/components/ui/sonner';
import { GlobalStateProvider } from '@/lib/global-state-context';
import FloatingStatusIndicator from '@/components/FloatingStatusIndicator';
import VersionSkewWatcher from '@/components/VersionSkewWatcher';
import { ReactQueryProvider } from '../providers';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { dir as localeDir, type Locale } from '@/lib/i18n/config';
import { SITE_URL, SITE_NAME } from '@/lib/seo/site';
import JsonLd from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/seo/schema';

// This is the app's root layout. It deliberately lives under [locale] rather
// than at app/ so that `lang` and `dir` can be written into the statically
// exported HTML. A layout above the dynamic segment cannot know the locale,
// which is why these attributes used to be patched onto <html> client-side
// after hydration, leaving crawlers with no language signal at all and making
// /ar paint LTR for one frame.
//
// Next resolves the root layout by walking up from each page entry and taking
// the first layout it finds, so this file qualifies for every route beneath
// it. Do not add an app/layout.tsx back: `next dev` recreates one on disk when
// it is missing, so always validate this with `next build`, never `next dev`.

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

// preload is a module-scope option, so it cannot be made conditional on the
// rendered locale. Left on, it puts the Arabic face on the critical path of
// every English page. Off, the browser fetches it when Arabic glyphs actually
// need it.
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: 'Your AI assistant that listens, understands, and organizes everything you say',
  icons: {
    icon: [
      { url: '/logo-black.png', media: '(prefers-color-scheme: light)' },
      { url: '/logo.png', media: '(prefers-color-scheme: dark)' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },
  verification: {
    google: 'ELu4vvz6OIwe74QsMWAiiawf-WoRC_xW3dfifdG5NGw',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#11DF78',
};

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale as Locale);

  return (
    <html
      lang={locale}
      dir={localeDir(locale as Locale)}
      className="h-full"
      suppressHydrationWarning
    >
      <body
        className={`${GeistSans.variable} ${GeistSans.className} ${GeistMono.variable} ${instrumentSerif.variable} ${notoArabic.variable} h-full`}
        suppressHydrationWarning
      >
        {/* Publisher and site identity. Every other schema node on the site
            references these two by @id rather than repeating them. */}
        <JsonLd data={[organizationSchema(), websiteSchema(locale as Locale)]} />
        <ReactQueryProvider>
          <ThemeProvider>
            <I18nProvider locale={locale as Locale} dictionary={dictionary}>
              <AuthProvider>
                <ConfigProvider>
                  <GlobalStateProvider>
                    {children}
                    <FloatingStatusIndicator />
                    <VersionSkewWatcher />
                    <Toaster />
                  </GlobalStateProvider>
                </ConfigProvider>
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
