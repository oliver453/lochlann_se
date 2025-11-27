 export interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

// env
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  days: 365,
  path: '/',
  // Ingen domain for localhost, .diavana.se for prod
  domain: isDevelopment ? undefined : '.diavana.se',
  secure: !isDevelopment, // HTTP for dev, HTTPS for prod
  sameSite: 'lax'
};

/**
 * Set a cookie with specified options
 */
export const setCookie = (
  name: string, 
  value: string, 
  options: CookieOptions = {}
): void => {
  if (typeof document === 'undefined') return; // SSR check
  
  const config = { ...DEFAULT_COOKIE_OPTIONS, ...options };
  const expires = new Date();
  expires.setTime(expires.getTime() + ((config.days || 365) * 24 * 60 * 60 * 1000));
  
  let cookieString = `${name}=${value}`;
  cookieString += `; expires=${expires.toUTCString()}`;
  cookieString += `; path=${config.path || '/'}`;
  
  // Bara sätt domain om den finns (för produktion)
  if (config.domain) {
    cookieString += `; domain=${config.domain}`;
  }
  
  if (config.secure) {
    cookieString += '; secure';
  }
  
  cookieString += `; samesite=${config.sameSite || 'lax'}`;
  
  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // SSR check
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (
  name: string, 
  options: Omit<CookieOptions, 'days'> = {}
): void => {
  setCookie(name, '', { ...options, days: -1 });
};

/**
 * Check if cookies are enabled
 */
export const areCookiesEnabled = (): boolean => {
  if (typeof document === 'undefined') return false; // SSR check
  
  try {
    const testCookie = '__cookie_test__';
    setCookie(testCookie, 'test', { days: 1 });
    const enabled = getCookie(testCookie) === 'test';
    deleteCookie(testCookie);
    return enabled;
  } catch {
    return false;
  }
};

/**
 * Get all cookies as an object
 */
export const getAllCookies = (): Record<string, string> => {
  if (typeof document === 'undefined') return {}; // SSR check
  
  const cookies: Record<string, string> = {};
  
  if (document.cookie && document.cookie !== '') {
    const split = document.cookie.split(';');
    for (let i = 0; i < split.length; i++) {
      const nameValue = split[i].split('=');
      const name = nameValue[0]?.trim();
      const value = nameValue[1]?.trim() || '';
      if (name) {
        cookies[name] = decodeURIComponent(value);
      }
    }
  }
  
  return cookies;
};

// Specific functions for consent management
export const CONSENT_COOKIE_NAME = 'diavana-consent-preferences';

export const setConsentPreferences = (preferences: {
  analytics: boolean;
  marketing: boolean;
}): void => {
  const encoded = encodeURIComponent(JSON.stringify(preferences));
  setCookie(CONSENT_COOKIE_NAME, encoded);
};

export const getConsentPreferences = (): {
  analytics: boolean;
  marketing: boolean;
} | null => {
  const cookieValue = getCookie(CONSENT_COOKIE_NAME);
  if (!cookieValue) return null;
  
  try {
    const decoded = decodeURIComponent(cookieValue);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Kunde inte läsa cookie-inställningar:', error);
    return null;
  }
};

export const clearConsentPreferences = (): void => {
  deleteCookie(CONSENT_COOKIE_NAME);
};