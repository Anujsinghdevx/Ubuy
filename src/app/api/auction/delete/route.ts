import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = getBearerTokenFromSession(session);

  if (!session || !session.user?.id || !accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { auctionId } = await request.json();
    const { status, data } = await backendJsonRequest(
      `/v1/auctions/${encodeURIComponent(auctionId)}/cancel`,
      {
        method: 'POST',
      },
      accessToken
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: 'Failed to delete auction', details: errorMessage },
      { status: 500 }
    );
  }
}
