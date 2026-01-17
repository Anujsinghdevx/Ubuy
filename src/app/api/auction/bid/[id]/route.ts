import dbConnect from '@/lib/dbConnect';
import Auction from '@/models/Auction';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../(user-auth)/auth/[...nextauth]/options';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';
import Notification from '@/models/Notification';

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id: auctionId } = params;
  const session = await getServerSession(authOptions);

  // Unauthorized if no session or user email
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ensure the user has a valid ID and username
  if (!session.user.id || !session.user.username) {
    return NextResponse.json({ error: 'User data incomplete' }, { status: 400 });
  }

  await dbConnect();

  // Validate auctionId
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    return NextResponse.json({ error: 'Invalid Auction ID' }, { status: 400 });
  }

  // Get the request body
  const body = await req.json();
  const { bidAmount } = body;

  // Validate bidAmount
  if (typeof bidAmount !== 'number' || bidAmount <= 0) {
    return NextResponse.json({ error: 'Invalid bid amount' }, { status: 400 });
  }

  // Find the auction by ID
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
  }

  // Prevent owner from bidding on own auction
  if (auction.createdBy.toString() === session.user.id) {
    return NextResponse.json({ error: 'You cannot bid on your own auction' }, { status: 403 });
  }

  // Auto-close auction if expired
  const currentTime = new Date();
  if (new Date(auction.endTime) <= currentTime) {
    auction.status = 'closed';
    await auction.save();
    return NextResponse.json({ error: 'Auction has ended and is now closed' }, { status: 403 });
  }

  // Ensure auction is not closed
  if (auction.status === 'closed') {
    return NextResponse.json({ error: 'Auction is closed' }, { status: 403 });
  }

  // Ensure bid is higher than current price
  if (bidAmount <= auction.currentPrice) {
    return NextResponse.json(
      { error: 'Bid must be higher than the current price' },
      { status: 400 }
    );
  }

  // Before adding the new bid, check if the latest bid is from the same user
  const lastBidder = auction.bidders[auction.bidders.length - 1];
  if (lastBidder && lastBidder.bidder.toString() === session.user.id) {
    return NextResponse.json({ error: 'You cannot place consecutive bids .' }, { status: 400 });
  }

  //sending notification to the previous highest bidder
  const previousBidderId = lastBidder?.bidder;
  const previousBidderModel = lastBidder?.bidderModel;

  if (
    previousBidderId &&
    previousBidderId.toString() !== session.user.id // avoid notifying self
  ) {
    await Notification.create({
      recipient: previousBidderId,
      recipientModel: previousBidderModel,
      type: 'bid',
      message: `You've been outbid on an auction. New highest bid: ₹${bidAmount}`,
      relatedAuction: auction._id,
    });

    await pusher.trigger(`user-${previousBidderId}`, 'outbid', {
      message: `You've been outbid. New highest bid: ₹${bidAmount}`,
      auctionId: auction._id,
    });
  }

  //sending notification to the current highest bidder
  await Notification.create({
    recipient: session.user.id,
    recipientModel: session.user.authProvider,
    type: 'bid',
    message: `Your bid of ₹${bidAmount} was placed successfully.`,
    relatedAuction: auction._id,
  });

  console.log('Notification sent to current bidder:', session.user.id);

  // Add the bidder to the auction
  auction.bidders.push({
    bidder: session.user.id,
    amount: bidAmount,
    bidTime: new Date(),
    bidderName: session.user.username,
    bidderModel: session.user.authProvider,
  });

  // Update the auction's current price and highest bidder
  auction.currentPrice = bidAmount;
  auction.highestBidder = session.user.username;

  // Save the updated auction
  await auction.save();

  // Update User and AuthUser documents if auctionId not present in biddedauction
  const updateQuery = { $addToSet: { biddedauction: auctionId } };

  let updateResult;
  if (session.user.authProvider === 'AuthUser') {
    updateResult = await AuthUser.updateOne({ _id: session.user.id }, updateQuery);
  } else {
    updateResult = await User.updateOne({ _id: session.user.id }, updateQuery);
  }

  console.log('Update result:', updateResult);

  // Find the latest bid (the one we just added)
  const latestBid = auction.bidders[auction.bidders.length - 1];

  // Send complete bid info to frontend
  await pusher.trigger(`auction-${auctionId}`, 'new-bid', {
    _id: latestBid._id,
    amount: latestBid.amount,
    bidTime: latestBid.bidTime,
    bidderName: latestBid.bidderName,
  });

  // Return success response
  return NextResponse.json({
    message: 'Bid placed successfully',
    currentPrice: auction.currentPrice,
  });
}
