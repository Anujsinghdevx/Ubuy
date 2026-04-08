import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = getBearerTokenFromSession(session);

  if (!session || !session.user?.id || !accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, data } = await backendJsonRequest('/v1/auctions/me/bidded', { method: 'GET' }, accessToken);
    const biddedAuctions = Array.isArray(data)
      ? data
      : ((data as { data?: unknown[]; biddedAuctions?: unknown[] })?.data ??
        (data as { data?: unknown[]; biddedAuctions?: unknown[] })?.biddedAuctions ??
        []);
    return NextResponse.json({ biddedAuctions }, { status });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: 'Failed to fetch data', details: errorMessage },
      { status: 500 }
    );
  }
}
