import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initializeGoogleAnalytics,
  isGoogleAnalyticsEnabled,
  trackPageView,
} from '../lib/googleAnalytics';

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!isGoogleAnalyticsEnabled()) return;

    initializeGoogleAnalytics();
    trackPageView({
      page_path: `${location.pathname}${location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
