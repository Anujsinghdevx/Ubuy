import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import Auction from '@/models/Auction';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import mongoose from 'mongoose';

export async function GET() {
  const session = await getServerSession(authOptions);

  // ✅ Check for valid session and id
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const userId = session.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    // ✅ Auto-close user's expired auctions
    const currentTime = new Date();
    await Auction.updateMany(
      {
        createdBy: objectId,
        endTime: { $lte: currentTime },
        status: 'active',
      },
      { $set: { status: 'closed' } }
    );

    // ✅ Fetch user's auctions
    const auctions = await Auction.find({ createdBy: objectId });

    return NextResponse.json(auctions, { status: 200 });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: 'Failed to fetch data', details: errorMessage },
      { status: 500 }
    );
  }
}
