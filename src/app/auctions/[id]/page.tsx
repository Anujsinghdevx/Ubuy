'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IndianRupee, Timer, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import BiddersTable from '@/components/BiddersTable';
import { getSession } from 'next-auth/react';
import Pusher from 'pusher-js';
import AuctionDetailSkeleton from '@/components/Skeleton/AuctionDetailSkeleton';

type Bidder = {
  _id: string;
  bidderName: string;
  amount: number;
  bidTime: string;
  bidder: { _id: string };
};

type Auction = {
  _id: string;
  title: string;
  description: string;
  images: string[];
  currentPrice: number;
  startingPrice: number;
  category: string;
  endTime: string;
  status: string;
  bidders: Bidder[];
  createdBy: string; // only the ID
};

type Creator = {
  _id: string;
  name: string;
  image?: string;
};

export default function AuctionDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [creatorData, setCreatorData] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidInputs, setBidInputs] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      if (!auction?.endTime) return;

      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Auction ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [auction?.endTime]);

  const handleBid = async (id: string) => {
    const bidAmount = parseFloat(bidInputs[id]);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error('Please enter a valid bid amount.');
      return;
    }

    try {
      const res = await fetch(`/api/auction/bid/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidAmount }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to place bid');

      toast.success('Bid placed successfully!');

      const updatedRes = await fetch(`/api/auction/${id}/details`);
      const updatedData = await updatedRes.json();
      if (updatedData.success) {
        setAuction(updatedData.auction);

        // fetch creator info
        if (updatedData.auction.createdBy) {
          const creatorRes = await fetch(`/api/public/${updatedData.auction.createdBy}`);
          const creatorJson = await creatorRes.json();
          if (creatorJson.success) setCreatorData(creatorJson.user);
        }
      }

      setBidInputs({ ...bidInputs, [id]: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      if (session && session.user) setCurrentUserId(session.user.id);
    }
    fetchSession();
  }, []);

  useEffect(() => {
    async function fetchAuction() {
      setLoading(true);
      try {
        const res = await fetch(`/api/auction/${id}/details`);
        const data = await res.json();
        if (data.success) {
          setAuction(data.auction);

          // fetch creator info
          if (data.auction.createdBy) {
            const creatorRes = await fetch(`/api/auction/public/${data.auction.createdBy}`);
            const creatorJson = await creatorRes.json();
            if (creatorJson.success) setCreatorData(creatorJson.user);
          }
        }
      } catch (err) {
        console.error('Failed to fetch auction:', err);
      }
      setLoading(false);
    }

    if (id) fetchAuction();
  }, [id]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'default-cluster',
    });

    const channel = pusher.subscribe(`auction-${id}`);
    channel.bind('new-bid', (data: Bidder) => {
      setAuction((prevAuction) => {
        if (prevAuction) {
          const updatedBidders = [...prevAuction.bidders, data];
          return {
            ...prevAuction,
            currentPrice: data.amount,
            bidders: updatedBidders,
          };
        }
        return prevAuction;
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (auction?.images && auction.images.length > 0) {
      setSelectedImage(auction.images[0]);
    }
  }, [auction]);

  if (loading) {
    return <AuctionDetailSkeleton />;
  }

  if (!auction) {
    return <div className="text-center mt-10 text-gray-500">Auction not found.</div>;
  }

  const getIncrementOptions = (currentBid: number): number[] => {
    if (currentBid < 100) return [5, 10, 20];
    if (currentBid < 1000) return [10, 20, 50];
    if (currentBid < 5000) return [100, 200, 500];
    return [500, 1000, 2000];
  };

  const isClosed = auction.status === 'closed';
  const winner = isClosed
    ? auction.bidders.reduce((prev, current) => (prev.amount > current.amount ? prev : current))
    : null;
  const isWinner = winner && winner.bidder._id.toString() === currentUserId;

  return (
    <div className="mx-auto p-4 sm:p-6 lg:px-16 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side Image Viewer */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-4">
          {/* Thumbnails */}
          <div className="flex lg:flex-col sm:gap-2 overflow-x-auto lg:overflow-y-auto">
            {auction.images.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`relative flex-shrink-0 w-20 h-20 border rounded cursor-pointer overflow-hidden ${
                  selectedImage === imgUrl ? 'ring-2 ring-emerald-500' : 'border-gray-300'
                }`}
                onClick={() => setSelectedImage(imgUrl)}
              >
                <Image src={imgUrl} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div
            className="flex-1 relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300 cursor-zoom-in"
            onClick={() => setZoomedImage(selectedImage)}
          >
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={auction.title}
                fill
                className="object-contain"
                sizes="100vw, 33vw"
              />
            )}
          </div>
        </div>

        {/* Right Side Content */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{auction.title}</h1>
          <p className="text-gray-600">{auction.description}</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Tag className="text-purple-500" /> Category:{' '}
              <span className="font-medium text-gray-600">{auction.category}</span>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <IndianRupee className="text-blue-500" /> Starting Price: ₹{auction.startingPrice}
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <IndianRupee className="text-green-600" /> Current Price: ₹{auction.currentPrice}
            </div>
            <div className="flex items-center gap-2 text-red-600 text-lg font-semibold">
              <Timer className="text-orange-500" /> Time Left: {timeLeft}
            </div>
          </div>

          {creatorData && (
            <div className="mt-6 flex items-center justify-between rounded-2xl border p-4 bg-white shadow-sm">
              <div className="flex items-center space-x-4">
                {creatorData.image ? (
                  <Image
                    src={creatorData.image}
                    alt={creatorData.name}
                    width={60}
                    height={60}
                    className="rounded-full object-cover border shadow"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-400 text-white flex items-center justify-center font-bold text-lg">
                    {creatorData.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Created by</p>
                  <p className="text-lg font-bold text-emerald-600 uppercase">{creatorData.name}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => (window.location.href = `/public-profile/${creatorData._id}`)}
                className="rounded-full px-4 py-2"
              >
                View Public Profile
              </Button>
            </div>
          )}

          {!isClosed && (
            <div className="pt-4 space-y-4">
              <Input
                type="number"
                placeholder="Your Bid (₹)"
                className="border border-gray-300 focus:border-emerald-500 px-4 py-3 rounded-lg text-base"
                value={bidInputs[auction._id] || ''}
                onChange={(e) => setBidInputs({ ...bidInputs, [auction._id]: e.target.value })}
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Button
                  onClick={() => handleBid(auction._id)}
                  className="w-full sm:w-auto bg-emerald-500 text-white rounded-full px-6 py-3 text-base font-semibold hover:bg-emerald-600 transition duration-200"
                >
                  Place Bid
                </Button>

                <div className="flex items-center justify-center flex-col sm:flex-row w-full sm:w-auto bg-emerald-500 p-1 rounded-2xl gap-3">
                  <p className="text-white font-semibold text-center sm:text-left text-base">
                    Quick Bid: <span className="font-normal">Choose an increment</span>
                  </p>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-center">
                    {getIncrementOptions(auction.currentPrice).map((inc) => (
                      <Button
                        key={inc}
                        variant="outline"
                        onClick={() =>
                          setBidInputs({
                            ...bidInputs,
                            [auction._id]: (
                              (parseFloat(bidInputs[auction._id]) || auction.currentPrice) + inc
                            ).toString(),
                          })
                        }
                        className="rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-150"
                      >
                        +₹{inc}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isClosed && winner && (
            <div className="border-t border-gray-300 mt-6 py-4">
              {isWinner ? (
                <p className="text-green-600 text-base sm:text-lg font-semibold text-center mt-4">
                  You have won the auction! Congratulations!
                </p>
              ) : (
                <p className="text-base sm:text-lg font-semibold text-center">
                  The auction has ended. The winner is <strong>{winner.bidderName}</strong>.
                </p>
              )}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden mt-6">
            <h2 className="bg-gray-100 border flex justify-center px-4 py-2 font-semibold tracking-wide text-xl md:text-2xl">
              Top 5 Bidders
            </h2>
            <BiddersTable bidders={auction.bidders} />
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-3xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute cursor-pointer z-50 top-4 sm:top-0 sm:right-0 right-4 text-white bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition"
            >
              <X className=" w-6 h-6 z-50" />
            </button>
            <div className="relative w-full h-[80vh]">
              <Image src={zoomedImage} alt="Zoomed" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
