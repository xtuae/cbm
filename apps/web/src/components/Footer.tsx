import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-light">
      <div className="container-max section-spacing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About / Contact */}
          <div className="space-y-4">
            <div className="text-lg font-semibold text-gray-600">Credits Marketplace</div>
            <div className="text-muted-xs leading-relaxed max-w-sm">
              Secure digital marketplace for credits and digital services.
              Trusted by users worldwide.
            </div>
            <div className="space-y-2">
              <Link to="/about" className="block text-muted-xs hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-muted-xs hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Column 2: Policies */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-600">Policies</div>
            <div className="space-y-2">
              <Link to="/terms" className="block text-muted-xs hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="block text-muted-xs hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refund" className="block text-muted-xs hover:text-primary transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-600">Platform</div>
            <div className="space-y-2">
              <Link to="/marketplace" className="block text-muted-xs hover:text-primary transition-colors">
                Marketplace
              </Link>
              <Link to="/dashboard" className="block text-muted-xs hover:text-primary transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar: copyright */}
        <div className="mt-8 pt-6 border-t border-light">
          <div className="text-center text-muted-xs">
            © {new Date().getFullYear()} Credits Marketplace. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
