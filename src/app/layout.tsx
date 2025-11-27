import type { Viewport } from 'next';
import './globals.css';
import { rusticPrinted, robotoSlab } from './fonts';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="sv"
      className={`${rusticPrinted.variable} ${robotoSlab.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${robotoSlab.className} bg-black text-white antialiased selection:bg-primary/20`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}