import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rank Monk — The Zen OS for Autonomous Organic Growth & AEO',
  description: 'Autonomous organic growth engine that crawls your site, extracts your brand DNA, writes authoritative content, and secures citations on Google, ChatGPT, and Perplexity.',
  icons: {
    icon: '/assets/favicon.png',
    apple: '/assets/rank-monk-icon.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className="scroll-smooth">
      <head>
        <link rel="icon" href="/assets/favicon.png" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

