'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type VerifyResult = {
  status: 'loading' | 'success' | 'failed' | 'unknown';
  message: string;
};

const pickLinkId = (params: URLSearchParams | null): string | null => {
  if (!params) return null;
  const candidates = ['linkId', 'link_id', 'orderId', 'order_id', 'reference', 'linkRef'];

  for (const key of candidates) {
    const value = params.get(key);
    if (value) return value;
  }

  return null;
};

const pickStatusValue = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') return '';
  const record = payload as Record<string, unknown>;

  const nestedData =
    record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>) : null;

  const raw =
    record.paymentStatus ??
    record.payment_status ??
    record.status ??
    record.link_status ??
    nestedData?.paymentStatus ??
    nestedData?.payment_status ??
    nestedData?.status ??
    nestedData?.link_status;

  return typeof raw === 'string' ? raw.toUpperCase() : '';
};

const mapStatus = (payload: unknown): VerifyResult => {
  const statusValue = pickStatusValue(payload);

  if (['PAID', 'SUCCESS', 'COMPLETED', 'ACTIVE'].includes(statusValue)) {
    return {
      status: 'success',
      message: 'Payment verified successfully. Your auction payment is confirmed.',
    };
  }

  if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(statusValue)) {
    return {
      status: 'failed',
      message: 'Payment was not completed. You can retry from your won auctions.',
    };
  }

  return {
    status: 'unknown',
    message: 'Unable to determine payment status. Please check again in a moment.',
  };
};

export default function PaymentStatusClient() {
  const params = useSearchParams();
  const auctionId = params?.get('auctionId') || null;
  const linkId = useMemo(() => pickLinkId(params), [params]);
  const [result, setResult] = useState<VerifyResult>({
    status: 'loading',
    message: 'Verifying payment status...',
  });

  useEffect(() => {
    const verify = async () => {
      if (!linkId) {
        setResult({
          status: 'unknown',
          message:
            'No linkId was found in the return URL. Please open this payment from the generated checkout link.',
        });
        return;
      }

      try {
        const res = await fetch(`/api/auction/payment-status?linkId=${encodeURIComponent(linkId)}`, {
          method: 'GET',
        });
        const data = await res.json();

        if (!res.ok) {
          setResult({
            status: 'failed',
            message: data?.error || 'Payment verification failed.',
          });
          return;
        }

        setResult(mapStatus(data));
      } catch {
        setResult({
          status: 'failed',
          message: 'Could not verify payment status. Please try again shortly.',
        });
      }
    };

    verify();
  }, [linkId]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Payment Status</h1>
        <p className="mt-2 text-gray-600">We verify your payment status with backend before updating UI.</p>

        <div className="mt-6 rounded-xl border p-4">
          {result.status === 'loading' ? (
            <div className="flex items-center gap-3 text-gray-700">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{result.message}</span>
            </div>
          ) : (
            <p
              className={
                result.status === 'success'
                  ? 'text-emerald-700 font-semibold'
                  : result.status === 'failed'
                    ? 'text-red-600 font-semibold'
                    : 'text-amber-700 font-semibold'
              }
            >
              {result.message}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/bidded-auctions">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">Go to Won Auctions</Button>
          </Link>
          {auctionId && (
            <Link href={`/auctions/${auctionId}`}>
              <Button variant="outline">Back to Auction</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}