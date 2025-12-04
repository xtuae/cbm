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
    <div className="min-h-screen bg-white">
      <div className="container-max py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Big product image + gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-32 h-32 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Gallery thumbnails would go here */}
            <div className="flex gap-2">
              {/* Placeholder thumbnails */}
              <div className="w-16 h-16 bg-gray-100 rounded border-2 border-gray-200 cursor-pointer"></div>
              <div className="w-16 h-16 bg-gray-100 rounded border-2 border-primary cursor-pointer"></div>
              <div className="w-16 h-16 bg-gray-100 rounded border-2 border-gray-200 cursor-pointer"></div>
            </div>
          </div>

          {/* Right: Product details */}
          <div className="space-y-6">
            {/* Product name (H1) */}
            <div className="flex items-start justify-between">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {creditPack.name}
              </h1>
              <WishlistButton
                creditPackId={creditPack.id}
                variant="default"
                size="md"
              />
            </div>

            {/* Price */}
            <div className="text-5xl font-bold text-gray-900">
              ${creditPack.price_usd.toFixed(2)}
            </div>

            {/* Credits */}
            <div className="text-xl text-primary font-semibold">
              {creditPack.credit_amount.toLocaleString()} Digital Credits
            </div>

            {/* Short description */}
            <div className="text-lg text-gray-600 leading-relaxed max-w-md">
              {creditPack.short_description || creditPack.description || 'Secure digital credits for premium platform services.'}
            </div>

            {/* Category badges */}
            {creditPack.categories && creditPack.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {creditPack.categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {/* Add to Cart / Buy Now */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handlePurchase('cart')}
                className="btn-secondary flex-1"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handlePurchase('buy')}
                disabled={processingId === creditPack.id}
                className="btn-primary flex-1"
              >
                {processingId === creditPack.id ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Below: Divider + Long description */}
        <div className="mt-16 pt-12 border-t border-light">
          <div className="prose prose-lg max-w-none">
            {creditPack.long_description ? (
              <RichTextDisplay content={creditPack.long_description} />
            ) : (
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  This credit pack contains {creditPack.credit_amount.toLocaleString()} digital credits that can be redeemed for premium services on our platform.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Credits provide instant access to digital goods and services without traditional payment processing. All purchases are secured with enterprise-grade encryption.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Start using your credits immediately or save them for future premium service purchases across our entire platform ecosystem.
                </p>
              </div>
            )}
          </div>

          {/* Optional feature bullets */}
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Instant Delivery</h3>
                <p className="text-sm text-gray-600 mt-1">Credits added immediately upon payment verification</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-600 mt-1">Bank-level encryption and fraud protection</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Never Expires</h3>
                <p className="text-sm text-gray-600 mt-1">Credits remain valid indefinitely for future use</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPackDetail;
