import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import logo from '../assets/cbm-logo.webp';

const Header = () => {
  const { user, signOut } = useAuth();
  const { items: cartItems, getTotalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);

  const cartItemCount = getTotalItems();
  const totalCredits = cartItems.reduce((sum, item) => sum + (item.credits * item.quantity), 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
    setCartDropdownOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 h-16">
      <div className="container-max h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center text-xl font-semibold text-white hover:text-indigo-400 transition-colors"
            >
              <img src={logo} alt="Credits Marketplace" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-indigo-400'
                  : 'text-gray-300 hover:text-indigo-400'
              }`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`text-sm font-medium transition-colors ${
                location.pathname.startsWith('/marketplace')
                  ? 'text-indigo-400'
                  : 'text-gray-300 hover:text-indigo-400'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/about'
                  ? 'text-indigo-400'
                  : 'text-gray-300 hover:text-indigo-400'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/contact'
                  ? 'text-indigo-400'
                  : 'text-gray-300 hover:text-indigo-400'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon with Badge and Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                className="relative text-gray-300 hover:text-indigo-400 transition-colors p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H6M7 13l1.1-5m1.4 0H17m-9.5-1H3" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {cartDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCartDropdownOpen(false)}
                  ></div>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      {/* Cart Items */}
                      {cartItems.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">Your cart is empty</p>
                      ) : (
                        <>
                          <h3 className="text-white text-sm font-medium mb-3">Cart Summary</h3>

                          {/* Summary Stats */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Total Packs:</span>
                              <span className="text-white">{cartItemCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Total Credits:</span>
                              <span className="text-white">{totalCredits.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-gray-300">Total Amount:</span>
                              <span className="text-white">${totalAmount.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Cart Items List */}
                          <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                            {cartItems.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <div className="text-gray-300 truncate">
                                  {item.name} x{item.quantity}
                                </div>
                                <span className="text-white ml-2">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                            {cartItems.length > 3 && (
                              <p className="text-gray-400 text-xs text-center">
                                ... and {cartItems.length - 3} more items
                              </p>
                            )}
                          </div>

                          {/* Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={handleCheckout}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 text-sm font-medium rounded-md transition-colors"
                            >
                              Checkout
                            </button>
                            <button
                              onClick={() => {
                                navigate('/cart');
                                setCartDropdownOpen(false);
                              }}
                              className="w-full text-gray-300 hover:text-white py-2 px-4 text-sm font-medium rounded-md border border-white/20 hover:border-white/40 transition-colors"
                            >
                              View Full Cart
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {user ? (
              /* User Avatar with Dropdown - Logged In */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-2 hover:bg-white/20 transition-colors"
                >
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300 hidden sm:block">Dashboard</span>
                  <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-sm text-gray-300 border-b border-white/10">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-gray-400">Signed in</div>
                        </div>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
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
                  to="/login"
                  className="text-gray-300 hover:text-indigo-400 text-sm font-medium transition-colors px-3 py-2 border border-white/20 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  Get Credits
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
