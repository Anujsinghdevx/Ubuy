import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../(user-auth)/auth/[...nextauth]/options';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

const toErrorMessage = (data: unknown): string => {
  if (!data || typeof data !== 'object') return 'Failed to place bid';
  const record = data as Record<string, unknown>;
  const message = record.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string' && message.trim()) return message;
  if (typeof record.error === 'string' && record.error.trim()) return record.error;
  return 'Failed to place bid';
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const accessToken = getBearerTokenFromSession(session);

  if (!session || !session.user || !accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const rawAmount = body.amount ?? body.bidAmount;
    const amount = typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid bid amount' }, { status: 400 });
    }

    const payload = {
      auctionId: id,
      amount,
    };

    let { status, data } = await backendJsonRequest(
      `/v1/auctions/${encodeURIComponent(id)}/bids`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      accessToken
    );

    const firstErrorMessage = toErrorMessage(data).toLowerCase();

    // Compatibility fallback for backends that use path param only and forbid auctionId in body.
    if (status === 400 && firstErrorMessage.includes('auctionid') && firstErrorMessage.includes('should not exist')) {
      const retry = await backendJsonRequest(
        `/v1/auctions/${encodeURIComponent(id)}/bids`,
        {
          method: 'POST',
          body: JSON.stringify({ amount }),
        },
        accessToken
      );
      status = retry.status;
      data = retry.data;
    }

    if (status >= 400) {
      return NextResponse.json({ error: toErrorMessage(data), data }, { status });
    }

    return NextResponse.json(data, { status });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
