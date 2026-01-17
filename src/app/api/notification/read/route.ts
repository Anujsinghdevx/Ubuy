import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';
import { NextResponse } from 'next/server';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const isAuthUser = session.user.authProvider === 'AuthUser';
    const UserModel = isAuthUser ? AuthUser : User;

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mark all unread notifications as read
    const result = await Notification.updateMany(
      {
        recipient: session.user.id,
        recipientModel: isAuthUser ? 'AuthUser' : 'User',
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    // Return success response
    return NextResponse.json({ message: 'Notifications marked as read', result }, { status: 200 });
  } catch (error) {
    console.error('Error marking notifications:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications', details: (error as Error).message },
      { status: 500 }
    );
  }
}
