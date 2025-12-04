import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="container-max">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight">
              Digital Services
              <br />
              Marketplace
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-12 md:mb-16 max-w-2xl mx-auto leading-relaxed">
              Access premium digital marketplace with secure credit system.
              Manage your balance and scale operations with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/marketplace"
                className="btn-primary text-lg px-8 py-4"
              >
                Browse Marketplace
              </Link>
              {!user && (
                <Link
                  to="/"
                  className="text-lg font-medium text-gray-600 hover:text-primary transition-colors px-8 py-4"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="py-24 md:py-32">
        <div className="container-max space-y-32 md:space-y-40">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="order-2 md:order-1">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Enterprise Security
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                Purchase and manage credits with enterprise-grade security and complete transaction tracking.
              </p>
            </div>
            <div className="order-1 md:order-2 bg-gray-50 rounded-2xl h-80 md:h-96 flex items-center justify-center">
              <div className="text-6xl">🔒</div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="bg-gray-50 rounded-2xl h-80 md:h-96 flex items-center justify-center">
              <div className="text-6xl">⚡</div>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Instant Access
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                Get immediate access to digital services upon purchase with zero waiting time.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="order-2 md:order-1">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Complete Transparency
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                Track every transaction with detailed ledger history and full audit trail.
              </p>
            </div>
            <div className="order-1 md:order-2 bg-gray-50 rounded-2xl h-80 md:h-96 flex items-center justify-center">
              <div className="text-6xl">📊</div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="bg-gray-50 rounded-2xl h-80 md:h-96 flex items-center justify-center">
              <div className="text-6xl">🎯</div>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Simple Process
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                Choose your credits, complete payment, and start using services immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Compliance Strip */}
      <section className="py-16 bg-gray-50 border-t border-light">
        <div className="container-max">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">Secure payments</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="font-medium">Digital credits</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Transparent ledger</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
