import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { status, data } = await backendJsonRequest(
      `/v1/auth/public-profile/${encodeURIComponent(id)}`,
      {
        method: 'GET',
      }
    );

    const user = (data as { data?: unknown; user?: unknown })?.data ??
      (data as { data?: unknown; user?: unknown })?.user ??
      data;

    return NextResponse.json({ success: status < 400, user }, { status });
  } catch (error) {
    console.error('Error fetching public user:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
