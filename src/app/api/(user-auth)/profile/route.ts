import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

const fetchAuthenticatedProfile = async () => {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = getBearerTokenFromSession(session);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, data } = await backendJsonRequest('/v1/auth/me', { method: 'GET' }, accessToken);
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: (error as Error).message },
      { status: 500 }
    );
  }
};

export async function GET() {
  return fetchAuthenticatedProfile();
}

export async function POST() {
  return fetchAuthenticatedProfile();
}
