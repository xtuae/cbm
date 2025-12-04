import { Link } from 'react-router-dom';

const Terms = () => {
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
            <li className="text-gray-900">Terms of Use & Compliance Policy</li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use & Compliance Policy</h1>
          <p className="text-lg text-gray-600">
            Effective Date: January 1, 2024 | Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Credits Marketplace ("Platform"), you accept and agree to be bound by
              the terms and provision of this agreement. If you do not agree to abide by the above, please
              do not use this service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Credits Marketplace provides a digital marketplace where users can purchase credits for various
              digital services and products. Our platform facilitates secure transactions and instant delivery
              of digital goods.
            </p>

            <h2>3. User Accounts</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              To access certain features of our Platform, you must create an account. You agree to provide
              accurate, current, and complete information about yourself during the registration process.
            </p>

            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You agree to immediately notify us of any unauthorized
              use of your account or any other breach of security.
            </p>

            <h2>4. Digital Credits and Purchases</h2>
            <h3>4.1 Credit Purchases</h3>
            <p>
              All purchases of digital credits are final and non-refundable. Credits are delivered instantly
              upon successful payment confirmation and are valid indefinitely unless otherwise specified.
            </p>

            <h3>4.2 Credit Usage</h3>
            <p>
              Digital credits can only be used for legitimate digital services available through our platform.
              Credits cannot be exchanged for cash, transferred to other users, or used for any illegal activities.
            </p>

            <h2>5. Payment and Billing</h2>
            <h3>5.1 Payment Methods</h3>
            <p>
              We accept major credit cards, debit cards, PayPal, and other approved payment processors.
              All payments are processed securely through SSL encryption.
            </p>

            <h3>5.2 Billing Information</h3>
            <p>
              You agree to provide accurate billing information and authorize us to charge your payment method
              for purchases made on our platform. You are responsible for any applicable taxes.
            </p>

            <h2>6. Acceptable Use Policy</h2>
            <p>You agree not to use our platform to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit harmful or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of our platform</li>
              <li>Use credits for fraudulent or illegal activities</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
              All content, features, and functionality of Credits Marketplace are owned by us or our licensors
              and are protected by copyright, trademark, and other intellectual property laws. You may not
              reproduce, distribute, or create derivative works without our express written permission.
            </p>

            <h2>8. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Our collection and use of personal information is governed by
              our Privacy Policy, which is incorporated into these terms by reference.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Credits Marketplace shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising out of or relating
              to your use of the platform.
            </p>

            <h2>10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account and access to our platform at our
              sole discretion, without notice, for conduct that we believe violates these terms or is harmful
              to other users, us, or third parties.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of [Jurisdiction],
              without regard to its conflict of law provisions.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant
              changes via email or through our platform. Continued use of our platform after such modifications
              constitutes acceptance of the updated terms.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Use, please contact us at:
            </p>
            <ul>
              <li>Email: legal@creditsmarketplace.com</li>
              <li>Address: [Company Address]</li>
            </ul>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="bg-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help Understanding These Terms?</h3>
          <p className="text-gray-600 mb-6">
            If you have questions about our terms of service or need clarification on any section,
            our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 text-center"
            >
              Contact Support
            </Link>
            <Link
              to="/policies/privacy"
              className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-3 rounded-md font-medium border border-blue-600 transition-colors duration-200 text-center"
            >
              Read Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
