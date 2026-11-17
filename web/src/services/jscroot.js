/**
 * JSCroot (CRootJS) Official Micro-Framework Integration
 * Developed by Rolly Maulana Awangga, S.T., M.T., CAIP.
 *
 * Provides ES Module imports for:
 * - jscroot/api: getJSON, postJSON, get, post
 * - jscroot/cookie: getCookie, setCookieWithExpireDay, deleteCookie
 * - jscroot/element: setInner, onClick, getValue, setValue
 * - jscroot/url: getHash, setHash, getUrl
 */

// Fallback in-memory/document cookie implementation if offline
const fallbackCookie = {
  getCookie: (name) => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
  },
  setCookieWithExpireDay: (name, value, days = 7) => {
    if (typeof document === 'undefined') return;
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  },
  deleteCookie: (name) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
  }
};

/**
 * Dynamically loads and returns JSCroot modules from CDN
 */
export async function getJSCroot() {
  if (typeof window === 'undefined') return fallbackCookie;
  if (window.jscroot && window.jscroot.getCookie) return window.jscroot;

  try {
    const [api, cookie, element, url] = await Promise.all([
      import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/gh/jscroot/api@0.0.7/croot.js').catch(() => ({})),
      import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/gh/jscroot/cookie@0.0.1/croot.js').catch(() => ({})),
      import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/gh/jscroot/element@0.1.5/croot.js').catch(() => ({})),
      import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/gh/jscroot/url@0.0.9/croot.js').catch(() => ({}))
    ]);

    window.jscroot = {
      ...fallbackCookie,
      ...api,
      ...cookie,
      ...element,
      ...url,
      api,
      cookie,
      element,
      url
    };

    console.info('🚀 [JSCroot] Loaded from jsDelivr CDN successfully:', window.jscroot);
    return window.jscroot;
  } catch (e) {
    console.warn('⚠️ [JSCroot] CDN loading failed, using fallback:', e);
    window.jscroot = { ...fallbackCookie };
    return window.jscroot;
  }
}

/**
 * Cookie Helpers using JSCroot
 */
export function setAuthCookie(token, days = 7) {
  if (typeof window !== 'undefined' && window.jscroot?.setCookieWithExpireDay) {
    window.jscroot.setCookieWithExpireDay('noteroute_auth_token', token, days);
  } else {
    fallbackCookie.setCookieWithExpireDay('noteroute_auth_token', token, days);
  }
}

export function getAuthCookie() {
  if (typeof window !== 'undefined' && window.jscroot?.getCookie) {
    return window.jscroot.getCookie('noteroute_auth_token') || '';
  }
  return fallbackCookie.getCookie('noteroute_auth_token');
}

export function removeAuthCookie() {
  if (typeof window !== 'undefined' && window.jscroot?.deleteCookie) {
    window.jscroot.deleteCookie('noteroute_auth_token');
  } else {
    fallbackCookie.deleteCookie('noteroute_auth_token');
  }
}

/**
 * API Helper using JSCroot getJSON / postJSON
 */
export function jscrootGet(url, tokenKey = 'Authorization', tokenValue = '', callback) {
  if (typeof window !== 'undefined' && window.jscroot?.getJSON) {
    window.jscroot.getJSON(url, tokenKey, tokenValue, callback);
    return;
  }
  // Fallback via standard fetch
  fetch(url, {
    headers: tokenValue ? { [tokenKey]: tokenValue } : {}
  })
    .then((r) => r.json())
    .then((data) => callback({ status: 200, data }))
    .catch((err) => callback({ status: 500, error: err.message }));
}
