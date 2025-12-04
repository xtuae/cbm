import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { signOut, user } = useAuth();
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

  const navigation = [
    { name: 'Overview', href: '/admin', icon: '📊' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Categories', href: '/admin/categories', icon: '🏷️' },
    { name: 'Credit Packs', href: '/admin/credit-packs', icon: '💰' },
    { name: 'Pages', href: '/admin/pages', icon: '📄' },
    { name: 'Settlements', href: '/admin/settlements', icon: '💳' },
    { name: 'Activity', href: '/admin/activity', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-light">
          <div className="flex flex-col h-full">
            {/* Admin Branding */}
            <div className="flex items-center px-6 py-4 border-b border-light">
              <div className="text-lg font-semibold text-gray-900">Admin Panel</div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/admin' && location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="px-4 py-4 border-t border-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Sign out"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="py-8">
            <div className="container-max">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
