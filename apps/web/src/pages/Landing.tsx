import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-light-50 to-white py-32">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="headline-xl text-gray-900 mb-6">
              Secure Digital Services
              <br />
              <span className="text-primary">Credits Platform</span>
            </h1>
            <p className="body-lg text-gray-light-600 max-w-3xl mx-auto mb-12">
              Access premium digital marketplace using our secure credit system.
              Manage your platform balance efficiently and scale your operations with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user ? (
                <>
                  <Link
                    to="/marketplace"
                    className="bg-primary hover:bg-primary-hover text-white px-8 py-3 text-lg font-medium rounded-large transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary-hover text-lg font-medium transition-colors px-8 py-3"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-3 text-lg font-medium rounded-large transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-light-50">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="headline-md text-gray-900 mb-4">
              Why Choose Our Platform
            </h2>
            <p className="body-lg text-gray-light-600 max-w-2xl mx-auto">
              Experience a secure and efficient way to manage your digital assets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Credits</h3>
              <p className="text-gray-light-600 leading-relaxed">
                Purchase and manage credits with enterprise-grade security and full transaction tracking
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Access</h3>
              <p className="text-gray-light-600 leading-relaxed">
                Get immediate access to digital services upon purchase with zero waiting time
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Transparency</h3>
              <p className="text-gray-light-600 leading-relaxed">
                Track every transaction with detailed ledger history and full audit trail
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="headline-md text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="body-lg text-gray-light-600 max-w-2xl mx-auto">
              Simple 3-step process to get started with digital services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Credits</h3>
              <p className="text-gray-light-600 leading-relaxed">
                Browse our marketplace and select the credit pack that fits your needs
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Payment</h3>
              <p className="text-gray-light-600 leading-relaxed">
                Secure payment processing through our trusted payment gateway
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Using Services</h3>
              <p className="text-gray-light-600 leading-relaxed">
                Access your credits immediately and use them across our platform
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
