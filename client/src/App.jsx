import React, { useEffect, useMemo, useState } from 'react';
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
import { privatePaths } from './lib/navConstants';
import RegisterPage from './components/Register';
import { clearCurrentUser, ensureSeedData, getCurrentUser, loginAsRole } from './lib/tradafyData';

function getHashPath() {
  const raw = window.location.hash.replace(/^#/, '');
  return raw || '/';
}

function navigateTo(path) {
  window.location.hash = path;
}

function App() {
  const [pathname, setPathname] = useState(getHashPath());
  const [user, setUser] = useState(() => getCurrentUser());
  const [, setRevision] = useState(0);

  useEffect(() => {
    ensureSeedData();
    if (!window.location.hash) {
      window.location.hash = '/';
    }

    const onHashChange = () => {
      setPathname(getHashPath());
      setUser(getCurrentUser());
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const forceRefresh = () => {
    setRevision((value) => value + 1);
    setUser(getCurrentUser());
  };

  const navigate = (path) => navigateTo(path);
  const onLogout = () => {
    clearCurrentUser();
    setUser(null);
    navigate('/');
  };
  const onLogin = (role) => {
    const nextUser = loginAsRole(role);
    setUser(nextUser);
    navigate('/dashboard');
  };

  const segments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);
  const requiresAuth = privatePaths.some((path) => pathname.startsWith(path));

  if (!user && requiresAuth) return <LoginPage navigate={navigate} onLogin={onLogin} />;
  if (pathname === '/') return <LandingPage currentUser={user} navigate={navigate} />;
  if (pathname === '/login') return <LoginPage navigate={navigate} onLogin={onLogin} />;
  if (pathname === '/register') return <RegisterPage navigate={navigate} />;
  if (pathname === '/dashboard') return <DashboardPage user={user} navigate={navigate} pathname={pathname} onLogout={onLogout} />;
  if (pathname === '/products') return <ProductsPage currentUser={user} navigate={navigate} user={user} pathname={pathname} onLogout={onLogout} />;
  if (segments[0] === 'product' && segments[1]) return <ProductDetailPage currentUser={user} navigate={navigate} user={user} pathname={pathname} onLogout={onLogout} productId={segments[1]} />;
  if (segments[0] === 'request-quote' && segments[1] && user) return <RequestQuotePage user={user} navigate={navigate} pathname={pathname} onLogout={onLogout} productId={segments[1]} onMutate={forceRefresh} />;
  if (pathname === '/my-rfqs' && user) return <RFQListPage user={user} navigate={navigate} pathname={pathname} onLogout={onLogout} incoming={false} onMutate={forceRefresh} />;
  if (pathname === '/incoming-rfqs' && user) return <RFQListPage user={user} navigate={navigate} pathname={pathname} onLogout={onLogout} incoming={true} onMutate={forceRefresh} />;
  if (pathname === '/deals' && user) return <DealsPage user={user} navigate={navigate} pathname={pathname} onLogout={onLogout} />;
  if (pathname === '/transport-bids' && user) return <TransportBidsPage user={user} navigate={navigate} pathname={pathname} onLogout={onLogout} onMutate={forceRefresh} />;
  if (segments[0] === 'deal' && segments[1] && user) return <DealPage user={user} navigate={navigate} pathname={pathname} onLogout={onLogout} dealId={segments[1]} onMutate={forceRefresh} />;
  if (pathname === '/admin' && user) return <AdminPage user={user} navigate={navigate} pathname={pathname} onLogout={onLogout} onMutate={forceRefresh} />;
  if (segments[0] === 'product' && segments[1]) return <NotFound navigate={navigate} />;
  return <NotFound navigate={navigate} />;
}

export default App;
