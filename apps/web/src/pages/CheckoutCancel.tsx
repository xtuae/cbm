import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { Card, Button } from '../components/ui';

const CheckoutCancel = () => {
  const breadcrumbItems = [
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', href: '/checkout' },
    { label: 'Payment Cancelled', current: true }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container-max py-16">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your payment was cancelled. Your cart is still saved.
            </p>
          </div>

          <Card className="mb-8">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                It's safe to close this window. You haven't been charged, and your cart items are preserved for when you're ready to complete your purchase.
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            <Link to="/checkout">
              <Button className="w-full sm:w-auto mr-0 sm:mr-4">
                Try Again
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

export default CheckoutCancel;
