import { useEffect, useState } from "react";

// Typer för cookie-samtycken
export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
}

export type ConsentType = "analytics" | "marketing";

// Utility-funktioner för att hantera cookie-samtycken

/**
 * Hämta cookie-samtycken från localStorage
 * @returns {CookieConsent} Samtycken eller default-värden
 */
export function getCookieConsent(): CookieConsent {
  if (typeof window === "undefined") {
    // Server-side rendering - returnera default-värden
    return { analytics: false, marketing: false };
  }

  try {
    const stored = localStorage.getItem("diavana-consent-preferences");
    if (!stored) {
      return { analytics: false, marketing: false };
    }

    const decoded = decodeURIComponent(stored);
    const parsed = JSON.parse(decoded);

    return {
      analytics: parsed.analytics || false,
      marketing: parsed.marketing || false,
    };
  } catch (error) {
    console.error("Kunde inte läsa cookie-inställningar:", error);
    return { analytics: false, marketing: false };
  }
}

/**
 * Kontrollera om analytics är tillåtet
 * @returns {boolean}
 */
export function hasAnalyticsConsent(): boolean {
  return getCookieConsent().analytics;
}

/**
 * Kontrollera om marketing är tillåtet
 * @returns {boolean}
 */
export function hasMarketingConsent(): boolean {
  return getCookieConsent().marketing;
}

/**
 * Kontrollera om ett specifikt samtycke finns
 * @param {ConsentType} type - 'analytics' eller 'marketing'
 * @returns {boolean}
 */
export function hasConsent(type: ConsentType): boolean {
  const consent = getCookieConsent();
  return consent[type] || false;
}

/**
 * Hook för React-komponenter att lyssna på cookie-ändringar
 * Använd tillsammans med en custom event för att uppdatera när cookies ändras
 */
export function useCookieConsent(): CookieConsent {
  const [consent, setConsent] = useState<CookieConsent>(() =>
    getCookieConsent(),
  );

  useEffect(() => {
    const handleStorageChange = (): void => {
      setConsent(getCookieConsent());
    };

    // Lyssna på localStorage-ändringar
    window.addEventListener("storage", handleStorageChange);

    // Lyssna på custom event för samma tab
    window.addEventListener("cookieConsentChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cookieConsentChanged", handleStorageChange);
    };
  }, []);

  return consent;
}
