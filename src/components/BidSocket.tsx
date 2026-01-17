'use client';

import { useEffect } from 'react';
import Pusher from 'pusher-js';

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
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`auction-${auctionId}`);

    channel.bind('new-bid', (data: BidData) => {
      onBidReceived(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [auctionId, onBidReceived]);

  return null;
}
