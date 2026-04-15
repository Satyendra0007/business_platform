import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// ─── Page imports ─────────────────────────────────────────────────────────────
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './components/Dashboard';
import CompanySetupPage from './components/CompanySetupPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './components/ProductDetailPage';
import RequestQuotePage from './components/RequestQuotePage';
import RFQListPage from './components/RFQListPage';
import DealsPage from './components/DealsPage';
import DealPage from './components/DealPage';
import TransportBidsPage from './components/TransportBidsPage';
import AdminPage from './components/AdminPage';
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

// ─── App — pure route config, no state, no handlers ──────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:productId" element={<ProductDetailPage />} />

      {/* ── Authenticated ── */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/company/setup" element={<CompanySetupPage />} />
        <Route path="/my-rfqs" element={<RFQListPage incoming={false} />} />
        <Route path="/incoming-rfqs" element={<RFQListPage incoming={true} />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deal/:dealId" element={<DealPage />} />
        <Route path="/transport-bids" element={<TransportBidsPage />} />
        <Route path="/request-quote/:productId" element={<RequestQuotePage />} />
      </Route>

      {/* ── Admin only ── */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
