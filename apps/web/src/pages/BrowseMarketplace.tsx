import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import WishlistButton from '../components/WishlistButton';
import { EmptyMarketplace } from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CreditPack {
  id: string;
  name: string;
  description: string;
  credit_amount: number;
  price_usd: number;
  created_at: string;
  updated_at: string;
  categories: Category[];
}

const BrowseMarketplace = () => {
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(12); // Show 12 items per page
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch categories and credit packs
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories([{ id: 'all', name: 'All', slug: 'all' }, ...(data || [])]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [supabase]);

  const fetchCreditPacks = useCallback(async () => {
    try {
      let query = supabase
        .from('credit_packs')
        .select(`
          *,
          categories:credit_pack_categories!inner(
            categories!inner(*)
          )
        `)
        .eq('is_active', true);

      // Apply category filter
      if (selectedCategory && selectedCategory !== 'all') {
        // For category filtering, we need to filter via the join
        query = supabase
          .from('credit_packs')
          .select(`
            *,
            categories:credit_pack_categories!inner(
              categories!inner(*)
            )
          `)
          .eq('is_active', true)
          .in('id',
            await supabase
              .from('credit_pack_categories')
              .select('credit_pack_id')
              .eq('category_id', selectedCategory)
              .then(result => result.data ? result.data.map(item => item.credit_pack_id) : [])
          );
      }

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm.trim()}%,description.ilike.%${searchTerm.trim()}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price_usd', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price_usd', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'recommended':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply limit
      query = query.limit(50);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching credit packs:', error);
        return;
      }

      // Transform the data to match the expected format
      const transformedData = (data || []).map(pack => ({
        ...pack,
        categories: pack.categories ? pack.categories.map((cat: any) => cat.categories) : []
      }));

      setCreditPacks(transformedData);
    } catch (error) {
      console.error('Error fetching credit packs:', error);
    }
  }, [selectedCategory, searchTerm, sortBy, supabase]);

  useEffect(() => {
    const initializeData = async () => {
      await fetchCategories();
      await fetchCreditPacks();
      setLoading(false);
    };
    initializeData();
  }, []);

  useEffect(() => {
    fetchCreditPacks();
  }, [fetchCreditPacks, selectedCategory, sortBy, searchTerm]);

  // Calculate pagination when credit packs change
  useEffect(() => {
    const totalPages = Math.ceil(creditPacks.length / pageSize);
    setTotalPages(totalPages);
    setTotalCount(creditPacks.length);

    // Reset to first page if current page exceeds total pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [creditPacks.length, pageSize, currentPage]);

  const handlePurchase = async (packId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setProcessingId(packId);

      const pack = creditPacks.find(p => p.id === packId);
      if (!pack) {
        throw new Error('Credit pack not found');
      }

      // Use RPC function for order creation with business logic
      const { data, error } = await supabase.rpc('create_order', {
        p_credit_pack_id: packId,
        p_quantity: 1, // Single purchase for marketplace
        p_total_amount: pack.price_usd
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.order_id) {
        throw new Error('Order creation failed - no order ID returned');
      }

      // In production, would redirect to payment gateway
      // For demo purposes, we'll navigate to the payment page
      navigate(`/payment/${data.order_id}`);

    } catch (error) {
      console.error('Error purchasing credit pack:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Get paginated products
  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return creditPacks.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        {/* Header Section */}
        <header className="py-16">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
            <h1 className="headline-lg text-gray-900 mb-4">
              Marketplace
            </h1>
            <p className="body-lg text-gray-light-600 max-w-2xl mx-auto">
              Discover digital credits for your platform needs
            </p>
          </div>
        </header>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          {/* Toolbar Skeleton */}
          <div className="bg-gray-light-50 rounded-large p-6 mb-12">
            <div className="h-12 bg-gray-light-200 rounded-large mb-6"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-light-200 rounded-large w-20"></div>
              <div className="h-10 bg-gray-light-200 rounded-large w-24"></div>
              <div className="h-10 bg-gray-light-200 rounded-large w-16"></div>
            </div>
          </div>
          {/* Product Grid Skeleton */}
          <LoadingState type="products" columns={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <header className="py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <h1 className="headline-lg text-gray-900 mb-4">
            Marketplace
          </h1>
          <p className="body-lg text-gray-light-600 max-w-2xl mx-auto">
            Discover digital credits for your platform needs
          </p>
        </div>
      </header>

        <div className="container-max">
          {/* Toolbar Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Category Dropdown */}
            <div className="flex-1 max-w-xs">
              <select
                value={selectedCategory || 'all'}
                onChange={(e) => {
                  handleCategorySelect(e.target.value);
                  setCurrentPage(1);
                }}
                className="select w-full"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search credit packs..."
                  className="input pl-10 w-full"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex-1 max-w-xs">
              <select
                value={sortBy}
                onChange={(e) => {
                  handleSortChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="select w-full"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
        {totalCount === 0 ? (
          searchTerm || selectedCategory ? (
            // No results for search/filter
            <div className="text-center py-24">
              <svg className="mx-auto h-16 w-16 text-gray-light-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No credit packs found</h3>
              <p className="mt-2 text-gray-light-600">Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                  setCurrentPage(1);
                }}
                className="mt-6 text-primary hover:text-primary-hover transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            // No products in marketplace at all
            <EmptyMarketplace />
          )
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getPaginatedProducts().map((pack) => (
                <div key={pack.id} className="card group hover:shadow-elevated hover:border-gray-300 transition-all duration-200">
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative overflow-hidden">
                    <svg className="w-16 h-16 text-primary/70 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {/* Wishlist Button Overlay */}
                    <WishlistButton
                      creditPackId={pack.id}
                      variant="overlay"
                      size="sm"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    {/* Category Badges */}
                    {pack.categories && pack.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pack.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {category.name}
                          </span>
                        ))}
                        {pack.categories.length > 2 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            +{pack.categories.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {pack.name}
                    </h3>

                    {/* Credits Amount */}
                    <p className="text-primary font-semibold mb-2">
                      {pack.credit_amount.toLocaleString()} Digital Credits
                    </p>

                    {/* Price */}
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      ${pack.price_usd.toFixed(2)}
                    </p>

                    {/* CTA Button */}
                    <Link
                      to={`/marketplace/${pack.id}`}
                      className="btn-primary w-full text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center bg-gray-light-50 rounded-large px-8 py-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-light-600 bg-white border border-gray-light-300 rounded-large hover:bg-gray-light-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 01.001-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    if (pageNum <= 0 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 text-sm font-medium rounded-large transition-colors ${
                          pageNum === currentPage
                            ? 'bg-primary text-white'
                            : 'text-gray-light-600 hover:bg-white hover:text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-light-600 bg-white border border-gray-light-300 rounded-large hover:bg-gray-light-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseMarketplace;
