import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { status, data } = await backendJsonRequest('/v1/auth/reset-code', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json({ success: false, message: 'Error verifying user' }, { status: 500 });
  }
}
