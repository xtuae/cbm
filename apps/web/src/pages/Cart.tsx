import { useState, useEffect } from 'react';
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

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart items to localStorage whenever cartItems change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setCartItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(newQuantity, 99) }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const incrementQuantity = (itemId: string) => {
    setCartItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
          : item
      )
    );
  };

  const decrementQuantity = (itemId: string) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity - 1;
          if (newQuantity < 1) {
            return null; // Will be filtered out
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateProcessingFee = () => {
    // Fixed processing fee of $0.99 per item (configurable)
    const subtotal = calculateSubtotal();
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

    // Navigate to checkout page - checkout logic moved there
    navigate('/checkout');
  };

  const addToCart = (creditPack: any, quantity: number = 1) => {
    const cartItem: CartItem = {
      id: `${creditPack.id}_${Date.now()}`, // Unique ID for cart item
      credit_pack_id: creditPack.id,
      name: creditPack.name,
      credits: creditPack.credit_amount,
      price: creditPack.price_usd,
      quantity: quantity,
      processing_fee: 0.99, // $0.99 per item
    };

    setCartItems(prev => [...prev, cartItem]);
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
    <div className="bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="headline-lg text-gray-900 mb-4">Cart</h1>
          <p className="body-lg text-gray-light-600">
            {cartItems.reduce((total, item) => total + item.quantity, 0)} digital credit{cartItems.reduce((total, item) => total + item.quantity, 0) !== 1 ? 's' : ''} in your cart
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-light-200 rounded-large p-6 shadow-card">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-large flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-primary font-medium mb-3">{item.credits.toLocaleString()} Digital Credits</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                        <span className="text-sm text-gray-light-600">Processing fee: $0.99</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        className="w-8 h-8 rounded-large border border-gray-light-300 flex items-center justify-center text-gray-light-600 hover:bg-gray-light-50 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => incrementQuantity(item.id)}
                        className="w-8 h-8 rounded-large border border-gray-light-300 flex items-center justify-center text-gray-light-600 hover:bg-gray-light-50 transition-colors"
                        disabled={item.quantity >= 99}
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-lg font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-gray-light-500 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary - Premium Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-light-200 rounded-large p-8 shadow-card sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-light-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-light-600">
                  <span>Processing Fee</span>
                  <span className="font-medium">${calculateProcessingFee().toFixed(2)}</span>
                </div>

                <hr className="border-gray-light-200" />

                <div className="flex justify-between text-xl font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>

                <p className="text-xs text-gray-light-500 leading-relaxed">
                  Processing fee covers secure payment handling and instant digital delivery
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-medium rounded-large px-6 py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Checkout'}
                </button>

                <Link
                  to="/marketplace"
                  className="block text-center text-primary hover:text-primary-hover transition-colors py-2"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
