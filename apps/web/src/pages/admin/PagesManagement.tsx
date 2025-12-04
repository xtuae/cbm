import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import RichTextEditor from '../../components/RichTextEditor';

interface Page {
  id: string;
  slug: string;
  title: string;
  content?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  created_at: string;
  updated_at: string;
}

const SYSTEM_PAGES = [
  { slug: 'about', title: 'About Us' },
  { slug: 'contact', title: 'Contact Us' },
  { slug: 'terms-of-use', title: 'Terms of Use' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'refund-policy', title: 'Refund Policy' },
  { slug: 'delivery-shipping', title: 'Delivery & Shipping' },
  { slug: 'licenses', title: 'Licenses' },
];

const PagesManagement = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await adminApi.get('/admin/pages?page=1&limit=100');
      const existingPages = data.data || [];

      // Ensure system pages exist, create them if not
      const missingPages = SYSTEM_PAGES.filter(systemPage =>
        !existingPages.some((page: Page) => page.slug === systemPage.slug)
      );

      if (missingPages.length > 0) {
        await seedSystemPages(missingPages);
        // Re-fetch after seeding
        return fetchPages();
      }

      setPages(existingPages);
    } catch (err) {
      console.error('Error fetching pages:', err);
      setError('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const seedSystemPages = async (pagesToSeed: typeof SYSTEM_PAGES) => {
    try {
      const promises = pagesToSeed.map(page =>
        adminApi.post('/admin/pages', {
          slug: page.slug,
          title: page.title,
          content: getDefaultContent(page.slug),
          seo_title: `${page.title} - Credits Marketplace`,
          seo_description: `Learn about our ${page.title.toLowerCase()} and policies.`,
          seo_keywords: `${page.slug}, ${page.title}, credits marketplace`,
        })
      );

      await Promise.all(promises);
    } catch (err) {
      console.error('Error seeding system pages:', err);
    }
  };

  const getDefaultContent = (slug: string): string => {
    const defaults: Record<string, string> = {
      'about': `# About Us\n\nWelcome to Credits Marketplace, your trusted platform for digital credit solutions.\n\n## Our Mission\n\nWe strive to provide high-quality digital credits for all your needs.\n\n## Our Team\n\nOur dedicated team works around the clock to ensure your satisfaction.`,
      'contact': `# Contact Us\n\nGet in touch with our team for any questions or support.\n\n## Customer Support\n\nEmail: support@creditsmarketplace.com\nPhone: +1 (555) 123-4567\n\n## Business Hours\n\nMonday - Friday: 9:00 AM - 6:00 PM EST\nSaturday: 10:00 AM - 4:00 PM EST\nSunday: Closed`,
      'terms-of-use': `# Terms of Use\n\nPlease read these terms carefully before using our services.\n\n## 1. Acceptance of Terms\n\nBy accessing and using Credits Marketplace, you accept and agree to be bound by the terms and provision of this agreement.\n\n## 2. Use License\n\nPermission is granted to temporarily download one copy of the materials on Credits Marketplace for personal, non-commercial transitory viewing only.`,
      'privacy-policy': `# Privacy Policy\n\nYour privacy is important to us. This privacy policy explains how we collect, use, and protect your information.\n\n## Information We Collect\n\nWe collect information you provide directly to us, such as when you create an account or make a purchase.\n\n## How We Use Your Information\n\nWe use the information we collect to provide, maintain, and improve our services.`,
      'refund-policy': `# Refund Policy\n\nLearn about our refund and return policies.\n\n## Refund Eligibility\n\nItems may be eligible for refund within 30 days of purchase if they meet our quality standards.\n\n## Return Process\n\nPlease contact our customer service team to initiate a return.\n\n## Processing Time\n\nRefunds are typically processed within 5-7 business days.`,
      'delivery-shipping': `# Delivery & Shipping\n\nInformation about our delivery and shipping policies.\n\n## Shipping Options\n\nWe offer standard and express shipping options.\n\n## Delivery Times\n\nStandard shipping: 3-7 business days\nExpress shipping: 1-2 business days\n\n## Shipping Costs\n\nShipping costs are calculated based on weight and destination.`,
      'licenses': `# Licenses\n\nThird-party licenses and attributions.\n\n## Open Source Libraries\n\nWe use various open source libraries in our platform.\n\n## Licenses\n\nAll open source components are licensed under their respective licenses.`
    };

    return defaults[slug] || '# Page Content\n\nEdit this page to add your content.';
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
    });
  };

  const handleEdit = (page: Page) => {
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content || '',
      seo_title: page.seo_title || '',
      seo_description: page.seo_description || '',
      seo_keywords: page.seo_keywords || '',
    });
    setEditingPage(page);
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !editingPage) return;

    try {
      setSubmitting(true);
      setError(null);

      await adminApi.patch(`/admin/pages/${editingPage.id}`, {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content.trim() || null,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        seo_keywords: formData.seo_keywords.trim() || null,
      });

      setShowEditModal(false);
      resetForm();
      setEditingPage(null);
      fetchPages(); // Refresh data

    } catch (err) {
      console.error('Error updating page:', err);
      setError(err instanceof Error ? err.message : 'Failed to update page');
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pages Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage content for static pages and legal documents
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {pages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pages found</h3>
            <p className="mt-1 text-sm text-gray-500">System pages will be created automatically.</p>
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
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {page.title}
                        </div>
                        {page.content && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {page.content.length > 100
                              ? `${page.content.substring(0, 100)}...`
                              : page.content.replace(/[#*`]/g, '').substring(0, 60) + '...'
                            }
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          /{page.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(page)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
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

      {/* Edit Modal */}
      {showEditModal && editingPage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 mb-6">
                Edit Page: {formData.title}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter page title"
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (URL) <span className="text-xs text-gray-500">Read-only</span>
                    </label>
                    <input
                      type="text"
                      id="slug"
                      value={formData.slug}
                      readOnly
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 cursor-not-allowed focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">System page slugs cannot be changed</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content (Rich Text) *
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Enter page content..."
                    height={300}
                  />
                  <p className="mt-1 text-xs text-gray-500">Supports rich text formatting (headings, bold, italic, lists, links)</p>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h4>

                  <div className="space-y-4">
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
                      <p className="mt-1 text-xs text-gray-500">{formData.seo_title.length}/70 characters</p>
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
                      <p className="mt-1 text-xs text-gray-500">{formData.seo_description.length}/160 characters</p>
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
                      <p className="mt-1 text-xs text-gray-500">{formData.seo_keywords.length}/255 characters</p>
                    </div>

                    {/* SEO Preview */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">SEO Preview</h5>
                      <div className="space-y-2">
                        <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                          {formData.seo_title || `${formData.title} - Credits Marketplace`}
                        </div>
                        <div className="text-green-700 text-sm">
                          creditsmarketplace.com/pages/{formData.slug}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {formData.seo_description || `Learn more about ${formData.title} on our platform.`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                      setEditingPage(null);
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
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesManagement;
