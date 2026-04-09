'use client';

import { useSession } from 'next-auth/react';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';
import type { NewBidEvent } from '@/types/socket';

interface BidData {
  _id: string;
  bidder: {
    _id: string;
    name: string;
  };
  amount: number;
  bidTime: string;
}

const toBidData = (payload: NewBidEvent): BidData => {
  return {
    _id: payload._id || `${Date.now()}`,
    bidder: {
      _id: payload.bidder?._id || payload.bidderId || payload.userId || '',
      name: payload.bidderName || payload.bidder?.name || 'Anonymous',
    },
    amount: Number.isFinite(payload.amount) ? payload.amount : 0,
    bidTime: payload.bidTime || new Date().toISOString(),
  };
};

export default function BidSocket({
  auctionId,
  onBidReceived,
}: {
  auctionId: string;
  onBidReceived: (data: BidData) => void;
}) {
  const { data: session } = useSession();

  useAuctionSocket({
    auctionId,
    token: session?.accessToken || session?.user?.accessToken || null,
    onNewBid: (data) => onBidReceived(toBidData(data)),
  });

  return null;
}
