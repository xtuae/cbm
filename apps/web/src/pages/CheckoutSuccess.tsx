import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import { Card, Button } from '../components/ui';

interface CheckoutPayload {
  cart: {
    items: any[];
    totalItems: number;
    subtotal: number;
    processingFee: number;
    total: number;
  };
  user: {
    id: string;
    email: string;
  };
}

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const isTestProvider = searchParams.get('provider') === 'test';
  const orderId = searchParams.get('orderId');

  const breadcrumbItems = [
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', href: '/checkout' },
    { label: 'Payment Successful', current: true }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-max py-16">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment Successful {isTestProvider ? '(Test Mode)' : ''}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {isTestProvider
                ? 'Your credits have been added to your account immediately!'
                : 'Your credits will be added to your account after confirmation.'
              }
            </p>
            {orderId && (
              <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            )}
          </div>

          <Card className="mb-8">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Digital credits {isTestProvider ? 'have been' : 'will be'} added to your platform account</li>
                  {isTestProvider && <li>• Test payment processed - no real charges incurred</li>}
                  {!isTestProvider && <li>• Payment details have been recorded for processing</li>}
                  <li>• You'll receive an email confirmation within a few minutes</li>
                  <li>• Account admin will process any blockchain-related rewards</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> You are purchasing digital credits for use inside the platform.
                  This is not the purchase of cryptocurrency or tokens. All blockchain-related reward transfers are executed manually by the admin team.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Link to="/dashboard">
              <Button className="w-full sm:w-auto">
                Go to Dashboard
              </Button>
            </Link>

            <div className="text-center">
              <Link
                to="/marketplace"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Continue Shopping →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
