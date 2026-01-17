import dbConnect from '@/lib/dbConnect';
import Auction from '@/models/Auction';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

interface Bidder {
  bidder: {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
  };
  amount: number;
}

interface AuctionWithBidders extends mongoose.Document {
  bidders: Bidder[];
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const isAuthUser = session.user.authProvider === 'AuthUser';
  const UserModel = isAuthUser ? AuthUser : User;

  try {
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const auctionIds = user.biddedauction;

    const currentTime = new Date();
    await Auction.updateMany(
      {
        _id: { $in: auctionIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
        endTime: { $lte: currentTime },
        status: 'active',
      },
      { $set: { status: 'closed' } }
    );

    const auctions = await Auction.find({
      _id: { $in: auctionIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
    }).populate([
      {
        path: 'bidders.bidder',
        select: '_id username email',
      },
    ]);

    if (auctions.length === 0) {
      return NextResponse.json({ error: 'No bidded auctions found for the user' }, { status: 404 });
    }

    // Add winnerId for each auction
    const populatedAuctions = auctions.map((auction) => {
      const sortedBidders = (auction as AuctionWithBidders).bidders.sort(
        (a: Bidder, b: Bidder) => b.amount - a.amount
      );
      const winner = sortedBidders[0]?.bidder;
      return {
        ...auction.toObject(),
        winnerId: winner?._id?.toString() || null,
      };
    });

    return NextResponse.json({ biddedAuctions: populatedAuctions });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: 'Failed to fetch data', details: errorMessage },
      { status: 500 }
    );
  }
}
