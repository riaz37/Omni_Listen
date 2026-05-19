import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Noto_Sans_Arabic } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ConfigProvider } from '@/lib/config-context';
import { ThemeProvider } from '@/lib/theme-context';
import { Toaster } from '@/components/ui/sonner';
import { GlobalStateProvider } from '@/lib/global-state-context';
import FloatingStatusIndicator from '@/components/FloatingStatusIndicator';
import { ReactQueryProvider } from '../providers';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Omni Listen',
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
    title: 'Omni Listen',
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
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const dictionary = await getDictionary(locale as Locale);

  return (
    <html lang={locale} dir={dir} className="h-full" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistSans.className} ${GeistMono.variable} ${instrumentSerif.variable} ${notoArabic.variable} h-full`}
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <ConfigProvider>
                <GlobalStateProvider>
                  <I18nProvider locale={locale as Locale} dictionary={dictionary}>
                    {children}
                    <FloatingStatusIndicator />
                    <Toaster />
                  </I18nProvider>
                </GlobalStateProvider>
              </ConfigProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
