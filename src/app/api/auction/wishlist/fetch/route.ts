import { getServerSession } from 'next-auth';
import { authOptions } from '../../../(user-auth)/auth/[...nextauth]/options';
import { NextResponse } from 'next/server';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = getBearerTokenFromSession(session);

    if (!session || !session.user?.id || !accessToken) {
      console.error('Unauthorized access: No session or user id');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, data } = await backendJsonRequest('/v1/wishlist', { method: 'GET' }, accessToken);
    const wishlist = (data as { wishlist?: unknown[] })?.wishlist ?? [];
    return NextResponse.json({ wishlist }, { status });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch wishlist', details: errorMessage },
      { status: 500 }
    );
  }
}
