'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [, ] = useState<{id: string; amount: number} | null>(null);

  useEffect(() => {
    if (sessionId) {
      // You can fetch order details from your API here
      console.log('Payment successful for session:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order! We&apos;ve received your payment and will start preparing your fresh salad right away.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Order ID: {sessionId || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            You&apos;ll receive a confirmation email shortly.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors mt-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Menu</span>
        </Link>
      </div>
    </div>
  );
}
