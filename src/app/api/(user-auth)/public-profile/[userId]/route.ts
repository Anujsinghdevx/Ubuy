import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { status, data } = await backendJsonRequest(
      `/v1/auth/public-profile/${encodeURIComponent(userId)}`,
      {
        method: 'GET',
      }
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public profile', details: (error as Error).message },
      { status: 500 }
    );
  }
}
