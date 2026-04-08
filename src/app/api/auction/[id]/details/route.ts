import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { status, data } = await backendJsonRequest(`/v1/auctions/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
    const auction =
      (data as { data?: unknown; auction?: unknown })?.data ??
      (data as { data?: unknown; auction?: unknown })?.auction ??
      data;
    return NextResponse.json({ success: status < 400, auction }, { status });
  } catch (error) {
    console.error('Error fetching auction:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
