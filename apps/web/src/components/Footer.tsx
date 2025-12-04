const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="text-lg font-semibold text-gray-light-600">Credits Marketplace</div>
            <div className="text-sm text-gray-light-500 leading-relaxed max-w-md">
              Secure digital marketplace for credits and digital services.
              Trusted by thousands of users worldwide.
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-light-600">About</div>
            <div className="space-y-3">
              <a href="/about" className="block text-sm text-gray-light-500 hover:text-primary transition-colors">About Us</a>
              <a href="/contact" className="block text-sm text-gray-light-500 hover:text-primary transition-colors">Contact</a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-light-600">Support</div>
            <div className="space-y-3">
              <a href="/marketplace" className="block text-sm text-gray-light-500 hover:text-primary transition-colors">Marketplace</a>
              <a href="/cart" className="block text-sm text-gray-light-500 hover:text-primary transition-colors">Cart</a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-light-600">Legal</div>
            <div className="space-y-3">
              <a href="/terms" className="block text-sm text-gray-light-500 hover:text-primary transition-colors">Terms</a>
              <a href="/privacy" className="block text-sm text-gray-light-500 hover:text-primary transition-colors">Privacy</a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-light-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-light-500">
              © {new Date().getFullYear()} Credits Marketplace. All rights reserved.
            </div>
            <div className="text-sm text-gray-light-500">
              Secure payments powered by Stripe
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
