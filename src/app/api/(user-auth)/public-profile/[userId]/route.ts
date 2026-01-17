import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';
import Auction from '@/models/Auction';
import mongoose, { Types } from 'mongoose';

interface Bidder {
  bidder: Types.ObjectId;
  amount: number;
  _id: string;
}

interface AuctionPopulated {
  bidders: Bidder[];
  winner?: Types.ObjectId;
  _id: string;
}

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    await dbConnect();
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let user = await User.findById(userId).select('name createdAt image biddedauction');

    if (!user) {
      user = await AuthUser.findById(userId).select('name createdAt image biddedauction');
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Bidstats calculation
    const auctionIds = user.biddedauction || [];
    const validAuctionIds = auctionIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));

    let auctions: AuctionPopulated[] = [];

    if (validAuctionIds.length > 0) {
      auctions = await Auction.find({
        _id: { $in: validAuctionIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
      }).populate([
        {
          path: 'bidders.bidder',
          select: '_id username email',
        },
      ]);
    }

    const totalBids = auctions.reduce(
      (total: number, auction: AuctionPopulated) =>
        total +
        auction.bidders.filter((bid: Bidder) => bid.bidder && bid.bidder.equals(user._id)).length,
      0
    );

    const auctionsCreated = await Auction.countDocuments({ createdBy: user._id });

    const auctionsWon = auctions.filter(
      (auction) => auction.winner?.toString() === user._id.toString()
    ).length;

    const username = user.name || 'Unnamed User';
    const profileImage = user.image;
    const createdAtFormatted = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'N/A';

    return NextResponse.json(
      {
        id: user._id,
        username,
        profileImage,
        createdAt: createdAtFormatted,
        stats: {
          totalBids,
          auctionsCreated,
          auctionsWon,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public profile', details: (error as Error).message },
      { status: 500 }
    );
  }
}
