import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || '';
    const { status, data } = await backendJsonRequest(
      `/v1/auth/check-username-unique?username=${encodeURIComponent(username)}`,
      {
        method: 'GET',
      }
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    console.log('Error checking username', error);
    return NextResponse.json({ success: false, message: 'Error checking Username' }, { status: 500 });
  }
}
