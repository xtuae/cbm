import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-gray-700">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/policies" className="hover:text-gray-700">Policies</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">Privacy Policy</li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Effective Date: January 1, 2024 | Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">

            <h2>1. Information We Collect</h2>

            <h3>1.1 Personal Information</h3>
            <p>
              We collect information you provide directly to us, such as when you create an account,
              make a purchase, or contact us for support. This may include your name, email address,
              billing information, and payment details.
            </p>

            <h3>1.2 Usage Information</h3>
            <p>
              We automatically collect certain information about your use of our platform, including
              IP addresses, browser type, operating system, referring URLs, pages viewed, and other
              usage data through cookies and similar technologies.
            </p>

            <h2>2. How We Use Your Information</h2>

            <h3>2.1 Providing Services</h3>
            <p>
              We use your information to provide, maintain, and improve our services, including
              processing payments, delivering digital credits, and providing customer support.
            </p>

            <h3>2.2 Communication</h3>
            <p>
              We may use your contact information to send you important updates, account notifications,
              security alerts, and respond to your inquiries.
            </p>

            <h3>2.3 Security and Fraud Prevention</h3>
            <p>
              We use your information to detect, prevent, and respond to security threats, fraud,
              and unauthorized access to your account.
            </p>

            <h2>3. Information Sharing</h2>

            <h3>3.1 Service Providers</h3>
            <p>
              We may share your information with trusted third-party service providers who assist
              us in operating our platform, processing payments, and delivering services.
            </p>

            <h3>3.2 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, legal process, or government request,
              or to protect our rights and safety.
            </p>

            <h3>3.3 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale of assets, your information may be
              transferred to the new entity.
            </p>

            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. This includes
              SSL encryption for all data transmission and secure storage of sensitive information.
            </p>

            <h2>5. Cookies and Tracking</h2>

            <h3>5.1 Essential Cookies</h3>
            <p>
              We use essential cookies to maintain your account session, process payments, and
              ensure our platform functions properly.
            </p>

            <h3>5.2 Analytics Cookies</h3>
            <p>
              We use analytics tools to understand how our platform is used and improve our services.
              You can opt out of non-essential tracking through your browser settings.
            </p>

            <h2>6. Your Rights</h2>

            <h3>6.1 Access and Correction</h3>
            <p>
              You have the right to access, update, and correct your personal information at any time
              through your account settings.
            </p>

            <h3>6.2 Data Deletion</h3>
            <p>
              You can request deletion of your personal information by contacting us. We will respond
              to your request within 30 days as required by applicable privacy laws.
            </p>

            <h3>6.3 Opt-Out</h3>
            <p>
              You can opt out of marketing communications at any time by following the unsubscribe
              links in our emails or contacting us directly.
            </p>

            <h2>7. Third-Party Services</h2>
            <p>
              Our platform may contain links to third-party websites or services. We are not responsible
              for the privacy practices of these external sites. We encourage you to review the privacy
              policies of any third-party services you use.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If we become aware that we have
              collected such information, we will delete it immediately.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own.
              We ensure that adequate safeguards are in place to protect your information during
              international transfers.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes through our platform or by email. Continued use of our services after changes
              become effective constitutes acceptance of the updated policy.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@creditsmarketplace.com</li>
              <li>Address: [Company Address]</li>
            </ul>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Need More Information?</h3>
          <p className="text-gray-600 mb-6">
            If you have specific questions about how we handle your data or want to exercise your
            privacy rights, don't hesitate to reach out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 text-center"
            >
              Contact privacy@creditsmarketplace.com
            </Link>
            <Link
              to="/policies/terms"
              className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-3 rounded-md font-medium border border-blue-600 transition-colors duration-200 text-center"
            >
              Read Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
