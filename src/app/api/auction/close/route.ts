import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = getBearerTokenFromSession(session);

  if (!session || !session.user?.id || !accessToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const auctionId = body?.auctionId;
    const { status, data } = await backendJsonRequest(
      `/v1/auctions/${encodeURIComponent(auctionId)}/end`,
      {
        method: 'POST',
      },
      accessToken
    );
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error closing auction:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
