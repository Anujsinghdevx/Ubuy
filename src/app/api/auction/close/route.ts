import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Auction from '@/models/Auction';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const { auctionId } = body;

  if (!auctionId || !mongoose.Types.ObjectId.isValid(auctionId)) {
    console.error('❌ Invalid ID received:', auctionId);
    return NextResponse.json({ success: false, message: 'Invalid auction ID' }, { status: 400 });
  }

  try {
    if (!auctionId || !mongoose.Types.ObjectId.isValid(auctionId)) {
      return NextResponse.json({ success: false, message: 'Invalid auction ID' }, { status: 400 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const auction = await Auction.findOne({
      _id: auctionId,
      createdBy: userId,
      status: 'active',
    });

    if (!auction) {
      return NextResponse.json(
        {
          success: false,
          message: 'No active auction found for this user',
        },
        { status: 404 }
      );
    }

    // Extra safety check (optional)
    if (auction.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden: You are not the owner of this auction',
        },
        { status: 403 }
      );
    }

    // Close the auction
    auction.status = 'closed';
    auction.endTime = new Date();

    await auction.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Auction closed successfully',
        auction: {
          id: auction._id,
          title: auction.title,
          finalPrice: auction.currentPrice,
          highestBidder: auction.highestBidder,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error closing auction:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
