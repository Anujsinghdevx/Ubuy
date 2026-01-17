import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SpeedInsights } from '@vercel/speed-insights/next';
import HelpPopup from '@/components/HelpPopup';
import ClientNavbarWrapper from '@/components/ClientNavbarWrapper';
import Providers from '@/components/Providers';

export const metadata = {
  title: {
    default: 'U-Buy - Online Auction Platform',
    template: '%s | U-Buy',
  },
  description: 'Join live auctions and bid on unique items across categories with U-Buy.',
  openGraph: {
    title: 'U-Buy - Online Auction Platform',
    description: 'Join live auctions and bid on unique items across categories with U-Buy.',
    url: 'https://ubuy-theta.vercel.app/',
    images: [
      {
        url: '/preview.jpg',
        width: 800,
        height: 600,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <Providers>
          <SpeedInsights />
          <ClientNavbarWrapper>{children}</ClientNavbarWrapper>
          <Toaster />
          <HelpPopup />
        </Providers>
      </body>
    </html>
  );
}
