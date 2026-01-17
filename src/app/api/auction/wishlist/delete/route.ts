import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';
import Wishlist from '@/models/Wishlist';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../(user-auth)/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function DELETE(req: Request) {
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

    // Delete wishlist entry
    const deleted = await Wishlist.findOneAndDelete({
      user: user._id,
      auction: auctionId,
    });

    if (!deleted) {
      console.error('Wishlist entry not found for deletion. AuctionId:', auctionId);
      return NextResponse.json({ error: 'Wishlist entry not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Auction removed from wishlist successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting from wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to remove from wishlist', details: errorMessage },
      { status: 500 }
    );
  }
}
