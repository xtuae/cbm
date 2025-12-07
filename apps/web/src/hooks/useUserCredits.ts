import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreditLedgerEntry {
  id: number;
  change: number;
  type: string;
  balance_after: number;
  created_at: string;
  reference_table: string | null;
  reference_id: number | null;
  orders?: {
    id: number;
    payment_provider: string | null;
    provider_reference: string | null;
    total_credits: number | null;
  } | null;
}

interface CreditStats {
  current_balance: number;
  total_purchased: number;
  total_used: number;
  total_settlements: number;
  transaction_count: number;
}

interface UseUserCreditsReturn {
  balance: number;
  stats: CreditStats | null;
  ledger: CreditLedgerEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserCredits = (page = 1, limit = 10): UseUserCreditsReturn => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch ledger entries with pagination
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('credit_ledger')
        .select(`
          id,
          change,
          type,
          balance_after,
          created_at,
          reference_table,
          reference_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (ledgerError) {
        console.error('Error fetching credit ledger:', ledgerError);
        setError('Failed to load credit data');
        return;
      }

      // Get the most recent balance
      const latestEntry = ledgerData[0];
      const currentBalance = latestEntry?.balance_after || 0;

      // Calculate stats
      const allEntries = ledgerData;
      let totalPurchased = 0;
      let totalUsed = 0;
      let totalSettlements = 0;

      allEntries.forEach(entry => {
        if (entry.change > 0) {
          if (entry.type === 'purchase') {
            totalPurchased += entry.change;
          } else if (entry.type === 'settlement') {
            totalSettlements += entry.change;
          }
        } else if (entry.change < 0) {
          totalUsed += Math.abs(entry.change);
        }
      });

      const creditStats: CreditStats = {
        current_balance: currentBalance,
        total_purchased: totalPurchased,
        total_used: totalUsed,
        total_settlements: totalSettlements,
        transaction_count: allEntries.length,
      };

      setBalance(currentBalance);
      setStats(creditStats);
        setLedger(ledgerData as CreditLedgerEntry[] || []);

    } catch (err) {
      console.error('Error in fetchCredits:', err);
      setError('Failed to load credit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user, page, limit]);

  return {
    balance,
    stats,
    ledger,
    loading,
    error,
    refetch: fetchCredits,
  };
};
