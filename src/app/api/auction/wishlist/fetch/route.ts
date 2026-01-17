import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';
import Wishlist from '@/models/Wishlist';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../(user-auth)/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      console.error('Unauthorized access: No session or user id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const isAuthUser = session.user.authProvider === 'AuthUser';
    const UserModel = isAuthUser ? AuthUser : User;

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      console.error('User not found for id:', session.user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch wishlist items for user
    const wishlistItems = await Wishlist.find({ user: user._id })
      .populate({
        path: 'auction',
        populate: {
          path: 'createdBy',
          select: '_id username email',
        },
      })
      .sort({ addedAt: -1 });

    // Always return an array, even if empty
    return NextResponse.json({ wishlist: wishlistItems || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch wishlist', details: errorMessage },
      { status: 500 }
    );
  }
}
