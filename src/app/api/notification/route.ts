import { getServerSession } from 'next-auth';
import { authOptions } from '../(user-auth)/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = getBearerTokenFromSession(session);

  if (!session || !session.user?.id || !accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, data } = await backendJsonRequest('/v1/notifications', { method: 'GET' }, accessToken);
    const notifications = Array.isArray(data)
      ? data
      : ((data as { items?: unknown[]; notifications?: unknown[] })?.items ??
        (data as { items?: unknown[]; notifications?: unknown[] })?.notifications ??
        []);

    return NextResponse.json({ notifications }, { status });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: (error as Error).message },
      { status: 500 }
    );
  }
}
