import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import { Card, Badge, Button } from '../components/ui';

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
  paymentProvider: {
    name?: string;
  };
  timestamp: string;
}

const CheckoutConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const payload = location.state as CheckoutPayload | null;

  // Redirect if no payload or not authenticated
  useEffect(() => {
    if (!payload) {
      navigate('/checkout');
      return;
    }
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout/confirm');
      navigate('/login');
    }
  }, [payload, user, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/marketplace');
      return;
    }
  }, [cartItems, navigate]);

  const handlePayNow = async () => {
    setLoading(true);

    // Log payment intent (placeholder for real payment)
    console.log('Payment Intent:', {
      ...payload,
      processed_at: new Date().toISOString(),
      status: 'completed_test',
    });

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save order details for processing
    localStorage.setItem('pending_order_success', JSON.stringify(payload));

    // Clear cart on success
    clearCart();

    // Navigate to success
    navigate('/checkout/success');
  };

  if (!payload || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading...</h3>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', href: '/checkout' },
    { label: 'Confirm Payment', current: true }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-max py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Order Summary */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Link
                to="/checkout"
                className="text-primary hover:text-primary-hover transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Checkout
              </Link>
            </div>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-4">
                {payload.cart.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-light rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">💎</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-primary">{item.credits.toLocaleString()} Credits</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${payload.cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee</span>
                    <span className="text-gray-900">${payload.cart.processingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${payload.cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Payment Details */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <div className="text-gray-900">{payload.paymentProvider.name || '3THix Gateway'}</div>
                  <div className="text-sm text-gray-500">Sandbox Environment (Test Mode)</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="text-gray-900">{payload.user.email}</div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Secure Payment Processing</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your payment will be processed securely through our trusted payment gateway.
                No card information is stored on our servers.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a test environment. No real payments will be processed.
                </p>
              </div>
            </Card>

            {/* Legal Notice */}
            <div className="text-sm text-gray-600">
              By completing your payment you are purchasing digital credits for use inside the platform.
              This is not the purchase of cryptocurrency or tokens. All blockchain-related reward transfers are executed manually by the admin team.
            </div>

            <Button
              onClick={handlePayNow}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing Payment...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirm;
