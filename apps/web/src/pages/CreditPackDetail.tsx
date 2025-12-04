import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Breadcrumb from '../components/Breadcrumb';
import WishlistButton from '../components/WishlistButton';
import { ProductDetailSkeleton } from '../components/Skeletons';
import { RichTextDisplay } from '../components/RichTextEditor';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CreditPack {
  id: string;
  name: string;
  slug: string;
  credit_amount: number;
  price_usd: number;
  is_active: boolean;
  is_featured: boolean;
  short_description?: string;
  long_description?: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  categories: Category[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at: string;
  updated_at: string;
  // For backward compatibility
  description?: string;
}

const CreditPackDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [creditPack, setCreditPack] = useState<CreditPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCreditPack();
    }
  }, [id]);

  // Update page title and meta tags with SEO data
  useEffect(() => {
    if (creditPack) {
      // Update page title
      document.title = creditPack.seo_title || `${creditPack.name} - Digital Credits Marketplace`;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content',
          creditPack.seo_description ||
          `Buy ${creditPack.name} for $${creditPack.price_usd.toFixed(2)} - ${creditPack.credit_amount.toLocaleString()} digital credits. Instant delivery, secure payment.`
        );
      }

      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content',
          creditPack.seo_keywords ||
          `${creditPack.name}, digital credits, marketplace, buy credits, instant delivery, secure payments`
        );
      }
    }
  }, [creditPack]);

  const fetchCreditPack = async () => {
    try {
      const response = await fetch(`/api/v1/credit-packs`);
      if (response.ok) {
        const data = await response.json();
        const pack = data.find((p: CreditPack) => p.id === id);
        setCreditPack(pack || null);
      }
    } catch (error) {
      console.error('Error fetching credit pack:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = (item: any, qty: number = quantity) => {
    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');

    const cartItem = {
      id: `${item.id}_${Date.now()}`, // Unique ID for cart item
      credit_pack_id: item.id,
      name: item.name,
      credits: item.credit_amount,
      price: item.price_usd,
      quantity: qty,
      processing_fee: 0.99,
    };

    // Add item to cart
    currentCart.push(cartItem);

    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
  };

  const handlePurchase = async (method: 'buy' | 'cart') => {
    if (!creditPack) return;

    if (method === 'cart') {
      // Add to Cart - no auth required
      addToCart(creditPack, quantity);
      alert(`Added ${quantity} x ${creditPack.name} to cart!`);
      return;
    }

    // Buy Now - requires auth
    if (!user) {
      // Store current URL for post-login redirect
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      setProcessingId(creditPack.id);

      // Get the authenticated user's session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          credit_pack_id: creditPack.id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { payment_session } = await response.json();

      // For "Buy Now", go directly to checkout
      // In a real app, this would navigate to a checkout page
      await simulatePaymentSuccess(payment_session.session_id.replace('session_', ''));
      navigate('/dashboard');
    } catch (error) {
      console.error('Error purchasing credit pack:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Mock function to simulate payment success webhook
  const simulatePaymentSuccess = async (orderId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      await fetch('/api/v1/webhooks/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'mock-signature',
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_id: `pay_${Date.now()}`,
          status: 'paid',
          amount: creditPack?.price_usd || 0,
          currency: 'USD',
        }),
      });
    } catch (error) {
      console.error('Error simulating payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb skeleton */}
          <div className="mb-8">
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!creditPack) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.709-2.373C6.288 12.045 7.05 12 7.828 12H12.2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Credit pack not found</h3>
            <p className="mt-1 text-sm text-gray-500">The credit pack you're looking for doesn't exist.</p>
            <div className="mt-6">
              <Link
                to="/marketplace"
                className="text-blue-600 hover:text-blue-500"
              >
                ← Back to Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Build breadcrumb items: Home → Browse Marketplace → [Category] → [Product Name]
  const breadcrumbItems: Array<{ label: string; href?: string; current?: boolean }> = [
    { label: 'Browse Marketplace', href: '/marketplace' },
  ];

  // Add category to breadcrumb if available
  if (creditPack.categories && creditPack.categories.length > 0) {
    const primaryCategory = creditPack.categories[0]; // Use first category
    breadcrumbItems.push({
      label: primaryCategory.name,
      href: `/marketplace?category=${primaryCategory.slug}`
    });
  }

  // Add product name (current page)
  breadcrumbItems.push({ label: creditPack.name, current: true });

  // Badge logic
  const isNew = () => {
    const createdDate = new Date(creditPack.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7; // New if created within last 7 days
  };

  const isPopular = () => Math.random() > 0.7; // Placeholder: 30% chance of being "popular"
  const isOnSale = creditPack.is_featured;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="w-full">
            <div className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden shadow-lg">
              <div className="w-full h-full flex items-center justify-center">
                <svg className="h-24 w-24 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{creditPack.name}</h1>
              <WishlistButton
                creditPackId={creditPack.id}
                variant="default"
                size="md"
              />
            </div>

            {/* Badges */}
            <div className="mt-4 flex items-center flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Digital Good
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                In Stock
              </span>

              {/* NEW badge - if created within 7 days */}
              {isNew() && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  NEW
                </span>
              )}

              {/* POPULAR badge - placeholder based on random chance */}
              {isPopular() && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  POPULAR
                </span>
              )}

              {/* ON SALE badge - if is_featured is true */}
              {isOnSale && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  ON SALE
                </span>
              )}
            </div>

            {/* Price and credits */}
            <div className="mt-6">
              <h2 className="sr-only">Product information</h2>
              <p className="text-4xl text-gray-900 font-bold">${creditPack.price_usd.toFixed(2)}</p>
              <p className="mt-2 text-lg text-blue-600 font-medium">
                {creditPack.credit_amount.toLocaleString()} Credits
              </p>
            </div>

            {/* Categories */}
            {creditPack.categories && creditPack.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {creditPack.categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {/* In-game value placeholder */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900">Internal Value</h3>
              <p className="mt-1 text-sm text-gray-600">
                This credit pack provides {creditPack.credit_amount.toLocaleString()} credits that can be used for any digital service on our platform.
                Credits are non-refundable but never expire.
              </p>
            </div>

            <form className="mt-8">
              {/* Quantity */}
              <div className="flex items-center">
                <label htmlFor="quantity" className="mr-4 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <select
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  className="max-w-full rounded-md border border-gray-300 py-1.5 text-base leading-5 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handlePurchase('buy')}
                  disabled={processingId === creditPack.id}
                  className="flex-1 bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {processingId === creditPack.id ? 'Processing...' : `Buy Now - $${(creditPack.price_usd * quantity).toFixed(2)}`}
                </button>
                <button
                  onClick={() => handlePurchase('cart')}
                  disabled={processingId === creditPack.id}
                  className="flex-1 bg-white border border-gray-300 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>
            </form>

            {/* Description tabs */}
            <div className="mt-16">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setSelectedTab('description')}
                    className={`whitespace-nowrap py-6 border-b-2 font-medium text-sm ${
                      selectedTab === 'description'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setSelectedTab('details')}
                    className={`whitespace-nowrap py-6 border-b-2 font-medium text-sm ${
                      selectedTab === 'details'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Details
                  </button>
                </nav>
              </div>

              <div className="py-6">
                {selectedTab === 'description' ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">About this Credit Pack</h3>
                    <div className="text-base text-gray-700 space-y-6">
                      {creditPack.long_description ? (
                        <RichTextDisplay content={creditPack.long_description} />
                      ) : (
                        <>
                          <p>This credit pack contains {creditPack.credit_amount.toLocaleString()} credits that can be redeemed for any digital service available on our platform.</p>
                          <p>
                            Credits provide instant access to premium digital goods and services without the need for traditional payment methods.
                            All purchases are processed securely, and credits are added to your account immediately upon successful payment verification.
                          </p>
                          <p>
                            Start using your credits right away or save them for future digital service purchases.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Pack Details</h3>
                    <div className="border-t border-gray-200">
                      <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Credits Included</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {creditPack.credit_amount.toLocaleString()} Credits
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Type</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            Digital Goods Credit Pack
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Categories</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {creditPack.categories && creditPack.categories.length > 0
                              ? creditPack.categories.map(cat => cat.name).join(', ')
                              : 'General'
                            }
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Delivery</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            Instant - Credits added immediately upon payment
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPackDetail;
