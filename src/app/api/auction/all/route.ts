import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

export async function GET() {
  try {
    const { status, data } = await backendJsonRequest('/v1/auctions', { method: 'GET' });
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
