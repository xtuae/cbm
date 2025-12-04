import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/Breadcrumb';

interface CartItem {
  id: string;
  credit_pack_id: string;
  name: string;
  credits: number;
  price: number;
  quantity: number;
  processing_fee?: number;
}

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (!parsedCart.length) {
          navigate('/cart');
          return;
        }
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('cart');
        navigate('/cart');
      }
    } else {
      navigate('/cart');
    }
  }, [navigate]);

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

  const handleProceedToPayment = async () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      // For now, assuming single item orders as in marketplace
      // Later you can extend to support multiple items
      const firstItem = cartItems[0];
      if (!firstItem) {
        throw new Error('No items in cart');
      }

      // Use RPC function for order creation with business logic
      const { data, error } = await supabase.rpc('create_order', {
        p_credit_pack_id: firstItem.credit_pack_id,
        p_quantity: firstItem.quantity,
        p_total_amount: calculateTotal()
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.order_id) {
        throw new Error('Order creation failed - no order ID returned');
      }

      // Navigate to payment page with order ID
      navigate(`/payment/${data.order_id}`);

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Checkout
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Complete your purchase securely
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        {/* Back to Cart Link */}
        <div className="mb-6">
          <Link
            to="/cart"
            className="text-blue-600 hover:text-blue-500 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-md flex items-center justify-center">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.credits.toLocaleString()} Credits</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Info & Payment Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Information */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{user.email}</dd>
                </div>
              </dl>
            </div>

            {/* Payment Summary */}
            <div className="bg-white shadow-sm rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Processing Fee ({cartItems.reduce((total, item) => total + item.quantity, 0)} item{cartItems.reduce((total, item) => total + item.quantity, 0) !== 1 ? 's' : ''})
                  </span>
                  <span className="text-gray-900">${calculateProcessingFee().toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Processing fee covers payment security and instant delivery
                  </p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Order...' : `Proceed to Payment - $${calculateTotal().toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
