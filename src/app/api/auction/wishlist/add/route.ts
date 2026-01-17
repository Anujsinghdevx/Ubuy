import dbConnect from '@/lib/dbConnect';
import Auction from '@/models/Auction';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';
import Wishlist from '@/models/Wishlist';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../(user-auth)/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      console.error('Unauthorized access: No session or user id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auctionId } = await req.json();

    if (!auctionId || !mongoose.Types.ObjectId.isValid(auctionId)) {
      console.error('Invalid or missing auctionId:', auctionId);
      return NextResponse.json({ error: 'Invalid auctionId' }, { status: 400 });
    }

    await dbConnect();

    const isAuthUser = session.user.authProvider === 'AuthUser';
    const UserModel = isAuthUser ? AuthUser : User;

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      console.error('User not found for id:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      console.error('Auction not found for id:', auctionId);
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Check if already in wishlist
    const existingEntry = await Wishlist.findOne({
      user: user._id,
      auction: auction._id,
    });

    if (existingEntry) {
      console.log('Auction already in wishlist for user:', user._id);
      return NextResponse.json({ message: 'Auction already in wishlist' }, { status: 200 });
    }

    // Add to wishlist
    await Wishlist.create({
      user: user._id,
      userModel: isAuthUser ? 'AuthUser' : 'User',
      auction: auction._id,
    });

    return NextResponse.json(
      { message: 'Auction added to wishlist successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to add to wishlist', details: errorMessage },
      { status: 500 }
    );
  }
}
