export type AuctionEventPayload = Record<string, unknown>;

export type SocketUserRef = {
  _id?: string;
  name?: string;
};

export type NewBidEvent = {
  auctionId: string;
  amount: number;
  userId?: string;
  bidderId?: string;
  bidderName?: string;
  bidTime?: string;
  _id?: string;
  bidder?: SocketUserRef;
};

export type OutBidEvent = {
  auctionId: string;
  previousAmount?: number;
  newAmount?: number;
  outbidBy?: string;
  amount?: number;
  message?: string;
};

export type NotificationNewEvent = {
  auctionId?: string;
  message?: string;
  title?: string;
  type?: string;
};

export type AuctionEndedEvent = {
  auctionId: string;
  status?: string;
  endTime?: string;
};

export type AuctionWinnerChangedEvent = {
  auctionId: string;
  currentPrice?: number;
  winnerId?: string;
  winnerName?: string;
};

export type PaymentConfirmedEvent = {
  auctionId: string;
  paymentStatus?: string;
};

export type AuctionCancelledEvent = {
  auctionId: string;
  reason?: string;
  status?: string;
};

export type AuctionDeletedEvent = {
  auctionId: string;
  message?: string;
};

export type PlaceBidInput = {
  auctionId: string;
  amount: number;
};

export type PlaceBidAckSuccess = {
  ok: true;
  data: AuctionEventPayload;
};

export type PlaceBidAckFailure = {
  ok: false;
  error: string;
};

export type PlaceBidAck = PlaceBidAckSuccess | PlaceBidAckFailure;
