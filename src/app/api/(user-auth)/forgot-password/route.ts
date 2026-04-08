import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { status, data } = await backendJsonRequest('/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
