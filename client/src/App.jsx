import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/Login';
import DashboardPage from './components/Dashboard';
import ProductsPage from './components/ProductsPage';
import ProductDetailPage from './components/ProductDetailPage';
import RequestQuotePage from './components/RequestQuotePage';
import RFQListPage from './components/RFQListPage';
import DealsPage from './components/DealsPage';
import DealPage from './components/DealPage';
import TransportBidsPage from './components/TransportBidsPage';
import AdminPage from './components/AdminPage';
import NotFound from './components/NotFound';
import RegisterPage from './components/Register';
import { clearCurrentUser, ensureSeedData, getCurrentUser, loginAsRole } from './lib/tradafyData';

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes({ user, onLogin, onLogout, forceRefresh }) {
  const navigateRouter = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const navigate = (path) => navigateRouter(path);
  const handleLogin = (role) => {
    onLogin(role);
    navigate('/dashboard');
  };
  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      onLogout();
    }, 10);
  };

  const ProductDetailRoute = () => {
    const { productId } = useParams();

    return (
      <ProductDetailPage
        currentUser={user}
        navigate={navigate}
        user={user}
        pathname={pathname}
        onLogout={handleLogout}
        productId={productId}
      />
    );
  };

  const RequestQuoteRoute = () => {
    const { productId } = useParams();

    return (
      <ProtectedRoute user={user}>
        <RequestQuotePage
          user={user}
          navigate={navigate}
          pathname={pathname}
          onLogout={handleLogout}
          productId={productId}
          onMutate={forceRefresh}
        />
      </ProtectedRoute>
    );
  };

  const DealRoute = () => {
    const { dealId } = useParams();

    return (
      <ProtectedRoute user={user}>
        <DealPage
          user={user}
          navigate={navigate}
          pathname={pathname}
          onLogout={handleLogout}
          dealId={dealId}
          onMutate={forceRefresh}
        />
      </ProtectedRoute>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage currentUser={user} navigate={navigate} />} />
      <Route path="/login" element={<LoginPage navigate={navigate} onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage navigate={navigate} />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute user={user}>
            <DashboardPage user={user} navigate={navigate} pathname={pathname} onLogout={handleLogout} />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/products"
        element={<ProductsPage currentUser={user} navigate={navigate} user={user} pathname={pathname} onLogout={handleLogout} />}
      />
      <Route path="/product/:productId" element={<ProductDetailRoute />} />
      <Route path="/request-quote/:productId" element={<RequestQuoteRoute />} />
      <Route
        path="/my-rfqs"
        element={(
          <ProtectedRoute user={user}>
            <RFQListPage user={user} navigate={navigate} pathname={pathname} onLogout={handleLogout} incoming={false} onMutate={forceRefresh} />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/incoming-rfqs"
        element={(
          <ProtectedRoute user={user}>
            <RFQListPage user={user} navigate={navigate} pathname={pathname} onLogout={handleLogout} incoming={true} onMutate={forceRefresh} />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/deals"
        element={(
          <ProtectedRoute user={user}>
            <DealsPage user={user} navigate={navigate} pathname={pathname} onLogout={handleLogout} />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/transport-bids"
        element={(
          <ProtectedRoute user={user}>
            <TransportBidsPage user={user} navigate={navigate} pathname={pathname} onLogout={handleLogout} onMutate={forceRefresh} />
          </ProtectedRoute>
        )}
      />
      <Route path="/deal/:dealId" element={<DealRoute />} />
      <Route
        path="/admin"
        element={(
          <ProtectedRoute user={user}>
            <AdminPage user={user} navigate={navigate} pathname={pathname} onLogout={handleLogout} onMutate={forceRefresh} />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<NotFound navigate={navigate} />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [, setRevision] = useState(0);

  useEffect(() => {
    ensureSeedData();
  }, []);

  const forceRefresh = () => {
    setRevision((value) => value + 1);
    setUser(getCurrentUser());
  };

  const onLogout = () => {
    clearCurrentUser();
    setUser(null);
  };

  const onLogin = (role) => {
    const nextUser = loginAsRole(role);
    setUser(nextUser);
  };

  return <AppRoutes user={user} onLogin={onLogin} onLogout={onLogout} forceRefresh={forceRefresh} />;
}

export default App;
