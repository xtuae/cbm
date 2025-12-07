import { useUserCredits } from '../hooks/useUserCredits';

const CreditLedger = () => {
  const { ledger, loading, error } = useUserCredits(1, 50); // Show more items

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'purchase':
        return 'text-green-800 bg-green-100';
      case 'settlement':
        return 'text-red-800 bg-red-100';
      case 'usage':
        return 'text-blue-800 bg-blue-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ledger</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your credit transaction history
        </p>
      </div>

      {ledger.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any credit transactions yet.</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-600">Reference</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-gray-600">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id} className="border-b border-light hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">
                        {formatDate(entry.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(entry.type)}`}>
                        {formatTransactionType(entry.type)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {entry.reference_table === 'orders' ? `Order #${entry.reference_id}` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`text-sm font-medium ${
                        entry.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.change > 0 ? '+' : ''}{entry.change} credits
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.balance_after} credits
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditLedger;
