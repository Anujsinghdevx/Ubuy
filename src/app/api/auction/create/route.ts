import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = getBearerTokenFromSession(session);
  if (!session || !session.user || !accessToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const raw = body as Record<string, unknown>;

    // Forward only CreateAuctionDto fields expected by backend.
    const payload = {
      title: String(raw.title ?? ''),
      description: String(raw.description ?? ''),
      images: Array.isArray(raw.images) ? raw.images.map((img) => String(img)) : [],
      startingPrice:
        typeof raw.startingPrice === 'number'
          ? raw.startingPrice
          : Number(raw.startingPrice ?? 0),
      startTime: String(raw.startTime ?? ''),
      endTime: String(raw.endTime ?? ''),
      category: String(raw.category ?? ''),
    };

    const { status, data } = await backendJsonRequest(
      '/v1/auctions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      accessToken
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
