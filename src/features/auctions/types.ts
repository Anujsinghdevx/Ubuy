export type AuctionStatus = 'active' | 'closed';

export interface Auction {
  _id: string;
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  category: string;
  highestBidder?: string;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  createdBy: string;
}
