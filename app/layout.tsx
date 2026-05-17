import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Blindspot',
  description: 'A word-based social deduction game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-text font-body min-h-screen antialiased">
        {children}
        <footer className="logyx-footer">
          <a href="https://logyx.co.il/" className="logyx-link" target="_blank" rel="noopener noreferrer">
            <span className="logyx-text">Powered by</span>
            <img decoding="async" src="/logyx_logo_footer.webp" alt="Logyx" className="logyx-logo" />
            <span className="logyx-name">Logyx</span>
          </a>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
