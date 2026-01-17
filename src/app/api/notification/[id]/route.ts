import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { params } = context;

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const isAuthUser = session.user.authProvider === 'AuthUser';

  const filter = {
    _id: params.id,
    recipient: session.user.id,
    recipientModel: isAuthUser ? 'AuthUser' : 'User',
  };

  const deleted = await Notification.findOneAndDelete(filter);

  if (!deleted) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Notification deleted' }, { status: 200 });
}
