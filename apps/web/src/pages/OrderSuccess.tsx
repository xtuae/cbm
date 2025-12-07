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
  order_items: Array<{
    quantity: number;
    unit_price: number;
    credit_packs: {
      name: string;
    } | null;
  }> | null;
}

const OrderSuccess = () => {
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
          .select(`
            id,
            amount,
            total_credits,
            payment_provider,
            payment_status,
            created_at,
            order_items (
              quantity,
              unit_price,
              credit_packs (
                name
              )
            )
          `)
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
    { label: 'Payment Successful', current: true }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading order details...</h3>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the order details.</p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
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
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-600 mb-8">
              {order.payment_provider === 'TEST'
                ? `${order.total_credits} credits have been added to your account immediately!`
                : `${order.total_credits} credits will be added to your account shortly.`
              }
            </p>
          </div>

          <Card className="mb-8">
            <div className="space-y-6">
              {/* Order Details */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <span className="ml-2 font-medium text-gray-900">#{order.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="ml-2 font-medium text-gray-900">${order.amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Credits Added:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.total_credits.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {order.payment_provider === 'TEST' ? 'Test Payment' : order.payment_provider}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium text-green-600 capitalize">{order.payment_status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Purchased</h3>
                <div className="space-y-3">
                  {order.order_items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.credit_packs?.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${(item.unit_price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What happens next */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Credits are now available in your account</li>
                  <li>• You can use them to make transactions on the platform</li>
                  <li>• Check your balance in the dashboard anytime</li>
                  {order.payment_provider !== 'TEST' && <li>• A receipt has been sent to your email</li>}
                </ul>
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

export default OrderSuccess;
