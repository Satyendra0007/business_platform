import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initializeGoogleAnalytics,
  isGoogleAnalyticsEnabled,
  trackPageView as trackGooglePageView,
} from '../lib/googleAnalytics';
import {
  consumeInitialFacebookPageViewFlag,
  initializeFacebookPixel,
  isFacebookPixelEnabled,
  trackFacebookPageView,
} from '../lib/facebookPixel';

export default function MarketingTracker() {
  const location = useLocation();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}`;
    const pageLocation = window.location.href;
    const pageTitle = document.title;

    if (isGoogleAnalyticsEnabled()) {
      initializeGoogleAnalytics();
      trackGooglePageView({
        page_path: pagePath,
        page_location: pageLocation,
        page_title: pageTitle,
      });
    }

    if (isFacebookPixelEnabled()) {
      initializeFacebookPixel();

      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        if (consumeInitialFacebookPageViewFlag()) return;
      }

      trackFacebookPageView();
    }
  }, [location.pathname, location.search]);

  return null;
}
