import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import { OrderSummaryCard } from '../components/ui';



const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<any>(null);
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);
  const { user } = useAuth();
  const { items: cartItems, getTotalItems, clearCart } = useCart();
  const navigate = useNavigate();

  // Fetch payment providers
  useEffect(() => {
    const fetchPaymentProviders = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_providers')
          .select('*')
          .eq('is_enabled', true)
          .order('is_default_test', { ascending: false });

        if (!error && data && data.length > 0) {
          setAvailableProviders(data);
          // Set the default provider (first one with is_default_test = true, or first in list)
          const defaultProvider = data.find(p => p.is_default_test) || data[0];
          setPaymentProvider(defaultProvider);
        }
      } catch (error) {
        console.error('Error fetching payment providers:', error);
      }
    };
    fetchPaymentProviders();
  }, []);

  // Check cart on mount
  useEffect(() => {
    if (getTotalItems() === 0) {
      navigate('/marketplace');
      return;
    }
  }, [getTotalItems, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateProcessingFee = () => {
    // Fixed processing fee of $0.99 per item
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    return itemCount * 0.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateProcessingFee();
  };

  const handleConfirmAndPay = async () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      setLoading(true);

      // Prepare payload for backend
      const payload = {
        provider: paymentProvider.provider,
        items: cartItems.map(item => ({
          packId: item.credit_pack_id, // UUID string
          quantity: item.quantity,
        })),
      };

      console.log('Order creation payload:', payload);

      // Call backend API to create order
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const orderData = await response.json();

      console.log('Order created:', orderData);

      // Clear cart on successful order creation
      clearCart && clearCart();

      // Handle payment flow based on response
      if (orderData.status === 'paid') {
        // TEST payment: already processed, show success with credits message
        navigate('/orders/success?orderId=' + orderData.orderId);
      } else if (orderData.status === 'redirect') {
        // 3THIX payment: redirect to payment widget
        window.location.href = orderData.paymentUrl;
      } else {
        // Fallback
        navigate('/orders/success?orderId=' + orderData.orderId);
      }

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
      navigate('/checkout/failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Loading...</h3>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', current: true }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-max py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: User details */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Link
                to="/cart"
                className="text-primary hover:text-primary-hover transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Cart
              </Link>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Email</label>
                  <div className="text-gray-900 font-medium">{user.email}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h3>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-light rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="space-y-6">
            {/* Payment Provider Selection */}
            {availableProviders.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {availableProviders.map((provider) => (
                    <label key={provider.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentProvider"
                        value={provider.id}
                        checked={paymentProvider?.id === provider.id}
                        onChange={() => setPaymentProvider(provider)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-3">
                        <span className="text-gray-900 font-medium">{provider.name}</span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({provider.provider === 'TEST' ? 'Test Gateway' : '3THIX Payment Gateway'})
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <OrderSummaryCard
              subtotal={calculateSubtotal()}
              processingFee={calculateProcessingFee()}
              total={calculateTotal()}
              onProceed={handleConfirmAndPay}
              loading={loading}
              buttonText="Confirm and Pay"
              showTerms={true}
            />

            {/* Legal text */}
            <div className="text-sm text-gray-600 text-center">
              By completing payment you are purchasing digital credits for use inside the platform. This is not the purchase of cryptocurrency or tokens. All blockchain-related reward transfers are executed manually by the admin team.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
