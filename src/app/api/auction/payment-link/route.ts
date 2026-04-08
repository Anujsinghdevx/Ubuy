import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../(user-auth)/auth/[...nextauth]/options';
import { backendJsonRequest, getBearerTokenFromSession } from '@/lib/backend-api';

type PaymentLinkBody = {
  auctionId?: string;
  customerPhone?: string;
  returnUrl?: string;
  notifyUrl?: string;
  sendSms?: boolean;
  sendEmail?: boolean;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = getBearerTokenFromSession(session);
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as PaymentLinkBody;
    const { auctionId, customerPhone, returnUrl, notifyUrl } = body;

    if (!auctionId) {
      return NextResponse.json({ error: 'Auction ID is required' }, { status: 400 });
    }

    if (!customerPhone) {
      return NextResponse.json({ error: 'Customer phone is required' }, { status: 400 });
    }

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'returnUrl is required from frontend for deterministic redirect behavior' },
        { status: 400 }
      );
    }

    const payload = {
      auctionId,
      customerPhone,
      returnUrl,
      ...(notifyUrl ? { notifyUrl } : {}),
      ...(typeof body.sendSms === 'boolean' ? { sendSms: body.sendSms } : {}),
      ...(typeof body.sendEmail === 'boolean' ? { sendEmail: body.sendEmail } : {}),
    };

    const { status, data } = await backendJsonRequest(
      '/v1/payments/cashfree/link',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      accessToken
    );

    const normalized =
      data && typeof data === 'object'
        ? {
            ...(data as Record<string, unknown>),
            payment_link:
              (data as { payment_link?: string; linkUrl?: string }).payment_link ||
              (data as { payment_link?: string; linkUrl?: string }).linkUrl,
          }
        : data;

    return NextResponse.json(normalized, { status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create payment link', details: (error as Error).message },
      { status: 500 }
    );
  }
}
