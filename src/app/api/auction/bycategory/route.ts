import dbConnect from '@/lib/dbConnect';
import { NextResponse } from 'next/server';
import Auction from '@/models/Auction';
import '@/models/User';
import '@/models/AuthUser';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Missing category parameter' }, { status: 400 });
    }

    // Fetch auctions for the specified category
    const auctions = await Auction.find({ category }).sort({ endTime: -1 });

    // Populate the createdBy and bidders.bidder fields
    await Auction.populate(auctions, [
      {
        path: 'createdBy',
        select: 'username email provider',
      },
      {
        path: 'bidders.bidder',
        select: 'username email provider',
      },
    ]);

    return NextResponse.json(auctions, { status: 200 });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: 'Failed to fetch auctions', details: errorMessage },
      { status: 500 }
    );
  }
}
