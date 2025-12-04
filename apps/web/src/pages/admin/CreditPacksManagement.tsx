import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import RichTextEditor from '../../components/RichTextEditor';
import { FeaturedImage, ImageGallery } from '../../components/ImageGallery';
import { SlugInput } from '../../components/SlugInput';

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
  currency?: string;
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
}

interface CategoryOption {
  id: string;
  name: string;
}

const CreditPacksManagement = () => {
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPack, setEditingPack] = useState<CreditPack | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'content' | 'seo'>('basic');

  // Form data with all new fields
  const [formData, setFormData] = useState({
    // Basic
    name: '',
    slug: '',
    credits_amount: '',
    price_fiat: '',
    currency: 'USD',
    is_active: true,
    is_featured: false,

    // Content
    short_description: '',
    long_description: '',
    featured_image_url: '',
    gallery_urls: [] as string[],
    category_ids: [] as string[],

    // SEO
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  useEffect(() => {
    fetchCreditPacks();
    fetchCategories();
  }, []);

  const fetchCreditPacks = async () => {
    try {
      setLoading(true);
      const data = await adminApi.get('/admin/credit-packs?page=1&limit=50');
      setCreditPacks(data.data || []);
    } catch (err) {
      console.error('Error fetching credit packs:', err);
      setError('Failed to load credit packs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminApi.get('/admin/categories?page=1&limit=100');
      setCategories(data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };



  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      credits_amount: '',
      price_fiat: '',
      currency: 'USD',
      is_active: true,
      is_featured: false,
      short_description: '',
      long_description: '',
      featured_image_url: '',
      gallery_urls: [],
      category_ids: [],
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
    });
    setActiveSection('basic');
  };

  const handleCreate = () => {
    resetForm();
    setEditingPack(null);
    setShowCreateModal(true);
  };

  const handleEdit = (pack: CreditPack) => {
    setFormData({
      name: pack.name,
      slug: pack.slug,
      credits_amount: pack.credit_amount.toString(),
      price_fiat: pack.price_usd.toString(),
      currency: pack.currency || 'USD',
      is_active: pack.is_active,
      is_featured: pack.is_featured,
      short_description: pack.short_description || '',
      long_description: pack.long_description || '',
      featured_image_url: pack.featured_image_url || '',
      gallery_urls: pack.gallery_urls || [],
      category_ids: pack.categories.map(c => c.id),
      seo_title: pack.seo_title || '',
      seo_description: pack.seo_description || '',
      seo_keywords: pack.seo_keywords || '',
    });
    setEditingPack(pack);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validate form
    if (!formData.name.trim() || !formData.credits_amount || !formData.price_fiat) {
      setError('Please fill in all required basic fields');
      setActiveSection('basic');
      return;
    }

    const creditsAmount = parseInt(formData.credits_amount);
    const priceFiat = parseFloat(formData.price_fiat);

    if (isNaN(creditsAmount) || creditsAmount <= 0) {
      setError('Credits amount must be a positive number');
      setActiveSection('basic');
      return;
    }

    if (isNaN(priceFiat) || priceFiat < 0) {
      setError('Price must be a positive number');
      setActiveSection('basic');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formPayload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        credits_amount: creditsAmount,
        price_fiat: priceFiat,
        currency: formData.currency,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        short_description: formData.short_description.trim() || null,
        long_description: formData.long_description.trim() || null,
        featured_image_url: formData.featured_image_url.trim() || null,
        gallery_urls: formData.gallery_urls,
        category_ids: formData.category_ids,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        seo_keywords: formData.seo_keywords.trim() || null,
      };

      if (editingPack) {
        await adminApi.patch(`/admin/credit-packs/${editingPack.id}`, formPayload);
      } else {
        await adminApi.post('/admin/credit-packs', formPayload);
      }

      setShowCreateModal(false);
      resetForm();
      fetchCreditPacks(); // Refresh data

    } catch (err) {
      console.error('Error saving credit pack:', err);
      setError(err instanceof Error ? err.message : 'Failed to save credit pack');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (packId: string) => {
    if (!confirm('Are you sure you want to delete this credit pack? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.delete(`/admin/credit-packs/${packId}`);
      fetchCreditPacks(); // Refresh data

    } catch (err) {
      console.error('Error deleting credit pack:', err);
      setError('Failed to delete credit pack');
    }
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      category_ids: checked
        ? [...prev.category_ids, categoryId]
        : prev.category_ids.filter(id => id !== categoryId)
    }));
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Packs Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage available credit packages for sale
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Pack
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {creditPacks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No credit packs found</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first credit pack to get started.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditPacks.map((pack) => (
                    <tr key={pack.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pack.name}</div>
                        {pack.short_description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {pack.short_description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pack.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-sm font-medium text-gray-900">
                          ${pack.price_usd?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pack.credit_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pack.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pack.is_active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pack.is_featured
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pack.is_featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(pack)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pack.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 mb-6">
                {editingPack ? 'Edit Product' : 'Create New Product'}
              </h3>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'basic', label: 'Basic Info' },
                    { id: 'content', label: 'Content' },
                    { id: 'seo', label: 'SEO' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSection(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeSection === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                {activeSection === 'basic' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Premium Credit Pack"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SlugInput
                        label="Slug (URL)"
                        value={formData.slug}
                        onChange={(slug) => setFormData(prev => ({ ...prev, slug }))}
                        baseSlug={formData.name}
                        placeholder="auto-generated-slug"
                        onValidate={async (slug) => {
                          if (!slug || slug.trim().length === 0) {
                            return { isValid: false, message: 'Slug is required' };
                          }

                          try {
                            // Check uniqueness only when editing or if slug exists
                            if (editingPack?.slug !== slug) {
                              const response = await fetch(`/api/v1/credit-packs?slug_check=${encodeURIComponent(slug)}`);
                              if (response.status === 409) {
                                return { isValid: false, message: `Slug "${slug}" is already in use` };
                              }
                            }
                            return { isValid: true };
                          } catch (error) {
                            return { isValid: false, message: 'Failed to validate slug' };
                          }
                        }}
                        helperText="Auto-generated from product name, manually editable"
                      />

                      <div>
                        <label htmlFor="credits_amount" className="block text-sm font-medium text-gray-700 mb-2">
                          Credits Amount *
                        </label>
                        <input
                          type="number"
                          id="credits_amount"
                          value={formData.credits_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, credits_amount: e.target.value }))}
                          min="1"
                          required
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price_fiat" className="block text-sm font-medium text-gray-700 mb-2">
                          Price *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id="price_fiat"
                            value={formData.price_fiat}
                            onChange={(e) => setFormData(prev => ({ ...prev, price_fiat: e.target.value }))}
                            min="0.01"
                            step="0.01"
                            required
                            className="block w-full pl-7 pr-12 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="10.00"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">USD</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          id="currency"
                          value={formData.currency}
                          onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.credits_amount && formData.price_fiat && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Rate:</span> ${((parseFloat(formData.price_fiat) / parseInt(formData.credits_amount))).toFixed(4)} per credit
                        </p>
                      )}

                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Active (available for purchase)</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Featured (highlighted in marketplace)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                {activeSection === 'content' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description
                      </label>
                      <textarea
                        id="short_description"
                        value={formData.short_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                        rows={3}
                        maxLength={200}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief summary for product cards and listings..."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.short_description.length}/200 characters
                      </p>
                    </div>

                    <div>
                      <label htmlFor="long_description" className="block text-sm font-medium text-gray-700 mb-2">
                        Long Description
                      </label>
                      <RichTextEditor
                        value={formData.long_description}
                        onChange={(value) => setFormData(prev => ({ ...prev, long_description: value }))}
                        placeholder="Detailed product description with features, benefits, and usage instructions..."
                        height={200}
                      />
                      <p className="mt-1 text-xs text-gray-500">Supports rich text formatting (headings, bold, italic, lists, links)</p>
                    </div>

                    <FeaturedImage
                      url={formData.featured_image_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
                    />

                    <ImageGallery
                      images={formData.gallery_urls}
                      onChange={(images) => setFormData(prev => ({ ...prev, gallery_urls: images }))}
                      maxImages={10}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Categories
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.category_ids.includes(category.id)}
                              onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </label>
                        ))}
                      </div>
                      {categories.length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">No categories available. Create categories first in the Categories section.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* SEO Section */}
                {activeSection === 'seo' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        id="seo_title"
                        value={formData.seo_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                        maxLength={70}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Custom page title for search engines"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.seo_title.length}/70 characters (leave empty for auto-generation)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Description
                      </label>
                      <textarea
                        id="seo_description"
                        value={formData.seo_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                        rows={3}
                        maxLength={160}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Meta description for search result snippets"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.seo_description.length}/160 characters (appears in search results)
                      </p>
                    </div>

                    <div>
                      <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Keywords
                      </label>
                      <input
                        type="text"
                        id="seo_keywords"
                        value={formData.seo_keywords}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                        maxLength={255}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Comma-separated keywords for search optimization ({formData.seo_keywords.length}/255)
                      </p>
                    </div>

                    {/* SEO Preview */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">SEO Preview</h4>
                      <div className="space-y-2">
                        <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                          {formData.seo_title || `${formData.name} - Credits Marketplace`}
                        </div>
                        <div className="text-green-700 text-sm">
                          creditsmarketplace.com/products/{formData.slug || 'your-product-slug'}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {formData.seo_description || `Buy ${formData.name} with ${formData.credits_amount} credits for $${formData.price_fiat}. High-quality digital credits for all your needs.`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setActiveSection('basic')}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        activeSection === 'basic'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Basic Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('content')}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        activeSection === 'content'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Content
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('seo')}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        activeSection === 'seo'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      SEO
                    </button>
                  </div>

                  <div className="flex space-x-3">
                    {editingPack && formData.slug && (
                      <a
                        href={`/products/${formData.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View on Site
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                        setEditingPack(null);
                        setError(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting
                        ? (editingPack ? 'Updating...' : 'Creating...')
                        : (editingPack ? 'Update Product' : 'Create Product')
                      }
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditPacksManagement;
