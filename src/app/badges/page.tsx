'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Hammer, Trophy, Gavel, MedalIcon } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import BadgesPageSkeleton from '@/components/Skeleton/BadgesPageSkeleton';

interface Stats {
  totalBids: number;
  auctionsCreated: number;
  auctionsWon: number;
}

interface BadgeInfo {
  title: string;
  image: string;
  requirement: number;
  tooltip: string;
  description: string;
}

const auctionThresholds = [1, 5, 25, 50, 100];
const winThresholds = [1, 5, 10, 25, 50];
const bidThresholds = [1, 10, 50, 100, 500];

const auctionBadges: BadgeInfo[] = [
  {
    title: 'First Hammer',
    image: 'auction1',
    requirement: 1,
    tooltip: 'Create your first auction',
    description: "You're officially a seller now!",
  },
  {
    title: 'Stack Starter',
    image: 'auction2',
    requirement: 5,
    tooltip: 'Create 5 auctions',
    description: "You're warming up!",
  },
  {
    title: 'Verified Seller',
    image: 'auction3',
    requirement: 25,
    tooltip: 'Create 25 auctions',
    description: 'People trust your listings.',
  },
  {
    title: 'Auction Kingpin',
    image: 'auction4',
    requirement: 50,
    tooltip: 'Create 50 auctions',
    description: 'You run the show!',
  },
  {
    title: 'Listing Pro',
    image: 'auction5',
    requirement: 100,
    tooltip: 'Create 100 auctions',
    description: "You're a seasoned auctioneer!",
  },
];

const winBadges: BadgeInfo[] = [
  {
    title: 'Victory Flag',
    image: 'win1',
    requirement: 1,
    tooltip: 'Win your first auction',
    description: 'First win always feels sweet.',
  },
  {
    title: 'Lucky Charmo',
    image: 'win2',
    requirement: 5,
    tooltip: 'Win 5 auctions',
    description: "You're getting the hang of it!",
  },
  {
    title: 'Golden Medalist',
    image: 'win3',
    requirement: 10,
    tooltip: 'Win 10 auctions',
    description: "You've struck gold!",
  },
  {
    title: 'Last Second Sniper',
    image: 'win4',
    requirement: 25,
    tooltip: 'Win 25 auctions',
    description: 'That clutch timing is deadly.',
  },
  {
    title: 'Trophy Champion',
    image: 'win5',
    requirement: 50,
    tooltip: 'Win 50 auctions',
    description: 'You’re a true champion!',
  },
];

const bidBadges: BadgeInfo[] = [
  {
    title: 'Bid Beginner',
    image: 'bid1',
    requirement: 1,
    tooltip: 'Place your first bid',
    description: 'Your bidding journey begins.',
  },
  {
    title: 'Loop Biddero',
    image: 'bid2',
    requirement: 10,
    tooltip: 'Place 10 bids',
    description: 'Getting in the rhythm!',
  },
  {
    title: 'Precision Bidder',
    image: 'bid3',
    requirement: 50,
    tooltip: 'Place 50 bids',
    description: 'You know when to strike.',
  },
  {
    title: 'Quick Bidder',
    image: 'bid4',
    requirement: 100,
    tooltip: 'Place 100 bids',
    description: 'Fast and fearless.',
  },
  {
    title: 'Bidding Beast',
    image: 'bid5',
    requirement: 500,
    tooltip: 'Place 500 bids',
    description: 'You’re dominating the battlefield!',
  },
];

const enhancedDescriptions = new Map<string, string>([
  [
    "You're officially a seller now!",
    "You’ve taken the first big step. Welcome to the seller's arena!",
  ],
  ["You're warming up!", 'Momentum is building. Keep stacking those listings!'],
  ['People trust your listings.', 'You’ve earned credibility. Buyers recognize your value.'],
  ['You run the show!', 'You’re not just listing—you’re leading!'],
  ["You're a seasoned auctioneer!", 'Your listings are legendary. True veteran vibes!'],
  ['First win always feels sweet.', 'That first victory is always unforgettable. You did it!'],
  ["You're getting the hang of it!", 'You’re winning consistently. You know how to play!'],
  ["You've struck gold!", 'Multiple wins and growing stronger!'],
  ['That clutch timing is deadly.', 'Your instincts are sharp. You strike at the right moment!'],
  ['You’re a true champion!', 'The crown fits you well. Champion of the auction floor.'],
  ['Your bidding journey begins.', 'Your first bid is a step into the world of possibilities.'],
  ['Getting in the rhythm!', 'You’re no stranger to bidding. You’ve found your flow.'],
  ['You know when to strike.', 'You’re precise and patient. A smart bidder.'],
  ['Fast and fearless.', 'You bid like a pro—quick, confident, relentless.'],
  ['You’re dominating the battlefield!', 'You’ve become a bidding legend. Unstoppable.'],
]);

function enhanceDescription(text: string): string {
  return enhancedDescriptions.get(text) || text;
}

function getProgress(current: number, thresholds: number[]) {
  const earned = thresholds.filter((t) => current >= t).length;
  const total = thresholds.length;
  const percent = (earned / total) * 100;
  const next = thresholds.find((t) => current < t) || null;
  return { earned, total, percent, next };
}

interface BadgeSectionProps {
  title: string;
  Icon: React.ElementType;
  current: number;
  thresholds: number[];
  badges: BadgeInfo[];
}

const BadgeSection: React.FC<BadgeSectionProps> = ({
  title,
  Icon,
  current,
  thresholds,
  badges,
}) => {
  const progress = getProgress(current, thresholds);

  return (
    <section className="mb-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
        <Icon className="text-emerald-600 w-6 h-6" aria-hidden />
        {title}
      </h2>
      <p className="text-sm text-gray-600 mb-2">
        You earned {progress.earned}/{progress.total} badges{' '}
        {progress.next && `(Next at ${progress.next})`}
      </p>

      <div className="relative w-full h-2 bg-gray-200 rounded mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute left-0 top-0 h-full bg-emerald-500"
          aria-label={`Progress: ${progress.percent}%`}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {badges.map((badge) => (
          <motion.div
            key={badge.title}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center p-2 bg-white rounded-md shadow-sm"
          >
            <Image
              src={`/badges/${badge.image}.png`}
              alt={`Badge: ${badge.title}`}
              width={64}
              height={64}
              className={current >= badge.requirement ? '' : 'grayscale opacity-50'}
            />
            <p className="text-sm font-semibold mt-2">{badge.title}</p>
            <p className="text-xs text-gray-600 mt-1 leading-snug">
              {enhanceDescription(badge.description)}
            </p>
            <p className="text-[11px] text-gray-500 italic mt-1"> {badge.tooltip}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default function BadgesPage() {
  const [stats, setStats] = useState<Stats>({ totalBids: 0, auctionsCreated: 0, auctionsWon: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auction/bidstats');
        const data = await res.json();
        if (res.ok && data) {
          setStats(data);
        } else {
          throw new Error('Fallback to zero stats');
        }
      } catch (err) {
        toast.warning('Log in to see your badge progress!');
        console.error('Error fetching stats:', err);
        setStats({ totalBids: 0, auctionsCreated: 0, auctionsWon: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <Head>
        <title>Badge Progress | Auction App</title>
        <meta
          name="description"
          content="Track your badge achievements in auctions, bidding, and winning."
        />
        <meta property="og:title" content="Badge Progress" />
        <meta
          property="og:description"
          content="Gamify your auction experience and collect badges as you go!"
        />
      </Head>

      <main className="min-h-screen p-6 bg-gray-50">
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <h1 className="text-3xl font-bold text-center mb-2 flex justify-center items-center gap-2">
              <MedalIcon className="text-emerald-600 w-7 h-7" aria-hidden />
              Badge Overview
            </h1>
            <p className="text-center text-gray-600 max-w-xl mx-auto text-sm">
              Understand how to earn badges and track your journey, even if you&apos;re just
              browsing.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <BadgesPageSkeleton />
            ) : (
              <>
                <BadgeSection
                  title="Auction Creation Badges"
                  Icon={Hammer}
                  current={stats.auctionsCreated}
                  thresholds={auctionThresholds}
                  badges={auctionBadges}
                />
                <BadgeSection
                  title="Auction Win Badges"
                  Icon={Trophy}
                  current={stats.auctionsWon}
                  thresholds={winThresholds}
                  badges={winBadges}
                />
                <BadgeSection
                  title="Bidding Badges"
                  Icon={Gavel}
                  current={stats.totalBids}
                  thresholds={bidThresholds}
                  badges={bidBadges}
                />
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
