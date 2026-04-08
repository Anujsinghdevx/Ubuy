'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IndianRupee, Timer, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import BiddersTable from '@/components/BiddersTable';
import { useSession } from 'next-auth/react';
import AuctionDetailSkeleton from '@/components/Skeleton/AuctionDetailSkeleton';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';

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
  paymentStatus?: string;
};

type Creator = {
  _id: string;
  name: string;
  image?: string;
};

const normalizeCreator = (raw: unknown): Creator | null => {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const id = String(record._id ?? record.id ?? '');
  const name = String(record.name ?? record.username ?? '').trim();
  const image =
    typeof record.image === 'string'
      ? record.image
      : typeof record.profileImage === 'string'
        ? record.profileImage
        : undefined;

  if (!id) return null;
  return {
    _id: id,
    name: name || 'User',
    image,
  };
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
};

export default function AuctionDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: session } = useSession();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [creatorData, setCreatorData] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidInputs, setBidInputs] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const socketToken = session?.accessToken || session?.user?.accessToken || null;

  useAuctionSocket({
    auctionId: id,
    token: socketToken,
    onNewBid: (data) => {
      const bidderRecord = toRecord(data.bidder);
      setAuction((prevAuction) => {
        if (!prevAuction) return prevAuction;

        const amount = typeof data.amount === 'number' ? data.amount : Number(data.amount);
        const bidTime =
          typeof data.bidTime === 'string' ? data.bidTime : new Date().toISOString();
        const bidderName =
          typeof data.bidderName === 'string'
            ? data.bidderName
            : typeof bidderRecord?.name === 'string'
              ? bidderRecord.name
              : 'Anonymous';
        const bidderId =
          typeof bidderRecord?._id === 'string'
            ? bidderRecord._id
            : typeof data.bidderId === 'string'
              ? data.bidderId
              : '';

        const newBid = {
          _id: String(data._id || `${Date.now()}`),
          bidderName,
          amount: Number.isFinite(amount) ? amount : prevAuction.currentPrice,
          bidTime,
          bidder: { _id: String(bidderId) },
        };

        return {
          ...prevAuction,
          currentPrice: newBid.amount,
          bidders: [...prevAuction.bidders, newBid],
        };
      });
    },
    onNotificationNew: (data) => {
      const message =
        typeof data.message === 'string' ? data.message : 'You have a new notification.';
      toast(message);
    },
    onOutBid: (data) => {
      const amount = typeof data.amount === 'number' ? data.amount : Number(data.amount);
      setAuction((prevAuction) =>
        prevAuction
          ? {
              ...prevAuction,
              currentPrice: Number.isFinite(amount) ? amount : prevAuction.currentPrice,
            }
          : prevAuction
      );
      toast.error(
        typeof data.message === 'string' ? data.message : 'You have been outbid.'
      );
    },
    onAuctionEnded: () => {
      setAuction((prevAuction) =>
        prevAuction
          ? {
              ...prevAuction,
              status: 'closed',
            }
          : prevAuction
      );
      toast('Auction ended.');
    },
    onAuctionWinnerChanged: (data) => {
      setAuction((prevAuction) =>
        prevAuction
          ? {
              ...prevAuction,
              status: 'closed',
              currentPrice:
                typeof data.currentPrice === 'number'
                  ? data.currentPrice
                  : prevAuction.currentPrice,
            }
          : prevAuction
      );
      toast('Auction winner updated.');
    },
    onPaymentConfirmed: () => {
      setAuction((prevAuction) =>
        prevAuction
          ? {
              ...prevAuction,
              paymentStatus: 'PAID',
            }
          : prevAuction
      );
      toast.success('Payment confirmed.');
    },
    onAuctionCancelled: () => {
      setAuction((prevAuction) =>
        prevAuction
          ? {
              ...prevAuction,
              status: 'closed',
            }
          : prevAuction
      );
      toast.error('Auction cancelled.');
    },
    onAuctionDeleted: () => {
      toast.error('Auction deleted.');
      window.location.href = '/auctions';
    },
  });

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
      if (!res.ok) throw new Error(result.error || result.message || 'Failed to place bid');

      toast.success('Bid placed successfully!');

      const updatedRes = await fetch(`/api/auction/${id}/details`);
      const updatedData = await updatedRes.json();
      if (updatedData.success) {
        setAuction(updatedData.auction);

        // fetch creator info
        if (updatedData.auction.createdBy) {
          const creatorRes = await fetch(`/api/auction/public/${updatedData.auction.createdBy}`);
          const creatorJson = await creatorRes.json();
          if (creatorJson.success) setCreatorData(normalizeCreator(creatorJson.user));
        }
      }

      setBidInputs({ ...bidInputs, [id]: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handlePayHere = async () => {
    if (!auction?._id) return;

    try {
      setPaymentProcessing(true);
      toast.loading('Generating payment link...', { id: 'payment' });

      const returnUrl = `${window.location.origin}/payments/status?auctionId=${encodeURIComponent(
        auction._id
      )}`;
      const notifyUrl = process.env.NEXT_PUBLIC_PAYMENT_NOTIFY_URL;

      const res = await fetch('/api/auction/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId: auction._id,
          customerPhone: '9999999999',
          returnUrl,
          ...(notifyUrl ? { notifyUrl } : {}),
          sendSms: true,
          sendEmail: true,
        }),
      });

      const data = (await res.json()) as { payment_link?: string; error?: string };
      toast.dismiss('payment');

      if (res.ok && data.payment_link) {
        toast.success('Redirecting...');
        window.location.href = data.payment_link;
      } else {
        toast.error(data.error || 'Failed to generate payment link.');
      }
    } catch (error) {
      toast.dismiss('payment');
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setPaymentProcessing(false);
    }
  };

  useEffect(() => {
    async function fetchSession() {
      if (session?.user) setCurrentUserId(session.user.id);
    }
    fetchSession();
  }, [session]);

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
            if (creatorJson.success) setCreatorData(normalizeCreator(creatorJson.user));
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

  const isClosed =
    auction.status === 'closed' || new Date(auction.endTime).getTime() <= Date.now();
  const winner = isClosed && auction.bidders.length > 0
    ? auction.bidders.reduce((prev, current) => (prev.amount > current.amount ? prev : current))
    : null;
  const isWinner = winner && winner.bidder._id.toString() === currentUserId;
  const canShowPayButton =
    Boolean(isWinner) &&
    auction.paymentStatus !== 'PAID' &&
    auction.paymentStatus !== 'completed';
  const isPaymentCompleted =
    auction.paymentStatus === 'PAID' || auction.paymentStatus === 'completed';

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
                    {(creatorData.name?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Created by</p>
                  <p className="text-lg font-bold text-emerald-600 uppercase">{creatorData.name}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const profilePath = creatorData?._id ? `/public-profile/${creatorData._id}` : '';
                  if (!profilePath) return;
                  window.open(profilePath, '_blank', 'noopener,noreferrer');
                }}
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
                <div className="flex flex-col items-center gap-3 mt-4">
                  <p className="text-green-600 text-base sm:text-lg font-semibold text-center">
                    You have won the auction! Congratulations!
                  </p>
                  {isPaymentCompleted && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 border border-emerald-300">
                      Payment completed
                    </span>
                  )}
                  {canShowPayButton && (
                    <Button
                      className="bg-purple-600 text-white hover:bg-purple-700"
                      disabled={paymentProcessing}
                      onClick={handlePayHere}
                    >
                      {paymentProcessing ? 'Redirecting...' : 'Pay Here'}
                    </Button>
                  )}
                </div>
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
