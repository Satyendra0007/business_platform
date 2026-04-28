const FACEBOOK_PIXEL_ID = '1441253203931124';
const FACEBOOK_PIXEL_SCRIPT_ID = 'facebook-pixel-script';
const FACEBOOK_PIXEL_BOOTSTRAPPED_FLAG = '__tradafyFacebookPixelBootstrapped';
const FACEBOOK_PIXEL_INITIAL_PAGEVIEW_FLAG = '__tradafyFacebookPixelInitialPageViewTracked';

function ensureFbqGlobals() {
  if (typeof window === 'undefined') return null;

  window.fbq =
    window.fbq ||
    function fbq() {
      if (window.fbq.callMethod) {
        window.fbq.callMethod.apply(window.fbq, arguments);
      } else {
        window.fbq.queue.push(arguments);
      }
    };
  if (!window._fbq) window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = window.fbq.queue || [];

  return window;
}

export function isFacebookPixelEnabled() {
  return Boolean(FACEBOOK_PIXEL_ID);
}

export function initializeFacebookPixel() {
  if (typeof window === 'undefined') return false;

  const win = ensureFbqGlobals();
  if (!win) return false;

  if (win[FACEBOOK_PIXEL_BOOTSTRAPPED_FLAG]) return true;

  if (!document.getElementById(FACEBOOK_PIXEL_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = FACEBOOK_PIXEL_SCRIPT_ID;
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  }

  if (!win[FACEBOOK_PIXEL_BOOTSTRAPPED_FLAG]) {
    win[FACEBOOK_PIXEL_BOOTSTRAPPED_FLAG] = true;
    win.fbq('init', FACEBOOK_PIXEL_ID);
  }

  return true;
}

export function markInitialFacebookPageViewTracked() {
  if (typeof window === 'undefined') return false;

  window[FACEBOOK_PIXEL_INITIAL_PAGEVIEW_FLAG] = true;
  return true;
}

export function consumeInitialFacebookPageViewFlag() {
  if (typeof window === 'undefined') return false;

  const shouldSkip = Boolean(window[FACEBOOK_PIXEL_INITIAL_PAGEVIEW_FLAG]);
  window[FACEBOOK_PIXEL_INITIAL_PAGEVIEW_FLAG] = false;
  return shouldSkip;
}

export function trackFacebookPageView() {
  if (typeof window === 'undefined') return false;

  const win = ensureFbqGlobals();
  if (!win) return false;

  win.fbq('track', 'PageView');
  return true;
}
