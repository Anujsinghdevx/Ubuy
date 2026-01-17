import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Auction from '@/models/Auction';
import { isValidObjectId } from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: 'Invalid auction ID' }, { status: 400 });
  }

  try {
    const auction = await Auction.findById(id).populate('bidders.bidder', 'name email');

    if (!auction) {
      return NextResponse.json({ success: false, message: 'Auction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, auction }, { status: 200 });
  } catch (error) {
    console.error('Error fetching auction:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
