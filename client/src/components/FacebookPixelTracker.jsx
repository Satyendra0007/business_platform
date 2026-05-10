import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  consumeInitialFacebookPageViewFlag,
  initializeFacebookPixel,
  isFacebookPixelEnabled,
  trackFacebookPageView,
} from '../lib/facebookPixel';

export default function FacebookPixelTracker() {
  const location = useLocation();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!isFacebookPixelEnabled()) return;

    initializeFacebookPixel();

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (consumeInitialFacebookPageViewFlag()) return;
    }

    trackFacebookPageView();
  }, [location.pathname, location.search]);

  return null;
}
