import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        try {
          const cartItems = JSON.parse(cart);
          const count = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
          setCartItemCount(count);
        } catch (error) {
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    updateCartCount();
    // Listen for storage changes
    const handleStorageChange = () => updateCartCount();
    window.addEventListener('storage', handleStorageChange);

    // Also listen for cart updates (custom events we might add later)
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdate', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-light sticky top-0 z-50 h-14">
      <div className="container-max h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-xl font-semibold text-gray-600 hover:text-primary transition-colors"
            >
              Credits Marketplace
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/marketplace"
              className={`text-sm font-medium transition-colors ${
                location.pathname.startsWith('/marketplace')
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              Browse Marketplace
            </Link>
            <button
              onClick={() => alert('Pricing & How it Works coming soon!')}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              Pricing & How it Works
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon with Badge */}
            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-primary transition-colors p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H6M7 13l1.1-5m1.4 0H17m-9.5-1H3" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              /* User Avatar with Dropdown - Logged In */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors p-2"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-card border border-light z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-sm text-gray-600 border-b border-light">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-gray-500">Signed in</div>
                        </div>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Auth Buttons - Logged Out */
              <div className="flex items-center space-x-4">
                <Link
                  to="/" // This will redirect to auth form via App.tsx routing
                  className="text-gray-600 hover:text-primary text-sm font-medium transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/" // This will redirect to auth form via App.tsx routing
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
