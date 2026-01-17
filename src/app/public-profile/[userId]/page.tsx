'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Loader2, LogIn, Gavel, PlusCircle, Trophy, MedalIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from 'react-share';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stats {
  totalBids: number;
  auctionsCreated: number;
  auctionsWon: number;
}

interface PublicProfile {
  id: string;
  username: string;
  profileImage: string;
  stats: Stats;
  createdAt: string;
}

const auctionThresholds = [1, 5, 25, 50, 100];
const winThresholds = [1, 5, 10, 25, 50];
const bidThresholds = [1, 10, 50, 100, 500];

export default function PublicProfilePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const userId = params?.userId as string | undefined;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicProfileUrl, setPublicProfileUrl] = useState('');
  const [showAllBadges, setShowAllBadges] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPublicProfileUrl(`${window.location.origin}/public-profile/${userId}`);
    }
  }, [userId]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public-profile/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch public profile');
        setProfile(data);
      } catch (error) {
        console.error('Error fetching public profile:', error);
        toast.error(error instanceof Error ? error.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    if (userId && status === 'authenticated') fetchProfile();
  }, [userId, status]);

  const auctionBadge = useMemo(
    () => getBadgeLevel(profile?.stats.auctionsCreated ?? 0, auctionThresholds),
    [profile]
  );
  const winBadge = useMemo(
    () => getBadgeLevel(profile?.stats.auctionsWon ?? 0, winThresholds),
    [profile]
  );
  const bidBadge = useMemo(
    () => getBadgeLevel(profile?.stats.totalBids ?? 0, bidThresholds),
    [profile]
  );

  const earnedAuctionBadges = useMemo(
    () => getEarnedBadges(profile?.stats.auctionsCreated ?? 0, auctionThresholds, 'auction'),
    [profile]
  );
  const earnedWinBadges = useMemo(
    () => getEarnedBadges(profile?.stats.auctionsWon ?? 0, winThresholds, 'win'),
    [profile]
  );
  const earnedBidBadges = useMemo(
    () => getEarnedBadges(profile?.stats.totalBids ?? 0, bidThresholds, 'bid'),
    [profile]
  );

  const hasMultipleBadges =
    earnedAuctionBadges.length > 1 || earnedWinBadges.length > 1 || earnedBidBadges.length > 1;

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 mb-4 text-center text-base sm:text-lg">
          You need to be signed in to view public profiles.
        </p>
        <Button
          onClick={() => signIn('google')}
          className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-6 py-2 transition-transform transform hover:scale-105 shadow-md"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Sign in to view Profile
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-center text-base sm:text-lg">No profile found.</p>
      </div>
    );
  }

  const { username, profileImage, stats, createdAt } = profile;
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  function getBadgeLevel(count: number, thresholds: number[]) {
    let level = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (count >= thresholds[i]) level = i + 1;
    }
    return level;
  }

  function getEarnedBadges(count: number, thresholds: number[], prefix: string) {
    return thresholds
      .map((threshold, index) => ({
        level: index + 1,
        badge: `${prefix}${index + 1}`,
        required: threshold,
      }))
      .filter((b) => count >= b.required);
  }

  return (
    <div className="flex flex-col items-center bg-gray-50 px-4 sm:px-6 py-8 min-h-screen">
      <Card className="w-full max-w-2xl bg-white shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 hover:scale-105 transition-transform duration-300 ease-in-out">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={username}
                fill
                className="object-cover w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-emerald-400 shadow-md"
              />
            ) : (
              <div className="flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-emerald-400 text-white font-bold text-4xl sm:text-7xl border-4 border-emerald-600 shadow-md">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{username}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Member since: <span className="font-semibold">{formattedDate}</span>
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">
            Auction Stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard icon={Gavel} label="Total Bids" value={stats.totalBids} />
            <StatCard icon={PlusCircle} label="Auctions Created" value={stats.auctionsCreated} />
            <StatCard icon={Trophy} label="Auctions Won" value={stats.auctionsWon} />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">
            Achievements & Badges
          </h3>
          <div className="text-center mb-4">
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/badges')}
              className="text-sm text-emerald-600 border-emerald-500 hover:bg-emerald-50 transition"
            >
              <MedalIcon className="text-emerald-600 w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Explore Full Badge System
            </Button>
          </div>

          <div className="grid grid-cols-3 justify-items-center">
            {bidBadge > 0 && <BadgeIcon level={bidBadge} prefix="bid" />}
            {auctionBadge > 0 && <BadgeIcon level={auctionBadge} prefix="auction" />}
            {winBadge > 0 && <BadgeIcon level={winBadge} prefix="win" />}
          </div>
          {hasMultipleBadges && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAllBadges(!showAllBadges)}
                className="text-sm hover:scale-105 transition-transform"
              >
                {showAllBadges ? 'Hide All Badges' : 'View All Earned Badges'}
              </Button>
            </div>
          )}

          {hasMultipleBadges && showAllBadges && (
            <div className="mt-6 space-y-6">
              <BadgeGroup title="Auction Badges" badges={earnedAuctionBadges} />
              <BadgeGroup title="Winning Badges" badges={earnedWinBadges} />
              <BadgeGroup title="Bidding Badges" badges={earnedBidBadges} />
            </div>
          )}

          <div className="text-center mt-8">
            <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              Share this Profile
            </h4>
            <div className="flex items-center justify-center flex-wrap gap-2">
              <WhatsappShareButton url={publicProfileUrl} aria-label="Share on WhatsApp">
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
              <TelegramShareButton url={publicProfileUrl} aria-label="Share on Telegram">
                <TelegramIcon size={32} round />
              </TelegramShareButton>
              <LinkedinShareButton url={publicProfileUrl} aria-label="Share on LinkedIn">
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(publicProfileUrl);
                  toast.success('Public profile link copied to clipboard!');
                }}
                className="bg-gray-200 hover:cursor-pointer text-gray-800 px-4 py-2 rounded-full hover:bg-gray-300 transition"
              >
                Copy Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-emerald-100 p-4 rounded-lg shadow-sm text-center flex flex-col items-center">
      <Icon className="w-8 h-8 text-emerald-600 mb-2" />
      <p className="text-lg sm:text-2xl font-bold text-emerald-600">{value}</p>
      <p className="text-base sm:text-lg font-semibold text-gray-700">{label}</p>
    </div>
  );
}

function BadgeIcon({ level, prefix }: { level: number; prefix: string }) {
  return (
    <div className="text-center hover:scale-105 transition-transform">
      <Image
        src={`/badges/${prefix}${level}.png`}
        alt={`${prefix} badge level ${level}`}
        width={64}
        height={64}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/badges/fallback.png';
        }}
      />
      <p className="text-xs sm:text-sm text-gray-600 mt-1 capitalize">
        {prefix} level {level}
      </p>
    </div>
  );
}

function BadgeGroup({
  title,
  badges,
}: {
  title: string;
  badges: { badge: string; level: number; required: number }[];
}) {
  return (
    <div>
      <h4 className="text-center font-semibold text-gray-700 text-sm sm:text-base mb-2">{title}</h4>
      <div className="flex flex-wrap justify-center gap-4">
        {badges.map((b) => (
          <div key={b.badge} className="text-center hover:scale-105 transition-transform">
            <Image
              src={`/badges/${b.badge}.png`}
              alt={`${title} - Level ${b.level}`}
              width={64}
              height={64}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/badges/fallback.png';
              }}
            />
            <p className="text-[11px] sm:text-xs text-gray-500 italic mt-1">
              🎯 {b.required}+ {title.split(' ')[0].toLowerCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
