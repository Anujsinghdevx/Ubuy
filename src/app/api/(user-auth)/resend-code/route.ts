import { NextResponse } from 'next/server';
import { backendJsonRequest } from '@/lib/backend-api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { status, data } = await backendJsonRequest('/v1/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error resending code:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
