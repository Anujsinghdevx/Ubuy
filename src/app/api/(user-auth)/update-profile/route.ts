import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

const updateProfile = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = getBearerTokenFromSession(session);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, data } = await backendJsonRequest(
      '/v1/auth/update-profile',
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      accessToken
    );

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile', details: (error as Error).message },
      { status: 500 }
    );
  }
};

export async function PATCH(req: Request) {
  return updateProfile(req);
}

export async function PUT(req: Request) {
  return updateProfile(req);
}
