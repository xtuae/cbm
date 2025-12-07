import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { Card, Button } from '../components/ui';

const CheckoutFailed = () => {
  const breadcrumbItems = [
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', href: '/checkout' },
    { label: 'Payment Failed', current: true }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-max py-16">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Failed</h1>
            <p className="text-xl text-gray-600 mb-8">
              We couldn't process your payment. No charges were made to your account.
            </p>
          </div>

          <Card className="mb-8">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Try Again</h3>
                <p className="text-sm text-gray-600">
                  The issue may be temporary. We recommend trying your payment again in a few minutes.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Common Issues:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Insufficient funds or card declined</li>
                  <li>• Incorrect payment information</li>
                  <li>• Network connectivity issues</li>
                  <li>• Bank security blocks</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Link to="/checkout">
              <Button className="w-full sm:w-auto mr-0 sm:mr-4">
                Try Payment Again
              </Button>
            </Link>

            <div className="text-center">
              <Link
                to="/marketplace"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Continue Browsing Products →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailed;
