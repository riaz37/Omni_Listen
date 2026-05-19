import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Instrument_Serif, Noto_Sans_Arabic } from 'next/font/google';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistSans.className} ${GeistMono.variable} ${instrumentSerif.variable} ${notoArabic.variable} h-full`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
