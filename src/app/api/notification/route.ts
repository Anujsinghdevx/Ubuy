import { getServerSession } from 'next-auth';
import { authOptions } from '../(user-auth)/auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  // Check if session exists and user ID is available
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const isAuthUser = session.user.authProvider === 'AuthUser';
    const UserModel = isAuthUser ? AuthUser : User;

    // Fetch the user based on the session
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch notifications for the user
    const notifications = await Notification.find({
      recipient: session.user.id,
      recipientModel: isAuthUser ? 'AuthUser' : 'User',
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: (error as Error).message },
      { status: 500 }
    );
  }
}
