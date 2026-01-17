'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  LogOut,
  LogIn,
  Mail,
  User,
  Upload,
  Gavel,
  Trophy,
  PlusCircle,
  Pencil,
  ClipboardCheckIcon,
  MedalIcon,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from 'react-share';
import RecentActivity from '@/components/RecentActivity';
import ProfilePageSkeleton from '@/components/Skeleton/ProfilePageSkeleton';

type Stats = {
  totalBids: number;
  auctionsCreated: number;
  auctionsWon: number;
};

type Profile = {
  image?: string;
  username?: string;
  name?: string;
  createdAt?: string;
  stats: Stats;
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}

const auctionThresholds = [1, 5, 25, 50, 100];
const winThresholds = [1, 5, 10, 25, 50];
const bidThresholds = [1, 10, 50, 100, 500];

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [createdAtFormatted, setCreatedAtFormatted] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [publicProfileUrl, setPublicProfileUrl] = useState('');
  const [showAllBadges, setShowAllBadges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.user.id,
              userModel: session.user.authProvider === 'credentials' ? 'User' : 'AuthUser',
            }),
          }),
          fetch('/api/auction/bidstats'),
        ]);

        const profileData = await profileRes.json();
        const statsData = await statsRes.json();

        if (!profileRes.ok) throw new Error(profileData.error || 'Failed to fetch profile');
        if (!statsRes.ok) throw new Error(statsData.error || 'Failed to fetch stats');

        const newProfile: Profile = {
          ...profileData,
          stats: {
            totalBids: statsData.totalBids ?? 0,
            auctionsCreated: statsData.auctionsCreated ?? 0,
            auctionsWon: statsData.auctionsWon ?? 0,
          },
        };

        setProfile((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(newProfile)) {
            return newProfile;
          }
          return prev;
        });

        setName((prev) => (prev !== profileData.name ? profileData.name : prev));

        if (profileData.createdAt) {
          const formatted = new Date(profileData.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });
          setCreatedAtFormatted((prev) => (prev !== formatted ? formatted : prev));
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      setPublicProfileUrl(`${window.location.origin}/public-profile/${userId}`);
    }
  }, [userId]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleUpdateProfile = async () => {
    if (!session?.user) return toast.error('You must be signed in.');

    try {
      setIsUpdating(true);
      let imageBase64 = '';
      const file = fileInputRef.current?.files?.[0];
      if (file) imageBase64 = await toBase64(file);

      const res = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          userModel: session.user.authProvider === 'credentials' ? 'User' : 'AuthUser',
          username: profile?.username,
          name,
          imageBase64: imageBase64 || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Update failed');

      toast.success('Profile updated!');
      await update();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsUpdating(false);
    }
  };

  const getBadgeLevel = (count: number, thresholds: number[]) => {
    let level = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (count >= thresholds[i]) level = i + 1;
    }
    return level;
  };

  const getEarnedBadges = (count: number, thresholds: number[], prefix: string) =>
    thresholds
      .map((t, i) => ({
        level: i + 1,
        badge: `${prefix}${i + 1}`,
        required: t,
      }))
      .filter((b) => count >= b.required);

  const auctionBadge = useMemo(
    () => getBadgeLevel(profile?.stats?.auctionsCreated ?? 0, auctionThresholds),
    [profile]
  );
  const winBadge = useMemo(
    () => getBadgeLevel(profile?.stats?.auctionsWon ?? 0, winThresholds),
    [profile]
  );
  const bidBadge = useMemo(
    () => getBadgeLevel(profile?.stats?.totalBids ?? 0, bidThresholds),
    [profile]
  );

  const earnedAuctionBadges = useMemo(
    () => getEarnedBadges(profile?.stats?.auctionsCreated ?? 0, auctionThresholds, 'auction'),
    [profile]
  );
  const earnedWinBadges = useMemo(
    () => getEarnedBadges(profile?.stats?.auctionsWon ?? 0, winThresholds, 'win'),
    [profile]
  );
  const earnedBidBadges = useMemo(
    () => getEarnedBadges(profile?.stats?.totalBids ?? 0, bidThresholds, 'bid'),
    [profile]
  );

  const hasMultipleBadges =
    earnedAuctionBadges.length > 1 || earnedWinBadges.length > 1 || earnedBidBadges.length > 1;

  if (status === 'loading' || loading) return <ProfilePageSkeleton />;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <User className="w-20 h-20 text-gray-400" />
        <p className="text-gray-600 mb-4 text-center text-lg">
          Please sign in to view your profile.
        </p>
        <Button
          onClick={() => signIn('google')}
          className="bg-emerald-500 text-white px-6 py-2 rounded-full hover:bg-emerald-600"
        >
          <LogIn className="w-5 h-5 mr-2" /> Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row p-6 min-h-screen bg-gray-50 gap-6">
      <div className="w-full lg:w-2/3 space-y-6">
        <Card className="bg-white shadow-lg rounded-xl">
          {session ? (
            <>
              <CardHeader className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 hover:scale-105 transition-transform duration-300 ease-in-out">
                  {profile?.image ? (
                    <Image
                      src={profile.image}
                      alt="Profile"
                      width={240}
                      height={240}
                      className="object-cover w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-emerald-400 shadow-md"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-emerald-400 text-white font-bold text-4xl sm:text-7xl border-4 border-emerald-600 shadow-md">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Upload a new profile image"
                  />
                  <div className="absolute bottom-0 right-4 bg-emerald-600 px-3 py-1 rounded-full shadow-md cursor-pointer flex items-center gap-1">
                    <Upload className="w-4 h-4 text-white" />
                    <span className="text-xs text-white hidden sm:inline">Upload Photo</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Joined: <span className="font-semibold">{createdAtFormatted}</span>
                </p>

                <div className="flex items-center justify-center gap-2 mt-2">
                  {!isEditingName ? (
                    <>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {name || 'Your Name'}
                      </h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-gray-500 cursor-pointer hover:text-emerald-600 transition-transform transform hover:scale-110 duration-300"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus
                      className="text-base font-semibold text-center border-b border-emerald-400 bg-transparent focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <span>{session.user.email}</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 flex justify-center gap-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="w-5/12 cursor-pointer sm:w-1/3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transform transition-all duration-200 hover:scale-105"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>

                <Button
                  onClick={() => signOut()}
                  variant="destructive"
                  className="w-5/12 cursor-pointer sm:w-1/3 rounded-full transform transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 p-6">
              <User className="w-20 h-20 text-gray-400" />
              <h2 className="text-2xl font-bold">Welcome!</h2>
              <p className="text-gray-600">Sign in to access your profile</p>
              <Button
                onClick={() => signIn('google')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 py-2 shadow-md"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </div>
          )}
        </Card>
        <RecentActivity />
      </div>

      {/* Achievements & Share Panel */}
      <div className="w-full lg:w-1/3">
        <Card className="p-6 bg-white shadow-lg border rounded-xl">
          <h3 className="text-xl font-bold mb-4 text-center">Auction Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center mb-2">
            {profile && (
              <>
                <StatCard icon={Gavel} label="Total Bids" value={profile.stats.totalBids} />
                <StatCard
                  icon={PlusCircle}
                  label="Auctions Created"
                  value={profile.stats.auctionsCreated}
                />
                <StatCard icon={Trophy} label="Auctions Won" value={profile.stats.auctionsWon} />
              </>
            )}
          </div>

          <h3 className="text-xl font-bold mb-2 text-center">Achievements & Badges</h3>
          <div className="text-center ">
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/badges')}
              className="text-sm text-emerald-600 border-emerald-500"
            >
              <MedalIcon className="text-emerald-600 w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Explore Full
              Badge System
            </Button>
          </div>

          {auctionBadge + winBadge + bidBadge > 0 ? (
            <div className="grid grid-cols-3 justify-items-center mt-4">
              {bidBadge > 0 && <BadgeIcon level={bidBadge} prefix="bid" />}
              {auctionBadge > 0 && <BadgeIcon level={auctionBadge} prefix="auction" />}
              {winBadge > 0 && <BadgeIcon level={winBadge} prefix="win" />}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-4 space-y-3 text-center text-gray-500">
              <Image
                src="/badges/placeholder.png"
                alt="No badges earned"
                width={64}
                height={64}
                className="grayscale opacity-40"
              />
              <p className="text-sm font-medium">No badges yet!</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Start creating auctions, placing bids, and winning to unlock your first badge!
              </p>
              <Link
                href="/auctions"
                className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white text-sm rounded-full hover:bg-emerald-600 transition"
              >
                <Gavel className="w-4 h-4 mr-2" />
                Explore Auctions
              </Link>
            </div>
          )}
          {hasMultipleBadges && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAllBadges(!showAllBadges)}
                className="text-sm"
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

          <Link
            href={`/public-profile/${userId}`}
            target="_blank"
            className="bg-emerald-500 text-center justify-center text-white px-6 py-1 rounded-full hover:bg-emerald-600 transition"
          >
            View Public Profile
          </Link>
          <div className="w-full px-2 overflow-x-hidden">
            <h4 className="text-lg font-semibold text-center mb-2">Share your Public Profile</h4>

            <div className="flex justify-center flex-wrap gap-3 mb-3">
              <WhatsappShareButton url={publicProfileUrl}>
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
              <TelegramShareButton url={publicProfileUrl}>
                <TelegramIcon size={32} round />
              </TelegramShareButton>
              <LinkedinShareButton url={publicProfileUrl}>
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>
            </div>

            <div className="flex flex-col items-center w-full overflow-hidden">
              <div className="relative w-full max-w-[92vw] sm:max-w-[80vw]">
                <div
                  className="hidden sm:block w-full bg-gray-100 border-2 border-dotted border-emerald-400 rounded-full px-4 py-2 text-xs text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis"
                  title={publicProfileUrl}
                >
                  {publicProfileUrl}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(publicProfileUrl);
                  toast.success('Public profile link copied!');
                }}
                className="mt-2 rounded-3xl bg-emerald-100 flex items-center gap-2 text-sm"
              >
                <ClipboardCheckIcon className="w-4 h-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                Copy Link
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="bg-emerald-100 p-4 rounded-lg shadow-sm text-center flex flex-col items-center">
      <Icon className="w-8 h-8 text-emerald-600 mb-2" />
      <p className="text-lg font-bold text-emerald-600">{value}</p>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
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
      <p className="text-xs text-gray-600 mt-1 capitalize">
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
      <h4 className="text-center font-semibold text-gray-700 text-sm mb-2">{title}</h4>
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
            <p className="text-[11px] text-gray-500 italic mt-1">
              🎯 {b.required}+ {title.split(' ')[0].toLowerCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
