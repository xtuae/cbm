import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';

interface RequireAdminProps {
  children: ReactNode;
}

const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while authentication initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to admin login page
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // If user is authenticated but not an admin, redirect to dashboard
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has admin role, render the protected content
  return <>{children}</>;
};

export default RequireAdmin;
