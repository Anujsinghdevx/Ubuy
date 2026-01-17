import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import Auction from '@/models/Auction';
import mongoose from 'mongoose';

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const { auctionId } = await request.json();

    if (!auctionId || !mongoose.Types.ObjectId.isValid(auctionId)) {
      return NextResponse.json({ error: 'Invalid auction ID' }, { status: 400 });
    }

    const objectId = new mongoose.Types.ObjectId(session.user.id);

    // ✅ Check if the auction belongs to the logged-in user
    const auction = await Auction.findOne({ _id: auctionId, createdBy: objectId });

    if (!auction) {
      return NextResponse.json({ error: 'No auction found for this user' }, { status: 404 });
    }

    // ✅ Delete the auction
    await Auction.deleteOne({ _id: auctionId });

    return NextResponse.json({ message: 'Auction deleted successfully!' }, { status: 200 });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: 'Failed to delete auction', details: errorMessage },
      { status: 500 }
    );
  }
}
