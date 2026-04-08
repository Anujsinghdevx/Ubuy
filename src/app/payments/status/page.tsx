import { Suspense } from 'react';
import PaymentStatusClient from './PaymentStatusClient';
import { Loader2 } from 'lucide-react';

const PaymentStatusFallback = () => {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Payment Status</h1>
        <p className="mt-2 text-gray-600">Loading payment details...</p>

        <div className="mt-6 rounded-xl border p-4">
          <div className="flex items-center gap-3 text-gray-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Verifying payment status...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<PaymentStatusFallback />}>
      <PaymentStatusClient />
    </Suspense>
  );
}
