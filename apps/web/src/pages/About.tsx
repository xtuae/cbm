import { Link } from 'react-router-dom';

const About = () => {
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
            <li className="text-gray-900">About Us</li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Credits Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted partner for digital credits and marketplace services since 2024.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg mx-auto">
            <h2>Our Mission</h2>
            <p>
              Credits Marketplace is dedicated to providing a secure, transparent, and user-friendly platform
              for purchasing digital credits and services. We believe in empowering businesses and individuals
              with reliable digital marketplace solutions that drive growth and innovation.
            </p>

            <h2>Who We Are</h2>
            <p>
              Founded in 2024, Credits Marketplace emerged from a vision to simplify digital commerce.
              Our experienced team combines expertise in fintech, blockchain, and marketplace operations
              to deliver cutting-edge solutions for modern digital needs.
            </p>

            <h2>Our Values</h2>
            <ul>
              <li><strong>Security First:</strong> Every transaction is protected by industry-leading security measures</li>
              <li><strong>Transparency:</strong> Clear pricing, policies, and processes for all users</li>
              <li><strong>Innovation:</strong> Continuously evolving to meet the changing needs of digital commerce</li>
              <li><strong>Reliability:</strong> Consistent service and support when our customers need it most</li>
            </ul>

            <h2>Our Technology</h2>
            <p>
              Built on modern web technologies and powered by secure payment processing, our platform
              ensures that every digital credit purchase is fast, secure, and immediately available.
              Our infrastructure is designed to handle high volumes while maintaining the highest
              standards of security and performance.
            </p>

            <h2>Join Our Community</h2>
            <p>
              Thousands of users trust Credits Marketplace for their digital marketplace needs.
              Join our growing community and experience the difference that secure, reliable
              digital commerce can make.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Have Questions?</h3>
          <p className="text-gray-600 mb-6">
            We're here to help. Reach out to our team for support with your digital marketplace needs.
          </p>
          <Link
            to="/contact"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
