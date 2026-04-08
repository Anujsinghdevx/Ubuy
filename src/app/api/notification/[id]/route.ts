import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

export async function PATCH(_: Request, context: { params: { id: string } }) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  const accessToken = getBearerTokenFromSession(session);

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status, data } = await backendJsonRequest(
    `/v1/notifications/${encodeURIComponent(params.id)}/read`,
    {
      method: 'PATCH',
    },
    accessToken
  );

  return NextResponse.json(data, { status });
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  const accessToken = getBearerTokenFromSession(session);

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status, data } = await backendJsonRequest(
    `/v1/notifications/${encodeURIComponent(params.id)}`,
    {
      method: 'DELETE',
    },
    accessToken
  );

  return NextResponse.json(data, { status });
}
