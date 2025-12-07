import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import { OrderSummaryCard, CartItemRow } from '../components/ui';

const Cart = () => {
  const { user } = useAuth();
  const { items: cartItems, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotalCredits = () => {
    return cartItems.reduce((total, item) => total + (item.credits * item.quantity), 0);
  };

  const calculateProcessingFee = () => {
    // Fixed processing fee of $0.99 per item
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    return itemCount * 0.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateProcessingFee();
  };

  const handleCheckout = async () => {
    if (!user) {
      // Store current URL for post-login redirect
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Navigate to checkout page
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-light-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H6M7 13l1.1-5m1.4 0H17m-9.5-1H3" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-light-600">Add some digital credits to get started.</p>
            <div className="mt-8">
              <Link
                to="/marketplace"
                className="text-primary hover:text-primary-hover transition-colors"
              >
                ← Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Cart', current: true }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="container-max py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-light">
                    <th className="text-left py-4 px-2 text-sm font-medium text-gray-600">Product</th>
                    <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Credits</th>
                    <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Price</th>
                    <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Quantity</th>
                    <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Total</th>
                    <th className="text-center py-4 px-2 text-sm font-medium text-gray-600">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <Link
                to="/marketplace"
                className="text-primary hover:text-primary-hover transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummaryCard
              subtotal={calculateSubtotal()}
              totalCredits={calculateTotalCredits()}
              processingFee={calculateProcessingFee()}
              total={calculateTotal()}
              onProceed={handleCheckout}
              buttonText="Continue to Checkout"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
