import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout';
import AdminLayout from './layouts/AdminLayout';
import Landing from './pages/Landing';
import BrowseMarketplace from './pages/BrowseMarketplace';
import CreditPackDetail from './pages/CreditPackDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import OrdersHistory from './pages/OrdersHistory';
import CreditLedger from './pages/CreditLedger';
import WalletManagement from './pages/WalletManagement';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import CreditPacksManagement from './pages/admin/CreditPacksManagement';
import PagesManagement from './pages/admin/PagesManagement';
import NilaSettlements from './pages/admin/NilaSettlements';
import CreateSettlement from './pages/admin/CreateSettlement';
import AdminActivityLog from './pages/admin/AdminActivityLog';
import AdminLogin from './pages/admin/AdminLogin';
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/auth/RequireAdmin';
import AuthForm from './components/AuthForm';

function AppContent() {
  const { loading } = useAuth();

  // Show loading screen while authentication initializes
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin Login - Separate from all layouts */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Main Layout for public + user pages */}
      <Route path="/" element={<MainLayout />}>
        {/* Landing/Home Page */}
        <Route index element={<Landing />} />

        {/* Marketplace Pages */}
        <Route path="marketplace" element={<BrowseMarketplace />} />
        <Route path="marketplace/:slug" element={<CreditPackDetail />} />

        {/* Protected Commerce Pages - Require Authentication */}
        <Route
          path="cart"
          element={
            <RequireAuth>
              <Cart />
            </RequireAuth>
          }
        />

        <Route
          path="checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />

        <Route
          path="payment/:orderId"
          element={
            <RequireAuth>
              <Payment />
            </RequireAuth>
          }
        />

        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        >
          <Route index element={<div>Dashboard Overview</div>} />
          <Route path="orders" element={<OrdersHistory />} />
          <Route path="ledger" element={<CreditLedger />} />
          <Route path="wallet" element={<WalletManagement />} />
        </Route>

        {/* Authentication Pages */}
        <Route path="login" element={<AuthForm mode="signin" onToggleMode={() => {}} />} />
        <Route path="register" element={<AuthForm mode="signup" onToggleMode={() => {}} />} />

        {/* Static Pages */}
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />

        {/* 404 Page - must be last */}
        <Route path="*" element={<div className="p-8 text-center"><h1 className="text-3xl font-bold text-gray-900">404 - Page Not Found</h1></div>} />
      </Route>

      {/* Admin Layout for all admin routes */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersList />} />
        <Route path="categories" element={<CategoriesManagement />} />
        <Route path="credit-packs" element={<CreditPacksManagement />} />
        <Route path="pages" element={<PagesManagement />} />
        <Route path="settlements" element={<NilaSettlements />} />
        <Route path="settlements/create" element={<CreateSettlement />} />
        <Route path="activity" element={<AdminActivityLog />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
