import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = getBearerTokenFromSession(session);

  if (!session || !session.user?.id || !accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, data } = await backendJsonRequest(
      '/v1/notifications/read-all',
      { method: 'PATCH' },
      accessToken
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error marking notifications:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications', details: (error as Error).message },
      { status: 500 }
    );
  }
}
