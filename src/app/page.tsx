'use client';

import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { HeroSection } from '@/components/Home/HeroSection';
import { AuctionSection } from '@/components/Home/AuctionSection';
import MegaAuction from '@/components/Home/MegaAuction';
import Categories from '@/components/Home/Categories';
import Stats from '@/components/Home/Stats';
import WhyChooseUs from '@/components/Home/WhyChooseUs';
import Newsletter from '@/components/Home/Newsletter';
import { useAuctions } from '@/hooks/useAuctions';

export default function HomePage() {
  const { data: session } = useSession();
  const { auctions, loading } = useAuctions();

  return (
    <main className="min-h-screen bg-emerald-100">
      <Head>
        <title>Live Auctions | Bid, Win & Sell</title>
        <meta
          name="description"
          content="Join live auctions, bid on exclusive items, and explore unique categories. Secure payments and verified sellers."
        />
        <meta property="og:title" content="Live Auctions | Bid, Win & Sell" />
        <meta
          property="og:description"
          content="Join live auctions, bid on exclusive items, and explore unique categories. Secure payments and verified sellers."
        />
        <meta property="og:image" content="/preview.jpg" />
      </Head>

      <HeroSection session={session ?? undefined} />
      <AuctionSection auctions={auctions} loading={loading} />
      <MegaAuction />
      <Categories />
      <Stats />
      <WhyChooseUs />
      <Newsletter />
    </main>
  );
}
