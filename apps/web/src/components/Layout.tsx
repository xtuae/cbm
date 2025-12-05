import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
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
  const publicRoutes = ['/', '/marketplace', '/about', '/contact', '/terms', '/privacy', '/login', '/register'];
  const isPublicPage = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/marketplace/');
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

  // Don't show header for admin pages
  const showHeader = !isAdminSection;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Header - Exclude admin pages */}
      {showHeader && <Header />}

      {/* Sub-navigation for logged-in sections */}
      {user && (
        <>
          {/* Dashboard Sub-navigation */}
          {isDashboard && (
            <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
              <div className="container-max">
                <div className="flex space-x-8 overflow-x-auto">
                  <Link
                    to="/dashboard"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-300 hover:text-primary'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    to="/dashboard/orders"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard/orders'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-300 hover:text-primary'
                    }`}
                  >
                    Orders History
                  </Link>
                  <Link
                    to="/dashboard/ledger"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard/ledger'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-300 hover:text-primary'
                    }`}
                  >
                    Credit Ledger
                  </Link>
                  <Link
                    to="/dashboard/wallet"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/dashboard/wallet'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-300 hover:text-primary'
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
            <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
              <div className="container-max">
                <div className="flex space-x-8 overflow-x-auto">
                  <Link
                    to="/admin"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-300 hover:text-red-600'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/users'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-300 hover:text-red-600'
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/categories"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/categories'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-300 hover:text-red-600'
                    }`}
                  >
                    Categories
                  </Link>
                  <Link
                    to="/admin/credit-packs"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/credit-packs'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-300 hover:text-red-600'
                    }`}
                  >
                    Credit Packs
                  </Link>
                  <Link
                    to="/admin/pages"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/pages'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-300 hover:text-red-600'
                    }`}
                  >
                    Pages
                  </Link>
                  <Link
                    to="/admin/settlements"
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                      location.pathname === '/admin/settlements'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-300 hover:text-red-600'
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
