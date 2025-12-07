import { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import PackCard from '../marketplace/PackCard';

interface CreditPack {
  id: string;
  name: string;
  description: string;
  credit_amount: number;
  price_usd: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  categories?: any[];
}

const TopPacksGrid = () => {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  // const { addItem } = useCart(); // Not used in this component

  useEffect(() => {
    const fetchTopPacks = async () => {
      try {
        // Fetch credit packs, prioritizing featured
        const { data, error } = await supabase
          .from('credit_packs')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(8);

        console.log('Fetched credit packs data:', data, 'error:', error, 'data length:', data?.length);

        if (error) {
          console.error('Error fetching top credit packs:', error);
          // Fallback to any active packs if no featured ones
          const fallback = await supabase
            .from('credit_packs')
            .select(`
              *,
              categories:credit_pack_categories!inner(
                categories!inner(*)
              )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(8);

          if (fallback.error || !fallback.data) {
            // Use placeholder data if Supabase is not available
            const placeholderPacks = [
              { id: '39b13f3c-e46c-4fb7-9e83-349b74d4c23e', name: 'Gaming Credits Bundle', description: 'Perfect for gaming platforms', credit_amount: 500, price_usd: 29.99, is_featured: true, is_active: true, created_at: new Date().toISOString(), categories: [] },
              { id: '702ddea0-b04c-4493-8982-da12e64b3cbc', name: 'Cloud Storage Pack', description: 'Extra cloud storage credits', credit_amount: 1000, price_usd: 49.99, is_featured: false, is_active: true, created_at: new Date().toISOString(), categories: [] },
              { id: 'd7d024c0-2d13-4f39-93df-73c8fda36164', name: 'API Premium Pack', description: 'Enhanced API access credits', credit_amount: 750, price_usd: 39.99, is_featured: true, is_active: true, created_at: new Date().toISOString(), categories: [] },
              { id: '001a9a92-1fb2-45da-a993-709b53b4ecb4', name: 'Data Analytics Bundle', description: 'Analytics processing credits', credit_amount: 1200, price_usd: 69.99, is_featured: false, is_active: true, created_at: new Date().toISOString(), categories: [] }
            ];
            setPacks(placeholderPacks);
            setLoading(false);
            return;
          }

          const transformedFallback = fallback.data.map(pack => ({
            ...pack,
            categories: pack.categories ? pack.categories.map((cat: any) => cat.categories) : []
          }));
          setPacks(transformedFallback);
        } else if (data && data.length > 0) {
          const transformedData = data.map(pack => ({
            ...pack,
            categories: pack.categories ? pack.categories.map((cat: any) => cat.categories) : []
          }));
          setPacks(transformedData);
        } else {
          // Fallback to any active packs
          const fallback = await supabase
            .from('credit_packs')
            .select(`
              *,
              categories:credit_pack_categories!inner(
                categories!inner(*)
              )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(8);

          if (fallback.error || !fallback.data) {
            const placeholderPacks = Array.from({ length: 8 }, (_, i) => ({
              id: `pack-${i + 1}`,
              name: 'Premium Game Credits',
              description: 'High-quality digital credits for various services',
              credit_amount: 500 + (i * 100),
              price_usd: 29.99 + (i * 5),
              is_featured: i % 3 === 0,
              is_active: true,
              created_at: new Date().toISOString(),
              categories: []
            }));
            setPacks(placeholderPacks);
          } else {
            const transformedFallback = fallback.data.map(pack => ({
              ...pack,
              categories: pack.categories ? pack.categories.map((cat: any) => cat.categories) : []
            }));
            setPacks(transformedFallback);
          }
        }
      } catch (error) {
        console.error('Error in fetchTopPacks:', error);
        // Fallback to placeholder data
        const placeholderPacks = Array.from({ length: 8 }, (_, i) => ({
          id: `pack-${i + 1}`,
          name: 'Premium Game Credits',
          description: 'High-quality digital credits for various services',
          credit_amount: 500 + (i * 100),
          price_usd: 29.99 + (i * 5),
          is_featured: i % 3 === 0,
          is_active: true,
          created_at: new Date().toISOString(),
          categories: []
        }));
        setPacks(placeholderPacks);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPacks();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Top Credit Packs</h2>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (packs.length === 0) {
    return (
      <section className="py-16">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Top Credit Packs</h2>
            <p className="text-gray-400">Popular choices from our marketplace</p>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No credit packs available</h3>
            <p className="text-gray-400">We're working on adding credit packs to our marketplace. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Top Credit Packs</h2>
          <p className="text-gray-400">Popular choices from our marketplace</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {packs.map((pack) => (
            <PackCard
              key={pack.id}
              pack={{
                id: pack.id,
                name: pack.name,
                credit_amount: pack.credit_amount,
                price_usd: pack.price_usd,
                categories: pack.categories,
                is_featured: pack.is_featured
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopPacksGrid;
