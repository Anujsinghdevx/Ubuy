import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

const isUnknownBidderName = (value: unknown): boolean => {
  if (typeof value !== 'string') return true;
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === 'unknown bidder' || normalized === 'anonymous';
};

const toResolvedBidderName = async (userId: string): Promise<string | null> => {
  try {
    const { status, data } = await backendJsonRequest(
      `/v1/auth/public-profile/${encodeURIComponent(userId)}`,
      { method: 'GET' }
    );

    if (status >= 400 || !data || typeof data !== 'object') return null;

    const record = data as Record<string, unknown>;
    const nested =
      record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : record.user && typeof record.user === 'object'
          ? (record.user as Record<string, unknown>)
          : null;

    const name =
      (nested && typeof nested.name === 'string' && nested.name.trim()) ||
      (nested && typeof nested.username === 'string' && nested.username.trim()) ||
      (typeof record.name === 'string' && record.name.trim()) ||
      (typeof record.username === 'string' && record.username.trim()) ||
      null;

    return name;
  } catch {
    return null;
  }
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit');

    const query =
      limit && limit.trim().length > 0
        ? `?limit=${encodeURIComponent(limit)}`
        : '';

    const { status, data } = await backendJsonRequest(
      `/v1/auctions/${encodeURIComponent(id)}/top-bidders${query}`,
      { method: 'GET' }
    );

    const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    const nestedData =
      record.data && typeof record.data === 'object'
        ? (record.data as Record<string, unknown>)
        : null;

    const topBidders =
      (Array.isArray(record.topBidders) && record.topBidders) ||
      (nestedData && Array.isArray(nestedData.topBidders) && nestedData.topBidders) ||
      (Array.isArray(record.items) && record.items) ||
      (Array.isArray(record.data) && record.data) ||
      (Array.isArray(data) ? data : []);

    const normalized = {
      auctionId:
        (typeof record.auctionId === 'string' && record.auctionId) ||
        (nestedData && typeof nestedData.auctionId === 'string' ? nestedData.auctionId : id),
      total:
        (typeof record.total === 'number' && Number.isFinite(record.total)
          ? record.total
          : nestedData && typeof nestedData.total === 'number' && Number.isFinite(nestedData.total)
            ? nestedData.total
            : topBidders.length),
      topBidders,
    };

    const enrichedTopBidders = await Promise.all(
      normalized.topBidders.map(async (item) => {
        if (!item || typeof item !== 'object') return item;
        const bidder = item as Record<string, unknown>;
        const userId =
          (typeof bidder.userId === 'string' && bidder.userId) ||
          (typeof bidder.bidderId === 'string' && bidder.bidderId) ||
          '';

        if (!userId || !isUnknownBidderName(bidder.bidderName)) {
          return item;
        }

        const resolvedName = await toResolvedBidderName(userId);
        if (!resolvedName) {
          return item;
        }

        return {
          ...bidder,
          bidderName: resolvedName,
        };
      })
    );

    const normalizedWithNames = {
      ...normalized,
      topBidders: enrichedTopBidders,
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('[top-bidders][api/v1/auctions]', {
        auctionId: id,
        limit,
        status,
        data: normalizedWithNames,
      });
      console.log(
        '[top-bidders][api/v1/auctions][json]',
        JSON.stringify(normalizedWithNames, null, 2)
      );
    }

    return NextResponse.json(normalizedWithNames, { status });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: 'Failed to fetch top bidders', details: errorMessage },
      { status: 500 }
    );
  }
}
