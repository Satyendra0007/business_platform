import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// ─── Page imports ─────────────────────────────────────────────────────────────
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './components/Dashboard';
import CompanySetupPage from './pages/CompanySetupPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';

import RequestQuotePage from './components/RequestQuotePage';
import RFQListPage from './components/RFQListPage';
import EditRFQPage from './pages/EditRFQPage';
import DealsPage from './components/DealsPage';
import DealPage from './components/DealPage';
import EditDealPage from './pages/EditDealPage';
import TransportBidsPage from './components/TransportBidsPage';
import AdminPage from './components/AdminPage';
import MyProductsPage from './pages/MyProductsPage';
import CreateProductPage from './pages/CreateProductPage';
import EditProductPage from './pages/EditProductPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import EditCompanyPage from './pages/EditCompanyPage';
import DealSupportPage from './components/DealSupportPage';
import NotFound from './pages/NotFound';



// ─── Route guards ─────────────────────────────────────────────────────────────

/** Redirects to /login when there is no active session. */
function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Redirects non-admin users to /dashboard. */
function RequireAdmin() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.roles?.includes('admin')) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Redirects non-supplier users to /dashboard. */
function RequireSupplier() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.roles?.includes('supplier')) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/**
 * Redirects already-authenticated users away from public-only pages
 * (login, register). Prevents the stale-session redirect bug where a
 * logged-in user visiting /login sees the error flash then gets pushed
 * to /dashboard by the existing session.
 */
function RedirectIfAuth() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// ─── App — pure route config, no state, no handlers ──────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<LandingPage />} />
      {/* ── Public (unauthenticated only) ── */}
      <Route element={<RedirectIfAuth />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:productId" element={<ProductDetailPage />} />

      {/* ── Authenticated ── */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard"              element={<DashboardPage />} />
        <Route path="/company/setup"           element={<CompanySetupPage />} />
        <Route path="/company/:id"             element={<CompanyDetailPage />} />
        <Route path="/company/:id/edit"        element={<EditCompanyPage />} />
        <Route path="/my-rfqs"                 element={<RFQListPage incoming={false} />} />
        <Route path="/incoming-rfqs"           element={<RFQListPage incoming={true} />} />
        <Route path="/rfq/:rfqId/edit"         element={<EditRFQPage />} />
        <Route path="/deals"                   element={<DealsPage />} />
        <Route path="/deal/:dealId"            element={<DealPage />} />
        <Route path="/deal/:dealId/edit"       element={<EditDealPage />} />
        <Route path="/transport-bids"          element={<TransportBidsPage />} />
        <Route path="/deal-support"            element={<DealSupportPage />} />
        <Route path="/request-quote/:productId" element={<RequestQuotePage />} />
      </Route>

      {/* ── Admin only ── */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* ── Supplier only ── */}
      <Route element={<RequireSupplier />}>
        <Route path="/supplier/products" element={<MyProductsPage />} />
        <Route path="/supplier/products/create" element={<CreateProductPage />} />
        <Route path="/supplier/products/edit/:productId" element={<EditProductPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
