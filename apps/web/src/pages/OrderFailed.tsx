import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import { Card, Button } from '../components/ui';

interface OrderData {
  id: number;
  amount: number;
  total_credits: number;
  payment_provider: string;
  payment_status: string;
  created_at: string;
}

const OrderFailed = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, amount, total_credits, payment_provider, payment_status, created_at')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setOrder(data as unknown as OrderData);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  const breadcrumbItems = [
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', href: '/checkout' },
    { label: 'Payment Failed', current: true }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading order details...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-max py-16">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-xl text-gray-600 mb-8">
              Unfortunately, your payment could not be processed. Your credits have not been charged.
            </p>
          </div>

          {order && (
            <Card className="mb-8">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <span className="ml-2 font-medium text-gray-900">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-medium text-gray-900">${order.amount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {order.payment_provider === 'TEST' ? 'Test Payment' : order.payment_provider}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium text-red-600 capitalize">{order.payment_status}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">What happened?</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Your payment was declined by the payment processor</li>
                    <li>• No charges have been made to your account</li>
                    <li>• You can try again with a different payment method</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What can you do?</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Try a different payment method or card</li>
                    <li>• Check that your payment details are correct</li>
                    <li>• Contact your bank if you suspect an issue</li>
                    <li>• Contact our support team for assistance</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            <Link to="/checkout">
              <Button className="w-full sm:w-auto">
                Try Payment Again
              </Button>
            </Link>

            <div className="text-center">
              <Link
                to="/cart"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium mr-6"
              >
                ← Back to Cart
              </Link>
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

export default OrderFailed;
