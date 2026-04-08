import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { getBearerTokenFromSession, toBackendUrl } from '@/lib/backend-api';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = getBearerTokenFromSession(session);

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incomingFormData = await req.formData();
    const outgoingFormData = new FormData();

    for (const [key, value] of incomingFormData.entries()) {
      outgoingFormData.append(key, value);
    }

    const response = await fetch(toBackendUrl('/v1/auth/upload-profile-image'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: outgoingFormData,
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    const normalized =
      data && typeof data === 'object'
        ? {
            ...(data as Record<string, unknown>),
            url:
              (data as { url?: string; image?: string; imageUrl?: string }).url ||
              (data as { url?: string; image?: string; imageUrl?: string }).image ||
              (data as { url?: string; image?: string; imageUrl?: string }).imageUrl,
          }
        : data;

    return NextResponse.json(normalized, { status: response.status });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile image', details: (error as Error).message },
      { status: 500 }
    );
  }
}
