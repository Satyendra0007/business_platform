const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

const GA_SCRIPT_ID = 'google-analytics-script';
const GA_BOOTSTRAPPED_FLAG = '__tradafyGoogleAnalyticsBootstrapped';
const GA_LAST_TRACKED_LOCATION = '__tradafyGoogleAnalyticsLastLocation';

function ensureGtagGlobals() {
  if (typeof window === 'undefined') return null;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  return window;
}

export function isGoogleAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function initializeGoogleAnalytics() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return false;

  const win = ensureGtagGlobals();
  if (!win) return false;

  if (!document.getElementById(GA_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }

  if (!win[GA_BOOTSTRAPPED_FLAG]) {
    win[GA_BOOTSTRAPPED_FLAG] = true;
    win.gtag('js', new Date());
    win.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  }

  return true;
}

export function trackPageView({ page_path, page_location, page_title } = {}) {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return false;

  const win = ensureGtagGlobals();
  if (!win) return false;

  const resolvedLocation = page_location || win.location.href;
  if (win[GA_LAST_TRACKED_LOCATION] === resolvedLocation) return false;
  win[GA_LAST_TRACKED_LOCATION] = resolvedLocation;

  win.gtag('event', 'page_view', {
    page_path: page_path || `${win.location.pathname}${win.location.search}`,
    page_location: resolvedLocation,
    page_title: page_title || document.title,
  });

  return true;
}
