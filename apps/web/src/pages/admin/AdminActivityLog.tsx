import { useEffect, useState } from 'react';

interface AdminActivityLogEntry {
  id: string;
  admin_user_id: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  metadata: any;
  old_values: any;
  new_values: any;
  created_at: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
}

const AdminActivityLog = () => {
  const [activities, setActivities] = useState<AdminActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [adminFilter, setAdminFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchActivityLog();
  }, [page, adminFilter, actionFilter, entityFilter, dateFrom, dateTo]);

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (adminFilter) params.append('admin_user_id', adminFilter);
      if (actionFilter) params.append('action_type', actionFilter);
      if (entityFilter) params.append('entity_type', entityFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(`/api/v1/admin/activity-logs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setActivities(data.data || []);
      setHasNext(data.pagination.has_next);
      setHasPrev(data.pagination.has_prev);

    } catch (err) {
      console.error('Error fetching activity log:', err);
      setError('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return '➕';
      case 'updated':
        return '✏️';
      case 'deleted':
        return '🗑️';
      default:
        return '📋';
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'credit_pack':
        return '💎';
      case 'category':
        return '🏷️';
      case 'page':
        return '📄';
      case 'nila_transfer':
        return '⚡';
      case 'order':
        return '🛒';
      case 'user':
        return '👤';
      default:
        return '📝';
    }
  };

  const formatActivityDescription = (activity: AdminActivityLogEntry) => {
    const action = activity.action_type;
    const entity = activity.entity_type.replace('_', ' ');
    const adminName = activity.profiles?.full_name || activity.profiles?.email || 'Unknown Admin';

    let description = `${adminName} ${action} a ${entity}`;

    // Add specific details based on the entity and action
    if (activity.new_values) {
      if (activity.entity_type === 'credit_pack' && activity.new_values.name) {
        description += ` "${activity.new_values.name}"`;
      } else if (activity.entity_type === 'nila_transfer' && activity.new_values.nila_amount) {
        description += ` (${activity.new_values.nila_amount} NILA)`;
      }
    }

    return description;
  };

  const renderValueChanges = (activity: AdminActivityLogEntry) => {
    const changes = [];

    // Show key changes
    if (activity.action_type === 'updated' && activity.old_values && activity.new_values) {
      const keys = new Set([...Object.keys(activity.old_values), ...Object.keys(activity.new_values)]);

      for (const key of keys) {
        const oldVal = activity.old_values[key];
        const newVal = activity.new_values[key];

        if (oldVal !== newVal) {
          changes.push({
            key: key.replace(/_/g, ' '),
            old: oldVal,
            new: newVal
          });
        }
      }
    } else if (activity.action_type === 'created' && activity.new_values) {
      changes.push({
        key: 'Created with values',
        old: null,
        new: 'See details'
      });
    }

    if (changes.length === 0) return null;

    return (
      <div className="mt-3 pl-4 border-l-2 border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Changes:</h5>
        <div className="space-y-1">
          {changes.map((change, index) => (
            <div key={index} className="text-xs">
              <span className="font-medium capitalize">{change.key}:</span>{' '}
              {change.old !== null ? (
                <span className="text-red-600 line-through">{String(change.old)}</span>
              ) : (
                <span className="text-gray-500">(empty)</span>
              )}
              {' → '}
              <span className="text-green-600">{String(change.new)}</span>
            </div>
          ))}
        </div>
      </div>
    );
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Activity Log</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track all administrative actions for audit purposes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity Type
            </label>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Entities</option>
              <option value="credit_pack">Credit Pack</option>
              <option value="category">Category</option>
              <option value="page">Page</option>
              <option value="nila_transfer">NILA Transfer</option>
              <option value="order">Order</option>
              <option value="user">User</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setAdminFilter('');
                setActionFilter('');
                setEntityFilter('');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Activity Log ({activities.length} entries)
          </h3>

          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activity logs found matching your filters
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getActivityIcon(activity.action_type)}
                    </div>

                    <div className="flex-shrink-0 text-2xl">
                      {getEntityIcon(activity.entity_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {formatActivityDescription(activity)}
                      </p>

                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          {new Date(activity.created_at).toLocaleString()}
                        </span>

                        {activity.entity_id && (
                          <span>
                            ID: {activity.entity_id}
                          </span>
                        )}
                      </div>

                      {renderValueChanges(activity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {(hasNext || hasPrev) && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              {hasPrev && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {hasNext && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {hasPrev && (
                    <button
                      onClick={() => setPage(page - 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      ←
                    </button>
                  )}

                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {page}
                  </span>

                  {hasNext && (
                    <button
                      onClick={() => setPage(page + 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      →
                    </button>
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLog;
