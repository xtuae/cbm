import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  credit_balance: number;
  wallet_addresses: Array<{
    id: string;
    network: string;
    address: string;
    label: string | null;
    is_primary: boolean;
    is_verified: boolean;
  }>;
}

interface CreditPack {
  id: string;
  name: string;
  credit_amount: number;
  price_usd: number;
}

const CreateSettlement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [creditsAmount, setCreditsAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Fetch all users
      const usersResponse = await fetch('http://localhost:3000/api/v1/admin/users?page=1&limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      }

      // In a real implementation, you'd fetch credit packs from an API
      // For demo purposes, let's simulate some credit packs
      setCreditPacks([
        { id: '1', name: 'Basic Pack', credit_amount: 100, price_usd: 10.00 },
        { id: '2', name: 'Pro Pack', credit_amount: 500, price_usd: 45.00 },
        { id: '3', name: 'Enterprise Pack', credit_amount: 1000, price_usd: 85.00 },
      ]);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setSelectedWallet(user.wallet_addresses.length > 0 ? user.wallet_addresses[0].id : '');
      if (user.wallet_addresses.length > 0) {
        setSelectedNetwork(user.wallet_addresses[0].network);
      }
    }
  };

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
    const wallet = selectedUser?.wallet_addresses.find(w => w.id === walletId);
    if (wallet) {
      setSelectedNetwork(wallet.network);
    }
  };

  const calculateNilaAmount = (credits: number) => {
    // Simple conversion: 1 USD worth of credits = 1 NILA token
    // This would be based on your platform's exchange rate
    return credits * 0.1; // Example: 100 credits (worth $10) = 10 NILA
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedWallet || !creditsAmount || !selectedNetwork) {
      setError('Please fill in all required fields');
      return;
    }

    const creditsToDeduct = parseInt(creditsAmount);
    if (isNaN(creditsToDeduct) || creditsToDeduct <= 0) {
      setError('Invalid credit amount');
      return;
    }

    if (creditsToDeduct > selectedUser.credit_balance) {
      setError(`User only has ${selectedUser.credit_balance} credits available`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const wallet = selectedUser.wallet_addresses.find(w => w.id === selectedWallet);
      if (!wallet) {
        setError('Selected wallet not found');
        return;
      }

      const nilaAmount = calculateNilaAmount(creditsToDeduct);

      const settlementData = {
        user_id: selectedUser.id,
        credits_used: creditsToDeduct,
        nila_amount: nilaAmount,
        network: selectedNetwork,
        wallet_address: wallet.address,
        notes: notes.trim() || null,
      };

      const response = await fetch('http://localhost:3000/api/v1/admin/nila-transfers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settlementData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create settlement');
      }

      const result = await response.json();
      setSuccess(`Settlement created successfully! ${creditsToDeduct} credits deducted, ${nilaAmount} NILA will be sent to ${wallet.address}`);

      // Reset form
      setSelectedUser(null);
      setSelectedWallet('');
      setSelectedNetwork('');
      setCreditsAmount('');
      setNotes('');

      // Refresh users data
      fetchData();

    } catch (err) {
      console.error('Error creating settlement:', err);
      setError(err instanceof Error ? err.message : 'Failed to create settlement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Settlement</h1>
        <p className="mt-2 text-sm text-gray-600">
          Process $NILA token settlements for user credits
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Select User */}
          <div className="md:col-span-2">
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
              Select User *
            </label>
            <select
              id="user"
              value={selectedUser?.id || ''}
              onChange={(e) => handleUserSelect(e.target.value)}
              required
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} - {user.credit_balance} credits - {user.wallet_addresses.length} wallets
                </option>
              ))}
            </select>
          </div>

          {/* User Details */}
          {selectedUser && (
            <>
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {(selectedUser.full_name || selectedUser.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUser.full_name || 'Unnamed User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {selectedUser.credit_balance} Credits Available
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Wallet */}
              {selectedUser.wallet_addresses.length > 0 && (
                <div>
                  <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Wallet Address *
                  </label>
                  <select
                    id="wallet"
                    value={selectedWallet}
                    onChange={(e) => handleWalletSelect(e.target.value)}
                    required
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {selectedUser.wallet_addresses.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.label || wallet.network} - {wallet.address.slice(0, 8)}...
                        {wallet.is_primary && ' (Primary)'}
                        {wallet.is_verified ? ' ✅' : ' ⚠️'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Credits Amount */}
              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-2">
                  Credits to Convert *
                </label>
                <input
                  type="number"
                  id="credits"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(e.target.value)}
                  min="1"
                  max={selectedUser.credit_balance}
                  required
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter credits amount"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Available: {selectedUser.credit_balance} credits
                  {creditsAmount && ` • Will send: ${calculateNilaAmount(parseInt(creditsAmount))} NILA`}
                </p>
              </div>

              {/* Network (Auto-filled) */}
              <div>
                <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-2">
                  Blockchain Network *
                </label>
                <input
                  type="text"
                  id="network"
                  value={selectedNetwork}
                  disabled
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Auto-selected based on wallet</p>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about this settlement..."
                />
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !selectedUser}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating Settlement...' : 'Create Settlement'}
          </button>
        </div>
      </form>

      {selectedUser && selectedUser.wallet_addresses.length === 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          ⚠️ This user has no wallet addresses configured. They won't be able to receive NILA tokens.
        </div>
      )}
    </div>
  );
};

export default CreateSettlement;
