'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

type WishlistFetchItem = {
  auction?: {
    _id?: string;
  };
  auctionId?: string;
  _id?: string;
};

let wishlistIdCache: Set<string> | null = null;
let wishlistIdCachePromise: Promise<Set<string> | null> | null = null;

const extractWishlistId = (item: WishlistFetchItem): string | null => {
  const candidate = item?.auction?._id || item?.auctionId || item?._id;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
};

const loadWishlistIds = async (): Promise<Set<string> | null> => {
  if (wishlistIdCache) return wishlistIdCache;
  if (wishlistIdCachePromise) return wishlistIdCachePromise;

  wishlistIdCachePromise = (async () => {
    try {
      const res = await fetch('/api/auction/wishlist/fetch', { method: 'GET' });
      if (!res.ok) return null;

      const data = await res.json();
      const list = Array.isArray(data?.wishlist) ? (data.wishlist as WishlistFetchItem[]) : [];
      const ids = new Set<string>();

      for (const item of list) {
        const id = extractWishlistId(item);
        if (id) ids.add(id);
      }

      wishlistIdCache = ids;
      return ids;
    } catch {
      return null;
    } finally {
      wishlistIdCachePromise = null;
    }
  })();

  return wishlistIdCachePromise;
};

interface Auction {
  _id: string;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  category: string;
  endTime: string; // ISO string
  status: 'active' | 'closed';
}

interface AuctionCardProps {
  auction: Auction;
  showWishlist?: boolean;
}

function getRemainingSeconds(endTimeISO: string): number {
  const end = new Date(endTimeISO).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((end - now) / 1000));
}

function formatRemaining(secs: number): string {
  if (secs <= 0) return 'Closed';

  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function AuctionCard({ auction, showWishlist = true }: AuctionCardProps) {
  const [bidInput, setBidInput] = useState('');
  const [remainingSecs, setRemainingSecs] = useState(getRemainingSeconds(auction.endTime));
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!showWishlist || !session) {
      setIsWishlisted(false);
      return;
    }

    let mounted = true;

    const hydrateWishlistedState = async () => {
      const ids = await loadWishlistIds();
      if (!mounted || !ids) return;
      setIsWishlisted(ids.has(auction._id));
    };

    hydrateWishlistedState();

    return () => {
      mounted = false;
    };
  }, [auction._id, session, showWishlist]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSecs(getRemainingSeconds(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  const handleBid = async () => {
    const bidAmount = parseFloat(bidInput);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error('Please enter a valid bid amount.');
      return;
    }

    try {
      const res = await fetch(`/api/auction/bid/${auction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidAmount }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || 'Failed to place bid');

      toast.success('Bid placed successfully!');
      setBidInput('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const toggleWishlist = async () => {
    if (!session) {
      toast('Please log in to add to wishlist.');
      return;
    }

    if (wishlistBusy) return;

    try {
      setWishlistBusy(true);

      if (isWishlisted) {
        const res = await fetch('/api/auction/wishlist/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ auctionId: auction._id }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || data?.message || 'Failed to remove from wishlist');
        }

        setIsWishlisted(false);
        if (wishlistIdCache) {
          wishlistIdCache.delete(auction._id);
        }
        toast(data?.message || 'Removed from wishlist');
        return;
      }

      const res = await fetch('/api/auction/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: auction._id }),
      });
      const data = await res.json();

      if (!res.ok) {
        const message = data?.error || data?.message || 'Failed to add to wishlist';
        if (typeof message === 'string' && message.toLowerCase().includes('already')) {
          setIsWishlisted(true);
          toast('Already in wishlist');
          return;
        }
        throw new Error(message);
      }

      setIsWishlisted(true);
      if (!wishlistIdCache) {
        wishlistIdCache = new Set<string>();
      }
      wishlistIdCache.add(auction._id);
      toast(data?.message || 'Added to wishlist');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setWishlistBusy(false);
    }
  };

  const isClosed = remainingSecs === 0 || auction.status === 'closed';
  const displayTime = isClosed ? 'Closed' : formatRemaining(remainingSecs);

  function getBadgeColor() {
    if (remainingSecs < 3600) return 'bg-red-500';
    else if (remainingSecs < 24 * 3600) return 'bg-yellow-500';
    return 'bg-emerald-500';
  }

  return (
    <Card className="relative bg-white border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden">
      {showWishlist && (
        <div className="absolute top-3 left-3 z-10">
          <Heart
            onClick={toggleWishlist}
            className={`w-6 h-6 text-emerald-500 ${wishlistBusy ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-110'} transition-transform`}
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
          />
        </div>
      )}

      <div
        className={`absolute top-3 right-3 ${getBadgeColor()} text-white text-sm font-semibold px-3 py-1 rounded-full z-10 shadow`}
      >
        {displayTime}
      </div>

      <CardContent className="p-6 space-y-2 sm:space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{auction.title}</h2>
        <p className="text-gray-700">{auction.description}</p>

        {auction.images && auction.images.length > 0 && (
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={auction.images[0]}
              alt={auction.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <strong>Starting Price:</strong> ₹{auction.startingPrice}
          </p>
          <p>
            <strong>Current Price:</strong>{' '}
            <span className="text-emerald-600 text-semibold">₹{auction.currentPrice}</span>
          </p>
          <p>
            <strong>Category:</strong> {auction.category}
          </p>
        </div>

        {!isClosed && (
          <div className="pt-2 space-y-2">
            {session ? (
              <>
                <Input
                  type="number"
                  placeholder="Your Bid (₹)"
                  className="border border-gray-300 bg-white focus:border-emerald-500"
                  value={bidInput}
                  onChange={(e) => setBidInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleBid}
                    className="flex-1 hover:cursor-pointer bg-emerald-500 text-white rounded-full hover:bg-emerald-600"
                  >
                    Place Bid
                  </Button>
                  <div className="flex-1">
                    <Link href={`/auctions/${auction._id}`} passHref>
                      <Button className="w-full hover:cursor-pointer bg-indigo-500 text-white rounded-full hover:bg-indigo-600">
                        Explore More
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => toast('Please log in to place a bid.')}
                  className="flex-1 bg-emerald-400 hover:cursor-pointer text-white rounded-full hover:bg-emerald-500"
                >
                  Log in to Bid
                </Button>
                <div className="flex-1">
                  <Link href={`/auctions/${auction._id}`} passHref>
                    <Button className="w-full hover:cursor-pointer bg-indigo-500 text-white rounded-full hover:bg-indigo-600">
                      Explore More
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
