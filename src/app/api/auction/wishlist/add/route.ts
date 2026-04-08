import { getServerSession } from 'next-auth';
import { authOptions } from '../../../(user-auth)/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = getBearerTokenFromSession(session);

    if (!session || !session.user?.id || !accessToken) {
      console.error('Unauthorized access: No session or user id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, data } = await backendJsonRequest(
      '/v1/wishlist',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      accessToken
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to add to wishlist', details: errorMessage },
      { status: 500 }
    );
  }
}
