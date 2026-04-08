import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import { backendJsonRequest } from '@/lib/backend-api';
import { getBearerTokenFromSession } from '@/lib/backend-api';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = getBearerTokenFromSession(session);

    const url = new URL(req.url);
    const linkId = url.searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    const { status, data } = await backendJsonRequest(
      `/v1/payments/cashfree/verify?linkId=${encodeURIComponent(linkId)}`,
      {
        method: 'GET',
      },
      accessToken
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error fetching payment link status:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch payment link status',
        details:
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : String(error),
      },
      { status: 500 }
    );
  }
}
