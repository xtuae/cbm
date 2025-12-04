import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Handle sign out
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/admin'
                    ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Overview
              </Link>
              <Link
                to="/admin/users"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/admin/users'
                    ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Users
              </Link>
              <Link
                to="/admin/categories"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/admin/categories'
                    ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Categories
              </Link>
              <Link
                to="/admin/credit-packs"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/admin/credit-packs'
                    ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Credit Packs
              </Link>
              <Link
                to="/admin/pages"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/admin/pages'
                    ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Pages
              </Link>
              <Link
                to="/admin/settlements"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/admin/settlements'
                    ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Settlements
              </Link>
              <Link
                to="/admin/activity"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/admin/activity'
                    ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Activity
              </Link>
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto py-8 px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
