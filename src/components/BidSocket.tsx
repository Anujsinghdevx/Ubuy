'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';

interface BidData {
  _id: string;
  bidder: {
    name: string;
  };
  amount: number;
  bidTime: string;
}

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
    onNewBid: (data) => onBidReceived(data as unknown as BidData),
  });

  return null;
}
