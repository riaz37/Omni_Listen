import type { Metadata, Viewport } from 'next';
import { Instrument_Serif } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ConfigProvider } from '@/lib/config-context';
import { ThemeProvider } from '@/lib/theme-context';
import { Toaster } from '@/components/ui/sonner';
import { GlobalStateProvider } from '@/lib/global-state-context';
import FloatingStatusIndicator from '@/components/FloatingStatusIndicator';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Omni Listen — AI Personal Assistant',
  description: 'Your AI assistant that listens, understands, and organizes everything you say',
  icons: {
    icon: '/logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Omni Listen',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,  // Allow zoom for accessibility
  themeColor: '#11DF78',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistSans.className} ${GeistMono.variable} ${instrumentSerif.variable} h-full`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ConfigProvider>
              <GlobalStateProvider>
                {children}
                <FloatingStatusIndicator />
                <Toaster />
              </GlobalStateProvider>
            </ConfigProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
