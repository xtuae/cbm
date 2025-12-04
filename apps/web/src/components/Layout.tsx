import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';

const MainLayout = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // States for layout logic
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
    window.addEventListener('storage', updateCartCount);

    // Also listen for cart updates
    window.addEventListener('cartUpdate', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdate', updateCartCount);
    };
  }, []);

  // Section detection
  const isPublicPage = ['/', '/marketplace'].includes(location.pathname) || location.pathname.startsWith('/marketplace/');
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdminSection = location.pathname.startsWith('/admin');
  const isAPISection = location.pathname.startsWith('/api');
  const isAdminUser = profile?.role === 'admin';

  // Handle user menu actions
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setUserMenuOpen(false);
    }
  };

  // Skip layout for API routes and auth forms (handled by App.tsx)
  if (isAPISection || (!user && !isPublicPage)) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Header */}
      <header className="bg-white border-b sticky top-0 z-50 h-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo - Left */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-lg font-semibold text-gray-light-600 hover:text-primary transition-colors">
                Credits Marketplace
              </Link>
            </div>

            {/* Navigation Links - Center */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/' ? 'text-primary' : 'text-gray-light-600 hover:text-primary'
                }`}
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/marketplace') ? 'text-primary' : 'text-gray-light-600 hover:text-primary'
                }`}
              >
                Marketplace
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/about' ? 'text-primary' : 'text-gray-light-600 hover:text-primary'
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/contact' ? 'text-primary' : 'text-gray-light-600 hover:text-primary'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">
              {/* Cart Icon - Show when user is logged in */}
              {user && (
                <Link
                  to="/cart"
                  className="relative text-gray-light-600 hover:text-primary transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H6M7 13l1.1-5m1.4 0H17m-9.5-1H3" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                /* User Menu - Logged In */
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-gray-light-600 hover:text-primary transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-light-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-light-600">
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
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-large shadow-card border border-gray-light-300 z-50">
                        <div className="py-2">
                          <div className="px-4 py-2 text-sm text-gray-light-600 border-b border-gray-light-200">
                            <div className="font-medium">{user.email}</div>
                            <div className="text-xs text-gray-light-500">Signed in</div>
                          </div>
                          <Link
                            to="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-light-600 hover:bg-gray-light-50 hover:text-primary transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-light-600 hover:bg-gray-light-50 hover:text-primary transition-colors"
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
                    className="text-gray-light-600 hover:text-primary text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/marketplace" // Redirect to marketplace for registration flow
                    className="bg-primary hover:bg-primary-hover text-white px-5 py-2 text-sm font-medium rounded-large transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="text-gray-light-600 hover:text-primary transition-colors p-2"
                  aria-expanded="false"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-navigation for logged-in sections */}
      {user && (
        <>
          {/* Dashboard Sub-navigation */}
          {isDashboard && (
            <nav className="bg-white border-b border-gray-light-200">
              <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
                <div className="flex space-x-8 overflow-x-auto">
                  <Link
                    to="/dashboard"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-light-600 hover:text-primary'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    to="/dashboard/orders"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard/orders'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-light-600 hover:text-primary'
                    }`}
                  >
                    Orders History
                  </Link>
                  <Link
                    to="/dashboard/ledger"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard/ledger'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-light-600 hover:text-primary'
                    }`}
                  >
                    Credit Ledger
                  </Link>
                  <Link
                    to="/dashboard/wallet"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard/wallet'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-light-600 hover:text-primary'
                    }`}
                  >
                    Wallet Management
                  </Link>
                </div>
              </div>
            </nav>
          )}

          {/* Admin Sub-navigation */}
          {isAdminSection && isAdminUser && (
            <nav className="bg-white border-b border-gray-light-200">
              <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
                <div className="flex space-x-8 overflow-x-auto">
                  <Link
                    to="/admin"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-light-600 hover:text-red-600'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/users'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-light-600 hover:text-red-600'
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/categories"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/categories'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-light-600 hover:text-red-600'
                    }`}
                  >
                    Categories
                  </Link>
                  <Link
                    to="/admin/credit-packs"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/credit-packs'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-light-600 hover:text-red-600'
                    }`}
                  >
                    Credit Packs
                  </Link>
                  <Link
                    to="/admin/pages"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/pages'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-light-600 hover:text-red-600'
                    }`}
                  >
                    Pages
                  </Link>
                  <Link
                    to="/admin/settlements"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/settlements'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-light-600 hover:text-red-600'
                    }`}
                  >
                    NILA Settlements
                  </Link>
                </div>
              </div>
            </nav>
          )}
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] mx-auto py-8 px-6 lg:px-8 w-full">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
