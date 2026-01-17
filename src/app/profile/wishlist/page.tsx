'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { getRemainingTime } from '@/utils/time';
import AuctionCardSkeleton from '@/components/Skeleton/AuctionCardSkeleton';

interface Auction {
  _id: string;
  title: string;
  description: string;
  startingPrice: number;
  images: string[];
  currentPrice: number;
  category: string;
  endTime: string;
}

const ITEMS_PER_PAGE = 9;

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auction/wishlist/fetch');
      const data = await res.json();
      if (res.ok) {
        interface WishlistItem {
          auction: Auction;
        }
        const auctions = (data.wishlist as WishlistItem[]).map(
          (item: WishlistItem): Auction => ({
            _id: item.auction._id,
            title: item.auction.title,
            description: item.auction.description,
            images: item.auction.images,
            currentPrice: item.auction.currentPrice,
            category: item.auction.category,
            startingPrice: item.auction.startingPrice,
            endTime: item.auction.endTime,
          })
        );
        setWishlist(auctions);
      } else {
        toast.error(data.error || 'Failed to fetch wishlist');
      }
    } catch (err) {
      console.error('Error fetching wishlist', err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Timer update effect
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimes: { [key: string]: string } = {};
      wishlist.forEach((auction) => {
        updatedTimes[auction._id] = getRemainingTime(auction.endTime);
      });
      setRemainingTimes(updatedTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [wishlist]);

  const handleRemove = async (auctionId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove');

      setWishlist((prev) => prev.filter((a) => a._id !== auctionId));
      toast.success(data.message || 'Removed from wishlist');
    } catch (err) {
      console.error('Error removing from wishlist', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(wishlist.length / ITEMS_PER_PAGE);
  const paginatedWishlist = wishlist.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 py-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600 mt-2">Your saved auctions</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-sm sm:w-full px-8 sm:px-4 max-w-6xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <AuctionCardSkeleton key={i} />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <p className="text-gray-500">No items in your wishlist yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 sm:px-6 lg:px-4 max-w-6xl mx-auto">
            {paginatedWishlist.map((auction) => (
              <Card
                key={auction._id}
                className="relative bg-white/10 border border-emerald-400/40 shadow-lg rounded-2xl overflow-hidden"
              >
                {/* Time Badge - top right */}
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-sm font-semibold px-3 py-1 rounded-full z-10 shadow">
                  {remainingTimes[auction._id] || 'Calculating...'}
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
                      <strong>Current Price:</strong> ₹{auction.currentPrice}
                    </p>
                    <p>
                      <strong>Category:</strong> {auction.category}
                    </p>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Button
                      onClick={() => handleRemove(auction._id)}
                      className="w-full bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      Remove from Wishlist
                    </Button>

                    <Link href={`/auctions/${auction._id}`} passHref>
                      <Button className="w-full bg-emerald-500 text-white rounded-full hover:bg-emerald-600">
                        Explore More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-10 space-x-4">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-gray-700">{`Page ${currentPage} of ${totalPages}`}</span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
