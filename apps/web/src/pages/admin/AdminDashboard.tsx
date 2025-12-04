import { useEffect, useState } from 'react';
import React from 'react';
import { adminApi } from '../../api/adminApi';

interface AnalyticsData {
  total_users: number;
  total_credits_purchased: number;
  orders: {
    total: number;
    last7Days: number;
    last30Days: number;
  };
  top_products: Array<{
    name: string;
    slug: string;
    totalCredits: number;
    orderCount: number;
  }>;
}

interface RecentActivity {
  type: 'user_registration' | 'credit_purchase' | 'settlement' | 'order';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AdminDashboard: Component mounted, fetching data...');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch analytics data using adminApi (which automatically adds auth headers)
      const analyticsData: AnalyticsData = await adminApi.get('/admin/analytics');
      setAnalytics(analyticsData);

      // Fetch recent activity (users and settlements for recent activity)
      let usersData = { data: [] };
      let transfersData = { data: [] };

      try {
        usersData = await adminApi.get('/admin/users?page=1&limit=5');
      } catch (err) {
        console.warn('Failed to fetch users data for recent activity:', err);
      }

      try {
        transfersData = await adminApi.get('/admin/nila-transfers?page=1&limit=10');
      } catch (err) {
        console.warn('Failed to fetch transfers data for recent activity:', err);
      }

      // Generate recent activity
      const activities: RecentActivity[] = [];

      // Add recent user registrations
      (usersData.data || []).slice(0, 3).forEach((user: any) => {
        activities.push({
          type: 'user_registration',
          title: 'New User Registration',
          description: `${user.email || 'User'} joined the platform`,
          timestamp: user.created_at,
          user: user.email,
        });
      });

      // Add recent settlements
      (transfersData.data || []).slice(0, 3).forEach((transfer: any) => {
        activities.push({
          type: 'settlement',
          title: 'Settlement Processed',
          description: `$${transfer.nila_amount} NILA sent to ${transfer.profiles?.email || 'user'}`,
          timestamp: transfer.created_at,
          user: transfer.profiles?.email,
        });
      });

      // Sort by timestamp and take latest 10
      setRecentActivity(
        activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
      );

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return '👤';
      case 'credit_purchase':
        return '💰';
      case 'settlement':
        return '⚡';
      case 'order':
        return '📋';
      default:
        return '📌';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Dashboard Data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Retrying...' : 'Retry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          Platform analytics and recent activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.total_users.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credits Purchased</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.total_credits_purchased.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.orders.total || 0}
              </p>
              <p className="text-xs text-gray-500">
                +{analytics?.orders.last7Days || 0} last 7 days
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last 30 Days</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.orders.last30Days || 0}
              </p>
              <p className="text-xs text-gray-500">orders placed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Top Selling Products
          </h3>
          {analytics?.top_products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sales data available
            </div>
          ) : (
            <div className="space-y-4">
              {analytics?.top_products.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-light rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.orderCount} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{product.totalCredits.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">credits sold</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent activity found
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-light rounded-lg">
                  <div className="flex-shrink-0 text-2xl">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-gray-500 mt-1">
                        User: {activity.user}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
