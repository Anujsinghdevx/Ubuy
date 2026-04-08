import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Missing category parameter' }, { status: 400 });
    }

    const { status, data } = await backendJsonRequest(
      `/v1/auctions?category=${encodeURIComponent(category)}`,
      {
        method: 'GET',
      }
    );
    const auctions = Array.isArray(data)
      ? data
      : ((data as { data?: unknown[]; auctions?: unknown[] })?.data ??
        (data as { data?: unknown[]; auctions?: unknown[] })?.auctions ??
        []);

    return NextResponse.json(auctions, { status });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { error: 'Failed to fetch auctions', details: errorMessage },
      { status: 500 }
    );
  }
}
