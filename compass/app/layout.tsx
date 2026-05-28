import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Compass — find your bearing in AI',
  description:
    'AI moves fast. Compass keeps up with you. Take a 5-minute placement quiz, then get a personalized feed of AI news, tools, and prompts tuned to your level and your work.',
  openGraph: {
    title: 'Compass — find your bearing in AI',
    description:
      'A 5-minute placement quiz, then a personalized AI feed tuned to where you actually are at work.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#d44a1c',     // accent
          colorBackground: '#f5f1ea',  // paper
          colorText: '#1a1614',        // ink
          colorInputBackground: '#ebe6dd',
          fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: '8px',
        },
      }}
    >
      <html lang="en" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
        <body className="font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
